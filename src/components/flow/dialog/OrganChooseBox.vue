<template>
  <a-modal v-if="isOpened" v-model:visible="isOpened" @ok="onOkClicked()" @cancel="onCancelClicked()" titleAlign="start" :width="890">
    <template #title> 请选择组织成员 </template>
    <div class="organ-content-wrap">
      <div class="visibility-picker-left">
        <a-tabs position="top" @change="onTabChange" :activeKey="type">
          <a-tab-pane v-for="organ in organTypes" :key="organ.code" :title="organ.desc"> </a-tab-pane>
        </a-tabs>
        <a-input long v-model:model-value="keyword" placeholder="输入名称" allow-clear :max-length="16">
          <template #prefix><icon-search :size="18" /></template>
        </a-input>
        <div class="picker-type-content">
          <template v-if="type == ORGANS.DEPT.code">
            <a-checkbox v-for="i in filteredItem(depts)" :value="i.id" :model-value="i.checked" @change="onItemChoosed($event, i, type)">
              {{ i.name }}
            </a-checkbox>
          </template>
          <template v-else-if="type == ORGANS.ROLE.code">
            <a-checkbox v-for="i in filteredItem(roles)" :value="i.id" :model-value="i.checked" @change="onItemChoosed($event, i, type)">
              {{ i.name }}
            </a-checkbox>
          </template>
          <template v-else-if="type == ORGANS.USER.code">
            <a-checkbox v-for="i in filteredItem(users)" :value="i.id" :model-value="i.checked" @change="onItemChoosed($event, i, type)">
              {{ i.name }}
            </a-checkbox>
          </template>
        </div>
      </div>
      <div class="visibility-picker-right">
        <div class="choosed-items-box">
          <div class="item-select" v-for="item in selected0">
            <div class="text">{{ getNameById(item) }}</div>
            <div class="deleted">
              <a-link @click="onItemRemoved(item)">
                <template #icon> <icon-close :size="12" /> </template>
              </a-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, onBeforeMount, ref, watch } from "vue";
import { useOrganStore } from "@/stores";
import ObjectUtil from "../common/ObjectUtil";
import ArrayUtil from "../common/ArrayUtil";
import { IconSearch, IconClose } from "@arco-design/web-vue/es/icon";

let props = defineProps({
  visible: { type: Boolean, default: false },
  hiddenDept: { type: Boolean, default: false },
  hiddenRole: { type: Boolean, default: false },
  hiddenUser: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },
  onlyId: { type: Boolean, default: true }, // 选择的值是否是id数组，如果不是则为{id:xx,type:xx}的对象
});
let emits = defineEmits(["update:visible", "update:selected"]);

const ORGANS = {
  DEPT: { code: 0, desc: "部门" },
  ROLE: { code: 1, desc: "角色" },
  USER: { code: 2, desc: "用户" },
};

const { getDepts, getRoles, getUsers } = useOrganStore();
let depts = ref([]);
let roles = ref([]);
let users = ref([]);
let all = ref([]); // 所有的组织，不区分类型

let keyword = ref(""); // 搜索
let selected0 = ref([]); // 组件的选中的选项
let type = ref(0); // 选择的标签，部门，角色还是用户
let organTypes = computed(() => {
  let tmpOrgans = [];
  if (!props.hiddenDept) tmpOrgans.push(ORGANS.DEPT);
  if (!props.hiddenRole) tmpOrgans.push(ORGANS.ROLE);
  if (!props.hiddenUser) tmpOrgans.push(ORGANS.USER);
  return tmpOrgans;
});

let isOpened = computed({
  get: () => props.visible,
  set: (val) => emits("update:visible", val),
});

// 对话框展示时，初始化数据
const initSelected = () => {
  // 全部值
  all.value = [];

  // 复制选择的值
  selected0.value = ObjectUtil.copy(props.selected);
  console.log("选中的值：", selected0.value);

  // 所有选择的id
  let ids = [];
  if (props.onlyId) {
    ids = selected0.value;
  } else {
    ids = selected0.value.map((i) => i.id);
  }

  // 设置左侧选中
  if (!props.hiddenDept) {
    depts.value = getDepts();
    all.value.push(...depts.value);
    depts.value.forEach((i) => (i.checked = ids.includes(i.id)));
  }
  if (!props.hiddenRole) {
    roles.value = getRoles();
    all.value.push(...roles.value);
    roles.value.forEach((i) => (i.checked = ids.includes(i.id)));
  }
  if (!props.hiddenUser) {
    users.value = getUsers();
    all.value.push(...users.value);
    users.value.forEach((i) => (i.checked = ids.includes(i.id)));
  }
};

// 监听打开事件
watch(
  () => props.visible,
  (nv) => {
    if (nv) {
      initSelected(); // 初始化选项
      type.value = organTypes.value[0].code;
    }
  },
  { deep: true, immediate: true }
);

// 关键字检索
const filteredItem = (items) => (items || []).filter((item) => item.name.includes(keyword.value));

// 切换tab页
const onTabChange = (val) => (type.value = val);

// 根据选择的值获取组织名称
const getNameById = (item) => {
  if (props.onlyId) {
    return ArrayUtil.get(all.value, "id", item).name || "未知用户";
  } else {
    return ArrayUtil.get(all.value, "id", item.id).name || "未知用户";
  }
};

// 选中
const onItemChoosed = (checked, item, type) => {
  item.checked = checked;
  if (props.onlyId) {
    if (checked) {
      selected0.value.push(item.id);
    } else {
      selected0.value = selected0.value.filter((i) => i != item.id);
    }
  } else {
    if (checked) {
      selected0.value.push({ id: item.id, type: type });
    } else {
      selected0.value = selected0.value.filter((i) => i.id != item.id);
    }
  }
};

// 删除选中
const onItemRemoved = (item) => {
  let id = props.onlyId ? item : item.id;

  if (props.onlyId) {
    selected0.value = selected0.value.filter((i) => i != id);
  } else {
    selected0.value = selected0.value.filter((i) => i.id != id);
  }

  if (!props.hiddenDept) {
    depts.value.forEach((i) => {
      if (i.id == id) i.checked = false;
    });
  }
  if (!props.hiddenRole) {
    roles.value.forEach((i) => {
      if (i.id == id) i.checked = false;
    });
  }
  if (!props.hiddenUser) {
    users.value.forEach((i) => {
      if (i.id == id) i.checked = false;
    });
  }
};

// 控制弹窗
const onOkClicked = () => {
  isOpened.value = false;
  emits("update:selected", selected0.value);
};

const onCancelClicked = () => {
  isOpened.value = false;
};

onBeforeMount(() => {});
</script>

<style lang="less">
.organ-content-wrap {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 440px;
  border: 1px solid #e4e5e7;
  border-radius: 4px;

  .visibility-picker-left,
  .visibility-picker-right {
    flex: 1;
  }

  .visibility-picker-left {
    padding: 8px 16px 0;
    overflow: hidden;
    border-right: 1px solid #e4e5e7;

    .picker-type-content {
      margin-top: 10px;
      height: calc(100% - 110px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;

      .arco-checkbox {
        min-height: 28px;
      }
    }
  }

  .visibility-picker-right {
    overflow-y: auto;
    padding: 10px;

    .item-select {
      display: flex;
      flex-direction: row;
      justify-content: center;
      height: 32px;
      align-items: center;
      padding: 0 8px 0 16px;
      user-select: none;
      border-radius: 4px;

      &:hover {
        background-color: #f7f9fc;
      }

      .text {
        flex: 1;
      }

      .deleted {
        .arco-link-icon {
          color: #8f959e;
          margin-right: 0;
        }
      }
    }
  }

  .arco-tabs-nav-type-line .arco-tabs-tab {
    margin: 0;
    margin-right: 24px;
    margin-left: 8px;
  }
}
</style>

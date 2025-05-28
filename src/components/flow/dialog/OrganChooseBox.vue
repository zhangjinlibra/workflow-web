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
            <!-- <a-checkbox v-for="i in filteredItem(depts)" :value="i.id" :model-value="i.checked" @change="onItemChoosed($event, i, type)">
              {{ i.name }}
            </a-checkbox> -->
            <a-tree
              size="small"
              :default-checked-keys="deptCheckedKeys"
              :checked-keys="deptCheckedKeys"
              :selectable="false"
              :check-strictly="true"
              :field-names="deptTreefieldNames"
              :data="filteredItem(deptTreeData)"
              :show-line="true"
              :checkable="true"
              :multiple="true"
              checked-strategy="all"
              @check="(checkedKeys, data) => onTreeNodeChecked(checkedKeys, data, type)">
              <template #switcher-icon="node, { isLeaf, expanded }">
                <template v-if="!isLeaf">
                  <span v-if="expanded" class="arco-tree-node-minus-icon" />
                  <span v-else class="arco-tree-node-plus-icon" />
                </template>
                <IconRight v-if="isLeaf" class="tree-leaf" />
              </template>
            </a-tree>
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
import { useOrganStore } from "@/stores";
import { IconClose, IconRight, IconSearch } from "@arco-design/web-vue/es/icon";
import { computed, onBeforeMount, ref, watch } from "vue";
import ArrayUtil from "../common/ArrayUtil";
import ObjectUtil from "../common/ObjectUtil";

let props = defineProps({
  visible: { type: Boolean, default: false },
  hiddenDept: { type: Boolean, default: false },
  hiddenRole: { type: Boolean, default: false },
  hiddenUser: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },
  onlyId: { type: Boolean, default: true }, // 选择的值是否是id数组，如果不是则为{id:xx,type:xx}的对象
});
let emits = defineEmits(["update:visible", "update:selected", "ok"]);

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
let type = ref(ORGANS.DEPT.code); // 选择的标签，部门，角色还是用户
let organTypes = computed(() => {
  let tmpOrgans = [];
  if (!props.hiddenDept) tmpOrgans.push(ORGANS.DEPT);
  if (!props.hiddenRole) tmpOrgans.push(ORGANS.ROLE);
  if (!props.hiddenUser) tmpOrgans.push(ORGANS.USER);
  return tmpOrgans;
});
// 部门树形数据
const deptTreeData = ref([]); // 部门树形数据
const deptCheckedKeys = ref([]); // 选择的部门Key
const deptIds = ref([]); // 选中的部门ids
const deptTreefieldNames = ref({ key: "id", title: "name" }); // 部门树形数据的字段名

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
    deptTreeData.value = convertToTree(depts.value);
    all.value.push(...depts.value);
    depts.value.forEach((i) => (i.checked = ids.includes(i.id)));
    deptCheckedKeys.value = deptIds.value.filter((i) => ids.includes(i));
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
const filteredItem = (items) => {
  if (!keyword.value || !items) {
    return items;
  } else {
    if (type.value == ORGANS.DEPT.code) {
      return searchTreeData(keyword.value, items);
    } else {
      return items.filter((item) => item.name.includes(keyword.value));
    }
  }
};

// 检索树
function searchTreeData(keyword, treeData) {
  const loop = (data) => {
    const result = [];
    data.forEach((item) => {
      if (item.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
        result.push({ ...item });
      } else if (item.children) {
        const filterData = loop(item.children);
        if (filterData.length) {
          result.push({ ...item, children: filterData });
        }
      }
    });
    return result;
  };
  return loop(treeData);
}

// 树选中
const onTreeNodeChecked = (checkedKeys, data, type) => {
  deptCheckedKeys.value = checkedKeys; // 设置默认选中值
  let needDeleteIds = deptIds.value.filter((i) => !checkedKeys.includes(i)); // 需要删除的ID
  if (props.onlyId) {
    let needAddIds = checkedKeys.filter((i) => !selected0.value.includes(i)); // 需要添加的ID
    selected0.value = selected0.value.filter((i) => !needDeleteIds.includes(i));
    needAddIds.forEach((id) => selected0.value.push(id));
  } else {
    let existIds = selected0.value.map((i) => i.id); // 已经存在的ID
    let needAddIds = checkedKeys.filter((i) => !existIds.includes(i)); // 需要添加的ID
    // 剔除已经删除的ID
    selected0.value = selected0.value.filter((i) => !needDeleteIds.includes(i.id));
    // 追加选中
    needAddIds.forEach((id) => selected0.value.push({ id, type }));
  }
};

// 将数组转换成树形结构
const convertToTree = (data) => {
  let map = {};
  let tree = [];
  let ids = [];
  data.forEach((item) => {
    map[item.id] = item;
    item.children = [];
    ids.push(item.id);
  });
  data.forEach((item) => {
    if (item.pid && map[item.pid]) {
      map[item.pid].children.push(item);
    } else {
      tree.push(item);
    }
  });
  deptIds.value = ids;
  return tree;
};

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
  deptCheckedKeys.value = deptCheckedKeys.value.filter((i) => i != id);

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
  emits("ok", selected0.value);
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

      .arco-tree-node-title {
        color: var(--color-text-1) !important;
      }

      .tree-leaf {
        color: var(--color-neutral-3);
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

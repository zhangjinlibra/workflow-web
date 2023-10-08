<template>
  <section class="fd-base-box">
    <div class="base-setting-panel">
      <a-form ref="formRef" v-if="flowDef" :rules="rules" :model="flowDef" layout="vertical" :style="{ width: '600px' }">
        <a-form-item field="icon" label="图标" required>
          <div class="icon-select-box">
            <flow-icon :icon="flowDef.icon" />
            <!-- <img :src="ICON_BASE_URL + flowDef.icon" /> -->
            <a-popover :show-arrow="false" trigger="click" position="rt" animation-name="slide-fade" content-class="palette-select-box">
              <a-link>修改</a-link>
              <template #content>
                <div class="palette-tab">
                  <a-radio-group type="button" :default-value="0" size="large">
                    <a-radio :value="0">选择流程图标</a-radio>
                  </a-radio-group>
                </div>
                <div class="palette-main">
                  <!-- <a-card class="fonts-box" hoverable>
                    <span v-for="font in fonts">
                      <span class="flowiconfont" v-html="font" @click="handleFontClick(font)"></span>
                    </span>
                  </a-card>
                  <Sketch v-model="colors" /> -->
                  <div class="icon-item" v-for="icon in icons" @click="onIconChoosed(icon)">
                    <flow-icon :icon="icon" />
                  </div>
                </div>
              </template>
            </a-popover>
          </div>
        </a-form-item>
        <a-form-item field="name" label="名称" required>
          <a-input v-model="flowDef.name" :max-length="16" />
        </a-form-item>
        <a-form-item field="remark" label="说明">
          <a-textarea v-model="flowDef.remark" :max-length="64" />
        </a-form-item>
        <a-form-item field="groupId" label="分组" required>
          <div class="group-box">
            <a-select class="group-select" v-model="flowDef.groupId" placeholder="选择流程分组" allow-search>
              <a-option v-for="group in groups" :value="group.id" :label="group.name"></a-option>
            </a-select>
            <a-button class="new-group-btn" type="primary" @click="handleOpenAddGroup()">
              新增分组
              <template #icon>
                <icon-plus />
              </template>
            </a-button>
          </div>
        </a-form-item>
        <a-form-item field="flowAdminIds" label="流程管理员" required>
          <div class="flow-admin-box">
            <a-tag size="large" v-for="item in flowDef.flowAdminIds">{{ getUserById(item).name }}</a-tag>
          </div>
          <a-button @click="handleOpenChooseOrgan()">
            <template #icon>
              <icon-plus />
            </template>
          </a-button>
        </a-form-item>
        <a-form-item> <div style="clear: both"></div></a-form-item>
      </a-form>
    </div>

    <flow-group-edit ref="groupModel" v-model:group="group" @ok="onSaveGroupCallback($event)"></flow-group-edit>
    <OrganChooseBox
      v-if="showChooseOrgan"
      v-model:visible="showChooseOrgan"
      v-model:selected="flowDef.flowAdminIds"
      :hidden-dept="true"
      :hidden-role="true" />
  </section>
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from "vue";
import { useFlowStore, useOrganStore } from "@/stores/index";
import OrganChooseBox from "@/components/flow/dialog/OrganChooseBox.vue";
import FlowIcon from "@/components/icons/FlowIcon.vue";
import FlowGroupEdit from "./flow-gorup-edit.vue";
import IconApi from "@/api/IconApi";
import { IconPlus } from "@arco-design/web-vue/es/icon";
// import { Icon } from "@arco-design/web-vue";
// import FlowManApi from "@/api/FlowManApi";
// import { Sketch } from "@ckpack/vue-color";

let { flowDefinition, flowGroups } = useFlowStore();
let { getUserById } = useOrganStore();

let groups = ref([]);
const loadGroups = () => {
  // FlowManApi.listGroups().then((resp) => {
  //   if (resp.code == 1) {
  //     groups.value = resp.data || [];
  //   }
  // });
  groups.value = flowGroups;
};

let icons = ref([]);
const loadIcons = () => {
  IconApi.listSvgIcons().then((resp) => {
    icons.value = resp.data || [];
  });
};

const onIconChoosed = (name) => {
  flowDef.value.icon = name;
};

// 当前的流程定义
let flowDef = ref({});
let rules = ref({
  icon: { required: true, message: "请选择流程图标", minLength: 1 },
  name: { required: true, message: "请添加流程名称", minLength: 1 },
  groupId: { required: true, message: "请选择流程分组", minLength: 1 },
  flowAdminIds: { required: true, type: "array", message: "请选择流程管理员", minLength: 1 },
});
let formRef = ref();
const validate = async () => {
  await formRef.value.validate((err) => {
    if (err) return;
  });
};

// 新增分组
let group = ref({});
let groupModel = ref();
const handleOpenAddGroup = () => groupModel.value.show();
const onSaveGroupCallback = (data) => {
  groups.value.push(data);
  flowDef.value.groupId = data.id; // 选择新添加的分组
};

// 流程管理员
let showChooseOrgan = ref(false);
const handleOpenChooseOrgan = () => (showChooseOrgan.value = true);

onMounted(() => {
  flowDef.value = flowDefinition.workFlowDef;
});

onBeforeMount(() => {
  loadGroups();
  loadIcons();
});

defineExpose({
  validate,
});
</script>

<style lang="less">
.palette-select-box {
  .palette-tab {
    width: 100%;
    margin-bottom: 10px;

    .arco-radio-group-button {
      width: 100%;

      .arco-radio-button {
        flex: 1;
        text-align: center;
      }
    }
  }

  .palette-main {
    @FlowIconSize: 60px;

    display: grid;
    grid-template-columns: repeat(5, @FlowIconSize);
    grid-gap: 8px;

    .icon-item {
      border: 1px solid #d0d3d6;
      border-radius: 6px;
      cursor: pointer;
      width: @FlowIconSize;
      height: @FlowIconSize;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        overflow: hidden;
      }

      &:hover {
        border-color: #3370ff;
      }
    }
  }

  .fonts-box {
    width: 200px;
    margin-right: 10px;
    border-radius: 4px;
  }

  .flowiconfont {
    margin: 4px;
    cursor: pointer;
    font-size: 24px;

    &:hover {
      border-radius: 4px;
      opacity: 0.8;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.15);
    }
  }
}

.new-group-box {
  .arco-modal-body {
    padding-right: 40px;
  }
}
</style>

<style lang="less" scoped>
.fd-base-box {
  padding: 20px 0 10px;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  height: 100%;

  .base-setting-panel {
    background-color: #fff;
    width: 600px;
    border-radius: var(--border-radius-large);
    display: flex;
    justify-content: center;
    padding: 24px 40px 0;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;

    .group-box {
      display: flex;
      align-items: center;
      width: 100%;

      .group-select {
        flex: 1;
      }

      .new-group-btn {
        margin-left: 10px;
      }
    }

    .flow-admin-box {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-right: 4px;
    }

    .arco-btn {
      min-width: 32px;
    }
  }

  .icon-select-box {
    display: flex;
    flex-direction: row;
    align-items: center;

    .arco-link {
      margin-left: 10px;
    }
  }
}
</style>

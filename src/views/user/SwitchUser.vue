<template>
  <div v-if="visible" class="change-user-container">
    <a-modal
      :visible="visible"
      :width="400"
      @ok="handleOk"
      @cancel="handleCancel"
      draggable
      modal-class="switch-user-modal"
      popup-container=".change-user-container">
      <template #title> <div style="color: #c56969">双击切换用户</div> </template>
      <a-input v-model:model-value="keyword" allow-clear long placeholder="输入名称检索">
        <template #prefix><icon-search /></template>
      </a-input>
      <div class="user-list">
        <a-tree
          v-model:selected-keys="selectedUser"
          :data="filterUsers"
          :fieldNames="fieldNames"
          :default-expand-all="true"
          :blockNode="true"
          :multiple="false"
          :check-strictly="true">
          <template #title="node, { isLeaf }">
            <div v-if="node.type == 4" @dblclick="onUserClicked(node.id)" class="user-item">{{ node.name }}</div>
            <div v-else>{{ node.name }}</div>
          </template>
          <template #icon="{ node }">
            <icon-user v-if="node.type == 4" />
          </template>
          <template #switcher-icon="node, { isLeaf }">
            <!-- <icon-user v-if="node.type == 4" /> -->
            <icon-caret-right v-if="node.type != 4" />
          </template>
        </a-tree>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from "vue";
import { setToken } from "@/utils/auth";
import TmpApi from "@/api/TmpApi";
import Cookies from "js-cookie";
import { IconSearch, IconUser, IconCaretRight } from "@arco-design/web-vue/es/icon";

let props = defineProps({ visible: Boolean });
let emits = defineEmits(["update:visible"]);

let keyword = ref("");
let users = ref([]);
let selectedUser = ref([]);
let filterUsers = computed(() => {
  const loop = (data) => {
    const result = [];
    (data || []).forEach((item) => {
      // type=4 是用户，其他是组织
      if (item.type !== 4) {
        item.disabled = true;
        if (item.children) {
          const filterData = loop(item.children);
          if (filterData.length) {
            result.push({
              ...item,
              children: filterData,
            });
          }
        } else {
          result.push({ ...item });
        }
      } else if (item.type == 4) {
        if (item.name.toLowerCase().indexOf(keyword.value.toLowerCase()) > -1) {
          result.push({ ...item });
        }
      }
    });
    return result;
  };

  return loop(users.value);
});
let fieldNames = ref({
  title: "name",
  key: "id",
});

const handleOk = () => {
  onUserClicked(selectedUser.value[0]);
  handleCancel();
};

const handleCancel = () => {
  emits("update:visible", false);
};

const loadOrganTree = () => {
  TmpApi.getOrgTree().then((resp) => {
    if (resp.code == 1) {
      let data = resp.data ? convert([resp.data]) : [];
      users.value = data;
    }
  });
};

const convert = (data) => {
  data.forEach((item) => {
    let { children, staffList } = item || {};
    if (children && children.length > 0) {
      convert(children);
    }
    if (staffList && staffList.length > 0) {
      staffList.forEach((i) => (i.type = 4));
      children.push(...staffList);
    }
  });
  return data;
};

const onUserClicked = (userId) => {
  TmpApi.switchUser({ flow_test: "flow_test", userId: userId }).then((resp) => {
    if (resp.code == 1 && resp.data) {
      let token = resp.data;
      setToken(token);
      Cookies.set("token", token, { SameSite: "strict" });
      window.location.reload();
    }
  });
};

onBeforeMount(() => {
  loadOrganTree();
});
</script>

<style lang="less">
.change-user-container {
  .user-list {
    max-height: 300px;
    min-height: 300px;
    overflow: hidden auto;
    margin-top: 10px;
    border: 1px solid var(--color-neutral-2);
    border-radius: 4px;
    padding: 5px 10px;

    // .user-item {
    //   cursor: pointer;
    //   min-height: 36px;
    //   display: flex;
    //   align-items: center;
    //   padding: 0 12px;
    //   border-radius: 4px;
    //   overflow: hidden;
    //   user-select: none;
    //   color: var(--color-text-2);

    //   + .user-item {
    //     border-top: 1px solid var(--color-neutral-2);
    //   }

    //   &:hover {
    //     background-color: var(--color-neutral-1);
    //   }
    // }
  }
}

.switch-user-modal {
  .user-item {
    padding: 5px 0;
    user-select: none;
    outline: none;
  }

  .arco-modal-body {
    padding: 20px 20px 10px;
  }

  .arco-tree-node-title {
    padding: 0;
    padding-left: 5px;
  }

  .arco-tree-node-title-text {
    width: 100%;
  }
}
</style>

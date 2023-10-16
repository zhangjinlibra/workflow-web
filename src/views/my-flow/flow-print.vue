<!-- 流程打印 -->
<template>
  <a-modal :visible="visible" draggable @ok="handleOk" @cancel="handleCancel" modal-class="flow-print-container" :width="700">
    <template #title> 打印预览 </template>
    <template #footer><a-button type="primary" v-print="'#flow-print-area'">打印</a-button></template>
    <div id="flow-print-area" class="flow-print-area">
      <div class="flow-status-stamp"><FlowStatusStamp :status="flowInst.status" :size="120" /></div>
      <h2 class="block title">{{ flowInst.name }}</h2>
      <div class="block no">审批编号：{{ flowInst.id }}</div>
      <div class="block create-time">提交时间：{{ flowInst.beginTime }}</div>
      <div class="block flow-info">
        <table class="flow-info-table">
          <colgroup>
            <col width="130" />
          </colgroup>
          <tr>
            <td class="label">提交人</td>
            <td class="value">{{ getUserById(flowInst.initiatorId).name }}</td>
          </tr>
          <!-- 流程表单 -->
          <template v-for="formWidget in formWidgets">
            <template
              v-if="
                [
                  WIDGET.SINGLELINE_TEXT,
                  WIDGET.MULTILINE_TEXT,
                  WIDGET.NUMBER,
                  WIDGET.MONEY,
                  WIDGET.SINGLE_CHOICE,
                  WIDGET.MULTI_CHOICE,
                  WIDGET.DATE,
                  WIDGET.DATE_RANGE,
                  WIDGET.DEPARTMENT,
                  WIDGET.EMPLOYEE,
                  WIDGET.AREA,
                ].includes(formWidget.type)
              ">
              <tr v-if="[WIDGET.SINGLELINE_TEXT, WIDGET.MULTILINE_TEXT, WIDGET.SINGLE_CHOICE, WIDGET.DATE].includes(formWidget.type)">
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">{{ formValue[formWidget.name] }}</td>
              </tr>
              <tr v-else-if="[WIDGET.NUMBER].includes(formWidget.type)">
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">{{ formValue[formWidget.name] }}</td>
              </tr>
              <tr v-else-if="[WIDGET.MONEY].includes(formWidget.type)">
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">{{ ObjectUtil.comma(formValue[formWidget.name]) }}</td>
              </tr>
              <tr v-else-if="[WIDGET.MULTI_CHOICE].includes(formWidget.type)">
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">{{ (formValue[formWidget.name] || []).join(", ") }}</td>
              </tr>
              <tr v-else-if="[WIDGET.DATE_RANGE].includes(formWidget.type)">
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">
                  <template v-if="formValue[formWidget.name] && formValue[formWidget.name].length == 2">
                    {{ `${formValue[formWidget.name][0]} 至 ${formValue[formWidget.name][1]}` }}
                  </template>
                </td>
              </tr>
              <tr v-else-if="[WIDGET.DEPARTMENT].includes(formWidget.type)">
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">{{ getDeptById(formValue[formWidget.name]).name }}</td>
              </tr>
              <tr v-else-if="[WIDGET.EMPLOYEE].includes(formWidget.type)">
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">{{ getUserById(formValue[formWidget.name]).name }}</td>
              </tr>
              <tr v-else-if="[WIDGET.AREA].includes(formWidget.type)">
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">{{ (formValue[formWidget.name] || []).join(" / ") }}</td>
              </tr>
            </template>
            <template v-else-if="[WIDGET.PICTURE].includes(formWidget.type)">
              <tr>
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">
                  <div class="img-box">
                    <img v-for="id in formValue[formWidget.name] || []" :src="`${FILE_BASE_URL}/download?id=${id}`" />
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="[WIDGET.ATTACHMENT].includes(formWidget.type)">
              <tr>
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">
                  <div class="attachment-box">
                    <div v-for="attachment in formValue[formWidget.name]">
                      {{ attachment ? attachment.name : "" }}
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <!-- 明细 -->
            <template v-else-if="[WIDGET.DETAIL].includes(formWidget.type)">
              <tr>
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">
                  <table class="detail-value">
                    <tr>
                      <td
                        class="label"
                        v-for="subWidget in formWidget.details.filter((d) => ![WIDGET.DESCRIBE, WIDGET.FLOW_INST].includes(d.type))">
                        {{ subWidget.label }}
                      </td>
                    </tr>
                    <template v-for="record in formValue[formWidget.name]">
                      <tr>
                        <template v-for="subWidget in formWidget.details">
                          <td v-if="[WIDGET.SINGLELINE_TEXT, WIDGET.MULTILINE_TEXT, WIDGET.SINGLE_CHOICE, WIDGET.DATE].includes(subWidget.type)">
                            {{ record[subWidget.name] }}
                          </td>
                          <td v-else-if="[WIDGET.NUMBER].includes(subWidget.type)">{{ record[subWidget.name] }}</td>
                          <td v-else-if="[WIDGET.MONEY].includes(subWidget.type)">{{ ObjectUtil.comma(record[subWidget.name]) }}</td>
                          <td v-else-if="[WIDGET.MULTI_CHOICE].includes(subWidget.type)">{{ (record[subWidget.name] || []).join(", ") }}</td>
                          <td v-else-if="[WIDGET.DATE_RANGE].includes(subWidget.type)">
                            <template v-if="record[subWidget.name] && record[subWidget.name].length == 2">
                              {{ `${record[subWidget.name][0]} 至 ${record[subWidget.name][1]}` }}
                            </template>
                          </td>
                          <td v-else-if="[WIDGET.DEPARTMENT].includes(subWidget.type)">{{ getDeptById(record[subWidget.name]).name }}</td>
                          <td v-else-if="[WIDGET.EMPLOYEE].includes(subWidget.type)">{{ getUserById(record[subWidget.name]).name }}</td>
                          <td v-else-if="[WIDGET.PICTURE].includes(subWidget.type)">
                            <div class="img-box">
                              <img v-for="id in record[subWidget.name] || []" :src="`${FILE_BASE_URL}/download?id=${id}`" />
                            </div>
                          </td>
                          <td v-else-if="[WIDGET.ATTACHMENT].includes(subWidget.type)">
                            <template v-for="attachment in record[subWidget.name]">
                              <div>{{ attachment ? attachment.name : "" }}</div>
                            </template>
                          </td>
                          <td v-else-if="[WIDGET.AREA].includes(subWidget.type)">{{ (record[subWidget.name] || []).join(" / ") }}</td>
                        </template>
                      </tr>
                    </template>
                  </table>
                </td>
              </tr>
            </template>
          </template>

          <tr v-for="(node, idx) in filteredFlowNodes">
            <template v-if="idx === 0">
              <td class="label" :rowspan="filteredFlowNodes.length">审批流程</td>
            </template>
            <template v-if="node.underway">
              <td class="value">
                <div class="assignee-node">
                  <div class="assignee-list">
                    <div v-for="userId in node.userIds">{{ getUserById(userId).name }}</div>
                    <div v-for="roleId in node.roleIds">{{ getRoleById(roleId).name }}</div>
                  </div>
                  <div class="flow-cmd">审批中</div>
                </div>
              </td>
            </template>
            <template v-else>
              <td class="value">
                <div class="assignee-node">
                  <div class="assignee-list">
                    <template v-if="[CMD.AUTO_REJECTED, CMD.AUTO_APPROVED].includes(node.flowCmd)">系统审批</template>
                    <template v-else>{{ getUserById(node.auditor).name }}</template>
                  </div>
                  <div class="flow-cmd">
                    <template v-if="node.flowCmd == CMD.AUTO_REJECTED">自动拒绝</template>
                    <template v-else-if="node.flowCmd == CMD.AUTO_APPROVED">自动通过</template>
                    <template v-else-if="node.flowCmd == CMD.REJECTED">拒绝</template>
                    <template v-else-if="node.flowCmd == CMD.APPROVED">通过</template>
                    <template v-else-if="node.flowCmd == CMD.CANCELED">撤销</template>
                  </div>
                </div>
              </td>
            </template>
          </tr>

          <tr>
            <td class="label">审批结果</td>
            <td class="value">{{ ArrayUtil.get(STATUS_LIST, "value", flowInst.status).name }}</td>
          </tr>
        </table>
      </div>

      <div class="block print-info">
        <div class="printer">打印人：{{ loginUser.name }}</div>
        <div class="print-time">打印时间：{{ timestamp() }}</div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useUserStore, useOrganStore } from "@/stores";
import moment from "moment";
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import { STATUS_LIST, WIDGET, CMD } from "@/components/flow/common/FlowConstant";
import { FILE_BASE_URL } from "@/api/FileApi";
import FlowStatusStamp from "./flow-status-stamp.vue";
import print from "vue3-print-nb";
const vPrint = print;

let { loginUser } = useUserStore();
let { getUserById, getDeptById, getRoleById } = useOrganStore();

let props = defineProps({
  visible: { type: Boolean, default: false },
  flowInst: Object,
  formWidgets: Array,
  formValue: Object,
  flowNodes: Array,
});
let emits = defineEmits(["update:visible"]);

const timestamp = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss");
};
const filteredFlowNodes = computed(() => {
  return props.flowNodes.filter(
    (node) => [CMD.AUTO_APPROVED, CMD.AUTO_REJECTED, CMD.APPROVED, CMD.REJECTED, CMD.CANCELED].includes(node.flowCmd) || node.underway
  );
});

const handleOk = () => {};
const handleCancel = () => {
  emits("update:visible", false);
};

onMounted(() => {});
</script>

<style lang="less">
.flow-print-area {
  width: 100%;
  // font-family: "宋体";
  font-size: 16px;
  color: #606266;
  height: calc(100vh - 200px);
  user-select: none;
  position: relative;

  .flow-status-stamp {
    position: absolute;
    right: 30px;
  }

  .block {
    + .block {
      margin-top: 8px;
    }
  }

  .title {
    text-align: center;
    color: #606266;
    word-break: break-all;

    display: block;
    font-size: 1.5em;
    margin-block: 0.83em;
    font-weight: bold;
  }

  .print-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  table {
    overflow: hidden;
    border-collapse: collapse;
    width: 100%;
    margin: 0;
    padding: 0;

    td {
      border: 1px solid #464648;
      font-size: 15px;
      word-break: break-all;
      padding: 4px;
      height: 32px;
    }

    .label {
      font-weight: bold;
    }

    .assignee-node {
      display: flex;
      justify-content: space-between;

      .assignee-list {
        width: calc(100% - 80px);
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .flow-cmd {
        width: 80px;
        text-align: right;
      }
    }

    .img-box {
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      img {
        width: 40px;
        height: 40px;

        + img {
          margin-left: 10px;
        }
      }
    }
  }
}

@media print {
  @page {
    size: auto;
    // margin: 4mm;
  }
  body {
    height: auto;
    .flow-print-area;
  }
}
</style>

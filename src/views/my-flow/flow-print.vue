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
                  WIDGET.NUMBER,
                  WIDGET.MONEY,
                  WIDGET.SINGLE_CHOICE,
                  WIDGET.MULTI_CHOICE,
                  WIDGET.DATE,
                  WIDGET.DATE_RANGE,
                  WIDGET.DEPARTMENT,
                  WIDGET.EMPLOYEE,
                  WIDGET.AREA,
                  WIDGET.MAILBOX,
                  WIDGET.MOBILE,
                  WIDGET.IDCARD,
                  WIDGET.WEBSITE,
                  WIDGET.FORMULA,
                ].includes(formWidget.type)
              ">
              <tr>
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">{{ formValue[formWidget.name] }}</td>
              </tr>
            </template>
            <template v-else-if="[WIDGET.MULTILINE_TEXT].includes(formWidget.type)">
              <tr>
                <td class="label">{{ formWidget.label }}</td>
                <td class="value" v-html="newline(formValue[formWidget.name])"></td>
              </tr>
            </template>
            <template v-else-if="[WIDGET.RICH_TEXT].includes(formWidget.type)">
              <tr>
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">
                  <div class="rich-text">
                    <div v-html="formValue[formWidget.name]" data-slate-editor></div>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="[WIDGET.RATE].includes(formWidget.type)">
              <tr>
                <td class="label">{{ formWidget.label }}</td>
                <td class="value">
                  <a-rate :default-value="formValue[formWidget.name]" readonly />
                </td>
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
                          <td
                            v-if="
                              [
                                WIDGET.SINGLELINE_TEXT,
                                WIDGET.SINGLE_CHOICE,
                                WIDGET.DATE,
                                WIDGET.NUMBER,
                                WIDGET.MONEY,
                                WIDGET.MULTI_CHOICE,
                                WIDGET.DATE_RANGE,
                                WIDGET.DEPARTMENT,
                                WIDGET.EMPLOYEE,
                                WIDGET.AREA,
                                WIDGET.MAILBOX,
                                WIDGET.MOBILE,
                                WIDGET.IDCARD,
                                WIDGET.WEBSITE,
                                WIDGET.FORMULA,
                              ].includes(subWidget.type)
                            ">
                            {{ record[subWidget.name] }}
                          </td>
                          <td v-if="[WIDGET.MULTILINE_TEXT].includes(subWidget.type)" v-html="newline(record[subWidget.name])"></td>
                          <td v-else-if="[WIDGET.RATE].includes(subWidget.type)">
                            <a-rate :default-value="record[subWidget.name]" readonly />
                          </td>
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
                <div class="signature-file-box" v-if="node.signatureFile && node.signatureFile.id">
                  <img :src="`${FILE_BASE_URL}/download?id=${node.signatureFile.id}`" />
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
import { FILE_BASE_URL } from "@/api/FileApi";
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import { CMD, STATUS_LIST, WIDGET } from "@/components/flow/common/FlowConstant";
import { useOrganStore, useUserStore } from "@/stores";
import { newline } from "@/utils/format";
import moment from "moment";
import { computed, onMounted } from "vue";
import print from "vue3-print-nb";
import FlowStatusStamp from "./flow-status-stamp.vue";
const vPrint = print;

let { loginUser } = useUserStore();
let { getUserById, getRoleById } = useOrganStore();

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

    .arco-rate {
      min-height: 14px;
      font-size: 14px;
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

    .signature-file-box {
      img {
        width: 100px;
      }
    }

    .img-box {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;

      img {
        width: 40px;
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

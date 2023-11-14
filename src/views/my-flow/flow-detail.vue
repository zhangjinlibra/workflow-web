<template>
  <section class="flow-detail-container">
    <template v-if="!(flowInst && flowInst.id)">
      <div class="flow-empty-detail-box">
        <a-empty></a-empty>
      </div>
    </template>
    <template v-else>
      <div class="flow-status-stamp"><FlowStatusStamp :status="flowInst.status" :size="120" /></div>

      <!-- 基本信息 -->
      <div class="flow-header-box">
        <div class="flow-no">编号：{{ flowInst.id }}</div>
        <div class="action-area">
          <div class="action-item" @click="onPrintClicked()"><icon-printer :size="16" /></div>
          <FlowPrint
            v-model:visible="showPrintModal"
            :flow-inst="flowInst"
            :form-value="formValue"
            :flow-nodes="flowNodes"
            :form-widgets="formWidgets" />
        </div>
      </div>
      <div class="flow-detail-box">
        <div class="header-box">
          <div class="summary-info">
            <div class="title">{{ flowInst.name }}</div>
            <div class="status">
              <a-tag color="blue" v-if="flowInst.status == STATUS.UNDERWAY">{{ STATUS_LIST[0].name }}</a-tag>
              <a-tag color="green" v-else-if="flowInst.status == STATUS.APPROVED">{{ STATUS_LIST[1].name }}</a-tag>
              <a-tag color="red" v-else-if="flowInst.status == STATUS.REJECTED">{{ STATUS_LIST[2].name }}</a-tag>
              <a-tag color="orangered" v-else-if="flowInst.status == STATUS.CANCELLED">{{ STATUS_LIST[3].name }}</a-tag>
            </div>
          </div>
          <div class="initiator-info">
            <flow-node-avatar :size="24" :id="flowInst.initiatorId" />
            <div class="begin-time">{{ flowInst.beginTime }} 提交</div>
          </div>
        </div>

        <!-- <a-divider orientation="left"> </a-divider> -->
        <div class="area-divider">
          <template v-if="formEditRecordBtnVisible">
            <div class="action-form-edit-btn" @click="onFormEditRecordClick()"><IconHistory :size="14" /> 编辑记录</div>
            <FormEditRecord v-model:visible="formEditRecordVisible" :form-widgets="formWidgets" :flowInstId="flowInst.id" />
          </template>
        </div>

        <!-- 表单信息 -->
        <FormDetail :form-widgets="formWidgets" :form-value="formValue" />

        <a-divider orientation="left"></a-divider>

        <!-- 审批流程时间线 -->
        <div class="flow-box">
          <a-timeline mode="left" labelPosition="relative">
            <template v-for="node in flowNodes">
              <a-timeline-item :label="node.auditTime">
                <template #dot>
                  <!-- <IconCheck class="node-dot" :style="{ backgroundColor: '#e8f3ff' }" /> -->
                  <div class="assignee-container">
                    <template v-if="node.underway">
                      <template v-if="node.type == NODE.APPROVE">
                        <a-avatar :size="36" style="background: #1989fa"><icon-stamp :size="24" /></a-avatar>
                      </template>
                      <template v-else-if="node.type == NODE.TRANSACT">
                        <a-avatar :size="36" style="background: #926bd5"><icon-pen-fill :size="24" /></a-avatar>
                      </template>
                      <div class="badge"><svg-icon icon-class="underway" color="#2a5eff" /></div>
                    </template>
                    <template v-else-if="[CMD.COPY].includes(node.flowCmd)">
                      <a-avatar :size="36" style="background: #1989fa"><svg-icon icon-class="copy" color="#fff" /></a-avatar>
                      <div class="badge"><svg-icon icon-class="approval" /></div>
                    </template>
                    <template v-else-if="[CMD.APPROVED].includes(node.flowCmd)">
                      <flow-node-avatar :size="36" :id="node.auditor" :show-name="false" />
                      <div class="badge"><svg-icon icon-class="approval" /></div>
                    </template>
                    <template v-else-if="[CMD.REJECTED].includes(node.flowCmd)">
                      <flow-node-avatar :size="36" :id="node.auditor" :show-name="false" />
                      <div class="badge"><svg-icon icon-class="reject" /></div>
                    </template>
                    <template v-else-if="[CMD.AUTO_APPROVED].includes(node.flowCmd)">
                      <a-avatar :size="36" style="background: #1989fa"><icon-robot /></a-avatar>
                      <div class="badge"><svg-icon icon-class="approval" /></div>
                    </template>
                    <template v-else-if="[CMD.AUTO_REJECTED].includes(node.flowCmd)">
                      <a-avatar :size="36" style="background: #1989fa"><icon-robot /></a-avatar>
                      <div class="badge"><svg-icon icon-class="reject" /></div>
                    </template>
                    <template v-else>
                      <flow-node-avatar :size="36" :id="node.auditor" :show-name="false" />
                      <div class="badge"><svg-icon icon-class="approval" /></div>
                    </template>
                  </div>
                </template>
                <div class="audit-record">
                  <!-- <div class="avatar sgement">
                    <template v-if="node.underway">
                      <a-avatar :size="36" style="background: #1989fa"><icon-user-group /></a-avatar>
                    </template>
                    <template v-else-if="[CMD.COPY, CMD.AUTO_APPROVED, CMD.AUTO_REJECTED].includes(node.flowCmd)">
                      <a-avatar :size="36" style="background: #1989fa"><icon-robot /></a-avatar>
                    </template>
                    <template v-else>
                      <flow-node-avatar :size="36" :id="node.auditor" :show-name="false" />
                    </template> 
                  </div> -->
                  <div class="avatar sgement">
                    <div class="node-name">
                      <template v-if="node.flowCmd == CMD.START">提交</template>
                      <template v-else-if="[CMD.APPROVED, CMD.REJECTED, CMD.AUTO_APPROVED, CMD.AUTO_REJECTED].includes(node.flowCmd)">
                        审批
                      </template>
                      <template v-else-if="node.flowCmd == CMD.CANCELED">撤销</template>
                      <template v-else-if="node.flowCmd == CMD.ASSIGN">转交</template>
                      <template v-else-if="node.flowCmd == CMD.BACK">回退</template>
                      <template v-else-if="node.flowCmd == CMD.ADD_BEFORE_SIGN">前加签</template>
                      <template v-else-if="node.flowCmd == CMD.ADD_AFTER_SIGN">后加签</template>
                      <template v-else-if="node.flowCmd == CMD.ADD_SIGN">并加签</template>
                      <template v-else-if="node.flowCmd == CMD.DEL_SIGN">减签</template>
                      <template v-else-if="node.flowCmd == CMD.COPY">抄送</template>
                      <template v-else-if="node.flowCmd == CMD.COMMENT">评论</template>
                      <template v-else-if="node.flowCmd == CMD.TRANSACT">办理</template>
                      <template v-else-if="node.underway">
                        <div class="in-approval">
                          <template v-if="node.type == NODE.APPROVE">审批中...</template>
                          <template v-else-if="node.type == NODE.TRANSACT">办理中...</template>
                        </div>
                      </template>
                    </div>
                    <!-- 审批人姓名 -->
                    <div class="auditor-name">
                      <template v-if="node.underway">
                        <div class="node-sign-type">
                          <template v-if="node.multiInstanceApprovalType == 2">
                            <template v-if="node.type == NODE.APPROVE">只需一人审批同意</template>
                            <template v-if="node.type == NODE.TRANSACT">只需一人办理同意</template>
                          </template>
                          <template v-else-if="node.userIds.length + node.roleIds.length > 1">
                            <template v-if="node.type == NODE.APPROVE">需所有人审批同意</template>
                            <template v-if="node.type == NODE.TRANSACT">需所有人办理同意</template>
                          </template>
                        </div>
                        <div class="node-assignee">
                          <flow-node-avatar v-for="userId in node.userIds" :size="20" :id="userId" class="assignee-item" />
                          <flow-node-role-avatar v-for="roleId in node.roleIds" :size="20" :id="roleId" class="assignee-item" />
                        </div>
                      </template>
                      <template v-else>
                        <template v-if="node.flowCmd == CMD.COPY">
                          <!-- <div class="node-sign-assignee">抄送{{ node.userIds.length }}人</div> -->
                          <div v-if="node.flowCmd == CMD.COPY" class="node-assignee">
                            <flow-node-avatar v-for="userId in node.userIds" :size="20" :id="userId" class="assignee-item" />
                          </div>
                        </template>
                        <template v-else>
                          <div class="assignee-name">{{ ArrayUtil.get(users, "id", node.auditor).name }}</div>
                          <div class="node-sign-assignee">
                            <template v-if="[CMD.ADD_BEFORE_SIGN, CMD.ADD_AFTER_SIGN, CMD.ADD_SIGN].includes(node.flowCmd)">
                              加签
                              <div class="node-sign-assignee-name">{{ ArrayUtil.get(users, "id", node.assignee).name }}</div>
                            </template>
                            <template v-else-if="[CMD.DEL_SIGN].includes(node.flowCmd)">
                              减签
                              <div class="node-sign-assignee-name">{{ ArrayUtil.get(users, "id", node.assignee).name }}</div>
                            </template>
                            <template v-else-if="[CMD.ASSIGN].includes(node.flowCmd)">
                              转交给
                              <div class="node-sign-assignee-name">{{ ArrayUtil.get(users, "id", node.assignee).name }}</div>
                            </template>
                          </div>
                        </template>
                      </template>
                    </div>
                    <div class="comment" v-if="node.comment">
                      <!-- <div class="commnet-title">审批意见</div> -->
                      <div class="comment-content">
                        {{ node.comment }}
                      </div>
                      <div class="comment-attachment" v-if="node.files">
                        <div class="comment-attachment-item" v-for="attachment in node.files">
                          <div class="name"><icon-drive-file :size="16" /> {{ attachment ? attachment.name : "" }}</div>
                          <div class="download-icon">
                            <div class="link" @click.prevent.stop="onAttachmentDownload(attachment, $event)">
                              <icon-download :size="16" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 审批结果 -->
                  <!-- <div class="cmd sgement">
                    <template v-if="node.underway"></template>
                    <template v-else-if="node.flowCmd == CMD.START"></template>
                    <template v-else-if="node.flowCmd == CMD.APPROVED"> <a-tag color="green">通过</a-tag> </template>
                    <template v-else-if="node.flowCmd == CMD.REJECTED"> <a-tag color="red">拒绝</a-tag> </template>
                    <template v-else-if="node.flowCmd == CMD.CANCELED"> <a-tag color="orangered">撤销</a-tag> </template>
                    <template v-else-if="node.flowCmd == CMD.COPY"> <a-tag color="blue">抄送</a-tag> </template>
                    <template v-else><a-tag>完成</a-tag></template>
                  </div> -->
                </div>
              </a-timeline-item>
            </template>
          </a-timeline>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="flow-actions">
        <template v-if="!finished && flowInst.nodeSignType == 0 && editable && formEditable">
          <a-tooltip content="编辑审批表单" mini>
            <a-button @click="onFormEdit()">
              <template #icon><icon-edit /></template> 编辑
            </a-button>
          </a-tooltip>
          <FormEdit
            :form-value="formValue"
            :flow-inst="flowInst"
            :form-widgets="formWidgets"
            v-model:visible="formEditVisible"
            @onOk="onFormUpdated" />
        </template>

        <template v-if="commentable">
          <a-button @click="onComment()">
            <template #icon><icon-message /></template> 评论
          </a-button>
        </template>

        <template v-if="!finished && actionable">
          <template v-if="flowInst.nodeType == NODE.APPROVE">
            <a-button type="primary" @click="onApproved()">
              <template #icon><icon-check /></template> 同意
            </a-button>
            <a-button type="primary" status="danger" @click="onRejected()">
              <template #icon><icon-close /></template> 拒绝
            </a-button>
          </template>
          <template v-else-if="flowInst.nodeType == NODE.TRANSACT">
            <a-button type="primary" @click="onTransacted()">
              <template #icon><icon-check /></template> 提交
            </a-button>
          </template>
        </template>

        <template v-if="!finished && flowInst.cancelable && cancelable">
          <a-button @click="onCanceled()">
            <template #icon><icon-undo /></template> 撤销
          </a-button>
        </template>

        <a-dropdown
          :popup-max-height="false"
          v-if="
            !finished &&
            actionable &&
            (flowInst.assignable || flowInst.backable || (flowInst.signable && [NODE_SIGN.NONE].includes(flowInst.nodeSignType)))
          "
          class="flow-actions-box">
          <a-button>
            <template #icon><icon-down /></template> 更多
          </a-button>
          <template #content>
            <a-doption @click="onAssigned()" v-if="flowInst.assignable">
              <template #icon><icon-swap /></template>
              <template #default><div class="action-name">转交</div></template>
            </a-doption>
            <a-doption @click="onJumped()" v-if="flowInst.backable">
              <template #icon><icon-backward /></template>
              <template #default><div class="action-name">回退</div></template>
            </a-doption>
            <a-doption @click="onAddSigned()" v-if="flowInst.signable && [NODE_SIGN.NONE].includes(flowInst.nodeSignType)">
              <template #icon><icon-user-add /></template>
              <template #default><div class="action-name">加签</div></template>
            </a-doption>
            <a-doption @click="onDelSigned()" v-if="flowInst.signable && [NODE_SIGN.NONE].includes(flowInst.nodeSignType)">
              <template #icon><svg-icon icon-class="delete-user" /></template>
              <template #default><div class="action-name">减签</div></template>
            </a-doption>
          </template>
        </a-dropdown>
      </div>
    </template>

    <!-- 处理流程的弹窗 -->
    <a-modal :visible="showHandleModal" @ok="onHandleModelOK" @cancel="onHandleModelCancel" draggable>
      <template #title> {{ handleModalTitle }} </template>
      <div class="flow-exe-box">
        <a-form :model="handleModalForm" layout="vertical">
          <template v-if="handleModalForm.flowCmd == CMD.ASSIGN">
            <!-- <div class="action-tip">将当前审批转交给其他人审批，自己无需再审批。例如不方便处理当前审批时，可以转交给其他人。</div> -->
            <a-form-item field="assignee" label="转交给" :required="handleModalForm.flowCmd == CMD.ASSIGN">
              <a-select v-model:model-value="handleModalForm.assignee" allow-search placeholder="请选择转交人员">
                <a-option v-for="user in users" :value="user.id" :label="user.name" />
              </a-select>
            </a-form-item>
          </template>

          <template v-if="[CMD.ADD_BEFORE_SIGN, CMD.ADD_AFTER_SIGN, CMD.ADD_SIGN].includes(handleModalForm.flowCmd)">
            <a-form-item
              field="flowCmd"
              label="加签方式"
              :required="[CMD.ADD_BEFORE_SIGN, CMD.ADD_AFTER_SIGN, CMD.ADD_SIGN].includes(handleModalForm.flowCmd)">
              <a-radio-group v-model:model-value="handleModalForm.flowCmd" class="modify-sign-group">
                <a-radio :value="CMD.ADD_BEFORE_SIGN">
                  前加签
                  <a-tooltip content="在当前节点之前增加一个审批节点，当新增的节点同意后，再流转至当前节点。" mini>
                    <icon-question-circle class="modify-sign-tip" />
                  </a-tooltip>
                </a-radio>
                <a-radio :value="CMD.ADD_SIGN">
                  并加签
                  <a-tooltip content="在当前节点同步增加其他审批人。" mini>
                    <icon-question-circle class="modify-sign-tip" />
                  </a-tooltip>
                </a-radio>
                <a-radio :value="CMD.ADD_AFTER_SIGN">
                  后加签
                  <a-tooltip content="在当前节点之后增加一个审批节点，当前节点会默认同意，并流转至新增的节点。" mini>
                    <icon-question-circle class="modify-sign-tip" />
                  </a-tooltip>
                </a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item
              field="userId"
              label="给谁加签"
              :required="[CMD.ADD_BEFORE_SIGN, CMD.ADD_AFTER_SIGN, CMD.ADD_SIGN].includes(handleModalForm.flowCmd)">
              <a-select v-model:model-value="handleModalForm.userId" allow-search placeholder="请选择加签人员">
                <a-option v-for="user in users" :value="user.id" :label="user.name" />
              </a-select>
            </a-form-item>
          </template>

          <a-form-item
            field="userId"
            label="给谁减签"
            :required="handleModalForm.flowCmd == CMD.DEL_SIGN"
            v-if="handleModalForm.flowCmd == CMD.DEL_SIGN">
            <a-select v-model:model-value="handleModalForm.userId" allow-search placeholder="请选择减签人员">
              <a-option v-for="user in users.filter((i) => deleteableUserIds.includes(i.id))" :value="user.id" :label="user.name" />
            </a-select>
          </a-form-item>

          <template v-if="handleModalForm.flowCmd == CMD.BACK">
            <!-- <div class="action-tip">将流程回退到之前某一节点重新审批。例如发现之前审批有误时，可以将流程回退到该节点。</div> -->
            <a-form-item field="flowNodeId" label="回退到" :required="handleModalForm.flowCmd == CMD.BACK">
              <a-select v-model:model-value="handleModalForm.flowNodeId" allow-search placeholder="请选择回退节点">
                <a-option v-for="node in jumpableNodes" :value="node.id" :label="node.name" />
              </a-select>
            </a-form-item>
          </template>

          <a-form-item
            field="comment"
            :label="handleModelCommentLabel(handleModalForm.flowCmd)"
            :required="handleModalForm.flowCmd == CMD.COMMENT">
            <a-textarea
              v-model:model-value="handleModalForm.comment"
              :placeholder="`请输入${handleModelCommentLabel(handleModalForm.flowCmd)}`"
              allow-clear
              :max-length="64"
              show-word-limit />
          </a-form-item>

          <a-form-item field="fileIds" label="附件">
            <a-upload
              v-model:file-list="handleModalForm.fileIds"
              :action="fileUploadUrl"
              :headers="fileUploadHeaders"
              :with-credentials="true"
              multiple
              :limit="3"
              class="action-attachment">
              <template #upload-button>
                <a-button>
                  <template #icon><icon-attachment /></template>上传
                </a-button>
              </template>
            </a-upload>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useOrganStore } from "@/stores";
import { getToken } from "@/utils/auth";
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import { CMD, NODE, NODE_SIGN, STATUS, STATUS_LIST, WIDGET } from "@/components/flow/common/FlowConstant";
import { FILE_BASE_URL } from "@/api/FileApi";
import FlowInstApi from "@/api/FlowInstApi";
import FlowManApi from "@/api/FlowManApi";
import OrganApi from "@/api/OrganApi";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import FlowNodeRoleAvatar from "@/components/common/FlowNodeRoleAvatar.vue";
import FormDetail from "./flow-form-detail.vue";
import FlowPrint from "./flow-print.vue";
import FlowStatusStamp from "./flow-status-stamp.vue";
import FormEditRecord from "./form-edit-record.vue";
import FormEdit from "./form-edit.vue";
import {
  IconAttachment,
  IconBackward,
  IconCheck,
  IconClose,
  IconDown,
  IconDownload,
  IconDriveFile,
  IconEdit,
  IconHistory,
  IconMessage,
  IconPenFill,
  IconPrinter,
  IconQuestionCircle,
  IconRobot,
  IconStamp,
  IconSwap,
  IconUndo,
  IconUserAdd,
} from "@arco-design/web-vue/es/icon";

let organStore = useOrganStore();
let users = computed(() => organStore.users);

let props = defineProps({
  flowInst: { type: Object, default: () => {} },
  cancelable: { type: Boolean, default: false }, // 撤销按钮
  commentable: { type: Boolean, default: true }, //评论按钮
  actionable: { type: Boolean, default: false }, // 其他操作按钮
  editable: { type: Boolean, default: false }, // 表单是否可以编辑
});
let emits = defineEmits(["onRemove", "update:flowInst"]);

let fileUploadUrl = FILE_BASE_URL + "/upload"; //文件上传地址
let fileUploadHeaders = ref({ Authorization: getToken() }); // 文件上传请求头

let formWidgets = ref([]);
let formWidgetMap = ref({});
let flowNodes = ref([]);
let formValue = ref({});
let finished = computed(() => props.flowInst.status != 0);

// 查询表单组件
const loadFormWidgets = () => {
  return FlowInstApi.getForm({ flowInstId: props.flowInst.id, flowNodeId: props.flowInst.nodeId }).then((resp) => {
    if (resp.code == 1) {
      let form = resp.data || {};
      let widgets = form.formWidgets;
      let values = form.formValue;
      formWidgets.value = widgets;
      formWidgetMap.value = FlowManApi.formWidgetListToMap(widgets);
      formValue.value = JSON.parse(values);
    }
  });
};

// 获取审批节点
const loadFlowDetail = () => {
  FlowInstApi.getDetail({ flowInstId: props.flowInst.id }).then((resp) => {
    if (resp.code == 1) {
      flowNodes.value = resp.data || [];
    }
  });
};

// 附件下载
const onAttachmentDownload = (attachment, evt) => {
  evt.stopPropagation();
  window.open(FILE_BASE_URL + "/download?id=" + attachment.id, "_blank");
};

// 打印相关
let showPrintModal = ref(false);
const onPrintClicked = () => {
  showPrintModal.value = true;
};

// 处理流程弹窗相关
let jumpableNodes = ref([]);
let deleteableUserIds = ref([]);
let showHandleModal = ref(false);
let handleModalTitle = ref("");
let handleModalForm = ref({});

const onHandleModelCancel = () => {
  showHandleModal.value = false;
  handleModalTitle.value = "";
  handleModalForm.value = {
    flowInstId: null, // 流程实例id
    taskId: null, // 任务id
    flowCmd: null, // 任务指令
    assignee: null, //指派人
    comment: null, //备注
  };
};

// 处理流程弹窗表单评论label
const handleModelCommentLabel = (cmd) => {
  switch (cmd) {
    case CMD.APPROVED:
    case CMD.REJECTED:
    case CMD.ASSIGN:
    case CMD.ADD_BEFORE_SIGN:
    case CMD.ADD_AFTER_SIGN:
    case CMD.ADD_SIGN:
    case CMD.DEL_SIGN:
      return "审批意见";
    case CMD.CANCELED:
      return "撤回理由";
    case CMD.BACK:
      return "回退原因";
    case CMD.COMMENT:
      return "评论";
    case CMD.TRANSACT:
      return "办理意见";
  }
};

const onHandleModelOK = () => {
  // 取出上传的文件id
  let handleModalFormValue = ObjectUtil.copy(handleModalForm.value);
  let { flowCmd: cmd, fileIds } = handleModalFormValue;
  if (fileIds && fileIds.length > 0) handleModalFormValue.fileIds = fileIds.map((v) => (v.response || {}).data.id);

  let req = null;
  switch (cmd) {
    case CMD.CANCELED:
      req = FlowInstApi.cancel(handleModalFormValue);
      break;
    case CMD.COMMENT:
      req = FlowInstApi.comment(handleModalFormValue);
      break;
    case CMD.BACK:
      req = FlowInstApi.jump(handleModalFormValue);
      break;
    case CMD.ADD_BEFORE_SIGN:
      req = FlowInstApi.addBeforeSign(handleModalFormValue);
      break;
    case CMD.ADD_AFTER_SIGN:
      req = FlowInstApi.addAfterSign(handleModalFormValue);
      break;
    case CMD.ADD_SIGN:
      req = FlowInstApi.addSign(handleModalFormValue);
      break;
    case CMD.DEL_SIGN:
      req = FlowInstApi.delSign(handleModalFormValue);
      break;
    case CMD.APPROVED:
      req = FlowInstApi.approve(handleModalFormValue);
      break;
    case CMD.REJECTED:
      req = FlowInstApi.reject(handleModalFormValue);
      break;
    case CMD.ASSIGN:
      req = FlowInstApi.assign(handleModalFormValue);
      break;
    case CMD.TRANSACT:
      req = FlowInstApi.transact(handleModalFormValue);
      break;
  }
  req.then((resp) => {
    if (resp.code == 1) {
      onHandleModelCancel();
      if (cmd == CMD.CANCELED) {
        props.flowInst.status = STATUS.CANCELLED;
        emits("update:flowInst", props.flowInst);
      }
      if ([CMD.ASSIGN, CMD.BACK, CMD.ADD_BEFORE_SIGN, CMD.ADD_AFTER_SIGN, CMD.APPROVED, CMD.REJECTED, CMD.TRANSACT].includes(cmd)) {
        emits("onRemove");
      } else {
        loadFlowDetail();
      }
    }
  });
};

const initModalForm = (cmd) => {
  return {
    flowInstId: props.flowInst.id,
    taskId: props.flowInst.taskId,
    flowCmd: cmd,
    fileIds: [],
  };
};
const onApproved = () => {
  handleModalTitle.value = "同意审批";
  handleModalForm.value = initModalForm(CMD.APPROVED);
  showHandleModal.value = true;
};
const onRejected = () => {
  handleModalTitle.value = "拒绝审批";
  handleModalForm.value = initModalForm(CMD.REJECTED);
  showHandleModal.value = true;
};
const onTransacted = () => {
  handleModalTitle.value = "审批办理";
  handleModalForm.value = initModalForm(CMD.TRANSACT);
  showHandleModal.value = true;
};
const onCanceled = () => {
  handleModalTitle.value = "撤销审批";
  handleModalForm.value = initModalForm(CMD.CANCELED);
  showHandleModal.value = true;
};
const onAssigned = () => {
  handleModalTitle.value = "转交审批";
  handleModalForm.value = initModalForm(CMD.ASSIGN);
  showHandleModal.value = true;
};
const onComment = () => {
  handleModalTitle.value = "评论审批";
  handleModalForm.value = initModalForm(CMD.COMMENT);
  showHandleModal.value = true;
};
const onJumped = () => {
  FlowInstApi.listJumpableNodes({
    flowInstId: props.flowInst.id,
    actNodeId: props.flowInst.actNodeId,
  }).then((resp) => {
    if (resp.code == 1) jumpableNodes.value = resp.data || [];
  });
  handleModalTitle.value = "回退审批";
  handleModalForm.value = initModalForm(CMD.BACK);
  showHandleModal.value = true;
};
const onAddSigned = () => {
  handleModalTitle.value = "审批加签";
  handleModalForm.value = initModalForm(CMD.ADD_SIGN);
  showHandleModal.value = true;
};
const onDelSigned = () => {
  FlowInstApi.listRemoveableNodeAssignees({
    flowInstId: props.flowInst.id,
    actNodeId: props.flowInst.actNodeId,
  }).then((resp) => {
    if (resp.code == 1) deleteableUserIds.value = resp.data || [];
  });
  handleModalTitle.value = "审批减签";
  handleModalForm.value = initModalForm(CMD.DEL_SIGN);
  showHandleModal.value = true;
};

// 是否显示编辑记录按钮
const formEditRecordBtnVisible = ref(false);
const hasFormEditRecord = () => {
  FlowInstApi.hasFormEditRecord({ flowInstId: props.flowInst.id }).then((resp) => {
    if (resp.code == 1) formEditRecordBtnVisible.value = resp.data;
  });
};

// 表单编辑相关
const formEditVisible = ref(false);
const formEditRecordVisible = ref(false);
const formEditable = computed(() => {
  let tmp = false;
  formWidgets.value.forEach((formWidget) => {
    if (formWidget.type == WIDGET.DETAIL) {
      formWidget.details.forEach((detail) => {
        if (detail.editable) tmp = true;
      });
    } else if (formWidget.editable) tmp = true;
  });
  return tmp;
});
const onFormEdit = () => {
  formEditVisible.value = true;
};
const onFormUpdated = (nv) => {
  formValue.value = JSON.parse(nv);
  hasFormEditRecord();
};
const onFormEditRecordClick = () => {
  formEditRecordVisible.value = true;
};

watch(
  () => props.flowInst,
  (nv) => {
    if (nv && nv.id && nv.flowDefId) {
      loadFlowDetail();
      loadFormWidgets();
      hasFormEditRecord();
    }
  },
  { immediate: true }
);

onMounted(() => {
  OrganApi.loadOrgan(); // 加载组织
});
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";
@bottomActionHeight: 52px;
@DetailHeaderHeight: 40px;
@FormLabelWidth: 84px;

.flow-detail-container {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.flow-empty-detail-box {
  margin-top: 20%;
}

.flow-status-stamp {
  position: absolute;
  right: 30px;
  top: 30px;
}

.area-divider {
  border-bottom: 1px solid var(--color-neutral-3);
  margin: 20px 0;
  position: relative;
}

.action-form-edit-btn {
  user-select: none;
  position: absolute;
  right: 0;
  top: 0;
  border: 1px solid var(--color-neutral-3);
  border-top: 0;
  border-radius: 0 0 4px 4px;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
  color: #86909c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  &:hover {
    background-color: #f2f3f5;
  }
}

.flow-header-box {
  font-weight: 400;
  font-size: 13px;
  border-bottom: 1px solid #e5e6ec;
  padding: 0 @GapLarge;
  height: calc(@DetailHeaderHeight - 1px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #86909c;

  .action-area {
    display: flex;
    gap: 4px;

    .action-item {
      cursor: pointer;
      padding: 4px;
      border-radius: @BorderRadius;
      width: fit-content;
      height: fit-content;
      &:hover {
        background-color: #f2f3f5;
      }
    }
  }
}

.flow-detail-box {
  height: calc(100% - @bottomActionHeight - @DetailHeaderHeight);
  overflow: hidden;
  overflow-y: auto;
  padding: 0 calc(@GapLarge + 10px);

  .header-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 20px;

    .summary-info {
      display: flex;
      align-items: center;

      .title {
        font-size: 24px;
        font-family: PingFangSC-Semibold, PingFang SC;
        color: #1d2129;
      }

      .status {
        margin-left: 20px;
      }
    }

    .initiator-info {
      display: flex;
      align-items: center;
      margin-top: 16px;

      .begin-time {
        margin-left: 20px;
        font-weight: 350;
        color: #86909c;
        font-size: 13px;
        user-select: none;
      }
    }
  }

  // 流程时间线相关样式
  .flow-box {
    user-select: none;

    // 流程头像
    .assignee-container {
      position: relative;

      .badge {
        @BadgeSize: 18px;
        @BadgeOffset: -4px;
        position: absolute;
        width: @BadgeSize;
        height: @BadgeSize;
        display: flex;
        align-items: center;
        justify-content: center;
        bottom: @BadgeOffset;
        right: @BadgeOffset;
        z-index: 999;
        border: 2px solid #fff;
        background-color: #fff;
        border-radius: 50%;
        overflow: hidden;
      }
    }

    .audit-record {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .sgement {
        margin-left: 8px;
        flex: 1;
      }

      .node-name {
        font-weight: 400;
        color: #86909c;

        .in-approval {
          color: #2a5eff;
        }
      }

      .auditor-name {
        font-size: 14px;

        .node-sign-type,
        .node-sign-assignee {
          font-weight: 400;
          color: #86909c;
          font-size: 12px;

          .node-sign-assignee-name {
            color: #2a5eff;
            display: inline-block;
          }
        }

        .node-assignee {
          margin-top: 4px;
          display: flex;
          flex-flow: row wrap;
          gap: 6px;
        }

        .assignee-name {
          color: #1d2129;
        }
      }

      .comment {
        user-select: none;
        margin: 4px 0 16px;
        padding: 8px 16px;
        border-radius: 4px;
        // background: #f2f4f5;
        background-color: #f8f8fa;

        .commnet-title {
          font-weight: 400;
          color: #a6aab1;
          font-size: 13px;
        }

        .comment-content {
          font-weight: 500;
          color: #1d2129;
        }

        .comment-attachment {
          gap: 10px;
          margin: 4px 0;
          display: flex;
          flex-wrap: wrap;

          .comment-attachment-item {
            border-radius: 4px;
            border: 1px solid #e1e1e1;
            padding: 4px 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;

            .name {
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .download-icon {
              display: flex;
              align-items: center;
              cursor: pointer;
              color: #165cfd;

              &:hover {
                opacity: 0.7;
              }
            }
          }
        }
      }

      .cmd {
        text-align: right;
      }
    }
  }
}

.flow-actions {
  display: flex;
  align-items: center;
  justify-content: end;
  height: @bottomActionHeight;
  border-top: 1px solid var(--color-neutral-3);
  padding: 0 @GapLarge;

  button {
    + button {
      margin-left: 10px;
    }
  }
}
</style>

<style lang="less">
.flow-detail-box {
  .arco-timeline-item {
    min-height: 108px;
  }

  .arco-timeline-item-dot-line {
    top: 40px;
    bottom: 4px;
    border-color: #bed0f7;
    border-left-width: 2px;
  }

  .arco-timeline-item-dot-content {
    width: 36px;
    height: 36px;
    line-height: 36px;
  }

  .arco-timeline-item-content-wrapper {
    margin-left: 36px;
  }

  .arco-table-cell {
    padding: 6px;
    font-size: 13px;
    min-height: 30px;
  }
}

.arco-image-preview {
  .arco-image-preview-arrow {
    position: initial;
  }
}

.arco-dropdown-open .arco-icon-down {
  transform: rotate(180deg);
}

.flow-actions-box {
  .arco-dropdown {
    padding: 4px;
  }
}

.flow-exe-box {
  .modify-sign-group {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    width: 100%;

    .modify-sign-tip {
      color: var(--color-text-4);
    }
  }

  .action-attachment {
    .arco-upload-list-item {
      margin-top: 0;

      &:first-of-type {
        margin-top: 12px;
      }

      .arco-upload-list-item-content {
        padding: 4px 10px 4px 12px;
      }

      .arco-upload-list-item-operation {
        .arco-icon {
          font-size: 16px;
        }
      }
    }

    .arco-upload-hide + .arco-upload-list .arco-upload-list-item:first-of-type {
      margin-top: 0px;
    }
  }
}
</style>

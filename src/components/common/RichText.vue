<!-- 富文本组件 -->
<template>
  <div class="widget-rich-text">
    <Toolbar class="toolbar" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor class="editor" v-model="valueHtml" :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" @onChange="handleChange" />
  </div>
</template>

<script setup>
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
// import { DomEditor } from "@wangeditor/editor";

const props = defineProps({
  value: { type: String, default: "<p></p>" },
  placeholder: { type: String, default: "请输入内容..." },
  disabled: { type: Boolean, default: false },
});
const emits = defineEmits(["update:value"]);

watch(
  () => props.value,
  (newValue) => {
    valueHtml.value = newValue;
  }
);

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
// 内容 HTML
const valueHtml = ref("<p></p>");
// 编辑器模式
const mode = ref("simple");
// 工具栏配置
const toolbarConfig = {
  toolbarKeys: [
    "blockquote",
    "header1",
    "header2",
    "header3",
    "bold",
    "underline",
    "italic",
    "through",
    "color",
    "bgColor",
    "bulletedList",
    "numberedList",
    "justifyLeft",
    "justifyRight",
    "justifyCenter",
    "insertTable",
    "undo",
    "redo",
    "clearStyle",
    "fullScreen",
  ],
};
// 编辑器配置
const editorConfig = {
  placeholder: props.placeholder,
  autoFocus: false,
  readOnly: props.disabled,
};

// 编辑器初始化完成时，将 editor 实例赋值给 editorRef
const handleCreated = (editor) => {
  editorRef.value = editor;
  editor.setHtml(props.value);
};
const handleChange = (editor) => {
  emits("update:value", valueHtml.value);
};

// 模拟 ajax 异步获取内容
onMounted(() => {
  // setTimeout(() => {
  //   // 获取 toolbar 配置
  //   const toolbar = DomEditor.getToolbar(editorRef.value);
  //   console.log(JSON.stringify(toolbar.getConfig()));
  // }, 1500);
  valueHtml.value = props.value;
});
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style lang="less">
@import "@/styles/rich.text.less";

.widget-rich-text {
  border: 1px solid var(--color-fill-2);
  border-radius: var(--border-radius-small);
  overflow: hidden;
  font-size: 14px;
  color: #999;
  width: 100%;

  .toolbar {
    border-bottom: 1px solid var(--color-fill-2);
  }

  .editor {
    background-color: var(--color-fill-2);
    overflow-y: hidden;

    &:hover {
      background-color: var(--color-fill-3);
    }

    [data-slate-editor] {
      // height: 100%;
      min-height: 200px;
      padding: 4px 10px;
      border: 1px solid transparent;

      &:focus {
        background-color: #fff;
        border: 1px solid rgb(var(--primary-6));
      }

      [data-slate-node="element"] {
        margin-top: 0;
      }
    }
  }
}
</style>

<template>
  <div class="modeler">
    <div id="canvas"></div>
    <div id="properties"></div>
  </div>
  <div class="btns">
    <a-space>
      <a-button type="primary" @click="save()">保存</a-button>
    </a-space>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, markRaw } from "vue";
import customTranslate from "./customTranslate";

import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  // use Camunda Platform properties provider
  CamundaPlatformPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import "bpmn-js-properties-panel/dist/assets/properties-panel.css";
import "bpmn-js-properties-panel/dist/assets/element-templates.css";

// use Camunda BPMN namespace
import CamundaBpmnModdle from "camunda-bpmn-moddle/resources/camunda.json";

const data = reactive({
  canvas: null,
  bpmnModeler: null,
});

const CustomTranslateModule = {
  translate: ["value", customTranslate],
};

function init() {
  data.canvas = document.getElementById("canvas");
  // 加markRaw去除双向绑定作用域
  data.bpmnModeler = markRaw(
    new BpmnModeler({
      container: data.canvas,
      propertiesPanel: {
        parent: "#properties",
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule,
        CustomTranslateModule,
      ],
      moddleExtensions: {
        camunda: CamundaBpmnModdle,
      },
    })
  );
  // data.bpmnModeler.createDiagram(() => {
  //   data.bpmnModeler.get('canvas').zoom('fit-viewport');
  // });
  data.bpmnModeler.createDiagram().then((result) => {
    data.bpmnModeler.get("canvas").zoom("fit-viewport");
    console.log(result);
  });
}

function save() {
  // data.bpmnModeler.saveXML({ format: true }, (err, data) => {
  //   // let xml = data.replace(/camunda.org\/schema\/1.0\/bpmn/ig, "activiti.org/bpmn").replace(/camunda/ig, "activiti");
  //   console.log(data);
  // });
  let options = { format: true };
  data.bpmnModeler.saveXML(options).then((result) => {
    const { xml } = result;
    // let xml = data.replace(/camunda.org\/schema\/1.0\/bpmn/ig, "activiti.org/bpmn").replace(/camunda/ig, "activiti");
    console.log(xml);
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="less">
.modeler {
  // border: 1px solid #a3a3ff;
  // min-height: calc(500px);
  // max-height: calc(500px);
  // overflow-y: scroll;

  position: relative;
  width: 100%;
  height: calc(100vh);
  display: flex;

  #canvas {
    width: 100%;
  }

  #properties {
    width: 400px;

    border-left: 1px solid #ccc;
    overflow: auto;

    &:empty {
      display: none;
    }

    > .djs-properties-panel {
      padding-bottom: 70px;
      min-height: 100%;
    }
  }
}

/* #canvas {
  width: 100%;
  height: 100%;
}

#properties {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
} */
</style>

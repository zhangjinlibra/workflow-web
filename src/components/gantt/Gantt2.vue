<template>
  <div class="gantt-wrapper">
    <svg class="gannt"></svg>
    <!-- <div><a-button type="primary" @click="widthInc">Primary</a-button></div>
        <svg class="cc">
            <rect x="0" y="0" :width="data.width" height="25" rx="2" ry="2" class="bar-progress">
            </rect>
        </svg>
        <animate attributeName="width" from="0" to="10" dur="0.4s" begin="0.1s" calcMode="spline" values="0;91.2" keyTimes="0; 1" keySplines="0 0 .58 1"></animate> -->
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import Gantt from "@/components/frappe-gantt/frappe-gantt";
import "@/components/frappe-gantt/frappe-gantt.css";

const data = reactive({
  tasks: [
    {
      start: "2022-06-01",
      end: "2022-06-08",
      name: "测试任务1",
      id: "1",
      progress: 100,
    },
    {
      start: "2022-06-03",
      end: "2022-06-06",
      name: "测试任务2",
      id: "2",
      progress: 60,
      dependencies: "1",
    },
    {
      start: "2022-06-04",
      end: "2022-06-08",
      name: "测试任务3",
      id: "3",
      progress: 0,
      dependencies: "1",
    },
    {
      start: "2022-06-08",
      end: "2022-06-09",
      name: "测试任务4",
      id: "4",
      progress: 0,
      dependencies: "2",
    },
    {
      start: "2022-06-08",
      end: "2022-06-10",
      name: "测试任务5",
      id: "5",
      progress: 0,
      dependencies: "2",
    },
    {
      start: "2022-06-12",
      end: "2022-06-25",
      name: "测试任务6",
      id: "6",
      progress: 0,
      dependencies: "3,5",
    },
  ],
  gantt: null,
  width: 10,
});

function widthInc() {
  data.width += 2;
  console.log(data.width);
}

onMounted(() => {
  const gantt = new Gantt(".gannt", data.tasks, {
    bar_height: 25,
    bar_corner_radius: 2,
    on_click: function (task) {
      console.log("click", task);
    },
    on_date_change: function (task, start, end) {
      console.log("date", task, start, end);
      const [task0] = data.tasks.filter((i) => i.id == task.id) || [];
    },
    on_progress_change: function (task, progress) {
      console.log("progress", task, progress);
      const [task0] = data.tasks.filter((i) => i.id == task.id) || [];
    },
    on_view_change: function (mode) {
      console.log("view", mode);
    },
  });
  data.gantt = gantt;
});
</script>

<style>
.cc {
  width: 100%;
}

.bar-progress {
  fill: #a3a3ff;
}
</style>

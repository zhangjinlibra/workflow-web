<template>
  <div class="kanban">
    <div class="group">
      <Container
        @drop="onDrop(items, $event)"
        orientation="vertical"
        group-name="1"
        :get-child-payload="getChildPayload1"
        :drop-placeholder="dropPlaceholderOptions"
        drag-class="card-ghost"
        drop-class="card-ghost-drop"
        @drag-end="onDragEnd">
        <Draggable v-for="item in items" :key="item.id">
          <div class="draggable-item">
            {{ item.data }}
          </div>
        </Draggable>
      </Container>
    </div>

    <div class="group">
      <Container
        @drop="onDrop(items2, $event)"
        orientation="vertical"
        group-name="1"
        :get-child-payload="getChildPayload2"
        :drop-placeholder="dropPlaceholderOptions"
        drag-class="card-ghost"
        drop-class="card-ghost-drop"
        @drag-end="onDragEnd">
        <Draggable v-for="item in items2" :key="item.id">
          <div class="draggable-item">
            {{ item.data }}
          </div>
        </Draggable>
      </Container>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { Container, Draggable } from "vue-dndrop";

function generateItems(count, creator) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(creator(i));
  }
  return result;
}

let items = reactive(generateItems(8, (i) => ({ id: i, data: "任务 " + i })));
let items2 = reactive([]);
let upperDropPlaceholderOptions = reactive({
  className: "drop-preview",
  animationDuration: "150",
  showOnTop: true,
});
let dropPlaceholderOptions = reactive({
  className: "cards-drop-preview",
  animationDuration: "150",
  showOnTop: true,
});

function onDrop(collection, dropResult) {
  const { removedIndex, addedIndex, payload, element } = dropResult;
  console.log(removedIndex, addedIndex, payload, element);

  if (removedIndex === null && addedIndex === null) return;
  let itemToAdd = payload;
  if (removedIndex !== null) {
    [itemToAdd] = collection.splice(removedIndex, 1);
  }
  if (addedIndex !== null) {
    collection.splice(addedIndex, 0, itemToAdd);
  }
}

function getChildPayload1(index) {
  return items[index];
}

function getChildPayload2(index) {
  return items2[index];
}

function onDragEnd(dropResult) {
  const { isSource, payload, willAcceptDrop } = dropResult;
}
</script>

<style lang="less" scoped>
.kanban {
  display: flex;
  justify-content: center;
}

.draggable-item {
  flex-direction: row !important;
  justify-content: space-between;
  text-align: center;
  background-color: #fff;
  border: 1px solid rgba(89, 123, 160, 0.667);
  border-left-color: rgba(89, 123, 160, 0.667);
  border-left-style: solid;
  border-left-width: 1px;
  border-left: 5px solid #42b883;
  margin: 5px 20px;
  padding: 1rem 0;
  cursor: pointer;
  border-radius: 4px;
  min-width: 200px;
}

.group {
  min-width: 250px;
  min-height: calc(600px);
  border: 1px solid #42b883;
  border-radius: 4px;
  margin: 0 10px 20px;
}
</style>

<style>
.dndrop-container {
  min-height: 80px !important;
}

.cards-drop-preview {
  margin: 5px 20px;
  background-color: rgba(150, 150, 200, 0.1);
  border: 1px dashed #abc;
  border-radius: 4px;
}

.card-ghost {
  transition: transform 0.18s ease;
  transform: rotate(5deg);
}

.card-ghost-drop {
  transition: transform 0.18s ease-in-out;
  transform: rotate(0deg);
}
</style>

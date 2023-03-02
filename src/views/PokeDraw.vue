<template>
  <div class="pokedraw-container container rel">
    <PdcLogo />
    <div class="topic">
      <h2 class="topic-pokemonName">題目: 勇基拉</h2>
      <p class="topic-description">勇基拉是一隻拿著湯匙的怪咖寶可夢</p>
      <p class="topic-color">主色: 黃色</p>
    </div>
    <div class="sidebar">
      <div
        v-for="color in colors"
        :key="color"
        class="button"
        :style="{ background: color }"
        @click="setColor(color)"
      >
        <span v-show="currentColor === color" class="color-selected">✔</span>
      </div>
      <div @click="undo" class="button button-border">
        <font-awesome-icon icon="fa-solid fa-rotate-left" />
      </div>
      <div @click="redo" class="button button-border">
        <font-awesome-icon icon="fa-solid fa-rotate-right" />
      </div>
      <div
        :class="{ 'eraser-selected': currentColor === '#ffffff' }"
        @click="setColor('#ffffff')"
        class="button button-border"
      >
        <font-awesome-icon icon="fa-solid fa-eraser" />
      </div>
      <div @click="allClear" class="button button-border">
        <font-awesome-icon icon="fa-regular fa-file" />
      </div>
    </div>
    <div ref="canvasContainer" class="canvas-container">
      <canvas
        @touchmove.prevent
        @pointerdown="handleMouseDown"
        @pointermove="handleMouseMove"
        @pointerup="handleMousUp"
        ref="pokeCanvas"
        class="pokeCanvas"
      ></canvas>
    </div>
    <div class="timeBar-outer"><div class="timeBar-inner"></div></div>
  </div>
</template>

<script setup>
import PdcLogo from "../components/PdcLogo.vue";
import { ref, reactive, onMounted } from "vue";

const colors = reactive([
  "#325BC5",
  "#F42A35",
  "#FAD0DE",
  "#FFA200",
  "#946D9B",
  "#FFD500",
  "#875E37",
  "#A8BF12",
  "#8E969B",
  "#2EB52F",
  "#000000",
  "#00AAB5",
]);

// 畫板相關
const pokeCanvas = ref("pokeCanvas");
let ctx = reactive({});
const canvasContainer = ref("canvasContainer");
let isMouseDown = ref(false);
let lastX = 0;
let lastY = 0;
let currentColor = ref("#000000");
let undoList = reactive([]);
let redoList = reactive([]);

function initCanvas() {
  ctx = pokeCanvas.value.getContext("2d");
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 10;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}
function resizeCanvas() {
  pokeCanvas.value.width = canvasContainer.value.getBoundingClientRect().width;
  pokeCanvas.value.height = window.innerHeight * 0.7;
}
function handleMouseDown(e) {
  isMouseDown.value = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
}
function handleMouseMove(e) {
  if (isMouseDown.value) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    lastX = e.offsetX;
    lastY = e.offsetY;
  }
}
function handleMousUp() {
  isMouseDown.value = false;
  saveHistory();
}
function saveHistory() {
  redoList = [];
  undoList.push(pokeCanvas.value.toDataURL());
}
function undo() {
  redoList.push(undoList.pop());
  const img = new Image();
  img.src = undoList[undoList.length - 1];
  img.onload = () => {
    allClear();
    ctx.drawImage(img, 0, 0, pokeCanvas.value.width, pokeCanvas.value.height);
  };
}
function redo() {
  const img = new Image();
  img.src = redoList[redoList.length - 1];
  img.onload = () => {
    allClear();
    ctx.drawImage(img, 0, 0, pokeCanvas.value.width, pokeCanvas.value.height);
    undoList.push(redoList.pop());
  };
}
function allClear() {
  ctx.clearRect(0, 0, pokeCanvas.value.width, pokeCanvas.value.height);
}
function setColor(color) {
  currentColor.value = color;
  ctx.strokeStyle = color;

  if (color === "#ffffff") {
    ctx.lineWidth = 50;
  } else {
    ctx.lineWidth = 10;
  }
}

window.addEventListener("resize", resizeCanvas);
onMounted(() => {
  resizeCanvas();
  initCanvas();
  saveHistory();
});
</script>

<style scoped>
.pokedraw-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 49px;
  background: #fff;
}
.topic {
  background: #163a38;
  color: #fff;
  border-radius: 15px;
  padding: 1rem;
  max-width: 250px;
  position: absolute;
  top: 20px;
  left: 20px;
}
.pokeCanvas {
  border: 1px solid red;
}
.sidebar {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  grid-template-columns: 50px 50px;
  gap: 1rem;
  background: #f4efd2;
  padding: 1rem;
  border-radius: 20px;
}
.button {
  width: 50px;
  height: 50px;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.button-border {
  background: #d9d9d9;
  color: #525252;
  font-size: 1.5rem;
}
.color-selected {
  color: #fff;
  font-size: 1.5rem;
}
.eraser-selected {
  border: 2px solid #008000;
}
.timeBar-outer {
  background: #449641;
  width: 95%;
  height: 20px;
  border-radius: 15px;
  margin: auto;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 5px;
}
.timeBar-inner {
  background: #f4efd2;
  width: 73%;
  height: 10px;
  border-radius: 15px;
}

@media (min-width: 1800px) {
  .pokedraw-container {
    max-width: 1600px;
  }
}
</style>

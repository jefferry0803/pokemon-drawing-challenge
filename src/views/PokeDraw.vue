<template>
  <div class="pokedraw-container container rel">
    <div class="topic">
      <template v-if="isPokemonLoading">
        <BaseSpinner />
      </template>
      <template v-else>
        <h2 class="topic-pokemonName">題目: {{ pokemonName || '???' }}</h2>
        <div class="topic-extraInfo" :class="{ myCollapse: isTopicCollapse }">
          <p class="topic-description">
            {{ pokemonDesc || '???' }}
          </p>
          <p class="topic-color">主色: {{ pokemonColor || '???' }}</p>
        </div>
        <div class="topic-collapseBtn" @click="toggleTopic">
          {{ topicCollapseBtn }}
        </div>
      </template>
    </div>
    <div class="sidebar" :class="{ hide: !isSidebarShow }">
      <div class="sidebar-hideBtn" @click="toggleSidebar">
        {{ hideSidebarBtn }}
      </div>
      <div
        v-for="color in paletteColors"
        :key="color"
        class="button"
        :style="{ background: color }"
        @click="setColor(color)"
      >
        <span v-show="currentColor === color" class="color-selected">✔</span>
      </div>
      <div class="button button-function" @click="undo">
        <font-awesome-icon icon="fa-solid fa-rotate-left" />
      </div>
      <div class="button button-function" @click="redo">
        <font-awesome-icon icon="fa-solid fa-rotate-right" />
      </div>
      <div
        :class="{ 'eraser-selected': currentColor === '#ffffff' }"
        class="button button-function"
        @click="setColor('#ffffff')"
      >
        <font-awesome-icon icon="fa-solid fa-eraser" />
      </div>
      <div class="button button-function" @click="allClear">
        <font-awesome-icon icon="fa-regular fa-file" />
      </div>
    </div>
    <div ref="canvasContainer" class="canvas-container">
      <canvas
        ref="pokeCanvas"
        class="pokeCanvas"
        @touchmove.prevent
        @pointerdown.prevent="handleMouseDown"
        @pointermove.prevent="handleMouseMove"
        @pointerup.prevent="handleMousUp"
      />
    </div>
    <div class="timeBar-outer">
      <div
        :style="{ width: Math.floor((secondsLeft / 60) * 100) + '%' }"
        class="timeBar-inner"
      />
    </div>
    <BaseModal ref="startModal">
      <template #title> 遊戲規則 </template>
      <template #content>
        系統會隨機產生一種寶可夢，請在限時1分鐘以內畫出來!
      </template>
      <template #footer-buttons>
        <button type="button" class="btn btn-lg green-btn" @click="getPokemon">
          我了解了
        </button>
      </template>
    </BaseModal>
    <ResultModal
      ref="resultModal"
      :pokemon-img-url="pokemonImgUrl"
      :pokemon-draw-url="pokemonDrawUrl"
      :pokemon-name="pokemonName"
      @reset="reset"
      @to-draw-history="router.push({ path: '/history' })"
    />
    <LoadingDots v-if="isSavingResult" :title="'結果儲存中'" />
  </div>
</template>

<script setup>
import BaseModal from '../components/BaseModal.vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import ResultModal from '../components/ResultModal.vue';
import LoadingDots from '../components/LoadingDots.vue';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import useCanvas from '../composables/canvas.js';
import usePokeApi from '../composables/pokeApi.js';
import { useUserStore } from '../stores/user';
import router from '../router';
import { apiCreatePainting } from '@/api/painting';

const { paletteColors } = useCanvas();
const { getLanguageContent, getColorChineseName } = usePokeApi();
const userStore = useUserStore();

// 遊戲機制相關
let secondsLeft = ref(60);
let timer = ref(null);
const startModal = ref(null);
const resultModal = ref(null);
let isSavingResult = ref(false);

/**
 * 開始計時
 */
function startTimer() {
  timer.value = setInterval(() => {
    if (secondsLeft.value <= 0) {
      clearInterval(timer.value);
      timesUp();
      return;
    }
    secondsLeft.value--;
  }, 1000);
}

/**
 * 時間到
 */
async function timesUp() {
  handleMousUp();
  ctx.value.globalCompositeOperation = 'destination-over';
  ctx.value.fillStyle = '#fff';
  ctx.value.fillRect(0, 0, pokeCanvas.value.width, pokeCanvas.value.height);
  pokemonDrawUrl.value = pokeCanvas.value.toDataURL();

  if (userStore.token) {
    isSavingResult.value = true;
    const response = await saveResult();
    isSavingResult.value = false;
    const paintingId = response._key.path.segments[1];
    resultModal.value.showModal(paintingId);
  } else {
    resultModal.value.showModal();
  }
}

/**
 * 重置遊戲
 */
function reset() {
  getPokemon();
  secondsLeft.value = 60;
  undoList.value = [];
  redoList.value = [];
  allClear();
  setColor('#000000');
  ctx.value.globalCompositeOperation = 'source-over';
}
/**
 * 儲存結果到資料庫
 * @returns {Promise} 返回儲存結果的 Promise
 */
function saveResult() {
  return apiCreatePainting({
    paintingUrl: pokemonDrawUrl.value,
    pokemonName: pokemonName.value,
    userId: userStore.userId,
    username: userStore.username,
    isShared: false,
  });
}

// 寶可夢
let pokemonId = ref('');
let pokemonName = ref('');
let pokemonDesc = ref('');
let pokemonColor = ref('');
let pokemonImgUrl = ref('');
let pokemonDrawUrl = ref('');
let isPokemonLoading = ref(false);

/**
 * 取得寶可夢資料
 */
function getPokemon() {
  isPokemonLoading.value = true;
  startModal.value.hideModal();
  pokemonId.value = getRandomNum(905);
  axios
    .get('https://pokeapi.co/api/v2/pokemon-species/' + pokemonId.value)
    .then((res) => {
      const names = res.data.names;
      const descs = res.data.flavor_text_entries;
      const color = res.data.color.name;

      pokemonName.value = getLanguageContent(names, 'zh-Hant').name;
      pokemonColor.value = getColorChineseName(color);
      const chDesc = getLanguageContent(descs, 'zh-Hant').flavor_text;
      pokemonDesc.value = chDesc ? chDesc.replace(/\s+/g, '') : '';
      pokemonImgUrl.value = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId.value}.png`;

      isPokemonLoading.value = false;
      startTimer();
    });
}
/**
 * 依照範圍取得隨機數
 * @param {number} range 範圍(最大數字)
 */
function getRandomNum(range) {
  return Math.floor(Math.random() * range) + 1;
}

// 畫板相關
const pokeCanvas = ref(null);
let ctx = ref(null);
const canvasContainer = ref('canvasContainer');
let isMouseDown = ref(false);
let lastX = 0;
let lastY = 0;
let currentColor = ref('#000000');
let undoList = ref([]);
let redoList = ref([]);
let isSidebarShow = ref(true);
let isTopicCollapse = ref(false);

function initCanvas() {
  ctx.value = pokeCanvas.value.getContext('2d');
  ctx.value.strokeStyle = currentColor;
  ctx.value.lineWidth = 10;
  ctx.value.lineJoin = 'round';
  ctx.value.lineCap = 'round';
}
function resizeCanvas() {
  pokeCanvas.value.width = canvasContainer.value.getBoundingClientRect().width;
  pokeCanvas.value.height = window.innerHeight * 0.7;
}
function handleMouseDown(e) {
  isMouseDown.value = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
  if (isMouseDown.value) {
    ctx.value.beginPath();
    ctx.value.moveTo(lastX, lastY);
    ctx.value.lineTo(e.offsetX, e.offsetY);
    ctx.value.stroke();
  }
}
function handleMouseMove(e) {
  if (isMouseDown.value) {
    ctx.value.beginPath();
    ctx.value.moveTo(lastX, lastY);
    ctx.value.lineTo(e.offsetX, e.offsetY);
    ctx.value.stroke();

    lastX = e.offsetX;
    lastY = e.offsetY;
  }
}
function handleMousUp() {
  isMouseDown.value = false;
  saveHistory();
}
function saveHistory() {
  redoList.value = [];
  undoList.value.push(pokeCanvas.value.toDataURL());
}
function undo() {
  if (undoList.value.length <= 1) {
    return;
  }
  redoList.value.push(undoList.value.pop());
  const img = new Image();
  img.src = undoList.value[undoList.value.length - 1];
  img.onload = () => {
    ctx.value.clearRect(0, 0, pokeCanvas.value.width, pokeCanvas.value.height);
    ctx.value.drawImage(
      img,
      0,
      0,
      pokeCanvas.value.width,
      pokeCanvas.value.height,
    );
  };
}
function redo() {
  if (redoList.value.length <= 0) {
    return;
  }
  const img = new Image();
  img.src = redoList.value[redoList.value.length - 1];
  img.onload = () => {
    ctx.value.clearRect(0, 0, pokeCanvas.value.width, pokeCanvas.value.height);
    ctx.value.drawImage(
      img,
      0,
      0,
      pokeCanvas.value.width,
      pokeCanvas.value.height,
    );
    undoList.value.push(redoList.value.pop());
  };
}
function allClear() {
  ctx.value.clearRect(0, 0, pokeCanvas.value.width, pokeCanvas.value.height);
  saveHistory();
}
function setColor(color) {
  currentColor.value = color;
  ctx.value.strokeStyle = color;

  if (color === '#ffffff') {
    ctx.value.lineWidth = 50;
  } else {
    ctx.value.lineWidth = 10;
  }
}
function toggleSidebar() {
  isSidebarShow.value = !isSidebarShow.value;
}
function toggleTopic() {
  isTopicCollapse.value = !isTopicCollapse.value;
}
const hideSidebarBtn = computed(() => {
  return isSidebarShow.value ? '▶' : '◀';
});
const topicCollapseBtn = computed(() => {
  return isTopicCollapse.value ? '▼' : '▲';
});

window.addEventListener('resize', resizeCanvas);
onMounted(() => {
  startModal.value.showModal();
  resizeCanvas();
  initCanvas();
  saveHistory();
});
onUnmounted(() => {
  clearInterval(timer.value);
  window.removeEventListener('resize', resizeCanvas);
});
</script>

<style scoped>
.pokedraw-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 0 49px 49px 49px;
  background: #fff;
  overflow: hidden;
}
.topic {
  background: var(--dark-green);
  color: #fff;
  border-radius: 15px;
  padding: 1rem;
  max-width: 250px;
  position: absolute;
  top: 20px;
  left: 20px;
}
.topic-extraInfo {
  overflow: hidden;
  max-height: 500px;
  max-width: 600px;
  transition: all 0.5s linear;
}
.topic-extraInfo.myCollapse {
  max-height: 0;
  max-width: 0;
}
.topic-collapseBtn {
  color: #fff;
  text-align: center;
  cursor: pointer;
}
.sidebar {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  grid-template-columns: 50px 50px;
  gap: 1rem;
  background: var(--sand);
  padding: 1rem;
  border-radius: 20px;
  transition: all 0.5s ease;
}
.sidebar.hide {
  transform: translate(calc(100% + 20px), -50%);
}
.sidebar-hideBtn {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-100%, -50%);
  width: 20px;
  height: 70px;
  line-height: 70px;
  text-align: center;
  background: var(--sand);
  color: var(--dark-grey-text);
  border-radius: 70px 0 0 70px;
  cursor: pointer;
}
.sidebar-hideBtn:active,
.button:active,
.topic-collapseBtn:active {
  filter: brightness(85%);
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
.green-btn {
  background: var(--green);
  color: #fff;
}
.button-function {
  background: #d9d9d9;
  color: var(--dark-grey-text);
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
  background: var(--green);
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
  background: var(--sand);
  height: 10px;
  border-radius: 15px;
  transition: all 1s linear;
}

@media (max-width: 576px) {
  .topic {
    padding: 0.75rem;
  }
}
</style>

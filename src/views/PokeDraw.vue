<template>
  <div class="pokedraw-container container">
    <div class="position:relative">
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
      <!-- 側邊欄 -->
      <div class="sidebar d:flex gap:16px" :class="{ hide: !isSidebarShow }">
        <div class="sidebar-hideBtn" @click="toggleSidebar">
          {{ hideSidebarBtn }}
        </div>
        <PdcSlider v-model="currentLineWidth" orientation="vertical">
          <template #prepend>
            <div>100</div>
            <div class="w:25px h:25px bg:$(white) r:50% mb:8px"></div>
          </template>
          <template #append>
            <div class="w:10px h:10px bg:$(white) r:50% mt:8px"></div>
            <div>1</div>
          </template>
        </PdcSlider>
        <div
          class="d:grid grid-template-columns:repeat(2,50px)@3xl grid-template-columns:repeat(3,50px) gap:1rem"
        >
          <div
            v-for="color in paletteColors"
            :key="color"
            class="button"
            :style="{ background: color }"
            @click="setColor(color)"
          >
            <span
              v-show="
                currentColor === color &&
                (currentTool === TOOLS.BRUSH || currentTool === TOOLS.FILL)
              "
              class="color-selected"
              >✔</span
            >
          </div>
          <div class="button button-function" @click="undo">
            <PdcIcon icon="undo-rounded" />
          </div>
          <div class="button button-function" @click="redo">
            <PdcIcon icon="redo-rounded" />
          </div>
          <div
            class="button button-function"
            :class="{ 'tool-selected': currentTool === TOOLS.BRUSH }"
            @click="setTool(TOOLS.BRUSH)"
          >
            <PdcIcon icon="brush" icon-prefix="mdi" />
          </div>
          <div
            class="button button-function"
            :class="{ 'tool-selected': currentTool === TOOLS.FILL }"
            @click="setTool(TOOLS.FILL)"
          >
            <PdcIcon icon="paint-bucket" icon-prefix="mdi" />
          </div>
          <div
            :class="{ 'tool-selected': currentTool === TOOLS.ERASER }"
            class="button button-function"
            @click="setTool(TOOLS.ERASER)"
          >
            <PdcIcon icon="ink-eraser-rounded" />
          </div>
          <div class="button button-function" @click="allClear">
            <PdcIcon icon="trash-can" icon-prefix="mdi" />
          </div>
        </div>
      </div>
      <!-- 畫板 -->
      <div ref="canvasContainer" class="canvas-container">
        <canvas
          ref="pokeCanvas"
          class="pokeCanvas"
          @touchmove.prevent
          @pointerdown.prevent="handleMouseDown"
          @pointermove.prevent="handleMouseMove"
          @pointerup.prevent="handleMouseUp"
        />
      </div>
      <div class="timeBar-outer">
        <div
          :style="{ width: Math.floor((secondsLeft / 60) * 100) + '%' }"
          class="timeBar-inner"
        />
      </div>
      <!-- 開始提示 modal -->
      <BaseModal ref="startModal">
        <template #title> 遊戲規則 </template>
        <template #content>
          系統會隨機產生一種寶可夢，請在限時1分鐘以內畫出來!
        </template>
        <template #footer-buttons>
          <button
            type="button"
            class="btn btn-lg green-btn"
            @click="getPokemon"
          >
            我了解了
          </button>
        </template>
      </BaseModal>
      <!-- 結果 modal -->
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
  </div>
</template>

<script setup>
import BaseModal from '../components/BaseModal.vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import ResultModal from '../components/ResultModal.vue';
import LoadingDots from '../components/LoadingDots.vue';
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import useCanvas from '../composables/canvas.js';
import { useUserStore } from '../stores/user';
import router from '../router';
import { apiCreatePainting } from '@/api/painting';
import PdcIcon from '@/components/PdcIcon.vue';
import PdcSlider from '@/components/PdcSlider.vue';
import { apiGetPokemon } from '@/api/pokemon';

const { paletteColors } = useCanvas();
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
  handleMouseUp();
  ctx.value.globalCompositeOperation = 'destination-over';
  ctx.value.fillStyle = '#fff';
  ctx.value.fillRect(0, 0, pokeCanvas.value.width, pokeCanvas.value.height);
  pokemonDrawUrl.value = pokeCanvas.value.toDataURL();

  if (userStore.isLogin) {
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
    pokemonId: pokemonId.value.toString(),
    pokemonIdNumber: parseInt(pokemonId.value, 10),
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
async function getPokemon() {
  isPokemonLoading.value = true;
  startModal.value.hideModal();
  pokemonId.value = getRandomNum(905).toString();

  const databasePokemonId = pokemonId.value.padStart(4, '0');
  const pokemonSnap = await apiGetPokemon(databasePokemonId);
  const data = pokemonSnap.data();

  pokemonName.value = data.chName;
  pokemonColor.value = data.color;
  pokemonDesc.value = data.description;
  pokemonImgUrl.value = `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${pokemonId.value.padStart(3, '0')}.png`;
  isPokemonLoading.value = false;
  startTimer();
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
const currentLineWidth = ref([10]);
const TOOLS = {
  BRUSH: 'brush',
  FILL: 'fill',
  ERASER: 'eraser',
};

const currentTool = ref(TOOLS.BRUSH);

function initCanvas() {
  ctx.value = pokeCanvas.value.getContext('2d');
  ctx.value.strokeStyle = currentColor.value;
  ctx.value.lineWidth = currentLineWidth.value[0];
  ctx.value.lineJoin = 'round';
  ctx.value.lineCap = 'round';
}
function resizeCanvas() {
  pokeCanvas.value.width = canvasContainer.value.getBoundingClientRect().width;
  pokeCanvas.value.height = window.innerHeight * 0.7;
}
function handleMouseDown(e) {
  const rect = pokeCanvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 油漆桶工具，確保座標在 canvas 範圍內
  if (currentTool.value === TOOLS.FILL) {
    if (
      x >= 0 &&
      x < pokeCanvas.value.width &&
      y >= 0 &&
      y < pokeCanvas.value.height
    ) {
      floodFill(Math.floor(x), Math.floor(y), currentColor.value);
    }
    return;
  }

  // 其他工具的處理
  isMouseDown.value = true;
  lastX = x;
  lastY = y;
  if (isMouseDown.value) {
    ctx.value.beginPath();
    ctx.value.moveTo(lastX, lastY);
    ctx.value.lineTo(x, y);
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
function handleMouseUp() {
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
  if (currentTool.value !== TOOLS.BRUSH && currentTool.value !== TOOLS.FILL)
    return;
  currentColor.value = color;
  ctx.value.strokeStyle = color;
}
/**
 * 設置目前工具
 * @param tool {string} 畫筆工具類型
 */
function setTool(tool) {
  currentTool.value = tool;
  if (tool === TOOLS.ERASER) {
    currentLineWidth.value = [50];
    ctx.value.lineWidth = 50;
    ctx.value.strokeStyle = '#ffffff';
  } else {
    currentLineWidth.value = [10];
    ctx.value.lineWidth = 10;
    ctx.value.strokeStyle = currentColor.value;
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
/**
 * 油漆桶填充
 * @param {number}startX
 * @param {number} startY
 * @param {string} fillColor
 */
function floodFill(startX, startY, fillColor) {
  const imageData = ctx.value.getImageData(
    0,
    0,
    pokeCanvas.value.width,
    pokeCanvas.value.height,
  );
  const pixels = imageData.data;

  // 獲取起始點的顏色
  const startPos = (startY * pokeCanvas.value.width + startX) * 4;
  const startR = pixels[startPos];
  const startG = pixels[startPos + 1];
  const startB = pixels[startPos + 2];
  const startA = pixels[startPos + 3];

  // 轉換目標填充顏色
  const fillRGB = hexToRgb(fillColor);
  if (!fillRGB) return;

  // 使用隊列來實現填充
  const queue = [[startX, startY]];
  const visited = new Set();

  /**
   *
   * @param {number} x x 座標
   * @param {number} y y 座標
   */
  function checkPixel(x, y) {
    if (
      x < 0 ||
      x >= pokeCanvas.value.width ||
      y < 0 ||
      y >= pokeCanvas.value.height
    ) {
      return false;
    }

    const pos = (y * pokeCanvas.value.width + x) * 4;
    const key = `${x},${y}`;
    if (visited.has(key)) return false;

    // 檢查顏色是否相近（允許一些誤差）
    const isSimilar =
      Math.abs(pixels[pos] - startR) < 10 &&
      Math.abs(pixels[pos + 1] - startG) < 10 &&
      Math.abs(pixels[pos + 2] - startB) < 10 &&
      Math.abs(pixels[pos + 3] - startA) < 10;

    return isSimilar;
  }

  while (queue.length) {
    const [x, y] = queue.shift();
    const key = `${x},${y}`;
    if (visited.has(key)) continue;

    visited.add(key);
    const pos = (y * pokeCanvas.value.width + x) * 4;

    // 設置新顏色
    pixels[pos] = fillRGB.r;
    pixels[pos + 1] = fillRGB.g;
    pixels[pos + 2] = fillRGB.b;
    pixels[pos + 3] = 255;

    // 檢查四個方向
    if (checkPixel(x + 1, y)) queue.push([x + 1, y]);
    if (checkPixel(x - 1, y)) queue.push([x - 1, y]);
    if (checkPixel(x, y + 1)) queue.push([x, y + 1]);
    if (checkPixel(x, y - 1)) queue.push([x, y - 1]);
  }

  ctx.value.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

watch(
  () => currentLineWidth.value,
  (newValue) => {
    if (ctx.value) {
      ctx.value.lineWidth = newValue[0];
    }
  },
);

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
  transform: translateY(calc(-50% - 10px));
  background: var(--sand);
  padding: 1rem;
  border-radius: 20px;
  transition: all 0.5s ease;
  max-height: calc(100% - 60px);
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
.tool-selected {
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

<template>
  <div class="drawHistory-container container">
    <BaseSpinner v-if="isLoading" class="spinner" />
    <h1 class="drawHistory-title">繪畫紀錄</h1>
    <div class="paintings-container">
      <template v-for="painting in paintingList" :key="painting.id">
        <div
          :style="{ backgroundImage: `url(${painting.paintingUrl})` }"
          class="painting"
          @click="setFocusImage(painting.paintingUrl)"
        >
          <div class="pokemonName painting-text">
            {{ painting.pokemonName }}
          </div>
          <div class="painting-btns">
            <div
              class="downloadBtn painting-text painting-btn"
              @click.stop="
                downloadPainting(painting.paintingUrl, painting.pokemonName)
              "
            >
              下載
            </div>
            <div
              class="deleteBtn painting-text painting-btn"
              @click.stop="deletePainting(painting.id)"
            >
              刪除
            </div>
            <div
              class="shareBtn painting-text painting-btn"
              :class="{ shared: painting.isShared }"
              @click.stop="toggleIsShared(painting.id, painting.isShared)"
            >
              <span>{{ getShareBtnText(painting.isShared) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
    <ImageModal ref="imageModal" :image-url="focusImageUrl" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ImageModal from '../components/ImageModal.vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import { useUserStore } from '../stores/user';
import { where, orderBy } from 'firebase/firestore';
import {
  apiGetPaintingList,
  apiDeletePainting,
  apiUpdatePainting,
} from '@/api/painting';

const userStore = useUserStore();

let paintingList = ref([]);
let isLoading = ref(false);
let focusImageUrl = ref('');
const imageModal = ref(null);

/**
 * 取得繪畫紀錄列表
 */
async function getPaintings() {
  isLoading.value = true;

  const filter = where('userId', '==', userStore.userId);
  const sort = orderBy('created', 'desc');

  const querySnapshot = await apiGetPaintingList(filter, sort);
  let fbPaintings = [];

  querySnapshot.forEach((doc) => {
    const painting = {
      id: doc.id,
      isShared: doc.data().isShared,
      paintingUrl: doc.data().paintingUrl,
      pokemonName: doc.data().pokemonName,
      userId: doc.data().userId,
      username: doc.data().username,
    };
    fbPaintings.push(painting);
  });

  paintingList.value = fbPaintings;
  isLoading.value = false;
}

/**
 * 刪除繪畫
 * @param {string} id 繪畫 id
 */
async function deletePainting(id) {
  await apiDeletePainting(id);
  getPaintings();
}

/**
 * 切換繪畫分享狀態
 * @param {string} paintingId 繪畫 id
 * @param {boolean} isShared 目前分享狀態
 */
async function toggleIsShared(paintingId, isShared) {
  await apiUpdatePainting(paintingId, {
    isShared: !isShared,
  });

  getPaintings();
}

/**
 * 下載繪畫圖檔
 * @param {string} url 繪畫圖片檔 url
 * @param {string} fileName 檔名
 */
function downloadPainting(url, fileName) {
  let a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'default.png';
  a.dispatchEvent(new MouseEvent('click'));
}

/**
 * 設定聚焦圖片並顯示彈窗
 * @param {string} url 繪畫圖片檔 url
 */
function setFocusImage(url) {
  focusImageUrl.value = url;
  imageModal.value.showModal();
}

/**
 * 取得分享按鈕的文字
 * @param {boolean} isShared 分享狀態
 */
function getShareBtnText(isShared) {
  return isShared ? '已分享' : '分享到畫廊';
}

onMounted(() => {
  getPaintings();
});
</script>

<style scoped>
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.drawHistory-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 0 49px 49px 49px;
  background: var(--sand);
  height: 75vh;
  padding: 1rem;
  position: relative;
}
.drawHistory-title {
  text-align: center;
  height: 7%;
}
.paintings-container {
  width: 100%;
  height: 93%;
  overflow: auto;
  padding-right: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
.painting {
  border: 3px solid #000;
  border-radius: 25px;
  position: relative;
  height: 450px;
  background-size: cover;
  background-position: center;
  cursor: zoom-in;
}
.painting:hover .painting-btns {
  display: flex;
}
.painting-text {
  border-radius: 15px;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  width: max-content;
}
.pokemonName {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--dark-green);
  color: #fff;
}
.painting-btns {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
  display: none;
}
.painting-btn {
  color: #fff;
  cursor: pointer;
}
.shareBtn {
  background: var(--pokemon-blue);
}
.deleteBtn {
  background: #e90000;
}
.downloadBtn {
  background: var(--green);
}
.shareBtn:hover {
  background: #38609f;
}
.deleteBtn:hover {
  background: #bd0000;
}
.shareBtn.shared {
  background: grey;
}
.shareBtn.shared:hover > span {
  display: none;
}
.shareBtn.shared:hover::before {
  content: '取消分享';
}
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  -webkit-border-radius: 10px;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  -webkit-border-radius: 4px;
  border-radius: 4px;
  background: var(--dark-green);
}
@media (min-width: 1200px) {
  .paintings-container {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 768px) {
  .drawHistory-container {
    padding: 2rem 5rem;
  }
}
@media (max-width: 768px) {
  .paintings-container {
    padding-right: 0.5rem;
  }
  .painting {
    height: 400px;
  }
  .painting-text {
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
  }
  .painting-btns {
    display: flex;
  }
}
@media (max-width: 576px) {
  .painting {
    height: 300px;
  }
}
</style>

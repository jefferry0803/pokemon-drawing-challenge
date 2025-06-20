<template>
  <div class="gallery-container container">
    <BaseSpinner v-if="isLoading" class="spinner" />
    <h1 class="gallery-title">公共畫廊</h1>
    <div class="paintings-container">
      <template v-for="painting in paintingList" :key="painting.id">
        <div
          :style="{ backgroundImage: `url(${painting.paintingUrl})` }"
          class="painting"
          @click="setFocusImage(painting.paintingUrl)"
        >
          <div class="painting-title">
            {{ painting.username }} 畫的 {{ painting.pokemonName }}
          </div>
        </div>
      </template>
    </div>
    <ImageModal ref="imageModal" :image-url="focusImageUrl" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import ImageModal from '../components/ImageModal.vue';
import { where, orderBy } from 'firebase/firestore';
import { apiGetPaintingList } from '@/api/painting';

// TODO: 定義 Painting 類型
// type Painting {
//   id: string;
//   paintingUrl: string;
//   pokemonName: string;
//   userId: string;
//   username: string;
//   isShared?: boolean;
//   created?: Date;
// }

let paintingList = ref([]);
let isLoading = ref(false);
let focusImageUrl = ref('');
const imageModal = ref(null);

/**
 * 取得公開繪畫列表
 */
async function getPaintings() {
  isLoading.value = true;

  const filter = where('isShared', '==', true);
  const sort = orderBy('created', 'desc');

  const querySnapshot = await apiGetPaintingList(filter, sort);

  let fbPaintings = [];

  querySnapshot.forEach((doc) => {
    const painting = {
      id: doc.id,
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
 * 設定聚焦圖片並顯示彈窗
 * @param {string} url 繪畫圖片檔 url
 */
function setFocusImage(url) {
  focusImageUrl.value = url;
  imageModal.value.showModal();
}

onMounted(() => {
  getPaintings();
});
</script>

<style scoped>
.gallery-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 0 49px 49px 49px;
  background: var(--sand);
  height: 75vh;
  padding: 1rem;
  position: relative;
}
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.gallery-title {
  text-align: center;
  height: 7%;
}

.paintings-container {
  height: 93%;
  overflow: auto;
  padding-right: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
.painting {
  position: relative;
  border: 3px solid #000;
  border-radius: 25px;
  height: 450px;
  background-size: cover;
  background-position: center;
  cursor: zoom-in;
}
.painting-title {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--dark-green);
  color: #fff;
  border-radius: 15px;
  font-size: 1.5rem;
  padding: 0.25rem 1rem;
  white-space: nowrap;
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
  .gallery-container {
    padding: 2rem 5rem;
  }
}
@media (max-width: 768px) {
  .painting {
    height: 400px;
  }
  .paintings-container {
    padding-right: 0.5rem;
  }
  .painting-title {
    font-size: 1rem;
  }
}
@media (max-width: 576px) {
  .painting {
    height: 300px;
  }
}
</style>

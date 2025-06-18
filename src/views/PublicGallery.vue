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
          <!--按讚按鈕 -->
          <div
            class="position:absolute bottom:10px left:10px d:flex align-items:center gap:4px"
          >
            <IconButton
              v-if="userStore.token"
              class="painting-like-btn"
              :icon="getIsLiked(painting) ? 'heart' : 'heart-outline'"
              icon-prefix="mdi"
              :size="48"
              :color="getIsLiked(painting) ? 'like-fill' : ''"
              @click="toggleLikePainting(painting.id)"
            />
            <div v-if="painting.likers" class="font-size:24px">
              {{ painting.likers.length }}
            </div>
          </div>
        </div>
      </template>
    </div>
    <ImageModal ref="imageModal" :image-url="focusImageUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import ImageModal from '../components/ImageModal.vue';
import { where, orderBy } from 'firebase/firestore';
import { apiGetPaintingList, apiGetPainting } from '@/api/painting';
import { apiAddLike, apiRemoveLike } from '@/api/like';
import IconButton from '@/components/IconButton.vue';
import { useUserStore } from '@/stores/user';
import type { createLikeData } from '@/api/like';

type Painting = {
  id: string;
  paintingUrl: string;
  pokemonName: string;
  userId: string;
  username: string;
  isShared?: boolean;
  created?: Date;
  likers?: createLikeData[];
};

const userStore = useUserStore();

let paintingList = ref<Painting[]>([]);
let isLoading = ref(false);
let focusImageUrl = ref('');
const imageModal = ref<InstanceType<typeof ImageModal> | null>(null);

/**
 * 取得公開繪畫列表
 */
async function getPaintings() {
  isLoading.value = true;

  const filter = where('isShared', '==', true);
  const sort = orderBy('created', 'desc');

  const querySnapshot = await apiGetPaintingList(filter, sort);

  let fbPaintings: Painting[] = [];

  querySnapshot.forEach((doc) => {
    const painting = {
      id: doc.id,
      paintingUrl: doc.data().paintingUrl,
      pokemonName: doc.data().pokemonName,
      userId: doc.data().userId,
      username: doc.data().username,
      likers: doc.data().likers || [],
      created: new Date(doc.data().created.seconds * 1000),
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
function setFocusImage(url: string) {
  focusImageUrl.value = url;
  if (imageModal.value) {
    imageModal.value.showModal();
  }
}

/**
 * 取得對繪畫的按讚狀態
 */
function getIsLiked(painting: Painting): boolean {
  if (!painting.likers || !userStore.userId) {
    return false;
  }
  return painting.likers.some((liker) => liker.userId === userStore.userId);
}

/**
 * 對繪畫點讚或取消點讚
 * @param {string} paintingId 繪畫 id
 */
async function toggleLikePainting(paintingId: string) {
  if (
    !paintingId ||
    !userStore.email ||
    !userStore.username ||
    !userStore.userId
  ) {
    return;
  }

  const paintingSnap = await apiGetPainting(paintingId);
  if (!paintingSnap.exists()) {
    return;
  }
  const likers = paintingSnap.data().likers || [];
  const isLiked = likers.some(
    (liker: { userId: string }) => liker.userId === userStore.userId,
  );
  const updateData = {
    userEmail: userStore.email,
    username: userStore.username,
    userId: userStore.userId,
  };

  // 如果沒按過讚就按讚，按過就取消讚
  if (!isLiked) {
    await apiAddLike(paintingId, updateData);
    getPaintings();
  } else {
    await apiRemoveLike(paintingId, updateData);
    getPaintings();
  }
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

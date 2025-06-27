<template>
  <div
    class="gallery-container container b:3px|solid|$(black) box-shadow:0px|4px|15px|rgb(23|44|120|/|20%) r:0|49px|49px|49px bg:$(sand) h:75vh pt:1rem pb:1rem position:relative"
  >
    <BaseSpinner
      v-if="isLoading && !paintingOrder.length"
      class="spinner position:absolute top:50% left:50% transform:translate(-50%,-50%)"
    />
    <h1 class="gallery-title text-align:center h:7%">公共畫廊</h1>
    <RecycleScroller
      ref="virtualScrollerRef"
      v-slot="{ item }"
      class="paintings-container h:93% overflow:auto pr:1.5rem"
      :items="paintingOrder"
      :item-size="482"
      :item-secondary-size="itemSecondarySize"
      :grid-items="gridItems"
      :buffer="900"
      @scroll-end="handleScrollToEnd"
      @resize="handleVirtualScrollerResize"
    >
      <div class="p:1rem">
        <div
          class="painting-wrapper position:relative border:3px|solid|$(black) r:25px height:450px overflow:hidden"
        >
          <!-- 繪畫標題 -->
          <div
            class="painting-title position:absolute top:10px left:50% transform:translateX(-50%) bg:$(dark-green) color:$(white) r:15px font-size:1rem font-size:1.5rem@sm p:0.25rem|1rem white-space:nowrap"
          >
            {{ paintingMap.get(item.id)?.username }} 畫的
            {{ paintingMap.get(item.id)?.pokemonName }}
          </div>
          <!-- 按讚區(登入才顯示) -->
          <div
            v-if="userStore.isLogin"
            class="position:absolute bottom:10px left:10px d:flex align-items:center gap:4px"
          >
            <IconButton
              class="painting-like-btn"
              :icon="
                getIsLiked(paintingMap.get(item.id)!)
                  ? 'heart'
                  : 'heart-outline'
              "
              icon-prefix="mdi"
              :size="48"
              :color="getIsLiked(paintingMap.get(item.id)!) ? 'like-fill' : ''"
              @click="toggleLikePainting(item.id)"
            />
            <!--按讚數 -->
            <div class="font-size:24px">
              {{ paintingMap.get(item.id)?.likers?.length ?? 0 }}
            </div>
          </div>
          <!-- 圖片 -->
          <div
            v-if="paintingMap.get(item.id)"
            :style="{
              backgroundImage: `url(${paintingMap.get(item.id)?.paintingUrl})`,
            }"
            class="painting h:100% background-size:cover background-position:center cursor:zoom-in"
            @click="setFocusImage(paintingMap.get(item.id)?.paintingUrl!)"
          ></div>
        </div>
      </div>
    </RecycleScroller>
    <ImageModal ref="imageModal" :image-url="focusImageUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import ImageModal from '../components/ImageModal.vue';
import { where, orderBy } from 'firebase/firestore';
import { apiGetPainting } from '@/api/painting';
import { apiAddLike, apiRemoveLike } from '@/api/like';
import IconButton from '@/components/IconButton.vue';
import { useUserStore } from '@/stores/user';
import type { Painting } from '@/types';
import { usePaintingList } from '@/composables/usePaintingList';

const userStore = useUserStore();

const {
  paintingMap,
  paintingOrder,
  isLoading,
  gridItems,
  itemSecondarySize,
  virtualScrollerRef,
  handleScrollToEnd,
  handleVirtualScrollerResize,
  getTotalPaintings,
  getPaintings,
} = usePaintingList(where('isShared', '==', true), orderBy('created', 'desc'));

let focusImageUrl = ref('');
const imageModal = ref<InstanceType<typeof ImageModal> | null>(null);

/**
 * 設定聚焦圖片並顯示彈窗
 * @param {string} url 繪畫圖片檔 url
 */
function setFocusImage(url: string) {
  focusImageUrl.value = url;
  imageModal.value.showModal();
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

  if (!isLiked) {
    await apiAddLike(paintingId, updateData);
  } else {
    await apiRemoveLike(paintingId, updateData);
  }
  // 取得最新的 painting 資料並更新 Map
  const updatedSnap = await apiGetPainting(paintingId);
  if (updatedSnap.exists()) {
    const updatedLikers = updatedSnap.data().likers || [];
    const painting = paintingMap.value.get(paintingId);
    if (painting) {
      painting.likers = updatedLikers;
      // 觸發響應式
      paintingMap.value.set(paintingId, { ...painting });
    }
  }
}

onMounted(() => {
  getTotalPaintings();
  getPaintings();
});
</script>

<style scoped>
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
</style>

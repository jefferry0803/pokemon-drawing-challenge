<template>
  <div
    class="gallery-container container b:3px|solid|$(black) box-shadow:0px|4px|15px|rgb(23|44|120|/|20%) r:0|49px|49px|49px bg:$(sand) h:75vh pt:1rem pb:1rem d:flex flex-direction:column"
  >
    <h1 class="gallery-title text-align:center">公共畫廊</h1>
    <div class="px:16px pb:8px d:flex gap:16px">
      <PdcFilter
        v-model="selectedUserIds"
        title="作者"
        :options="userFilterOptions"
        clearable
        searchable
      />
      <PdcFilter
        v-model="selectedPokemonIds"
        title="寶可夢"
        :options="pokemonFilterOptions"
        clearable
        searchable
        search-by-id
      />
      <SortControl
        v-model="currentSort"
        :options="[
          { label: '創建時間', value: 'createDate' },
          { label: '作者名稱', value: 'authorName' },
          { label: '寶可夢編號', value: 'pokemonId' },
          { label: '按讚數', value: 'likesCount' },
        ]"
      />
    </div>
    <!-- Loading Spinner -->
    <div class="d:flex justify-content:center align-items:center flex:1">
      <BaseSpinner v-if="isLoading && !paintingOrder.length" />
    </div>
    <Transition name="paintingList">
      <RecycleScroller
        v-if="paintingOrder.length"
        ref="virtualScrollerRef"
        v-slot="{ item }"
        class="paintings-container overflow:auto pr:1.5rem"
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
                v-if="paintingMap.get(item.id)"
                class="painting-like-btn"
                :icon="
                  getIsLiked(paintingMap.get(item.id)!)
                    ? 'heart'
                    : 'heart-outline'
                "
                icon-prefix="mdi"
                :size="48"
                :color="
                  getIsLiked(paintingMap.get(item.id)!) ? 'like-fill' : ''
                "
                @click="toggleLikePainting(item.id)"
              />
              <!--按讚數 -->
              <div class="font-size:24px">
                {{ paintingMap.get(item.id)?.likesCount ?? 0 }}
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
    </Transition>
    <!-- 無資料顯示 -->
    <div
      v-if="!isLoading && !paintingOrder.length"
      class="d:flex justify-content:center align-items:center flex:1 font-size:32px color:$(grey)"
    >
      無資料
    </div>
    <ImageModal ref="imageModal" :image-url="focusImageUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import ImageModal from '../components/ImageModal.vue';
import { where, orderBy } from 'firebase/firestore';
import { apiGetPainting } from '@/api/painting';
import { apiAddLike, apiRemoveLike } from '@/api/like';
import IconButton from '@/components/IconButton.vue';
import { useUserStore } from '@/stores/user';
import type { Painting } from '@/types';
import { usePaintingList } from '@/composables/usePaintingList';
import PdcFilter from '@/components/PdcFilter.vue';
import SortControl from '@/components/SortControl.vue';
import { apiGetUserList } from '@/api/user';
import { apiGetPokemonList } from '@/api/pokemon';
import { useDebounceFn, watchDebounced } from '@vueuse/core';

const userStore = useUserStore();

const {
  paintingMap,
  paintingOrder,
  isLoading,
  gridItems,
  itemSecondarySize,
  handleScrollToEnd,
  handleVirtualScrollerResize,
  getTotalPaintings,
  getPaintings,
  updateFilter,
  updateSort,
} = usePaintingList(
  'virtualScrollerRef',
  [where('isShared', '==', true)],
  orderBy('created', 'desc'),
);

let focusImageUrl = ref('');
const imageModal = ref<InstanceType<typeof ImageModal> | null>(null);

const userFilterOptions = ref<{ id: string; label: string }[]>([]);
const selectedUserIds = ref<string[]>([]);
const pokemonFilterOptions = ref<{ id: string; label: string }[]>([]);
const selectedPokemonIds = ref<string[]>([]);

type SortType = 'authorName' | 'pokemonId' | 'createDate' | 'likesCount';
type SortDirection = 'asc' | 'desc';

type SortState = {
  type: SortType;
  direction: SortDirection;
};

const currentSort = ref<SortState>({
  type: 'createDate', // 預設排序
  direction: 'desc', // 預設方向
});

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
    await apiAddLike(
      paintingId,
      updateData,
      paintingSnap.data().likesCount || 0,
    );
  } else {
    await apiRemoveLike(
      paintingId,
      updateData,
      paintingSnap.data().likesCount || 0,
    );
  }
  // 取得最新的 painting 資料並更新 Map
  const updatedSnap = await apiGetPainting(paintingId);
  if (updatedSnap.exists()) {
    const updatedLikers = updatedSnap.data().likers || [];
    const updatedLikesCount = updatedSnap.data().likesCount || 0;
    const painting = paintingMap.value.get(paintingId);
    if (painting) {
      painting.likers = updatedLikers;
      painting.likesCount = updatedLikesCount;
      // 觸發響應式
      paintingMap.value.set(paintingId, { ...painting });
    }
  }
}

// 監聽排序變化
watchDebounced(
  currentSort,
  () => {
    if (!currentSort.value.type || !currentSort.value.direction) {
      // 沒有排序條件時，使用預設排序
      updateSort(orderBy('created', 'desc'));
      return;
    }
    const sortField = {
      authorName: 'username',
      pokemonId: 'pokemonIdNumber',
      createDate: 'created',
      likesCount: 'likesCount',
    }[currentSort.value.type];
    updateSort(orderBy(sortField, currentSort.value.direction));
  },
  { deep: true },
);

/**
 * 設置使用者過濾選項
 */
async function setUserFilterOptions() {
  const querySnapshot = await apiGetUserList();
  userFilterOptions.value = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      label: data.username || '未知用戶',
    };
  });
}

/**
 * 設置寶可夢過濾選項
 */
async function setPokemonFilterOptions() {
  const querySnapshot = await apiGetPokemonList();
  pokemonFilterOptions.value = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.pokemonId,
      label: data.chName || '未知寶可夢',
    };
  });
}

const debounceSearch = useDebounceFn(() => {
  const filters = [where('isShared', '==', true)];

  if (selectedUserIds.value.length) {
    filters.push(where('userId', 'in', selectedUserIds.value));
  }
  if (selectedPokemonIds.value.length) {
    filters.push(where('pokemonId', 'in', selectedPokemonIds.value));
  }

  updateFilter(filters);
}, 500);

watch(selectedUserIds, () => {
  debounceSearch();
});
watch(selectedPokemonIds, () => {
  debounceSearch();
});

onMounted(() => {
  getTotalPaintings();
  getPaintings();
  setUserFilterOptions();
  setPokemonFilterOptions();
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

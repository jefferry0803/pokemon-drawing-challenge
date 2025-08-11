<template>
  <div
    class="drawHistory-container container b:3px|solid|$(black) box-shadow:0px|4px|15px|rgb(23|44|120|/|20%) r:0|49px|49px|49px bg:$(sand) h:75vh pt:1rem pb:1rem position:relative d:flex flex-direction:column"
  >
    <BaseSpinner
      v-if="isLoading && !paintingOrder.length"
      class="spinner position:absolute top:50% left:50% transform:translate(-50%,-50%)"
    />
    <h1 class="drawHistory-title text-align:center">繪畫紀錄</h1>
    <div class="px:32px d:flex gap:16px">
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
          { label: '寶可夢編號', value: 'pokemonId' },
        ]"
      />
    </div>
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
          class="painting-wrapper position:relative border:3px|solid|$(black) r:25px height:450px overflow:hidden d:flex:hover_.painting-btns"
        >
          <!-- 繪畫標題 -->
          <div
            class="pokemonName painting-text position:absolute top:10px left:50% transform:translateX(-50%) bg:$(dark-green) color:$(white) r:15px font-size:1rem font-size:1.5rem@sm p:0.25rem|1rem white-space:nowrap"
          >
            {{ paintingMap.get(item.id)?.pokemonName }}
          </div>
          <!-- 按鈕區 -->
          <div
            class="painting-btns position:absolute bottom:10px right:10px d:flex d:none@sm gap:10px"
          >
            <BaseButton
              class="p:0.25rem|0.5rem.base-button p:0.5rem|1rem.base-button@sm"
              :border="false"
              background-color="$(green)"
              text-color="$(white)"
              @click.stop="
                downloadPainting(
                  paintingMap.get(item.id)?.paintingUrl!,
                  paintingMap.get(item.id)?.pokemonName!,
                )
              "
            >
              下載
            </BaseButton>
            <BaseButton
              class="p:0.25rem|0.5rem.base-button p:0.5rem|1rem.base-button@sm"
              :border="false"
              background-color="$(like-fill)"
              text-color="$(white)"
              @click.stop="deletePainting(paintingMap.get(item.id)?.id!)"
            >
              刪除
            </BaseButton>
            <BaseButton
              :class="[paintingMap.get(item.id)?.isShared! && 'shared']"
              class="p:0.25rem|0.5rem.base-button p:0.5rem|1rem.base-button@sm d:none.shared:hover_span content:'取消分享'.shared:hover::before"
              :border="false"
              :background-color="
                paintingMap.get(item.id)?.isShared
                  ? '$(grey)'
                  : '$(pokemon-blue)'
              "
              text-color="$(white)"
              @click.stop="
                toggleIsShared(
                  paintingMap.get(item.id)?.id!,
                  paintingMap.get(item.id)?.isShared!,
                )
              "
            >
              <span>{{
                getShareBtnText(paintingMap.get(item.id)?.isShared!)
              }}</span>
            </BaseButton>
          </div>
          <!-- 圖片 -->
          <div
            :style="{
              backgroundImage: `url(${paintingMap.get(item.id)?.paintingUrl})`,
            }"
            class="painting h:100% background-size:cover background-position:center cursor:zoom-in"
            @click="setFocusImage(paintingMap.get(item.id)?.paintingUrl!)"
          ></div>
        </div>
      </div>
    </RecycleScroller>
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
import ImageModal from '../components/ImageModal.vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import { useUserStore } from '../stores/user';
import { where, orderBy } from 'firebase/firestore';
import {
  apiDeletePainting,
  apiUpdatePainting,
  apiGetPainting,
} from '@/api/painting';
import { usePaintingList } from '@/composables/usePaintingList';
import BaseButton from '@/components/BaseButton.vue';
import PdcFilter from '@/components/PdcFilter.vue';
import SortControl from '@/components/SortControl.vue';
import { apiGetPokemonList } from '@/api/pokemon';
import { useDebounceFn, watchDebounced } from '@vueuse/core';
import { useDialog } from '@/composables/useDialog';

const userStore = useUserStore();
const { showDialog } = useDialog();

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
  [where('userId', '==', userStore.userId)],
  orderBy('created', 'desc'),
);

let focusImageUrl = ref('');
const imageModal = ref<InstanceType<typeof ImageModal> | null>(null);
const pokemonFilterOptions = ref<{ id: string; label: string }[]>([]);
const selectedPokemonIds = ref<string[]>([]);

type SortState = {
  type: 'pokemonId' | 'createDate';
  direction: 'asc' | 'desc';
};

const currentSort = ref<SortState>({
  type: 'createDate', // 預設排序
  direction: 'desc', // 預設方向
});

/**
 * 刪除繪畫
 * @param {string} id 繪畫 id
 */
async function deletePainting(id: string) {
  showDialog({
    title: '確認刪除',
    content: '確定要刪除這個項目嗎？此操作無法復原。',
    confirmText: '刪除',
    cancelText: '取消',
    async onConfirm() {
  await apiDeletePainting(id);
  paintingMap.value.delete(id);
      paintingOrder.value = paintingOrder.value.filter(
        (item) => item.id !== id,
      );
    },
  });
}

/**
 * 切換繪畫分享狀態
 * @param {string} paintingId 繪畫 id
 * @param {boolean} isShared 目前分享狀態
 */
async function toggleIsShared(paintingId: string, isShared: boolean) {
  await apiUpdatePainting(paintingId, {
    isShared: !isShared,
  });

  // 取得最新的 painting 資料並更新 Map
  const updatedSnap = await apiGetPainting(paintingId);
  if (updatedSnap.exists()) {
    const updatedIsShard = updatedSnap.data().isShared;
    const painting = paintingMap.value.get(paintingId);
    if (painting) {
      painting.isShared = updatedIsShard;
      // 觸發響應式
      paintingMap.value.set(paintingId, { ...painting });
    }
  }
}

/**
 * 下載繪畫圖檔
 * @param {string} url 繪畫圖片檔 url
 * @param {string} fileName 檔名
 */
function downloadPainting(url: string, fileName: string) {
  let a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'default.png';
  a.dispatchEvent(new MouseEvent('click'));
}

/**
 * 設定聚焦圖片並顯示彈窗
 * @param {string} url 繪畫圖片檔 url
 */
function setFocusImage(url: string) {
  focusImageUrl.value = url;
  imageModal.value.showModal();
}

/**
 * 取得分享按鈕的文字
 * @param {boolean} isShared 分享狀態
 */
function getShareBtnText(isShared: boolean) {
  return isShared ? '已分享' : '分享到畫廊';
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
      pokemonId: 'pokemonIdNumber',
      createDate: 'created',
    }[currentSort.value.type];
    updateSort(orderBy(sortField, currentSort.value.direction));
  },
  { deep: true },
);

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

  if (selectedPokemonIds.value.length) {
    filters.push(where('pokemonId', 'in', selectedPokemonIds.value));
  }

  updateFilter(filters);
}, 500);

watch(selectedPokemonIds, () => {
  debounceSearch();
});

onMounted(() => {
  getTotalPaintings();
  getPaintings();
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

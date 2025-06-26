import { ref, useTemplateRef } from 'vue';
import { useElementBounding } from '@vueuse/core';
import { apiGetPaintingList, apiGetPaintingCount } from '@/api/painting';
import type { Painting } from '@/types';
import type {
  DocumentData,
  QueryDocumentSnapshot,
  QueryFieldFilterConstraint,
  QueryOrderByConstraint,
} from 'firebase/firestore';

export function usePaintingList(
  filter: QueryFieldFilterConstraint,
  sort: QueryOrderByConstraint,
) {
  // 儲存繪畫資料的 Map
  const paintingMap = ref(new Map<string, Painting>());
  // 儲存繪畫的順序
  const paintingOrder = ref<{ id: string }[]>([]);
  // 繪畫總數
  const paintingCount = ref(0);
  // 上一次載入的最後一筆繪畫
  const lastVisiblePainting = ref<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null);
  // 是否正在載入資料
  const isLoading = ref(false);

  // 虛擬滾動元件的欄數
  const gridItems = ref(2);
  // 繪畫寬度
  const itemSecondarySize = ref(0);
  // 虛擬滾動元件 DOM 元素
  const virtualScrollerRef = useTemplateRef<HTMLElement | null>(
    'virtualScrollerRef',
  );

  /**
   * 處理滾動觸底事件
   */
  function handleScrollToEnd() {
    if (paintingOrder.value.length < paintingCount.value) {
      getPaintings();
    }
  }

  /**
   * 虛擬滾動容器 resize 處理
   */
  function handleVirtualScrollerResize() {
    const { width } = useElementBounding(virtualScrollerRef);

    if (width.value >= 794) {
      gridItems.value = 2;
      itemSecondarySize.value = (width.value - 24) / 2;
    } else {
      gridItems.value = 1;
      itemSecondarySize.value = width.value - 24;
    }
  }

  /**
   * 取得繪畫總數
   */
  async function getTotalPaintings() {
    const countSnapshot = await apiGetPaintingCount(filter);
    paintingCount.value = countSnapshot.data().count;
  }

  /**
   * 取得繪畫列表
   */
  async function getPaintings() {
    isLoading.value = true;
    const querySnapshot = await apiGetPaintingList(
      filter,
      sort,
      10,
      lastVisiblePainting.value,
    );
    lastVisiblePainting.value =
      querySnapshot.docs[querySnapshot.docs.length - 1];

    querySnapshot.forEach((doc) => {
      const painting: Painting = {
        id: doc.id,
        paintingUrl: doc.data().paintingUrl,
        pokemonName: doc.data().pokemonName,
        userId: doc.data().userId,
        username: doc.data().username,
        isShared: doc.data().isShared,
        likers: doc.data().likers || [],
        created: new Date(doc.data().created.seconds * 1000),
      };
      paintingMap.value.set(painting.id, painting);
      if (!paintingOrder.value.some((p) => p.id === painting.id)) {
        paintingOrder.value.push({ id: painting.id });
      }
    });

    // 觸發響應式更新
    paintingOrder.value = [...paintingOrder.value];

    isLoading.value = false;
  }

  return {
    paintingMap,
    paintingOrder,
    paintingCount,
    lastVisiblePainting,
    isLoading,
    gridItems,
    itemSecondarySize,
    virtualScrollerRef,
    handleScrollToEnd,
    handleVirtualScrollerResize,
    getTotalPaintings,
    getPaintings,
  };
}

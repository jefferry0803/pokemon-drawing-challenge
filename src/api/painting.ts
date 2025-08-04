import {
  collection,
  query,
  getDoc,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  startAfter,
  limit,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type {
  QueryFieldFilterConstraint,
  QueryOrderByConstraint,
  QuerySnapshot,
  AggregateQuerySnapshot,
  AggregateField,
  DocumentData,
  DocumentSnapshot,
} from 'firebase/firestore';

/**
 * 取得單一繪畫資料
 */
async function apiGetPainting(paintingId: string) {
  const paintingRef = doc(db, 'draw-history', paintingId);
  return await getDoc(paintingRef);
}

/**
 * 向 firestore 取得繪畫列表
 */
async function apiGetPaintingList(
  filter: QueryFieldFilterConstraint[],
  sort: QueryOrderByConstraint,
  perPage: number,
  lastVisiblePainting: DocumentSnapshot | null = null,
): Promise<QuerySnapshot> {
  const drawHistoryRef = collection(db, 'draw-history');
  const q = query(
    drawHistoryRef,
    ...filter,
    sort,
    limit(perPage),
    ...(lastVisiblePainting ? [startAfter(lastVisiblePainting)] : []),
  );
  return await getDocs(q);
}

/**
 * 取得繪畫總數
 */
async function apiGetPaintingCount(
  filter: QueryFieldFilterConstraint[],
): Promise<
  AggregateQuerySnapshot<
    {
      count: AggregateField<number>;
    },
    DocumentData,
    DocumentData
  >
> {
  const drawHistoryRef = collection(db, 'draw-history');
  const q = query(drawHistoryRef, ...filter);
  return await getCountFromServer(q);
}

/**
 * 新增繪畫記錄
 */
async function apiCreatePainting(
  data: Record<string, any>,
): Promise<Record<string, any>> {
  return addDoc(collection(db, 'draw-history'), {
    ...data,
    created: serverTimestamp(),
  });
}

/**
 * 更新指定的繪畫紀錄
 */
async function apiUpdatePainting(
  paintingId: string,
  data: Record<string, any>,
): Promise<void> {
  const paintingRef = doc(db, 'draw-history', paintingId);
  return await updateDoc(paintingRef, data);
}

/**
 * 刪除指定的繪畫紀錄
 */
async function apiDeletePainting(paintingId: string): Promise<void> {
  const paintingRef = doc(db, 'draw-history', paintingId);
  return await deleteDoc(paintingRef);
}

export {
  apiGetPainting,
  apiGetPaintingList,
  apiCreatePainting,
  apiUpdatePainting,
  apiDeletePainting,
  apiGetPaintingCount,
};

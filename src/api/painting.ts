import {
  collection,
  query,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type {
  QueryFieldFilterConstraint,
  QueryOrderByConstraint,
  QuerySnapshot,
} from 'firebase/firestore';

/**
 * 向 firestore 取得繪畫列表
 */
async function apiGetPaintingList(
  filter: QueryFieldFilterConstraint,
  sort: QueryOrderByConstraint,
): Promise<QuerySnapshot> {
  const drawHistoryRef = collection(db, 'draw-history');
  const q = query(drawHistoryRef, filter, sort);
  return await getDocs(q);
}

async function apiGetPainting() {}

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
  apiGetPaintingList,
  apiGetPainting,
  apiCreatePainting,
  apiUpdatePainting,
  apiDeletePainting,
};

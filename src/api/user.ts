import {
  query,
  collection,
  getDocs,
  setDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { QueryOrderByConstraint } from 'firebase/firestore';

/**
 * 取得所有使用者
 */
async function apiGetUserList(
  sort: QueryOrderByConstraint = orderBy('username', 'asc'),
) {
  const q = query(collection(db, 'users'), sort);
  return getDocs(q);
}

/**
 * 新增使用者資料
 */
function apiAddUser(
  userId: string,
  userData: { email: string; username: string },
) {
  return setDoc(doc(db, 'users', userId), userData);
}

export { apiGetUserList, apiAddUser };

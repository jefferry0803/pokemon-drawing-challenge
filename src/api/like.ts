import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase';

export type createLikeData = {
  userEmail: string;
  username: string;
  userId: string;
};

/**
 * 對指定的繪畫按讚
 */
async function apiAddLike(
  paintingId: string,
  data: createLikeData,
  currentLikesCount: number,
): Promise<void> {
  const paintingRef = doc(db, 'draw-history', paintingId);
  return updateDoc(paintingRef, {
    likers: arrayUnion(data),
    likesCount: currentLikesCount + 1,
  });
}
/**
 * 對指定的繪畫取消按讚
 */
async function apiRemoveLike(
  paintingId: string,
  data: createLikeData,
  currentLikesCount: number,
): Promise<void> {
  const paintingRef = doc(db, 'draw-history', paintingId);
  await updateDoc(paintingRef, {
    likers: arrayRemove(data),
    likesCount: currentLikesCount - 1,
  });
}

export { apiAddLike, apiRemoveLike };

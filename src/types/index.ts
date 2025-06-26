import type { createLikeData } from '@/api/like';

export type Painting = {
  id: string;
  paintingUrl: string;
  pokemonName: string;
  userId: string;
  username: string;
  isShared?: boolean;
  created?: Date;
  likers?: createLikeData[];
};

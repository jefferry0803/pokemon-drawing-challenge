import { query, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * 取得所有寶可夢
 */
async function apiGetPokemonList() {
  const q = query(collection(db, 'pokemons'));
  return getDocs(q);
}

/**
 * 取得單一寶可夢資料
 */
async function apiGetPokemon(pokemonId: string) {
  const pokemonRef = doc(db, 'pokemons', pokemonId);
  return getDoc(pokemonRef);
}

export { apiGetPokemonList, apiGetPokemon };

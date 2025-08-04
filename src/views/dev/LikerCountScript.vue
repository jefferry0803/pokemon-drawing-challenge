<script setup lang="ts">
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import BaseButton from '@/components/BaseButton.vue';

async function addLikerCount() {
  const querySnapshot = await getDocs(collection(db, 'draw-history'));
  const paintings = [];
  querySnapshot.forEach((doc) => {
    paintings.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  let completedCount = 0;
  const total = paintings.length;

  const updatePromises = paintings.map(async (painting) => {
    const paintingRef = doc(db, 'draw-history', painting.id);
    try {
      if (!painting.likers) {
        await updateDoc(paintingRef, {
          likesCount: 0,
          likers: [],
        });
      } else {
        await updateDoc(paintingRef, {
          likesCount: painting.likers.length,
        });
      }

      completedCount++;
      console.log(
        `更新進度: ${completedCount}/${total}, ID: ${painting.id}, ` +
          `按讚數: ${painting.likers?.length ?? 0}`,
      );
    } catch (error) {
      console.error(`更新 ${painting.id} 時發生錯誤:`, error);
      throw error;
    }
  });

  try {
    await Promise.all(updatePromises);
    console.log(`全部完成，共更新 ${total} 筆資料`);
  } catch (error) {
    console.error('更新過程中發生錯誤:', error);
  }
}

async function migratePaintings() {
  const querySnapshot = await getDocs(collection(db, 'draw-history'));
  const paintings = [];
  querySnapshot.forEach((doc) => {
    paintings.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  const updatePromises = paintings.map(async (painting) => {
    const paintingRef = doc(db, 'draw-history', painting.id);

    return updateDoc(paintingRef, {
      pokemonIdNumber: parseInt(painting.pokemonId, 10),
    });
  });

  try {
    await Promise.all(updatePromises);
    console.log('資料遷移完成');
  } catch (error) {
    console.error('遷移過程中發生錯誤:', error);
  }
}
</script>

<template>
  <div>
    <BaseButton @click="migratePaintings">RUN</BaseButton>
  </div>
</template>

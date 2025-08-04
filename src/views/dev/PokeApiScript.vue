<template>
  <div
    class="container b:3px|solid|$(black) box-shadow:0px|4px|15px|rgb(23|44|120|/|20%) r:0|49px|49px|49px bg:$(sand) h:75vh pt:1rem pb:1rem d:flex flex-direction:column justify-content:center align-items:center"
  >
    <h1>駭客，我是駭客</h1>
    <BaseButton
      class="bg:red!"
      :disabled="isProcessing"
      @click="
        async () => {
          isProcessing = true;
          try {
            await run();
          } finally {
            isProcessing = false;
          }
        }
      "
    >
      {{ isProcessing ? '處理中...' : '按下去' }}
    </BaseButton>
    <!-- <BaseButton @click="storePokemon(1011)">
      {{ '測試' }}
    </BaseButton> -->
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import usePokeApi from '@/composables/pokeApi.js';
import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import BaseButton from '@/components/BaseButton.vue';
import { ref } from 'vue';

const { getLanguageContent, getColorChineseName } = usePokeApi();
const isProcessing = ref(false);

async function storePokemon(idParam: number) {
  const { data } = await axios.get(
    'https://pokeapi.co/api/v2/pokemon-species/' + idParam,
  );
  // console.log(data);
  const id = data.id.toString().padStart(4, '0');
  const pokemonId = data.id.toString();
  const chName = getLanguageContent(data.names, 'zh-Hant').name;
  const enName = getLanguageContent(data.names, 'en').name;

  const chDescription = getLanguageContent(
    data.flavor_text_entries,
    'zh-Hant',
  ).flavor_text;
  const description = chDescription ? chDescription.replace(/\s+/g, '') : '';

  const color = getColorChineseName(data.color.name);
  const genera = getLanguageContent(data.genera, 'zh-Hant').genus ?? '';

  const storeData = {
    pokemonId,
    chName,
    enName,
    description,
    color,
    genera,
  };
  // console.log(storeData);

  await setDoc(doc(db, 'pokemons', id), storeData);

  console.log('儲存成功！', `編號: ${id}, 名稱: ${chName}`);
}

async function run() {
  for (let i = 1; i <= 1025; i++) {
    try {
      await storePokemon(i); // 等待每一筆資料儲存完成才繼續
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 加入延遲避免 API 限制
    } catch (error) {
      console.error(`處理編號 ${i} 時發生錯誤:`, error);
      // 可以選擇是否要中斷整個流程
      // break;
    }
  }
  console.log('全部資料儲存完成！');
}
</script>

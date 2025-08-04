<template>
  <div
    class="container b:3px|solid|$(black) box-shadow:0px|4px|15px|rgb(23|44|120|/|20%) r:0|49px|49px|49px bg:$(sand) h:75vh pt:1rem pb:1rem position:relative d:flex flex-direction:column gap:16px overflow:auto"
  >
    <div
      v-for="user in userFilterOptions"
      :key="user.id"
      class="border:1px|solid|black d:flex justify-content:space-between"
    >
      {{ user.label }}
      <BaseButton class="font-size:16px!" @click="getUserDrawHistory(user.id)"
        >新增篩選器選項</BaseButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiGetUserList } from '@/api/user';
import { apiGetPaintingList } from '@/api/painting';
import BaseButton from '@/components/BaseButton.vue';
import { where, orderBy } from 'firebase/firestore';

const userFilterOptions = ref<{ id: string; label: string }[]>([]);
/**
 * 設置使用者過濾選項
 */
async function setUserFilterOptions() {
  const querySnapshot = await apiGetUserList();
  userFilterOptions.value = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      label: data.username || '未知用戶',
    };
  });
}
async function getUserDrawHistory(userId: string) {
  const querySnapshot = await apiGetPaintingList(
    [where('userId', '==', userId)],
    orderBy('created', 'desc'),
    1000,
  );
  const userDrawHistory = [];
  querySnapshot.forEach((doc) => {
    const painting = {
      paintingId: doc.id,
      pokemonName: doc.data().pokemonName,
      created: new Date(doc.data().created.seconds * 1000),
    };
    userDrawHistory.push(painting);
  });

  console.log(userDrawHistory);
}

onMounted(() => {
  setUserFilterOptions();
});
</script>

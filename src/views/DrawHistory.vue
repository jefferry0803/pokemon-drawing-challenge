<template>
  <div class="drawHistory-container container">
    <NavBar :username="userStore.username" />
    <h1 class="drawHistory-title">繪畫紀錄</h1>
    <div class="paintings-container">
      <div v-for="painting in paintingList" :key="painting.id" class="painting">
        <div class="pokemonName">{{ painting.pokemonName }}</div>
        <div class="sharedBtn">分享到畫廊</div>
        <img class="painting-img" :src="painting.paintingUrl" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import { useUserStore } from "../stores/user";
import { collection, query, where, getDocs } from "firebase/firestore";
import axios from "axios";
import db from "../firebase/index";

const userStore = useUserStore();

let paintingList = ref([]);

onMounted(async () => {
  const q = query(
    collection(db, "draw-history"),
    where("userId", "==", userStore.userId)
  );

  const querySnapshot = await getDocs(q);
  let fbPaintings = [];

  querySnapshot.forEach((doc) => {
    const painting = {
      id: doc.id,
      isShared: doc.data().isShared,
      paintingUrl: doc.data().paintingUrl,
      pokemonName: doc.data().pokemonName,
      userId: doc.data().userId,
      username: doc.data().username,
    };
    fbPaintings.push(painting);
  });

  paintingList.value = fbPaintings;
});
</script>

<style scoped>
.drawHistory-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 49px;
  background: var(--sand);
  height: 80vh;
  padding: 2rem 5rem 2rem 5rem;
}
.drawHistory-title {
  text-align: center;
}
.paintings-container {
  height: calc(100% - 56px);
  overflow: auto;
}
.painting {
  border: 3px solid #000;
  border-radius: 25px;
  overflow: hidden;
  margin-bottom: 2rem;
  position: relative;
}
.pokemonName,
.sharedBtn {
  position: absolute;
  top: 30px;
  border-radius: 15px;
  font-size: 1.5rem;
  padding: 1rem 2rem;
}
.pokemonName {
  left: 30px;
  background: var(--dark-green);
  color: #fff;
}
.sharedBtn {
  right: 30px;
  background: var(--pokemon-blue);
  color: #fff;
  cursor: pointer;
}
.sharedBtn:hover {
  background: #38609f;
}
.painting-img {
  width: 100%;
}

@media (min-width: 1800px) {
  .drawHistory-container {
    max-width: 1600px;
  }
}
@media (max-width: 576px) {
  .drawHistory-container {
    max-width: 90%;
  }
}
</style>

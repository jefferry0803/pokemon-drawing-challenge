<template>
  <nav class="navBar">
    <ul class="navButton-container">
      <li>
        <router-link class="navButton" to="/login" @click="userStore.logout">
          {{ logInOutBtn }}
        </router-link>
      </li>
      <li>
        <router-link class="navButton" to="/signup"> 註冊 </router-link>
      </li>
      <li>
        <router-link class="navButton" to="/pokedraw"> 前往繪畫 </router-link>
      </li>
      <li v-if="userStore.token">
        <router-link class="navButton" to="/history"> 繪畫紀錄 </router-link>
      </li>
      <li>
        <router-link class="navButton" to="/gallery"> 公共畫廊 </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();

const logInOutBtn = computed(() => {
  return userStore.token ? '登出' : '登入';
});
</script>

<style scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
a {
  color: #000;
}
a:hover {
  color: #000;
}
.navBar {
  align-self: flex-start;
  width: 100%;
}
.navButton-container {
  display: flex;
  flex-wrap: wrap-reverse;
  max-width: 90%;
}
.navButton {
  display: inline-block;
  background: #cdbc85;
  padding: 0.5rem 1rem;
  border: 3px solid #000;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  margin-bottom: -3px;
}
.navButton:hover {
  background: var(--sand);
}
.router-link-active {
  position: relative;
  border-bottom: none;
  z-index: 1;
  background: var(--sand);
}

@media (max-width: 576px) {
  .navButton {
    padding: 0.25rem 0.5rem;
  }
}
</style>

<template>
  <div class="navbar">
    <div class="navbar-userdisplay" @click="toggleNavBtn">
      <span class="mobile-none" :class="{ 'd-none': !userStore.token }"
        >以</span
      >
      {{ loginStateDisplay }}
      <span class="mobile-none" :class="{ 'd-none': !userStore.token }"
        >登入中</span
      >{{ toggleCollapseBtn }}
      <ul class="navButton-container" :class="{ hide: !isNavBtnShow }">
        <li class="navButton">
          <router-link to="/pokedraw">前往繪畫</router-link>
        </li>
        <li class="navButton" v-if="userStore.token">
          <router-link to="/history">繪畫紀錄</router-link>
        </li>
        <li class="navButton">
          <router-link to="/gallery">公共畫廊</router-link>
        </li>
        <li class="navButton">
          <a href="#" @click="userStore.logout">{{ logInOutBtn }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "../stores/user";

const props = defineProps({
  username: String,
});

const userStore = useUserStore();

let isNavBtnShow = ref(false);

function toggleNavBtn() {
  isNavBtnShow.value = !isNavBtnShow.value;
}
const toggleCollapseBtn = computed(() => {
  return isNavBtnShow.value ? "▲" : "▼";
});
const loginStateDisplay = computed(() => {
  return userStore.token ? userStore.username : "未登入";
});
const logInOutBtn = computed(() => {
  return userStore.token ? "登出" : "登入";
});
</script>

<style scoped>
a,
a:hover {
  color: #000;
}
ul {
  list-style: none;
}
.navbar {
  position: fixed;
  top: 50px;
  right: 50px;
  font-size: 1.25rem;
  z-index: 2;
}
.navbar-userdisplay {
  position: relative;
  border: 3px solid #000;
  border-radius: 15px;
  background: var(--pokemon-yellow);
  padding: 0.5rem;
  cursor: pointer;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
}
.navButton-container {
  position: absolute;
  top: 100%;
  right: 0;
  transition: all 0.25s ease;
  transform: scaleY(1);
  transform-origin: top;
}
.navButton-container.hide {
  transform: scaleY(0);
}
.navButton {
  width: 150px;
  text-align: center;
  border: 2px solid #000;
  background: #fff;
}
.navButton,
.navButton > a {
  transition: 0.25s all ease;
}
.navButton:hover {
  box-shadow: inset 150px 0 0 0 var(--pokemon-blue);
}
.navButton:hover > a {
  color: #fff;
}

@media (max-width: 768px) {
  .navbar {
    top: 10px;
    right: 10px;
  }
  .mobile-none {
    display: none;
  }
  .navButton {
    width: 100px;
  }
}
</style>

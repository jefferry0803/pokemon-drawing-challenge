<template>
  <nav class="navBar align-self:flex-start w:100%">
    <ul
      class="navButton-container list-style:none m:0 p:0 d:flex flex-wrap:wrap-reverse max-w:90%"
    >
      <!-- 登入/登出按鈕 -->
      <li>
        <NavButton to="login" @click="userStore.logout">
          {{ logInOutBtn }}
        </NavButton>
      </li>
      <!-- 其他路由按鈕 -->
      <li v-for="route in routes" :key="route.path">
        <NavButton :to="route.path">
          {{ route.meta?.title }}
        </NavButton>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import NavButton from './NavButton.vue';

const userStore = useUserStore();
const router = useRouter();

const routes = computed(() => {
  return router.getRoutes().filter((route) => {
    // 過濾掉 home 和 login 路由
    if (route.name === 'home' || route.name === 'login') return false;

    // 如果路由需要認證且用戶未登入，則不顯示
    if (route.meta?.requiresAuth && !userStore.isLogin) return false;

    // 登入時隱藏註冊頁
    if (route.name === 'signup' && userStore.isLogin) return false;

    return true;
  });
});

const logInOutBtn = computed(() => {
  return userStore.isLogin ? '登出' : '登入';
});
</script>

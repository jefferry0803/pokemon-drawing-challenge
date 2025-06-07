<template>
  <div class="loginState">
    <span class="mobile-none" :class="{ 'd-none': !userStore.token }">以</span>
    {{ loginStateDisplay }}
    <span class="mobile-none" :class="{ 'd-none': !userStore.token }"
      >登入中</span
    >
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../stores/user';

defineProps({
  username: String,
});

const userStore = useUserStore();

const loginStateDisplay = computed(() => {
  return userStore.token ? userStore.username : '未登入';
});
</script>

<style scoped>
.loginState {
  position: fixed;
  top: 50px;
  right: 50px;
  font-size: 1.25rem;
  z-index: 2;
  border: 3px solid #000;
  border-radius: 15px;
  background: var(--pokemon-yellow);
  padding: 0.5rem;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
}

@media (max-width: 768px) {
  .loginState {
    top: 10px;
    right: 10px;
  }
  .mobile-none {
    display: none;
  }
}
</style>

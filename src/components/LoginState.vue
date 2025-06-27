<template>
  <div
    class="loginState position:fixed top:10px right:10px font:1.25rem z:2 b:3px|solid|$(black) r:15px bg:$(pokemon-yellow) p:0.5rem box-shadow:0px|4px|15px|rgb(23|44|120/20%) {top:50px;right:50px}@sm"
  >
    <span
      class="d:none"
      :class="{
        'd:none': !userStore.isLogin,
        'd:inline@sm': userStore.isLogin,
      }"
      >以</span
    >
    {{ loginStateDisplay }}
    <span
      class="d:none"
      :class="{
        'd:none': !userStore.isLogin,
        'd:inline@sm': userStore.isLogin,
      }"
      >登入中</span
    >
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../stores/user';

defineProps({
  username: {
    type: String,
    default: '',
  },
});

const userStore = useUserStore();

const loginStateDisplay = computed(() => {
  return userStore.isLogin ? userStore.username : '未登入';
});
</script>

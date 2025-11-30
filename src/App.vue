<template>
  <div class="app-vue">
    <main class="main">
      <LoginState :username="userStore.username" />
      <PdcLogo />
      <NavBar v-if="isRouteReady" />
      <RouterView />
      <PdcDialog />
      <div class="background-reference">
        Image by
        <a
          href="https://www.freepik.com/free-vector/organic-flat-jungle-background_13839952.htm#query=forest%20background&position=1&from_view=search&track=sph"
          >Freepik</a
        >
      </div>
    </main>
  </div>
</template>

<script setup>
import PdcLogo from './components/PdcLogo.vue';
import LoginState from './components/LoginState.vue';
import NavBar from './components/NavBar.vue';
import { useUserStore } from './stores/user';
import '@master/css';
import { provideDialog } from '@/composables/useDialog';
import PdcDialog from '@/components/PdcDialog.vue';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const router = useRouter();
const isRouteReady = ref(false);

onMounted(async () => {
  await router.isReady();
  isRouteReady.value = true;
});

provideDialog();

const userStore = useUserStore();

userStore.autoLogin();
</script>

<style lang="scss">
@import 'bootstrap/scss/bootstrap';
</style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC&family=Roboto&display=swap');
@import '@master/normal.css';
@import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

:root {
  --dark-green: #163a38;
  --green: #449641;
  --sand: #f4efd2;
  --dark-sand: #cdbc85;
  --dark-grey-text: #525252;
  --pokemon-yellow: #ffcc03;
  --pokemon-blue: #386abb;
  --white: #ffffff;
  --black: #000000;
  --like-fill: #ff0034;
  --grey: #808080;
  --bg-disabled: #dddddd;
  --border-disabled: #8d8d8d;
  --input-border: #dcdfe6;
  --input-border-focus: #409eff;
  --input-border-disabled: #e4e7ed;
  --input-bg-disabled: #f5f7fa;
  --input-fg-disabled: #a8abb2;
  --overlay-bg: #000000b3;
  --score-mid: #ff9900;
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Noto Sans TC', 'Roboto', sans-serif;
}

a {
  text-decoration: none;
}

.rel {
  position: relative;
}

.container {
  max-width: unset;
}

.paintingList-enter-active,
.paintingList-leave-active {
  transition: all 0.5s ease;
}
.paintingList-enter-from,
.paintingList-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 576px) {
  .main {
    width: 90%;
  }
}

@media (min-width: 576px) {
  .container {
    width: 540px;
  }
}

@media (min-width: 768px) {
  .container {
    width: 720px;
  }
}

@media (min-width: 992px) {
  .container {
    width: 960px;
  }
}

@media (min-width: 1200px) {
  .container {
    width: 1140px;
  }
}

@media (min-width: 1400px) {
  .container {
    width: 1320px;
  }
}

@media (min-width: 1800px) {
  .container {
    width: 1600px;
  }
}
</style>

<style scoped>
.app-vue {
  min-height: 100vh;
  background-image: url(./assets/jungle_background.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.background-reference {
  position: fixed;
  bottom: 5px;
  right: 5px;
  font-size: 12px;
}
</style>

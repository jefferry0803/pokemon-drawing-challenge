<template>
  <div class="app-vue">
    <PdcLogo />
    <RouterView />
    <div class="background-reference">
      Image by
      <a
        href="https://www.freepik.com/free-vector/organic-flat-jungle-background_13839952.htm#query=forest%20background&position=1&from_view=search&track=sph"
        >Freepik</a
      >
    </div>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import PdcLogo from "./components/PdcLogo.vue";
import { useUserStore } from "./stores/user";

const userStore = useUserStore();

userStore.autoLogin();
</script>

<style lang="scss">
@import "bootstrap/scss/bootstrap";
</style>

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+TC&family=Roboto&display=swap");
:root {
  --dark-green: #163a38;
  --green: #449641;
  --sand: #f4efd2;
  --dark-grey-text: #525252;
}
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Noto Sans TC", "Roboto", sans-serif;
}
a {
  text-decoration: none;
}
.rel {
  position: relative;
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.background-reference {
  position: fixed;
  bottom: 5px;
  right: 5px;
}
</style>

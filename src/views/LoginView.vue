<template>
  <div class="container-sm login-container rel">
    <PdcLogo />
    <div class="loginForm-container">
      <h1>登入</h1>
      <div class="loginForm-inputGroups my-3">
        <div v-if="isAlertShow" class="alert alert-danger" role="alert">
          {{ alertMessage }}
        </div>
        <div class="loginForm-inputGroup my-3">
          <label class="loginForm-label" for="username">信箱</label
          ><input
            v-model="email"
            class="loginForm-input"
            id="username"
            type="email"
          />
        </div>
        <div class="loginForm-inputGroup my-3">
          <label class="loginForm-label" for="password">密碼</label
          ><input
            v-model="password"
            class="loginForm-input"
            id="password"
            type="password"
          />
        </div>
      </div>
      <div class="loginForm-buttons">
        <router-link to="/signup" class="toSignup">
          沒有帳號嗎?<br />
          這裡註冊 →
        </router-link>
        <BaseButton
          :background-color="'#FDC795'"
          :text="'登入'"
          @click-callback="userLogin"
        />
        <div class="fs-3">或</div>
        <BaseButton
          :background-color="'#DDDEDD'"
          :text="'以訪客登入'"
          @click-callback="gusetLogin"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import PdcLogo from "../components/PdcLogo.vue";
import BaseButton from "../components/BaseButton.vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { ref } from "vue";

const userStore = useUserStore();
const router = useRouter();

let email = ref("");
let password = ref("");
let isAlertShow = ref(false);
let alertMessage = ref("");

function userLogin() {
  userStore
    .login(email.value, password.value)
    .then((res) => {
      isAlertShow.value = false;
      userStore.setUser(res.data.localId, res.data.idToken, res.data.expiresIn);
      router.push("/pokedraw");
    })
    .catch((e) => {
      alertMessage.value = "信箱或密碼錯誤";
      isAlertShow.value = true;
    });
}

function gusetLogin() {
  console.log("訪客登入");
}
</script>

<style scoped>
.login-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 49px;
  background: #fff;
  padding: 2rem 0 5rem 0;
}
.loginForm-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.loginForm-buttons {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: max-content;
}
.toSignup {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateX(100%);
}
.loginForm-label,
.loginForm-input {
  font-size: 2rem;
}
.loginForm-label {
  margin-right: 1rem;
}
.loginForm-input {
  border: 2px solid #000;
}

@media (min-width: 1200px) {
  .container-sm {
    max-width: 960px;
  }
}
</style>

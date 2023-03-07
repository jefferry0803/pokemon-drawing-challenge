<template>
  <div class="container-sm login-container rel">
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
          @click-callback="guestLogin"
        />
      </div>
    </div>
    <BaseSpinner v-if="isLoading" />
  </div>
</template>

<script setup>
import BaseButton from "../components/BaseButton.vue";
import BaseSpinner from "../components/BaseSpinner.vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { ref } from "vue";

const userStore = useUserStore();
const router = useRouter();

let email = ref("");
let password = ref("");
let isAlertShow = ref(false);
let alertMessage = ref("");
let isLoading = ref(false);

function userLogin() {
  isLoading.value = true;
  userStore
    .login(email.value, password.value)
    .then((res) => {
      isLoading.value = false;
      isAlertShow.value = false;
      const email = res.data.email;
      const username = email.substring(0, email.search("@"));

      const expiresIn = +res.data.expiresIn * 1000;
      const expirationDate = new Date().getTime() + expiresIn;

      localStorage.setItem("username", username);
      localStorage.setItem("userId", res.data.localId);
      localStorage.setItem("token", res.data.idToken);
      localStorage.setItem("tokenExpiration", expirationDate);

      userStore.logoutTimer = setTimeout(() => {
        userStore.logout();
      }, expiresIn);

      userStore.setUser(username, res.data.localId, res.data.idToken);
      router.push("/pokedraw");
    })
    .catch((e) => {
      isLoading.value = false;
      alertMessage.value = "信箱或密碼錯誤";
      isAlertShow.value = true;
    });
}

function guestLogin() {
  isLoading.value = true;
  userStore
    .guestLogin()
    .then((res) => {
      isLoading.value = false;
      isAlertShow.value = false;

      const expiresIn = +res.data.expiresIn * 1000;
      const expirationDate = new Date().getTime() + expiresIn;

      localStorage.setItem("username", "訪客");
      localStorage.setItem("userId", res.data.localId);
      localStorage.setItem("token", res.data.idToken);
      localStorage.setItem("tokenExpiration", expirationDate);

      userStore.logoutTimer = setTimeout(() => {
        userStore.logout();
      }, expiresIn);

      userStore.setUser("訪客", res.data.localId, res.data.idToken);
      router.push("/pokedraw");
    })
    .catch((e) => {
      isLoading.value = false;
      alertMessage.value = "發生錯誤，請稍後再試";
      isAlertShow.value = true;
    });
}
</script>

<style scoped>
.login-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 49px;
  background: #fff;
  padding: 2rem 2rem 5rem 2rem;
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
  width: 100%;
}
.loginForm-label {
  margin-right: 1rem;
}
.loginForm-input {
  border: 2px solid #000;
}

@media (min-width: 1200px) {
  .login-container {
    max-width: 960px;
  }
}
@media (max-width: 576px) {
  .login-container {
    max-width: 90%;
  }
}
</style>

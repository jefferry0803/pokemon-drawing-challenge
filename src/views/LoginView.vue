<template>
  <div class="container login-container rel">
    <div class="loginForm-container">
      <h1>登入</h1>
      <div class="loginForm-inputGroups my-3">
        <div v-if="isAlertShow" class="alert alert-danger" role="alert">
          {{ alertMessage }}
        </div>
        <div class="loginForm-inputGroup my-3">
          <label class="loginForm-label" for="username">信箱</label
          ><input
            id="username"
            v-model="email"
            class="loginForm-input"
            type="email"
            @keydown.enter="userLogin"
          />
        </div>
        <div class="loginForm-inputGroup my-3">
          <label class="loginForm-label" for="password">密碼</label
          ><input
            id="password"
            v-model="password"
            class="loginForm-input"
            type="password"
            @keydown.enter="userLogin"
          />
        </div>
      </div>
      <div class="loginForm-buttons">
        <BaseButton
          :background-color="'#FDC795'"
          :text="'登入'"
          @click-callback="userLogin"
        />
        <router-link to="/signup" class="toSignup">
          沒有帳號嗎?<br />
          這裡註冊 →
        </router-link>
      </div>
    </div>
    <BaseSpinner v-if="isLoading" />
  </div>
</template>

<script setup>
import BaseButton from '../components/BaseButton.vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const userStore = useUserStore();
const router = useRouter();

let email = ref('');
let password = ref('');
let isAlertShow = ref(false);
let alertMessage = ref('');
let isLoading = ref(false);

function userLogin() {
  isLoading.value = true;
  userStore
    .login(email.value, password.value)
    .then(() => {
      isLoading.value = false;
      isAlertShow.value = false;

      router.push({ path: '/pokedraw' });
    })
    .catch(() => {
      isLoading.value = false;
      alertMessage.value = '信箱或密碼錯誤';
      isAlertShow.value = true;
    });
}

if (userStore.token) {
  router.push({ path: '/history' });
}
</script>

<style scoped>
.login-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 0 49px 49px 49px;
  background: var(--sand);
  padding: 2rem 2rem 5rem 2rem;
}
.loginForm-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.loginForm-buttons {
  position: relative;
}
.toSignup {
  position: absolute;
  width: max-content;
  top: 0;
  right: 0;
  transform: translateX(calc(100% + 20px));
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
  .container.login-container {
    width: 960px;
  }
}
</style>

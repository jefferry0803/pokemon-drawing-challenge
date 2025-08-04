<template>
  <div class="container signup-container rel">
    <div class="toLogin-container">
      <router-link class="toLogin" to="/login"> ← 返回登入頁 </router-link>
    </div>
    <div class="signupForm-container">
      <h1>註冊</h1>
      <div class="signupForm-inputGroups my-3">
        <div
          v-if="!isEmailValid || !isPasswordValid || isSignupErrMsgShow"
          class="alert alert-danger"
          role="alert"
        >
          {{ alertMessage }}
        </div>
        <div class="signupForm-inputGroup my-3">
          <label class="signupForm-label" for="username">信箱</label
          ><input
            id="username"
            v-model="email"
            class="signupForm-input"
            type="email"
            @keydown.enter="signup"
          />
        </div>
        <div class="signupForm-inputGroup my-3">
          <label class="signupForm-label" for="password">密碼</label
          ><input
            id="password"
            v-model="password"
            class="signupForm-input"
            type="password"
            @keydown.enter="signup"
          />
        </div>
      </div>
      <div class="signupForm-buttons">
        <BaseButton class="bg:#98A9E7.base-button" @click="signup"
          >註冊</BaseButton
        >
      </div>
    </div>
    <BaseModal ref="successModal">
      <template #title> 註冊成功 </template>
      <template #content> 點選確認前往繪畫頁 </template>
      <template #footer-buttons>
        <button
          type="button"
          class="btn btn-lg green-btn"
          @click="router.push({ path: '/pokedraw' })"
        >
          確認
        </button>
      </template>
    </BaseModal>
    <BaseSpinner v-if="isLoading" />
  </div>
</template>

<script setup>
import BaseButton from '../components/BaseButton.vue';
import BaseModal from '../components/BaseModal.vue';
import BaseSpinner from '../components/BaseSpinner.vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { apiAddUser } from '@/api/user';

const router = useRouter();
const userStore = useUserStore();

let email = ref('');
let password = ref('');
let isEmailValid = ref(true);
let isPasswordValid = ref(true);
let isSignupErrMsgShow = ref(false);
let alertMessage = ref('');
let isLoading = ref(false);
const successModal = ref(null);

function signup() {
  const emailRule =
    /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  if (email.value.search(emailRule) !== -1) {
    isEmailValid.value = true;
    if (password.value.length >= 8) {
      isPasswordValid.value = true;
      isLoading.value = true;
      userStore
        .signup(email.value, password.value)
        .then(async (res) => {
          // 註冊成功後，新增使用者資料到 Firestore
          await apiAddUser(res.user.uid, {
            email: email.value,
            username: email.value.split('@')[0],
          });

          isLoading.value = false;
          successModal.value.showModal();
          isSignupErrMsgShow.value = false;
        })
        .catch((err) => {
          isLoading.value = false;
          if (err.code === 'auth/email-already-in-use') {
            alertMessage.value = '信箱已被使用';
          } else {
            alertMessage.value = '註冊發生錯誤';
          }
          isSignupErrMsgShow.value = true;
        });
    } else {
      alertMessage.value = '密碼必須至少8個字元';
      isPasswordValid.value = false;
    }
  } else {
    alertMessage.value = '信箱格式不正確';
    isEmailValid.value = false;
  }
}
</script>

<style scoped>
.signup-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 0 49px 49px 49px;
  background: var(--sand);
  padding: 2rem 2rem 5rem 2rem;
}
.signupForm-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.signupForm-buttons {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: max-content;
}
.signupForm-label,
.signupForm-input {
  font-size: 2rem;
  width: 100%;
}
.signupForm-label {
  margin-right: 1rem;
}
.signupForm-input {
  border: 2px solid #000;
}
.toLogin {
  font-size: 1.5rem;
  color: #000;
}
.green-btn {
  background: var(--green);
  color: #fff;
}

@media (min-width: 1200px) {
  .container.signup-container {
    width: 960px;
  }
}
</style>

<template>
  <div class="container-sm signup-container rel">
    <PdcLogo />
    <div class="toLogin-container">
      <router-link class="toLogin" to="/">← 返回登入頁</router-link>
    </div>
    <div class="signupForm-container">
      <h1>註冊</h1>
      <div class="signupForm-inputGroups my-3">
        <div class="signupForm-inputGroup my-3">
          <label class="signupForm-label" for="username">帳號</label
          ><input class="signupForm-input" id="username" type="email" />
        </div>
        <div class="signupForm-inputGroup my-3">
          <label class="signupForm-label" for="password">密碼</label
          ><input class="signupForm-input" id="password" type="password" />
        </div>
      </div>
      <div class="signupForm-buttons">
        <BaseButton
          @click-callback="signup"
          :background-color="'#98A9E7'"
          :text="'註冊'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import PdcLogo from "../components/PdcLogo.vue";
import BaseButton from "../components/BaseButton.vue";

function signup() {
  console.log("註冊");
}
</script>

<style scoped>
.signup-container {
  border: 3px solid #000;
  box-shadow: 0px 4px 15px rgb(23 44 120 / 20%);
  border-radius: 49px;
  background: #fff;
  padding: 2rem 0 5rem 2rem;
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

@media (min-width: 1200px) {
  .container-sm {
    max-width: 960px;
  }
}
</style>

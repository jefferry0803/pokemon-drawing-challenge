<template>
  <div class="backdrop">
    <div class="wrapper">
      <h2>{{ title }}</h2>
      <div class="dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
});
</script>

<style scoped>
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  width: 100vw;
  height: 100vh;
  z-index: 1055;
}
.wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.dots {
  display: flex;
  justify-content: center;
  gap: 2rem;
}
.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #000;
  opacity: 1;
}

.dots .dot:nth-last-child(1) {
  animation: loading 0.6s 0.1s linear infinite;
}
.dots .dot:nth-last-child(2) {
  animation: loading 0.6s 0.2s linear infinite;
}
.dots .dot:nth-last-child(3) {
  animation: loading 0.6s 0.3s linear infinite;
}

@keyframes loading {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(0, 15px);
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>

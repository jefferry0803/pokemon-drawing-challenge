<template>
  <div
    class="modal fade"
    id="resultModal"
    tabindex="-1"
    aria-labelledby="resultModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title" id="resultModalLabel">遊戲結束!</h1>
        </div>
        <div class="modal-body">
          <div class="img-container">
            <h2 class="pic-title">他長這樣</h2>
            <img class="img" :src="pokemonImgUrl" alt="" />
          </div>
          <div class="draw-container">
            <h2 class="pic-title">你畫這樣</h2>
            <img class="img" :src="pokemonDrawUrl" alt="" />
          </div>
        </div>
        <div class="modal-footer">
          <div>
            <button
              type="button"
              class="btn btn-lg btn-success me-2"
              @click="downloadDraw"
            >
              下載保存
            </button>
            <button
              type="button"
              class="btn btn-lg btn-success"
              data-bs-dismiss="modal"
              @click="reset"
            >
              再來一局
            </button>
          </div>
          <div>
            <button
              type="button"
              class="btn btn-lg btn-primary me-2"
              v-if="userStore.token"
            >
              <router-link to="/history"> 繪畫記錄 </router-link>
            </button>
            <button type="button" class="btn btn-lg btn-primary">
              <router-link to="/gallery"> 公共畫廊 </router-link>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from "bootstrap";
import { ref, onMounted, onUnmounted } from "vue";
import { useUserStore } from "../stores/user";

const emit = defineEmits(["reset", "toDrawHistory"]);
const props = defineProps({
  pokemonImgUrl: String,
  pokemonDrawUrl: String,
  pokemonName: String,
});
defineExpose({ showModal });
const userStore = useUserStore();

function reset() {
  emit("reset");
}
function downloadDraw() {
  let a = document.createElement("a");
  a.href = props.pokemonDrawUrl;
  a.download = props.pokemonName || "default.png";
  a.dispatchEvent(new MouseEvent("click"));
}

const modal = ref(null);

function showModal() {
  modal.value.show();
}
function hideModal() {
  modal.value.hide();
}

onMounted(() => {
  modal.value = new Modal("#resultModal");
});
onUnmounted(() => {
  hideModal();
});
</script>

<style scoped>
a {
  color: #fff;
}
.modal-content {
  background: var(--sand);
  color: var(--dark-grey-text);
}
.modal-header,
.modal-footer {
  border: none;
  display: flex;
  justify-content: space-between;
}
.modal-header {
  justify-content: center;
}
.img {
  width: 100%;
}
.img-container,
.draw-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.img-container {
  width: 500px;
}
.draw-container {
  width: 800px;
}
.modal-body {
  display: flex;
}
.modal-dialog {
  max-width: max-content;
}
.green-btn {
  background: var(--green);
  color: #fff;
}
.pic-title {
  background: var(--dark-green);
  color: #fff;
  border-radius: 15px;
  padding: 0.5rem 1rem;
}

@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
    align-items: center;
  }
  .draw-container {
    width: 100%;
  }
}
@media (max-width: 576px) {
  .modal-footer {
    justify-content: end;
  }
}
</style>

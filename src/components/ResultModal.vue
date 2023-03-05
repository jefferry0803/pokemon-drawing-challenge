<template>
  <!-- Modal -->
  <div
    class="modal fade"
    id="resultModal"
    tabindex="-1"
    aria-labelledby="resultModalLabel"
    aria-hidden="true"
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
            <h2 class="pic-title">這是你畫的</h2>
            <img class="img" :src="pokemonDrawUrl" alt="" />
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-lg green-btn"
            data-bs-dismiss="modal"
            @click="reset"
          >
            再來一局
          </button>
          <button
            @click="toDrawHistory"
            type="button"
            class="btn btn-lg btn-secondary"
          >
            前往繪畫記錄
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from "bootstrap";
import { ref, onMounted } from "vue";

const emit = defineEmits(["reset", "toDrawHistory"]);

const props = defineProps({
  pokemonImgUrl: String,
  pokemonDrawUrl: String,
});

defineExpose({ showModal });

function reset() {
  emit("reset");
}
function toDrawHistory() {
  emit("toDrawHistory");
}

const modal = ref(null);

function showModal() {
  modal.value.show();
}

onMounted(() => {
  modal.value = new Modal("#resultModal");
});
</script>

<style scoped>
.modal-content {
  background: var(--sand);
  color: var(--dark-grey-text);
}
.modal-header,
.modal-footer {
  border: none;
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
</style>

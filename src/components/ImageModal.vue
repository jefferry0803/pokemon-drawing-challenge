<template>
  <div
    class="modal fade"
    id="imageModal"
    tabindex="-1"
    aria-labelledby="imageModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <div class="img-container">
            <img class="w-100" :src="props.imageUrl" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from "bootstrap";
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  imageUrl: String,
});

defineExpose({ showModal });

const modal = ref(null);

function showModal() {
  modal.value.show();
}
function hideModal() {
  modal.value.hide();
}

onMounted(() => {
  modal.value = new Modal("#imageModal");
});
onUnmounted(() => {
  hideModal();
});
</script>

<style scoped>
.modal-dialog {
  max-width: max-content;
}
</style>

<template>
  <div
    id="imageModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="imageModalLabel"
    aria-hidden="true"
  >
    <div
      class="modal-dialog modal-dialog-centered max-w:calc(100%-40px).modal-dialog"
    >
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
import { Modal } from 'bootstrap';
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
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
  modal.value = new Modal('#imageModal');
});
onUnmounted(() => {
  hideModal();
});
</script>

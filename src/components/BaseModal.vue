<template>
  <div
    id="myModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div
        class="modal-content {bg:$(sand);color:$(dark-grey-text)}.modal-content"
      >
        <div class="modal-header b:none.modal-header">
          <h1 id="myModalLabel" class="modal-title fs-2">
            <slot name="title">標題</slot>
          </h1>
        </div>
        <div class="modal-body fs-5">
          <slot name="content">內容</slot>
        </div>
        <div class="modal-footer {b:none!;jc:center}.modal-footer">
          <slot name="footer-buttons">
            <button class="btn btn-secondary">按鈕一</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from 'bootstrap';
import { ref, onMounted, onUnmounted } from 'vue';

const modal = ref(null);

function showModal() {
  modal.value.show();
}
function hideModal() {
  modal.value.hide();
}

defineExpose({ showModal, hideModal });

onMounted(() => {
  modal.value = new Modal('#myModal');
});
onUnmounted(() => {
  hideModal();
});
</script>

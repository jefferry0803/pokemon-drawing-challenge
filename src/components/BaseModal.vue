<template>
  <div
    class="modal fade"
    id="myModal"
    tabindex="-1"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-2" id="myModalLabel">{{ title }}</h1>
        </div>
        <div class="modal-body fs-5">{{ content }}</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-lg myBtn" @click="handleClick">
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from "bootstrap";
import { ref, onMounted } from "vue";

const props = defineProps({
  title: String,
  content: String,
  buttonText: String,
});
const emit = defineEmits(["buttonCallback"]);

const modal = ref(null);

function handleClick() {
  modal.value.hide();
  emit("buttonCallback");
}

onMounted(() => {
  modal.value = new Modal("#myModal");
  modal.value.show();
});
</script>

<style scoped>
.modal-header,
.modal-footer {
  border: none;
}
.modal-footer {
  justify-content: center;
}
.myBtn {
  background: var(--green);
  color: #fff;
}
.modal-content {
  background: var(--sand);
  color: var(--dark-grey-text);
}
</style>

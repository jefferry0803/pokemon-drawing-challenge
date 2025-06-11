<template>
  <div
    id="resultModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="resultModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 id="resultModalLabel" class="modal-title">遊戲結束!</h1>
        </div>
        <div class="modal-body">
          <div class="result-comparison">
            <div class="img-container">
              <h2 class="pic-title">他長這樣</h2>
              <img class="img" :src="pokemonImgUrl" alt="" />
            </div>
            <div class="draw-container">
              <h2 class="pic-title">你畫這樣</h2>
              <img class="img" :src="pokemonDrawUrl" alt="" />
            </div>
          </div>
          <p v-if="!userStore.token" class="text-center mt-3 mb-0">
            您目前沒有登入，畫作將不會保存，要不要考慮
            <router-link to="/login" class="text-primary"> 登入 </router-link>
            或是
            <router-link to="/signup" class="text-primary"> 註冊 </router-link>
            呢?
          </p>
        </div>
        <div class="modal-footer">
          <div class="btns-container">
            <button
              type="button"
              class="btn btn-lg btn-success"
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
          <div class="btns-container">
            <button
              v-if="userStore.token"
              type="button"
              class="btn btn-lg btn-primary"
              :disabled="isShared"
            >
              <a href="#" @click.prevent="shareToGallery">{{ shareBtnText }}</a>
            </button>
            <button
              v-if="userStore.token"
              type="button"
              class="btn btn-lg btn-primary"
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
import { Modal } from 'bootstrap';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useUserStore } from '../stores/user';
import { apiUpdatePainting } from '@/api/painting';

const emit = defineEmits(['reset', 'toDrawHistory']);
const props = defineProps({
  pokemonImgUrl: String,
  pokemonDrawUrl: String,
  pokemonName: String,
});
defineExpose({ showModal });
const userStore = useUserStore();
const modal = ref(null);
const paintingId = ref('');
let isShared = ref(false);
const shareBtnText = computed(() => {
  return isShared.value ? '已分享' : '分享到畫廊';
});

/**
 * 重置遊戲
 */
function reset() {
  emit('reset');
}
/**
 * 下載畫作
 */
function downloadDraw() {
  let a = document.createElement('a');
  a.href = props.pokemonDrawUrl;
  a.download = props.pokemonName || 'default.png';
  a.dispatchEvent(new MouseEvent('click'));
}
/**
 * 分享到公共畫廊
 */
async function shareToGallery() {
  await apiUpdatePainting(paintingId.value, { isShared: true });

  isShared.value = true;
}

/**
 * 打開彈窗(暴露給上層使用)
 * @param {string} id 繪畫 id
 */
function showModal(id) {
  paintingId.value = id;
  isShared.value = false;
  modal.value.show();
}
/**
 * 關閉彈窗
 */
function hideModal() {
  modal.value.hide();
}

onMounted(() => {
  modal.value = new Modal('#resultModal');
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
  max-width: 100%;
}
.img-container {
  width: 500px;
}
.draw-container {
  width: 800px;
}
.result-comparison {
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
.btns-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .result-comparison {
    flex-direction: column;
    align-items: center;
  }
}
@media (max-width: 576px) {
  .modal-footer {
    justify-content: end;
  }
}
</style>

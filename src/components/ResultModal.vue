<template>
  <div
    id="resultModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="resultModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div
      class="modal-dialog modal-dialog-centered max-w:max-content.modal-dialog"
    >
      <div
        class="modal-content {bg:$(sand);color:$(dark-grey-text)}.modal-content"
      >
        <div
          class="modal-header {b:none;d:flex;justify-content:center}.modal-header"
        >
          <h1 id="resultModalLabel" class="modal-title">遊戲結束!</h1>
        </div>
        <div class="modal-body">
          <div
            class="result-comparison d:flex flex:col flex:row@sm align-items:center align-items:normal@sm"
          >
            <div
              class="img-container d:flex flex-direction:column align-items:center max-w:100% w:500px"
            >
              <h2
                class="pic-title bg:$(dark-green) color:$(white) r:15px p:0.5rem|1rem"
              >
                他長這樣
              </h2>
              <img class="w:100%" :src="pokemonImgUrl" alt="" />
            </div>
            <div
              class="draw-container d:flex flex-direction:column align-items:center max-w:100% w:800px"
            >
              <h2
                class="pic-title bg:$(dark-green) color:$(white) r:15px p:0.5rem|1rem"
              >
                你畫這樣
              </h2>
              <img class="w:100%" :src="pokemonDrawUrl" alt="" />
            </div>
          </div>
          <p class="text-align:center font-size:24px">
            相似度:
            <span
              :class="scoreColorClass"
              class="font-weight:600 font-size:48px"
              >{{ displayScore }}</span
            >
            %
          </p>
          <p v-if="!userStore.isLogin" class="text-center mt-3 mb-0">
            您目前沒有登入，畫作將不會保存，要不要考慮
            <router-link to="/login"> 登入 </router-link>
            或是
            <router-link to="/signup"> 註冊 </router-link>
            呢?
          </p>
        </div>
        <div
          class="modal-footer {b:none!;d:flex;justify-content:end}.modal-footer justify-content:space-between.modal-footer@xs"
        >
          <div
            class="btns-container d:flex flex:wrap justify-content:end gap:1rem"
          >
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
          <div
            class="btns-container d:flex flex:wrap justify-content:end gap:1rem"
          >
            <button
              v-if="userStore.isLogin"
              type="button"
              class="btn btn-lg btn-primary"
              :disabled="isShared"
            >
              <a
                href="#"
                class="color:$(white)"
                @click.prevent="shareToGallery"
                >{{ shareBtnText }}</a
              >
            </button>
            <button
              v-if="userStore.isLogin"
              type="button"
              class="btn btn-lg btn-primary"
            >
              <router-link to="/history" class="color:$(white)">
                繪畫記錄
              </router-link>
            </button>
            <button type="button" class="btn btn-lg btn-primary">
              <router-link to="/gallery" class="color:$(white)">
                公共畫廊
              </router-link>
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
  pokemonImgUrl: {
    type: String,
    default: '',
  },
  pokemonDrawUrl: {
    type: String,
    default: '',
  },
  pokemonName: {
    type: String,
    default: '',
  },
  similarityScore: {
    type: Number,
    default: 0,
  },
});
defineExpose({ showModal });
const userStore = useUserStore();
const modal = ref(null);
const paintingId = ref('');
let isShared = ref(false);
const displayScore = ref(0);
let animationTimer = null;
const shareBtnText = computed(() => {
  return isShared.value ? '已分享' : '分享到畫廊';
});
const scoreColorClass = computed(() => {
  if (displayScore.value <= 40) {
    return 'score-low';
  }
  if (displayScore.value <= 70) {
    return 'score-mid';
  }
  return 'score-high';
});

/**
 * 分數動畫函數 - 從 0 跑到目標分數
 */
function animateScore() {
  if (animationTimer) {
    clearInterval(animationTimer);
  }

  displayScore.value = 0;
  const targetScore = props.similarityScore;
  const duration = 1000; // 1 秒動畫時間
  const steps = 30; // 30 幀
  const increment = targetScore / steps;
  let currentStep = 0;

  animationTimer = setInterval(() => {
    currentStep++;
    if (currentStep >= steps) {
      displayScore.value = targetScore;
      clearInterval(animationTimer);
      animationTimer = null;
    } else {
      displayScore.value = Math.round(increment * currentStep);
    }
  }, duration / steps);
}

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
  // 等待 modal 動畫完成後再開始分數動畫
  setTimeout(() => {
    animateScore();
  }, 300);
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
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
  hideModal();
});
</script>

<style scoped>
.score-low {
  color: var(--dark-grey-text);
}

.score-mid {
  color: var(--score-mid);
}

.score-high {
  color: var(--green);
}
</style>

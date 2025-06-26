<template>
  <button
    type="button"
    class="icon-button"
    :disabled="props.disabled"
    @click.stop="handleClick"
  >
    <PdcIcon v-bind="props" />
  </button>
</template>

<script setup lang="ts">
import PdcIcon from './PdcIcon.vue';
import type { PdcIconProps } from './PdcIcon.vue';

export type IconButtonProps = {
  disabled?: boolean;
};

const props = withDefaults(defineProps<IconButtonProps & PdcIconProps>(), {
  disabled: false,
});

const emit = defineEmits(['click']);

/**
 * 處理按鈕點擊事件
 */
function handleClick() {
  if (!props.disabled) {
    emit('click');
  }
}
</script>

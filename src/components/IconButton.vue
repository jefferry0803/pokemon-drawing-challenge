<template>
  <button type="button" class="icon-button" @click.stop="$emit('click')">
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

defineEmits(['click']);
</script>

<template>
  <button
    :style="styleObject"
    class="base-button f:1.5rem b:3px|solid|$(black) r:13px p:0.25rem|1.5rem filter:brightness(85%):hover"
    :class="[`bg:${backgroundColor}`, `fg:${textColor}`]"
    @click="handleClick"
  >
    {{ text }}
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  backgroundColor: {
    type: String,
    default: '#FFFFFF',
  },
  text: {
    type: String,
    default: '',
  },
  textColor: {
    type: String,
    default: '#000000',
  },
});

const emit = defineEmits(['clickCallback']);

const styleObject = computed(() => {
  return {
    '--background-color': props.backgroundColor,
    '--text-color': props.textColor,
  };
});

function handleClick() {
  emit('clickCallback');
}
</script>

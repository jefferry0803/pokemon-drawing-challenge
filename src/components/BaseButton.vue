<template>
  <button :style="styleObject" class="base-button" @click="handleClick">
    {{ text }}
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  backgroundColor: String,
  text: String,
  textColor: {
    type: String,
    default: '#000',
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

<style scoped>
.base-button {
  border: 3px solid #000;
  font-size: 1.5rem;
  border-radius: 13px;
  padding: 0.25rem 1.5rem;
  background-color: var(--background-color);
  color: var(--text-color);
}

.base-button:hover {
  filter: brightness(85%);
}
</style>

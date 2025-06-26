<template>
  <button
    class="base-button f:1rem f:1.5rem@sm r:15px p:0.25rem|1.5rem filter:brightness(85%):hover"
    :class="[
      `bg:${backgroundColor}`,
      `color:${textColor}`,
      border && 'b:3px|solid|$(black)',
    ]"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  backgroundColor: {
    type: String,
    default: '#FFFFFF',
  },
  textColor: {
    type: String,
    default: '#000000',
  },
  border: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['clickCallback']);

function handleClick() {
  emit('clickCallback');
}
</script>

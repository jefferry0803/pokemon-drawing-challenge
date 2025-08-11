<template>
  <router-link
    class="navButton color:$(black) color:$(black):hover d:inline-block bg:$(dark-sand) bg:$(sand):hover p:0.25rem|0.5rem p:0.5rem|1rem@xs b:3px|solid|$(black) bb:none r:10px|10px|0|0 {position:relative;bb:3px|solid|$(sand);mb:-3px;bg:$(sand)}.router-link-active"
    :to="to"
    @click="$emit('click')"
  >
    <slot></slot>
  </router-link>
</template>

<script setup lang="ts">
defineProps({
  to: {
    type: String,
    default: '',
  },
});
defineEmits(['click']);
</script>

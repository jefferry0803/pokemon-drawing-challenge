<template>
  <Icon
    :icon="`${iconPrefix}:${icon}`"
    class="pdc-icon"
    :class="[`color:$(${color})`, `font-size:${size}`]"
  />
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps({
  iconPrefix: {
    type: String,
    default: 'material-symbols',
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'dark-grey-text',
  },
  size: {
    type: [String, Number],
    default: '32px',
  },
});
</script>

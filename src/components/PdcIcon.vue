<template>
  <Icon
    :icon="`${iconPrefix}:${icon}`"
    class="pdc-icon"
    :class="[`color:$(${color})`, `font-size:${size}`]"
  />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

export type PdcIconProps = {
  icon: string;
  iconPrefix?: string;
  color?: string;
  size?: string | number;
};

withDefaults(defineProps<PdcIconProps>(), {
  iconPrefix: 'material-symbols',
  color: 'dark-grey-text',
  size: '32px',
});
</script>

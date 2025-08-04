<template>
  <label class="d:flex gap:.5rem align-items:center">
    <CheckboxRoot
      v-bind="props"
      v-model="modelValue"
      class="d:flex h:20px w:20px min-w:20px appearance:none justify-content:center align-items:center r:6px bg:$(white) border:1px|solid|$(black) outline:none {cursor:not-allowed;bg:$(bg-disabled);border-color:$(border-disabled)}[data-disabled]"
    >
      <CheckboxIndicator
        class="bg:$(white) h:100% w:100% r:6px d:flex justify-content:center align-items:center"
      >
        <PdcIcon icon="check" icon-prefix="mdi" color="black" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <span class="overflow:hidden">
      <slot></slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui';
import PdcIcon from '@/components/PdcIcon.vue';

const modelValue = defineModel<boolean | 'indeterminate' | null>();

const props = defineProps<{
  defaultValue?: boolean | 'indeterminate';
  disabled?: boolean;
}>();
</script>

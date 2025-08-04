<template>
  <div
    class="pdcInput border:1px|solid border-color:$(input-border) border-color:$(input-border-focus):has(input:focus) r:4px p:1px|11px d:inline-flex align-items:center"
    :class="[
      disabled &&
        'cursor:not-allowed border-color:$(input-border-disabled) bg:$(input-bg-disabled) color:$(input-fg-disabled)',
    ]"
  >
    <span v-if="$slots.prefix" class="pdcInput-prefix mr:8px flex-shrink:0">
      <slot name="prefix"></slot>
    </span>
    <input
      :id="id"
      v-model="modelValue"
      :name="name"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      class="pdcInput-input outline:none line-height:24px height:24px min-w:0"
      :class="[disabled && 'cursor:not-allowed']"
    />
    <span class="pdcInput-suffix d:inline-flex flex-shrink:0">
      <slot v-if="$slots.suffix" name="suffix" class="ml:8px"></slot>
      <IconButton
        v-if="clearable && modelValue"
        icon="close-rounded"
        size="20px"
        class="pdcInput-clear-button ml:8px"
        @click="modelValue = ''"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import IconButton from '@/components/IconButton.vue';

const modelValue = defineModel<string>();

type PdcInputProps = {
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
};

defineProps<PdcInputProps>();
</script>

<template>
  <div class="sort-control d:flex align-items:center gap:4px">
    <PdcPopover v-bind="props">
      <template #trigger>
        <div>排序: {{ getLabel }}</div>
      </template>
      <template #content="{ close }">
        <div
          v-for="opt in options"
          :key="opt.value"
          class="cursor:pointer p:2px|4px bg:$(bg-disabled):hover"
          @click="
            () => {
              modelValue = { type: opt.value, direction: 'asc' };
              close();
            }
          "
        >
          {{ opt.label }}
        </div>
      </template>
    </PdcPopover>
    <IconButton
      :icon="sortIcon"
      icon-prefix="mdi"
      size="24px"
      @click="setSortDirection"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PdcPopover from '@/components/PdcPopover.vue';
import type { PdcPopoverProps } from '@/components/PdcPopover.vue';
import IconButton from '@/components/IconButton.vue';

const modelValue = defineModel<{
  type: string;
  direction: string;
}>();

type SortControlProps = {
  options: { label: string; value: string }[];
};

const props = defineProps<SortControlProps & PdcPopoverProps>();

const getLabel = computed(() => {
  const option = props.options.find(
    (opt) => modelValue.value && opt.value === modelValue.value.type,
  );
  return option ? option.label : '自訂';
});

const sortIcon = computed(() => {
  const map = {
    asc: 'sort-ascending',
    desc: 'sort-descending',
  };

  return map[modelValue.value?.direction as 'asc' | 'desc'];
});

function setSortDirection() {
  if (!modelValue.value) return;

  modelValue.value.direction =
    modelValue.value.direction === 'asc' ? 'desc' : 'asc';
}
</script>

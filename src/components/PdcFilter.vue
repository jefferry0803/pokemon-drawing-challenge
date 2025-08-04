<template>
  <PdcPopover v-bind="props" class="pdc-filter">
    <template #trigger>
      <div class="d:flex">
        <div>
          {{ title }}:
          {{ selectedLabelString }}
        </div>
        <IconButton
          v-if="clearable && modelValue?.length"
          icon="close-rounded"
          size="24px"
          @click="modelValue = []"
        />
      </div>
    </template>

    <template #content>
      <PdcInput
        v-if="searchable"
        v-model="searchInput"
        placeholder="搜尋..."
        class="mb:4px w:100%"
        clearable
      />
      <RecycleScroller
        v-slot="{ item }"
        :items="filteredOptions"
        :item-size="24"
        class="max-h:300px w:242px"
        @scroll-end="emit('scroll-end')"
      >
        <PdcCheckbox
          class="bg:$(bg-disabled):hover cursor:pointer"
          :model-value="modelValue?.includes(item.id)"
          :disabled="
            (modelValue ?? []).length >= 30 && !modelValue?.includes(item.id)
          "
          @update:model-value="
            (checked) => onCheck(item.id, checked as boolean)
          "
        >
          <div
            class="overflow:hidden white-space:nowrap text-overflow:ellipsis"
          >
            {{ item.label }}
          </div>
        </PdcCheckbox>
      </RecycleScroller>
      <div
        v-if="searchQuery.length && !filteredOptions.length"
        class="text-align:center p:16px color:$(grey)"
      >
        無符合的結果
      </div>
    </template>
  </PdcPopover>
</template>

<script setup lang="ts">
import PdcPopover from '@/components/PdcPopover.vue';
import type { PdcPopoverProps } from '@/components/PdcPopover.vue';
import PdcCheckbox from '@/components/PdcCheckbox.vue';
import { computed, ref } from 'vue';
import IconButton from '@/components/IconButton.vue';
import PdcInput from '@/components/PdcInput.vue';
import { refDebounced } from '@vueuse/core';

const modelValue = defineModel<string[]>();

type PdcFilterProps = {
  options: { id: string; label: string }[];
  title: string;
  clearable?: boolean;
  searchable?: boolean;
  searchById?: boolean; // 是否根據 ID 搜索
};

const props = defineProps<PdcPopoverProps & PdcFilterProps>();

const emit = defineEmits(['scroll-end']);

const searchInput = ref('');
const searchQuery = refDebounced(searchInput, 500);

const selectedLabelString = computed(() => {
  if (!modelValue.value || modelValue.value.length === 0) {
    return '全部';
  }
  if (modelValue.value.length > 3) {
    return (
      modelValue.value
        .slice(0, 3)
        .map((id) => getLabel(id))
        .join('、') + '...'
    );
  }
  return modelValue.value.map((id) => getLabel(id)).join('、');
});

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.options;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return props.options.filter((option) => {
    if (props.searchById) {
      return (
        option.id.toLowerCase().includes(query) ||
        option.label.toLowerCase().includes(query)
      );
    } else {
      return option.label.toLowerCase().includes(query);
    }
  });
});

/**
 * 處理選中狀態變更
 * @param {string} id 選項 ID
 * @param {boolean} checked 是否選中
 */
function onCheck(id: string, checked: boolean) {
  if (!modelValue.value) {
    modelValue.value = [];
  }
  if (checked) {
    if (!modelValue.value.includes(id)) {
      modelValue.value = [...modelValue.value, id];
    }
  } else {
    modelValue.value = modelValue.value.filter((v) => v !== id);
  }
}

/**
 * 根據 ID 獲取對應的標籤
 * @param {string} id 選項 ID
 * @returns {string} 對應的標籤
 */
function getLabel(id: string) {
  return props.options.find((opt) => opt.id === id)?.label ?? id;
}
</script>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from 'reka-ui';

// 雙向綁定:目前頁數
const currentPage = defineModel({
  type: Number,
  default: 1,
});

export type PdcPaginationProps = {
  total?: number;
  siblingCount?: number;
  itemsPerPage?: number;
  showEdges?: boolean;
  defaultPage?: number;
};

withDefaults(defineProps<PdcPaginationProps>(), {
  total: 0,
  siblingCount: 1,
  itemsPerPage: 10,
  showEdges: true,
  defaultPage: 1,
});
</script>

<template>
  <PaginationRoot
    v-model:page="currentPage"
    :total="total"
    :sibling-count="siblingCount"
    :items-per-page="itemsPerPage"
    :show-edges="showEdges"
    :default-page="defaultPage"
  >
    <PaginationList
      v-slot="{ items }"
      class="d:flex justify-content:center align-items:center gap:4px color:$(dark-grey-text) font-size:24px mt:8px"
    >
      <PaginationFirst class="opacity:0.5:disabled">
        <Icon icon="radix-icons:double-arrow-left" />
      </PaginationFirst>
      <PaginationPrev class="opacity:0.5:disabled">
        <Icon icon="radix-icons:chevron-left" />
      </PaginationPrev>
      <template v-for="(item, index) in items">
        <PaginationListItem
          v-if="item.type === 'page'"
          :key="index"
          :value="item.value"
          class="w:36px h:36px bg:$(dark-sand)[data-selected] r:8px opacity:0.5:disabled"
        >
          {{ item.value }}
        </PaginationListItem>
        <PaginationEllipsis v-else :key="item.type" :index="index">
          &#8230;
        </PaginationEllipsis>
      </template>
      <PaginationNext class="opacity:0.5:disabled">
        <Icon icon="radix-icons:chevron-right" />
      </PaginationNext>
      <PaginationLast class="opacity:0.5:disabled">
        <Icon icon="radix-icons:double-arrow-right" />
      </PaginationLast>
    </PaginationList>
  </PaginationRoot>
</template>

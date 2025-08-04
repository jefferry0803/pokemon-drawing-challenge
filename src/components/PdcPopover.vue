<template>
  <PopoverRoot v-slot="{ close }" :default-open="defaultOpen" :modal="modal">
    <PopoverTrigger
      aria-label="Update dimensions"
      class="b:2px|solid|$(black) r:8px p:4px bg:$(white)"
    >
      <slot name="trigger"></slot>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        class="b:2px|solid|$(black) r:8px p:4px bg:$(white) max-w:250px"
        :align="align"
        :align-offset="alignOffset"
        :side="side"
        :side-offset="sideOffset"
      >
        <slot name="content" :close="close"></slot>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui';

export type PdcPopoverProps = {
  defaultOpen?: boolean;
  modal?: boolean;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
};

withDefaults(defineProps<PdcPopoverProps>(), {
  side: 'bottom',
  align: 'start',
  alignOffset: 0,
  sideOffset: 4,
});
</script>

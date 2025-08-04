<template>
  <div
    class="d:flex align-items:center {flex-direction:column;}:has([data-orientation='vertical'])"
  >
    <slot name="prepend"></slot>
    <SliderRoot
      v-bind="props"
      v-model="modelValue"
      class="position:relative d:flex align-items:center user-select:none touch-action:none {min-w:200px;h:20px}[data-orientation='horizontal'] {flex-direction:column;w:20px;min-h:200px}[data-orientation='vertical'] flex-grow:1"
    >
      <SliderTrack
        class="bg:$(white) position:relative flex-grow:1 r:9999px h:5px[data-orientation='horizontal'] w:5px[data-orientation='vertical']"
      >
        <SliderRange
          class="position:absolute bg:$(white) r:9999px h:100%[data-orientation='horizontal'] w:100%[data-orientation='vertical'] vu"
        />
      </SliderTrack>
      <SliderThumb
        class="d:block w:25px h:25px bg:$(white) r:50% outline:none:focus border:3px|solid|$(sand) cursor:pointer"
      />
    </SliderRoot>
    <slot name="append"></slot>
  </div>
</template>

<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui';

const modelValue = defineModel<number[]>();

type PdcSliderProps = {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  trackSize?: number;
  thumbSize?: number;
};

const props = withDefaults(defineProps<PdcSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  orientation: 'horizontal',
  trackSize: 3,
  thumbSize: 20,
});
</script>

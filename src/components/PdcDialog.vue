<template>
  <DialogRoot v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay class="position:fixed inset:0 bg:$(overlay-bg)" />
      <DialogContent
        class="position:fixed top:50% left:50% transform:translate(-50%,-50%) bg:$(sand) p:16px r:6px min-w:30vw min-h:20vh d:flex flex-direction:column"
        @interact-outside="(event) => event.preventDefault()"
      >
        <div class="font-size:20px color:$(black) mb:8px">
          {{ currentDialog?.title }}
        </div>
        <VisuallyHidden>
          <DialogTitle />
        </VisuallyHidden>
        <DialogDescription class="color:$(dark-grey-text)">
          {{ currentDialog?.content }}
        </DialogDescription>
        <div class="d:flex justify-content:end gap:8px mt:auto">
          <BaseButton
            v-if="currentDialog?.showCancel"
            class="b:none {bg:transparent;font-size:18px;px:16px;r:6px}.base-button"
            @click="handleCancel"
          >
            {{ currentDialog?.cancelText }}
          </BaseButton>
          <BaseButton
            class="b:none {bg:red;font-size:18px;px:16px;r:6px}.base-button color:$(white)"
            @click="handleConfirm"
          >
            {{ currentDialog?.confirmText }}
          </BaseButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from 'reka-ui';
import { useDialog } from '@/composables/useDialog';
import BaseButton from '@/components/BaseButton.vue';

const { isOpen, currentDialog, hideDialog } = useDialog();

async function handleConfirm() {
  try {
    await currentDialog.value?.onConfirm?.();
  } finally {
    hideDialog();
  }
}

function handleCancel() {
  currentDialog.value?.onCancel?.();
  hideDialog();
}
</script>

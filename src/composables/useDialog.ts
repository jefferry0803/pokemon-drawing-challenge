import { ref, provide, inject } from 'vue';

export interface DialogOptions {
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
}

export interface Dialog {
  isOpen: ReturnType<typeof ref<boolean>>;
  currentDialog: ReturnType<typeof ref<DialogOptions | null>>;
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

const DialogSymbol = Symbol('dialog');

export function provideDialog(): Dialog {
  const isOpen = ref(false);
  const currentDialog = ref<DialogOptions | null>(null);

  const showDialog = (options: DialogOptions) => {
    currentDialog.value = {
      title: options.title || '提示',
      content: options.content || '',
      confirmText: options.confirmText || '確認',
      cancelText: options.cancelText || '取消',
      showCancel: options.showCancel ?? true,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    };
    isOpen.value = true;
  };

  const hideDialog = () => {
    isOpen.value = false;
    currentDialog.value = null;
  };

  const dialog: Dialog = {
    isOpen,
    currentDialog,
    showDialog,
    hideDialog,
  };

  provide(DialogSymbol, dialog);
  return dialog;
}

export function useDialog(): Dialog {
  const dialog = inject<Dialog>(DialogSymbol);
  if (!dialog) {
    throw new Error('useDialog must be used after provideDialog');
  }
  return dialog;
}

import React from "react";

export type OpenSheetParams = {
  title?: string;
  child: React.ReactNode;
  needPadding?: boolean;
  needCloseButton?: boolean;  
  isDismissible?: boolean;
};

export type SheetItem = OpenSheetParams & {
  id: number;
  isClosing?: boolean;
};

class BottomSheetController {
  private addSheet: ((sheet: SheetItem) => void) | null = null;
  private removeSheet: ((id: number) => void) | null = null;
  private getCurrentStack: (() => SheetItem[]) | null = null;
  private markClosing: ((id: number) => void) | null = null;

  register(
    add: (sheet: SheetItem) => void,
    remove: (id: number) => void,
    getStack?: () => SheetItem[],
    markClosing?: (id: number) => void
  ) {
    this.addSheet = add;
    this.removeSheet = remove;
    this.getCurrentStack = getStack ?? null;
    this.markClosing = markClosing ?? null;
  }

  push(params: OpenSheetParams) {
    setTimeout(() => {
      this.addSheet?.({ ...params, id: Date.now() });
    }, 50);
  }

  pop() {
    const stack = this.getCurrentStack?.();
    if (!stack || stack.length === 0) return;
    const topSheet = stack[stack.length - 1];

    if (topSheet.isClosing) return;

    this.markClosing?.(topSheet.id);
    setTimeout(() => this.removeSheet?.(topSheet.id), 150);
  }

  popAll() {
    const stack = this.getCurrentStack?.() ?? [];
    stack.forEach((s, index) => {
      this.markClosing?.(s.id);
      setTimeout(() => this.removeSheet?.(s.id), 150 + index * 50);
    });
  }

  getStackCount() {
    return this.getCurrentStack ? this.getCurrentStack().length : 0;
  }
}

export const SooBottomSheet = new BottomSheetController();

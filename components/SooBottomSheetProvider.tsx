import React, { useEffect, useState } from "react";
import SooBottomSheetProps from "./SooBottomSheet";

type OpenSheetParams = {
  title?: string;
  child: React.ReactNode;
  needPadding?: boolean;
};

type SheetItem = OpenSheetParams & {
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
    const topId = stack[stack.length - 1].id;

    this.markClosing?.(topId);
    setTimeout(() => this.removeSheet?.(topId), 150);
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

export const SooBottomSheetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sheetStack, setSheetStack] = useState<SheetItem[]>([]);

  const addSheet = (sheet: SheetItem) =>
    setSheetStack((prev) => [...prev, sheet]);

  const removeSheet = (id: number) =>
    setSheetStack((prev) => prev.filter((s) => s.id !== id));

  const getStack = () => sheetStack;

  const markClosing = (id: number) =>
    setSheetStack((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isClosing: true } : s))
    );

  useEffect(() => {
    SooBottomSheet.register(addSheet, removeSheet, getStack, markClosing);
  }, [sheetStack]);

  return (
    <>
      {children}
      {sheetStack.map((sheet) => (
        <SooBottomSheetProps
          key={sheet.id}
          title={sheet.title}
          child={sheet.child}
          needPadding={sheet.needPadding}
          sheetId={sheet.id}
          isClosing={sheet.isClosing}
        />
      ))}
    </>
  );
};

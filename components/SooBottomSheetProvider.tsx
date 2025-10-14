import React, { useEffect, useState } from "react";
import SooBottomSheetProps from "./SooBottomSheet";

type OpenSheetParams = {
  title?: string;
  child: React.ReactNode;
  needPadding?: boolean;
};

type SheetItem = OpenSheetParams & { id: number };

class BottomSheetController {
  private addSheet: ((sheet: SheetItem) => void) | null = null;
  private removeSheet: ((id: number) => void) | null = null;
  private removeAllSheets: (() => void) | null = null;

  register(
    add: (sheet: SheetItem) => void,
    remove: (id: number) => void,
    removeAll: () => void
  ) {
    this.addSheet = add;
    this.removeSheet = remove;
    this.removeAllSheets = removeAll;
  }

  // Add new sheet
  push(params: OpenSheetParams) {
    // Keyboard.dismiss();
    setTimeout(() => {
      if (this.addSheet) {
        this.addSheet({ ...params, id: Date.now() });
      }
    }, 50);
  }

  // Remove the latest sheet (top of stack)
  pop() {
    if (this.removeSheet) {
      this.removeSheet(-1);
    }
  }

  // Remove all stacks
  popAll() {
    this.removeAllSheets?.();
  }

  popById(id: number) {
    this.removeSheet?.(id);
  }
}

// Export a singleton
export const SooBottomSheet = new BottomSheetController();

export const SooBottomSheetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sheetStack, setSheetStack] = useState<SheetItem[]>([]);

  const addSheet = (sheet: SheetItem) => {
    setSheetStack((prev) => [...prev, sheet]);
  };

  const removeSheet = (id: number) => {
    setSheetStack((prev) =>
      id === -1 ? prev.slice(0, -1) : prev.filter((s) => s.id !== id)
    );
  };

  const removeAllSheets = () => setSheetStack([]);

  useEffect(() => {
    SooBottomSheet.register(addSheet, removeSheet, removeAllSheets);
  }, []);

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
        />
      ))}
    </>
  );
};

import React, { useEffect, useState } from "react";
import SooBottomSheetProps from "./SooBottomSheet";
import { SheetItem, SooBottomSheet } from "./SooBottomSheetController";

export { SooBottomSheet };

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
      prev.map((s) => (s.id === id ? { ...s, isClosing: true } : s)),
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
          sheetId={sheet.id}
          title={sheet.title}
          child={sheet.child}
          needPadding={sheet.needPadding}
          isClosing={sheet.isClosing}
          needCloseButton={sheet.needCloseButton}
          isDismissible={sheet.isDismissible}
        />
      ))}
    </>
  );
};

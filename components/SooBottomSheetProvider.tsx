import React, { useEffect, useRef } from "react";
import SooBottomSheetProps, { SooBottomSheetRef } from "./SooBottomSheet";

type OpenSheetParams = {
  title?: string;
  child: React.ReactNode;
  needPadding?: boolean;
};

class BottomSheetController {
  private ref: React.RefObject<SooBottomSheetRef> | null = null;

  register(ref: React.RefObject<SooBottomSheetRef>) {
    this.ref = ref;
  }

  open(params: OpenSheetParams) {
    this.ref?.current?.openSheet(
      params.title,
      params.child,
      params.needPadding
    );
  }

  close() {
    this.ref?.current?.closeSheet();
  }
}

// Export a singleton
export const SooBottomSheet = new BottomSheetController();

export const SooBottomSheetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ref = useRef<SooBottomSheetRef>(
    null
  ) as React.RefObject<SooBottomSheetRef>;

  useEffect(() => {
    return SooBottomSheet.register(ref);
  }, []);

  return (
    <>
      {children}
      <SooBottomSheetProps ref={ref} />
    </>
  );
};

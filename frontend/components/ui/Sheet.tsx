import { forwardRef, useMemo, type ReactNode } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

interface Props {
  snapPoints?: (string | number)[];
  index?: number;
  onChange?: (index: number) => void;
  children: ReactNode;
}

const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
);

/**
 * Thin wrapper around @gorhom/bottom-sheet with our defaults: dismissable
 * backdrop, white surface, system-style grip handle.
 */
export const Sheet = forwardRef<BottomSheet, Props>(
  ({ snapPoints, index = -1, onChange, children }, ref) => {
    const points = useMemo(() => snapPoints ?? ["50%", "85%"], [snapPoints]);
    return (
      <BottomSheet
        ref={ref}
        index={index}
        snapPoints={points}
        onChange={onChange}
        enablePanDownToClose
        backdropComponent={Backdrop}
        backgroundStyle={{ backgroundColor: "#fff" }}
        handleIndicatorStyle={{ backgroundColor: "#D4D4D8", width: 40 }}
      >
        <BottomSheetView style={{ flex: 1 }}>{children}</BottomSheetView>
      </BottomSheet>
    );
  },
);

Sheet.displayName = "Sheet";

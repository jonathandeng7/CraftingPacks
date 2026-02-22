"use client";

import { useEffect } from "react";
import { PixelatedCanvas } from "@/components/ui/pixel-cursor";

export default function PixelCursorLayer() {
  useEffect(() => {
    document.body.classList.add("mc-hide-cursor");
    return () => {
      document.body.classList.remove("mc-hide-cursor");
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <PixelatedCanvas className="mc-cursor-canvas" />
    </div>
  );
}

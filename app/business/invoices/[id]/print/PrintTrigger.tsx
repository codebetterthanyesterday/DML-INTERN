"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    // Give a slight delay to ensure fonts/styles are loaded
    const timeout = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}

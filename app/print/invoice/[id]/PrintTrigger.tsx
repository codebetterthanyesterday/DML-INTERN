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

  return (
    <div className="fixed bottom-8 right-8 print:hidden z-50">
      <button 
        onClick={() => window.print()} 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95"
      >
        Cetak PDF
      </button>
    </div>
  );
}

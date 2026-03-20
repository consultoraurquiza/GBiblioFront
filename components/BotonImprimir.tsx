"use client";

export default function BotonImprimir() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-sm print:hidden"
    >
      🖨️ Imprimir Planilla
    </button>
  );
}
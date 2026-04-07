"use client";
import { useState } from "react";

// Eliminamos los imports de secciones de acá, ya no los necesita la Sidebar
export default function SideBar({ seccionActiva, setSeccionActiva }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [seccionAbierta, setSeccionAbierta] = useState("");

  const navegar = (id: string) => {
    setSeccionActiva(id);
    setIsOpen(false); 
  };

  return (
    <>
      {/* BOTÓN RUEDITA */}
      <button 
        onClick={() => {
          setIsOpen(true);
          
        }}
        className="fixed top-4 left-4 z-[70] bg-slate-800/80 backdrop-blur-md text-white w-12 h-12 rounded-full shadow-lg hover:bg-purple-600 transition-all flex items-center justify-center text-2xl"
      >
        ⚙️
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]" onClick={() => setIsOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-slate-900 z-[90] p-4 text-slate-300 shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
          <h2 className="font-bold text-white tracking-widest text-sm">CONFIGURACIÓN</h2>
        </div>

        <nav className="space-y-2">
          {/* SECCIÓN DATOS */}
          <div>
            <button onClick={() => navegar("importar")} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800">
              <span className="flex items-center gap-3">📥 Datos</span>
              
            </button>
           
          </div>

          <button onClick={() => navegar("ajustes")} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800">
            <span>⏳</span> Ajustes Préstamo
          </button>

          <button onClick={() => navegar("estilos")} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800">
            <span>🎨</span> Personalización
          </button>
          
          <button onClick={() => navegar("inicio")} className="w-full flex items-center gap-3 p-3 mt-10 rounded-xl bg-slate-800 hover:bg-red-900/20 text-xs font-bold uppercase tracking-widest">
            🏠 Volver al Buscador
          </button>
        </nav>
      </aside>
    </>
  );
}
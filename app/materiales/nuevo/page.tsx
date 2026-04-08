"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoMaterialPanol() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [ubicacionFisica, setUbicacionFisica] = useState("");
  const [cantidadTotal, setCantidadTotal] = useState("1");
  const [cargando, setCargando] = useState(false);

  // CONFIGURACIÓN Y TEMA
  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  useEffect(() => {
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error(err));
  }, []);

  const guardarMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const cantidad = parseInt(cantidadTotal);
    
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("La cantidad total debe ser mayor a cero.");
      return;
    }

    setCargando(true);
    const payload = {
      nombre, marca, modelo, numeroSerie, ubicacionFisica, cantidadTotal: cantidad,cantidadDisponible: cantidad, habilitado: true
    };

    try {
      const res = await fetch("http://localhost:5078/api/materiales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("¡Material ingresado al Pañol!");
        router.push("/panol");
      } else {
        const errorData = await res.json();
        alert("Error al guardar: " + (errorData.mensaje || "Revisá los datos."));
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  // CLASES BASE PARA LOS INPUTS
  const inputBaseClass = `w-full border p-2.5 rounded-lg outline-none transition font-medium ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-[var(--acento)]' : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[var(--acento)] text-gray-900'}`;
  const labelBaseClass = `block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-700'}`;

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      {/* NAV SINCRONIZADA AL TEMA GLOBAL */}
      <nav className="p-4 mb-4 shadow-md transition-colors print:hidden bg-[var(--bg-header)] text-[var(--texto-header)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔌</span>
            <h1 className="text-xl font-bold tracking-wider">PAÑOL TECNOLÓGICO</h1>
          </div>
          <Link href="/panol" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm border border-[var(--acento)]">
            Volver al Inventario
          </Link>
        </div>
      </nav>

      <div className={`max-w-4xl mx-auto p-8 rounded-2xl shadow-sm border border-t-4 transition-colors mt-6 mb-12 ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10 border-t-[var(--acento)]' : 'bg-white border-gray-200 border-t-[var(--acento)]'}`}>
        <div className={`border-b pb-4 mb-6 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <h1 className={`text-2xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>Ingresar Nuevo Equipo o Material</h1>
          <p className={`text-sm mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Completá los datos para registrar un elemento en el inventario físico.</p>
        </div>

        <form onSubmit={guardarMaterial} className="space-y-8">
          
          {/* SECCIÓN 1: IDENTIFICACIÓN DEL EQUIPO */}
          <section>
            <h2 className={`text-lg font-bold mb-4 p-3 rounded-lg border flex items-center gap-2 transition-colors ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 text-[var(--acento)] border-white/10' : 'bg-gray-50 text-[var(--acento)] border-gray-200'}`}>
              <span>1️⃣</span> Identificación del Material
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="col-span-1 md:col-span-2">
                <label className={labelBaseClass}>Nombre del Material *</label>
                <input 
                  type="text" required 
                  placeholder="Ej: Proyector Epson, Caja de Calculadoras, Alargue 5mts..." 
                  className={`w-full border-2 p-3 rounded-lg outline-none font-bold text-lg transition ${config?.temaId === 'obsidian' ? 'bg-[var(--acento)]/10 border-[var(--acento)]/30 text-[var(--acento)] focus:border-[var(--acento)]' : 'bg-gray-50 border-gray-300 focus:border-[var(--acento)] focus:ring-[var(--acento)] text-gray-900'}`} 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                />
              </div>

              <div>
                <label className={labelBaseClass}>Marca</label>
                <input 
                  type="text" 
                  placeholder="Ej: Epson, Casio, Exo..." 
                  className={inputBaseClass} 
                  value={marca} 
                  onChange={(e) => setMarca(e.target.value)} 
                />
              </div>

              <div>
                <label className={labelBaseClass}>Modelo</label>
                <input 
                  type="text" 
                  placeholder="Ej: PowerLite S31" 
                  className={inputBaseClass} 
                  value={modelo} 
                  onChange={(e) => setModelo(e.target.value)} 
                />
              </div>

              <div className={`col-span-1 md:col-span-2 p-4 rounded-xl border shadow-inner transition-colors ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <label className={`block text-sm font-bold uppercase tracking-wide mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-700'}`}>Número de Serie</label>
                <p className={`text-xs mb-2 ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>Fundamental para garantías o para identificar aparatos costosos únicos (Notebooks, Proyectores).</p>
                <input 
                  type="text" 
                  placeholder="SN: 4390284X..." 
                  className={`w-full border p-3 rounded-lg outline-none font-mono font-bold transition ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-slate-700 text-slate-300 focus:border-[var(--acento)]' : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-[var(--acento)]'}`} 
                  value={numeroSerie} 
                  onChange={(e) => setNumeroSerie(e.target.value)} 
                />
              </div>

            </div>
          </section>

          {/* SECCIÓN 2: INVENTARIO Y UBICACIÓN */}
          <section>
            <h2 className={`text-lg font-bold mb-4 p-3 rounded-lg border flex items-center gap-2 transition-colors ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 text-[var(--acento)] border-white/10' : 'bg-gray-50 text-[var(--acento)] border-gray-200'}`}>
              <span>2️⃣</span> Inventario y Ubicación Física
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className={`p-4 rounded-xl border shadow-inner transition-colors ${config?.temaId === 'obsidian' ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                <label className={`block text-sm font-bold uppercase tracking-wide mb-1 ${config?.temaId === 'obsidian' ? 'text-yellow-500' : 'text-yellow-900'}`}>Cantidad que ingresa *</label>
                <p className={`text-[11px] mb-3 ${config?.temaId === 'obsidian' ? 'text-yellow-600/80' : 'text-yellow-700'}`}>Si tiene Nº de Serie, poné 1. Si son cables genéricos, poné el total.</p>
                <input 
                  type="number" required min="1"
                  className={`w-full border-2 p-3 rounded-lg outline-none font-bold text-2xl text-center transition ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-yellow-500/50 text-yellow-400 focus:border-yellow-400' : 'bg-white border-yellow-300 text-yellow-900 focus:ring-0 focus:border-yellow-500'}`} 
                  value={cantidadTotal} 
                  onChange={(e) => setCantidadTotal(e.target.value)} 
                />
              </div>

              <div className={`p-4 rounded-xl border shadow-inner transition-colors ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <label className={`block text-sm font-bold uppercase tracking-wide mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-700'}`}>Ubicación Física</label>
                <p className={`text-[11px] mb-3 ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>¿En qué armario, caja o sala se guarda permanentemente?</p>
                <input 
                  type="text" 
                  placeholder="Ej: Armario 2 - Preceptoría" 
                  className={`w-full border-2 p-3 rounded-lg outline-none font-medium text-center transition ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-slate-700 text-slate-300 focus:border-[var(--acento)]' : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-[var(--acento)]'}`} 
                  value={ubicacionFisica} 
                  onChange={(e) => setUbicacionFisica(e.target.value)} 
                />
              </div>

            </div>
          </section>

          {/* BOTONES */}
          <div className={`flex flex-col md:flex-row justify-end gap-3 pt-6 border-t mt-8 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
            <Link href="/panol" className={`px-6 py-3 font-bold rounded-xl transition text-center order-2 md:order-1 border md:border-none ${config?.temaId === 'obsidian' ? 'text-slate-400 hover:bg-slate-800 border-slate-700' : 'text-gray-600 hover:bg-gray-100 border-gray-200'}`}>
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={cargando} 
              className={`px-10 py-3 rounded-xl font-bold transition shadow-lg text-lg order-1 md:order-2 flex items-center gap-2 justify-center  ${cargando ? 'bg-[var(--acento)]/50 cursor-wait text-[var(--acento-texto)]' : 'bg-[var(--acento)] hover:brightness-110 text-white'}`}
            >
              {cargando ? '⏳ Guardando...' : '💾 Guardar Material'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
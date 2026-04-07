"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PrestarEquipoPanol({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [material, setMaterial] = useState<any>(null);
  const [cantidad, setCantidad] = useState("1");
  
  // AHORA ES TEXTO LIBRE
  const [nombreSolicitante, setNombreSolicitante] = useState(""); 
  
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // CONFIGURACIÓN Y TEMA
  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  useEffect(() => {
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const cargarMaterial = async () => {
      try {
        const res = await fetch(`http://localhost:5078/api/materiales/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMaterial(data);
        } else {
          alert("No se encontró el material.");
          router.push("/panol");
        }
      } catch (error) {
        alert("Error de conexión.");
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarMaterial();
  }, [id, router]);

  const registrarPrestamo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cantidadNumerica = parseInt(cantidad);
    
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      alert("La cantidad debe ser mayor a cero.");
      return;
    }
    
    if (cantidadNumerica > material.cantidadDisponible) {
      alert(`No podés prestar más de lo que hay. Stock actual: ${material.cantidadDisponible}`);
      return;
    }

    if (!nombreSolicitante.trim()) {
      alert("Debes escribir a quién se lo prestás.");
      return;
    }

    setGuardando(true);

    try {
      const res = await fetch("http://localhost:5078/api/prestamosmateriales/prestar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: parseInt(id),
          nombreSolicitante: nombreSolicitante.trim(), // Mandamos el texto
          cantidad: cantidadNumerica
        }),
      });

      if (res.ok) {
        alert("¡Préstamo registrado con éxito!");
        router.push("/panol");
      } else {
        const err = await res.json();
        alert("Error: " + (err.mensaje || "Revisá los datos."));
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoDatos) return <div className={`min-h-screen p-12 text-center font-bold animate-pulse text-lg transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Cargando datos del equipo...</div>;
  if (!material) return null;

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      {/* NAV SINCRONIZADA AL TEMA */}
      <nav className="p-4 mb-4 shadow-md transition-colors print:hidden bg-[var(--bg-header)] text-[var(--texto-header)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            <h1 className="text-xl font-bold tracking-wider">REGISTRAR PRÉSTAMO</h1>
          </div>
          <Link href="/panol" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition border border-[var(--acento)] shadow-sm">
            Cancelar
          </Link>
        </div>
      </nav>

      <div className={`max-w-3xl mx-auto p-8 rounded-2xl shadow-sm border border-t-4 mt-6 transition-colors ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10 border-t-green-500' : 'bg-white border-gray-200 border-t-green-500'}`}>
        <div className={`border-b pb-4 mb-6 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <h1 className={`text-2xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>Entregar al Docente</h1>
          <p className={`text-sm mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Registrá la salida de este equipo del pañol.</p>
        </div>

        {/* TARJETA DEL MATERIAL */}
        <div className={`border p-5 rounded-xl mb-8 flex justify-between items-center shadow-inner transition-colors ${config?.temaId === 'obsidian' ? 'bg-[var(--acento)]/10 border-[var(--acento)]/30' : 'bg-[var(--acento)]/5 border-[var(--acento)]/20'}`}>
          <div>
            <h3 className={`text-xl font-black ${config?.temaId === 'obsidian' ? 'text-[var(--acento)]' : 'text-[var(--acento)]'}`}>{material.nombre}</h3>
            <p className={`text-sm font-bold uppercase tracking-wide mt-1 ${config?.temaId === 'obsidian' ? 'text-[var(--acento)]/70' : 'text-[var(--acento)]/80'}`}>
              {material.marca || "S/M"} {material.modelo ? `• ${material.modelo}` : ""}
            </p>
            {material.numeroSerie && (
              <p className={`text-xs font-mono mt-2 inline-block px-2 py-1 rounded border ${config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-300 border-slate-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                SN: {material.numeroSerie}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className={`text-xs font-bold uppercase ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Stock Actual</p>
            <p className="text-4xl font-black text-green-500 leading-none mt-1">{material.cantidadDisponible}</p>
          </div>
        </div>

        <form onSubmit={registrarPrestamo} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. SELECCIÓN DE PROFESOR (TEXTO LIBRE) */}
            <div>
              <label className={`block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>¿A quién se lo prestás? *</label>
              <input 
                type="text" required 
                placeholder="Ej: Prof. Juan Pérez - 3ro B" 
                className={`w-full border-2 p-3 rounded-lg outline-none font-bold text-lg transition ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-600 text-[var(--acento)] focus:border-[var(--acento)] placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-[var(--acento)] focus:ring-0 focus:border-[var(--acento)]'}`} 
                value={nombreSolicitante} 
                onChange={(e) => setNombreSolicitante(e.target.value)} 
              />
              <p className={`text-[11px] font-medium mt-1 pl-1 ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>
                Escribí el nombre y el curso/destino.
              </p>
            </div>

            {/* 2. CANTIDAD A LLEVARSE */}
            <div>
              <label className={`block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>¿Cuántos se lleva? *</label>
              <input 
                type="number" required min="1" max={material.cantidadDisponible}
                className={`w-full border-2 p-3 rounded-lg outline-none font-black text-2xl text-center transition ${config?.temaId === 'obsidian' ? 'bg-green-900/20 border-green-500/50 text-green-400 focus:border-green-400' : 'bg-green-50 border-green-300 text-green-800 focus:ring-0 focus:border-green-500'}`} 
                value={cantidad} 
                onChange={(e) => setCantidad(e.target.value)} 
                disabled={material.cantidadDisponible === 1}
                title={material.cantidadDisponible === 1 ? "Solo hay 1 unidad disponible" : ""}
              />
            </div>
          </div>

          <div className={`flex justify-end pt-6 border-t mt-8 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
            <button 
              type="submit" 
              disabled={guardando} 
              className={`px-10 py-3.5 rounded-xl font-bold text-white transition shadow-lg text-lg flex items-center gap-2 justify-center ${guardando ? (config?.temaId === 'obsidian' ? 'bg-[var(--acento)] cursor-wait text-white' : 'bg-[var(--acento)] cursor-wait') : (config?.temaId === 'obsidian' ? 'bg-[var(--acento)] hover:bg-[var(--acento-hover)]' : 'bg-[var(--acento)] hover:brightness-110')}`}
            >
              {guardando ? '⏳ Procesando...' : '✅ Confirmar Entrega'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
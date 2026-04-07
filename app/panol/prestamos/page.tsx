"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PrestamosActivosPanol() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  // CONFIGURACIÓN Y TEMA
  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  useEffect(() => {
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error(err));
  }, []);

  const cargarPrestamos = async () => {
    try {
      const res = await fetch("http://localhost:5078/api/prestamosmateriales/activos");
      if (res.ok) {
        const data = await res.json();
        setPrestamos(data);
      }
    } catch (error) {
      console.error("Error al cargar los préstamos activos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const devolverEquipo = async (id: number) => {
    const confirmar = window.confirm("¿Confirmar que el equipo fue devuelto correctamente?");
    if (!confirmar) return;

    setProcesandoId(id);

    try {
      const res = await fetch(`http://localhost:5078/api/prestamosmateriales/devolver/${id}`, {
        method: "POST",
      });

      if (res.ok) {
        alert("¡Devolución exitosa! El stock se actualizó.");
        // Recargamos la lista para que desaparezca el que acabamos de devolver
        cargarPrestamos();
      } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.mensaje || "No se pudo procesar la devolución."));
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    } finally {
      setProcesandoId(null);
    }
  };

  if (cargando) return <div className={`min-h-screen p-12 text-center font-bold animate-pulse text-lg transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Buscando equipos prestados...</div>;

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      {/* NAV SINCRONIZADA AL TEMA */}
      <nav className="p-4 shadow-md transition-colors print:hidden bg-[var(--bg-header)] text-[var(--texto-header)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-wider">EQUIPOS EN USO (PRÉSTAMOS)</h1>
          </div>
          <Link href="/panol" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm border border-[var(--acento)]">
            Volver al Inventario
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className={`flex justify-between items-end mb-6 border-b pb-4 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-3xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>Control de Devoluciones</h2>
            <p className={`mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Acá figuran todos los equipos tecnológicos que están fuera del pañol en este momento.</p>
          </div>
        </div>

        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`uppercase tracking-wider border-b ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 text-slate-400 border-white/10' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  <th className="px-6 py-4 font-bold text-xs">Docente / Destino</th>
                  <th className="px-6 py-4 font-bold text-xs">Equipo Retirado</th>
                  <th className="px-6 py-4 font-bold text-xs text-center">Cant.</th>
                  <th className="px-6 py-4 font-bold text-xs">Fecha de Salida</th>
                  <th className="px-6 py-4 font-bold text-xs text-right">Acción</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${config?.temaId === 'obsidian' ? 'divide-white/5' : 'divide-gray-100'}`}>
                {prestamos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-6 py-12 text-center font-medium ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>
                      Todo está en orden. No hay equipos prestados en este momento.
                    </td>
                  </tr>
                ) : (
                  prestamos.map((p) => (
                    <tr key={p.id} className={`transition ${config?.temaId === 'obsidian' ? 'hover:bg-slate-800/60' : 'hover:bg-gray-50'}`}>
                      
                      {/* 1. Quién lo tiene */}
                      <td className="px-6 py-4">
                        <span className={`font-bold block text-lg ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                          {p.nombreSolicitante}
                        </span>
                      </td>

                      {/* 2. Qué se llevó */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-[var(--acento)] block">
                          {p.material?.nombre || "Equipo desconocido"}
                        </span>
                        {p.material?.numeroSerie && (
                          <span className={`text-xs font-mono px-2 py-0.5 rounded mt-1 inline-block border ${config?.temaId === 'obsidian' ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            SN: {p.material.numeroSerie}
                          </span>
                        )}
                      </td>

                      {/* 3. Cantidad */}
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xl font-black ${config?.temaId === 'obsidian' ? 'text-slate-200' : 'text-gray-800'}`}>
                          {p.cantidadPrestada}
                        </span>
                      </td>

                      {/* 4. Cuándo se lo llevó */}
                      <td className="px-6 py-4">
                        <span className={`block text-sm font-medium ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-700'}`}>
                          {new Date(p.fechaSalida).toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })} hs
                        </span>
                      </td>

                      {/* 5. Botón Devolver */}
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => devolverEquipo(p.id)}
                          disabled={procesandoId === p.id}
                          className={`text-sm px-4 py-2 rounded-lg font-bold transition shadow-sm ${
                            procesandoId === p.id 
                              ? (config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-500 cursor-wait border border-slate-700' : 'bg-gray-200 text-gray-500 cursor-wait border border-gray-300') 
                              : (config?.temaId === 'obsidian' ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' : 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 hover:shadow-md')
                          }`}
                        >
                          {procesandoId === p.id ? '⏳ Procesando...' : '📥 Recibir Devolución'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
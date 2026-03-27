"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PrestamosActivosPanol() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

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

  if (cargando) return <div className="p-12 text-center text-blue-900 font-bold animate-pulse text-lg">Buscando equipos prestados...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      {/* NAV AZUL */}
      <nav className="bg-blue-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-wider">EQUIPOS EN USO (PRÉSTAMOS)</h1>
          </div>
          <Link href="/panol" className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition border border-blue-700">
            Volver al Inventario
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Control de Devoluciones</h2>
            <p className="text-gray-500 mt-1">Acá figuran todos los equipos tecnológicos que están fuera del pañol en este momento.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50 text-blue-900 uppercase tracking-wider border-b border-blue-200">
                  <th className="px-6 py-4 font-bold text-xs">Docente / Destino</th>
                  <th className="px-6 py-4 font-bold text-xs">Equipo Retirado</th>
                  <th className="px-6 py-4 font-bold text-xs text-center">Cant.</th>
                  <th className="px-6 py-4 font-bold text-xs">Fecha de Salida</th>
                  <th className="px-6 py-4 font-bold text-xs text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prestamos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                      Todo está en orden. No hay equipos prestados en este momento.
                    </td>
                  </tr>
                ) : (
                  prestamos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      
                      {/* 1. Quién lo tiene */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 block text-lg">
                          {p.nombreSolicitante}
                        </span>
                      </td>

                      {/* 2. Qué se llevó */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-900 block">
                          {p.material?.nombre || "Equipo desconocido"}
                        </span>
                        {p.material?.numeroSerie && (
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                            SN: {p.material.numeroSerie}
                          </span>
                        )}
                      </td>

                      {/* 3. Cantidad */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-xl font-black text-gray-800">
                          {p.cantidadPrestada}
                        </span>
                      </td>

                      {/* 4. Cuándo se lo llevó */}
                      <td className="px-6 py-4">
                        <span className="block text-sm font-medium text-gray-700">
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
                              ? 'bg-gray-200 text-gray-500 cursor-wait' 
                              : 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 hover:shadow-md'
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
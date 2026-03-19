"use client";

import { useState } from "react";
import Link from "next/link";

export default function BuscarLector() {
  const [dniInput, setDniInput] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [error, setError] = useState("");
  const [buscando, setBuscando] = useState(false);

  const buscarPorDni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dniInput) return;

    setBuscando(true);
    setError("");
    setUsuario(null);

    try {
      // Limpiamos los puntos antes de mandar por las dudas
      const dniLimpio = dniInput.replace(/\./g, '').trim();
      const res = await fetch(`http://localhost:5078/api/usuarios/buscar/${dniLimpio}`);
      
      if (res.ok) {
        const data = await res.json();
        setUsuario(data);
      } else {
        const errData = await res.json();
        setError(errData.mensaje || "Lector no encontrado.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-slate-800 text-white p-4 shadow-md">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <h1 className="text-xl font-bold tracking-wider">BUSCAR LECTOR</h1>
          </div>
          <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            Volver al Inicio
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-8 mt-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500">
          <form onSubmit={buscarPorDni} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Ingrese el DNI del Lector</label>
              <input 
                type="text" 
                placeholder="Ej: 34588690"
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:ring-0 outline-none text-lg font-medium"
                value={dniInput}
                onChange={(e) => setDniInput(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={buscando || !dniInput}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-8 rounded-xl transition shadow-md"
            >
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-medium">
              ⚠️ {error}
            </div>
          )}

          {usuario && (
            <div className="mt-8 border-t pt-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Resultado de la búsqueda</h3>
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{usuario.nombre} {usuario.apellido}</h2>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600 font-medium">
                    <span className="bg-white px-2 py-1 rounded border shadow-sm">DNI: {usuario.dni}</span>
                    <span className="bg-white px-2 py-1 rounded border shadow-sm">{usuario.rol || "Lector"}</span>
                    {usuario.curso && <span className="bg-white px-2 py-1 rounded border shadow-sm">Curso: {usuario.curso}</span>}
                  </div>
                </div>
                
                {/* ACÁ ESTÁ EL ENLACE A TU PÁGINA DE EDITAR */}
                <Link 
                  href={`/usuarios/editar/${usuario.id}`} 
                  className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-6 py-3 rounded-xl font-bold border border-yellow-300 transition shadow-sm flex items-center gap-2"
                >
                  ✏️ Editar Datos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
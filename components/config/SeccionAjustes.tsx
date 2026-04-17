"use client";

import { useState, useEffect } from "react";

export default function SeccionAjustes() {
  const [config, setConfig] = useState({
    id: 1, // Por defecto asumimos el registro 1 de tu BD
    diasPrestamo: 7,
    maxLibrosPorPersona: 3
  });
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // 1. CARGAR LA CONFIGURACIÓN ACTUAL AL ENTRAR
  useEffect(() => {
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setConfig(data);
        }
      })
      .catch(err => console.error("Error cargando configuración:", err))
      .finally(() => setCargando(false));
  }, []);

  // 2. GUARDAR LOS CAMBIOS EN LA BASE DE DATOS
  const manejarGuardar = async () => {
    setGuardando(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      // Hacemos un PUT al backend para actualizar el registro
      const res = await fetch(`http://localhost:5078/api/configuracion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        setMensaje({ texto: "¡Ajustes guardados con éxito!", tipo: "exito" });
      } else {
        setMensaje({ texto: "Error al guardar los ajustes.", tipo: "error" });
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión con el servidor.", tipo: "error" });
    } finally {
      setGuardando(false);
      // Borramos el cartel verde después de 3 segundos
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
    }
  };

  if (cargando) {
    return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">Cargando ajustes del sistema...</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">⏳ Ajustes de Préstamo</h2>

      {/* ALERTAS VISUALES */}
      {mensaje.texto && (
        <div className={`p-4 rounded-2xl mb-6 font-bold text-sm transition-all ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {mensaje.tipo === 'exito' ? '✅' : '⚠️'} {mensaje.texto}
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* INPUT: DÍAS DE PRÉSTAMO */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-2">
            Días de Préstamo por defecto
          </label>
          <input 
            type="number" 
            min="1"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-bold text-gray-800 transition" 
            value={config.diasPrestamo}
            onChange={(e) => setConfig({...config, diasPrestamo: parseInt(e.target.value) || 1})}
          />
          <p className="text-xs text-gray-500 mt-3 font-medium leading-relaxed">
            Es el tiempo estándar antes de que un libro figure como vencido. Si ponés 7, el sistema calcula la devolución para la misma fecha la próxima semana.
          </p>
        </div>
        
        {/* INPUT: MÁXIMO DE LIBROS */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-2">
            Máximo de libros por persona
          </label>
          <input 
            type="number" 
            min="1"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-bold text-gray-800 transition" 
            value={config.maxLibrosPorPersona}
            onChange={(e) => setConfig({...config, maxLibrosPorPersona: parseInt(e.target.value) || 1})}
          />
          <p className="text-xs text-gray-500 mt-3 font-medium leading-relaxed">
            Límite de ejemplares que un lector puede tener en simultáneo. Si un alumno intenta sacar más libros, el sistema lanzará una advertencia.
          </p>
        </div>

      </div>

      {/* BOTÓN GUARDAR */}
      <div className="mt-8 flex justify-end">
        <button 
          onClick={manejarGuardar}
          disabled={guardando}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg disabled:opacity-50 active:scale-95"
        >
          {guardando ? 'Guardando cambios...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
}
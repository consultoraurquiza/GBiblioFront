"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MigracionPage() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [grupoOrigenId, setGrupoOrigenId] = useState("");
  const [grupoDestinoId, setGrupoDestinoId] = useState("");
  
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  
  const [cargando, setCargando] = useState(false);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';
  const inputBaseClass = `w-full border p-2.5 rounded-lg outline-none transition font-medium ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-purple-500 text-gray-900'}`;

  // Cargar grupos al iniciar (A PRUEBA DE ERRORES)
  useEffect(() => {
    // 1. Fetch Configuración seguro
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setConfig(data);
      })
      .catch(() => console.log("Cargando config por defecto..."));

    // 2. Fetch Grupos seguro
    fetch("http://localhost:5078/api/grupos")
      .then(res => res.ok ? res.json() : []) // Si falla, devuelve array vacío en vez de romper
      .then(data => setGrupos(data))
      .catch(err => console.error("Error al cargar grupos:", err));
  }, []);

  // Cargar alumnos cuando cambia el grupo de origen (A PRUEBA DE ERRORES)
  useEffect(() => {
    if (!grupoOrigenId) {
      setAlumnos([]);
      setSeleccionados([]);
      return;
    }

    setCargandoAlumnos(true);
    fetch(`http://localhost:5078/api/usuarios/por-grupo/${grupoOrigenId}`)
      .then(res => res.ok ? res.json() : []) // Si falla, devuelve array vacío
      .then(data => {
        setAlumnos(data);
        setSeleccionados([]); // Limpiamos selección al cambiar de grupo
      })
      .catch(err => console.error("Error al cargar alumnos:", err))
      .finally(() => setCargandoAlumnos(false));
  }, [grupoOrigenId]);

  const toggleSeleccion = (id: number) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(sId => sId !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const toggleSeleccionarTodos = () => {
    if (seleccionados.length === alumnos.length) {
      setSeleccionados([]); // Deseleccionar todos
    } else {
      setSeleccionados(alumnos.map(a => a.id)); // Seleccionar todos
    }
  };

  const ejecutarMigracion = async () => {
    if (grupoOrigenId === grupoDestinoId) {
      setMensaje({ texto: "El grupo de destino no puede ser igual al de origen.", tipo: "error" });
      return;
    }
    
    setCargando(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      const res = await fetch("http://localhost:5078/api/grupos/migrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioIds: seleccionados,
          nuevoGrupoId: parseInt(grupoDestinoId)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ texto: data.mensaje, tipo: "exito" });
        // Refrescamos la lista de origen (los que se migraron ya no deberían salir)
        setAlumnos(alumnos.filter(a => !seleccionados.includes(a.id)));
        setSeleccionados([]);
      } else {
        setMensaje({ texto: data.mensaje || "Error al migrar", tipo: "error" });
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión con el servidor.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      <nav className="p-4 mb-8 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <h1 className="text-xl font-bold tracking-wider">MIGRACIÓN DE ALUMNOS</h1>
          </div>
          <Link href="/usuarios" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
             Volver a Usuarios
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4">
        
        {mensaje.texto && (
          <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje.tipo === 'exito' ? '✅' : '⚠️'} {mensaje.texto}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA ORIGEN */}
          <div className={`p-6 rounded-2xl shadow-sm border ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>
              <span className="text-red-500">📤</span> 1. Grupo Origen
            </h2>
            <select 
              className={`${inputBaseClass} mb-4`}
              value={grupoOrigenId}
              onChange={(e) => setGrupoOrigenId(e.target.value)}
            >
              <option value="">-- Seleccione el curso actual --</option>
              {grupos.map(g => (
                <option key={g.id} value={g.id}>{g.nombre} ({g.turno})</option>
              ))}
            </select>

            {grupoOrigenId && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-sm font-bold ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>
                    {alumnos.length} alumnos encontrados
                  </span>
                  {alumnos.length > 0 && (
                    <button onClick={toggleSeleccionarTodos} className="text-[var(--acento)] text-sm font-bold hover:underline">
                      {seleccionados.length === alumnos.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                    </button>
                  )}
                </div>

                <div className={`max-h-96 overflow-y-auto rounded-lg border ${config?.temaId === 'obsidian' ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50'} p-2 space-y-1`}>
                  {cargandoAlumnos ? (
                    <p className="text-center p-4 text-sm">Cargando lista...</p>
                  ) : alumnos.length === 0 ? (
                    <p className="text-center p-4 text-sm text-gray-500">Este grupo no tiene alumnos asignados.</p>
                  ) : (
                    alumnos.map(a => (
                      <label key={a.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${seleccionados.includes(a.id) ? (config?.temaId === 'obsidian' ? 'bg-[var(--acento)]/20' : 'bg-purple-100') : 'hover:bg-gray-100/10'}`}>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          checked={seleccionados.includes(a.id)}
                          onChange={() => toggleSeleccion(a.id)}
                        />
                        <span className={`font-medium ${config?.temaId === 'obsidian' ? 'text-slate-200' : 'text-gray-700'}`}>
                          {a.apellido}, {a.nombre}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">{a.dni}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DESTINO */}
          <div className={`p-6 rounded-2xl shadow-sm border ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>
              <span className="text-green-500">📥</span> 2. Grupo Destino
            </h2>
            <select 
              className={`${inputBaseClass} mb-6`}
              value={grupoDestinoId}
              onChange={(e) => setGrupoDestinoId(e.target.value)}
            >
              <option value="">-- Seleccione a dónde promoverlos --</option>
              {grupos.map(g => (
                <option key={g.id} value={g.id} disabled={g.id.toString() === grupoOrigenId}>
                  {g.nombre} ({g.turno})
                </option>
              ))}
            </select>

            <div className={`p-6 rounded-xl border flex flex-col items-center text-center ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
              <span className="text-4xl mb-3">🚀</span>
              <h3 className={`font-bold mb-2 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>
                Resumen de Operación
              </h3>
              <p className={`text-sm mb-6 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>
                Vas a transferir a <strong>{seleccionados.length} alumnos</strong> al nuevo curso seleccionado.
              </p>
              
              <button 
                onClick={ejecutarMigracion}
                disabled={seleccionados.length === 0 || !grupoDestinoId || cargando}
                className="w-full bg-[var(--acento)] hover:brightness-110 text-[var(--acento-texto)] py-3 rounded-xl font-bold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? 'Transfiriendo...' : 'Confirmar Migración'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
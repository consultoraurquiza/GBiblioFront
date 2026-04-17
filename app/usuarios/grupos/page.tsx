"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function GruposPage() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargandoLista, setCargandoLista] = useState(true);

  // Estados del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: "", turno: "Mañana", habilitado: true });
  const [cargandoGuardar, setCargandoGuardar] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState("");

  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';
  const inputBaseClass = `w-full border p-2.5 rounded-lg outline-none transition font-medium ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-purple-500 text-gray-900'}`;

  const cargarGrupos = useCallback(async () => {
    setCargandoLista(true);
    try {
      const url = new URL("http://localhost:5078/api/grupos");
      if (busqueda) url.searchParams.append("busqueda", busqueda);

      const res = await fetch(url.toString());
      if (res.ok) setGrupos(await res.json());
    } catch (error) {
      console.error("Error al cargar grupos:", error);
    } finally {
      setCargandoLista(false);
    }
  }, [busqueda]);

  useEffect(() => {
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => console.log("Usando tema por defecto"));
    cargarGrupos();
  }, [cargarGrupos]);

  const manejarGuardar = async () => {
    setErrorValidacion("");
    setCargandoGuardar(true);

    try {
      const metodo = grupoEditando ? "PUT" : "POST";
      const url = grupoEditando ? `http://localhost:5078/api/grupos/${grupoEditando.id}` : "http://localhost:5078/api/grupos";
      const payload = grupoEditando ? { ...formData, id: grupoEditando.id } : formData;

      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setModalAbierto(false);
        cargarGrupos();
      } else {
        const errData = await res.json();
        setErrorValidacion(errData.mensaje || "Error al guardar el grupo.");
      }
    } catch (error) {
      setErrorValidacion("Error de conexión.");
    } finally {
      setCargandoGuardar(false);
    }
  };

  const abrirModalNuevo = () => {
    setGrupoEditando(null);
    setFormData({ nombre: "", turno: "Mañana", habilitado: true });
    setErrorValidacion("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (grupo: any) => {
    setGrupoEditando(grupo);
    setFormData({ nombre: grupo.nombre, turno: grupo.turno, habilitado: grupo.habilitadoParaPrestamos  });
    setErrorValidacion("");
    setModalAbierto(true);
  };

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      <nav className="p-4 mb-8 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏫</span>
            <h1 className="text-xl font-bold tracking-wider">GESTIÓN DE GRUPOS Y AULAS</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/usuarios" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
               Volver a Usuarios
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4">
        <div className={`p-4 rounded-2xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-center justify-between ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="relative flex-1 max-w-md w-full">
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre de grupo..." 
              className={`${inputBaseClass} pl-10`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && cargarGrupos()}
            />
          </div>
          <button onClick={abrirModalNuevo} className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
            <span>➕</span> Crear Grupo
          </button>
        </div>

        <div className={`rounded-2xl shadow-sm border overflow-hidden ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10' : 'bg-white border-gray-200'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${config?.temaId === 'obsidian' ? 'border-slate-700 bg-slate-800/50 text-slate-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                <th className="p-4 font-bold text-sm">Nombre del Grupo</th>
                <th className="p-4 font-bold text-sm">Turno</th>
                <th className="p-4 font-bold text-sm text-center">Cant. Alumnos</th>
                <th className="p-4 font-bold text-sm text-center">Habilitado Préstamos</th>
                <th className="p-4 font-bold text-sm text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargandoLista ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">Cargando...</td></tr>
              ) : grupos.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No hay grupos registrados.</td></tr>
              ) : (
                grupos.map((g) => (
                  <tr key={g.id} className={`border-b last:border-0 transition-colors ${config?.temaId === 'obsidian' ? 'border-slate-800 hover:bg-slate-800/50 text-slate-300' : 'border-gray-100 hover:bg-gray-50 text-gray-700'}`}>
                    <td className="p-4 font-bold text-lg">{g.nombre}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${g.turno === 'Mañana' ? 'bg-yellow-100 text-yellow-800' : g.turno === 'Tarde' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {g.turno}
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium">{g.cantidadAlumnos || 0}</td>
                    <td className="p-4 font-bold text-lg">{g.habilitadoParaPrestamos ? '✅' : '❌'}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => abrirModalEditar(g)} className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border-t-4 border-[var(--acento)] ${config?.temaId === 'obsidian' ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`p-6 border-b ${config?.temaId === 'obsidian' ? 'border-slate-800' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>
                {grupoEditando ? 'Editar Grupo' : 'Nuevo Grupo'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {errorValidacion && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-200">⚠️ {errorValidacion}</div>}
              <div>
                <label className={`block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>Nombre (Ej: 1ero A) *</label>
                <input type="text" autoFocus className={inputBaseClass} value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>Turno *</label>
                <select className={inputBaseClass} value={formData.turno} onChange={(e) => setFormData({...formData, turno: e.target.value})}>
                  <option value="Mañana">☀️ Mañana</option>
                  <option value="Tarde">🌤️ Tarde</option>
                  <option value="Vespertino">🌙 Vespertino</option>
                </select>
              </div>
              <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between transition-colors ${formData.habilitado ? (config?.temaId === 'obsidian' ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200') : (config?.temaId === 'obsidian' ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200')}`}>
                <div>
                  <p className={`font-bold text-sm ${formData.habilitado ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.habilitado ? '✅ Habilitado para Préstamos' : '🚫 Suspendido / Inhabilitado'}
                  </p>
                  <p className={`text-xs mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>
                    {formData.habilitado ? 'El grupo puede retirar libros.' : 'El grupo no puede retirar libros.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.habilitado} onChange={(e) => setFormData({ ...formData, habilitado: e.target.checked })} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
            <div className={`p-4 flex justify-end gap-3 border-t ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
              <button onClick={() => setModalAbierto(false)} className={`px-5 py-2 rounded-lg font-bold transition ${config?.temaId === 'obsidian' ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-200'}`}>Cancelar</button>
              <button onClick={manejarGuardar} disabled={!formData.nombre.trim() || cargandoGuardar} className="bg-[var(--acento)] hover:brightness-110 text-[var(--acento-texto)] px-5 py-2 rounded-lg font-bold transition shadow-md disabled:opacity-50">
                {cargandoGuardar ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
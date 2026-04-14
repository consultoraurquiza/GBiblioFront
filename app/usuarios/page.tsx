"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function UsuariosPage() {
  // ESTADOS DE LA PANTALLA PRINCIPAL
  const [busqueda, setBusqueda] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState("todos");
  const [usuarios, setUsuarios] = useState<any[]>([]); 
  const [cargandoLista, setCargandoLista] = useState(true);
  const [gruposDisponibles, setGruposDisponibles] = useState<any[]>([]);

  // ESTADO DEL MODAL Y FORMULARIO
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null); 
  const [cargandoGuardar, setCargandoGuardar] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState("");

  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    telefono: "",
    rol: 0, 
    grupoId: "",
    puedePedirPrestado: true
  });

  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  // ==========================================
  // 1. CARGAR USUARIOS DESDE LA API
  // ==========================================
  const cargarUsuarios = useCallback(async () => {
    setCargandoLista(true);
    try {
      const url = new URL("http://localhost:5078/api/usuarios");
      if (busqueda) url.searchParams.append("busqueda", busqueda);
      if (grupoFiltro !== "todos") url.searchParams.append("grupoFiltro", grupoFiltro);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setCargandoLista(false);
    }
  }, [busqueda, grupoFiltro]);

  // Se ejecuta al inicio y cada vez que cambia el filtro de grupo
  useEffect(() => {
    // Simulamos la carga de configuración
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => console.log("Usando tema por defecto"));

    cargarUsuarios();

    fetch("http://localhost:5078/api/grupos")
      .then(res => res.json())
      .then(data => setGruposDisponibles(data))
      .catch(err => console.error(err));
  }, [cargarUsuarios]);

  // ==========================================
  // 2. GUARDAR (CREAR O EDITAR)
  // ==========================================
  const manejarGuardar = async () => {
    setErrorValidacion("");
    setCargandoGuardar(true);

    try {
      const metodo = usuarioEditando ? "PUT" : "POST";
      const url = usuarioEditando 
        ? `http://localhost:5078/api/usuarios/${usuarioEditando.id}` 
        : "http://localhost:5078/api/usuarios";

      // Si estamos editando, inyectamos el ID al objeto que mandamos
      // 👇 ACÁ ESTÁ LA MAGIA DE LIMPIEZA DE DATOS 👇
      let payload: any = { ...formData };
      
      // Si es profe o admin, forzamos el grupo a null.
      // Si es alumno, convertimos el string a número (o a null si está vacío).
      if (payload.rol !== 0) {
        payload.grupoId = null;
      } else {
        payload.grupoId = payload.grupoId === "" ? null : parseInt(payload.grupoId as string);
      }

      // Si estamos editando, le inyectamos el ID
      if (usuarioEditando) {
        payload.id = usuarioEditando.id;
      }

      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setModalAbierto(false);
        cargarUsuarios(); // Recargamos la tabla para ver los cambios
        alert(`¡Usuario ${usuarioEditando ? "actualizado" : "creado"} con éxito!`);
      } else {
        const errData = await res.json();
        setErrorValidacion(errData.mensaje || "Ocurrió un error al guardar.");
      }
    } catch (error) {
      setErrorValidacion("Error de conexión con el servidor.");
    } finally {
      setCargandoGuardar(false);
    }
  };

  // Funciones para abrir el modal limpios
  const abrirModalNuevo = () => {
    setUsuarioEditando(null);
    setFormData({ dni: "", nombre: "", apellido: "", telefono: "", rol: 0, grupoId: "", puedePedirPrestado: true });
    setErrorValidacion("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario: any) => {
    setUsuarioEditando(usuario);
    setFormData({
      dni: usuario.dni || "", 
      nombre: usuario.nombre || "", 
      apellido: usuario.apellido || "", 
      telefono: usuario.telefono || "", 
      rol: usuario.rol || 0, 
      // 👇 Aseguramos que si viene nulo, el select reciba un string vacío
      grupoId: usuario.grupoId ? usuario.grupoId.toString() : "", 
      puedePedirPrestado: usuario.puedePedirPrestado !== false
    });
    setErrorValidacion("");
    setModalAbierto(true);
  };

  const inputBaseClass = `w-full border p-2.5 rounded-lg outline-none transition font-medium ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-purple-500 text-gray-900'}`;

  // Función auxiliar para mostrar el rol lindo en la tabla
  const formatearRol = (rolId: number, grupo: any) => {
    if (rolId === 0) return grupo ? `🎓 Alumno (${grupo.nombre})` : `🎓 Alumno (Sin asignar)`;
    if (rolId === 1) return `👨‍🏫 Profesor`;
    if (rolId === 2) return `⚙️ Administrador`;
    return "Desconocido";
  };

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      
      <nav className="p-4 mb-8 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <h1 className="text-xl font-bold tracking-wider">GESTIÓN DE USUARIOS</h1>
          </div>
          <Link href="/admin" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
            Volver al Catalogo
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* BARRA DE HERRAMIENTAS */}
        <div className={`p-4 rounded-2xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-center justify-between ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-1 w-full gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por nombre o DNI (Presione Enter)..." 
                className={`${inputBaseClass} pl-10`}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && cargarUsuarios()}
              />
            </div>
            <select 
              className={`${inputBaseClass} max-w-[200px] cursor-pointer`}
              value={grupoFiltro}
              onChange={(e) => setGrupoFiltro(e.target.value)}
            >
              <option value="todos">Todos los grupos</option>
              <option value="alumnos">🎓 Alumnos</option>
              <option value="docentes">👨‍🏫 Docentes</option>
              <option value="admin">⚙️ Administrativos</option>
            </select>
          </div>
          <Link href="/usuarios/migracion" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
            Migrar Alumnos
          </Link>
          <Link href="/usuarios/grupos" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
            Grupos
          </Link>
          <button onClick={abrirModalNuevo} className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
            <span>➕</span> Nuevo Usuario
          </button>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10' : 'bg-white border-gray-200'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${config?.temaId === 'obsidian' ? 'border-slate-700 bg-slate-800/50 text-slate-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                <th className="p-4 font-bold text-sm">Nombre y Apellido</th>
                <th className="p-4 font-bold text-sm">DNI</th>
                <th className="p-4 font-bold text-sm">Grupo / Rol</th>
                <th className="p-4 font-bold text-sm">Estado</th>
                <th className="p-4 font-bold text-sm text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargandoLista ? (
                <tr>
                  <td colSpan={5} className={`text-center py-12 font-medium ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-400'}`}>
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`text-center py-12 font-medium ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-400'}`}>
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className={`border-b last:border-0 transition-colors ${config?.temaId === 'obsidian' ? 'border-slate-800 hover:bg-slate-800/50 text-slate-300' : 'border-gray-100 hover:bg-gray-50 text-gray-700'}`}>
                    <td className="p-4 font-medium">{u.apellido}, {u.nombre}</td>
                    <td className="p-4">{u.dni}</td>
                    <td className="p-4">{formatearRol(u.rol, u.grupo)}</td>
                    <td className="p-4">
                      {u.puedePedirPrestado ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Activo</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Suspendido</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => abrirModalEditar(u)} className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
                        ✏️ Ver/Editar
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
          <div className={`rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border-t-4 border-[var(--acento)] ${config?.temaId === 'obsidian' ? 'bg-slate-900' : 'bg-white'}`}>
            
            <div className={`p-6 border-b ${config?.temaId === 'obsidian' ? 'border-slate-800' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>
                {usuarioEditando ? '✏️ Editar Usuario' : '👤 Agregar Nuevo Usuario'}
              </h2>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {errorValidacion && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-200">
                  ⚠️ {errorValidacion}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>Nombre *</label>
                  <input type="text" required className={inputBaseClass} value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>Apellido *</label>
                  <input type="text" required className={inputBaseClass} value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>DNI *</label>
                  <input type="text" required className={inputBaseClass} value={formData.dni} onChange={(e) => setFormData({...formData, dni: e.target.value})} placeholder="Sin puntos" />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>Teléfono</label>
                  <input type="text" className={inputBaseClass} value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>Rol / Perfil *</label>
                <select className={inputBaseClass} value={formData.rol} onChange={(e) => setFormData({...formData, rol: parseInt(e.target.value)})}>
                  <option value={0}>🎓 Alumno</option>
                  <option value={1}>👨‍🏫 Profesor</option>
                  <option value={2}>⚙️ Administrador</option>
                </select>
              </div>

              {/* CAMPOS CONDICIONALES: Solo se muestran si es Alumno (Rol 0) */}
              {formData.rol === 0 && (
                <div className={`p-4 rounded-xl border animate-fade-in ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>
                    Asignar a un Curso / Grupo *
                  </label>
                  <select 
                    className={inputBaseClass} 
                    value={formData.grupoId} 
                    onChange={(e) => setFormData({...formData, grupoId: e.target.value})}
                    required={formData.rol === 0}
                  >
                    <option value="">-- Seleccione un curso --</option>
                    {gruposDisponibles.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.nombre} ({g.turno})
                      </option>
                    ))}
                  </select>
                  {gruposDisponibles.length === 0 && (
                    <p className="text-xs text-red-500 mt-2 font-bold">⚠️ Primero debe crear grupos en la sección "Gestión de Grupos".</p>
                  )}
                </div>
              )}

              <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between transition-colors ${formData.puedePedirPrestado ? (config?.temaId === 'obsidian' ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200') : (config?.temaId === 'obsidian' ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200')}`}>
                <div>
                  <p className={`font-bold text-sm ${formData.puedePedirPrestado ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.puedePedirPrestado ? '✅ Habilitado para Préstamos' : '🚫 Suspendido / Inhabilitado'}
                  </p>
                  <p className={`text-xs mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>
                    {formData.puedePedirPrestado ? 'El usuario puede retirar libros normalmente.' : 'Útil si el usuario adeuda libros o tiene sanciones.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.puedePedirPrestado} onChange={(e) => setFormData({...formData, puedePedirPrestado: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

            </div>

            <div className={`p-4 flex justify-end gap-3 border-t ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
              <button 
                type="button"
                onClick={() => setModalAbierto(false)}
                className={`px-5 py-2 rounded-lg font-bold transition ${config?.temaId === 'obsidian' ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={manejarGuardar}
                disabled={!formData.nombre || !formData.apellido || !formData.dni || cargandoGuardar}
                className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
              
                {cargandoGuardar ? 'Guardando...' : (usuarioEditando ? 'Actualizar Ficha' : 'Guardar Usuario')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
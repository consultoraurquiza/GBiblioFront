"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BotonDevolver from "@/components/BotonDevolver";

export default function HistorialPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [filtro, setFiltro] = useState("activos");
  const [cargando, setCargando] = useState(true);

  // CONFIGURACIÓN Y TEMA
  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  useEffect(() => {
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error(err));
  }, []);

  const cargarPrestamos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`http://localhost:5078/api/prestamos?filtro=${filtro}`);
      if (res.ok) {
        const data = await res.json();
        setPrestamos(data);
      }
    } catch (error) {
      console.error("Error al cargar los préstamos", error);
    } finally {
      setCargando(false);
    }
  }, [filtro]);



  // Cada vez que cambia el filtro en el Select, volvemos a llamar a C#
  useEffect(() => {
    // const cargarPrestamos = async () => {
    //   setCargando(true);
    //   try {
    //     const res = await fetch(`http://localhost:5078/api/prestamos?filtro=${filtro}`);
    //     if (res.ok) {
    //       const data = await res.json();
    //       setPrestamos(data);
    //     }
    //   } catch (error) {
    //     console.error("Error al cargar los préstamos", error);
    //   } finally {
    //     setCargando(false);
    //   }
    // };

    cargarPrestamos();
  }, [cargarPrestamos]);

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      {/* Barra de Navegación */}
      <nav className="p-4 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h1 className="text-xl font-bold tracking-wider">MOSTRADOR DE CIRCULACIÓN</h1>
          </div>
          <Link href="/admin" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition border border-[var(--acento)] shadow-sm">
            Volver al Catálogo
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">

        {/* Cabecera */}
        <div className={`flex justify-between items-end mb-6 border-b pb-4 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-3xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>Préstamos Activos</h2>
            <p className={`mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Gestión de devoluciones y reclamos por vencimiento.</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold border shadow-sm ${config?.temaId === 'obsidian' ? 'bg-[var(--acento)]/20 text-[var(--acento)] border-[var(--acento)]/40' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
            Total en circulación: {prestamos.length}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 items-center w-full md:w-auto pb-4">
          <label className={`font-bold text-sm uppercase tracking-wide ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-700'}`}>Filtro:</label>
          <select
            className={`border-2 text-sm rounded-lg outline-none cursor-pointer block w-full md:w-64 p-2.5 font-medium transition-colors ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-slate-700 text-white focus:border-[var(--acento)]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-[var(--acento)] focus:ring-[var(--acento)]'}`}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="activos">🔵 Préstamos Activos (En calle)</option>
            <option value="vencidos">🔴 Vencidos (Reclamar)</option>
            <option value="finalizados">✅ Finalizados (Historial)</option>
          </select>
        </div>

        {/* Tabla */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden bg-[var(--card-bg)] transition-colors ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-xs uppercase tracking-wider border-b ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 text-slate-400 border-white/10' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  <th className="px-6 py-4 font-bold">Lector</th>
                  <th className="px-6 py-4 font-bold">Libro y Nº Inventario</th>
                  <th className="px-6 py-4 font-bold">Salida</th>
                  <th className="px-6 py-4 font-bold">Vencimiento</th>
                  <th className="px-6 py-4 font-bold text-center">Estado</th>
                  <th className="px-6 py-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${config?.temaId === 'obsidian' ? 'divide-white/5' : 'divide-gray-100'}`}>
                {cargando ? (
                  <tr>
                    <td colSpan={6} className={`px-6 py-12 text-center font-medium animate-pulse ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>
                      Cargando listado de préstamos...
                    </td>
                  </tr>
                ) : prestamos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-6 py-12 text-center font-medium ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>
                      <span className="text-4xl block mb-3">📚</span>
                      No hay libros prestados en este momento.
                    </td>
                  </tr>
                ) : (
                  prestamos.map((prestamo: any) => {
                    // Cálculo de estado
                    const fechaVencimiento = new Date(prestamo.fechaVencimiento);
                    const hoy = new Date();
                    const diasRetraso = Math.floor((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
                    const estaVencido = diasRetraso > 0 && filtro !== "finalizados";

                    return (
                      <tr key={prestamo.id} className={`transition ${estaVencido ? (config?.temaId === 'obsidian' ? 'bg-red-900/10 hover:bg-red-900/20' : 'bg-red-50/40 hover:bg-red-50/60') : (config?.temaId === 'obsidian' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50')}`}>

                        {/* <td className="px-6 py-4">
                          <p className={`font-bold text-lg ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{prestamo.nombreLector}</p>
                          <p className={`font-bold ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-600'}`}>{prestamo.cursoOAula}</p>
                        </td> */}
                        <td className="px-6 py-4 max-w-[200px] md:max-w-[300px]">
                          <p className={`font-bold text-lg flex items-center gap-2 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                            {/* Lógica híbrida para el nombre */}
                            <span
                              className={`font-bold text-lg truncate ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}
                              title={prestamo.usuario ? `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}` : prestamo.nombreLector}
                            >
                              {prestamo.usuario ? `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}` : prestamo.nombreLector}
                            </span>
                            {/* Mini badge si es usuario oficial */}
                            {prestamo.usuario && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" title="Usuario Registrado">
                                Registrado
                              </span>
                            )}
                          </p>
                          <p className={`font-bold mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-600'}`}>
                            {/* Lógica híbrida para el curso/rol */}
                            {prestamo.usuario

                              ? (prestamo.usuario.rol === 0 ? (prestamo.usuario.grupo?.nombre || 'Sin Grupo') : 'Docente ')
                              : ` ${prestamo.cursoOAula || 'Sin curso'}`}
                          </p>
                        </td>

                        <td className="px-6 py-4 max-w-[200px] md:max-w-[300px]">
                          <p className={`font-bold line-clamp-1  ${config?.temaId === 'obsidian' ? 'text-[var(--acento)]' : 'text-[var(--acento)]'}`} title={prestamo.ejemplar?.libro?.titulo}>{prestamo.ejemplar?.libro?.titulo}</p>
                          <p className={`text-xs font-mono mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>Inv: {prestamo.ejemplar?.numeroInventario}</p>
                        </td>

                        <td className={`px-6 py-4 text-sm font-medium ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>
                          {new Date(prestamo.fechaSalida).toLocaleDateString('es-AR')}
                        </td>

                        <td className={`px-6 py-4 text-sm font-bold ${estaVencido ? 'text-red-500' : (config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900')}`}>
                          {fechaVencimiento.toLocaleDateString('es-AR')}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {filtro === "finalizados" ? (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${config?.temaId === 'obsidian' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200'}`}>
                              DEVUELTO
                            </span>
                          ) : estaVencido ? (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${config?.temaId === 'obsidian' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200'}`}>
                              VENCIDO ({diasRetraso} días)
                            </span>
                          ) : (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${config?.temaId === 'obsidian' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200'}`}>
                              AL DÍA
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center flex justify-center gap-2">
                          <Link
                            href={`/prestamos/${prestamo.id}`}
                            className={`px-3 py-1.5 rounded-lg transition font-bold text-xs shadow-sm border ${config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'}`}
                          >
                            Ver Ficha
                          </Link>
                          {filtro !== "finalizados" && (
                            <BotonDevolver
                              prestamoId={prestamo.id}
                              tituloLibro={prestamo.ejemplar?.libro?.titulo || "Libro"}



                              onDevuelto={cargarPrestamos} // Para recargar la lista después de devolver sin refrescar toda la página
                            />
                          )
                          }
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
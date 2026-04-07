"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SideBar from "../components/SideBar";
// Importamos los subcomponentes de configuración
import SeccionDatos from "../components/config/SeccionDatos";
import SeccionAjustes from "../components/config/SeccionAjustes";
import SeccionPersonalizacion from "../components/config/SeccionPersonalizacion";

export default function CatalogoOPAC() {
  const [libros, setLibros] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [menuLectoresAbierto, setMenuLectoresAbierto] = useState(false);
  
  const [seccionActiva, setSeccionActiva] = useState("inicio");

  const [config, setConfig] = useState<any>(null);

  const claseTema = config ? `tema-${config.temaId}` : 'tema-oxford';

  // Cargar todos los libros al entrar
  useEffect(() => {
    cargarCatalogo();
  }, []);

  useEffect(() => {
    // Traemos la config de la API
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  const cargarCatalogo = async () => {
    try {
      const res = await fetch("http://localhost:5078/api/libros");
      if (res.ok) {
        const data = await res.json();
        setLibros(data);
      }
    } catch (error) {
      console.error("Error al cargar el catálogo", error);
    }
  };

  const buscarLibros = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqueda.trim()) {
      cargarCatalogo();
      return;
    }

    setBuscando(true);
    try {
      const res = await fetch(`http://localhost:5078/api/libros/buscar/${busqueda}`);
      if (res.ok) {
        const data = await res.json();
        setLibros(data);
      } else {
        setLibros([]); 
      }
    } catch (error) {
      console.error("Error en la búsqueda", error);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)]`}>
      {/* Pasamos los estados a la SideBar */}
      <SideBar seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} />
      
      {seccionActiva === "inicio" ? (
        <div className="animate-fade-in">
          {/* BARRA DE NAVEGACIÓN / ADMIN */}
          <nav className="p-4 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  <Image src="/logoF.png" alt="Logo EETP 464" width={40} height={40} className="object-contain" />
                </span>
                <h1 className="text-xl font-bold tracking-wider">{config?.nombreEscuela || "Cargando..."}</h1>
              </div>
              <div className="flex gap-3">
                <Link href="/herramientas/cutter" className="text-[var(--texto-header)] opacity-80 hover:opacity-100 hover:text-white px-3 py-2 rounded text-sm font-medium transition flex items-center gap-1.5">
                  📏 Ver Tabla Cutter
                </Link>
                <Link href="/inventario" className="bg-[var(--acento)] text-white hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm">
                  📚 Ver Inventario
                </Link>
                <Link href="/prestamos" className="bg-[var(--acento)] text-white hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm">
                  Mostrador / Devoluciones
                </Link>
                <Link href="/libros/nuevo" className="bg-[var(--acento)] text-white hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm">
                  + Ingresar Libro
                </Link>
                <div className="w-px h-8 bg-black/20 mx-1 hidden md:block"></div>
                <Link href="/panol" className="bg-[var(--acento)] text-white hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold transition shadow-md flex items-center gap-2">
                  🔌 Pañol Tecnológico
                </Link>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto p-8">
            {/* BUSCADOR GIGANTE */}
            <div className={`p-8 rounded-2xl shadow-sm border mb-8 text-center bg-[var(--card-bg)] ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
              <h2 className={`text-3xl font-bold mb-2 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>Explorar el Catálogo</h2>
              <p className={`mb-6 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Buscá por título, autor, ISBN o número de inventario.</p>
              <form onSubmit={buscarLibros} className="max-w-3xl mx-auto flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ej: Borges, Historia Argentina, 978-..." 
                  className={`flex-1 border-2 p-4 rounded-xl text-lg outline-none transition ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-[var(--acento)]' : 'bg-white border-gray-300 focus:border-[var(--acento)]'}`}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <button type="submit" className="bg-[var(--acento)] text-white hover:brightness-110 px-8 py-4 rounded-xl text-lg font-bold transition shadow-md">
                  {buscando ? "Buscando..." : "Buscar"}
                </button>
              </form>
            </div>

            {/* GRILLA DE RESULTADOS */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${config?.temaId === 'obsidian' ? 'text-slate-300 border-white/10' : 'text-gray-700 border-gray-200'}`}>
                {libros.length} {libros.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </h3>
              {libros.length === 0 ? (
                <div className={`text-center py-12 ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>
                  <span className="text-4xl block mb-3">📭</span>
                  No hay libros que coincidan con tu búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {libros.map(libro => {
                    const ejemplaresTotales = libro.ejemplares?.length || 0;
                    const ejemplaresDisponibles = libro.ejemplares?.filter((e: any) => e.disponibleParaPrestamo).length || 0;
                    return (
                      <div key={libro.id} className={`bg-[var(--card-bg)] p-6 rounded-xl shadow-sm border hover:shadow-md transition flex flex-col h-full ${config?.temaId === 'obsidian' ? 'border-white/5' : 'border-gray-100'}`}>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-white bg-[var(--acento)] px-2 py-1 rounded uppercase tracking-wider">CDU: {libro.clasificacion || "Sin clasificar"}</span>
                            <span className={`text-xs font-mono px-2 py-1 rounded border ${config?.temaId === 'obsidian' ? 'bg-black/40 text-slate-400 border-white/10' : 'bg-gray-100 text-gray-500'}`}>Cutter: {libro.codigoCutter || "Sin Cutter"}</span>
                          </div>
                          <h4 className={`text-xl font-bold leading-tight mb-1 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{libro.titulo}</h4>
                          <p className={`font-medium mb-3 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-600'}`}>{libro.autorPrincipal}</p>
                          <div className={`text-sm space-y-1 mb-4 ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>
                            <p><strong>Editorial:</strong> {libro.editorial || "N/A"} ({libro.anioPublicacion || "-"})</p>
                            <p><strong>ISBN:</strong> {libro.isbn || "N/A"}</p>
                          </div>
                        </div>
                        <div className={`pt-4 border-t mt-auto flex justify-between items-center ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-100'}`}>
                          <div>
                            <span className={`text-xs block ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>Disponibilidad</span>
                            <span className={`font-bold ${ejemplaresDisponibles > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {ejemplaresDisponibles} de {ejemplaresTotales} copias
                            </span>
                          </div>
                          <Link href={`/libros/${libro.id}`} className="text-[var(--acento)] hover:opacity-80 font-medium px-3 py-1.5 rounded text-sm transition border border-[var(--acento)] block text-center">
                            Ver Ejemplares
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* PANEL DE CONFIGURACIÓN */
        <div className="pt-24 px-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-4xl mx-auto mb-10">
            <button onClick={() => setSeccionActiva("inicio")} className="text-[var(--acento)] font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
              ← Volver al buscador
            </button>
          </div>
          
          {seccionActiva === "importar" && <SeccionDatos />}
          {seccionActiva === "exportar" && <SeccionDatos />}
          {seccionActiva === "ajustes" && <SeccionAjustes />}
          {seccionActiva === "estilos" && <SeccionPersonalizacion />}
          
          {seccionActiva === "panel_vacio" && (
            <div className={`text-center py-20 ${config?.temaId === 'obsidian' ? 'text-slate-700' : 'text-slate-300'}`}>
              <h2 className="text-5xl font-black mb-4 opacity-20 uppercase tracking-tighter">Panel de Control</h2>
              <p className="font-medium">Seleccioná una categoría en el menú lateral</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
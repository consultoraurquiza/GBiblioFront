"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SideBar from "../../components/SideBar";
// Importamos los subcomponentes de configuración
import SeccionDatos from "../../components/config/SeccionDatos";
import SeccionAjustes from "../../components/config/SeccionAjustes";
import SeccionPersonalizacion from "../../components/config/SeccionPersonalizacion";

export default function CatalogoOPAC() {
  const [libros, setLibros] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [menuLectoresAbierto, setMenuLectoresAbierto] = useState(false);

  const [seccionActiva, setSeccionActiva] = useState("inicio");

  const [config, setConfig] = useState<any>(null);

  const claseTema = config ? `tema-${config.temaId}` : 'tema-oxford';

  // Nuevos estados para la paginación y búsqueda
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Cargar todos los libros al entrar
  useEffect(() => {
    cargarLibros();
  }, [paginaActual]);

  useEffect(() => {
    // Traemos la config de la API
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  // const cargarCatalogo = async () => {
  //   try {
  //     const res = await fetch("http://localhost:5078/api/libros/paginado ?pagina=1&limite=10");
  //     if (res.ok) {
  //       const data = await res.json();
  //       setLibros(data);
  //     }
  //   } catch (error) {
  //     console.error("Error al cargar el catálogo", error);
  //   }
  // };
  // Función que va a buscar al backend
  const cargarLibros = async () => {
  setBuscando(true);
  try {
    // 1. Armamos los parámetros base
    const params = new URLSearchParams({
      pagina: paginaActual.toString(),
      limite: "21"
    });

    // 2. Solo agregamos "buscar" si el usuario tipeó algo
    if (textoBusqueda.trim()) {
      params.append("buscar", textoBusqueda);
    }

    // 3. Generamos la URL limpia
    const url = `http://localhost:5078/api/libros/paginado?${params.toString()}`;
    
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      setLibros(data.libros || []);
      setTotalPaginas(data.totalPaginas || 1);
      setTotalItems(data.totalItems || 0);
    } else {
      console.error("El backend rechazó la petición. Código:", res.status);
    }
  } catch (error) {
    console.error("Error al cargar libros:", error);
  } finally {
    setBuscando(false);
  }
};

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginaActual(1); // Si busco algo nuevo, vuelvo a la página 1
    cargarLibros();     // Fuerzo la búsqueda
  };

  // const buscarLibros = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!busqueda.trim()) {
  //     cargarCatalogo();
  //     return;
  //   }


  //   setBuscando(true);
  //   try {
  //     const res = await fetch(`http://localhost:5078/api/libros/buscar/${busqueda}`);
  //     if (res.ok) {
  //       const data = await res.json();
  //       setLibros(data);
  //     } else {
  //       setLibros([]);
  //     }
  //   } catch (error) {
  //     console.error("Error en la búsqueda", error);
  //   } finally {
  //     setBuscando(false);
  //   }
  // };

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
                <Link href="/usuarios" className="bg-[var(--acento)] text-white hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm">
                  👥 Usuarios
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
              <form onSubmit={handleBuscar} className="max-w-3xl mx-auto flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Borges, Historia Argentina, 978-..."
                  className={`flex-1 border-2 p-4 rounded-xl text-lg outline-none transition ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-[var(--acento)]' : 'bg-white border-gray-300 focus:border-[var(--acento)]'}`}
                  value={textoBusqueda}
                  onChange={(e) => setTextoBusqueda(e.target.value)}
                />
                <button type="submit" className="bg-[var(--acento)] text-white hover:brightness-110 px-8 py-4 rounded-xl text-lg font-bold transition shadow-md">
                  {buscando ? "Buscando..." : "Buscar"}
                </button>
              </form>
            </div>

            {/* GRILLA DE RESULTADOS */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${config?.temaId === 'obsidian' ? 'text-slate-300 border-white/10' : 'text-gray-700 border-gray-200'}`}>
  {totalItems} {totalItems === 1 ? 'resultado encontrado en total' : 'resultados encontrados en total'}
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
            {/* CONTROLES DE PAGINACIÓN */}
            {totalPaginas > 1 && (
              <div className={`flex items-center justify-between mt-12 p-4 rounded-xl border ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-white/10' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaActual === 1}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${paginaActual === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--acento)] hover:text-white'} ${config?.temaId === 'obsidian' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  ← Anterior
                </button>
                {/* INPUT DE SALTO RÁPIDO */}
                <div className={`flex items-center gap-2 text-sm sm:text-base font-bold ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>Página</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPaginas}
                    // Usamos defaultValue y key para que se actualice si cambiamos con los botones laterales
                    defaultValue={paginaActual}
                    key={paginaActual} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const valor = parseInt(e.currentTarget.value, 10);
                        if (valor >= 1 && valor <= totalPaginas) {
                          setPaginaActual(valor);
                        } else {
                          // Si el usuario pone un número fuera de rango, le avisamos y lo devolvemos a la realidad
                          e.currentTarget.value = paginaActual.toString();
                          alert(`Por favor, ingresá un número entre 1 y ${totalPaginas}`);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Si hace clic afuera sin apretar Enter, devolvemos el valor al número real
                      e.currentTarget.value = paginaActual.toString();
                    }}
                    className={`w-16 text-center py-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-[var(--acento)] transition-all ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    title="Escribí el número y apretá Enter"
                  />
                  <span>de {totalPaginas}</span>
                </div>

                {/* NUMERITOS CLICKEABLES INTELIGENTES */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    // Filtra para mostrar siempre la 1, la última, y 2 para cada lado de la actual
                    .filter(num => num === 1 || num === totalPaginas || Math.abs(paginaActual - num) <= 2)
                    .map((num, i, arr) => (
                      <div key={num} className="flex items-center gap-1 sm:gap-2">
                        {/* Agrega los puntos suspensivos si hay saltos entre números */}
                        {i > 0 && arr[i - 1] !== num - 1 && (
                          <span className={`px-1 font-bold ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-400'}`}>...</span>
                        )}
                        <button
                          onClick={() => setPaginaActual(num)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold transition-all flex items-center justify-center ${
                            paginaActual === num
                              ? 'bg-[var(--acento)] text-white scale-110 shadow-md'
                              : `hover:bg-[var(--acento)] hover:text-white ${config?.temaId === 'obsidian' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`
                          }`}
                        >
                          {num}
                        </button>
                      </div>
                  ))}
                </div>

                {/* <span className={`font-bold ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-slate-600'}`}>
                  Página {paginaActual} de {totalPaginas}
                </span> */}

                <button
                  onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaActual === totalPaginas || totalPaginas === 0}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${paginaActual === totalPaginas || totalPaginas === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--acento)] hover:text-white'} ${config?.temaId === 'obsidian' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  Siguiente →
                </button>
              </div>
            )}
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
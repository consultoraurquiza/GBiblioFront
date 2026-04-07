"use client";
import { useState, useEffect } from "react";

const CATEGORIAS = [
  { id: 1, nombre: "Ficción", icono: "📚" },
  { id: 2, nombre: "Ciencia Ficción", icono: "🚀" }, 
  { id: 3, nombre: "Terror", icono: "👻" },
  { id: 4, nombre: "Ciencia", icono: "🧪" },
  { id: 5, nombre: "Historia", icono: "📜" },
  { id: 6, nombre: "Infantil", icono: "🧸" },
];

export default function Opac() {
  const [busqueda, setBusqueda] = useState("");
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [libroSeleccionado, setLibroSeleccionado] = useState<any>(null);
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);

  // NUEVO: Estado de configuración para los temas
  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  useEffect(() => {
    // Cargar configuración de la API al entrar
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error("Error al cargar config", err));
      
    cargarCatalogo();
  }, []);

  const cargarCatalogo = async (query = "", cat = "Todos", nuevaPagina = 1) => {
    const filtroFinal = cat !== "Todos" ? cat : query;
    try {
      const res = await fetch(`http://localhost:5078/api/libros/publico/buscar?query=${filtroFinal}&pagina=${nuevaPagina}&cantidad=12`);
      if (res.ok) {
        const data = await res.json();
        if (nuevaPagina === 1) {
          setLibros(data.libros);
        } else {
          setLibros((prev) => [...prev, ...data.libros]);
        }
        setHayMas(nuevaPagina < data.totalPaginas);
        setPagina(nuevaPagina);
      }
    } catch (e) { console.error(e); }
  };

  const manejarCambioFiltro = (nuevaQuery: string, nuevaCat: string) => {
    setBusqueda(nuevaQuery);
    setCategoriaActiva(nuevaCat);
    cargarCatalogo(nuevaQuery, nuevaCat, 1);
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-24`}>
      
      {/* Fondo con Marca de Agua */}
      <div className={`fixed inset-0 pointer-events-none flex flex-wrap gap-20 p-10 rotate-12 ${config?.temaId === 'obsidian' ? 'opacity-[0.02]' : 'opacity-[0.03]'}`}>
         {[...Array(20)].map((_, i) => (
           <span key={i} className="text-8xl grayscale">📖</span>
         ))}
      </div>

      <div className="relative z-10 min-h-screen pb-20">
        {/* HEADER BUSCADOR - Adaptado al tema */}
        <header className="p-6 pt-8">
          <h1 className="text-3xl font-black mb-6 tracking-tight text-[var(--texto-header)]">
            {config?.nombreEscuela || "Catálogo"}
          </h1>
          
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Buscar por título o autor..." 
              className={`w-full p-4 pl-12 rounded-2xl border-2 transition-all outline-none ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-[var(--acento)]' : 'bg-white border-gray-200 text-slate-800 focus:border-[var(--acento)]'}`}
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                cargarCatalogo(e.target.value, categoriaActiva);
              }}
            />
            <span className="absolute left-4 top-4.5 opacity-40 text-xl">🔍</span>
          </div>

          {/* CATEGORÍAS (Scroll Horizontal) */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => { setCategoriaActiva("Todos"); cargarCatalogo(busqueda, "Todos"); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${categoriaActiva === "Todos" ? 'bg-[var(--acento)] text-white shadow-lg' : config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 shadow-sm border border-gray-100'}`}
            >
              Todos
            </button>
            {CATEGORIAS.map(cat => (
              <button 
                key={cat.id}
                onClick={() => { setCategoriaActiva(cat.nombre); cargarCatalogo(busqueda, cat.nombre); }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${categoriaActiva === cat.nombre ? 'bg-[var(--acento)] text-white shadow-lg' : config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 shadow-sm border border-gray-100'}`}
              >
                <span>{cat.icono}</span> {cat.nombre}
              </button>
            ))}
          </div>
        </header>

        {/* GRILLA DE LIBROS */}
        <div className="max-w-5xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {libros.map((libro: any) => (
            <div 
              key={libro.id} 
              onClick={() => setLibroSeleccionado(libro)} 
              className={`rounded-2xl overflow-hidden shadow-sm border active:scale-95 transition-transform cursor-pointer ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/5' : 'bg-[var(--card-bg)] border-gray-100'}`}
            >
              <div className={`aspect-[3/4] relative ${config?.temaId === 'obsidian' ? 'bg-slate-800' : 'bg-gray-200'}`}>
                <img src={libro.portadaUrl} className="object-cover w-full h-full" alt="" />
                <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full text-white ${libro.estaDisponible ? 'bg-green-500' : 'bg-red-500'}`}>
                  {libro.estaDisponible ? "Disponible" : "No disponible"}
                </div>
              </div>
              <div className="p-3">
                <h3 className={`font-bold text-sm line-clamp-2 leading-tight ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{libro.titulo}</h3>
                <p className="text-[11px] text-[var(--acento)] truncate mt-1">{libro.autorPrincipal}</p>
              </div>
            </div>
          ))}
        </div>

        {/* OVERLAY FONDO */}
        {libroSeleccionado && (
          <div 
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
            onClick={() => setLibroSeleccionado(null)}
          />
        )}

        {/* DETALLE: BOTTOM SHEET */}
        <div className={`fixed bottom-0 left-0 right-0 z-[60] rounded-t-[2.5rem] shadow-2xl transition-transform duration-300 ease-out transform ${libroSeleccionado ? 'translate-y-0' : 'translate-y-full'} ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-t border-slate-700' : 'bg-white'}`}>
          <div className="w-12 h-1.5 bg-gray-400/50 rounded-full mx-auto mt-4 cursor-pointer" onClick={() => setLibroSeleccionado(null)} />
          
          {libroSeleccionado && (
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex gap-4 mb-6">
                <img src={libroSeleccionado.portadaUrl} className="w-32 h-44 object-cover rounded-xl shadow-md bg-slate-200" />
                <div className="flex flex-col justify-center">
                  <h2 className={`text-xl font-bold leading-tight mb-1 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{libroSeleccionado.titulo}</h2>
                  <p className="text-[var(--acento)] font-semibold mb-3">{libroSeleccionado.autorPrincipal}</p>
                  <div className="flex gap-2">
                     <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-gray-600'}`}>{libroSeleccionado.editorial || 'S/E'}</span>
                     <span className={`text-[10px] px-2 py-1 rounded font-bold ${config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-gray-600'}`}>{libroSeleccionado.anioPublicacion || 'S/F'}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className={`font-bold mb-2 border-b pb-2 ${config?.temaId === 'obsidian' ? 'text-slate-200 border-slate-700' : 'text-gray-800 border-gray-100'}`}>Sinopsis</h4>
                <p className={`text-sm leading-relaxed text-justify ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-600'}`}>
                  {libroSeleccionado.reseniaSinopsis || "No hay sinopsis disponible para este ejemplar."}
                </p>
              </div>

              <button 
                onClick={() => setLibroSeleccionado(null)}
                className={`w-full py-4 text-sm font-bold uppercase tracking-widest rounded-2xl transition-colors ${config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
              >
                Cerrar Ficha
              </button>
            </div>
          )}
        </div>

        {/* BOTÓN SIGUIENTE PÁGINA */}
        {hayMas && (
          <div className="flex justify-center mt-12 mb-10">
            <button 
              onClick={() => cargarCatalogo(busqueda, categoriaActiva, pagina + 1)}
              className={`border-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-[var(--acento)] text-[var(--acento)] hover:bg-[var(--acento)] hover:text-white' : 'bg-white border-[var(--acento)] text-[var(--acento)] hover:bg-[var(--acento)] hover:text-white'}`}
            >
              Cargar más títulos 📚
            </button>
          </div>
        )}

        {/* NAVBAR INFERIOR (Fixed) */}
        {/* <nav className={`fixed bottom-0 left-0 right-0 border-t p-3 flex justify-around md:hidden z-40 backdrop-blur-md ${config?.temaId === 'obsidian' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-gray-200'}`}>
           <span className="text-2xl cursor-pointer">🏠</span>
           <span className="text-2xl opacity-30 cursor-pointer">📖</span>
           <span className="text-2xl opacity-30 cursor-pointer">👤</span>
        </nav> */}
      </div>
    </div>
  );
}
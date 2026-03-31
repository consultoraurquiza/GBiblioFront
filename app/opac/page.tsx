"use client";
import { useState, useEffect } from "react";

const CATEGORIAS = [
  { id: 1, nombre: "Ficción", icono: "📚" },
  { id: 2, nombre: "Ciencia Ficción", icono: "🚀" }, // <--- Nombre exacto como en la DB
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

  

  // Función para traer libros de la DB
  const cargarCatalogo = async (query = "", cat = "Todos", nuevaPagina = 1) => {
  const filtroFinal = cat !== "Todos" ? cat : query;
  
  try {
    const res = await fetch(`http://localhost:5078/api/libros/publico/buscar?query=${filtroFinal}&pagina=${nuevaPagina}&cantidad=12`);
    if (res.ok) {
      const data = await res.json();
      
      // Si es la página 1, reemplazamos la lista. Si es > 1, sumamos a lo que ya había.
      if (nuevaPagina === 1) {
        setLibros(data.libros);
      } else {
        setLibros((prev) => [...prev, ...data.libros]);
      }
      
      // Verificamos si llegamos al final
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

  useEffect(() => { cargarCatalogo(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER BUSCADOR - Mobile First: Sticky y con bordes redondeados */}
      <header className="p-6 pt-8">
        <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
          Catalogo
        </h1>
        
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Buscar por título o autor..." 
            className="w-full p-4 pl-12 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 transition-all outline-none text-slate-800"
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
            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${categoriaActiva === "Todos" ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-slate-100 text-slate-500'}`}
          >
            Todos
          </button>
          {CATEGORIAS.map(cat => (
            <button 
              key={cat.id}
              onClick={() => { setCategoriaActiva(cat.nombre); cargarCatalogo(busqueda, cat.nombre); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${categoriaActiva === cat.nombre ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-slate-100 text-slate-500'}`}
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
            onClick={() => setLibroSeleccionado(libro)} // Al tocar, abrimos la ficha
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="aspect-[3/4] relative bg-gray-200">
              <img src={libro.portadaUrl} className="object-cover w-full h-full" alt="" />
              <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full text-white ${libro.estaDisponible ? 'bg-green-500' : 'bg-red-500'}`}>
                {libro.estaDisponible ? "Disponible" : "No disponible"}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm line-clamp-2 leading-tight">{libro.titulo}</h3>
              <p className="text-[11px] text-purple-600 truncate">{libro.autorPrincipal}</p>
            </div>
          </div>
        ))}
      </div>

      {/* OVERLAY FONDO (Se ve cuando la ficha está abierta) */}
      {libroSeleccionado && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity"
          onClick={() => setLibroSeleccionado(null)}
        />
      )}

      {/* DETALLE: BOTTOM SHEET */}
      <div className={`fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-[2.5rem] shadow-2xl transition-transform duration-300 ease-out transform ${libroSeleccionado ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Tirador para indicar que se puede deslizar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3" onClick={() => setLibroSeleccionado(null)} />
        
        {libroSeleccionado && (
          <div className="p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex gap-4 mb-6">
              <img src={libroSeleccionado.portadaUrl} className="w-32 h-44 object-cover rounded-xl shadow-md" />
              <div className="flex flex-col justify-center">
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{libroSeleccionado.titulo}</h2>
                <p className="text-purple-700 font-semibold mb-2">{libroSeleccionado.autorPrincipal}</p>
                <div className="flex gap-2">
                   <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-gray-600 uppercase font-bold">{libroSeleccionado.editorial}</span>
                   <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-gray-600 font-bold">{libroSeleccionado.anioPublicacion}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">Sinopsis</h4>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                {libroSeleccionado.reseniaSinopsis || "No hay sinopsis disponible para este ejemplar."}
              </p>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            {/* <button 
              disabled={!libroSeleccionado.estaDisponible}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${libroSeleccionado.estaDisponible ? 'bg-purple-700 active:bg-purple-800' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {libroSeleccionado.estaDisponible ? "Reservar Libro" : "No disponible actualmente"}
            </button> */}
            
            <button 
              onClick={() => setLibroSeleccionado(null)}
              className="w-full mt-3 py-3 text-sm text-gray-400 font-medium"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
      {/* BOTÓN SIGUIENTE PÁGINA */}
  {hayMas && (
    <div className="flex justify-center mt-12 mb-10">
      <button 
        onClick={() => cargarCatalogo(busqueda, categoriaActiva, pagina + 1)}
        className="bg-white border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-2xl font-bold hover:bg-purple-600 hover:text-white transition-all shadow-md active:scale-95"
      >
        Cargar más títulos 📚
      </button>
    </div>
    )}

      {/* NAVBAR INFERIOR (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 border-t p-3 flex justify-around md:hidden z-40">
         <span className="text-2xl">🏠</span>
         <span className="text-2xl opacity-30">📖</span>
         <span className="text-2xl opacity-30">👤</span>
      </nav>
    </div>
  );
}
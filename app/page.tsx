"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function CatalogoOPAC() {
  const [libros, setLibros] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [menuLectoresAbierto, setMenuLectoresAbierto] = useState(false);

  // Cargar todos los libros al entrar
  useEffect(() => {
    cargarCatalogo();
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
        setLibros([]); // No se encontró nada
      }
    } catch (error) {
      console.error("Error en la búsqueda", error);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      {/* BARRA DE NAVEGACIÓN / ADMIN */}
      <nav className="bg-slate-800 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl"><Image 
  src="/logoF.png" 
  alt="Logo EETP 464" 
  width={40} 
  height={40} 
  className="object-contain"
/></span>
            <h1 className="text-xl font-bold tracking-wider">BIBLIOTECA EETP 464</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/herramientas/cutter" className="text-slate-300 hover:text-white px-3 py-2 rounded text-sm font-medium transition flex items-center gap-1.5">
              📏 Ver Tabla Cutter
            </Link>
            <Link href="/prestamos" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition flex items-center gap-2">
              Mostrador / Devoluciones
            </Link>
            {/* Menú Desplegable de Lectores (Por Clic) */}
          <div className="relative">
            <button 
              onClick={() => setMenuLectoresAbierto(!menuLectoresAbierto)}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition flex items-center gap-2"
            >
              👥 Lectores {menuLectoresAbierto ? '▴' : '▾'}
            </button>
            
            {/* La caja que aparece SOLO si el estado es true */}
            {menuLectoresAbierto && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
                <Link 
                  href="/usuarios/nuevo" 
                  onClick={() => setMenuLectoresAbierto(false)} 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition border-b border-gray-50"
                >
                  ✨ Nuevo Lector
                </Link>
                <Link 
                  href="/usuarios/buscar" 
                  onClick={() => setMenuLectoresAbierto(false)} 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition"
                >
                  🔍 Consultar / Editar
                </Link>
              </div>
            )}
          </div>
            <Link href="/libros/nuevo" className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm font-bold transition shadow-lg">
              + Ingresar Libro
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {/* BUSCADOR GIGANTE */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Explorar el Catálogo</h2>
          <p className="text-gray-500 mb-6">Buscá por título, autor, ISBN o número de inventario.</p>
          
          <form onSubmit={buscarLibros} className="max-w-3xl mx-auto flex gap-2">
            <input 
              type="text" 
              placeholder="Ej: Borges, Historia Argentina, 978-..." 
              className="flex-1 border-2 border-gray-300 p-4 rounded-xl text-lg focus:border-purple-500 focus:ring-0 outline-none transition"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition shadow-md"
            >
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </form>
        </div>

        {/* GRILLA DE RESULTADOS */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            {libros.length} {libros.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </h3>

          {libros.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-3">📭</span>
              No hay libros que coincidan con tu búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {libros.map(libro => {
                // Lógica clave: Calculamos cuántos ejemplares físicos están disponibles en este momento
                const ejemplaresTotales = libro.ejemplares?.length || 0;
                const ejemplaresDisponibles = libro.ejemplares?.filter((e: any) => e.disponibleParaPrestamo).length || 0;

                return (
                  <div key={libro.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded uppercase tracking-wider">CDU: 
                          {libro.clasificacion || "Sin clasificar"}
                        </span>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded border">
                          Cutter: {libro.codigoCutter || "Sin Cutter"}
                        </span>
                      </div>
                      
                      <h4 className="text-xl font-bold text-gray-900 leading-tight mb-1">{libro.titulo}</h4>
                      <p className="text-gray-600 font-medium mb-3">{libro.autorPrincipal}</p>
                      
                      <div className="text-sm text-gray-500 space-y-1 mb-4">
                        <p><strong>Editorial:</strong> {libro.editorial || "N/A"} ({libro.anioPublicacion || "-"})</p>
                        <p><strong>ISBN:</strong> {libro.isbn || "N/A"}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t mt-auto flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-500 block">Disponibilidad</span>
                        <span className={`font-bold ${ejemplaresDisponibles > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {ejemplaresDisponibles} de {ejemplaresTotales} copias
                        </span>
                      </div>
                      <Link href={`/libros/${libro.id}`} className="text-purple-600 hover:bg-purple-50 font-medium px-3 py-1.5 rounded text-sm transition border border-purple-200 block text-center">
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
    </main>
  );
}
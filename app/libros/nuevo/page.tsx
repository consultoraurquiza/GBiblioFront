"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoLibro() {
  const router = useRouter();

  // Estados del formulario
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [editorial, setEditorial] = useState("");
  const [anioPublicacion, setAnioPublicacion] = useState(new Date().getFullYear());
  const [materia, setMateria] = useState("");
  const [ubicacionFisica, setUbicacionFisica] = useState("");
  const [cantidadTotal, setCantidadTotal] = useState(1);

  const [cargando, setCargando] = useState(false);

  const guardarLibro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const res = await fetch("http://localhost:5078/api/libros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          autor,
          isbn,
          editorial,
          anioPublicacion: Number(anioPublicacion),
          materia,
          ubicacionFisica,
          cantidadTotal: Number(cantidadTotal),
          cantidadDisponible: Number(cantidadTotal), // Arrancan todos disponibles
        }),
      });

      if (res.ok) {
        alert("¡Libro guardado en el catálogo con éxito!");
        router.push("/"); // Volvemos al panel principal
      } else {
        const errorData = await res.json();
        alert("Error al guardar: " + (errorData.mensaje || "Revisá los datos."));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border-t-4 border-purple-500">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Ingresar Nuevo Libro al Catálogo</h1>

        <form onSubmit={guardarLibro} className="space-y-5">
          {/* Fila 1: Título y Autor (Los más importantes) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título del Libro *</label>
              <input 
                type="text" required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={titulo} onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor / Autores *</label>
              <input 
                type="text" required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={autor} onChange={(e) => setAutor(e.target.value)}
              />
            </div>
          </div>

          {/* Fila 2: Datos editoriales */}
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={isbn} onChange={(e) => setIsbn(e.target.value)}
                placeholder="Ej: 978..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Editorial</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={editorial} onChange={(e) => setEditorial(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año Pub.</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={anioPublicacion} onChange={(e) => setAnioPublicacion(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Fila 3: Clasificación Escolar e Inventario */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={materia} onChange={(e) => setMateria(e.target.value)}
                placeholder="Ej: Historia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={ubicacionFisica} onChange={(e) => setUbicacionFisica(e.target.value)}
                placeholder="Ej: Estante 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Copias Totales *</label>
              <input 
                type="number" min="1" required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={cantidadTotal} onChange={(e) => setCantidadTotal(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Link 
              href="/"
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded transition"
            >
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={cargando}
              className={`px-6 py-2 rounded font-bold text-white transition ${cargando ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700 shadow'}`}
            >
              {cargando ? 'Guardando...' : 'Guardar Libro'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
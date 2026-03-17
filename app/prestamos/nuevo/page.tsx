"use client"; // Obligatorio para poder usar estados y botones interactivos

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoPrestamo() {
  const router = useRouter();

  // Estados para el Alumno
  const [dni, setDni] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [errorUsuario, setErrorUsuario] = useState("");

  // Estados para el Libro
  const [busquedaLibro, setBusquedaLibro] = useState("");
  const [libros, setLibros] = useState<any[]>([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState<any>(null);

  // 1. Buscar Alumno en la API
  const buscarAlumno = async () => {
    setErrorUsuario("");
    setUsuario(null);
    if (!dni) return;

    try {
      const res = await fetch(`http://localhost:5078/api/usuarios/buscar/${dni}`);
      if (res.ok) {
        const data = await res.json();
        setUsuario(data);
      } else {
        setErrorUsuario("Alumno no encontrado. Debe registrarlo primero.");
      }
    } catch (error) {
      console.error("Error al buscar usuario", error);
    }
  };

  // 2. Buscar Libro en la API
  const buscarLibro = async () => {
    setLibros([]);
    setLibroSeleccionado(null);
    if (!busquedaLibro) return;

    try {
      const res = await fetch(`http://localhost:5078/api/libros/buscar/${busquedaLibro}`);
      if (res.ok) {
        const data = await res.json();
        setLibros(data);
      }
    } catch (error) {
      console.error("Error al buscar libro", error);
    }
  };

  // 3. Confirmar y guardar el préstamo
  const confirmarPrestamo = async () => {
    if (!usuario || !libroSeleccionado) return;

    try {
      const res = await fetch("http://localhost:5078/api/prestamos/prestar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          libroId: libroSeleccionado.id,
          usuarioId: usuario.id
        })
      });

      if (res.ok) {
        alert("¡Préstamo registrado con éxito!");
        router.push("/"); // Volvemos al dashboard
      } else {
        const errorData = await res.json();
        alert("Error: " + errorData.mensaje);
      }
    } catch (error) {
      console.error("Error al guardar el préstamo", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 border-b pb-4">Registrar Nuevo Préstamo</h1>

        {/* SECCIÓN 1: ALUMNO */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h2 className="font-semibold text-blue-800 mb-2">1. Identificar Alumno</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ingrese DNI..." 
              className="border p-2 rounded flex-1"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarAlumno()}
            />
            <button onClick={buscarAlumno} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Buscar
            </button>
          </div>
          {errorUsuario && <p className="text-red-500 mt-2 text-sm">{errorUsuario}</p>}
          {usuario && (
            <p className="mt-2 text-green-700 font-medium">
              ✓ Seleccionado: {usuario.nombre} {usuario.apellido} (Curso: {usuario.anio} {usuario.division})
            </p>
          )}
        </div>

        {/* SECCIÓN 2: LIBRO */}
        <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-100">
          <h2 className="font-semibold text-green-800 mb-2">2. Seleccionar Libro</h2>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Título o ISBN..." 
              className="border p-2 rounded flex-1"
              value={busquedaLibro}
              onChange={(e) => setBusquedaLibro(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarLibro()}
            />
            <button onClick={buscarLibro} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Buscar
            </button>
          </div>
          
          {/* Lista de resultados de libros */}
          {libros.length > 0 && (
            <ul className="bg-white border rounded divide-y">
              {libros.map(libro => (
                <li key={libro.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{libro.titulo}</p>
                    <p className="text-sm text-gray-500">{libro.autor} | Disponibles: {libro.cantidadDisponible}</p>
                  </div>
                  <button 
                    onClick={() => setLibroSeleccionado(libro)}
                    disabled={libro.cantidadDisponible <= 0}
                    className={`px-3 py-1 rounded text-sm ${libro.cantidadDisponible > 0 ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-100 text-red-500 cursor-not-allowed'}`}
                  >
                    Seleccionar
                  </button>
                </li>
              ))}
            </ul>
          )}

          {libroSeleccionado && (
            <p className="mt-4 text-green-700 font-medium border-t pt-4">
              ✓ Libro a prestar: {libroSeleccionado.titulo}
            </p>
          )}
        </div>

        {/* BOTÓN FINAL */}
        <div className="flex justify-end pt-4 border-t">
          <button 
            onClick={confirmarPrestamo}
            disabled={!usuario || !libroSeleccionado}
            className={`px-6 py-3 rounded-lg font-bold text-white transition ${(!usuario || !libroSeleccionado) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg'}`}
          >
            Confirmar Préstamo
          </button>
        </div>

      </div>
    </main>
  );
}
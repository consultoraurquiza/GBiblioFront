"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarUsuario({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Desempaquetamos el ID (como hicimos en la vista de detalles)
  const { id } = use(params);

  // Estados
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("0");
  const [anio, setAnio] = useState("");
  const [division, setDivision] = useState("");
  const [puedePedirPrestado, setPuedePedirPrestado] = useState(true);

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await fetch(`http://localhost:5078/api/usuarios/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDni(data.dni);
          setNombre(data.nombre);
          setApellido(data.apellido);
          setTelefono(data.telefono || "");
          setRol(data.rol.toString());
          setAnio(data.anio || "");
          setDivision(data.division || "");
          setPuedePedirPrestado(data.puedePedirPrestado);
        }
      } catch (error) {
        console.error("Error al cargar usuario", error);
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarUsuario();
  }, [id]);

  const actualizarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const res = await fetch(`http://localhost:5078/api/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(id),
          dni,
          nombre,
          apellido,
          telefono,
          rol: parseInt(rol),
          anio: rol === "0" ? anio : null,
          division: rol === "0" ? division : null,
          puedePedirPrestado
        }),
      });

      if (res.ok) {
        alert("¡Datos actualizados correctamente!");
        router.push("/"); // Por ahora volvemos al dashboard
      } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.mensaje || "Revisá los datos."));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoDatos) return <div className="p-8 text-center text-black">Cargando datos del lector...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md border-t-4 border-yellow-500">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Editar Lector #{id}</h1>

        <form onSubmit={actualizarUsuario} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
              <input 
                type="text" required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                value={dni} onChange={(e) => setDni(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                value={telefono} onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                type="text" required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                value={nombre} onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input 
                type="text" required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                value={apellido} onChange={(e) => setApellido(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-yellow-600 rounded"
                checked={puedePedirPrestado} 
                onChange={(e) => setPuedePedirPrestado(e.target.checked)}
              />
              <span className="font-medium text-gray-700">Habilitado para pedir préstamos</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">Desmarcar si el alumno tiene sanciones o no devolvió libros.</p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              Cancelar
            </button>
            <button 
              type="submit" disabled={guardando}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow transition"
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
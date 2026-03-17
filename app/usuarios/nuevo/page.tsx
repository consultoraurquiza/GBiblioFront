"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoUsuario() {
  const router = useRouter();

  // Estados del formulario
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("0"); // 0 = Alumno, 1 = Profesor
  const [anio, setAnio] = useState("");
  const [division, setDivision] = useState("");

  const [cargando, setCargando] = useState(false);

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setCargando(true);

    try {
      const res = await fetch("http://localhost:5078/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dni,
          nombre,
          apellido,
          telefono,
          rol: parseInt(rol),
          anio: rol === "0" ? anio : null, // Si es profesor, no mandamos año
          division: rol === "0" ? division : null,
        }),
      });

      if (res.ok) {
        alert("¡Usuario registrado con éxito!");
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
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md border-t-4 border-green-500">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Registrar Nuevo Lector</h1>

        <form onSubmit={guardarUsuario} className="space-y-4">
          {/* DNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 45123456"
            />
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / Celular</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 341 555-1234" // Podés poner la característica de tu zona
              />
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Lector</label>
            <select 
              className="w-full border border-gray-300 p-2 rounded bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="0">Alumno</option>
              <option value="1">Profesor</option>
            </select>
          </div>

          {/* Curso (Solo se muestra si es Alumno) */}
          {rol === "0" && (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  placeholder="Ej: 3ro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">División</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="Ej: B"
                />
              </div>
            </div>
          )}

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
              className={`px-6 py-2 rounded font-bold text-white transition ${cargando ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700 shadow'}`}
            >
              {cargando ? 'Guardando...' : 'Guardar Lector'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
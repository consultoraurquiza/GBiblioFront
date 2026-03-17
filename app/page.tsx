// app/page.tsx
import Link from "next/link";

import BotonDevolver from "@/components/BotonDevolver"; // <-- AGREGA ESTO

// 1. Función para buscar los datos al Backend
async function getPrestamos() {
  // ATENCIÓN: Cambiá el 5078 por el puerto real de tu API si es distinto
  const res = await fetch("http://localhost:5078/api/prestamos/activos", {
    cache: "no-store", // Para que siempre traiga datos frescos y no use caché
  });
  
  if (!res.ok) {
    return [];
  }
  return res.json();
}

// 2. La página principal (Server Component)
export default async function Dashboard() {
  const prestamos = await getPrestamos();

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Biblioteca</h1>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              <Link href="/usuarios/nuevo" >
              + Nuevo Alumno
              </Link>
            </button>
            <Link href="/libros/nuevo" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition inline-block">
              + Nuevo Libro
            </Link>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition">
             <Link href="/prestamos/nuevo" >
              + Nuevo Préstamo
              </Link>
            </button>
          </div>
        </div>

        {/* Tabla de Préstamos Activos */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">Préstamos Activos</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <th className="px-6 py-4 font-medium">Libro</th>
                  <th className="px-6 py-4 font-medium">Alumno</th>
                  <th className="px-6 py-4 font-medium">Fecha Salida</th>
                  <th className="px-6 py-4 font-medium">Vencimiento</th>
                  <th className="px-6 py-4 font-medium text-center">Estado</th>
                  <th className="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {prestamos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No hay libros prestados en este momento.
                    </td>
                  </tr>
                ) : (
                  prestamos.map((prestamo: any) => (
                    <tr key={prestamo.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{prestamo.libro?.titulo}</td>
                      <td className="px-6 py-4">{prestamo.usuario?.nombre} {prestamo.usuario?.apellido}</td>
                      <td className="px-6 py-4">{new Date(prestamo.fechaSalida).toLocaleDateString('es-AR')}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{new Date(prestamo.fechaVencimiento).toLocaleDateString('es-AR')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200">
                          {prestamo.estado === 0 ? "Activo" : "Vencido"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center flex justify-center gap-2">
                        <Link 
                           href={`/prestamos/${prestamo.id}`}
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded transition font-medium text-sm shadow-sm border border-gray-300"
                          >
                          Detalles
                        </Link>
                        <BotonDevolver 
                          prestamoId={prestamo.id} 
                          tituloLibro={prestamo.libro?.titulo} 
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
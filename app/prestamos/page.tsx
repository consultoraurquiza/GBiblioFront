import Link from "next/link";
import BotonDevolver from "@/components/BotonDevolver";

async function getPrestamosActivos() {
  const res = await fetch("http://localhost:5078/api/prestamos/activos", {
    cache: "no-store",
  });
  
  if (!res.ok) return [];
  return res.json();
}

export default async function MostradorPrestamos() {
  const prestamos = await getPrestamosActivos();

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      {/* Barra de Navegación simple para volver */}
      <nav className="bg-slate-800 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h1 className="text-xl font-bold tracking-wider">MOSTRADOR DE CIRCULACIÓN</h1>
          </div>
          <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            Volver al Catálogo
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Préstamos Activos</h2>
            <p className="text-gray-500 mt-1">Gestión de devoluciones y reclamos por vencimiento.</p>
          </div>
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-bold border border-blue-200 shadow-sm">
            Total en circulación: {prestamos.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Lector</th>
                  <th className="px-6 py-4 font-bold">Libro y Nº Inventario</th>
                  <th className="px-6 py-4 font-bold">Salida</th>
                  <th className="px-6 py-4 font-bold">Vencimiento</th>
                  <th className="px-6 py-4 font-bold text-center">Estado</th>
                  <th className="px-6 py-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prestamos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <span className="text-4xl block mb-3">📚</span>
                      No hay libros prestados en este momento.
                    </td>
                  </tr>
                ) : (
                  prestamos.map((prestamo: any) => {
                    // Cálculo de estado
                    const fechaVencimiento = new Date(prestamo.fechaVencimiento);
                    const hoy = new Date();
                    const diasRetraso = Math.floor((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
                    const estaVencido = diasRetraso > 0;

                    return (
                      <tr key={prestamo.id} className={`hover:bg-gray-50 transition ${estaVencido ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{prestamo.usuario?.nombre} {prestamo.usuario?.apellido}</p>
                          <p className="text-xs text-gray-500">DNI: {prestamo.usuario?.dni}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-purple-900 line-clamp-1">{prestamo.ejemplar?.libro?.titulo}</p>
                          <p className="text-xs font-mono text-gray-500">Inv: {prestamo.ejemplar?.numeroInventario}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(prestamo.fechaSalida).toLocaleDateString('es-AR')}
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold ${estaVencido ? 'text-red-600' : 'text-gray-900'}`}>
                          {fechaVencimiento.toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {estaVencido ? (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                              VENCIDO ({diasRetraso} días)
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                              AL DÍA
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center flex justify-center gap-2">
                          <Link 
                            href={`/prestamos/${prestamo.id}`}
                            className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded transition font-medium text-xs shadow-sm border border-gray-300"
                          >
                            Ver Ficha
                          </Link>
                          <BotonDevolver 
                            prestamoId={prestamo.id} 
                            tituloLibro={prestamo.ejemplar?.libro?.titulo || "Libro"} 
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
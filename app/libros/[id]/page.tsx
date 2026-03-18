import Link from "next/link";
import BotonPrestarEjemplar from "@/components/BotonPrestarEjemplar";

async function getLibro(id: string) {
  const res = await fetch(`http://localhost:5078/api/libros/${id}`, {
    cache: "no-store"
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function DetalleLibro({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const libro = await getLibro(resolvedParams.id);

  if (!libro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Libro no encontrado</h1>
        <Link href="/" className="text-purple-600 underline">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado y Ficha */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <Link href="/" className="text-gray-500 hover:text-purple-600 transition font-medium mb-4 inline-block">
            ← Volver al Catálogo
          </Link>
          
          <div className="flex justify-between items-start mt-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{libro.titulo}</h1>
              {libro.subtitulo && <h2 className="text-xl text-gray-600 mb-2">{libro.subtitulo}</h2>}
              <p className="text-xl font-medium text-purple-700 mb-4">{libro.autorPrincipal}</p>
            </div>
            
            <div className="text-right">
              <span className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Ubicación</span>
              <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                <span className="block text-lg font-bold text-purple-900">CDU: {libro.clasificacion || "S/C"}</span>
                <span className="block font-mono text-gray-700">Cutter: {libro.codigoCutter || "S/C"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Detalles de Publicación</p>
              <p className="font-medium">{libro.editorial || "Editorial Desconocida"} ({libro.anioPublicacion || "Año Desconocido"})</p>
              <p className="text-sm text-gray-600 mt-1">ISBN: {libro.isbn || "No registrado"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Materias / Tags</p>
              <div className="flex flex-wrap gap-2">
                {libro.tags?.map((tag: any) => (
                  <span key={tag.id} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full border border-gray-200">
                    {tag.nombre}
                  </span>
                ))}
                {(!libro.tags || libro.tags.length === 0) && <span className="text-sm text-gray-400">Sin etiquetas</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Ejemplares Físicos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Inventario de Copias Físicas</h2>
            <span className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full">
              {libro.ejemplares?.length || 0} Registros
            </span>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Nº Inventario</th>
                <th className="px-6 py-4 font-bold">Estado / Observaciones</th>
                <th className="px-6 py-4 font-bold text-center">Disponibilidad</th>
                <th className="px-6 py-4 font-bold text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {libro.ejemplares?.map((ej: any) => (
                <tr key={ej.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-lg text-gray-900">{ej.numeroInventario}</td>
                  <td className="px-6 py-4 text-gray-600">{ej.observaciones || "-"}</td>
                  <td className="px-6 py-4 text-center">
                    {ej.disponibleParaPrestamo ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-bold border border-green-200">Disponible</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-bold border border-red-200">Prestado / Dañado</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {ej.disponibleParaPrestamo ? (
                      <BotonPrestarEjemplar 
                        ejemplarId={ej.id} 
                        numeroInventario={ej.numeroInventario} 
                        tituloLibro={libro.titulo} 
                      />
                    ) : (
                      <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded font-medium cursor-not-allowed border border-gray-200">
                        No Disponible
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
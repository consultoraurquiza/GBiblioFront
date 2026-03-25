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
        <Link href="/" className="text-purple-600 underline font-bold">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-slate-800 text-white p-4 mb-4 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h1 className="text-xl font-bold tracking-wider">DETALLE DEL LIBRO</h1>
          </div>
          <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            Volver al Catálogo
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-0">
        
        {/* Encabezado y Botonera */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 border-t-4 border-t-purple-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-100 gap-4">
            <Link href="/" className="text-gray-500 hover:text-purple-600 transition font-bold inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              ← Volver al Catálogo
            </Link>
            <Link href={`/libros/editar/${libro.id}`} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-5 py-2.5 rounded-lg text-sm font-bold border border-yellow-300 transition shadow-sm flex items-center gap-2 w-full md:w-auto justify-center">
              ✏️ Editar Catálogo e Inventario
            </Link>
          </div>
          
          {/* FICHA PRINCIPAL: PORTADA + DATOS */}
          <div className="flex flex-col md:flex-row gap-8 mt-4">
            
            {/* COLUMNA IZQUIERDA: Portada */}
            <div className="w-full md:w-1/4 flex-shrink-0 flex flex-col items-center">
              <div className="w-full h-80 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-md">
                {libro.portadaUrl ? (
                  <img src={libro.portadaUrl} alt={`Portada de ${libro.titulo}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <span className="text-6xl text-gray-300 block mb-2">🖼️</span>
                    <span className="text-xs text-gray-400 font-bold uppercase">Sin Imagen</span>
                  </div>
                )}
              </div>
              <div className="mt-4 w-full bg-purple-50 px-4 py-3 rounded-lg border border-purple-100 text-center">
                <span className="block text-xs font-bold text-purple-700 uppercase tracking-widest mb-1">Ubicación Física</span>
                <span className="block font-bold text-gray-900 leading-tight">CDU: {libro.clasificacion || "-"}</span>
                <span className="block font-mono text-gray-600 text-sm mt-1">Cutter: {libro.codigoCutter || "-"}</span>
              </div>
            </div>

            {/* COLUMNA DERECHA: Textos y Detalles */}
            <div className="w-full md:w-3/4 flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 leading-tight">{libro.titulo}</h1>
              {libro.subtitulo && <h2 className="text-xl text-gray-600 mb-3">{libro.subtitulo}</h2>}
              <p className="text-2xl font-bold text-purple-700 mb-6 pb-6 border-b border-gray-100">{libro.autorPrincipal}</p>
              
              {/* Sinopsis */}
              <div className="mb-6 flex-grow">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reseña / Sinopsis</h3>
                {libro.reseniaSinopsis ? (
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {libro.reseniaSinopsis}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic">No hay sinopsis disponible para este libro.</p>
                )}
              </div>

              {/* Grid de Datos Técnicos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Editorial</p>
                  <p className="font-medium text-sm text-gray-900">{libro.editorial || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Año Pub.</p>
                  <p className="font-medium text-sm text-gray-900">{libro.anioPublicacion || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Páginas</p>
                  <p className="font-medium text-sm text-gray-900">{libro.cantidadPaginas || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">ISBN</p>
                  <p className="font-medium text-sm text-gray-900 font-mono">{libro.isbn || "-"}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Materias y Etiquetas</p>
                <div className="flex flex-wrap gap-2">
                  {libro.tags?.map((tag: any) => (
                    <span key={tag.id} className="bg-purple-100 text-purple-800 font-bold text-xs px-3 py-1.5 rounded-full border border-purple-200 shadow-sm">
                      {tag.nombre}
                    </span>
                  ))}
                  {(!libro.tags || libro.tags.length === 0) && <span className="text-sm text-gray-400 italic">Sin etiquetas</span>}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Tabla de Ejemplares Físicos (Se mantiene igual a tu diseño limpio) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>📚</span> Inventario de Copias Físicas
            </h2>
            <span className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full shadow-inner">
              {libro.ejemplares?.length || 0} Registros
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b-2 border-gray-200">
                  <th className="px-6 py-4 font-bold">Nº Inventario</th>
                  <th className="px-6 py-4 font-bold">Observaciones</th>
                  <th className="px-6 py-4 font-bold text-center">Estado Físico</th>
                  <th className="px-6 py-4 font-bold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {libro.ejemplares?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No hay copias físicas registradas para este título.
                    </td>
                  </tr>
                ) : (
                  libro.ejemplares?.map((ej: any) => (
                    <tr key={ej.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-lg text-purple-900">{ej.numeroInventario}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{ej.observaciones || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        {ej.disponibleParaPrestamo ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">Disponible</span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 shadow-sm">Prestado / Baja</span>
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
                          <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded text-sm font-bold cursor-not-allowed border border-gray-200">
                            No Disponible
                          </button>
                        )}
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
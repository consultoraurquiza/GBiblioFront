import Link from "next/link";
import BotonPrestarEjemplar from "@/components/BotonPrestarEjemplar";

async function getLibro(id: string) {
  const res = await fetch(`http://localhost:5078/api/libros/${id}`, {
    cache: "no-store"
  });
  if (!res.ok) return null;
  return res.json();
}

async function getConfiguracion() {
  try {
    const res = await fetch("http://localhost:5078/api/configuracion", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function DetalleLibro({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const libro = await getLibro(resolvedParams.id);
  const config = await getConfiguracion();

  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  if (!libro) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)]`}>
        <h1 className="text-2xl font-bold text-red-500 mb-4">Libro no encontrado</h1>
        <Link href="/" className="text-[var(--acento)] hover:underline font-bold">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      <nav className="p-4 mb-4 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h1 className="text-xl font-bold tracking-wider text-[var(--texto-header)]">DETALLE DEL LIBRO</h1>
          </div>
          <Link href="/admin" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition flex items-center gap-2 shadow-sm  ">
           Volver al Catálogo
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-0">
        
        {/* Encabezado y Botonera */}
        <div className={`p-6 md:p-8 rounded-2xl shadow-sm border mb-8 border-t-4 bg-[var(--card-bg)] transition-colors ${config?.temaId === 'obsidian' ? 'border-white/10 border-t-[var(--acento)]' : 'border-gray-200 border-t-[var(--acento)]'}`}>
          <div className={`flex flex-col md:flex-row justify-end items-start md:items-center mb-6 pb-4 border-b gap-4 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-100'}`}>
            
            
            {/* BOTÓN EDITAR ESTANDARIZADO */}
            <Link href={`/libros/editar/${libro.id}`} className="bg-[var(--acento)] text-white hover:brightness-110 px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-sm flex items-center gap-2 w-full md:w-auto justify-center">
              ✏️ Editar Catálogo e Inventario
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 mt-4">
            <div className="w-full md:w-1/4 flex-shrink-0 flex flex-col items-center">
              <div className={`w-full h-80 border rounded-xl flex items-center justify-center overflow-hidden shadow-md ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                {libro.portadaUrl ? (
                  <img src={libro.portadaUrl} alt={`Portada de ${libro.titulo}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <span className="text-6xl text-gray-300 block mb-2 opacity-50">🖼️</span>
                    <span className={`text-xs font-bold uppercase ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-400'}`}>Sin Imagen</span>
                  </div>
                )}
              </div>
              <div className={`mt-4 w-full px-4 py-3 rounded-lg border text-center ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-white/10' : 'bg-purple-50 border-purple-100'}`}>
                <span className={`block text-xs font-bold uppercase tracking-widest mb-1 text-[var(--acento)]`}>Ubicación Física</span>
                <span className={`block font-bold leading-tight ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>CDU: {libro.clasificacion || "-"}</span>
                <span className={`block font-mono text-sm mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-600'}`}>Cutter: {libro.codigoCutter || "-"}</span>
              </div>
            </div>

            <div className="w-full md:w-3/4 flex flex-col">
              <h1 className={`text-3xl md:text-4xl font-bold mb-1 leading-tight ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{libro.titulo}</h1>
              {libro.subtitulo && <h2 className={`text-xl mb-3 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-600'}`}>{libro.subtitulo}</h2>}
              <p className={`text-2xl font-bold text-[var(--acento)] mb-6 pb-6 border-b ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-100'}`}>{libro.autorPrincipal}</p>
              
              <div className="mb-6 flex-grow">
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-400'}`}>Reseña / Sinopsis</h3>
                {libro.reseniaSinopsis ? (
                  <p className={`leading-relaxed text-sm whitespace-pre-line p-4 rounded-lg border ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-white/5 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                    {libro.reseniaSinopsis}
                  </p>
                ) : (
                  <p className={`text-sm italic ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-400'}`}>No hay sinopsis disponible para este libro.</p>
                )}
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div>
                  <p className={`text-xs font-bold uppercase mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Editorial</p>
                  <p className={`font-medium text-sm ${config?.temaId === 'obsidian' ? 'text-slate-200' : 'text-gray-900'}`}>{libro.editorial || "-"}</p>
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Año Pub.</p>
                  <p className={`font-medium text-sm ${config?.temaId === 'obsidian' ? 'text-slate-200' : 'text-gray-900'}`}>{libro.anioPublicacion || "-"}</p>
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Páginas</p>
                  <p className={`font-medium text-sm ${config?.temaId === 'obsidian' ? 'text-slate-200' : 'text-gray-900'}`}>{libro.cantidadPaginas || "-"}</p>
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>ISBN</p>
                  <p className={`font-medium text-sm font-mono ${config?.temaId === 'obsidian' ? 'text-slate-200' : 'text-gray-900'}`}>{libro.isbn || "-"}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className={`text-xs font-bold uppercase mb-2 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Materias y Etiquetas</p>
                <div className="flex flex-wrap gap-2">
                  {libro.tags?.map((tag: any) => (
                    <span key={tag.id} className={`font-bold text-xs px-3 py-1.5 rounded-full border shadow-sm ${config?.temaId === 'obsidian' ? 'bg-[var(--acento)]/20 text-[var(--acento)] border-[var(--acento)]/30' : 'bg-[var(--acento)]/10 text-[var(--acento)] border-[var(--acento)]/20'}`}>
                      {tag.nombre}
                    </span>
                  ))}
                  {(!libro.tags || libro.tags.length === 0) && <span className={`text-sm italic ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-400'}`}>Sin etiquetas</span>}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className={`rounded-2xl shadow-sm border overflow-hidden bg-[var(--card-bg)] ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <div className={`px-6 py-4 border-b flex justify-between items-center ${config?.temaId === 'obsidian' ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>
              <span>📚</span> Inventario de Copias Físicas
            </h2>
            <span className={`text-sm font-bold px-3 py-1 rounded-full shadow-inner ${config?.temaId === 'obsidian' ? 'bg-[var(--acento)]/20 text-[var(--acento)]' : 'bg-[var(--acento)]/10 text-[var(--acento)]'}`}>
              {libro.ejemplares?.length || 0} Registros
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-xs uppercase tracking-wider border-b-2 ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 text-slate-400 border-white/10' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  <th className="px-6 py-4 font-bold">Nº Inventario</th>
                  <th className="px-6 py-4 font-bold">Observaciones</th>
                  <th className="px-6 py-4 font-bold text-center">Estado Físico</th>
                  <th className="px-6 py-4 font-bold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${config?.temaId === 'obsidian' ? 'divide-white/5' : 'divide-gray-100'}`}>
                {libro.ejemplares?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`px-6 py-12 text-center font-medium ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>
                      No hay copias físicas registradas para este título.
                    </td>
                  </tr>
                ) : (
                  libro.ejemplares?.map((ej: any) => (
                    <tr key={ej.id} className={`transition ${config?.temaId === 'obsidian' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 font-mono font-bold text-lg text-[var(--acento)]">{ej.numeroInventario}</td>
                      <td className={`px-6 py-4 text-sm ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-600'}`}>{ej.observaciones || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        {ej.disponibleParaPrestamo ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${config?.temaId === 'obsidian' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200'}`}>Disponible</span>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${config?.temaId === 'obsidian' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200'}`}>Prestado / Baja</span>
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
                          <button disabled className={`px-4 py-2 rounded text-sm font-bold cursor-not-allowed border ${config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
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
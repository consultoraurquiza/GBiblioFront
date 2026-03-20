"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarLibroCatalogo({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // Estados
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [autorPrincipal, setAutorPrincipal] = useState("");
  const [isbn, setIsbn] = useState("");
  const [editorial, setEditorial] = useState("");
  const [anioPublicacion, setAnioPublicacion] = useState("");
  const [clasificacion, setClasificacion] = useState("");
  const [codigoCutter, setCodigoCutter] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Array de ejemplares (ahora incluye ID y Estado)
  const [ejemplares, setEjemplares] = useState<any[]>([]);

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarLibro = async () => {
      try {
        const res = await fetch(`http://localhost:5078/api/libros/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitulo(data.titulo);
          setSubtitulo(data.subtitulo || "");
          setAutorPrincipal(data.autorPrincipal);
          setIsbn(data.isbn || "");
          setEditorial(data.editorial || "");
          setAnioPublicacion(data.anioPublicacion || "");
          setClasificacion(data.clasificacion || "");
          setCodigoCutter(data.codigoCutter || "");
          
          setTags(data.tags?.map((t: any) => t.nombre) || []);
          
          setEjemplares(data.ejemplares?.map((e: any) => ({
            id: e.id,
            numeroInventario: e.numeroInventario,
            observaciones: e.observaciones || "",
            disponibleParaPrestamo: e.disponibleParaPrestamo
          })) || []);
        }
      } catch (error) {
        console.error("Error al cargar", error);
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarLibro();
  }, [id]);

  // Funciones de Tags
  const manejarInputTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const nuevoTag = tagInput.trim();
      if (nuevoTag && !tags.includes(nuevoTag)) setTags([...tags, nuevoTag]);
      setTagInput("");
    }
  };
  const removerTag = (tagAEliminar: string) => setTags(tags.filter(t => t !== tagAEliminar));

  // Funciones de Ejemplares
  const agregarEjemplar = () => setEjemplares([...ejemplares, { id: null, numeroInventario: "", observaciones: "", disponibleParaPrestamo: true }]);
  const removerEjemplar = (index: number) => setEjemplares(ejemplares.filter((_, i) => i !== index));
  
  const actualizarEjemplar = (index: number, campo: string, valor: any) => {
    const nuevos = [...ejemplares];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setEjemplares(nuevos);
  };

  // Guardar en API
  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ejemplares.some(ej => ej.numeroInventario.trim() === "")) {
      alert("Completá el Número de Inventario de todos los ejemplares.");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`http://localhost:5078/api/libros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(id),
          titulo, subtitulo, autorPrincipal, isbn, editorial, anioPublicacion, clasificacion, codigoCutter,
          tags,
          ejemplares
        }),
      });

      if (res.ok) {
        alert("¡Catálogo actualizado correctamente!");
        router.push(`/libros/${id}`); // Volvemos a la ficha del libro
      } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.mensaje || "Revisá los datos."));
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoDatos) return <div className="p-8 text-center text-black">Cargando catálogo...</div>;

  return (
    <main className="min-h-screen bg-gray-50  text-black">
      <nav className="bg-slate-800 text-white p-4 mb-4 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-wider">EDICION</h1>
          </div>
          <Link href={`/libros/${id}`} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            Volver al Libro
          </Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-purple-600">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Editar Catálogo e Inventario</h1>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold text-sm">Libro #{id}</span>
        </div>

        <form onSubmit={guardarEdicion} className="space-y-8">
          
          <section>
            <h2 className="text-lg font-semibold text-purple-800 mb-4 bg-purple-50 p-2 rounded">Ficha Bibliográfica</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" required className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor Principal *</label>
                <input type="text" required className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={autorPrincipal} onChange={(e) => setAutorPrincipal(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Editorial</label>
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={editorial} onChange={(e) => setEditorial(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año Pub.</label>
                  <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={anioPublicacion} onChange={(e) => setAnioPublicacion(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-800 mb-4 bg-purple-50 p-2 rounded">Ubicación y Materias</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación (Ej: 863)</label>
                <input type="text" className="w-full border p-2 rounded font-mono" value={clasificacion} onChange={(e) => setClasificacion(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cutter-Sanborn</label>
                <input type="text" className="w-full border p-2 rounded font-mono" value={codigoCutter} onChange={(e) => setCodigoCutter(e.target.value)} />
              </div>
            </div>
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">Agregar Tags (Enter o coma)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                    {tag} <button type="button" onClick={() => removerTag(tag)} className="hover:text-red-300 font-bold">×</button>
                  </span>
                ))}
              </div>
              <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={manejarInputTag} />
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4 bg-gray-100 p-2 rounded border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Ejemplares Físicos (Inventario)</h2>
              <button type="button" onClick={agregarEjemplar} className="text-sm bg-purple-200 text-purple-800 hover:bg-purple-300 px-3 py-1 rounded font-bold transition">
                + Agregar Copia
              </button>
            </div>
            
            <div className="space-y-3">
              {ejemplares.map((ej, index) => (
                <div key={index} className={`flex gap-3 items-center p-3 border rounded-lg shadow-sm ${ej.disponibleParaPrestamo ? 'bg-white border-gray-300' : 'bg-red-50 border-red-200'}`}>
                  <div className="w-1/4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nº Inventario</label>
                    <input type="text" required className="w-full border p-2 rounded font-mono font-bold" value={ej.numeroInventario} onChange={(e) => actualizarEjemplar(index, 'numeroInventario', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Observaciones</label>
                    <input type="text" placeholder="Ej: Faltan hojas..." className="w-full border p-2 rounded" value={ej.observaciones} onChange={(e) => actualizarEjemplar(index, 'observaciones', e.target.value)} />
                  </div>
                  <div className="w-1/5 pt-5 text-center">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input type="checkbox" className="w-4 h-4 text-purple-600" checked={ej.disponibleParaPrestamo} onChange={(e) => actualizarEjemplar(index, 'disponibleParaPrestamo', e.target.checked)} />
                      Disponible
                    </label>
                  </div>
                  <button type="button" onClick={() => removerEjemplar(index)} className="mt-5 text-red-500 hover:bg-red-100 px-3 py-2 rounded transition font-bold text-lg" title="Quitar este ejemplar">
                    ✕
                  </button>
                </div>
              ))}
              {ejemplares.length === 0 && <p className="text-red-500 font-medium p-4 text-center border border-red-200 rounded-lg">¡Atención! El libro no tiene copias físicas registradas.</p>}
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <Link href={`/libros/${id}`} className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded transition">Cancelar</Link>
            <button type="submit" disabled={guardando} className={`px-8 py-3 rounded-xl font-bold text-white transition shadow-lg ${guardando ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}`}>
              {guardando ? 'Guardando Cambios...' : 'Guardar Edición'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
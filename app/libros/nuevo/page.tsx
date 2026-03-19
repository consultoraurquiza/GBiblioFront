"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoLibroCatalogo() {
  const router = useRouter();

  // Estados del Libro
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [autorPrincipal, setAutorPrincipal] = useState("");
  const [isbn, setIsbn] = useState("");
  const [editorial, setEditorial] = useState("");
  const [anioPublicacion, setAnioPublicacion] = useState("");
  const [clasificacion, setClasificacion] = useState("");
  const [codigoCutter, setCodigoCutter] = useState("");
  const [buscandoIsbn, setBuscandoIsbn] = useState(false);

  // NUEVO: Estados para los Tags
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Estados de los Ejemplares Físicos
  const [ejemplares, setEjemplares] = useState([{ numeroInventario: "", observaciones: "" }]);
  const [cargando, setCargando] = useState(false);

  // --- Funciones para Tags ---
  const manejarInputTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si aprieta Enter o la coma (,) agregamos el tag
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const nuevoTag = tagInput.trim();
      if (nuevoTag && !tags.includes(nuevoTag)) {
        setTags([...tags, nuevoTag]);
      }
      setTagInput("");
    }
  };

  const removerTag = (tagAEliminar: string) => {
    setTags(tags.filter(t => t !== tagAEliminar));
  };

  // --- Funciones para Ejemplares ---
  const agregarEjemplar = () => setEjemplares([...ejemplares, { numeroInventario: "", observaciones: "" }]);
  const removerEjemplar = (index: number) => setEjemplares(ejemplares.filter((_, i) => i !== index));
  const actualizarEjemplar = (index: number, campo: string, valor: string) => {
    const nuevos = [...ejemplares];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setEjemplares(nuevos);
  };

  // Función para autocompletar el Cutter-Sanborn
  const autocompletarCutter = async (autorIngresado: string) => {
    if (!autorIngresado || autorIngresado.length < 2) return;
    
    try {
      const res = await fetch(`http://localhost:5078/api/libros/cutter/${autorIngresado}`);
      if (res.ok) {
        const data = await res.json();
        setCodigoCutter(data.cutter); // Rellenamos el input mágicamente
      }
    } catch (error) {
      console.error("No se pudo calcular el Cutter automáticamente.");
    }
  };

  // Función para invertir "Nombre Apellido" a "Apellido, Nombre"
  const invertirNombreComercial = (nombreComercial: string) => {
    if (!nombreComercial) return "";
    const partes = nombreComercial.trim().split(" ");
    
    // Si tiene una sola palabra (ej: "Homero"), lo devolvemos igual
    if (partes.length <= 1) return nombreComercial; 
    
    // Sacamos la última palabra asumiendo que es el apellido
    const apellido = partes.pop(); 
    const nombres = partes.join(" "); // Juntamos todo lo demás
    
    return `${apellido}, ${nombres}`;
  };

  const buscarDatosPorIsbn = async () => {
    if (!isbn || isbn.length < 10) {
      alert("Por favor, ingresá un ISBN válido (10 o 13 dígitos) para buscar.");
      return;
    }
    
    setBuscandoIsbn(true);
    // Limpiamos campos por las dudas
    setTitulo(""); setSubtitulo(""); setAutorPrincipal(""); setEditorial(""); setAnioPublicacion("");

    try {
      const res = await fetch(`http://localhost:5078/api/libros/lookup/isbn/${isbn}`);
      
      if (res.ok) {
        const data = await res.json();
        // Rellenamos el formulario mágicamente
        setTitulo(data.titulo);
        setSubtitulo(data.subtitulo);
        setEditorial(data.editorial);
        setAnioPublicacion(data.anioPublicacion);
        
        // Magia híbrida: Invertimos el nombre antes de ponerlo en pantalla
        const autorInvertido = invertirNombreComercial(data.autorPrincipal);
        setAutorPrincipal(autorInvertido);
        
        // Ahora sí, disparamos el cálculo del Cutter con el formato "Apellido, Nombre"
        if (autorInvertido) {
          autocompletarCutter(autorInvertido);
        }
        
        // ¡Opa! Si se rellenó el autor, intentamos calcular el Cutter automáticamente
        //if(data.autorPrincipal) autocompletarCutter(data.autorPrincipal);

      } else {
        const err = await res.json();
        alert(err.mensaje || "No se encontraron datos para este ISBN.");
      }
    } catch (error) {
      alert("No se pudo conectar con el servicio de búsqueda.");
    } finally {
      setBuscandoIsbn(false);
    }
  };

  // --- Guardar en API ---
  const guardarLibro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ejemplares.some(ej => ej.numeroInventario.trim() === "")) {
      alert("Completá el Número de Inventario de todos los ejemplares.");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch("http://localhost:5078/api/libros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo, subtitulo, autorPrincipal, isbn, editorial, anioPublicacion, clasificacion, codigoCutter,
          tags, // Mandamos el array de strings simple
          ejemplares: ejemplares.map(ej => ({
            numeroInventario: ej.numeroInventario,
            observaciones: ej.observaciones
          }))
        }),
      });

      if (res.ok) {
        alert("¡Catálogo e inventario actualizados!");
        router.push("/"); 
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
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-purple-600">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Ingresar Título al Catálogo</h1>

        <form onSubmit={guardarLibro} className="space-y-8">
          
          {/* SECCIÓN 1: DATOS BIBLIOGRÁFICOS */}
          <section>
            <h2 className="text-lg font-semibold text-purple-800 mb-4 bg-purple-50 p-2 rounded">1. Ficha Bibliográfica</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" required className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor Principal *</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" 
                  placeholder="Ej: Borges, Jorge Luis" 
                  value={autorPrincipal} 
                  onChange={(e) => setAutorPrincipal(e.target.value)} 
                  onBlur={() => autocompletarCutter(autorPrincipal)} 
                />
                <p className="text-xs text-amber-600 mt-1 font-medium bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-200">
                  ⚠️ Ojo: Revisar autores con apellidos compuestos (ej: García Márquez).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Editorial</label>
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" value={editorial} onChange={(e) => setEditorial(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año Pub.</label>
                  <input type="text" placeholder="Ej: 2010" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" value={anioPublicacion} onChange={(e) => setAnioPublicacion(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input 
                    type="text" 
                    placeholder="978..."
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none mb-2" 
                    value={isbn} 
                    onChange={(e) => setIsbn(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={buscarDatosPorIsbn}
                    disabled={buscandoIsbn}
                    className={`w-full justify-center px-3 py-2 rounded-lg border transition flex items-center gap-2 text-sm font-bold ${buscandoIsbn ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'}`}
                    title="Buscar datos automáticamente en Google Books"
                  >
                    {buscandoIsbn ? '⏳ Buscando...' : '✨ Autocompletar desde Internet'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* NUEVA SECCIÓN: ETIQUETAS (TAGS) */}
          <section>
            <h2 className="text-lg font-semibold text-purple-800 mb-4 bg-purple-50 p-2 rounded">2. Etiquetas y Materias</h2>
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agregar Tags (Escribí el tema y apretá <kbd className="bg-gray-200 px-1 rounded">Enter</kbd> o coma)
              </label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                    {tag}
                    <button type="button" onClick={() => removerTag(tag)} className="hover:text-red-300 font-bold">×</button>
                  </span>
                ))}
              </div>

              <input 
                type="text" 
                placeholder="Ej: Historia Argentina, Novela, Ficción..." 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" 
                value={tagInput} 
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={manejarInputTag}
              />
            </div>
          </section>

          {/* SECCIÓN SIGNATURA TOPOGRÁFICA */}
          <section>
            <h2 className="text-lg font-semibold text-purple-800 mb-4 bg-purple-50 p-2 rounded">3. Ubicación en Estante</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación (Ej: 863)</label>
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none font-mono" value={clasificacion} onChange={(e) => setClasificacion(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cutter-Sanborn (Ej: B732)</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded font-mono focus:ring-2 focus:ring-purple-500" 
                  value={codigoCutter} 
                  onChange={(e) => setCodigoCutter(e.target.value)} 
                />
                <p className="text-xs text-amber-600 mt-1 font-medium bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-200 shadow-sm">
                  ⚠️ Ojo: Revisar si el autor tenía apellido compuesto.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN EJEMPLARES FÍSICOS */}
          <section>
            <div className="flex justify-between items-center mb-4 bg-gray-100 p-2 rounded border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">4. Ejemplares Físicos (Inventario)</h2>
              <button type="button" onClick={agregarEjemplar} className="text-sm bg-purple-200 text-purple-800 hover:bg-purple-300 px-3 py-1 rounded font-bold transition">
                + Agregar Copia
              </button>
            </div>
            
            <div className="space-y-3">
              {ejemplares.map((ej, index) => (
                <div key={index} className="flex gap-3 items-start bg-white p-3 border border-gray-300 rounded-lg shadow-sm">
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nº Inventario *</label>
                    <input 
                      type="text" required placeholder="Ej: 00452"
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none font-mono font-bold text-purple-900 bg-purple-50"
                      value={ej.numeroInventario} onChange={(e) => actualizarEjemplar(index, 'numeroInventario', e.target.value)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Observaciones</label>
                    <input 
                      type="text" placeholder="Ej: Faltan hojas..."
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                      value={ej.observaciones} onChange={(e) => actualizarEjemplar(index, 'observaciones', e.target.value)} 
                    />
                  </div>
                  {ejemplares.length > 1 && (
                    <button type="button" onClick={() => removerEjemplar(index)} className="mt-6 text-red-500 hover:bg-red-50 px-3 py-2 rounded transition">✕</button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <Link href="/" className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded transition">Cancelar</Link>
            <button type="submit" disabled={cargando} className={`px-8 py-3 rounded-xl font-bold text-white transition shadow-lg ${cargando ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}`}>
              {cargando ? 'Guardando...' : 'Guardar Ficha'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
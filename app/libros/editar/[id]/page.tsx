"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarLibroCatalogo({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  // Estados básicos del Libro
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [autorPrincipal, setAutorPrincipal] = useState("");
  const [isbn, setIsbn] = useState("");
  const [editorial, setEditorial] = useState("");
  const [anioPublicacion, setAnioPublicacion] = useState("");
  const [clasificacion, setClasificacion] = useState("");
  const [codigoCutter, setCodigoCutter] = useState("");

  const [buscandoIsbn, setBuscandoIsbn] = useState(false);
  const [proveedorDatos, setProveedorDatos] = useState("todas");

  // NUEVOS ESTADOS EXPANSIBLES
  const [reseniaSinopsis, setReseniaSinopsis] = useState("");
  const [cantidadPaginas, setCantidadPaginas] = useState("");
  const [portadaUrl, setPortadaUrl] = useState("");
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const [usarPortadaLocal, setUsarPortadaLocal] = useState(false);
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  
  // Estados para los Tags
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Array de ejemplares (inventario físico)
  const [ejemplares, setEjemplares] = useState<any[]>([]);

  // Estados de UI
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // --- ESTADOS Y FUNCIONES PARA AUTOCOMPLETADO ---
  const [sugerenciasAutor, setSugerenciasAutor] = useState<string[]>([]);
  const [mostrarSugerenciasAutor, setMostrarSugerenciasAutor] = useState(false);

  const [sugerenciasTags, setSugerenciasTags] = useState<string[]>([]);
  const [mostrarSugerenciasTags, setMostrarSugerenciasTags] = useState(false);

  const manejarCambioAutor = async (texto: string) => {
    setAutorPrincipal(texto);
    if (texto.length >= 2) {
      try {
        const res = await fetch(`http://localhost:5078/api/libros/autores/buscar?q=${texto}`);
        if (res.ok) {
          const data = await res.json();
          setSugerenciasAutor(data);
          setMostrarSugerenciasAutor(true);
        }
      } catch (e) { console.error(e); }
    } else {
      setMostrarSugerenciasAutor(false);
    }
  };

  const seleccionarAutor = (autor: string) => {
    setAutorPrincipal(autor);
    setMostrarSugerenciasAutor(false);
  };

  const manejarCambioTag = async (texto: string) => {
    setTagInput(texto);
    if (texto.length >= 2) {
      try {
        const res = await fetch(`http://localhost:5078/api/libros/tags/buscar?q=${texto}`);
        if (res.ok) {
          const data = await res.json();
          setSugerenciasTags(data);
          setMostrarSugerenciasTags(true);
        }
      } catch (e) { console.error(e); }
    } else {
      setMostrarSugerenciasTags(false);
    }
  };

  const seleccionarTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
    setMostrarSugerenciasTags(false);
  };

  // --- 1. Cargar datos iniciales desde el Backend ---
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
          
          setReseniaSinopsis(data.reseniaSinopsis || "");
          setCantidadPaginas(data.cantidadPaginas ? data.cantidadPaginas.toString() : "");
          setPortadaUrl(data.portadaUrl || "");
          setPortadaPreview(data.portadaUrl || null); 

          setUsarPortadaLocal(data.usarPortadaLocal || false);
          if (data.usarPortadaLocal && data.portadaLocalUrl) {
              setPortadaPreview(data.portadaLocalUrl); 
          } else {
              setPortadaPreview(data.portadaUrl || null); 
          }
          
          setTags(data.tags?.map((t: any) => t.nombre) || []);
          
          setEjemplares(data.ejemplares?.map((e: any) => ({
            id: e.id,
            numeroInventario: e.numeroInventario,
            observaciones: e.observaciones || "",
            disponibleParaPrestamo: e.disponibleParaPrestamo
          })) || []);
        } else {
            alert("No se pudo cargar el libro.");
            router.push("/");
        }
      } catch (error) {
        console.error("Error al cargar", error);
        alert("Error de conexión al cargar datos.");
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarLibro();
  }, [id, router]);

  const traductorCategorias: { [key: string]: string[] } = {
  "Fiction": ["Literatura", "Novela"],
  "Fiction / General": ["Literatura"],
  "Fiction / Literary": ["Literatura", "Clásico"],
  "Detective and mystery stories": ["Novela Negra", "Suspenso"],
  "Fiction / Mystery & Detective / General": ["Novela Negra", "Suspenso"],
  "Fiction / Fantasy / General": ["Fantasía"],
  "Fiction / Science Fiction / General": ["Ciencia Ficción"],
  "Fiction / Historical / General": ["Novela Histórica"],
  "Fiction / Romance / General": ["Romance"],
  "Poetry / General": ["Poesía"],
  "Drama / General": ["Teatro"],
  "Comics & Graphic Novels / General": ["Cómic", "Novela Gráfica"],
  "Juvenile Fiction": ["Infantil", "Juvenil"],
  "Children's stories": ["Infantil"],
  "History / General": ["Historia"],
  "Biography & Autobiography / General": ["Biografía"],
  "Science / General": ["Ciencias Naturales"],
  "Philosophy / General": ["Filosofía"],
  "Psychology / General": ["Psicología"],
  "Social Science / General": ["Ciencias Sociales"],
  "Language Arts & Disciplines / General": ["Lengua y Literatura"],
  "Mathematics / General": ["Matemática"],
  "Computers / General": ["Tecnología", "Informática"],
  "Education / General": ["Pedagogía"],
  "Textbooks": ["Manual Escolar"],
  "Dictionaries": ["Diccionario", "Referencia"],
  "Art / General": ["Arte", "Música"],
  "Sports & Recreation / General": ["Educación Física"],
  "Cooking / General": ["Cocina"],
  };

  const obtenerTagsAutomaticos = (categoriesFromGoogle: string[]): string[] => {
    if (!categoriesFromGoogle || categoriesFromGoogle.length === 0) return [];
    const nuevosTags = new Set<string>(); 

    categoriesFromGoogle.forEach(categoryEnIngles => {
      const tagsTraducidos = traductorCategorias[categoryEnIngles];
      if (tagsTraducidos) {
        tagsTraducidos.forEach(tag => nuevosTags.add(tag));
      } else {
        const catBaja = categoryEnIngles.toLowerCase();
        let fueTraducido = false;

        if (catBaja.includes("fiction")) { nuevosTags.add("Literatura"); fueTraducido = true; }
        if (catBaja.includes("history")) { nuevosTags.add("Historia"); fueTraducido = true; }
        if (catBaja.includes("science")) { nuevosTags.add("Ciencia"); fueTraducido = true; }
        if (catBaja.includes("juvenile") || catBaja.includes("children")) { nuevosTags.add("Infantil/Juvenil"); fueTraducido = true; }
        if (catBaja.includes("mystery") || catBaja.includes("detective")) { nuevosTags.add("Misterio/Policial"); fueTraducido = true; }
        if (catBaja.includes("fantasy")) { nuevosTags.add("Fantasía"); fueTraducido = true; }
        if (catBaja.includes("philosophy")) { nuevosTags.add("Filosofía"); fueTraducido = true; }
        
        if (!fueTraducido) {
          nuevosTags.add(categoryEnIngles); 
        }
      }
    });

    return Array.from(nuevosTags); 
  };

  const autocompletarCutter = async (autorIngresado: string) => {
    if (!autorIngresado || autorIngresado.length < 2) return;
    try {
      const res = await fetch(`http://localhost:5078/api/libros/cutter/${autorIngresado}`);
      if (res.ok) {
        const data = await res.json();
        setCodigoCutter(data.cutter); 
      }
    } catch (error) {
      console.error("No se pudo calcular el Cutter automáticamente.");
    }
  };

  const invertirNombreComercial = (nombreComercial: string) => {
    if (!nombreComercial) return "";
    const partes = nombreComercial.trim().split(" ");
    if (partes.length <= 1) return nombreComercial; 
    const apellido = partes.pop(); 
    const nombres = partes.join(" "); 
    return `${apellido}, ${nombres}`;
  };

  const buscarDatosPorIsbn = async () => {
    if (!isbn || isbn.length < 10) {
      alert("Por favor, ingresá un ISBN válido (10 o 13 dígitos) para buscar.");
      return;
    }
    
    setBuscandoIsbn(true);
    setTitulo(""); setSubtitulo(""); setAutorPrincipal(""); setEditorial(""); setAnioPublicacion("");

    try {
      const res = await fetch(`http://localhost:5078/api/libros/lookup/isbn/${isbn}?proveedor=${proveedorDatos}`);
      
      if (res.ok) {
        const data = await res.json();
        
        setTitulo(data.titulo);
        setSubtitulo(data.subtitulo);
        setEditorial(data.editorial);
        setAnioPublicacion(data.anioPublicacion);

        setReseniaSinopsis(data.reseniaSinopsis?.replace(/<[^>]+>/g, '') || "");
        setCantidadPaginas(data.cantidadPaginas ? data.cantidadPaginas.toString() : "");

        const urlImagen = data.portadaUrl || "";
        const urlSegura = urlImagen.replace("http://", "https://");
        setPortadaUrl(urlSegura);
        setPortadaPreview(urlSegura);

        const categoriasGoogle = data.categorias || [];
        const tagsSugeridos = obtenerTagsAutomaticos(categoriasGoogle);
        setTags(prev => Array.from(new Set([...prev, ...tagsSugeridos])));
        
        const autorInvertido = invertirNombreComercial(data.autorPrincipal);
        setAutorPrincipal(autorInvertido);
        
        if (autorInvertido) {
          autocompletarCutter(autorInvertido);
        }

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

  const manejarInputTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const nuevoTag = tagInput.trim();
      if (nuevoTag && !tags.includes(nuevoTag)) setTags([...tags, nuevoTag]);
      setTagInput("");
    }
  };
  const removerTag = (tagAEliminar: string) => setTags(tags.filter(t => t !== tagAEliminar));

  const agregarEjemplar = () => setEjemplares([...ejemplares, { id: null, numeroInventario: "", observaciones: "", disponibleParaPrestamo: true }]);
  const removerEjemplar = (index: number) => setEjemplares(ejemplares.filter((_, i) => i !== index));
  const actualizarEjemplar = (index: number, campo: string, valor: any) => {
    const nuevos = [...ejemplares];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setEjemplares(nuevos);
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ejemplares.some(ej => ej.numeroInventario.trim() === "")) {
      alert("Completá el Número de Inventario de todos los ejemplares.");
      return;
    }

    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append("id", id.toString());
      formData.append("titulo", titulo);
      formData.append("subtitulo", subtitulo);
      formData.append("autorPrincipal", autorPrincipal);
      formData.append("isbn", isbn);
      formData.append("editorial", editorial);
      formData.append("anioPublicacion", anioPublicacion);
      formData.append("clasificacion", clasificacion);
      formData.append("codigoCutter", codigoCutter);
      formData.append("reseniaSinopsis", reseniaSinopsis);
      formData.append("portadaUrl", portadaUrl);
      
      if (cantidadPaginas) {
        formData.append("cantidadPaginas", cantidadPaginas.toString());
      }

      formData.append("usarPortadaLocal", usarPortadaLocal.toString());
      if (archivoPortada) {
        formData.append("archivoPortada", archivoPortada);
      }

      tags.forEach((tag, index) => {
        formData.append(`Tags[${index}]`, tag);
      });

      ejemplares.forEach((ej, index) => {
        if (ej.id) formData.append(`Ejemplares[${index}].Id`, ej.id.toString());
        formData.append(`Ejemplares[${index}].NumeroInventario`, ej.numeroInventario);
        formData.append(`Ejemplares[${index}].Observaciones`, ej.observaciones);
        formData.append(`Ejemplares[${index}].DisponibleParaPrestamo`, ej.disponibleParaPrestamo.toString());
      });

      const res = await fetch(`http://localhost:5078/api/libros/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        alert("¡Ficha actualizada correctamente!");
        router.push(`/libros/${id}`);
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

  if (cargandoDatos) return <div className="p-12 text-center text-gray-500 font-bold animate-pulse text-lg">Cargando datos del catálogo...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-slate-800 text-white p-4 mb-4 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            <h1 className="text-xl font-bold tracking-wider">EDITAR LIBRO</h1>
          </div>
          <Link href={`/libros/${id}`} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition flex items-center gap-2">
            ← Volver a la Ficha
          </Link>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-yellow-500 mb-12">
        <div className="flex justify-between items-center mb-6 border-b pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Modificar Título e Inventario</h1>
            <p className="text-gray-500 text-sm mt-1">Estás editando la información del registro del catálogo.</p>
          </div>
          <span className="bg-yellow-50 text-yellow-900 px-4 py-2 rounded-lg font-bold text-sm border border-yellow-200 whitespace-nowrap shadow-inner flex items-center gap-2 flex-shrink-0">
             Registro # {id}
          </span>
        </div>

        <form onSubmit={guardarEdicion} className="space-y-10">
          
          {/* SECCIÓN 1: DATOS BIBLIOGRÁFICOS + PORTADA */}
          <section>
            <h2 className="text-lg font-semibold text-purple-800 mb-5 bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center gap-2">
              <span>1️⃣</span> Ficha Bibliográfica Principal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" required className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-600" value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
              </div>

              {/* --- CAMPO AUTOR CON AUTOCOMPLETADO Y CUTTER --- */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor Principal *</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium text-purple-900 bg-purple-50/50" 
                  placeholder="Ej: Borges, Jorge Luis" 
                  value={autorPrincipal} 
                  onChange={(e) => manejarCambioAutor(e.target.value)} 
                  onBlur={() => {
                    autocompletarCutter(autorPrincipal);
                    setTimeout(() => setMostrarSugerenciasAutor(false), 200);
                  }} 
                />
                
                {/* Cajita flotante de Autores */}
                {mostrarSugerenciasAutor && sugerenciasAutor.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {sugerenciasAutor.map((autor, i) => (
                      <li 
                        key={i} 
                        className="p-3 hover:bg-yellow-100 cursor-pointer text-sm font-medium text-gray-700 border-b last:border-0 transition" 
                        onClick={() => seleccionarAutor(autor)}
                      >
                        ✍️ {autor}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[10px] text-amber-600 mt-1 font-medium bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-200">
                  ⚠️ Ojo: Revisar autores con apellidos compuestos.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Editorial</label>
                <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={editorial} onChange={(e) => setEditorial(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año Pub.</label>
                  <input type="text" placeholder="Ej: 1995" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={anioPublicacion} onChange={(e) => setAnioPublicacion(e.target.value)} />
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
                  </div>
                  <div className="flex col-span-2">
                    <div><span className="text-sm font-medium text-gray-700 mr-2">Origen Datos:</span></div>
                  <div>
                    
                      <select 
                        className="border border-gray-300 p-2 rounded-lg bg-gray-50 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500  mr-2"
                        value={proveedorDatos}
                        onChange={(e) => setProveedorDatos(e.target.value)}
                      >
                        <option value="todas">🚀 Todas </option>
                        <option value="google">🔍 Solo Google Books</option>
                        <option value="openlibrary">📚 Solo Open Library</option>
                      </select>
                      </div>
                      <div>
                  <button 
                    type="button" 
                    onClick={buscarDatosPorIsbn}
                    disabled={buscandoIsbn}
                    className={`w-full justify-center px-3 py-2 rounded-lg border transition flex items-center gap-2 text-sm font-bold ${buscandoIsbn ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'}`}
                    title="Buscar datos automáticamente"
                  >
                    {buscandoIsbn ? '⏳ Buscando...' : '✨ Autocompletar'}
                  </button>
                  </div>
                  </div>
                </div>
                  </div>
                
              
            

            {/* --- PANEL DE PORTADA Y DATOS EXPANSIBLES --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
              
              {/* COLUMNA 1: PREVIEW DE LA TAPA */}
              <div className="col-span-1 flex flex-col items-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Portada Actual</h4>
                <div className="w-full h-56 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                  {portadaPreview ? (
                    <img src={portadaPreview.startsWith('/') ? `http://localhost:5078${portadaPreview}` : portadaPreview} alt="Tapa del libro" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl text-gray-300">🖼️</span>
                  )}
                </div>
              </div>

              {/* COLUMNA 2, 3 y 4: DATOS EXPANSIBLES */}
              <div className="col-span-1 md:col-span-3 space-y-4">
                
                {/* Opciones Locales */}
                <div className="border-2 border-dashed border-purple-200 p-4 rounded-lg bg-white mb-3 shadow-inner">
                  <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-1"><span>💾</span> Opciones Locales (Autonomía)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium bg-gray-100 p-2 rounded-lg border border-gray-200 hover:bg-gray-200 transition">
                      <input 
                        type="checkbox" 
                        checked={usarPortadaLocal} 
                        onChange={(e) => setUsarPortadaLocal(e.target.checked)} 
                        className="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded border-gray-300"
                      />
                      Usar Portada Local
                    </label>
                    
                    <div>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border file:border-gray-300 file:text-xs file:font-bold file:bg-white file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setArchivoPortada(file);
                            setUsarPortadaLocal(true);
                            setPortadaPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <p className="text-[10px] text-gray-400 mt-1 pl-1">Permitido: JPG, PNG. Máx 5MB.</p>
                    </div>
                  </div>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reseña / Sinopsis / Índice</label>
                  <textarea 
                    rows={6}
                    placeholder="Escriba o pegue la sinopsis o el índice del libro..."
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm leading-relaxed bg-white" 
                    value={reseniaSinopsis} 
                    onChange={(e) => setReseniaSinopsis(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN UBICACIÓN Y TAGS */}
          <section>
            <h2 className="text-lg font-semibold text-purple-800 mb-5 bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center gap-2">
              <span>2️⃣</span> Clasificación y Materias
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Clasificación (CDU/Dewey)</label>
                <input type="text" placeholder="Ej: 863 (Novela)" className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-purple-500 focus:ring-0 outline-none font-mono text-lg font-bold text-gray-800" value={clasificacion} onChange={(e) => setClasificacion(e.target.value)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Cutter-Sanborn</label>
                <input type="text" placeholder="Ej: B732" className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-purple-500 focus:ring-0 outline-none font-mono text-lg font-bold text-gray-800" value={codigoCutter} onChange={(e) => setCodigoCutter(e.target.value)} />
              </div>
            </div>
            
            <div className="border border-gray-300 p-5 rounded-xl bg-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">Temas y Etiquetas (Escribí y apretá <kbd className="bg-gray-200 px-1.5 py-0.5 rounded border border-gray-300 font-sans text-xs">Enter</kbd> o coma)</label>
              {tags.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setTags([])} 
                    className="text-xs text-red-600 hover:text-red-800 font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition flex items-center gap-1 shadow-sm mb-1"
                    title="Borrar todas las etiquetas"
                  >
                    🗑️ Limpiar todo ({tags.length})
                  </button>
                )}
              <div className="flex flex-wrap gap-2.5 mb-4 p-2 min-h-[50px] bg-white rounded-lg border border-gray-200 shadow-inner">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    {tag} <button type="button" onClick={() => removerTag(tag)} className="hover:text-red-300 font-bold transition text-lg leading-none">×</button>
                  </span>
                ))}
                {tags.length === 0 && <span className="text-gray-400 text-sm italic p-1">No hay etiquetas asignadas...</span>}
              </div>
              
              {/* --- CAMPO TAGS CON AUTOCOMPLETADO TESAURO --- */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar en el Tesauro (Ej: Educación, Ficción...)" 
                  className="w-full border-2 p-3 rounded-lg focus:border-purple-500 focus:ring-0 outline-none bg-white font-medium" 
                  value={tagInput} 
                  onChange={(e) => manejarCambioTag(e.target.value)}
                  onKeyDown={manejarInputTag}
                  onBlur={() => setTimeout(() => setMostrarSugerenciasTags(false), 200)}
                />

                {/* Cajita flotante del Tesauro */}
                {mostrarSugerenciasTags && sugerenciasTags.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-purple-200 mt-1 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                    {sugerenciasTags.map((tag, i) => (
                      <li 
                        key={i} 
                        className="p-3 hover:bg-purple-100 cursor-pointer text-sm font-bold text-purple-900 border-b border-purple-50 last:border-0 transition flex items-center gap-2" 
                        onClick={() => seleccionarTag(tag)}
                      >
                        🏷️ {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>
          </section>

          {/* SECCIÓN EJEMPLARES */}
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 bg-slate-800 text-white p-3 px-4 rounded-lg shadow-md gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><span>3️⃣</span> Inventario de Copias Físicas</h2>
              <button type="button" onClick={agregarEjemplar} className="text-sm bg-yellow-400 text-slate-900 hover:bg-yellow-300 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 w-full md:w-auto justify-center shadow">
                ➕ Agregar Copia Física
              </button>
            </div>
            
            <div className="space-y-4">
              {ejemplares.map((ej, index) => (
                <div key={index} className={`flex flex-col md:flex-row gap-4 items-start md:items-center p-4 border rounded-xl shadow-sm transition ${ej.disponibleParaPrestamo ? 'bg-white border-gray-300' : 'bg-red-50 border-red-200'}`}>
                  <div className="w-full md:w-1/4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nº Inventario *</label>
                    <input type="text" required className="w-full border border-gray-300 p-2.5 rounded-lg font-mono font-bold text-lg text-purple-900 bg-purple-50" value={ej.numeroInventario} onChange={(e) => actualizarEjemplar(index, 'numeroInventario', e.target.value)} />
                  </div>
                  <div className="w-full md:flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Observaciones</label>
                    <input type="text" placeholder="Ej: Tapa dañada, faltan hojas..." className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" value={ej.observaciones} onChange={(e) => actualizarEjemplar(index, 'observaciones', e.target.value)} />
                  </div>
                  <div className="w-full md:w-auto md:pt-6 flex justify-between md:justify-start items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200">
                      <input type="checkbox" className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500" checked={ej.disponibleParaPrestamo} onChange={(e) => actualizarEjemplar(index, 'disponibleParaPrestamo', e.target.checked)} />
                      Disponible
                    </label>
                    <button type="button" onClick={() => removerEjemplar(index)} className="text-red-500 hover:bg-red-100 p-2.5 rounded-full transition group" title="Quitar este ejemplar">
                      <span className="font-bold text-xl group-hover:scale-110 block">✕</span>
                    </button>
                  </div>
                </div>
              ))}
              {ejemplares.length === 0 && <p className="text-red-600 font-bold p-6 text-center border-2 border-dashed border-red-200 rounded-xl bg-red-50">⚠️ ¡Atención! No hay copias físicas registradas para este libro. El título existe en el catálogo pero no hay stock.</p>}
            </div>
          </section>

          {/* BOTONERA FINAL */}
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-8 border-t border-gray-100 mt-10">
            <Link href={`/libros/${id}`} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition text-center order-2 md:order-1 border border-gray-200 md:border-none">
              Cancelar y Volver
            </Link>
            <button type="submit" disabled={guardando} className={`px-10 py-3.5 rounded-xl font-bold text-white transition shadow-lg text-lg order-1 md:order-2 flex items-center gap-2 justify-center ${guardando ? 'bg-yellow-400 cursor-wait' : 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950'}`}>
              {guardando ? '⌛ Guardando Cambios...' : '💾 Guardar Ficha Actualizada'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
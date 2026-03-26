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
  const [reseniaSinopsis, setReseniaSinopsis] = useState("");
  const [cantidadPaginas, setCantidadPaginas] = useState("");
  const [portadaUrl, setPortadaUrl] = useState("");
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const [usarPortadaLocal, setUsarPortadaLocal] = useState(false); // El 'bool check'
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null); // El archivo subido
  const [proveedorDatos, setProveedorDatos] = useState("todas");

  // NUEVO: Estados para los Tags
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  //const [tagsSeleccionados, setTagsSeleccionados] = useState<string[]>([]);

  // Estados de los Ejemplares Físicos
  const [ejemplares, setEjemplares] = useState([{ numeroInventario: "", observaciones: "" }]);
  const [cargando, setCargando] = useState(false);

  const [sugerenciasAutor, setSugerenciasAutor] = useState<string[]>([]);
  const [mostrarSugerenciasAutor, setMostrarSugerenciasAutor] = useState(false);

  const [sugerenciasTags, setSugerenciasTags] = useState<string[]>([]);
  const [mostrarSugerenciasTags, setMostrarSugerenciasTags] = useState(false);

  // 1. Buscador en vivo de Autores
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

  // 2. Buscador en vivo de Tags (Tesauro)
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

  // 2. FUNCIÓN DE TRADUCCIÓN AUTOMÁTICA DE TAGS
  const obtenerTagsAutomaticos = (categoriesFromGoogle: string[]): string[] => {
    if (!categoriesFromGoogle || categoriesFromGoogle.length === 0) return [];

    const nuevosTags = new Set<string>(); // Usamos Set para evitar duplicados

    categoriesFromGoogle.forEach(categoryEnIngles => {
      // Buscamos si tenemos la categoría exacta en nuestro diccionario
      const tagsTraducidos = traductorCategorias[categoryEnIngles];
      
      if (tagsTraducidos) {
        tagsTraducidos.forEach(tag => nuevosTags.add(tag));
      } else {
        // 2. Fallbacks más amplios (pasamos a minúscula para no errar)
        const catBaja = categoryEnIngles.toLowerCase();
        let fueTraducido = false;

        if (catBaja.includes("fiction")) { nuevosTags.add("Literatura"); fueTraducido = true; }
        if (catBaja.includes("history")) { nuevosTags.add("Historia"); fueTraducido = true; }
        if (catBaja.includes("science")) { nuevosTags.add("Ciencia"); fueTraducido = true; }
        if (catBaja.includes("juvenile") || catBaja.includes("children")) { nuevosTags.add("Infantil/Juvenil"); fueTraducido = true; }
        if (catBaja.includes("mystery") || catBaja.includes("detective")) { nuevosTags.add("Misterio/Policial"); fueTraducido = true; }
        if (catBaja.includes("fantasy")) { nuevosTags.add("Fantasía"); fueTraducido = true; }
        if (catBaja.includes("philosophy")) { nuevosTags.add("Filosofía"); fueTraducido = true; }
        
        // 3. LA RED DE SEGURIDAD: Si no encajó en nada, lo agregamos en inglés
        if (!fueTraducido) {
          nuevosTags.add(categoryEnIngles); 
        }
      }
    });

    return Array.from(nuevosTags); // Convertimos el Set de vuelta a Array
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
      const res = await fetch(`http://localhost:5078/api/libros/lookup/isbn/${isbn}?proveedor=${proveedorDatos}`);
      
      if (res.ok) {
        const data = await res.json();
        
        // Rellenamos el formulario con los datos limpios que armó C#
        setTitulo(data.titulo);
        setSubtitulo(data.subtitulo);
        setEditorial(data.editorial);
        setAnioPublicacion(data.anioPublicacion);

        // Sinopsis y Páginas directas del DTO
        setReseniaSinopsis(data.reseniaSinopsis?.replace(/<[^>]+>/g, '') || "");
        setCantidadPaginas(data.cantidadPaginas ? data.cantidadPaginas.toString() : "");

        // Portada
        const urlImagen = data.portadaUrl || "";
        const urlSegura = urlImagen.replace("http://", "https://");
        setPortadaUrl(urlSegura);
        setPortadaPreview(urlSegura);

        // Tags Automáticos usando el array que nos mandó C#
        const categoriasGoogle = data.categorias || [];
        const tagsSugeridos = obtenerTagsAutomaticos(categoriasGoogle);
        setTags(prev => Array.from(new Set([...prev, ...tagsSugeridos])));
        
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

  const traductorCategorias: { [key: string]: string[] } = {
  // Literatura General
  "Fiction": ["Literatura", "Novela"],
  "Fiction / General": ["Literatura"],
  "Fiction / Literary": ["Literatura", "Clásico"],
  
  // Géneros Específicos
  "Detective and mystery stories": ["Novela Negra", "Suspenso"],
  "Fiction / Mystery & Detective / General": ["Novela Negra", "Suspenso"],
  "Fiction / Fantasy / General": ["Fantasía"],
  "Fiction / Science Fiction / General": ["Ciencia Ficción"],
  "Fiction / Historical / General": ["Novela Histórica"],
  "Fiction / Romance / General": ["Romance"],
  "Poetry / General": ["Poesía"],
  "Drama / General": ["Teatro"],
  "Comics & Graphic Novels / General": ["Cómic", "Novela Gráfica"],

  // Juvenil e Infantil
  "Juvenile Fiction": ["Infantil", "Juvenil"],
  "Children's stories": ["Infantil"],
  
  // No Ficción / Escolar
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
  
  // Arte y otros
  "Art / General": ["Arte", "Música"],
  "Sports & Recreation / General": ["Educación Física"],
  "Cooking / General": ["Cocina"],
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
      // 1. Creamos el empaquetador de formulario
      const formData = new FormData();

      // 2. Agregamos los textos simples
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

      // 3. Agregamos la lógica de la imagen local (Asegurate de haber creado estos useState)
      formData.append("usarPortadaLocal", usarPortadaLocal.toString());
      if (archivoPortada) {
        formData.append("archivoPortada", archivoPortada); // Acá viaja el archivo físico
      }

      // 4. Empaquetamos los Tags (A C# le gustan así: Tags[0], Tags[1]...)
      tags.forEach((tag, index) => {
        formData.append(`Tags[${index}]`, tag);
      });

      // 5. Empaquetamos los Ejemplares (A C# le gustan así: Ejemplares[0].NumeroInventario...)
      ejemplares.forEach((ej, index) => {
        formData.append(`Ejemplares[${index}].NumeroInventario`, ej.numeroInventario);
        formData.append(`Ejemplares[${index}].Observaciones`, ej.observaciones);
      });

      // 6. Hacemos el envío
      const res = await fetch("http://localhost:5078/api/libros", {
        method: "POST",
        // ¡IMPORTANTE! Al usar FormData NO se pone el header "Content-Type".
        body: formData,
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
    <main className="min-h-screen bg-gray-50  text-black">
      <nav className="bg-slate-800 text-white p-4 mb-4 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-wider">INGRESAR LIBRO</h1>
          </div>
          <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            Volver al Catálogo
          </Link>
        </div>
      </nav>
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
              
              {/* --- CAMPO AUTOR CON AUTOCOMPLETADO --- */}
              <div className="col-span-2 md:col-span-1 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor Principal *</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" 
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
                        className="p-3 hover:bg-purple-100 cursor-pointer text-sm font-medium text-gray-700 border-b last:border-0 transition" 
                        onClick={() => seleccionarAutor(autor)}
                      >
                        ✍️ {autor}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-xs text-amber-600 mt-1 font-medium bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-200">
                  ⚠️ Ojo: Revisar autores con apellidos compuestos (ej: García Márquez).
                </p>
              </div>
           

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reseña / Sinopsis</label>
              <textarea 
                rows={5}
                placeholder="Escriba o pegue la sinopsis del libro..."
                className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm leading-relaxed" 
                value={reseniaSinopsis} 
                onChange={(e) => setReseniaSinopsis(e.target.value)} 
              />
            </div>
          </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Editorial</label>
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" value={editorial} onChange={(e) => setEditorial(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
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
                  
                      <select 
                        className="border border-gray-300 p-2 rounded-lg bg-gray-50 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500 flex-1 mb-2 w-full"
                        value={proveedorDatos}
                        onChange={(e) => setProveedorDatos(e.target.value)}
                      >
                        <option value="todas">🚀 Todas </option>
                        <option value="google">🔍 Solo Google Books</option>
                        <option value="openlibrary">📚 Solo Open Library</option>
                      </select>
                  <button 
                    type="button" 
                    onClick={buscarDatosPorIsbn}
                    disabled={buscandoIsbn}
                    className={`w-full justify-center px-3 py-2 rounded-lg border transition flex items-center gap-2 text-sm font-bold ${buscandoIsbn ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'}`}
                    title="Buscar datos automáticamente"
                  >
                    {buscandoIsbn ? '⏳ Buscando...' : '✨ Autocompletar desde Internet'}
                  </button>
                </div>
              </div>
            
          </section>

          <section>
               {/* 5. DISEÑO DE UI: MOSTRAR LA PORTADA Y LOS NUEVOS DATOS */}
        <div className="grid grid-cols-4 gap-6 mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
          
          {/* COLUMNA 1: PREVIEW DE LA TAPA */}
          <div className="col-span-1 flex flex-col items-center">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Portada</h4>
            <div className="w-full h-56 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
              {portadaPreview ? (
                <img src={portadaPreview} alt="Tapa del libro" className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl text-gray-300">🖼️</span>
              )}
            </div>
          </div>

          {/* COLUMNA 2, 3 y 4: DATOS EXPANSIBLES */}
          <div className="col-span-3 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº Páginas</label>
                <input 
                  type="number" 
                  placeholder="Ej: 350"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none font-medium" 
                  value={cantidadPaginas} 
                  onChange={(e) => setCantidadPaginas(e.target.value)} 
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Portada</label>
                <input 
                  type="text" 
                  placeholder="Se completa automáticamente"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none text-xs font-mono text-gray-600 bg-gray-50 mb-4" 
                  value={portadaUrl} 
                  onChange={(e) => {
                    setPortadaUrl(e.target.value);
                    setPortadaPreview(e.target.value);
                  }} 
                />
                {/* Opciones Locales (NUEVO) */}
    <div className="border border-purple-200 p-4 rounded-lg bg-purple-50">
      <h4 className="text-sm font-bold text-purple-900 mb-2">💾 Opciones Locales (Autonomía)</h4>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
          <input 
            type="checkbox" 
            checked={usarPortadaLocal} 
            onChange={(e) => setUsarPortadaLocal(e.target.checked)} 
          />
          Usar Portada Local (A prueba de cortes de internet)
        </label>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Subir imagen a mano</label>
          <input 
            type="file" 
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setArchivoPortada(e.target.files[0]);
                setUsarPortadaLocal(true); 
              }
            }}
          />
        </div>
      </div>
    </div>
              </div>
            </div>
            </div>
            </div>
          </section>

          {/* NUEVA SECCIÓN: ETIQUETAS (TAGS) CON TESAURO */}
          <section>
            <h2 className="text-lg font-semibold text-purple-800 mb-4 bg-purple-50 p-2 rounded">2. Etiquetas y Materias</h2>
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agregar Tags (Escribí el tema y apretá <kbd className="bg-gray-200 px-1 rounded">Enter</kbd> o coma)
              </label>
              {tags.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setTags([])} 
                    className="text-xs text-red-600 hover:text-red-800 font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition flex items-center gap-1 shadow-sm mb-3"
                    title="Borrar todas las etiquetas"
                  >
                    🗑️ Limpiar todo ({tags.length})
                  </button>
                )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                    {tag}
                    <button type="button" onClick={() => removerTag(tag)} className="hover:text-red-300 font-bold">×</button>
                  </span>
                ))}
              </div>

              {/* --- CAMPO TAGS CON AUTOCOMPLETADO TESAURO --- */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar en el Tesauro (Ej: Educación, Ficción...)" 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" 
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
            <button type="submit" disabled={cargando} className={`px-8 py-3 rounded-xl font-bold text-white transition shadow-lg ${cargando ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}`}>
              {cargando ? 'Guardando...' : 'Guardar Ficha'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
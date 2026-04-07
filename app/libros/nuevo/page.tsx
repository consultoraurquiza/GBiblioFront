"use client";

import { useState, useEffect } from "react";
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
  const [proveedorScraper, setProveedorScraper] = useState("yenny");

  // NUEVO: Estados para los Tags
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Estados de los Ejemplares Físicos
  const [ejemplares, setEjemplares] = useState([{ numeroInventario: "", observaciones: "" }]);
  const [cargando, setCargando] = useState(false);

  const [sugerenciasAutor, setSugerenciasAutor] = useState<string[]>([]);
  const [mostrarSugerenciasAutor, setMostrarSugerenciasAutor] = useState(false);

  const [sugerenciasTags, setSugerenciasTags] = useState<string[]>([]);
  const [mostrarSugerenciasTags, setMostrarSugerenciasTags] = useState(false);

  // --- NUEVOS ESTADOS PARA EL BUSCADOR VISUAL ---
  const [modalScraperAbierto, setModalScraperAbierto] = useState(false);
  const [resultadosScraper, setResultadosScraper] = useState<any[]>([]);
  const [buscandoScraper, setBuscandoScraper] = useState(false);

  // CONFIGURACIÓN Y TEMA
  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  useEffect(() => {
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error(err));
  }, []);

  // --- FUNCIÓN PARA BUSCAR POR TÍTULO ---
  const buscarPorTituloScraper = async () => {
    if (!titulo || titulo.trim() === "") {
      alert("⚠️ Primero escribí al menos una parte del Título para poder buscar.");
      return;
    }

    setBuscandoScraper(true);
    setModalScraperAbierto(true); 
    setResultadosScraper([]);

    try {
      const res = await fetch(`http://localhost:5078/api/libros/scraper/buscar?titulo=${encodeURIComponent(titulo)}&proveedor=${proveedorScraper}`);
      
      if (res.ok) {
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setResultadosScraper(data);
        } 
        else if (data.mensaje) {
          alert("🕵️‍♂️ El Sabueso dice: " + data.mensaje);
          if (data.html_crudo) {
            console.log("=== RADIOGRAFÍA ===");
            console.log(data.html_crudo);
          }
          setResultadosScraper([]); 
        }
      } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.mensaje || "No se pudo conectar con el proveedor."));
        setModalScraperAbierto(false);
      }
    } catch (error) {
      alert("Error de conexión con el servidor local.");
      setModalScraperAbierto(false);
    } finally {
      setBuscandoScraper(false);
    }
  };

  // --- FUNCIÓN PARA CUANDO EL USUARIO HACE CLIC EN "ELEGIR ESTE" ---
  const seleccionarLibroScraper = async (libro: any) => {
    const formatearAutor = (nombreSucio: string) => {
      if (!nombreSucio || nombreSucio === "Autor Desconocido") return "";
      if (nombreSucio.includes(",")) return nombreSucio; 

      const partes = nombreSucio.trim().split(/\s+/);
      if (partes.length <= 1) return nombreSucio;

      const apellido = partes.pop(); 
      const nombres = partes.join(" "); 
      return `${apellido}, ${nombres}`;
    };

    setTitulo(libro.titulo);
    const autorInicial = formatearAutor(libro.autor);
    setAutorPrincipal(autorInicial);
    if (autorInicial) autocompletarCutter(autorInicial);

    if (libro.portadaUrl) {
      setPortadaUrl(libro.portadaUrl);
      setPortadaPreview(libro.portadaUrl); 
    }

    if (libro.linkComercial) {
      setBuscandoScraper(true); 
      try {
        const res = await fetch(`http://localhost:5078/api/libros/scraper/detalle?url=${encodeURIComponent(libro.linkComercial)}&autorOriginal=${encodeURIComponent(libro.autor)}`);
        
        if (res.ok) {
          const detalle = await res.json();
          if (detalle.tituloLimpio) setTitulo(detalle.tituloLimpio);
          if (detalle.subtitulo) setSubtitulo(detalle.subtitulo);
          if (detalle.autor && detalle.autor !== "" && detalle.autor !== "Autor Desconocido") {
            setAutorPrincipal(detalle.autor);
            if (typeof autocompletarCutter === 'function') autocompletarCutter(detalle.autor);
          }
          if (detalle.resumen && detalle.resumen !== "") setReseniaSinopsis(detalle.resumen);
          else if (libro.resumen) setReseniaSinopsis(libro.resumen); 
          
          if (detalle.editorial) setEditorial(detalle.editorial);
          if (detalle.paginas) setCantidadPaginas(detalle.paginas);
          if (detalle.anio) setAnioPublicacion(detalle.anio);
          
          if (detalle.isbn && (!isbn || isbn.trim() === "")) setIsbn(detalle.isbn);
        }
      } catch (error) {
        console.error("Falló el 2do scrape", error);
        if (libro.resumen) setReseniaSinopsis(libro.resumen);
      } finally {
        setBuscandoScraper(false);
      }
    } else {
      if (libro.resumen) setReseniaSinopsis(libro.resumen);
    }
    setModalScraperAbierto(false); 
  };

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

  const manejarInputTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        if (!fueTraducido) { nuevosTags.add(categoryEnIngles); }
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
        if (autorInvertido) autocompletarCutter(autorInvertido);
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

  const agregarEjemplar = () => setEjemplares([...ejemplares, { numeroInventario: "", observaciones: "" }]);
  const removerEjemplar = (index: number) => setEjemplares(ejemplares.filter((_, i) => i !== index));
  const actualizarEjemplar = (index: number, campo: string, valor: string) => {
    const nuevos = [...ejemplares];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setEjemplares(nuevos);
  };

  const guardarLibro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ejemplares.some(ej => ej.numeroInventario.trim() === "")) {
      alert("Completá el Número de Inventario de todos los ejemplares.");
      return;
    }

    setCargando(true);
    try {
      const formData = new FormData();
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

      if (cantidadPaginas) formData.append("cantidadPaginas", cantidadPaginas.toString());
      formData.append("usarPortadaLocal", usarPortadaLocal.toString());
      if (archivoPortada) formData.append("archivoPortada", archivoPortada);

      tags.forEach((tag, index) => formData.append(`Tags[${index}]`, tag));
      ejemplares.forEach((ej, index) => {
        formData.append(`Ejemplares[${index}].NumeroInventario`, ej.numeroInventario);
        formData.append(`Ejemplares[${index}].Observaciones`, ej.observaciones);
      });

      const res = await fetch("http://localhost:5078/api/libros", {
        method: "POST",
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

  // CLASES BASE PARA LOS INPUTS DEPENDIENDO DEL TEMA
  const inputBaseClass = `w-full border p-2.5 rounded-lg outline-none transition font-medium ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-[var(--acento)]' : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[var(--acento)] text-gray-900'}`;
  const labelBaseClass = `block text-sm font-medium mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-700'}`;

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      <nav className="p-4 mb-4 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-wider">INGRESAR LIBRO</h1>
          </div>
          <Link href="/" className="bg-[var(--acento)] hover:bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition flex items-center gap-2 shadow-sm ">
            Volver al Catálogo
          </Link>
        </div>
      </nav>

      <div className={`max-w-4xl mx-auto p-8 rounded-2xl shadow-sm border border-t-4 transition-colors mb-12 ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10 border-t-[var(--acento)]' : 'bg-white border-gray-200 border-t-[var(--acento)]'}`}>
        <h1 className={`text-2xl font-bold mb-6 border-b pb-4 ${config?.temaId === 'obsidian' ? 'text-white border-white/10' : 'text-gray-800 border-gray-200'}`}>Ingresar Título al Catálogo</h1>

        <form onSubmit={guardarLibro} className="space-y-8">
          
          {/* SECCIÓN 1: DATOS BIBLIOGRÁFICOS */}
          <section>
            <h2 className={`text-lg font-semibold mb-4 p-2 rounded flex items-center gap-2 transition-colors ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 text-[var(--acento)]' : 'bg-gray-50 text-[var(--acento)] border border-gray-200'}`}>
              1. Ficha Bibliográfica
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelBaseClass}>Título *</label>
                <input 
                  type="text" 
                  required 
                  className={inputBaseClass} 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                />
                
                <div className="flex space-betwen pt-2">
                  <select 
                    className={`border p-2.5 rounded-lg font-bold outline-none transition ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-orange-500' : 'bg-gray-50 border-gray-300 text-gray-700 focus:border-orange-500'}`}
                    value={proveedorScraper}
                    onChange={(e) => setProveedorScraper(e.target.value)}
                  >
                    <option value="yenny">Yenny</option>
                  </select>

                  <button 
                    type="button" 
                    onClick={buscarPorTituloScraper}
                    className="bg-[var(--acento)] hover:bg-[var(--acento)] hover:brightness-110 text-white px-4 rounded-lg font-bold transition shadow-sm flex items-center gap-2 whitespace-nowrap ml-2"
                  >
                    🕵️‍♂️ Buscar
                  </button>
                  
                  <span className={`text-xs mt-1 font-medium inline-block px-2 py-0.5 rounded border ml-4 flex items-center ${config?.temaId === 'obsidian' ? 'bg-amber-900/30 text-white border-amber-700' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    ⚠️ El mismo campo de titulo puede usarse para buscar ingresando el nombre del autor
                  </span>
                </div>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className={labelBaseClass}>Subtítulo</label>
                <input type="text" className={`${inputBaseClass} ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`} value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
              </div>
              
              {/* --- CAMPO AUTOR CON AUTOCOMPLETADO --- */}
              <div className="col-span-2 md:col-span-1 relative">
                <label className={labelBaseClass}>Autor Principal *</label>
                <input 
                  type="text" 
                  required 
                  className={`w-full border p-2.5 rounded-lg outline-none font-bold transition ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-[var(--acento)]/30 text-white focus:border-[var(--acento)]' : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[var(--acento)] text-gray-900'}`} 
                  placeholder="Ej: Borges, Jorge Luis" 
                  value={autorPrincipal} 
                  onChange={(e) => manejarCambioAutor(e.target.value)} 
                  onBlur={() => {
                    autocompletarCutter(autorPrincipal);
                    setTimeout(() => setMostrarSugerenciasAutor(false), 200);
                  }} 
                />
                
                {mostrarSugerenciasAutor && sugerenciasAutor.length > 0 && (
                  <ul className={`absolute z-10 w-full mt-1 rounded-xl shadow-2xl max-h-48 overflow-y-auto border ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    {sugerenciasAutor.map((autor, i) => (
                      <li 
                        key={i} 
                        className={`p-3 cursor-pointer text-sm font-medium border-b last:border-0 transition ${config?.temaId === 'obsidian' ? 'hover:bg-slate-700 text-slate-200 border-slate-700' : 'hover:bg-gray-100 text-gray-700 border-gray-100'}`} 
                        onClick={() => seleccionarAutor(autor)}
                      >
                        ✍️ {autor}
                      </li>
                    ))}
                  </ul>
                )}
                <p className={`text-[10px] mt-1 font-medium inline-block px-2 py-0.5 rounded border ${config?.temaId === 'obsidian' ? 'bg-amber-900/30 text-white border-amber-700' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                  ⚠️ Ojo: Revisar autores con apellidos compuestos (ej: García Márquez).
                </p>
              </div>

              <div className="col-span-2">
                <label className={labelBaseClass}>Reseña / Sinopsis</label>
                <textarea 
                  rows={5}
                  placeholder="Escriba o pegue la sinopsis del libro..."
                  className={`${inputBaseClass} text-sm leading-relaxed`} 
                  value={reseniaSinopsis} 
                  onChange={(e) => setReseniaSinopsis(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className={labelBaseClass}>Editorial</label>
              <input type="text" className={inputBaseClass} value={editorial} onChange={(e) => setEditorial(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div>
                <label className={labelBaseClass}>Año Pub.</label>
                <input type="text" placeholder="Ej: 2010" className={inputBaseClass} value={anioPublicacion} onChange={(e) => setAnioPublicacion(e.target.value)} />
              </div>
              <div>
                <label className={labelBaseClass}>ISBN</label>
                <input 
                  type="text" 
                  placeholder="978..."
                  className={`${inputBaseClass} mb-2`} 
                  value={isbn} 
                  onChange={(e) => setIsbn(e.target.value)} 
                />
                
                <select 
                  className={`w-full border p-2.5 rounded-lg text-sm font-medium outline-none transition flex-1 mb-2 ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-[var(--acento)]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-[var(--acento)]'}`}
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
                  className={`w-full justify-center px-3 py-2 rounded-lg border transition flex items-center gap-2 text-sm font-bold ${buscandoIsbn ? (config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-gray-100 text-gray-400 border-gray-200') : (config?.temaId === 'obsidian' ? 'bg-[var(--acento)]/20 text-[var(--acento)] border-[var(--acento)]/40 hover:bg-[var(--acento)]/30' : 'bg-gray-100 text-[var(--acento)] border-gray-200 hover:bg-gray-200')}`}
                  title="Buscar datos automáticamente"
                >
                  {buscandoIsbn ? '⏳ Buscando...' : '✨ Autocompletar desde Internet'}
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className={`grid grid-cols-4 gap-6 mt-8 p-6 border rounded-2xl shadow-inner ${config?.temaId === 'obsidian' ? 'bg-slate-800/40 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
              
              <div className="col-span-1 flex flex-col items-center">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-400'}`}>Portada</h4>
                <div className={`w-full h-56 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden shadow-sm ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'}`}>
                  {portadaPreview ? (
                    <img src={portadaPreview} alt="Tapa del libro" className="h-full w-full object-cover" />
                  ) : (
                    <span className={`text-5xl ${config?.temaId === 'obsidian' ? 'opacity-30' : 'text-gray-300'}`}>🖼️</span>
                  )}
                </div>
              </div>

              <div className="col-span-3 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className={labelBaseClass}>Nº Páginas</label>
                    <input 
                      type="number" 
                      placeholder="Ej: 350"
                      className={inputBaseClass} 
                      value={cantidadPaginas} 
                      onChange={(e) => setCantidadPaginas(e.target.value)} 
                    />
                  </div>
                  <div className="col-span-3">
                    <label className={labelBaseClass}>URL de Portada</label>
                    <input 
                      type="text" 
                      placeholder="Se completa automáticamente"
                      className={`w-full border p-2.5 rounded-lg outline-none text-xs font-mono mb-4 transition ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-slate-700 text-slate-400 focus:border-[var(--acento)]' : 'bg-gray-100 border-gray-200 text-gray-600 focus:ring-2 focus:ring-[var(--acento)]'}`} 
                      value={portadaUrl} 
                      onChange={(e) => {
                        setPortadaUrl(e.target.value);
                        setPortadaPreview(e.target.value);
                      }} 
                    />
                    
                    <div className={`border p-4 rounded-lg shadow-inner mb-3 ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 border-[var(--acento)]/30' : 'bg-white border-[var(--acento)]/30'}`}>
                      <h4 className={`text-sm font-bold mb-2 flex items-center gap-1 ${config?.temaId === 'obsidian' ? 'text-[var(--acento)]' : 'text-[var(--acento)]'}`}><span>💾</span> Opciones Locales (Autonomía)</h4>
                      <div className="flex items-center gap-6">
                        <label className={`flex items-center gap-2 cursor-pointer text-sm font-medium p-2 rounded-lg border transition ${config?.temaId === 'obsidian' ? 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>
                          <input 
                            type="checkbox" 
                            checked={usarPortadaLocal} 
                            onChange={(e) => setUsarPortadaLocal(e.target.checked)} 
                            className={`w-5 h-5 rounded ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-600 text-[var(--acento)] focus:ring-[var(--acento)]' : 'text-[var(--acento)] focus:ring-[var(--acento)] border-gray-300'}`}
                          />
                          Usar Portada Local (A prueba de cortes)
                        </label>
                        
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Subir imagen a mano</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            className={`w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:cursor-pointer ${config?.temaId === 'obsidian' ? 'text-slate-400 file:bg-slate-800 file:text-[var(--acento)] hover:file:bg-slate-700' : 'text-gray-500 file:bg-gray-100 file:text-[var(--acento)] hover:file:bg-gray-200'}`}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setArchivoPortada(e.target.files[0]);
                                setUsarPortadaLocal(true); 
                                setPortadaPreview(URL.createObjectURL(e.target.files[0]));
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

          {/* NUEVA SECCIÓN: ETIQUETAS */}
          <section>
            <h2 className={`text-lg font-semibold mb-4 p-2 rounded flex items-center gap-2 transition-colors ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 text-[var(--acento)]' : 'bg-gray-50 text-[var(--acento)] border border-gray-200'}`}>
              2. Etiquetas y Materias
            </h2>
            <div className={`border p-4 rounded-lg ${config?.temaId === 'obsidian' ? 'bg-slate-800/40 border-white/5' : 'bg-gray-50 border-gray-300'}`}>
              <label className={`block text-sm font-bold mb-3 ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>
                Agregar Tags (Escribí el tema y apretá <kbd className={`px-1.5 py-0.5 rounded border font-sans text-xs ${config?.temaId === 'obsidian' ? 'bg-slate-700 border-slate-600' : 'bg-gray-200 border-gray-300'}`}>Enter</kbd> o coma)
              </label>
              {tags.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setTags([])} 
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition flex items-center gap-1 shadow-sm mb-3 ${config?.temaId === 'obsidian' ? 'bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-900/40' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-800'}`}
                  title="Borrar todas las etiquetas"
                >
                  🗑️ Limpiar todo ({tags.length})
                </button>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-[var(--acento)] text-[var(--acento-texto)] text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    {tag}
                    <button type="button" onClick={() => removerTag(tag)} className="opacity-70 hover:opacity-100 font-bold transition text-lg leading-none">×</button>
                  </span>
                ))}
              </div>

              {/* --- CAMPO TAGS CON AUTOCOMPLETADO TESAURO --- */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar en el Tesauro (Ej: Educación, Ficción...)" 
                  className={inputBaseClass} 
                  value={tagInput} 
                  onChange={(e) => manejarCambioTag(e.target.value)}
                  onKeyDown={manejarInputTag}
                  onBlur={() => setTimeout(() => setMostrarSugerenciasTags(false), 200)}
                />

                {mostrarSugerenciasTags && sugerenciasTags.length > 0 && (
                  <ul className={`absolute z-10 w-full mt-1 rounded-xl shadow-2xl max-h-56 overflow-y-auto border ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    {sugerenciasTags.map((tag, i) => (
                      <li 
                        key={i} 
                        className={`p-3 cursor-pointer text-sm font-bold border-b last:border-0 transition flex items-center gap-2 ${config?.temaId === 'obsidian' ? 'hover:bg-slate-700 text-[var(--acento)] border-slate-700' : 'hover:bg-gray-100 text-gray-700 border-gray-100'}`} 
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
            <h2 className={`text-lg font-semibold mb-4 p-2 rounded flex items-center gap-2 transition-colors ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 text-[var(--acento)]' : 'bg-gray-50 text-[var(--acento)] border border-gray-200'}`}>
              3. Ubicación en Estante
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelBaseClass}>Clasificación (Ej: 863)</label>
                <input type="text" className={`${inputBaseClass} font-mono`} value={clasificacion} onChange={(e) => setClasificacion(e.target.value)} />
              </div>
              <div>
                <label className={labelBaseClass}>Cutter-Sanborn (Ej: B732)</label>
                <input 
                  type="text" 
                  className={`${inputBaseClass} font-mono`} 
                  value={codigoCutter} 
                  onChange={(e) => setCodigoCutter(e.target.value)} 
                />
                <p className={`text-[10px] mt-1 font-medium inline-block px-2 py-0.5 rounded border shadow-sm ${config?.temaId === 'obsidian' ? 'bg-amber-900/30 text-white border-amber-700' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                  ⚠️ Ojo: Revisar si el autor tenía apellido compuesto.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN EJEMPLARES FÍSICOS */}
          <section>
            <div className={`flex justify-between items-center mb-4 p-2 rounded border ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${config?.temaId === 'obsidian' ? 'text-[var(--acento)]' : 'text-gray-800'}`}>
                4. Ejemplares Físicos (Inventario)
              </h2>
              <button type="button" onClick={agregarEjemplar} className="text-sm bg-[var(--acento)] text-white hover:bg-[var(--acento)] hover:brightness-110 px-3 py-1 rounded font-bold transition shadow-sm">
                + Agregar Copia
              </button>
            </div>
            
            <div className="space-y-3">
              {ejemplares.map((ej, index) => (
                <div key={index} className={`flex gap-3 items-start p-3 border rounded-lg shadow-sm transition ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-300'}`}>
                  <div className="w-1/3">
                    <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Nº Inventario *</label>
                    <input 
                      type="text" required placeholder="Ej: 00452"
                      className={`w-full border p-2 rounded outline-none font-mono font-bold text-lg focus:ring-2 focus:ring-[var(--acento)] ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-slate-700 text-[var(--acento)]' : 'bg-gray-50 border-gray-300 text-[var(--acento)]'}`}
                      value={ej.numeroInventario} onChange={(e) => actualizarEjemplar(index, 'numeroInventario', e.target.value)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Observaciones</label>
                    <input 
                      type="text" placeholder="Ej: Faltan hojas..."
                      className={inputBaseClass}
                      value={ej.observaciones} onChange={(e) => actualizarEjemplar(index, 'observaciones', e.target.value)} 
                    />
                  </div>
                  {ejemplares.length > 1 && (
                    <button type="button" onClick={() => removerEjemplar(index)} className={`mt-6 px-3 py-2 rounded transition font-bold ${config?.temaId === 'obsidian' ? 'text-red-400 hover:bg-red-500/20' : 'text-red-500 hover:bg-red-50'}`}>✕</button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* BOTONES */}
          <div className={`flex justify-end gap-3 pt-6 border-t mt-8 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-100'}`}>
            <button type="submit" disabled={cargando} className={`px-8 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2 ${cargando ? 'bg-[var(--acento)]/50 cursor-wait text-white' : 'bg-[var(--acento)] hover:brightness-110 text-white'}`}>
              {cargando ? '⌛ Guardando...' : '💾 Guardar Ficha'}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================== */}
      {/* MODAL DEL SCRAPER (VENTANA FLOTANTE)         */}
      {/* ========================================== */}
      {modalScraperAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-orange-500 ${config?.temaId === 'obsidian' ? 'bg-slate-900' : 'bg-white'}`}>
            
            {/* Cabecera del Modal */}
            <div className="bg-orange-500 text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🕵️‍♂️</span>
                <h3 className="font-bold text-lg tracking-wider">Resultados de Librerías Comerciales</h3>
              </div>
              <button 
                type="button"
                onClick={() => setModalScraperAbierto(false)} 
                className="text-white hover:text-orange-200 text-3xl font-black leading-none"
              >
                &times;
              </button>
            </div>

            {/* Cuerpo del Modal (Lista de Libros) */}
            <div className={`p-6 overflow-y-auto flex-1 ${config?.temaId === 'obsidian' ? 'bg-slate-900' : 'bg-gray-50'}`}>
              {buscandoScraper ? (
                <div className="text-center py-16 text-orange-500 font-bold animate-pulse text-xl flex flex-col items-center gap-4">
                  <span className="text-5xl animate-spin">⏳</span>
                  Rastreando catálogos en la web...
                </div>
              ) : resultadosScraper.length === 0 ? (
                <div className={`text-center py-16 font-medium text-lg ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>
                  No se encontraron libros con ese título. <br/>Intentá escribir una palabra clave más corta (Ej: "Matematica" en vez de "Libro de Matematica 3").
                </div>
              ) : (
                <div className="grid gap-4">
                  {resultadosScraper.map((libro, idx) => (
                    <div key={idx} className={`border rounded-xl p-4 flex gap-4 hover:shadow-lg hover:border-orange-300 transition items-center ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                      
                      {/* Portada */}
                      <div className={`w-16 h-24 rounded-lg shadow-sm flex-shrink-0 overflow-hidden border ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-slate-600' : 'bg-gray-100 border-gray-200'}`}>
                        {libro.portadaUrl ? (
                          <img src={libro.portadaUrl} alt="Portada" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold text-center p-1">Sin Foto</div>
                        )}
                      </div>
                      
                      {/* Datos */}
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg leading-tight mb-1 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>{libro.titulo}</h4>
                        <p className={`text-sm font-bold ${config?.temaId === 'obsidian' ? 'text-blue-400' : 'text-blue-800'}`}>{libro.autor}</p>
                        <p className={`text-xs mt-2 italic inline-block px-2 py-1 rounded border ${config?.temaId === 'obsidian' ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                          {libro.resumen}
                        </p>
                      </div>
                      
                      {/* Botón de Selección */}
                      <button
                        type="button"
                        onClick={() => seleccionarLibroScraper(libro)}
                        className="bg-green-100 text-green-800 border border-green-300 hover:bg-green-500 hover:text-white px-5 py-3 rounded-xl font-bold transition shadow-sm whitespace-nowrap flex flex-col items-center"
                      >
                        <span>✅ Elegir</span>
                      </button>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
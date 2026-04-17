"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function TutorialPage() {
    const [config, setConfig] = useState<any>(null);
    const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

    useEffect(() => {
        fetch("http://localhost:5078/api/configuracion")
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setConfig(data); })
            .catch(() => console.log("Usando tema por defecto"));
    }, []);

    const smoothScroll = (e: any, targetId: string) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-20`}>

            {/* BARRA SUPERIOR */}
            <nav className="p-4 mb-8 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📖</span>
                        <h1 className="text-xl font-bold tracking-wider">MANUAL DE USUARIO</h1>
                    </div>
                    <Link href="/admin" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm">
                        Volver al Sistema
                    </Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4">

                {/* ========================================== */}
                {/* ÍNDICE CLIQUEABLE                          */}
                {/* ========================================== */}
                <div id="indice" className={`p-8 rounded-2xl shadow-sm border mb-12 ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <h2 className={`text-2xl font-bold mb-6 border-b pb-4 ${config?.temaId === 'obsidian' ? 'text-white border-slate-700' : 'text-gray-800 border-gray-100'}`}>
                        📑 Índice Temático
                    </h2>
                    <ul className="space-y-3">
                        <li>
                            <a href="#seccion-1" onClick={(e) => smoothScroll(e, 'seccion-1')} className="flex items-center gap-3 text-purple-600 hover:text-purple-800 hover:translate-x-2 transition-transform font-bold">
                                <span className="bg-purple-100 text-purple-700 w-8 h-8 flex items-center justify-center rounded-lg">1</span>
                                Nuevo Libro
                            </a>
                        </li>
                        <li>
                            <a href="#seccion-2" onClick={(e) => smoothScroll(e, 'seccion-2')} className="flex items-center gap-3 text-purple-600 hover:text-purple-800 hover:translate-x-2 transition-transform font-bold">
                                <span className="bg-purple-100 text-purple-700 w-8 h-8 flex items-center justify-center rounded-lg">2</span>
                                Editar Libro
                            </a>
                        </li>
                        <li>
                            <a href="#seccion-3" onClick={(e) => smoothScroll(e, 'seccion-3')} className="flex items-center gap-3 text-purple-600 hover:text-purple-800 hover:translate-x-2 transition-transform font-bold">
                                <span className="bg-purple-100 text-purple-700 w-8 h-8 flex items-center justify-center rounded-lg">3</span>
                                Gestión de Alumnos y Grupos
                            </a>
                        </li>
                        <li>
                            <a href="#seccion-4" onClick={(e) => smoothScroll(e, 'seccion-4')} className="flex items-center gap-3 text-purple-600 hover:text-purple-800 hover:translate-x-2 transition-transform font-bold">
                                <span className="bg-purple-100 text-purple-700 w-8 h-8 flex items-center justify-center rounded-lg">4</span>
                                Migración Masiva de fin de año
                            </a>
                        </li>
                        <li>
                            <a href="#seccion-5" onClick={(e) => smoothScroll(e, 'seccion-5')} className="flex items-center gap-3 text-purple-600 hover:text-purple-800 hover:translate-x-2 transition-transform font-bold">
                                <span className="bg-purple-100 text-purple-700 w-8 h-8 flex items-center justify-center rounded-lg">5</span>
                                Prestar Libro
                            </a>
                        </li>
                        <li>
                            <a href="#seccion-6" onClick={(e) => smoothScroll(e, 'seccion-6')} className="flex items-center gap-3 text-purple-600 hover:text-purple-800 hover:translate-x-2 transition-transform font-bold">
                                <span className="bg-purple-100 text-purple-700 w-8 h-8 flex items-center justify-center rounded-lg">6</span>
                                Configuraciones
                            </a>
                        </li>
                    </ul>
                </div>

                {/* ========================================== */}
                {/* SECCIÓN 1: NUEVO LIBRO                       */}
                {/* ========================================== */}
                <section id="seccion-1" className="scroll-mt-24 mb-16">
                    <h2 className={`text-3xl font-bold mb-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-[var(--acento)]">1.</span> Libro Nuevo
                    </h2>
                    <h3 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                        Herramientas de Ayuda para Auto Completado
                    </h3>
                    <div className={`prose prose-purple max-w-none ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>
                        <p className="text-lg">
                            Aqui se explica brevemen las herramientas disponibles para intentar facilitar el trabajo.
                        </p>

                        <h4 className={`text-1xl font-bold mb-4 mt-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                            Scrappers
                        </h4>
                        <p className="text-lg">
                            El programa cuenta con varios tipos de funciones de scrapping para intentar facilitar la carga de libros nuevos. Estas funciones buscan automáticamente información en internet a partir del título o el ISBN, y completan los campos disponibles con los datos encontrados.
                        </p>

                        {/* 📸 LUGAR PARA TU IMAGEN */}
                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-12 my-6 text-gray-500 font-bold text-center">

                            <Image
                                src="/tutorial/LibroNuevo1.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                                
                            />

                    
                            <span>Usando el boton buscar podra seleccion hacer busqueda en Yenny u OpenLibrary y luego selecciona el libro deseado si es que aparece, la busqueda se realiza utilizando el campo titulo</span>

                            <Image
                                src="/tutorial/LibroNuevo2.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span>Ademas se ofrece el auto completado a travez del ISBN del libro, consultando otras fuentes, el mayor problema aqui es que existen tantos ISBN y algunos muy especificos de nuestro pais que es dificil ubicar un libro asi, ya que las fuentes son comerciales y guardan la informacion internacional mayormente y las ediciones mas actuales</span>

                        </div>
                    </div>

                    <div className={`prose prose-purple max-w-none ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>

                        <h4 className={`text-1xl font-bold mb-4 mt-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                            Auto Completado de Autor y Manejo de Imagenes
                        </h4>
                        <p className="text-lg">
                            El programa tiene la capacidad de autocompletar el nombre del autor a partir de lo que se va escribiendo, buscando en una base de datos local. Esto facilita la carga y evita errores de tipeo, pero cuidado el sistema es colaborativo mas no restrictivo, esto permite ingresar el auto como se lo considere pero facilita datos locales para ayudar a que no haya duplicados. Además, podemos elegir para la imagen la opcion de guardar localmente, esto descargara la imagen aportada en el Scrapper y la guardara a nivel local, el sistema intenta descargar automáticamente su foto desde internet para mostrarla en la ficha del libro.
                        </p>

                        {/* 📸 LUGAR PARA TU IMAGEN */}
                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-12 my-6 text-gray-500 font-bold text-center">

                            <Image
                                src="/tutorial/LibroNuevo5.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Mostrando Sugerencia de Autor</span>

                            <Image
                                src="/tutorial/LibroNuevo3.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mt-2">Vista previa de portada</span>

                        </div>
                    </div>

                    <div className={`prose prose-purple max-w-none ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>

                        <h4 className={`text-1xl font-bold mb-4 mt-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                            Manejo de Tags y Tesauro Unesco
                        </h4>
                        <p className="text-lg">
                            El sistema cuenta con el tesauro de la Unesco integrado para facilitar la clasificación temática de los libros. Al escribir una etiqueta, el sistema sugiere términos relacionados y categorías superiores, lo que ayuda a mantener un catálogo organizado y coherente. Además, se pueden agregar etiquetas personalizadas para adaptarse a las necesidades específicas de cada escuela.
                        </p>

                        {/* 📸 LUGAR PARA TU IMAGEN */}
                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-12 my-6 text-gray-500 font-bold text-center">

                            <Image
                                src="/tutorial/LibroNuevo4.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Mostrando Sugerencia del Tesauro</span>



                        </div>
                    </div>
                </section>

                <hr className={`my-12 ${config?.temaId === 'obsidian' ? 'border-slate-700/50' : 'border-gray-200'}`} />

                {/* ========================================== */}
                {/* SECCIÓN 2: EDITAR LIBRO          */}
                {/* ========================================== */}
                <section id="seccion-2" className="scroll-mt-24 mb-16">
                    <h2 className={`text-3xl font-bold mb-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-[var(--acento)]">2.</span> Editar Libro
                    </h2>
                    <div className={`prose prose-purple max-w-none ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>
                        <p className="text-lg">
                            Aqui se explica brevemente los detalles referidos al manejo de Edicion de libros
                        </p>



                        {/* 📸 LUGAR PARA TU IMAGEN */}
                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-12 my-6 text-gray-500 font-bold text-center">

                            <Image
                                src="/tutorial/LibroEditar1.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Mismo Scrapper de nuevo libro, pero aqui solo buscara una portada</span>



                            <Image
                                src="/tutorial/LibroEditar2.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Scrapper en ventana, en caso de OpenLibrary si se toca el icono de la cadena te llevara a la pagina Web para ver mas detalles si se quiere</span>

                            <Image
                                src="/tutorial/LibroEditar3.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Desde aqui ademas podremos quitar un ejemplar de circulacion ya sea por que no se recupero o por que esta roto o en reparacion.</span>

                        </div>


                    </div>
                </section>

                <hr className={`my-12 ${config?.temaId === 'obsidian' ? 'border-slate-700/50' : 'border-gray-200'}`} />

                {/* ========================================== */}
                {/* SECCIÓN 3: USUARIOS Y GRUPOS               */}
                {/* ========================================== */}
                <section id="seccion-3" className="scroll-mt-24 mb-16">
                    <h2 className={`text-3xl font-bold mb-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-[var(--acento)]">3.</span> Gestión de Alumnos y Grupos
                    </h2>
                    <div className={`prose prose-purple max-w-none ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>
                        <p className="text-lg">
                            El sistema permite llevar un control exacto de los lectores de la escuela. Es fundamental crear primero los <strong>Grupos/Cursos</strong> antes de cargar a los alumnos.
                        </p>

                        {/* 📸 LUGAR PARA TU IMAGEN */}
                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-12 my-6 text-gray-500 font-bold text-center">

                            <Image
                                src="/tutorial/Usuarios3.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Como detalle adicion se recomienda crear grupos para quitar alumnos de circulacion ya sea por abandono o por graduacion.</span>

                            <Image
                                src="/tutorial/Usuarios4.webp"
                                alt=""
                                width={600}
                                height={200}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Al crear el Usuario debera ingresar sus datos personales y asignarle un grupo.</span>
                        </div>


                    </div>
                </section>

                <hr className={`my-12 ${config?.temaId === 'obsidian' ? 'border-slate-700/50' : 'border-gray-200'}`} />

                {/* ========================================== */}
                {/* SECCIÓN 4: MIGRACIÓN MASIVA                */}
                {/* ========================================== */}
                <section id="seccion-4" className="scroll-mt-24 mb-16">
                    <h2 className={`text-3xl font-bold mb-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-[var(--acento)]">4.</span> Migración de fin de año
                    </h2>
                    <div className={`prose prose-purple max-w-none ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>
                        <p className="text-lg">
                            A principio o fin de ciclo lectivo, podés promover cursos enteros con un solo clic.
                        </p>

                        <ol className="list-decimal pl-6 space-y-2 mt-4 font-medium">
                            <li>Seleccioná el curso de origen (Ej: 1ero A).</li>
                            <li>Presioná "Seleccionar Todos".</li>
                            <li>Elegí el curso de destino (Ej: 2do A).</li>
                            <li>Confirmá la transferencia.</li>
                        </ol>

                        {/* 📸 LUGAR PARA TU IMAGEN */}
                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-12 my-6 text-gray-500 font-bold text-center">

                            <Image
                                src="/tutorial/Usuarios2.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Mostrando Pantalla de Migracion</span>
                        </div>
                    </div>
                </section>

                {/* ========================================== */}
                {/* SECCIÓN 5: PRESTAR                */}
                {/* ========================================== */}
                <section id="seccion-5" className="scroll-mt-24 mb-16">
                    <h2 className={`text-3xl font-bold mb-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-[var(--acento)]">5.</span> Prestar Libro
                    </h2>
                    <div className={`prose prose-purple max-w-none ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>
                        <p className="text-lg">
                            Se ofrecen prestamos de manera flexible para adaptarse a las necesidades de cada escuela. Podra prestar tanto a usuarios registrados como a usuarios temporales.
                        </p>



                        {/* 📸 LUGAR PARA TU IMAGEN */}
                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-12 my-6 text-gray-500 font-bold text-center">

                            <Image
                                src="/tutorial/Prestar2.webp"
                                alt=""
                                width={600}
                                height={200}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Al ingresar un nombre el sistema buscara usuarios registrados y dara la posibilidad de seleccionarlos</span>

                            <Image
                                src="/tutorial/Prestar1.webp"
                                alt=""
                                width={600}
                                height={200}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">En caso de ser un usuario temporal podra completar algunos campos adicionales</span>
                        </div>
                    </div>
                </section>

                {/* ========================================== */}
                {/* SECCIÓN 6: Configuraciones             */}
                {/* ========================================== */}
                <section id="seccion-6" className="scroll-mt-24 mb-16">
                    <h2 className={`text-3xl font-bold mb-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-[var(--acento)]">6.</span> Configuraciones
                    </h2>
                    <div className={`prose prose-purple max-w-none ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>
                        <p className="text-lg">
                            Desde Aqui explicaremos el manejo de Configuraciones, como cambiar el tema, configurar el sistema de prestamos, y otras opciones disponibles para personalizar tu experiencia.
                        </p>

                        <h3 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                            Back Up y Migracion de Koha
                        </h3>

                        {/* 📸 LUGAR PARA TU IMAGEN */}
                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-12 my-6 text-gray-500 font-bold text-center">

                            <Image
                                src="/tutorial/Datos1.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Desde aqui podra respaldar la base de datos del programa y restaurarla, ademas podra migrar su base de datos de Koha, ES FUNDAMENTAL YA QUE EXISTEN CATALOGOS COLABORATIVOS QUE EL NOMBRE DE LA ESCUELA COINCIDA EXACTAMENTE CON EL QUE ESTA REGISTRADO EN EL CATALOGO, DE LO CONTRARIO LA MIGRACION NO RECUPERARA LOS DATOS, luego de la migracion podra cambiar el nombre de la escuela al que usted desee</span>

                        </div>

                        <h3 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                            Temas y Nombre de escuela
                        </h3>

                        {/* 📸 LUGAR PARA TU IMAGEN */}
                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-12 my-6 text-gray-500 font-bold text-center">

                            <Image
                                src="/tutorial/Personalizacion1.webp"
                                alt=""
                                width={800}
                                height={450}
                                className="rounded-xl border"
                            />
                            <span className="mb-2 mt-2">Desde aqui podra elegir un tema y cambiar el nombre de la escuela</span>
                        </div>
                    </div>
                </section>

                <a href="#indice" onClick={(e) => smoothScroll(e, 'indice')} className="flex items-center gap-3 text-purple-600 hover:text-purple-800 hover:translate-x-2 transition-transform font-bold">

                    Volver al Indice
                </a>

            </div>
        </main>
    );
}
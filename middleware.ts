import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Buscamos si existe la cookie con el token
  const token = request.cookies.get('biblioteca_token')?.value;

  // 2. Si no hay token, lo pateamos a la pantalla de login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Si tiene token, lo dejamos pasar
  return NextResponse.next();
}

// 4. Acá definimos a qué rutas se les aplica este control
export const config = {
  matcher: [
    '/libros/nuevo',
    '/libros/editar/:path*',
    '/panol/:path*',
    '/herramientas/:path*',
    '/configuracion/:path*',
    '/inventario/:path*',
    '/usuarios/:path*',
    '/materiales/:path*',
    '/prestamos/:path*',
    '/admin/:path*',
    '/prestar/:path*',
    '/componentes/:path*',
    // Agregá acá cualquier otra ruta que quieras proteger
  ],
};
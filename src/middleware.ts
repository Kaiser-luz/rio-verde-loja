import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Pega o caminho que a pessoa está tentando acessar
    const path = request.nextUrl.pathname;

    // Verifica se é uma rota protegida (começa com /admin)
    // Mas IGNORA a própria página de login (/admin/login) para não criar loop infinito
    if (path.startsWith('/admin') && path !== '/admin/login') {

        // Tenta ler o cookie
        const adminSession = request.cookies.get('admin_session');

        // Se não tiver o cookie, chuta para o login
        if (!adminSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Se tiver tudo certo, deixa passar
    return NextResponse.next();
}

// Configura em quais rotas o porteiro deve trabalhar
export const config = {
    matcher: '/admin/:path*', // Aplica em tudo que começar com /admin
};
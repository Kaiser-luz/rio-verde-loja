'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(formData: FormData) {
    const password = formData.get('password') as string;

    // Verifica se a senha bate com a do arquivo .env
    if (password === process.env.ADMIN_PASSWORD) {

        // Cria um "crachá" (Cookie) válido por 1 dia
        const oneDay = 24 * 60 * 60 * 1000;

        // Await necessário para cookies() no Next.js mais recente
        const cookieStore = await cookies();

        cookieStore.set('admin_session', 'true', {
            expires: Date.now() + oneDay,
            httpOnly: true, // Segurança: JavaScript não consegue ler
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        redirect('/admin'); // Manda para o painel
    } else {
        // Se errou a senha, volta com erro (poderíamos melhorar isso depois)
        redirect('/admin/login?error=true');
    }
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/admin/login');
}
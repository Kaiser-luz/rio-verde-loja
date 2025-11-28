import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { MessageCircle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Rio Verde Tecidos e Espumas',
  description: 'Tecidos, Espumas e Materiais para Tapeçaria em Curitiba',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} font-sans text-stone-900 bg-white`}>
        {/* ORDEM IMPORTANTE: AuthProvider > CartProvider > Resto do Site */}
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <CartSidebar />

            {/* WhatsApp Flutuante */}
            <a
              href="https://wa.me/5541988494471"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-all hover:scale-110 flex items-center justify-center"
              title="Fale conosco no WhatsApp"
            >
              <MessageCircle size={28} />
            </a>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
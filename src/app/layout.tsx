import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar"; // Importação Nomeada
import { MessageCircle } from 'lucide-react';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Rio Verde Tecidos e Espumas",
  description: "A melhor loja de tecidos e espumas de Curitiba.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} font-sans text-stone-800 antialiased`}>
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
              href="https://wa.me/5541999999999" // Substitua pelo número real
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 flex items-center justify-center"
              aria-label="Fale conosco no WhatsApp"
            >
              <MessageCircle size={32} />
            </a>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
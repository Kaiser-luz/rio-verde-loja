import React from 'react';
import Link from 'next/link'; // Importante: Importar o Link

export default function HeroCarousel() {
    return (
        <div className="relative h-[400px] w-full overflow-hidden bg-green-900 rounded-2xl mb-8 shadow-xl">

            {/* Imagem de Fundo Segura */}
            <img
                src="https://picsum.photos/id/382/1200/800"
                alt="Tecidos Premium"
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            />

            {/* Texto Sobreposto */}
            <div className="absolute inset-0 flex flex-col justify-center items-start p-12 text-white z-10">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white text-green-900 mb-4 shadow-sm">
                    Desde 2000 em Curitiba
                </span>
                <h1 className="text-5xl font-serif mb-6 font-bold leading-tight drop-shadow-lg">
                    Rio Verde<br />Tecidos e Espumas
                </h1>
                <p className="text-lg mb-8 max-w-md text-stone-100 font-medium drop-shadow-md">
                    A maior variedade de espumas, tecidos para estofados e materiais para tapeçaria da região.
                </p>

                {/* CORREÇÃO AQUI: Link envolvendo o botão */}
                <Link href="/#linho">
                    <button className="px-8 py-4 rounded-xl font-bold bg-green-500 text-white hover:bg-green-400 transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1">
                        Ver Ofertas
                    </button>
                </Link>
            </div>
        </div>
    );
}
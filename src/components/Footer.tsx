import { MapPin, Phone, MessageCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="footer" className="bg-stone-900 text-stone-300 py-12 mt-12 border-t border-stone-800">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div>
                    <h3 className="text-white font-serif text-2xl mb-4">Rio Verde.</h3>
                    <p className="text-sm mb-4 leading-relaxed text-stone-400">
                        Referência em tecidos, espumas e materiais para estofaria.
                        Qualidade e variedade para transformar seus ambientes.
                    </p>
                    <div className="flex gap-2">
                        <a href="https://wa.me/5541988494471" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#128C7E] transition-colors">
                            <MessageCircle size={16} /> WhatsApp
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-medium mb-4 text-lg">Onde Estamos</h4>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <MapPin className="text-green-500 mt-1 shrink-0" size={20} />
                            <div>
                                <p className="text-white font-medium">Av. Prefeito Erasto Gaertner, 1217</p>
                                <p className="text-stone-500">Bacacheri, Curitiba - PR</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="text-green-500 shrink-0" size={20} />
                            <div>
                                <p>(41) 3387-5796 <span className="text-xs text-stone-500">(Fixo)</span></p>
                                <p>(41) 98849-4471 <span className="text-xs text-stone-500">(WhatsApp)</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-48 bg-stone-800 rounded-xl overflow-hidden relative group">
                    <iframe
                        width="100%"
                        height="100%"
                        title="Mapa Rio Verde"
                        frameBorder="0"
                        scrolling="no"
                        src="https://maps.google.com/maps?q=Avenida%20Prefeito%20Erasto%20Gaertner%201217&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                    ></iframe>
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=Avenida+Prefeito+Erasto+Gaertner+1217"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 bg-white text-stone-900 px-3 py-1.5 text-xs font-bold rounded shadow-lg flex items-center gap-1 hover:bg-green-50"
                    >
                        <MapPin size={12} /> Abrir Rota
                    </a>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-stone-800 text-center text-xs text-stone-600">
                © 2024 Rio Verde Tecidos e Espumas. Todos os direitos reservados.
            </div>
        </footer>
    );
}
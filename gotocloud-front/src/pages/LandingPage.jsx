import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, Headset, LineChart, Zap, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-50 relative overflow-hidden">

            {/* Efectos de luces de fondo (Glow) - Optimizados para no romper el layout móvil */}
            <div className="absolute top-[-10%] left-[-10%] w-[100%] md:w-[50%] h-[40%] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[100%] md:w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>

            {/* Navbar Minimalista Responsive */}
            <nav className="p-4 md:p-6 flex justify-between items-center relative z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Bot className="text-orange-500" size={24} md:size={28} />
                    <span className="text-lg md:text-xl font-bold tracking-tight">GoToCloud</span>
                </div>
                <div className="flex gap-4 md:gap-6 text-xs md:text-sm font-medium text-zinc-400">
                    <span className="hover:text-orange-400 cursor-pointer transition-colors hidden sm:inline">Características</span>
                    <span className="hover:text-orange-400 cursor-pointer transition-colors">v1.0 Demo</span>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center relative z-10 my-auto max-w-7xl mx-auto w-full">

                {/* Badge superior */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs md:text-sm font-medium mb-6 md:mb-8 border border-orange-500/20">
                    <Sparkles size={12} />
                    <span>Caribe Tech Arena • Hackathon Edition</span>
                </div>

                {/* Título Principal Adaptativo */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 max-w-4xl leading-tight px-2">
                    El Contact Center Autónomo del <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Futuro.</span>
                </h1>

                {/* Subtítulo */}
                <p className="text-sm sm:text-base md:text-xl text-zinc-400 max-w-2xl mb-8 md:mb-10 leading-relaxed px-4">
                    Soporte omnicanal impulsado por dos agentes IA. Continuidad de contexto entre chat, voz y WhatsApp con analítica comercial en tiempo real.
                </p>

                {/* Botones de Acción (CTAs) Responsives */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12 md:mb-16 w-full sm:w-auto px-4">
                    <Link
                        to="/chat"
                        className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:-translate-y-0.5 text-sm md:text-base"
                    >
                        Simular Cliente <Headset size={18} />
                    </Link>
                    <Link
                        to="/dashboard"
                        className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-full font-semibold transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 text-sm md:text-base"
                    >
                        Intelligence Dashboard <LineChart size={18} />
                    </Link>
                </div>

                {/* Grid de Características Adaptativo (1 col en móvil, 3 en escritorio) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full px-4 text-left">
                    <div className="p-5 md:p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl backdrop-blur-sm hover:border-zinc-800 transition-colors">
                        <Zap className="text-orange-500 mb-3" size={20} />
                        <h3 className="text-base md:text-lg font-semibold mb-1">Memoria Persistente</h3>
                        <p className="text-xs md:text-sm text-zinc-400">Recuperación de sesión anónima y continuidad de contexto entre canales.</p>
                    </div>
                    <div className="p-5 md:p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl backdrop-blur-sm hover:border-zinc-800 transition-colors">
                        <Bot className="text-orange-500 mb-3" size={20} />
                        <h3 className="text-base md:text-lg font-semibold mb-1">Dual-Agent AI</h3>
                        <p className="text-xs md:text-sm text-zinc-400">Un agente dedicado a soporte técnico y otro procesando leads en segundo plano.</p>
                    </div>
                    <div className="p-5 md:p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl backdrop-blur-sm hover:border-zinc-800 transition-colors">
                        <ShieldCheck className="text-orange-500 mb-3" size={20} />
                        <h3 className="text-base md:text-lg font-semibold mb-1">RAG Empresarial</h3>
                        <p className="text-xs md:text-sm text-zinc-400">Respuestas precisas extraídas directamente de la documentación corporativa.</p>
                    </div>
                </div>

            </main>
        </div>
    );
}
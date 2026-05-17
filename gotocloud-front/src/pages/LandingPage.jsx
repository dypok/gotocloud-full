import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, Headset, LineChart, Zap, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TRANSLATIONS = {
    es: {
        badge: "Caribe Tech Arena • Hackathon Edition",
        titleStart: "El Contact Center Autónomo del ",
        titleHighlight: "Futuro.",
        subtitle: "Atención omnicanal inteligente. Mantén el contexto del cliente entre chat, voz y WhatsApp mientras procesas oportunidades de negocio en tiempo real.",
        btnClient: "Probar Experiencia",
        btnDash: "Portal de Inteligencia",
        feat1Title: "Contexto Unificado",
        feat1Desc: "Recuperación de sesiones anónimas para una transición fluida entre canales.",
        feat2Title: "IA Multi-Agente",
        feat2Desc: "Resolución técnica en primera línea y perfilamiento de leads en segundo plano.",
        feat3Title: "RAG Corporativo",
        feat3Desc: "Respuestas precisas y seguras basadas exclusivamente en tu base de conocimiento."
    },
    pt: {
        badge: "Caribe Tech Arena • Hackathon Edition",
        titleStart: "O Contact Center Autônomo do ",
        titleHighlight: "Futuro.",
        subtitle: "Atendimento omnichannel inteligente. Mantenha o contexto do cliente entre chat, voz e WhatsApp enquanto analisa oportunidades em tempo real.",
        btnClient: "Testar Experiência",
        btnDash: "Portal de Inteligência",
        feat1Title: "Contexto Unificado",
        feat1Desc: "Recuperação de sessões anônimas para uma transição perfeita entre canais.",
        feat2Title: "IA Multi-Agente",
        feat2Desc: "Resolução técnica em linha de frente e qualificação de leads em background.",
        feat3Title: "RAG Corporativo",
        feat3Desc: "Respostas precisas e seguras baseadas exclusivamente na sua base de conhecimento."
    },
    en: {
        badge: "Caribe Tech Arena • Hackathon Edition",
        titleStart: "The Autonomous Contact Center of the ",
        titleHighlight: "Future.",
        subtitle: "Intelligent omnichannel support. Maintain customer context across chat, voice, and WhatsApp while capturing business opportunities in real-time.",
        btnClient: "Try Experience",
        btnDash: "Intelligence Portal",
        feat1Title: "Unified Context",
        feat1Desc: "Anonymous session recovery for seamless transitions across channels.",
        feat2Title: "Multi-Agent AI",
        feat2Desc: "Frontline technical resolution and background lead profiling.",
        feat3Title: "Enterprise RAG",
        feat3Desc: "Accurate and secure responses grounded strictly in your knowledge base."
    }
};

export default function LandingPage() {
    const { lang } = useLanguage();
    const t = TRANSLATIONS[lang] || TRANSLATIONS['es'];

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-50 relative overflow-hidden pt-24">

            {/* Efectos de luces de fondo (Glow) */}
            <div className="absolute top-[-10%] left-[-10%] w-[100%] md:w-[50%] h-[40%] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[100%] md:w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>

            {/* Hero Section (Centrado perfecto sin dobles headers) */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center relative z-10 my-auto max-w-7xl mx-auto w-full">

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs md:text-sm font-medium mb-6 md:mb-8 border border-orange-500/20">
                    <Sparkles size={12} />
                    <span>{t.badge}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 max-w-4xl leading-tight px-2">
                    {t.titleStart} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">{t.titleHighlight}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-xl text-zinc-400 max-w-2xl mb-8 md:mb-10 leading-relaxed px-4">
                    {t.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12 md:mb-16 w-full sm:w-auto px-4">
                    <Link
                        to="/chat"
                        className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:-translate-y-0.5 text-sm md:text-base"
                    >
                        {t.btnClient} <Headset size={18} />
                    </Link>
                    <Link
                        to="/dashboard"
                        className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-full font-semibold transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 text-sm md:text-base"
                    >
                        {t.btnDash} <LineChart size={18} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full px-4 text-left">
                    <div className="p-5 md:p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl backdrop-blur-sm hover:border-zinc-800 transition-colors">
                        <Zap className="text-orange-500 mb-3" size={20} />
                        <h3 className="text-base md:text-lg font-semibold mb-1">{t.feat1Title}</h3>
                        <p className="text-xs md:text-sm text-zinc-400">{t.feat1Desc}</p>
                    </div>
                    <div className="p-5 md:p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl backdrop-blur-sm hover:border-zinc-800 transition-colors">
                        <Bot className="text-orange-500 mb-3" size={20} />
                        <h3 className="text-base md:text-lg font-semibold mb-1">{t.feat2Title}</h3>
                        <p className="text-xs md:text-sm text-zinc-400">{t.feat2Desc}</p>
                    </div>
                    <div className="p-5 md:p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl backdrop-blur-sm hover:border-zinc-800 transition-colors">
                        <ShieldCheck className="text-orange-500 mb-3" size={20} />
                        <h3 className="text-base md:text-lg font-semibold mb-1">{t.feat3Title}</h3>
                        <p className="text-xs md:text-sm text-zinc-400">{t.feat3Desc}</p>
                    </div>
                </div>

            </main>
        </div>
    );
}
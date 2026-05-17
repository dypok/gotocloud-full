import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

// --- IMPORTAMOS EL CONTEXTO Y EL COMPONENTE SELECTOR ---
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { authService } from '../services/adminApi';

// --- DICCIONARIO DE TRADUCCIÓN ---
const TRANSLATIONS = {
    es: {
        subtitle: "Plataforma de Omnicanalidad e Inteligencia Artificial",
        emailLabel: "Correo Electrónico",
        emailPlaceholder: "nombre@empresa.com",
        passLabel: "Contraseña",
        passPlaceholder: "••••••••",
        btnLoading: "Autenticando...",
        btnSubmit: "Ingresar al Centro de Comando",
        footerNote: "Modo Sandbox activo. Se permite el acceso con cualquier credencial para efectos de demostración técnica."
    },
    pt: {
        subtitle: "Plataforma Omnichannel e Inteligência Artificial",
        emailLabel: "E-mail Corporativo",
        emailPlaceholder: "nome@empresa.com.br",
        passLabel: "Senha",
        passPlaceholder: "••••••••",
        btnLoading: "Autenticando...",
        btnSubmit: "Entrar no Centro de Comando",
        footerNote: "Modo Sandbox ativo. Qualquer credencial é permitida para fins de demonstração técnica."
    },
    en: {
        subtitle: "Omnichannel and Artificial Intelligence Platform",
        emailLabel: "Email Address",
        emailPlaceholder: "name@company.com",
        passLabel: "Password",
        passPlaceholder: "••••••••",
        btnLoading: "Authenticating...",
        btnSubmit: "Enter Command Center",
        footerNote: "Sandbox mode active. Access is granted with any credentials for technical demonstration purposes."
    }
};

export default function Login() {
    // Conectamos el estado global del idioma
    const { lang } = useLanguage();
    const t = TRANSLATIONS[lang] || TRANSLATIONS['es'];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        setIsLoading(true);

        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.message || 'Error al autenticar');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* SELECTOR DE IDIOMAS FLOTANTE INDEPENDIENTE */}
            <div className="absolute top-4 right-4 z-50">
                <LanguageSelector />
            </div>

            {/* Efectos de luces de fondo sutiles */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Contenedor de la Tarjeta de Login */}
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-300">

                {/* Logo y Encabezado */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500 mb-3">
                        <Cpu size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-50">GoToCloud</h1>
                    <p className="text-xs text-zinc-400 mt-1">{t.subtitle}</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Input de Correo */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">{t.emailLabel}</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-3 text-zinc-500" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t.emailPlaceholder}
                                disabled={isLoading}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Input de Contraseña */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">{t.passLabel}</label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-3 text-zinc-500" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t.passPlaceholder}
                                disabled={isLoading}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Botón de Envío */}
                    <button
                        type="submit"
                        disabled={isLoading || !email.trim() || !password.trim()}
                        className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.15)] group active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>{t.btnLoading}</span>
                            </>
                        ) : (
                            <>
                                <span>{t.btnSubmit}</span>
                                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Nota informativa al pie para la demo */}
                <div className="mt-6 text-center">
                    <p className="text-[10px] text-zinc-500">
                        {t.footerNote}
                    </p>
                </div>

            </div>
        </div>
    );
}
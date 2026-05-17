import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, MessageSquare, PhoneOff, Volume2, UserCheck, ArrowRight, CheckCircle2, Bug, ChevronDown, Search } from 'lucide-react';
import { chatService } from '../services/api';

// --- IMPORTAMOS EL CONTEXTO GLOBAL DE IDIOMA ---
import { useLanguage } from '../context/LanguageContext';

import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import Flags from 'react-phone-number-input/flags';
import esCountryNames from 'react-phone-number-input/locale/es.json';

// --- DICCIONARIO DE TRADUCCIÓN NATURAL (SaaS / Enterprise) ---
const TRANSLATIONS = {
  es: {
    titleRegister: "Validación de Sesión",
    descRegister: "Asociaremos tu consulta a tu número para mantener el historial si decides continuar por llamada o WhatsApp.",
    labelPhone: "Número móvil",
    btnRegister: "Iniciar Asistencia",
    placeholderPhone: "300 123 4567",
    
    channelWeb: "Soporte Web",
    azureActive: "Nodo Azure Operativo",
    aiBanner: "🛡️ Comunicación protegida por el Agente Autónomo de GoToCloud",
    placeholderChat: "Escribe tu consulta aquí...",
    
    btnVoice: "Llamada de Voz",
    btnWhatsApp: "Continuar en WhatsApp",
    
    callConnecting: "CONECTANDO VÍA ACS...",
    callActive: "LLAMADA EN CURSO",
    callConnectingDesc: "Enlazando con tu dispositivo...",
    callActiveDesc: "Procesamiento de voz activo mediante Azure AI",
    
    wsSuccess: "Transición exitosa. Revisa tu WhatsApp para continuar.",
    welcomeNew: "Hola, te doy la bienvenida a GoToCloud. Soy tu agente de Inteligencia Artificial. ¿En qué te puedo asesorar hoy sobre nuestra infraestructura cloud?",
    welcomeReturning: "¡Qué bueno verte de nuevo! He recuperado nuestro contexto anterior. ¿En qué más te puedo ayudar hoy con tu entorno Azure?"
  },
  pt: {
    titleRegister: "Validação de Sessão",
    descRegister: "Vamos associar seu atendimento ao seu número para manter o histórico caso decida continuar por telefone ou WhatsApp.",
    labelPhone: "Número de celular",
    btnRegister: "Iniciar Atendimento",
    placeholderPhone: "(11) 91234-5678",
    
    channelWeb: "Suporte Web",
    azureActive: "Nodo Azure Operacional",
    aiBanner: "🛡️ Comunicação protegida pelo Agente Autônomo da GoToCloud",
    placeholderChat: "Digite sua dúvida aqui...",
    
    btnVoice: "Chamada de Voz",
    btnWhatsApp: "Continuar no WhatsApp",
    
    callConnecting: "CONECTANDO VIA ACS...",
    callActive: "CHAMADA EM ANDAMENTO",
    callConnectingDesc: "Conectando ao seu dispositivo...",
    callActiveDesc: "Processamento de voz ativo via Azure AI",
    
    wsSuccess: "Transição concluída. Verifique seu WhatsApp para continuar.",
    welcomeNew: "Olá, boas-vindas à GoToCloud. Sou seu agente de Inteligência Artificial. Como posso te apoiar hoje com nossa infraestrutura em nuvem?",
    welcomeReturning: "Que bom te ver de novo! Recuperei o nosso contexto anterior. Como mais posso te ajudar hoje com seu ambiente Azure?"
  },
  en: {
    titleRegister: "Session Validation",
    descRegister: "We will link your inquiry to your number to maintain the history if you decide to switch to a call or WhatsApp.",
    labelPhone: "Mobile number",
    btnRegister: "Start Assistance",
    placeholderPhone: "202-555-0143",
    
    channelWeb: "Web Support",
    azureActive: "Azure Node Operational",
    aiBanner: "🛡️ Communication secured by GoToCloud's Autonomous Agent",
    placeholderChat: "Type your question here...",
    
    btnVoice: "Voice Call",
    btnWhatsApp: "Continue on WhatsApp",
    
    callConnecting: "CONNECTING VIA ACS...",
    callActive: "CALL IN PROGRESS",
    callConnectingDesc: "Linking to your device...",
    callActiveDesc: "Voice processing active via Azure AI",
    
    wsSuccess: "Transition successful. Check your WhatsApp to continue.",
    welcomeNew: "Hello, welcome to GoToCloud. I'm your AI agent. How can I assist you today with our cloud infrastructure?",
    welcomeReturning: "Great to see you again! I've recovered our previous context. How else can I help you today with your Azure environment?"
  }
};

export default function CustomerPortal() {
    // --- CONECTAMOS EL HOOK GLOBAL DE IDIOMA ---
    const { lang } = useLanguage();
    const t = TRANSLATIONS[lang] || TRANSLATIONS['es'];

    // --- ESTADOS DE IDENTIDAD GLOBAL ---
    const [localNumber, setLocalNumber] = useState('');
    const [isIdentityLinked, setIsIdentityLinked] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [savedGlobalPhone, setSavedGlobalPhone] = useState('');

    // --- ESTADOS DE NUESTRO DROPDOWN DE PAÍSES ---
    const [activeCountry, setActiveCountry] = useState('CO');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // --- ESTADOS DEL CHAT Y LLAMADAS ---
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOutboundCallActive, setIsOutboundCallActive] = useState(false);
    const [callStatus, setCallStatus] = useState('marcando');
    const [showWhatsAppSuccess, setShowWhatsAppSuccess] = useState(false);

    const messagesEndRef = useRef(null);
    const dropdownRef = useRef(null);

    const allCountryCodes = getCountries();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const savedPhone = localStorage.getItem('global_phone_number');
        let currentSession = localStorage.getItem('anon_session_id');

        if (!currentSession) {
            currentSession = crypto.randomUUID();
            localStorage.setItem('anon_session_id', currentSession);
        }
        setSessionId(currentSession);

        if (savedPhone) {
            setSavedGlobalPhone(savedPhone);
            setIsIdentityLinked(true);
            setMessages([
                { id: '1', role: 'agent', content: t.welcomeReturning }
            ]);
        }
    }, [lang]); // Escucha cambios de idioma para refrescar el saludo si ya está logueado

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, isOutboundCallActive, showWhatsAppSuccess]);

    const resetDebugSession = () => {
        localStorage.removeItem('global_phone_number');
        localStorage.removeItem('anon_session_id');
        window.location.reload();
    };

    const buildFullE164Number = (countryCode, number) => {
        const callingCode = getCountryCallingCode(countryCode);
        const cleanNumber = number.replace(/\D/g, '');
        return `+${callingCode}${cleanNumber}`;
    };

    const handleLinkIdentity = (e) => {
        e.preventDefault();
        const cleanDigits = localNumber.replace(/\D/g, '');
        if (!cleanDigits || cleanDigits.length < 6) return;

        const fullPhoneNumber = buildFullE164Number(activeCountry, cleanDigits);
        localStorage.setItem('global_phone_number', fullPhoneNumber);
        setSavedGlobalPhone(fullPhoneNumber);
        setIsIdentityLinked(true);

        setMessages([
            { id: '1', role: 'agent', content: t.welcomeNew }
        ]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue;
        const newUserMsg = { id: Date.now().toString(), role: 'user', content: userText };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const data = await chatService.sendMessage(sessionId, userText, savedGlobalPhone);
            const agentMsg = { id: Date.now().toString(), role: 'agent', content: data.reply }
            setMessages((prev) => [...prev, agentMsg]);
        } catch (error) {
            const errorMsg = { id: Date.now().toString(), role: 'agent', content: "Error de conexión." };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const triggerOutboundCall = () => {
        setIsOutboundCallActive(true);
        setCallStatus('marcando');

        setTimeout(() => {
            setCallStatus('en_linea');
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: 'agent',
                content: `📞 [PSTN] - ${savedGlobalPhone}.`
            }]);
        }, 2000);
    };

    const terminateOutboundCall = () => {
        setIsOutboundCallActive(false);
    };

    const triggerWhatsAppSwitch = () => {
        setShowWhatsAppSuccess(true);
        setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'agent',
            content: `💬 ${t.wsSuccess}`
        }]);
        setTimeout(() => setShowWhatsAppSuccess(false), 4000);
    };

    const filteredCountries = allCountryCodes.filter((code) => {
        const countryName = esCountryNames[code] ? esCountryNames[code].toLowerCase() : '';
        const callingCode = getCountryCallingCode(code);
        const query = searchQuery.toLowerCase();

        return countryName.includes(query) || callingCode.includes(query) || code.toLowerCase().includes(query);
    });

    const renderFlag = (code) => {
        const FlagComponent = Flags[code];
        return FlagComponent ? (
            <span className="w-5 h-3.5 overflow-hidden rounded-sm inline-block flex-shrink-0 border border-zinc-800/40">
                <FlagComponent />
            </span>
        ) : null;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-zinc-950 p-4 pt-24 font-sans text-zinc-100 relative">

            <button
                onClick={resetDebugSession}
                className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-400 bg-zinc-900/50 hover:bg-zinc-800 rounded-lg transition-all z-40"
                title="Resetear Sesión"
            >
                <Bug size={16} />
            </button>

            <style>{`
        .PhoneInputCountry { display: none; } 
        .PhoneInputInput {
          width: 100%; background: transparent; border: none; color: #f4f4f5;
          font-size: 0.875rem; letter-spacing: 0.05em; outline: none; padding: 12px 16px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-message { animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .dot-bounce { animation: bounce-subtle 1.4s infinite ease-in-out both; }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }
        .dot-bounce:nth-child(1) { animation-delay: -0.32s; }
        .dot-bounce:nth-child(2) { animation-delay: -0.16s; }
      `}</style>

            {/* --- RENDERIZADO CONDICIONAL DE PANTALLAS --- */}
            {!isIdentityLinked ? (
                <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-center z-10 animate-in fade-in zoom-in-95 duration-300">
                    <div className="inline-flex p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500 mb-4">
                        <UserCheck size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-50">{t.titleRegister}</h2>
                    <p className="text-xs text-zinc-400 mt-2 mb-6 leading-relaxed">{t.descRegister}</p>

                    <form onSubmit={handleLinkIdentity} className="space-y-6">
                        <div className="text-left space-y-1.5 flex flex-col-reverse gap-0" ref={dropdownRef}>
                            {isDropdownOpen && (
                                <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden mb-2 z-50">
                                    <div className="p-2 border-b border-zinc-800/80 bg-zinc-950 flex items-center relative">
                                        <Search size={14} className="absolute left-4 text-zinc-500" />
                                        <input
                                            type="text" autoFocus placeholder="Buscar..." value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500/50"
                                        />
                                    </div>
                                    <div className="max-h-44 overflow-y-auto custom-scrollbar p-1">
                                        {filteredCountries.map((code) => (
                                            <button
                                                key={code} type="button"
                                                onClick={() => { setActiveCountry(code); setLocalNumber(''); setIsDropdownOpen(false); }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors ${activeCountry === code ? 'bg-orange-500/10 text-orange-400 font-medium' : 'text-zinc-300 hover:bg-zinc-800'}`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                                                    {renderFlag(code)}
                                                    <span className="truncate">{esCountryNames[code] || code}</span>
                                                </div>
                                                <span className="text-zinc-500 font-mono text-[11px]">+{getCountryCallingCode(code)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-stretch gap-0 w-full bg-zinc-950 border border-zinc-800 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 rounded-xl transition-all">
                                <button
                                    type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-3 bg-zinc-950/60 hover:bg-zinc-900 border-r border-zinc-800 rounded-l-xl transition-colors focus:outline-none flex-shrink-0 min-w-[105px] justify-center"
                                >
                                    {renderFlag(activeCountry)}
                                    <span className="text-xs font-mono font-medium text-zinc-300">+{getCountryCallingCode(activeCountry)}</span>
                                    <ChevronDown size={11} className="text-zinc-500" />
                                </button>
                                <input
                                    type="text" inputMode="numeric" pattern="[0-9]*" value={localNumber}
                                    onChange={(e) => setLocalNumber(e.target.value.replace(/\D/g, ''))}
                                    placeholder={t.placeholderPhone}
                                    className="w-full bg-transparent border-none text-zinc-100 placeholder-zinc-600 font-sans text-sm tracking-wider outline-none px-4 py-3"
                                />
                            </div>
                            <label className="text-xs font-medium text-zinc-400 order-last mb-1.5">{t.labelPhone}</label>
                        </div>
                        <button type="submit" disabled={localNumber.length < 6} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2">{t.btnRegister}</button>
                    </form>
                </div>
            ) : (
                <div className="w-full h-[calc(100dvh-120px)] md:h-[80vh] md:max-w-2xl bg-zinc-900 md:rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
                    <header className="bg-zinc-950/90 border-b border-zinc-800 p-4 flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all duration-500 ${isOutboundCallActive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}>
                                {isOutboundCallActive ? <Volume2 size={16} /> : <MessageSquare size={16} />}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm md:text-base font-semibold text-zinc-100 truncate">{isOutboundCallActive ? t.callActive : t.channelWeb}</h2>
                                <p className="text-[10px] md:text-xs text-orange-400 font-mono truncate">ID Ancla: {savedGlobalPhone}</p>
                            </div>
                        </div>
                        <span className="flex items-center gap-1.5 text-[10px] md:text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            {t.azureActive}
                        </span>
                    </header>

                    <div className="bg-zinc-950 border-b border-zinc-800/60 px-4 py-1.5 text-center text-[10px] text-zinc-400 tracking-wide">{t.aiBanner}</div>

                    <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/30">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
                                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-orange-500 text-white rounded-br-none shadow-lg shadow-orange-500/10'
                                    : 'bg-zinc-800 border border-zinc-700/60 text-zinc-100 rounded-bl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-message">
                                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-none p-4 flex items-center gap-1 w-14 h-10 justify-center">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full dot-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full dot-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full dot-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </main>

                    <footer className="border-t border-zinc-800 p-3 bg-zinc-950">
                        {!isOutboundCallActive ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={triggerOutboundCall} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-all"><Phone size={14} className="text-orange-500" />{t.btnVoice}</button>
                                    <button onClick={triggerWhatsAppSwitch} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-all"><MessageSquare size={14} className="text-green-500" />{t.btnWhatsApp}</button>
                                </div>
                                <form onSubmit={handleSendMessage} className="relative flex items-center">
                                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={t.placeholderChat} className="w-full pl-4 pr-12 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm outline-none focus:border-orange-500" />
                                    <button type="submit" disabled={!inputValue.trim() || isLoading} className="absolute right-2 p-2 text-white bg-orange-500 rounded-lg disabled:opacity-50"><Send size={14} /></button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 space-y-5 animate-in slide-in-from-bottom-6">
                                <div className="flex items-center justify-center gap-1 h-10">
                                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                        <div key={i} className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: callStatus === 'en_linea' ? `${Math.random() * 28 + 10}px` : '6px', animationDelay: `${i * 0.08}s` }}></div>
                                    ))}
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-mono uppercase text-green-400 font-semibold">{callStatus === 'marcando' ? t.callConnecting : t.callActive}</p>
                                    <p className="text-xs text-zinc-400 mt-1">{callStatus === 'marcando' ? t.callConnectingDesc : t.callActiveDesc}</p>
                                </div>
                                <button onClick={terminateOutboundCall} className="p-4 bg-red-500 text-white rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-95 transition-all"><PhoneOff size={22} /></button>
                            </div>
                        )}
                    </footer>
                </div>
            )}
        </div>
    );
}
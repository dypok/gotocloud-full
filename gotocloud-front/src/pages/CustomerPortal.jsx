import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Phone, MessageSquare, PhoneOff, Volume2, UserCheck, ChevronDown, Search, Bug, Mic, MicOff } from 'lucide-react';
import { chatService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import Flags from 'react-phone-number-input/flags';
import esCountryNames from 'react-phone-number-input/locale/es.json';

const TRANSLATIONS = {
    es: {
        titleRegister: "Validación de Sesión",
        descRegister: "Asociaremos tu consulta a tu número para mantener el historial si decides continuar por llamada o Telegram.",
        labelPhone: "Número móvil",
        btnRegister: "Iniciar Asistencia",
        placeholderPhone: "300 123 4567",
        channelWeb: "Soporte Web",
        geminiActive: "Nodo Gemini Operativo",
        aiBanner: "🛡️ Comunicación protegida por la IA de GoToCloud",
        placeholderChat: "Escribe tu consulta aquí...",
        btnVoice: "Llamada de Voz",
        btnTelegram: "Continuar en Telegram",
        callConnecting: "INICIANDO LLAMADA...",
        callActive: "LLAMADA EN CURSO",
        callConnectingDesc: "Conectando con el agente de IA...",
        callActiveDesc: "Habla ahora — el agente está escuchando",
        callListening: "ESCUCHANDO...",
        callSpeaking: "AGENTE RESPONDIENDO...",
        callMuted: "MICRÓFONO SILENCIADO",
        wsSuccess: "Transición exitosa. Redirigiendo a Telegram...",
        welcomeNew: "Hola, te doy la bienvenida a GoToCloud. Soy tu asistente de Inteligencia Artificial. ¿En qué te puedo asesorar hoy sobre nuestra infraestructura cloud?",
        welcomeReturning: "¡Qué bueno verte de nuevo! He recuperado nuestro historial. ¿En qué más te puedo ayudar hoy con tu infraestructura?",
        voiceNotSupported: "Tu navegador no soporta reconocimiento de voz. Usa Chrome.",
        callEnded: "📞 Llamada finalizada.",
    },
    pt: {
        titleRegister: "Validação de Sessão",
        descRegister: "Vamos associar seu atendimento ao seu número para manter o histórico caso decida continuar por telefone ou Telegram.",
        labelPhone: "Número de celular",
        btnRegister: "Iniciar Atendimento",
        placeholderPhone: "(11) 91234-5678",
        channelWeb: "Suporte Web",
        geminiActive: "Nodo Gemini Operacional",
        aiBanner: "🛡️ Comunicação protegida pela IA da GoToCloud",
        placeholderChat: "Digite sua dúvida aqui...",
        btnVoice: "Chamada de Voz",
        btnTelegram: "Continuar no Telegram",
        callConnecting: "INICIANDO CHAMADA...",
        callActive: "CHAMADA EM ANDAMENTO",
        callConnectingDesc: "Conectando ao agente de IA...",
        callActiveDesc: "Fale agora — o agente está ouvindo",
        callListening: "OUVINDO...",
        callSpeaking: "AGENTE RESPONDENDO...",
        callMuted: "MICROFONE MUDO",
        wsSuccess: "Transição concluída. Redirecionando para o Telegram...",
        welcomeNew: "Olá, boas-vindas à GoToCloud. Sou seu assistente de Inteligência Artificial. Como posso te apoiar hoje com nossa infraestrutura em nuvem?",
        welcomeReturning: "Que bom te ver de novo! Recuperei o nosso histórico. Como mais posso te ajudar hoje com sua infraestrutura?",
        voiceNotSupported: "Seu navegador não suporta reconhecimento de voz. Use o Chrome.",
        callEnded: "📞 Chamada encerrada.",
    },
    en: {
        titleRegister: "Session Validation",
        descRegister: "We will link your inquiry to your number to maintain the history if you decide to switch to a call or Telegram.",
        labelPhone: "Mobile number",
        btnRegister: "Start Assistance",
        placeholderPhone: "202-555-0143",
        channelWeb: "Web Support",
        geminiActive: "Gemini Node Operational",
        aiBanner: "🛡️ Communication secured by GoToCloud's AI",
        placeholderChat: "Type your question here...",
        btnVoice: "Voice Call",
        btnTelegram: "Continue on Telegram",
        callConnecting: "STARTING CALL...",
        callActive: "CALL IN PROGRESS",
        callConnectingDesc: "Connecting to AI agent...",
        callActiveDesc: "Speak now — agent is listening",
        callListening: "LISTENING...",
        callSpeaking: "AGENT RESPONDING...",
        callMuted: "MICROPHONE MUTED",
        wsSuccess: "Transition successful. Redirecting to Telegram...",
        welcomeNew: "Hello, welcome to GoToCloud. I'm your AI assistant. How can I assist you today with our cloud infrastructure?",
        welcomeReturning: "Great to see you again! I've recovered our history. How else can I help you today with your infrastructure?",
        voiceNotSupported: "Your browser doesn't support voice recognition. Please use Chrome.",
        callEnded: "📞 Call ended.",
    }
};

const LANG_TO_SPEECH = { es: 'es-CO', pt: 'pt-BR', en: 'en-US' };

export default function CustomerPortal() {
    const { lang } = useLanguage();
    const t = TRANSLATIONS[lang] || TRANSLATIONS['es'];
    const speechLang = LANG_TO_SPEECH[lang] || 'es-CO';

    const [localNumber, setLocalNumber] = useState('');
    const [isIdentityLinked, setIsIdentityLinked] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [savedGlobalPhone, setSavedGlobalPhone] = useState('');
    const [activeCountry, setActiveCountry] = useState('CO');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTelegramSuccess, setShowTelegramSuccess] = useState(false);

    // --- ESTADOS DE VOZ ---
    const [isCallActive, setIsCallActive] = useState(false);
    const [callPhase, setCallPhase] = useState('idle'); // idle | connecting | listening | processing | speaking
    const [isMuted, setIsMuted] = useState(false);

    const messagesEndRef = useRef(null);
    const dropdownRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const isCallActiveRef = useRef(false);
    const isMutedRef = useRef(false);

    const allCountryCodes = getCountries();

    useEffect(() => { isCallActiveRef.current = isCallActive; }, [isCallActive]);
    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

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
            currentSession = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            localStorage.setItem('anon_session_id', currentSession);
        }
        setSessionId(currentSession);
        if (savedPhone) {
            setSavedGlobalPhone(savedPhone);
            setIsIdentityLinked(true);
            setMessages([{ id: '1', role: 'agent', content: t.welcomeReturning }]);
        }
    }, [lang]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, isCallActive]);

    // --- MOTOR DE VOZ ---
    const speakText = useCallback((text) => {
        return new Promise((resolve) => {
            synthRef.current.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = speechLang;
            utterance.rate = 1.05;
            utterance.pitch = 1;

            const voices = synthRef.current.getVoices();
            const preferred = voices.find(v => v.lang.startsWith(speechLang.split('-')[0]) && v.localService);
            if (preferred) utterance.voice = preferred;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            synthRef.current.speak(utterance);
        });
    }, [speechLang]);

    const startListening = useCallback(() => {
        if (!isCallActiveRef.current || isMutedRef.current) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = speechLang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;
        recognitionRef.current = recognition;

        setCallPhase('listening');

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript.trim();
            if (!transcript || !isCallActiveRef.current) return;

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: `🎤 ${transcript}` }]);
            setCallPhase('processing');

            try {
                const currentSessionId = sessionId || localStorage.getItem('anon_session_id');
                const data = await chatService.sendMessage(currentSessionId, transcript, 'voice');

                if (data.session_id) {
                    localStorage.setItem('anon_session_id', data.session_id);
                    setSessionId(data.session_id);
                }

                const reply = data.reply;
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', content: reply }]);

                if (isCallActiveRef.current) {
                    setCallPhase('speaking');
                    await speakText(reply);
                    if (isCallActiveRef.current) startListening();
                }
            } catch {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', content: 'Error de conexión.' }]);
                if (isCallActiveRef.current) startListening();
            }
        };

        recognition.onerror = (e) => {
            if (e.error === 'no-speech' && isCallActiveRef.current) {
                startListening();
            }
        };

        recognition.onend = () => {
            if (isCallActiveRef.current && callPhase === 'listening') {
                startListening();
            }
        };

        recognition.start();
    }, [sessionId, speakText, speechLang, callPhase]);

    const startCall = async () => {
        // Desbloquear audio context con el click del usuario
        const unlock = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(unlock);
        window.speechSynthesis.cancel();
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(t.voiceNotSupported);
            return;
        }

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            alert('Necesitas dar permisos de micrófono.');
            return;
        }

        setIsCallActive(true);
        isCallActiveRef.current = true;
        setCallPhase('connecting');
        setIsMuted(false);

        const greeting = t.welcomeNew;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', content: `📞 ${t.callActive}` }]);

        setTimeout(async () => {
            if (!isCallActiveRef.current) return;
            setCallPhase('speaking');
            await speakText(greeting);
            if (isCallActiveRef.current) startListening();
        }, 800);
    };

    const endCall = () => {
        synthRef.current.cancel();
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { }
        }
        isCallActiveRef.current = false;
        setIsCallActive(false);
        setCallPhase('idle');
        setIsMuted(false);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', content: t.callEnded }]);
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        isMutedRef.current = newMuted;
        if (newMuted) {
            synthRef.current.cancel();
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch { }
            setCallPhase('idle');
        } else {
            startListening();
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        const userText = inputValue;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText }]);
        setInputValue('');
        setIsLoading(true);
        try {
            const currentSessionId = sessionId || localStorage.getItem('anon_session_id');
            const data = await chatService.sendMessage(currentSessionId, userText, 'webchat');
            if (data.session_id) {
                localStorage.setItem('anon_session_id', data.session_id);
                setSessionId(data.session_id);
            }
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', content: data.reply }]);
        } catch {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', content: 'Error de conexión.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkIdentity = async (e) => {
        e.preventDefault();
        const cleanDigits = localNumber.replace(/\D/g, '');
        if (!cleanDigits || cleanDigits.length < 6) return;
        const callingCode = getCountryCallingCode(activeCountry);
        const fullPhoneNumber = `+${callingCode}${cleanDigits}`;
        
        localStorage.setItem('global_phone_number', fullPhoneNumber);
        setSavedGlobalPhone(fullPhoneNumber);
        setIsIdentityLinked(true);
        setIsLoading(true);

        try {
            const context = await chatService.getContext(fullPhoneNumber, 'webchat');
            if (context && context.messages && context.messages.length > 0) {
                // Si hay historial, mostrar bienvenida de retorno y cargar últimos mensajes
                const history = context.messages.map(m => ({
                    id: Math.random().toString(),
                    role: m.role,
                    content: m.message || m.content
                }));
                setMessages([...history, { id: 'welcome', role: 'agent', content: t.welcomeReturning }]);
            } else {
                setMessages([{ id: 'welcome', role: 'agent', content: t.welcomeNew }]);
            }
        } catch (error) {
            console.error("Error fetching context:", error);
            setMessages([{ id: 'welcome', role: 'agent', content: t.welcomeNew }]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- LÓGICA DE REDIRECCIÓN A TELEGRAM ---
    // --- LÓGICA DE REDIRECCIÓN A TELEGRAM WEB ---
    const triggerTelegramSwitch = () => {
        setShowTelegramSuccess(true);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', content: `💬 ${t.wsSuccess}` }]);

        // Redirigir directamente a la versión WEB de Telegram después de 1.5s
        setTimeout(() => {
            setShowTelegramSuccess(false);
            // Usamos la URL directa del cliente web ('/a/' o '/k/') con el parámetro de resolución del bot
            window.open('https://web.telegram.org/a/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3Dgotocloudbot', '_blank');
        }, 1500);
    };

    const resetDebugSession = () => {
        endCall();
        localStorage.removeItem('global_phone_number');
        localStorage.removeItem('anon_session_id');
        window.location.reload();
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

    const callStatusLabel = () => {
        if (callPhase === 'connecting') return t.callConnecting;
        if (callPhase === 'listening') return t.callListening;
        if (callPhase === 'processing') return '🔄 PROCESANDO...';
        if (callPhase === 'speaking') return t.callSpeaking;
        if (isMuted) return t.callMuted;
        return t.callActive;
    };

    const callStatusColor = () => {
        if (callPhase === 'listening') return 'text-green-400';
        if (callPhase === 'speaking') return 'text-blue-400';
        if (callPhase === 'processing') return 'text-amber-400';
        return 'text-zinc-400';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-zinc-950 p-4 pt-24 font-sans text-zinc-100 relative">
            <button onClick={resetDebugSession} className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-400 bg-zinc-900/50 hover:bg-zinc-800 rounded-lg transition-all z-40" title="Resetear Sesión">
                <Bug size={16} />
            </button>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
                @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-message { animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .dot-bounce { animation: bounce-subtle 1.4s infinite ease-in-out both; }
                @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }
                .dot-bounce:nth-child(1) { animation-delay: -0.32s; }
                .dot-bounce:nth-child(2) { animation-delay: -0.16s; }
                @keyframes voiceWave { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
                .voice-bar { animation: voiceWave 0.8s ease-in-out infinite; }
            `}</style>

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
                                        <input type="text" autoFocus placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500/50" />
                                    </div>
                                    <div className="max-h-44 overflow-y-auto custom-scrollbar p-1">
                                        {filteredCountries.map((code) => (
                                            <button key={code} type="button" onClick={() => { setActiveCountry(code); setLocalNumber(''); setIsDropdownOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors ${activeCountry === code ? 'bg-orange-500/10 text-orange-400 font-medium' : 'text-zinc-300 hover:bg-zinc-800'}`}>
                                                <div className="flex items-center gap-2.5 truncate max-w-[80%]">{renderFlag(code)}<span className="truncate">{esCountryNames[code] || code}</span></div>
                                                <span className="text-zinc-500 font-mono text-[11px]">+{getCountryCallingCode(code)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-stretch gap-0 w-full bg-zinc-950 border border-zinc-800 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 rounded-xl transition-all">
                                <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 px-3 bg-zinc-950/60 hover:bg-zinc-900 border-r border-zinc-800 rounded-l-xl transition-colors focus:outline-none flex-shrink-0 min-w-[105px] justify-center">
                                    {renderFlag(activeCountry)}
                                    <span className="text-xs font-mono font-medium text-zinc-300">+{getCountryCallingCode(activeCountry)}</span>
                                    <ChevronDown size={11} className="text-zinc-500" />
                                </button>
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={localNumber} onChange={(e) => setLocalNumber(e.target.value.replace(/\D/g, ''))} placeholder={t.placeholderPhone} className="w-full bg-transparent border-none text-zinc-100 placeholder-zinc-600 font-sans text-sm tracking-wider outline-none px-4 py-3" />
                            </div>
                            <label className="text-xs font-medium text-zinc-400 order-last mb-1.5">{t.labelPhone}</label>
                        </div>
                        <button type="submit" disabled={localNumber.length < 6} className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2">{t.btnRegister}</button>
                    </form>
                </div>
            ) : (
                <div className="w-full h-[calc(100dvh-120px)] md:h-[80vh] md:max-w-2xl bg-zinc-900 md:rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
                    <header className="bg-zinc-950/90 border-b border-zinc-800 p-4 flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all duration-500 ${isCallActive ? 'bg-green-500' : 'bg-orange-500'} ${callPhase === 'listening' ? 'animate-pulse' : ''}`}>
                                {isCallActive ? <Volume2 size={16} /> : <MessageSquare size={16} />}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm md:text-base font-semibold text-zinc-100 truncate">{isCallActive ? t.callActive : t.channelWeb}</h2>
                                <p className="text-[10px] md:text-xs text-orange-400 font-mono truncate">ID Ancla: {savedGlobalPhone}</p>
                            </div>
                        </div>
                        <span className="flex items-center gap-1.5 text-[10px] md:text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            {t.geminiActive}
                        </span>
                    </header>

                    <div className="bg-zinc-950 border-b border-zinc-800/60 px-4 py-1.5 text-center text-[10px] text-zinc-400 tracking-wide">{t.aiBanner}</div>

                    <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/30">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
                                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-br-none shadow-lg shadow-orange-500/10' : 'bg-zinc-800 border border-zinc-700/60 text-zinc-100 rounded-bl-none'}`}>
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
                        {!isCallActive ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={startCall} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white hover:border-green-500/30 transition-all">
                                        <Phone size={14} className="text-orange-500" />{t.btnVoice}
                                    </button>
                                    <button onClick={triggerTelegramSwitch} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white hover:border-blue-500/30 transition-all">
                                        {/* Icono de Send para simular Telegram y el texto azul representativo */}
                                        <Send size={14} className="text-blue-500" />{t.btnTelegram}
                                    </button>
                                </div>
                                <form onSubmit={handleSendMessage} className="relative flex items-center">
                                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={t.placeholderChat} className="w-full pl-4 pr-12 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm outline-none focus:border-orange-500" />
                                    <button type="submit" disabled={!inputValue.trim() || isLoading} className="absolute right-2 p-2 text-white bg-orange-500 rounded-lg disabled:opacity-50"><Send size={14} /></button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-3 space-y-4 animate-in slide-in-from-bottom-6">
                                <div className="flex items-center justify-center gap-1 h-10">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                        <div
                                            key={i}
                                            className="w-1 rounded-full voice-bar"
                                            style={{
                                                height: '32px',
                                                background: callPhase === 'listening' ? '#22c55e' : callPhase === 'speaking' ? '#3b82f6' : callPhase === 'processing' ? '#f59e0b' : '#6b7280',
                                                animationDelay: `${i * 0.08}s`,
                                                animationPlayState: (callPhase === 'listening' || callPhase === 'speaking') ? 'running' : 'paused',
                                                transform: (callPhase === 'listening' || callPhase === 'speaking') ? undefined : 'scaleY(0.3)'
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-mono uppercase font-semibold ${callStatusColor()}`}>{callStatusLabel()}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">{t.callActiveDesc}</p>
                                </div>
                                <div className="flex items-center gap-5">
                                    <button onClick={toggleMute} className={`p-3 rounded-full border transition-all ${isMuted ? 'bg-zinc-800 border-red-500/40 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-orange-500/40'}`}>
                                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                    </button>
                                    <button onClick={endCall} className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-95 transition-all">
                                        <PhoneOff size={22} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </footer>
                </div>
            )}
        </div>
    );
}
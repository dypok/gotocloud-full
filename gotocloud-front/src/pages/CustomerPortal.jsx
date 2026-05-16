import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Phone, MessageSquare, Loader2, PhoneOff, Volume2 } from 'lucide-react';
import { chatService } from '../services/api';

export default function CustomerPortal() {
    const [messages, setMessages] = useState([
        { id: '1', role: 'agent', content: '¡Hola! Soy el Asistente IA de GoToCloud. ¿En qué puedo ayudarte hoy con tu infraestructura de Azure?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- NUEVOS ESTADOS PARA FASE 3: VOICE UI ---
    const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [voiceStatus, setVoiceStatus] = useState('conectando'); // 'conectando' | 'escuchando' | 'hablando'

    const messagesEndRef = useRef(null);

    useEffect(() => {
        let currentSession = localStorage.getItem('anon_session_id');
        if (!currentSession) {
            currentSession = crypto.randomUUID();
            localStorage.setItem('anon_session_id', currentSession);
        }
        setSessionId(currentSession);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, isVoiceModeActive]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue;
        const newUserMsg = { id: Date.now().toString(), role: 'user', content: userText };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const data = await chatService.sendMessage(sessionId, userText);
            const agentMsg = { id: Date.now().toString(), role: 'agent', content: data.response };
            setMessages((prev) => [...prev, agentMsg]);
        } catch (error) {
            const errorMsg = { id: Date.now().toString(), role: 'agent', content: "Error de conexión." };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- LÓGICA DE FASE 3: VOICE UI ---
    const startVoiceSession = async () => {
        try {
            // 1. Pedir permisos reales del navegador (Suma muchos puntos en demo)
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // 2. Activar la UI de llamada
            setIsVoiceModeActive(true);
            setVoiceStatus('conectando');

            // Simular tiempo de conexión a Gemini Live
            setTimeout(() => {
                setVoiceStatus('escuchando');
                const systemMsg = { id: Date.now().toString(), role: 'agent', content: "🎤 [Modo Voz Activado] - Habla ahora..." };
                setMessages((prev) => [...prev, systemMsg]);
            }, 1500);

        } catch (error) {
            console.error("Permiso de micrófono denegado", error);
            alert("Necesitas dar permisos de micrófono para usar esta función.");
        }
    };

    const endVoiceSession = () => {
        setIsVoiceModeActive(false);
        setVoiceStatus('conectando');
        const systemMsg = { id: Date.now().toString(), role: 'agent', content: "📞 [Llamada Finalizada]" };
        setMessages((prev) => [...prev, systemMsg]);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] md:min-h-screen bg-zinc-950 md:p-4 font-sans text-zinc-100">

            <div className="w-full h-[100dvh] md:h-[85vh] md:max-w-2xl bg-zinc-900 md:rounded-2xl shadow-none md:shadow-2xl border-0 md:border border-zinc-800 overflow-hidden flex flex-col transition-all duration-300">

                {/* Header del Chat */}
                <header className="bg-zinc-950 border-b border-zinc-800 p-3 md:p-4 flex justify-between items-center pt-16 md:pt-4 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-colors ${isVoiceModeActive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}>
                            {isVoiceModeActive ? <Volume2 size={16} /> : <MessageSquare size={16} />}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm md:text-base font-semibold text-zinc-100 truncate">
                                {isVoiceModeActive ? 'Llamada Activa...' : 'Soporte GoToCloud'}
                            </h2>
                            <p className="text-[10px] md:text-xs text-orange-400 font-medium truncate">Customer Agent (GPT-4o)</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        <span className="flex items-center gap-1.5 text-[10px] md:text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isVoiceModeActive ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                            ID: {sessionId?.split('-')[0]}
                        </span>
                    </div>
                </header>

                {/* Área de Mensajes */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-zinc-950/40">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-3 md:p-3.5 text-sm leading-relaxed break-words ${msg.role === 'user'
                                ? 'bg-orange-500 text-white rounded-br-none shadow-md shadow-orange-500/10'
                                : 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-bl-none shadow-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-orange-500" />
                                <span className="text-xs">Agent 1 procesando...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                {/* CONTROLES INFERIORES: Lógica condicional entre Chat y Llamada */}
                <footer className={`border-t border-zinc-800 p-3 md:p-4 pb-6 md:pb-4 transition-all duration-300 ${isVoiceModeActive ? 'bg-zinc-900' : 'bg-zinc-950'}`}>

                    {!isVoiceModeActive ? (
                        /* --- MODO TEXTO (Predeterminado) --- */
                        <>
                            <div className="grid grid-cols-2 gap-2 mb-3 md:mb-4">
                                <button
                                    onClick={startVoiceSession}
                                    className="flex items-center justify-center gap-1.5 px-2 md:px-3 py-2 text-xs md:text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-white rounded-xl border border-zinc-800 transition-all hover:border-orange-500/40"
                                >
                                    <Mic size={14} className="text-orange-500 flex-shrink-0" />
                                    <span className="truncate">Soporte Voz</span>
                                </button>
                                <button className="flex items-center justify-center gap-1.5 px-2 md:px-3 py-2 text-xs md:text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-white rounded-xl border border-zinc-800 transition-all hover:border-green-500/40">
                                    <Phone size={14} className="text-green-500 flex-shrink-0" />
                                    <span className="truncate">WhatsApp</span>
                                </button>
                            </div>

                            <form onSubmit={handleSendMessage} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Mensaje..."
                                    disabled={isLoading}
                                    className="w-full pl-4 pr-12 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm md:text-base disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-2 p-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* --- MODO LLAMADA DE VOZ (Fase 3 UI) --- */
                        <div className="flex flex-col items-center justify-center py-4 space-y-6 animate-in slide-in-from-bottom-4 duration-300">

                            {/* Indicador visual de voz (Ondas simuladas) */}
                            <div className="flex items-center justify-center gap-1.5 h-12">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 bg-orange-500 rounded-full transition-all duration-300 ease-in-out ${voiceStatus === 'escuchando' ? 'animate-pulse' : 'h-2 opacity-50'
                                            }`}
                                        style={{
                                            height: voiceStatus === 'escuchando' ? `${Math.random() * 24 + 12}px` : '8px',
                                            animationDelay: `${i * 0.1}s`
                                        }}
                                    ></div>
                                ))}
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-medium text-orange-400 capitalize">
                                    {voiceStatus === 'conectando' ? 'Conectando a Gemini Live...' : 'La IA te escucha...'}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">Hable con claridad hacia el micrófono</p>
                            </div>

                            {/* Botones de control de llamada */}
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setIsMicMuted(!isMicMuted)}
                                    className={`p-4 rounded-full border transition-all ${isMicMuted
                                        ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                        : 'bg-zinc-800 border-orange-500/30 text-orange-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    <Mic size={24} className={isMicMuted ? 'opacity-50' : ''} />
                                </button>

                                <button
                                    onClick={endVoiceSession}
                                    className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-transform hover:scale-110 flex items-center justify-center"
                                >
                                    <PhoneOff size={24} />
                                </button>
                            </div>

                        </div>
                    )}

                </footer>
            </div>
        </div>
    );
}
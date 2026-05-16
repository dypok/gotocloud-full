import React, { useState } from 'react';
import {
    Activity, AlertTriangle, Target, TrendingUp, ShieldAlert,
    Cpu, X, Sparkles, Send, BarChart3
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    BarChart, Bar, Cell
} from 'recharts';

// --- MOCKS DE DATOS PARA LOS GRÁFICOS ---
const incidentTrends = [
    { time: '08:00', incidentes: 2 },
    { time: '10:00', incidentes: 5 },
    { time: '12:00', incidentes: 4 },
    { time: '14:00', incidentes: 9 },
    { time: '16:00', incidentes: 15 },
];

const leadIndustries = [
    { name: 'Finanzas', leads: 45 },
    { name: 'Retail', leads: 25 },
    { name: 'Salud', leads: 20 },
    { name: 'Logística', leads: 10 },
];
const BAR_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

export default function InternalDashboard() {
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [inputQuery, setInputQuery] = useState('');
    const [queries, setQueries] = useState([
        {
            id: '1',
            question: 'Resume los incidentes críticos actuales.',
            answer: 'Hay 3 incidentes con Riesgo SLA Alto. El más urgente es un fallo de acceso a VM en Azure.',
            type: 'operativo'
        }
    ]);

    const handleSendQuery = (e, customText = null) => {
        if (e) e.preventDefault();
        const textToSend = customText || inputQuery;
        if (!textToSend.trim()) return;

        setQueries((prev) => [...prev, {
            id: Date.now().toString(),
            question: textToSend,
            answer: 'Procesando analíticas de PostgreSQL... Generando insight con Agent 2.',
            type: 'general'
        }]);
        setInputQuery('');
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-6 lg:p-8 font-sans pt-20 md:pt-6 relative overflow-x-hidden">

            {/* HEADER DEL DASHBOARD */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 border-b border-zinc-800 pb-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="text-orange-500" size={24} />
                        GoToCloud <span className="text-zinc-400 font-light">Intelligence</span>
                    </h1>
                    <p className="text-xs md:text-sm text-zinc-400 mt-1">Visión General Operativa y Comercial</p>
                </div>
            </header>

            {/* MÉTRICAS PRINCIPALES (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {[
                    { title: 'Incidentes Activos', value: '24', icon: Activity, color: 'text-zinc-300' },
                    { title: 'Riesgo SLA (Alto)', value: '3', icon: AlertTriangle, color: 'text-red-400' },
                    { title: 'Sentimiento General', value: 'Neutral/Positivo', icon: TrendingUp, color: 'text-zinc-300' },
                    { title: 'Leads Detectados', value: '7', icon: Target, color: 'text-orange-500' },
                ].map((metric, idx) => (
                    <div key={idx} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-start justify-between">
                        <div>
                            <p className="text-xs md:text-sm text-zinc-400 mb-1">{metric.title}</p>
                            <h3 className={`text-xl md:text-2xl font-bold ${metric.color}`}>{metric.value}</h3>
                        </div>
                        <div className={`p-2 bg-zinc-950 rounded-lg ${metric.color}`}>
                            <metric.icon size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {/* SECCIÓN DE GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">

                {/* Gráfico 1: Tendencia Operativa */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col h-72">
                    <div className="bg-zinc-800/50 p-3 md:p-4 border-b border-zinc-800 flex items-center gap-2">
                        <Activity size={16} className="text-zinc-400" />
                        <h2 className="text-sm md:text-base font-semibold text-zinc-100">Tendencia de Incidentes</h2>
                    </div>
                    <div className="p-4 flex-1 w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={incidentTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                                    itemStyle={{ color: '#f97316' }}
                                />
                                <Area type="monotone" dataKey="incidentes" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico 2: Distribución de Leads */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col h-72">
                    <div className="bg-zinc-800/50 p-3 md:p-4 border-b border-zinc-800 flex items-center gap-2">
                        <Target size={16} className="text-orange-500" />
                        <h2 className="text-sm md:text-base font-semibold text-zinc-100">Oportunidades por Industria</h2>
                    </div>
                    <div className="p-4 flex-1 w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={leadIndustries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                                />
                                <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                                    {leadIndustries.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* GRID INFERIOR: Alertas y Tabla */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-20 md:mb-0">
                <div className="lg:col-span-1 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="bg-zinc-800/50 p-3 md:p-4 border-b border-zinc-800 flex items-center gap-2">
                        <ShieldAlert size={16} className="text-zinc-400" />
                        <h2 className="text-sm md:text-base font-semibold text-zinc-100">Atención Requerida</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-200">Acceso a VM Azure</span>
                                <span className="text-red-400 text-xs px-2 py-0.5 bg-red-400/10 rounded">High</span>
                            </div>
                            <span className="text-xs text-zinc-500">ID: a7b2 • Hace 12 min</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="bg-zinc-800/50 p-3 md:p-4 border-b border-zinc-800 flex items-center gap-2">
                        <Target size={16} className="text-orange-500" />
                        <h2 className="text-sm md:text-base font-semibold text-zinc-100">Pipeline de Leads (En vivo)</h2>
                    </div>
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-xs md:text-sm whitespace-nowrap min-w-[500px]">
                            <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
                                <tr>
                                    <th className="p-3 md:p-4 font-medium">Categoría</th>
                                    <th className="p-3 md:p-4 font-medium">Score</th>
                                    <th className="p-3 md:p-4 font-medium">Acción Recomendada</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                <tr className="hover:bg-zinc-800/30">
                                    <td className="p-3 md:p-4"><span className="text-orange-400 bg-orange-500/10 px-2 py-1 rounded text-xs">Modernization</span></td>
                                    <td className="p-3 md:p-4 text-zinc-200 font-medium">85</td>
                                    <td className="p-3 md:p-4 text-zinc-400">Agendar demo técnica</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* BOTÓN FLOTANTE (FAB) PARA ABRIR EL MODAL IA */}
            <button
                onClick={() => setIsAiModalOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-transform hover:scale-105 z-40 flex items-center gap-2 group"
            >
                <Sparkles size={24} />
                <span className="hidden md:block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-medium text-sm">
                    Preguntar a la IA
                </span>
            </button>

            {/* MODAL EMERGENTE: Consola de Intelligence Agent */}
            {isAiModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl h-[90vh] sm:h-[80vh] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">

                        <header className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-center text-orange-500">
                                    <Cpu size={18} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-zinc-100">Intelligence Agent (Agent 2)</h2>
                                    <p className="text-xs text-zinc-400">Consultando PostgreSQL via LangChain</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAiModalOpen(false)} className="text-zinc-500 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors">
                                <X size={24} />
                            </button>
                        </header>

                        <main className="flex-1 overflow-y-auto p-4 space-y-6">
                            {queries.map((q) => (
                                <div key={q.id} className="space-y-3">
                                    <div className="flex justify-end">
                                        <div className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-2xl rounded-tr-none p-3 text-sm max-w-[85%]">{q.question}</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1"><Sparkles size={12} /></div>
                                        <div className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-2xl rounded-tl-none p-3.5 text-sm max-w-[85%] leading-relaxed">{q.answer}</div>
                                    </div>
                                </div>
                            ))}
                        </main>

                        <footer className="bg-zinc-950 border-t border-zinc-800 p-4">
                            <form onSubmit={handleSendQuery} className="relative flex items-center">
                                <input type="text" value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} placeholder="Interroga a la base de datos..." className="w-full pl-4 pr-12 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500" />
                                <button type="submit" disabled={!inputQuery.trim()} className="absolute right-2 p-2 text-white bg-orange-500 rounded-lg disabled:opacity-30"><Send size={16} /></button>
                            </form>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
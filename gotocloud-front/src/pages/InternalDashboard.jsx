import React, { useState, useEffect } from 'react';
import {
    Activity, AlertTriangle, Target, TrendingUp, ShieldAlert,
    Cpu, X, Sparkles, Send, BarChart3
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    BarChart, Bar, Cell
} from 'recharts';

import { useLanguage } from '../context/LanguageContext';

const TRANSLATIONS = {
    es: {
        subtitle: "Métricas Operativas y de Negocio (Admin)",
        kpi1: "Casos Activos",
        kpi2: "Riesgo SLA Crítico",
        kpi3: "Sentimiento Promedio", kpi3Val: "Positivo",
        kpi4: "Leads Capturados",
        aiSummaryTitle: "Resumen Ejecutivo IA",
        aiOpLabel: "Estado Operativo:", aiOpText: "Pico de latencia detectado en acceso a VMs durante la última hora. Logs recolectados y equipo N2 notificado.",
        aiComLabel: "Inteligencia de Negocio:", aiComText: "Fuerte interés en modernización de infraestructura desde el sector financiero (45 leads). Se sugiere campaña de retargeting.",
        chart1: "Volumen de Incidentes",
        chart2: "Leads por Sector",
        ind1: "Finanzas", ind2: "Retail", ind3: "Salud", ind4: "Logística",
        alertsTitle: "Monitor de Alertas",
        alertsCrit: "3 Críticas",
        alert1Title: "Fallo de acceso VM Azure", alert1Time: "Hace 12 min", alert1Action: "Asignar",
        alert2Title: "Caída pipeline CI/CD", alert2Time: "Hace 45 min", alert2Action: "Asignar",
        tableTitle: "Gestión de Oportunidades", tableExport: "Descargar CSV",
        th1: "Categoría", th2: "Empresa", th3: "Score", th4: "Sugerencia IA",
        tdAction1: "Programar demo", tdAction2: "Enviar Whitepaper",
        fabText: "Consultar IA",
        modalSubtitle: "Conectado a PostgreSQL mediante LangChain",
        modalPill1: "Estado general de hoy", modalPill2: "Análisis de leads",
        modalPlaceholder: "Haz una consulta a la base de datos...",
        initialQ: "Genera un reporte rápido de los incidentes actuales.",
        initialA: "Actualmente existen 3 casos con alto riesgo de incumplir el SLA. La prioridad máxima es restaurar el acceso a las máquinas virtuales en Azure.",
        aiProcessing: "Analizando telemetría... Generando respuesta."
    },
    pt: {
        subtitle: "Métricas Operacionais e de Negócios (Admin)",
        kpi1: "Casos Ativos",
        kpi2: "Risco SLA Crítico",
        kpi3: "Sentimento Médio", kpi3Val: "Positivo",
        kpi4: "Leads Capturados",
        aiSummaryTitle: "Resumo Executivo de IA",
        aiOpLabel: "Status Operacional:", aiOpText: "Pico de latência detectado no acesso a VMs na última hora. Logs coletados e equipe N2 notificada.",
        aiComLabel: "Inteligência de Mercado:", aiComText: "Forte interesse em modernização de infraestrutura do setor financeiro (45 leads). Sugere-se campanha de retargeting.",
        chart1: "Volume de Incidentes",
        chart2: "Leads por Setor",
        ind1: "Finanças", ind2: "Varejo", ind3: "Saúde", ind4: "Logística",
        alertsTitle: "Monitor de Alertas",
        alertsCrit: "3 Críticas",
        alert1Title: "Falha de acesso VM Azure", alert1Time: "Há 12 min", alert1Action: "Atribuir",
        alert2Title: "Queda no pipeline CI/CD", alert2Time: "Há 45 min", alert2Action: "Atribuir",
        tableTitle: "Gestão de Oportunidades", tableExport: "Baixar CSV",
        th1: "Categoria", th2: "Empresa", th3: "Score", th4: "Sugestão da IA",
        tdAction1: "Agendar demo", tdAction2: "Enviar Whitepaper",
        fabText: "Consultar IA",
        modalSubtitle: "Conectado ao PostgreSQL via LangChain",
        modalPill1: "Status geral de hoje", modalPill2: "Análise de leads",
        modalPlaceholder: "Faça uma consulta ao banco de dados...",
        initialQ: "Gere um relatório rápido dos incidentes atuais.",
        initialA: "Atualmente existem 3 casos com alto risco de violação de SLA. A prioridade máxima é restaurar o acesso às máquinas virtuais no Azure.",
        aiProcessing: "Analisando telemetria... Gerando resposta."
    },
    en: {
        subtitle: "Operational & Business Metrics (Admin)",
        kpi1: "Active Cases",
        kpi2: "Critical SLA Risk",
        kpi3: "Average Sentiment", kpi3Val: "Positive",
        kpi4: "Captured Leads",
        aiSummaryTitle: "AI Executive Summary",
        aiOpLabel: "Operational Status:", aiOpText: "Latency spike detected in VM access over the last hour. Logs gathered and L2 team notified.",
        aiComLabel: "Business Intelligence:", aiComText: "Strong interest in infrastructure modernization from the financial sector (45 leads). Retargeting campaign suggested.",
        chart1: "Incident Volume",
        chart2: "Leads by Sector",
        ind1: "Finance", ind2: "Retail", ind3: "Healthcare", ind4: "Logistics",
        alertsTitle: "Alert Monitor",
        alertsCrit: "3 Critical",
        alert1Title: "Azure VM access failure", alert1Time: "12 mins ago", alert1Action: "Assign",
        alert2Title: "CI/CD pipeline crash", alert2Time: "45 mins ago", alert2Action: "Assign",
        tableTitle: "Opportunity Management", tableExport: "Download CSV",
        th1: "Category", th2: "Company", th3: "Score", th4: "AI Suggestion",
        tdAction1: "Schedule demo", tdAction2: "Send Whitepaper",
        fabText: "Query AI",
        modalSubtitle: "Connected to PostgreSQL via LangChain",
        modalPill1: "Today's overall status", modalPill2: "Lead analysis",
        modalPlaceholder: "Query the database...",
        initialQ: "Generate a quick report on the current incidents.",
        initialA: "There are currently 3 cases at high risk of breaching SLA. Top priority is restoring virtual machine access in Azure.",
        aiProcessing: "Analyzing telemetry... Generating response."
    }
};

const incidentTrends = [
    { time: '08:00', incidentes: 2 },
    { time: '10:00', incidentes: 5 },
    { time: '12:00', incidentes: 4 },
    { time: '14:00', incidentes: 9 },
    { time: '16:00', incidentes: 15 },
];
const BAR_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

export default function InternalDashboard() {
    const { lang } = useLanguage();
    const t = TRANSLATIONS[lang] || TRANSLATIONS['es'];

    const [isLoading, setIsLoading] = useState(true);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [inputQuery, setInputQuery] = useState('');
    const [queries, setQueries] = useState([]);

    const leadIndustries = [
        { name: t.ind1, leads: 45 },
        { name: t.ind2, leads: 25 },
        { name: t.ind3, leads: 20 },
        { name: t.ind4, leads: 10 },
    ];

    useEffect(() => {
        setQueries([{ id: '1', question: t.initialQ, answer: t.initialA, type: 'operativo' }]);
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, [lang]);

    const handleSendQuery = (e, customText = null) => {
        if (e) e.preventDefault();
        const textToSend = customText || inputQuery;
        if (!textToSend.trim()) return;

        setQueries((prev) => [...prev, {
            id: Date.now().toString(),
            question: textToSend,
            answer: t.aiProcessing,
            type: 'general'
        }]);
        setInputQuery('');
    };

    return (
        /* CORRECCIÓN: Separamos px y pb explícitos para que NO anulen el pt-28 o pt-32 en resoluciones grandes */
        <div className="min-h-screen bg-zinc-950 text-zinc-50 px-4 pb-4 pt-28 md:px-6 md:pb-6 md:pt-32 lg:px-8 lg:pb-8 lg:pt-32 font-sans relative overflow-x-hidden">

            <header className="w-full flex flex-col justify-start items-start gap-1 mb-8 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="text-orange-500" size={24} />
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                        GoToCloud <span className="text-zinc-400 font-light">Intelligence</span>
                    </h1>
                </div>
                <p className="text-xs md:text-sm text-zinc-400">{t.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {isLoading ? (
                    Array(4).fill(0).map((_, idx) => (
                        <div key={`skel-kpi-${idx}`} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-start justify-between animate-pulse">
                            <div className="space-y-3 w-full">
                                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                                <div className="h-8 bg-zinc-700 rounded w-1/3"></div>
                            </div>
                            <div className="w-10 h-10 bg-zinc-800 rounded-lg flex-shrink-0"></div>
                        </div>
                    ))
                ) : (
                    [
                        { title: t.kpi1, value: '24', icon: Activity, color: 'text-zinc-300' },
                        { title: t.kpi2, value: '3', icon: AlertTriangle, color: 'text-red-400' },
                        { title: t.kpi3, value: t.kpi3Val, icon: TrendingUp, color: 'text-zinc-300' },
                        { title: t.kpi4, value: '7', icon: Target, color: 'text-orange-500' },
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
                    ))
                )}
            </div>

            <div className="mb-6 md:mb-8 bg-gradient-to-r from-zinc-900 to-zinc-900/50 rounded-xl border border-zinc-800 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 flex-shrink-0 mt-1">
                        <Sparkles size={20} className="text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 mb-1">
                            {t.aiSummaryTitle}
                            <span className="text-[9px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">Live</span>
                        </h3>
                        {isLoading ? (
                            <div className="space-y-2 mt-2 animate-pulse">
                                <div className="h-3 bg-zinc-800 rounded w-full"></div>
                                <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-300 leading-relaxed">
                                <span className="font-medium text-orange-400">{t.aiOpLabel}</span> {t.aiOpText}
                                <span className="font-medium text-blue-400 ml-2">{t.aiComLabel}</span> {t.aiComText}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col h-72">
                    <div className="bg-zinc-800/50 p-3 md:p-4 border-b border-zinc-800 flex items-center gap-2">
                        <Activity size={16} className="text-zinc-400" />
                        <h2 className="text-sm md:text-base font-semibold text-zinc-100">{t.chart1}</h2>
                    </div>
                    <div className="p-4 flex-1 w-full h-full">
                        {isLoading ? (
                            <div className="w-full h-full bg-zinc-800/50 rounded-lg animate-pulse flex items-end justify-between pb-2 px-4 gap-2">
                                <div className="w-1/6 bg-zinc-700/50 rounded-t h-[30%]"></div>
                                <div className="w-1/6 bg-zinc-700/50 rounded-t h-[50%]"></div>
                                <div className="w-1/6 bg-zinc-700/50 rounded-t h-[40%]"></div>
                                <div className="w-1/6 bg-zinc-700/50 rounded-t h-[80%]"></div>
                                <div className="w-1/6 bg-zinc-700/50 rounded-t h-[100%]"></div>
                            </div>
                        ) : (
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
                                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }} itemStyle={{ color: '#f97316' }} />
                                    <Area type="monotone" dataKey="incidentes" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col h-72">
                    <div className="bg-zinc-800/50 p-3 md:p-4 border-b border-zinc-800 flex items-center gap-2">
                        <Target size={16} className="text-orange-500" />
                        <h2 className="text-sm md:text-base font-semibold text-zinc-100">{t.chart2}</h2>
                    </div>
                    <div className="p-4 flex-1 w-full h-full">
                        {isLoading ? (
                            <div className="w-full h-full flex items-end justify-around pb-2 px-2 gap-4 animate-pulse">
                                <div className="w-1/4 bg-zinc-800 rounded-t h-[90%]"></div>
                                <div className="w-1/4 bg-zinc-800 rounded-t h-[60%]"></div>
                                <div className="w-1/4 bg-zinc-800 rounded-t h-[40%]"></div>
                                <div className="w-1/4 bg-zinc-800 rounded-t h-[20%]"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leadIndustries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }} />
                                    <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                                        {leadIndustries.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-20 md:mb-0">
                <div className="lg:col-span-1 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
                    <div className="bg-zinc-800/50 p-3 md:p-4 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={16} className="text-zinc-400" />
                            <h2 className="text-sm md:text-base font-semibold text-zinc-100">{t.alertsTitle}</h2>
                        </div>
                        {!isLoading && <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">{t.alertsCrit}</span>}
                    </div>

                    <div className="p-0 flex-1 overflow-y-auto max-h-[300px]">
                        {isLoading ? (
                            <div className="p-4 space-y-4 animate-pulse">
                                <div className="h-16 bg-zinc-800/50 rounded-lg w-full"></div>
                                <div className="h-16 bg-zinc-800/50 rounded-lg w-full"></div>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800/50">
                                <div className="p-4 hover:bg-zinc-800/20 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-200">{t.alert1Title}</h4>
                                            <p className="text-xs text-zinc-500 mt-0.5">ID: a7b2 • {t.alert1Time}</p>
                                        </div>
                                        <span className="text-red-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-400/10 rounded">High</span>
                                    </div>
                                    <button className="w-full mt-2 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-950 border border-zinc-800 rounded hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all opacity-0 group-hover:opacity-100">
                                        {t.alert1Action}
                                    </button>
                                </div>

                                <div className="p-4 hover:bg-zinc-800/20 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-200">{t.alert2Title}</h4>
                                            <p className="text-xs text-zinc-500 mt-0.5">ID: 9f4c • {t.alert2Time}</p>
                                        </div>
                                        <span className="text-orange-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-400/10 rounded">Medium</span>
                                    </div>
                                    <button className="w-full mt-2 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-950 border border-zinc-800 rounded hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all opacity-0 group-hover:opacity-100">
                                        {t.alert2Action}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
                    <div className="bg-zinc-800/50 p-3 md:p-4 border-b border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Target size={16} className="text-orange-500" />
                            <h2 className="text-sm md:text-base font-semibold text-zinc-100">{t.tableTitle}</h2>
                        </div>
                        {!isLoading && <button className="text-xs text-zinc-400 hover:text-orange-400 transition-colors">{t.tableExport}</button>}
                    </div>

                    <div className="p-0 overflow-x-auto w-full">
                        {isLoading ? (
                            <div className="p-4 space-y-4 animate-pulse">
                                <div className="h-8 bg-zinc-800/50 rounded w-full"></div>
                                <div className="h-8 bg-zinc-800/50 rounded w-full"></div>
                                <div className="h-8 bg-zinc-800/50 rounded w-full"></div>
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs md:text-sm whitespace-nowrap min-w-[500px]">
                                <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
                                    <tr>
                                        <th className="p-3 md:p-4 font-medium">{t.th1}</th>
                                        <th className="p-3 md:p-4 font-medium">{t.th2}</th>
                                        <th className="p-3 md:p-4 font-medium">{t.th3}</th>
                                        <th className="p-3 md:p-4 font-medium">{t.th4}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    <tr className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-3 md:p-4"><span className="text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 text-[10px] uppercase font-bold tracking-wider">Modernization</span></td>
                                        <td className="p-3 md:p-4 text-zinc-300">Financiera XYZ</td>
                                        <td className="p-3 md:p-4 text-zinc-200 font-medium">85/100</td>
                                        <td className="p-3 md:p-4 text-zinc-400">{t.tdAction1}</td>
                                    </tr>
                                    <tr className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-3 md:p-4"><span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 text-[10px] uppercase font-bold tracking-wider">Security</span></td>
                                        <td className="p-3 md:p-4 text-zinc-300">Retail Corp</td>
                                        <td className="p-3 md:p-4 text-zinc-200 font-medium">60/100</td>
                                        <td className="p-3 md:p-4 text-zinc-400">{t.tdAction2}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsAiModalOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-transform hover:scale-105 z-40 flex items-center gap-2 group"
            >
                <Sparkles size={24} />
                <span className="hidden md:block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-medium text-sm">
                    {t.fabText}
                </span>
            </button>

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
                                    <p className="text-xs text-zinc-400">{t.modalSubtitle}</p>
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
                            <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
                                <button onClick={() => handleSendQuery(null, t.modalPill1)} className="whitespace-nowrap text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:border-orange-500/50">
                                    {t.modalPill1}
                                </button>
                                <button onClick={() => handleSendQuery(null, t.modalPill2)} className="whitespace-nowrap text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:border-orange-500/50">
                                    {t.modalPill2}
                                </button>
                            </div>
                            <form onSubmit={handleSendQuery} className="relative flex items-center">
                                <input type="text" value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} placeholder={t.modalPlaceholder} className="w-full pl-4 pr-12 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500" />
                                <button type="submit" disabled={!inputQuery.trim()} className="absolute right-2 p-2 text-white bg-orange-500 rounded-lg disabled:opacity-30"><Send size={16} /></button>
                            </form>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
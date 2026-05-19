import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    AlertCircle, 
    TrendingUp, 
    Users, 
    MessageSquare, 
    Search, 
    Download, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    CheckCircle2, 
    ChevronRight,
    Sparkles,
    Send,
    X,
    Filter,
    Mic
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { dashboardService } from '../services/api';

const TRANSLATIONS = {
    es: {
        title: "Centro de Inteligencia GoToCloud",
        subtitle: "Métricas Operacionales y de Negocios (Admin)",
        overview: "Vista General", incidents: "Incidentes", leads: "Oportunidades",
        activeIncidents: "Casos Activos",
        kpi1: "Casos Ativos",
        kpi2: "Riesgo SLA Crítico",
        kpi3: "Sentimiento Medio", kpi3Val: "Positivo",
        kpi4: "Leads Capturados",
        aiSummaryTitle: "Resumen Ejecutivo de IA",
        aiOpLabel: "Estado Operativo:", aiOpText: "Pico de latencia detectado en acceso a VMs en la última hora. Logs recolectados y equipo N2 notificado.",
        aiComLabel: "Inteligencia de Negocio:", aiComText: "Fuerte interés en modernización de infraestructura del sector financiero (45 leads). Se sugiere campaña de retargeting.",
        chart1: "Volumen de Incidentes",
        chart2: "Leads por Sector",
        ind1: "Finanzas", ind2: "Retail", ind3: "Salud", ind4: "Logística",
        alertsTitle: "Monitor de Alertas",
        alertsCrit: "3 Críticas",
        alert1Title: "Fallo de acceso VM Gemini", alert1Time: "Hace 12 min", alert1Action: "Asignar",
        alert2Title: "Caída pipeline CI/CD", alert2Time: "Hace 45 min", alert2Action: "Asignar",
        tableTitle: "Gestión de Oportunidades", tableExport: "Descargar CSV",
        th1: "Categoría", th2: "Empresa", th3: "Score", th4: "Sugerencia IA",
        tdAction1: "Programar demo", tdAction2: "Enviar Whitepaper",
        fabText: "Consultar IA",
        modalSubtitle: "Conectado a PostgreSQL mediante Gemini AI",
        modalPill1: "Estado general de hoy", modalPill2: "Análisis de leads",
        modalPlaceholder: "Haz una consulta a la base de datos...",
        initialQ: "Genera un reporte rápido de los incidentes actuales.",
        initialA: "Actualmente existen 3 casos con alto riesgo de incumplir el SLA. La prioridad máxima es restaurar el acceso a las máquinas virtuales en Gemini Cloud.",
        aiProcessing: "Analizando telemetría... Generando respuesta."
    },
    pt: {
        title: "Centro de Inteligência GoToCloud",
        subtitle: "Métricas Operacionais e de Negócios (Admin)",
        overview: "Visão Geral", incidents: "Incidentes", leads: "Oportunidades",
        activeIncidents: "Incidentes Ativos",
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
        alert1Title: "Falha de acesso VM Gemini", alert1Time: "Há 12 min", alert1Action: "Atribuir",
        alert2Title: "Queda no pipeline CI/CD", alert2Time: "Há 45 min", alert2Action: "Atribuir",
        tableTitle: "Gestão de Oportunidades", tableExport: "Baixar CSV",
        th1: "Categoria", th2: "Empresa", th3: "Score", th4: "Sugestão da IA",
        tdAction1: "Agendar demo", tdAction2: "Enviar Whitepaper",
        fabText: "Consultar IA",
        modalSubtitle: "Conectado ao PostgreSQL via Gemini AI",
        modalPill1: "Status geral de hoje", modalPill2: "Análise de leads",
        modalPlaceholder: "Faça uma consulta ao banco de dados...",
        initialQ: "Gere um relatório rápido dos incidentes atuais.",
        initialA: "Atualmente existem 3 casos com alto risco de violação de SLA. A prioridade máxima é restaurar o acesso às máquinas virtuais no Gemini Cloud.",
        aiProcessing: "Analisando telemetria... Gerando resposta."
    },
    en: {
        title: "GoToCloud Intelligence Center",
        subtitle: "Operational & Business Metrics (Admin)",
        overview: "Overview", incidents: "Incidents", leads: "Opportunities",
        activeIncidents: "Active Incidents",
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
        alert1Title: "Gemini VM access failure", alert1Time: "12 mins ago", alert1Action: "Assign",
        alert2Title: "CI/CD pipeline crash", alert2Time: "45 mins ago", alert2Action: "Assign",
        tableTitle: "Opportunity Management", tableExport: "Download CSV",
        th1: "Category", th2: "Company", th3: "Score", th4: "AI Suggestion",
        tdAction1: "Schedule demo", tdAction2: "Send Whitepaper",
        fabText: "Query AI",
        modalSubtitle: "Connected to PostgreSQL via Gemini AI",
        modalPill1: "Today's overall status", modalPill2: "Lead analysis",
        modalPlaceholder: "Query the database...",
        initialQ: "Generate a quick report on the current incidents.",
        initialA: "There are currently 3 cases at high risk of breaching SLA. Top priority is restoring virtual machine access in Gemini Cloud.",
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
    const [metrics, setMetrics] = useState(null);
    const [dashboardError, setDashboardError] = useState(null);

    const leadIndustries = [
        { name: t.ind1, leads: 45 },
        { name: t.ind2, leads: 25 },
        { name: t.ind3, leads: 20 },
        { name: t.ind4, leads: 10 },
    ];

    useEffect(() => {
        setQueries([{ id: '1', question: t.initialQ, answer: t.initialA, type: 'operativo' }]);
        const timer = setTimeout(() => setIsLoading(false), 2000);

        const loadDashboardMetrics = async () => {
            try {
                const result = await dashboardService.getMetrics();
                setMetrics(result.kpis || null);
            } catch (error) {
                setDashboardError(error.message || 'No se pudieron cargar las métricas');
            }
        };

        loadDashboardMetrics();
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
            type: 'analizando'
        }]);
        setInputQuery('');

        dashboardService.queryIntelligenceAgent(textToSend)
            .then(data => {
                setQueries(prev => prev.map(q => 
                    q.answer === t.aiProcessing ? { ...q, answer: data.answer, type: 'respuesta' } : q
                ));
            })
            .catch(() => {
                setQueries(prev => prev.map(q => 
                    q.answer === t.aiProcessing ? { ...q, answer: "Error al conectar con la IA de GoToCloud.", type: 'error' } : q
                ));
            });
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        {t.title}
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">{t.subtitle}</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-zinc-500">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        GEMINI_NODE_01: ONLINE
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                        REDIS_SYNC: ACTIVE
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: t.kpi1, value: metrics?.active_incidents || '0', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { label: t.kpi2, value: metrics?.sla_risk || '0', icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' },
                    { label: t.kpi3, value: metrics?.sentiment || t.kpi3Val, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: t.kpi4, value: metrics?.leads || '0', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} p-2 rounded-lg`}>
                                <stat.icon className={stat.color} size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">Real-time</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-zinc-500 text-xs font-medium uppercase tracking-tight">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* AI Summary and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* AI Narrative */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center gap-2">
                        <Sparkles size={16} className="text-orange-500" />
                        <h2 className="text-sm font-bold uppercase tracking-tight">{t.aiSummaryTitle}</h2>
                    </div>
                    <div className="p-6 space-y-6 flex-grow overflow-y-auto custom-scrollbar">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase">
                                <AlertCircle size={14} /> {t.aiOpLabel}
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-orange-500/30 pl-4 py-1">
                                "{t.aiOpText}"
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase">
                                <TrendingUp size={14} /> {t.aiComLabel}
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-blue-500/30 pl-4 py-1">
                                "{t.aiComText}"
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-zinc-950/50 border-t border-zinc-800">
                         <button 
                            onClick={() => setIsAiModalOpen(true)}
                            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            Ver Análisis Completo <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Charts Container */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Incident Trends */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-[300px] flex flex-col">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6">{t.chart1}</h3>
                            <div className="flex-grow">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={incidentTrends}>
                                        <defs>
                                            <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="time" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
                                            itemStyle={{ color: '#f97316' }}
                                        />
                                        <Area type="monotone" dataKey="incidentes" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Industry Leads */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-[300px] flex flex-col">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6">{t.chart2}</h3>
                            <div className="flex-grow">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={leadIndustries} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={10} axisLine={false} tickLine={false} width={70} />
                                        <Tooltip 
                                            cursor={{ fill: '#27272a' }}
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="leads" radius={[0, 4, 4, 0]} barSize={20}>
                                            {leadIndustries.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leads Table and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Real-time Alerts */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm font-bold uppercase tracking-tight">{t.alertsTitle}</h3>
                        <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-bold">{t.alertsCrit}</span>
                    </div>
                    {[
                        { title: t.alert1Title, time: t.alert1Time, action: t.alert1Action, icon: AlertCircle, color: 'text-orange-500' },
                        { title: t.alert2Title, time: t.alert2Time, action: t.alert2Action, icon: Clock, color: 'text-blue-500' },
                        { title: t.alert3Title, time: "Hace 40 min", action: "Contactar", icon: CheckCircle2, color: 'text-emerald-500' },
                    ].map((alert, i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-start gap-4 hover:border-zinc-700 transition-colors cursor-pointer group">
                            <alert.icon className={`${alert.color} mt-1`} size={16} />
                            <div className="flex-grow">
                                <div className="text-sm font-medium mb-1 group-hover:text-white transition-colors">{alert.title}</div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{alert.time}</span>
                                    <span className="text-[10px] text-orange-500 hover:underline font-bold uppercase tracking-wider">{alert.action}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 md:p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/30">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-emerald-500" size={20} />
                            <h2 className="font-bold uppercase tracking-tight">{t.tableTitle}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                                <input type="text" placeholder="Buscar..." className="bg-zinc-900 border border-zinc-700 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-500 w-full md:w-auto" />
                            </div>
                            <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors" title={t.tableExport}>
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
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
                                <div className="p-1.5 bg-orange-500/10 rounded-lg">
                                    <Sparkles size={20} className="text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight uppercase">GoToCloud AI Assistant</h3>
                                    <p className="text-[10px] text-zinc-500 font-mono tracking-widest">{t.modalSubtitle}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
                                <X size={20} />
                            </button>
                        </header>

                        <div className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-8 bg-zinc-900/50">
                            {queries.map((q) => (
                                <div key={q.id} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-end">
                                        <div className="max-w-[85%] bg-zinc-800 px-5 py-3 rounded-2xl rounded-tr-none text-sm shadow-lg border border-zinc-700/50">
                                            {q.question}
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="max-w-[90%] bg-zinc-950 border border-zinc-800 p-6 rounded-2xl rounded-tl-none shadow-2xl">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center">
                                                    <Sparkles size={12} className="text-orange-500" />
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Análisis Generativo</span>
                                            </div>
                                            <div className="text-sm md:text-base text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                                {q.answer}
                                            </div>
                                            <div className="mt-6 flex items-center gap-4 pt-4 border-t border-zinc-800">
                                                <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                                                    <Download size={12} /> Descargar PDF
                                                </button>
                                                <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-blue-500 transition-colors flex items-center gap-1.5">
                                                    <TrendingUp size={12} /> Ver Tendencias
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <footer className="p-4 border-t border-zinc-800 bg-zinc-950">
                            <form onSubmit={handleSendQuery} className="relative max-w-3xl mx-auto flex items-center gap-3">
                                <div className="flex-grow relative">
                                    <input 
                                        type="text" 
                                        value={inputQuery}
                                        onChange={(e) => setInputQuery(e.target.value)}
                                        placeholder={t.modalPlaceholder}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-inner"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <Mic size={16} className="text-zinc-600 hover:text-orange-500 cursor-pointer" />
                                    </div>
                                </div>
                                <button type="submit" className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95">
                                    <Send size={20} />
                                </button>
                            </form>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <button onClick={() => handleSendQuery(null, t.modalPill1)} className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-500 transition-colors">
                                    {t.modalPill1}
                                </button>
                                <button onClick={() => handleSendQuery(null, t.modalPill2)} className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-500 transition-colors">
                                    {t.modalPill2}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}

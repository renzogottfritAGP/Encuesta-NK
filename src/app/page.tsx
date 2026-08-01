"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  FaUser,
  FaWhatsapp,
  FaSeedling,
  FaChartBar,
  FaFileDownload,
  FaUndo,
  FaLock,
  FaSearch,
  FaArrowLeft,
  FaTrashAlt,
  FaSignOutAlt,
  FaUpload,
  FaChevronRight,
  FaStar
} from "react-icons/fa";

// Types
interface Registration {
  id: string;
  name: string;
  phone: string;
  location: string;
  hectares: number | null;
  timestamp: string;
  answers: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
  profile: string;
  areaTrend: string;
  mainIssue: string;
  recommendations: {
    hybrid: string;
    percentage: number;
    score: number;
  }[];
  primaryRecommendation: string;
}

// NK Hybrid Details
const HYBRIDS_INFO = {
  "NK 825 VIPTERA3 CL": {
    name: "NK 825 VIPTERA3 CL",
    tagline: "Primer híbrido CL del portafolio",
    desc: "Alto potencial de rendimiento y amplia adaptabilidad.",
    bulletPoints: [
      "Excelente performance en fechas de siembra temprana y tardía",
      "Excelente agronomía y perfil sanitario, acompañado por la tecnología CL para control de malezas",
      "La mejor tecnología para el control de lepidópteros"
    ]
  },
  "NK 842 VIPTERA3": {
    name: "NK 842 VIPTERA3",
    tagline: "El híbrido de mayor rendimiento y estabilidad del portafolio",
    desc: "En ambas fechas de siembra.",
    bulletPoints: [
      "Destacada performance en fechas de siembra tardía en ciclo corto",
      "Sobresaliente comportamiento frente a quebrado",
      "Excelente perfil sanitario, con la mayor tolerancia a MRCV del portafolio",
      "La mejor tecnología para el control de lepidópteros"
    ]
  },
  "NK 835 VIPTERA3": {
    name: "NK 835 VIPTERA3",
    tagline: "Destacado potencial de rendimiento y excelente agronomía",
    desc: "Con el ciclo más corto del portafolio.",
    bulletPoints: [
      "Excelente comportamiento a vuelco y quebrado",
      "Adaptado a todas las fechas de siembra",
      "La mejor tecnología para el control de lepidópteros"
    ]
  },
  "NK 855 VIPTERA3": {
    name: "NK 855 VIPTERA3",
    tagline: "Adaptabilidad y rendimiento",
    desc: "En todos los ambientes del país.",
    bulletPoints: [
      "Versatilidad en rendimiento en todos los ambientes",
      "Excelente sanidad y agronomía, destacándose por su comportamiento a quebrado",
      "La mejor biotecnología para el control de lepidópteros"
    ]
  }
};

const HYBRIDS = ["NK 825 VIPTERA3 CL", "NK 842 VIPTERA3", "NK 835 VIPTERA3", "NK 855 VIPTERA3"] as const;

// Scoring matrix
const SCORING = {
  P1: [
    // Opción 1: Lote de potencial
    { "NK 825 VIPTERA3 CL": 3, "NK 842 VIPTERA3": 3, "NK 835 VIPTERA3": 1, "NK 855 VIPTERA3": 0 },
    // Opción 2: Medio potencial
    { "NK 825 VIPTERA3 CL": 1, "NK 842 VIPTERA3": 3, "NK 835 VIPTERA3": 3, "NK 855 VIPTERA3": 1 },
    // Opción 3: Bajo potencial
    { "NK 825 VIPTERA3 CL": 0, "NK 842 VIPTERA3": 3, "NK 835 VIPTERA3": 3, "NK 855 VIPTERA3": 3 },
  ],
  P2: [
    // Opción 1: Macollador
    { "NK 825 VIPTERA3 CL": 3, "NK 842 VIPTERA3": 0, "NK 835 VIPTERA3": 0, "NK 855 VIPTERA3": 0 },
    // Opción 2: Prolificidad 2da
    { "NK 825 VIPTERA3 CL": 0, "NK 842 VIPTERA3": 3, "NK 835 VIPTERA3": 0, "NK 855 VIPTERA3": 0 },
    // Opción 3: Espiga flex
    { "NK 825 VIPTERA3 CL": 0, "NK 842 VIPTERA3": 0, "NK 835 VIPTERA3": 3, "NK 855 VIPTERA3": 3 },
  ],
  P3: [
    // Opción 1: Octubre
    { "NK 825 VIPTERA3 CL": 3, "NK 842 VIPTERA3": 3, "NK 835 VIPTERA3": 1, "NK 855 VIPTERA3": 1 },
    // Opción 2: Noviembre
    { "NK 825 VIPTERA3 CL": 3, "NK 842 VIPTERA3": 3, "NK 835 VIPTERA3": 3, "NK 855 VIPTERA3": 3 },
    // Opción 3: Diciembre
    { "NK 825 VIPTERA3 CL": 0, "NK 842 VIPTERA3": 1, "NK 835 VIPTERA3": 3, "NK 855 VIPTERA3": 1 },
  ],
  P4: [
    // Opción 1: Grano
    { "NK 825 VIPTERA3 CL": 3, "NK 842 VIPTERA3": 3, "NK 835 VIPTERA3": 3, "NK 855 VIPTERA3": 3 },
    // Opción 2: Silaje
    { "NK 825 VIPTERA3 CL": 0, "NK 842 VIPTERA3": 3, "NK 835 VIPTERA3": 0, "NK 855 VIPTERA3": 0 },
    // Opción 3: Mixto
    { "NK 825 VIPTERA3 CL": 0, "NK 842 VIPTERA3": 3, "NK 835 VIPTERA3": 0, "NK 855 VIPTERA3": 1 },
  ],
};

interface Question {
  id: string;
  question: string;
  options: { text: string; desc?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "P1",
    question: "¿Cómo son los lotes de tus campos en los que hacés maíz?",
    options: [
      { text: "Lote de potencial" },
      { text: "Medio potencial" },
      { text: "Bajo potencial" },
    ],
  },
  {
    id: "P2",
    question: "¿Qué tipo de prolificidad preferís en un maíz?",
    options: [
      { text: "Macollador" },
      { text: "Prolificidad en 2da espiga" },
      { text: "Espiga flex" },
    ],
  },
  {
    id: "P3",
    question: "¿Qué fecha de siembra solés utilizar?",
    options: [
      { text: "Mediados de octubre (Temprana)" },
      { text: "Noviembre (Intermedia)" },
      { text: "Diciembre (Tardía / 2da)" },
    ],
  },
  {
    id: "P4",
    question: "¿Qué destino tiene tu maíz?",
    options: [
      { text: "Grano" },
      { text: "Silaje" },
      { text: "Mixto" },
    ],
  },
];

// Preguntas de perfil: se registran junto al productor pero no afectan la recomendación de híbrido
const PROFILE_QUESTIONS: Question[] = [
  {
    id: "Q1",
    question: "¿Cómo te definís como productor?",
    options: [
      { text: "Buscador de potencial" },
      { text: "Especulador de mercado" },
      { text: "Equilibrado" },
      { text: "Conservador inteligente" },
    ],
  },
  {
    id: "Q2",
    question: "Tu superficie de maíz este año",
    options: [
      { text: "Crece un 20%" },
      { text: "Se mantiene igual" },
      { text: "Baja un 20%" },
    ],
  },
  {
    id: "Q3",
    question: "¿Cuáles son tus mayores problemáticas hoy en el maíz?",
    options: [
      { text: "Malezas" },
      { text: "Ciclo" },
      { text: "Enfermedades" },
    ],
  },
];

const ALL_QUESTIONS = [...PROFILE_QUESTIONS, ...QUESTIONS];

export default function Home() {
  // App States: 'REGISTER' | 'SURVEY' | 'RESULT' | 'ADMIN'
  const [appState, setAppState] = useState<'REGISTER' | 'SURVEY' | 'RESULT' | 'ADMIN'>('REGISTER');

  // User form details
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    hectares: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Survey answers (0, 1, or 2 for each question)
  const [answers, setAnswers] = useState<Record<string, number>>({
    Q1: -1,
    Q2: -1,
    Q3: -1,
    P1: -1,
    P2: -1,
    P3: -1,
    P4: -1
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Results details for current run
  const [currentResult, setCurrentResult] = useState<{
    recommendations: Registration['recommendations'];
    primary: string;
  } | null>(null);

  // Admin and database state
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminSortKey, setAdminSortKey] = useState<keyof Registration | 'date'>('date');
  const [adminSortDir, setAdminSortDir] = useState<'asc' | 'desc'>('desc');

  // Load database from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("agropac_registros");
    if (stored) {
      try {
        setRegistrations(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing stored registrations", e);
      }
    }
  }, []);

  // Save database to localStorage when updated
  const saveRegistrations = (newList: Registration[]) => {
    setRegistrations(newList);
    localStorage.setItem("agropac_registros", JSON.stringify(newList));
  };

  // Recommendations scoring math
  const calculateRecommendations = (userAnswers: typeof answers) => {
    const points = {
      "NK 825 VIPTERA3 CL": 0,
      "NK 842 VIPTERA3": 0,
      "NK 835 VIPTERA3": 0,
      "NK 855 VIPTERA3": 0,
    };

    // Accumulate scoring
    const p1Score = SCORING.P1[userAnswers.P1];
    const p2Score = SCORING.P2[userAnswers.P2];
    const p3Score = SCORING.P3[userAnswers.P3];
    const p4Score = SCORING.P4[userAnswers.P4];

    HYBRIDS.forEach(h => {
      points[h] += (p1Score?.[h] || 0) + (p2Score?.[h] || 0) + (p3Score?.[h] || 0) + (p4Score?.[h] || 0);
    });

    const sumTotal = Object.values(points).reduce((acc, v) => acc + v, 0);

    const recs = HYBRIDS.map(h => {
      const score = points[h];
      const percentage = sumTotal > 0 ? Math.round((score / sumTotal) * 100) : 0;
      return {
        hybrid: h,
        percentage,
        score
      };
    });

    // Sort descending by percentage
    recs.sort((a, b) => b.percentage - a.percentage);

    return {
      recommendations: recs,
      primary: recs[0].hybrid
    };
  };

  // Form submission / start survey
  const handleStartSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "El nombre y apellido es obligatorio.";
    if (!formData.phone.trim()) errors.phone = "El WhatsApp / Teléfono es obligatorio.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setAnswers({ Q1: -1, Q2: -1, Q3: -1, P1: -1, P2: -1, P3: -1, P4: -1 });
    setCurrentQuestionIndex(0);
    setAppState('SURVEY');
  };

  // Handle single question selection
  const handleSelectOption = (qId: string, index: number) => {
    const updatedAnswers = { ...answers, [qId]: index };
    setAnswers(updatedAnswers);

    // Auto advance with small, organic micro-delay to let user see selection
    setTimeout(() => {
      if (currentQuestionIndex < ALL_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Complete survey & calculate final results
        const finalResults = calculateRecommendations(updatedAnswers);

        // Build new registration object
        const newReg: Registration = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          hectares: formData.hectares ? parseFloat(formData.hectares) : null,
          timestamp: new Date().toISOString(),
          answers: updatedAnswers as Registration['answers'],
          profile: PROFILE_QUESTIONS[0].options[updatedAnswers.Q1]?.text || "",
          areaTrend: PROFILE_QUESTIONS[1].options[updatedAnswers.Q2]?.text || "",
          mainIssue: PROFILE_QUESTIONS[2].options[updatedAnswers.Q3]?.text || "",
          recommendations: finalResults.recommendations,
          primaryRecommendation: finalResults.primary
        };

        // Save
        const newList = [newReg, ...registrations];
        saveRegistrations(newList);

        // Display results
        setCurrentResult({
          recommendations: finalResults.recommendations,
          primary: finalResults.primary
        });
        setAppState('RESULT');
      }
    }, 350);
  };

  // Back navigation in survey
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Admin access validation
  const handleAdminToggle = () => {
    if (appState === 'ADMIN') {
      setAppState('REGISTER');
    } else {
      setShowPasswordModal(true);
      setAdminPassword("");
      setPasswordError("");
    }
  };

  // Discreet admin entry: 5 taps on the logo within 2s opens the password modal
  const logoTapState = useRef({ count: 0, timer: null as ReturnType<typeof setTimeout> | null });
  const handleLogoTap = () => {
    const state = logoTapState.current;
    state.count += 1;
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(() => { state.count = 0; }, 2000);
    if (state.count >= 5) {
      state.count = 0;
      handleAdminToggle();
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "agropac2026") {
      setShowPasswordModal(false);
      setAppState('ADMIN');
    } else {
      setPasswordError("Contraseña incorrecta. Reintentar.");
    }
  };

  // CSV Export with Spanish delimiting and UTF-8 BOM
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }
    const headers = ["Nombre y Apellido", "WhatsApp / Tel", "Localidad / Zona", "Hectáreas Maíz", "Perfil de Productor", "Tendencia de Superficie", "Principal Problemática", "Recomendación Principal", "Porcentaje Coincidencia", "Fecha Registro"];
    const rows = registrations.map((r) => [
      r.name,
      r.phone,
      r.location,
      r.hectares !== null ? r.hectares.toString() : "N/C",
      r.profile || "N/C",
      r.areaTrend || "N/C",
      r.mainIssue || "N/C",
      r.primaryRecommendation,
      `${r.recommendations.find(rec => rec.hybrid === r.primaryRecommendation)?.percentage || 0}%`,
      new Date(r.timestamp).toLocaleString("es-AR"),
    ]);

    // UTF-8 BOM to force Excel to render characters like eñes and tildes properly
    const csvContent = "\uFEFF" + [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `agropac_asistentes_nk_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear data
  const handleResetDatabase = () => {
    if (confirm("¿Estás absolutamente seguro de vaciar TODA la lista de productores inscritos? Esta acción no se puede deshacer.")) {
      saveRegistrations([]);
      alert("Base de datos reiniciada con éxito.");
    }
  };

  // Backup Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          // Merge lists checking for duplicates by ID
          const merged = [...imported];
          registrations.forEach(r => {
            if (!merged.some(m => m.id === r.id)) {
              merged.push(r);
            }
          });
          // Sort merged by timestamp
          merged.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          saveRegistrations(merged);
          alert(`Importación exitosa! Se consolidaron ${imported.length} registros.`);
        } else {
          alert("El archivo no tiene un formato válido de base de datos.");
        }
      } catch (err) {
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registrations, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `agropac_respaldo_${new Date().toISOString().split("T")[0]}.json`);
    dlAnchorElem.click();
  };

  // Admin stats computations
  const stats = useMemo(() => {
    const total = registrations.length;
    const recordsWithHectares = registrations.filter(r => r.hectares !== null && r.hectares > 0);
    const totalHectares = recordsWithHectares.reduce((sum, r) => sum + (r.hectares || 0), 0);
    const avgHectares = recordsWithHectares.length > 0 ? Math.round(totalHectares / recordsWithHectares.length) : 0;

    // Top recommended
    const countMap: Record<string, number> = {};
    registrations.forEach(r => {
      countMap[r.primaryRecommendation] = (countMap[r.primaryRecommendation] || 0) + 1;
    });

    let topHybrid = "N/D";
    let maxCount = 0;
    Object.entries(countMap).forEach(([hybrid, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topHybrid = hybrid;
      }
    });

    return {
      total,
      totalHectares,
      avgHectares,
      topHybrid
    };
  }, [registrations]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const q = adminSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.primaryRecommendation.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      let aVal: any = a[adminSortKey as keyof Registration] ?? "";
      let bVal: any = b[adminSortKey as keyof Registration] ?? "";

      if (adminSortKey === 'date') {
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return adminSortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return adminSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [registrations, adminSearch, adminSortKey, adminSortDir]);

  const requestSort = (key: keyof Registration | 'date') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (adminSortKey === key && adminSortDir === 'asc') {
      direction = 'desc';
    }
    setAdminSortKey(key);
    setAdminSortDir(direction);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-slate-100 text-slate-800 sm:py-8">

      {/* Main Container: Mobile-First Max Width 440px, Centered and styled as an App layout */}
      <div className="w-full max-w-[440px] min-h-screen sm:min-h-0 sm:rounded-2xl bg-white sm:shadow-lg flex flex-col overflow-hidden relative border border-slate-200">

        {/* Header */}
        <header className="px-5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-center sticky top-0 z-30">
          <button onClick={handleLogoTap} className="outline-none">
            <Image
              src="/logo.png"
              alt="Agropack"
              width={104}
              height={104}
              className="rounded-lg"
            />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex flex-col p-6 overflow-y-auto bg-white">

          {/* STATE 1: REGISTRATION */}
          {appState === 'REGISTER' && (
            <div className="flex-1 flex flex-col justify-between animate-fadeIn">
              <div>
                <div className="text-center mt-2 mb-7">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    ¿Cuál es tu híbrido <span className="text-agropac-green">NK ideal</span>?
                  </h1>
                  <p className="text-sm text-slate-500 mt-2 max-w-[280px] mx-auto leading-relaxed">
                    Completá tus datos, respondé unas preguntas agronómicas y obtené la recomendación para tus lotes.
                  </p>
                </div>

                <form onSubmit={handleStartSurvey} className="space-y-4">
                  {/* Nombre y Apellido */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nombre y apellido *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <FaUser className="text-sm" />
                      </span>
                      <input
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full bg-slate-50 border ${formErrors.name ? 'border-nk-red' : 'border-slate-200'} focus:border-agropac-green focus:ring-1 focus:ring-agropac-green rounded-lg py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors`}
                      />
                    </div>
                    {formErrors.name && <p className="text-xs text-nk-red mt-1">{formErrors.name}</p>}
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">WhatsApp / Teléfono *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <FaWhatsapp className="text-base text-green-600" />
                      </span>
                      <input
                        type="tel"
                        placeholder="Ej: +54 9 341 555 1234"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full bg-slate-50 border ${formErrors.phone ? 'border-nk-red' : 'border-slate-200'} focus:border-agropac-green focus:ring-1 focus:ring-agropac-green rounded-lg py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors`}
                      />
                    </div>
                    {formErrors.phone && <p className="text-xs text-nk-red mt-1">{formErrors.phone}</p>}
                  </div>

                  {/* Superficie Maíz (Hectáreas) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex justify-between">
                      <span>Superficie estimada de maíz (ha)</span>
                      <span className="text-slate-400 font-normal">Opcional</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <FaSeedling className="text-sm" />
                      </span>
                      <input
                        type="number"
                        placeholder="Ej: 150"
                        value={formData.hectares}
                        onChange={(e) => setFormData({ ...formData, hectares: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-agropac-green focus:ring-1 focus:ring-agropac-green rounded-lg py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="mt-8 space-y-4">
                {/* Submit Button */}
                <button
                  onClick={handleStartSurvey}
                  className="w-full bg-agropac-green hover:bg-agropac-green-dark text-white font-semibold text-sm py-3.5 rounded-xl transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Comenzar encuesta</span>
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: SURVEY (4 QUESTIONS) */}
          {appState === 'SURVEY' && (
            <div className="flex-1 flex flex-col justify-between animate-fadeIn">

              {/* Top Navigation & Status */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      currentQuestionIndex === 0
                        ? 'border-transparent text-slate-300 cursor-not-allowed'
                        : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <FaArrowLeft className="text-[10px]" />
                    <span>Atrás</span>
                  </button>

                  <span className="text-xs bg-slate-50 border border-slate-200 text-slate-600 font-semibold px-2.5 py-1 rounded-full">
                    Pregunta {currentQuestionIndex + 1} de {ALL_QUESTIONS.length}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-agropac-green rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / ALL_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                {/* Question */}
                <h2 className="text-lg font-bold text-slate-900 leading-snug tracking-tight mb-5">
                  {ALL_QUESTIONS[currentQuestionIndex].question}
                </h2>

                {/* Options List */}
                <div className="space-y-3">
                  {ALL_QUESTIONS[currentQuestionIndex].options.map((opt, index) => {
                    const isSelected = answers[ALL_QUESTIONS[currentQuestionIndex].id] === index;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectOption(ALL_QUESTIONS[currentQuestionIndex].id, index)}
                        className={`w-full text-left p-4 rounded-xl border transition-colors active:scale-[0.99] flex justify-between items-center gap-4 ${
                          isSelected
                            ? 'bg-agropac-green/5 border-agropac-green text-slate-900'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex-1">
                          <h3 className={`text-sm font-semibold leading-tight ${isSelected ? 'text-agropac-green-dark' : 'text-slate-800'}`}>
                            {opt.text}
                          </h3>
                          {opt.desc && (
                            <p className="text-xs text-slate-500 mt-1 leading-normal">
                              {opt.desc}
                            </p>
                          )}
                        </div>

                        {/* Visual Radio Bullet */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-agropac-green bg-agropac-green'
                            : 'border-slate-300 bg-slate-50'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer cancel */}
              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    if (confirm("¿Querés cancelar la encuesta? Se perderán los datos de esta sesión.")) {
                      setAppState('REGISTER');
                    }
                  }}
                  className="text-xs text-slate-400 font-semibold hover:text-slate-600 underline underline-offset-4"
                >
                  Cancelar y volver a empezar
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: RESULTS SCREEN */}
          {appState === 'RESULT' && currentResult && (
            <div className="flex-1 flex flex-col justify-between animate-fadeIn text-slate-800">
              <div>

                {/* Title */}
                <div className="text-center mt-1 mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {HYBRIDS_INFO[currentResult.primary as keyof typeof HYBRIDS_INFO].name}
                  </h1>
                  <p className="text-sm text-agropac-green-dark font-semibold mt-1">
                    {HYBRIDS_INFO[currentResult.primary as keyof typeof HYBRIDS_INFO].tagline}
                  </p>
                </div>

                {/* Primary Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {HYBRIDS_INFO[currentResult.primary as keyof typeof HYBRIDS_INFO].desc}
                  </p>

                  <div className="space-y-2.5 border-t border-slate-200 pt-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Puntos clave del material</p>
                    {HYBRIDS_INFO[currentResult.primary as keyof typeof HYBRIDS_INFO].bulletPoints.map((bp, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 bg-agropac-green rounded-full mt-1.5 shrink-0" />
                        <p className="text-xs text-slate-700 leading-tight">{bp}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Comparison List */}
                <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                  <h3 className="text-xs font-semibold text-slate-500 mb-2">Compatibilidad del portafolio</h3>

                  {currentResult.recommendations.map((r, i) => {
                    const isWinner = r.hybrid === currentResult.primary;
                    const isAttenuated = r.percentage < 15; // Dim low compatibility items

                    return (
                      <div
                        key={r.hybrid}
                        className={`space-y-1.5 transition-opacity duration-300 ${
                          isAttenuated ? 'opacity-40' : 'opacity-100'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className={isWinner ? 'text-slate-900 flex items-center gap-1' : 'text-slate-600'}>
                            {r.hybrid} {isWinner && <FaStar className="text-agropac-orange text-[10px]" />}
                          </span>
                          <span className={isWinner ? 'text-agropac-green-dark' : 'text-slate-500'}>
                            {r.percentage}%
                          </span>
                        </div>
                        {/* Progress Bar Container */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isWinner ? 'bg-agropac-green' : 'bg-slate-300'
                            }`}
                            style={{ width: `${r.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {/* Reset button to register next */}
                <button
                  onClick={() => {
                    setFormData({ name: "", phone: "", location: "", hectares: "" });
                    setAppState('REGISTER');
                  }}
                  className="w-full bg-agropac-green hover:bg-agropac-green-dark text-white font-semibold text-sm py-3.5 rounded-xl transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <FaUndo className="text-xs" />
                  <span>Nuevo productor</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: ADMIN DASHBOARD */}
          {appState === 'ADMIN' && (
            <div className="flex-1 flex flex-col justify-between animate-fadeIn text-xs text-slate-800 bg-white">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FaChartBar className="text-agropac-green text-sm" />
                    Panel comercial
                  </h2>
                  <button
                    onClick={() => setAppState('REGISTER')}
                    className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-semibold hover:bg-slate-200 transition-colors"
                  >
                    <FaSignOutAlt className="text-[10px]" />
                    Salir
                  </button>
                </div>
                <p className="text-slate-400 font-medium mb-4">{filteredRegistrations.length} productores</p>

                {/* KPIs Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <p className="text-slate-500 font-medium">Anotados sorteo</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <p className="text-slate-500 font-medium">Hectáreas totales</p>
                    <p className="text-xl font-bold text-agropac-green mt-1">{stats.totalHectares} ha</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <p className="text-slate-500 font-medium">Promedio / prod.</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{stats.avgHectares} ha</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <p className="text-slate-500 font-medium">Top híbrido</p>
                    <p className="text-sm font-bold text-slate-900 mt-2 truncate">{stats.topHybrid}</p>
                  </div>
                </div>

                {/* Action buttons bar */}
                <div className="flex flex-col gap-2.5 mb-5">
                  <button
                    onClick={handleExportCSV}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <FaFileDownload />
                    <span>Exportar lista a CSV</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadBackup}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FaFileDownload className="text-[10px]" />
                      <span>Respaldo JSON</span>
                    </button>

                    <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center">
                      <FaUpload className="text-[10px]" />
                      <span>Restaurar JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por productor, zona o híbrido..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-agropac-green focus:ring-1 focus:ring-agropac-green rounded-lg py-2.5 pl-9 pr-4 text-slate-800 placeholder-slate-400 outline-none transition-colors"
                  />
                </div>

                {/* Table Header Sorting visual indicators */}
                <div className="bg-slate-50 border-t border-x border-slate-200 p-2 rounded-t-lg grid grid-cols-12 gap-1 font-semibold text-slate-500">
                  <div className="col-span-5 cursor-pointer flex items-center gap-1" onClick={() => requestSort('name')}>
                    Productor {adminSortKey === 'name' ? (adminSortDir === 'asc' ? '▲' : '▼') : ''}
                  </div>
                  <div className="col-span-3 cursor-pointer flex items-center gap-1" onClick={() => requestSort('location')}>
                    Localidad {adminSortKey === 'location' ? (adminSortDir === 'asc' ? '▲' : '▼') : ''}
                  </div>
                  <div className="col-span-4 cursor-pointer flex items-center gap-1" onClick={() => requestSort('primaryRecommendation')}>
                    Híbrido {adminSortKey === 'primaryRecommendation' ? (adminSortDir === 'asc' ? '▲' : '▼') : ''}
                  </div>
                </div>

                {/* Table / Cards List */}
                <div className="border border-slate-200 rounded-b-lg overflow-hidden max-h-[300px] overflow-y-auto bg-white">
                  {filteredRegistrations.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 italic">No hay registros cargados</p>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="grid grid-cols-12 gap-1 p-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center text-[11px]"
                      >
                        <div className="col-span-5 pr-1">
                          <p className="font-semibold text-slate-800 truncate">{reg.name}</p>
                          <p className="text-slate-400 font-mono mt-0.5">{reg.phone}</p>
                        </div>
                        <div className="col-span-3 truncate text-slate-600">
                          {reg.location}
                        </div>
                        <div className="col-span-4">
                          <span className="font-semibold text-agropac-green-dark block">{reg.primaryRecommendation}</span>
                          <span className="text-slate-400 mt-0.5 block">
                            {reg.hectares ? `${reg.hectares} ha` : 'S/D'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 border-t border-slate-200 pt-4">
                <button
                  onClick={handleResetDatabase}
                  className="w-full bg-white hover:bg-nk-red/5 text-slate-500 hover:text-nk-red border border-slate-200 hover:border-nk-red/20 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <FaTrashAlt className="text-xs" />
                  <span>Vaciar base de datos (sorteo)</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADMIN PASSWORD LOCK MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-[340px] shadow-xl animate-scaleUp text-slate-800">
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-full bg-agropac-orange/15 text-agropac-orange mx-auto flex items-center justify-center mb-3">
                <FaLock />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Acceso restringido</h3>
              <p className="text-xs text-slate-500 mt-1">Solo para el equipo comercial de Agropac.</p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Ingresar contraseña..."
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setPasswordError("");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-agropac-green focus:ring-1 focus:ring-agropac-green rounded-lg py-3 px-4 text-sm text-center outline-none transition-colors text-slate-800"
                  autoFocus
                />
                {passwordError && <p className="text-xs text-nk-red text-center font-semibold mt-1.5">{passwordError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-agropac-green hover:bg-agropac-green-dark text-white font-semibold py-2.5 rounded-lg text-xs transition-colors"
                >
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

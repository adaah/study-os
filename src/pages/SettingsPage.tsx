import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Database,
  Timer,
  GraduationCap,
  CalendarDays,
} from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { parseISO, differenceInDays } from 'date-fns';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    clearAllData,
    loadDemoData,
    resetToDemoData,
    exportDataJSON,
    importDataJSON,
    semester,
    updateSemester,
  } = useStudyOS();

  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyOS-Backup-${semester.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJSON(content);
        setImportSuccess(ok);
        setTimeout(() => setImportSuccess(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja redefinir para os dados de demonstração iniciais? Suas alterações locais serão substituídas.')) {
      resetToDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 pb-6 max-md:bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="max-md:px-4 max-md:pt-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Configurações do Sistema
        </h1>
        <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">
          Ajuste parâmetros acadêmicos, temporizadores de foco e faça backup dos seus dados.
        </p>
      </div>



      {/* 1. Semester Period & Academic Goals */}
      <div className="academic-card p-6 space-y-5 max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-4 max-md:rounded-none">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" /> Período do Semestre Acadêmico
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Defina as datas de início e término para calcular semanas letivas, prazos e progresso do período.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Semestre {semester.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Semester Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Identificação / Nome *</label>
            <input
              type="text"
              required
              placeholder="Ex: 2026.2"
              value={semester.name}
              onChange={(e) => updateSemester({ name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Data de Início das Aulas *</label>
            <input
              type="date"
              required
              value={semester.startDate}
              onChange={(e) => {
                const newStart = e.target.value;
                try {
                  const s = parseISO(newStart);
                  const passedDays = differenceInDays(new Date(), s);
                  const newWeek = Math.max(1, Math.ceil(passedDays / 7));
                  updateSemester({ startDate: newStart, currentWeek: newWeek });
                } catch {
                  updateSemester({ startDate: newStart });
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Data de Término do Semestre *</label>
            <input
              type="date"
              required
              value={semester.endDate}
              onChange={(e) => updateSemester({ endDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Target Grade */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meta de Média (Aprovação)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={semester.targetGrade || 7.0}
              onChange={(e) => updateSemester({ targetGrade: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Calculated Metrics Banner */}
        {(() => {
          let totalDays = 0;
          let totalWeeks = 18;
          let daysRemaining = 0;
          try {
            const s = parseISO(semester.startDate);
            const e = parseISO(semester.endDate);
            totalDays = differenceInDays(e, s);
            totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
            daysRemaining = differenceInDays(e, new Date());
          } catch {
            // ignore
          }

          return (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Duração Total</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  {totalDays > 0 ? `${totalDays} dias (${totalWeeks} semanas)` : '—'}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Semana Atual</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  Semana {semester.currentWeek || 1} de {totalWeeks}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Dias Restantes</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  {daysRemaining >= 0 ? `${daysRemaining} dias` : 'Semestre finalizado'}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativo & Sincronizado
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 3. Data Backup and Sovereignty */}
      <div className="academic-card p-6 space-y-4 max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-4 max-md:rounded-none">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-primary" /> Backup, Exportação e Restauração de Dados
        </h2>

        <p className="text-xs text-slate-600">
          O StudyOS armazena todos os seus dados com segurança no navegador (LocalStorage). Você pode exportar
          um arquivo JSON completo para backup pessoal ou transferir entre dispositivos.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-xs font-semibold shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Backup (.json)</span>
          </button>

          {/* Import File Picker */}
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold border border-slate-200 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Importar Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          {/* Clear All Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja apagar todos os dados e começar o semestre do zero?')) {
                clearAllData();
                setResetSuccess(true);
                setTimeout(() => setResetSuccess(false), 3000);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-xs font-semibold border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpar Todos os Dados</span>
          </button>


        </div>

        {importSuccess === true && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Backup importado com sucesso! Seus dados foram atualizados.</span>
          </div>
        )}

        {importSuccess === false && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Falha ao importar backup. Verifique se o arquivo JSON é válido.</span>
          </div>
        )}

        {resetSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ação executada com sucesso!</span>
          </div>
        )}
      </div>
    </div>
  );
};

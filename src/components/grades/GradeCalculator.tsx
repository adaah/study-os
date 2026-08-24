import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, TrendingUp, AlertTriangle, CheckCircle2, Calculator, ArrowRight, X, Pencil, Check } from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { calculateSubjectGrade } from '@/lib/utils';

export const GradeCalculator: React.FC = () => {
  const { subjects, assessments, semester, updateAssessment } = useStudyOS();
  const navigate = useNavigate();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({});
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editingGradeValue, setEditingGradeValue] = useState<string>('');

  const handleSaveGrade = (id: string) => {
    const parsed = parseFloat(editingGradeValue);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
      updateAssessment(id, { grade: parsed });
    }
    setEditingGradeId(null);
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectAssessments = assessments.filter((a) => a.subjectId === selectedSubject?.id);

  // Merge real grades with simulated grades for projection
  const simulatedAssessmentList = subjectAssessments.map((a) => {
    if (a.grade !== null && a.grade !== undefined) return a;
    if (simulatedGrades[a.id] !== undefined) {
      return { ...a, grade: simulatedGrades[a.id] };
    }
    return a;
  });

  const realGradeInfo = calculateSubjectGrade(subjectAssessments, semester.targetGrade || 7.0);
  const simulatedGradeInfo = calculateSubjectGrade(simulatedAssessmentList, semester.targetGrade || 7.0);

  const handleSimulateChange = (assId: string, val: number) => {
    setSimulatedGrades((prev) => ({
      ...prev,
      [assId]: Math.max(0, Math.min(10, val)),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Overview Across All Subjects */}
      <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-0 max-md:rounded-none p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Quadro de Notas do Semestre
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Média mínima para aprovação direta: <strong className="text-slate-800 font-bold">{semester.targetGrade || 7.0}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((s) => {
            const assList = assessments.filter((a) => a.subjectId === s.id);
            const info = calculateSubjectGrade(assList, semester.targetGrade || 7.0);

            return (
              <div
                key={s.id}
                className={`flex flex-col p-5 rounded-xl border transition-all ${
                  selectedSubjectId === s.id
                    ? 'border-primary bg-slate-50/90 shadow-sm ring-1 ring-primary'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-0.5">
                  <span className="font-bold text-base leading-none text-slate-900">{s.code}</span>
                  <div className="shrink-0">
                    {info.status === 'approved' && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500"/>Concluído</span>}
                    {info.status === 'failed' && <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-rose-500"/>Reprovado</span>}
                    {info.status === 'on_track' && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500"/>No Caminho</span>}
                    {info.status === 'attention' && <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-amber-500"/>Atenção</span>}
                    {info.status === 'risk' && <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-rose-500"/>Risco</span>}
                    {info.status === 'not_started' && <span className="text-[9px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-slate-400"/>Sem Notas</span>}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 mb-4">{s.name}</div>

                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Média Atual</span>
                    <div className="text-3xl font-black text-slate-900 leading-none">
                      {info.gradedWeight > 0 ? info.currentAverage.toFixed(1) : '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Progresso</span>
                    <div className="text-[11px] font-bold text-slate-900">{info.gradedWeight}%</div>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${info.gradedWeight}%`, backgroundColor: s.color || '#334155' }}
                  />
                </div>

                <h4 className="text-xs font-bold text-slate-800 mb-2">Avaliações</h4>
                {assList.length > 0 ? (
                  <div className="space-y-0 mb-4 flex-1">
                    {assList.map((a, idx) => (
                      <div key={a.id} className={`flex items-center justify-between text-[11px] py-2 group ${idx !== 0 ? 'border-t border-slate-100 border-dashed' : ''}`}>
                        <div className="flex items-center gap-1 text-slate-500 truncate pr-2">
                          <span className="font-medium text-slate-600 truncate">{a.title}</span>
                          <span className="text-[9px] whitespace-nowrap">({a.weight}%)</span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {editingGradeId === a.id ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                min="0" max="10" step="0.5"
                                value={editingGradeValue}
                                onChange={(e) => setEditingGradeValue(e.target.value)}
                                className="w-12 px-1 text-[11px] border border-blue-300 rounded focus:outline-none focus:border-blue-500 text-center"
                                autoFocus
                                onKeyDown={(e) => { 
                                  if (e.key === 'Enter') handleSaveGrade(a.id); 
                                  if (e.key === 'Escape') setEditingGradeId(null); 
                                }}
                              />
                              <button onClick={() => handleSaveGrade(a.id)} className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <strong className={a.grade !== null && a.grade !== undefined ? "text-slate-800 font-mono" : "text-slate-300"}>
                                {a.grade !== null && a.grade !== undefined ? a.grade.toFixed(1) : '—'}
                              </strong>
                              <button 
                                onClick={() => {
                                  setEditingGradeId(a.id);
                                  setEditingGradeValue(a.grade !== null && a.grade !== undefined ? a.grade.toString() : '');
                                }}
                                className="p-1 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                title="Editar Nota"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic mb-4 flex-1 py-2">
                    Nenhuma avaliação cadastrada.
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Meta Restante</span>
                    <strong className={`text-[13px] leading-none ${info.neededGradeOnRemaining !== null ? (info.neededGradeOnRemaining > 10 ? 'text-rose-600' : 'text-slate-900') : 'text-slate-300'}`}>
                      {info.neededGradeOnRemaining !== null ? info.neededGradeOnRemaining.toFixed(1) : '—'}
                    </strong>
                  </div>
                  
                  <button
                    onClick={() => setSelectedSubjectId(selectedSubjectId === s.id ? null : s.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-700 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    {selectedSubjectId === s.id ? 'Fechar' : 'Simular'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator Modal for Selected Subject */}
      {selectedSubject && selectedSubjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedSubject.color }} />
                <h3 className="text-base font-bold text-slate-900">
                  Simulador de Notas: {selectedSubject.name} ({selectedSubject.code})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Altere os valores simulados para calcular projeções de nota final.
              </p>
            </div>

            <button
              onClick={() => setSelectedSubjectId(null)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Fechar simulador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real vs Simulated Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Média Real Atual</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                {realGradeInfo.currentAverage.toFixed(1)} / 10
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {realGradeInfo.gradedWeight}% do peso total avaliado
              </p>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-lg border border-blue-200">
              <span className="text-[10px] uppercase font-bold text-blue-800">Média Projetada / Simulada</span>
              <div className="text-2xl font-extrabold font-mono text-blue-900 mt-1">
                {simulatedGradeInfo.currentAverage.toFixed(1)} / 10
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                Considerando notas reais e simulações
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Meta para Aprovação</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
                {semester.targetGrade || 7.0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {realGradeInfo.neededGradeOnRemaining !== null
                  ? `Necessita de média ${realGradeInfo.neededGradeOnRemaining.toFixed(1)} no restante`
                  : 'Todas as notas foram lançadas'}
              </p>
            </div>
          </div>

          {/* Interactive Assessments List with Simulators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Composição das Avaliações
            </h4>

            {subjectAssessments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Nenhuma avaliação cadastrada para esta disciplina.
              </div>
            ) : (
              <div className="space-y-2">
                {subjectAssessments.map((a) => {
                  const isRealGrade = a.grade !== null && a.grade !== undefined;
                  const currentSimVal = simulatedGrades[a.id] ?? (isRealGrade ? a.grade : 7.0);

                  return (
                    <div
                      key={a.id}
                      className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{a.title}</span>
                          <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Peso: {a.weight}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Data: {a.date.split('-').reverse().join('/')}
                        </p>
                      </div>

                      {/* Grade Control / Simulation Slider */}
                      <div className="flex items-center gap-4">
                        {isRealGrade ? (
                          <div className="text-right">
                            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Nota Real</span>
                            <span className="text-base font-extrabold font-mono text-emerald-800">
                              {a.grade?.toFixed(1)} / 10
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-700 font-bold uppercase">Simulação:</span>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.5"
                              value={currentSimVal || ''}
                              onChange={(e) => handleSimulateChange(a.id, parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-blue-300 bg-white rounded text-xs font-mono font-bold text-blue-900"
                            />
                            <span className="text-slate-400">/ 10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )}
</div>
  );
};

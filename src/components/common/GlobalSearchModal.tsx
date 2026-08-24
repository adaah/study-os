import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, CheckSquare, GraduationCap, Layers, ArrowRight } from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';

export const GlobalSearchModal: React.FC = () => {
  const { globalSearchOpen, setGlobalSearchOpen, subjects, tasks, assessments, topics } = useStudyOS();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return { subjects: [], tasks: [], assessments: [], topics: [] };
    const q = query.toLowerCase();

    return {
      subjects: subjects.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.professor.toLowerCase().includes(q)
      ),
      tasks: tasks.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      ),
      assessments: assessments.filter(
        (a) => a.title.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q))
      ),
      topics: topics.filter(
        (top) => top.title.toLowerCase().includes(q) || (top.description && top.description.toLowerCase().includes(q))
      ),
    };
  }, [query, subjects, tasks, assessments, topics]);

  if (!globalSearchOpen) return null;

  const totalResults =
    results.subjects.length + results.tasks.length + results.assessments.length + results.topics.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 max-md:pt-0 px-4 max-md:px-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in-50">
      <div
        className="w-full max-w-2xl bg-white md:rounded-xl shadow-2xl md:border md:border-slate-200 overflow-hidden flex flex-col max-md:h-[100dvh] max-md:max-h-[100dvh] md:max-h-[80vh] animate-in zoom-in-95 max-md:rounded-none max-md:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por disciplina, atividade, prova, conteúdo da ementa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium text-slate-600">Busca Rápida do StudyOS</p>
              <p className="text-[11px] mt-1">Digite qualquer termo para localizar itens instantaneamente no semestre.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="font-medium text-slate-600">Nenhum resultado encontrado para "{query}"</p>
              <p className="text-[11px] mt-1">Verifique a ortografia ou busque por código ou nome de professor.</p>
            </div>
          ) : (
            <>
              {/* Disciplinas */}
              {results.subjects.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Disciplinas ({results.subjects.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.subjects.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          navigate(`/disciplinas/${s.id}`);
                        }}
                        className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                          <div>
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {s.code} • {s.professor}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Atividades */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Atividades e Entregas ({results.tasks.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.tasks.map((t) => {
                      const subj = subjects.find((s) => s.id === t.subjectId);
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setGlobalSearchOpen(false);
                            navigate('/atividades');
                          }}
                          className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <div className="font-medium text-slate-900">{t.title}</div>
                              <div className="text-[11px] text-slate-500">
                                {subj?.name} • Prazo: {t.dueDate}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                            {t.status === 'completed' ? 'Concluída' : 'Pendente'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Avaliações */}
              {results.assessments.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Avaliações e Provas ({results.assessments.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.assessments.map((a) => {
                      const subj = subjects.find((s) => s.id === a.subjectId);
                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            setGlobalSearchOpen(false);
                            navigate(`/disciplinas/${a.subjectId}`);
                          }}
                          className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <GraduationCap className="w-4 h-4 text-rose-600 shrink-0" />
                            <div>
                              <div className="font-medium text-slate-900">{a.title}</div>
                              <div className="text-[11px] text-slate-500">
                                {subj?.name} • Data: {a.date} • Peso: {a.weight}%
                              </div>
                            </div>
                          </div>
                          {a.grade !== null && a.grade !== undefined && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Nota: {a.grade.toFixed(1)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conteúdos */}
              {results.topics.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Tópicos da Ementa ({results.topics.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.topics.map((top) => {
                      const subj = subjects.find((s) => s.id === top.subjectId);
                      return (
                        <button
                          key={top.id}
                          onClick={() => {
                            setGlobalSearchOpen(false);
                            navigate(`/disciplinas/${top.subjectId}`);
                          }}
                          className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Layers className="w-4 h-4 text-violet-600 shrink-0" />
                            <div>
                              <div className="font-medium text-slate-900">{top.title}</div>
                              <div className="text-[11px] text-slate-500">{subj?.name}</div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {top.status === 'studied' ? 'Estudado' : top.status === 'in_study' ? 'Em estudo' : 'Não estudado'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

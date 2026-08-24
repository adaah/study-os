import React, { useState } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { SubjectCard } from '@/components/subjects/SubjectCard';

export const SubjectsPage: React.FC = () => {
  const { subjects, openQuickModal } = useStudyOS();
  const [search, setSearch] = useState('');

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.professor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Minhas Disciplinas ({subjects.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie ementas, tarefas, provas, materiais e histórico de estudos por matéria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar disciplina..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <button
            onClick={() => openQuickModal('subject')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Disciplina</span>
          </button>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <div className="academic-card p-16 text-center text-slate-400 text-xs">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-semibold text-slate-600">Nenhuma disciplina encontrada</p>
          <p className="mt-1">Cadastre suas matérias para organizar seu semestre acadêmico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subj) => (
            <SubjectCard key={subj.id} subject={subj} />
          ))}
        </div>
      )}
    </div>
  );
};

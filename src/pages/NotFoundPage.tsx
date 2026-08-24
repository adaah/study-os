import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in fade-in zoom-in duration-300">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <FileQuestion className="w-12 h-12 text-slate-400" />
      </div>
      <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-700 mb-4">Página não encontrada</h2>
      <p className="text-slate-500 max-w-md mb-8 text-sm">
        Ops! Parece que você se perdeu nos estudos. A página que você está procurando não existe ou foi movida.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar para o Dashboard
      </button>
    </div>
  );
};

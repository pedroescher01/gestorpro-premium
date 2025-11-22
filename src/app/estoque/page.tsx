'use client';

import { Warehouse, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function EstoquePage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20">
            <Warehouse className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Estoque</h1>
        </div>
        <p className="text-gray-400 text-sm">Controle de estoque e inventário</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar itens no estoque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105">
          <Plus className="w-5 h-5" />
          <span>Adicionar Item</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
          <Warehouse className="w-10 h-10 text-[#00E5FF]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Estoque vazio</h3>
        <p className="text-gray-400 text-center mb-6 max-w-md">
          Comece adicionando itens ao seu estoque
        </p>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105">
          <Plus className="w-5 h-5" />
          <span>Adicionar Primeiro Item</span>
        </button>
      </div>
    </div>
  );
}

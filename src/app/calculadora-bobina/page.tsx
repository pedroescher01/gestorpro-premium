'use client';

import { useState } from 'react';
import { Calculator, Info, RotateCcw } from 'lucide-react';

export default function CalculadoraBobinaPage() {
  const [peso, setPeso] = useState('');
  const [largura, setLargura] = useState('');
  const [espessura, setEspessura] = useState('');
  const [densidade, setDensidade] = useState('7850'); // Densidade padrão do aço galvanizado em kg/m³
  const [resultado, setResultado] = useState<number | null>(null);

  const calcularMetros = () => {
    // Validar inputs
    if (!peso || !largura || !espessura || !densidade) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const pesoNum = parseFloat(peso);
    const larguraNum = parseFloat(largura) / 1000; // Converter mm para metros
    const espessuraNum = parseFloat(espessura) / 1000; // Converter mm para metros
    const densidadeNum = parseFloat(densidade);

    if (pesoNum <= 0 || larguraNum <= 0 || espessuraNum <= 0 || densidadeNum <= 0) {
      alert('Todos os valores devem ser maiores que zero!');
      return;
    }

    // Fórmula: Comprimento (m) = Peso (kg) / (Largura (m) × Espessura (m) × Densidade (kg/m³))
    const comprimento = pesoNum / (larguraNum * espessuraNum * densidadeNum);
    setResultado(comprimento);
  };

  const limparCampos = () => {
    setPeso('');
    setLargura('');
    setEspessura('');
    setDensidade('7850');
    setResultado(null);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2">
          Calculadora de Bobinas
        </h1>
        <p className="text-gray-400 font-inter">
          Calcule quantos metros tem em uma bobina pelo peso
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-6 h-6 text-[#00E5FF]" />
            <h2 className="text-xl font-inter font-bold text-white">Dados da Bobina</h2>
          </div>

          <div className="space-y-4">
            {/* Peso */}
            <div>
              <label className="block text-sm font-inter text-gray-400 mb-2">
                Peso da Bobina (kg)
              </label>
              <input
                type="number"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ex: 500"
                step="0.01"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
              />
            </div>

            {/* Largura */}
            <div>
              <label className="block text-sm font-inter text-gray-400 mb-2">
                Largura da Chapa (mm)
              </label>
              <input
                type="number"
                value={largura}
                onChange={(e) => setLargura(e.target.value)}
                placeholder="Ex: 1000"
                step="0.1"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
              />
            </div>

            {/* Espessura */}
            <div>
              <label className="block text-sm font-inter text-gray-400 mb-2">
                Espessura da Chapa (mm)
              </label>
              <input
                type="number"
                value={espessura}
                onChange={(e) => setEspessura(e.target.value)}
                placeholder="Ex: 0.5"
                step="0.01"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
              />
            </div>

            {/* Densidade */}
            <div>
              <label className="block text-sm font-inter text-gray-400 mb-2">
                Densidade do Material (kg/m³)
              </label>
              <select
                value={densidade}
                onChange={(e) => setDensidade(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
              >
                <option value="7850">Aço Galvanizado (7850 kg/m³)</option>
                <option value="7800">Aço Carbono (7800 kg/m³)</option>
                <option value="8000">Aço Inox (8000 kg/m³)</option>
                <option value="2700">Alumínio (2700 kg/m³)</option>
                <option value="8900">Cobre (8900 kg/m³)</option>
              </select>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={calcularMetros}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#00E5FF] text-black rounded-lg hover:bg-[#00E5FF]/90 transition-all font-inter font-medium"
              >
                <Calculator className="w-5 h-5" />
                Calcular
              </button>
              <button
                onClick={limparCampos}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a1a] text-gray-400 border border-[#00E5FF]/20 rounded-lg hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all font-inter font-medium"
              >
                <RotateCcw className="w-5 h-5" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Resultado */}
        <div className="space-y-6">
          {/* Card de Resultado */}
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all">
            <h2 className="text-xl font-inter font-bold text-white mb-6">Resultado</h2>
            
            {resultado !== null ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Comprimento Total</p>
                  <p className="text-5xl font-bold text-[#00E5FF] mb-2">
                    {resultado.toFixed(2)}
                  </p>
                  <p className="text-2xl text-gray-400">metros</p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-[#00E5FF]/10">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-[#1a1a1a] rounded-lg">
                      <p className="text-gray-400 mb-1">Peso</p>
                      <p className="text-white font-medium">{peso} kg</p>
                    </div>
                    <div className="p-3 bg-[#1a1a1a] rounded-lg">
                      <p className="text-gray-400 mb-1">Largura</p>
                      <p className="text-white font-medium">{largura} mm</p>
                    </div>
                    <div className="p-3 bg-[#1a1a1a] rounded-lg">
                      <p className="text-gray-400 mb-1">Espessura</p>
                      <p className="text-white font-medium">{espessura} mm</p>
                    </div>
                    <div className="p-3 bg-[#1a1a1a] rounded-lg">
                      <p className="text-gray-400 mb-1">Densidade</p>
                      <p className="text-white font-medium">{densidade} kg/m³</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-inter">
                  Preencha os campos e clique em "Calcular" para ver o resultado
                </p>
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="bg-[#0D0D0D] border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-inter font-semibold mb-2">Como funciona?</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">
                  O cálculo é feito usando a fórmula:
                </p>
                <div className="bg-[#1a1a1a] p-3 rounded-lg mb-3">
                  <code className="text-[#00E5FF] text-xs">
                    Comprimento (m) = Peso (kg) / (Largura (m) × Espessura (m) × Densidade (kg/m³))
                  </code>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  <strong className="text-white">Importante:</strong> A largura e espessura devem ser inseridas em milímetros (mm). 
                  O sistema converte automaticamente para metros no cálculo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

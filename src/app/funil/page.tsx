'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Loader2, Sparkles, TrendingUp, Users, BarChart3, Package } from 'lucide-react';
import { markFunnelAsCompleted } from '@/lib/storage';
import { useRouter } from 'next/navigation';

type QuizData = {
  nomeEmpresa: string;
  tamanhoEmpresa: string;
  usaSoftware: string;
  areasParaMelhorar: string[];
  desafiosFornecedores: string;
  dificuldadeEstoque: string;
  softwareIdeal: string;
  relatoriosPersonalizados: string;
  horasGestao: string;
  email: string;
};

export default function FunilPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [quizData, setQuizData] = useState<QuizData>({
    nomeEmpresa: '',
    tamanhoEmpresa: '',
    usaSoftware: '',
    areasParaMelhorar: [],
    desafiosFornecedores: '',
    dificuldadeEstoque: '',
    softwareIdeal: '',
    relatoriosPersonalizados: '',
    horasGestao: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const nextStep = () => {
    setStep(step + 1);
  };

  const handleMultipleChoice = (field: keyof QuizData, value: string) => {
    setQuizData({ ...quizData, [field]: value });
    setTimeout(nextStep, 300);
  };

  const handleMultipleSelect = (value: string) => {
    const current = quizData.areasParaMelhorar;
    if (current.includes(value)) {
      setQuizData({
        ...quizData,
        areasParaMelhorar: current.filter((item) => item !== value),
      });
    } else {
      setQuizData({
        ...quizData,
        areasParaMelhorar: [...current, value],
      });
    }
  };

  const handleLoadingStep = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nextStep();
    }, 1000);
  };

  const handleFinishFunnel = async () => {
    try {
      await markFunnelAsCompleted();
      router.push('/');
    } catch (error) {
      console.error('Erro ao finalizar funil:', error);
      router.push('/');
    }
  };

  const progressPercentage = ((step + 1) / 19) * 100;

  // Auto-avançar na etapa de loading (etapa 14)
  useEffect(() => {
    if (step === 14) {
      const timer = setTimeout(() => {
        nextStep();
      }, 3000); // 3 segundos
      
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Etapa 0 - Tela de Abertura
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1a1a2e] to-[#0D0D0D] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-[#1a1a1a]/90 backdrop-blur-sm border-[#00E5FF]/20 p-8 md:p-12 text-center">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 text-[#00E5FF] mx-auto mb-4" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-inter">
            Descubra como otimizar a administração do seu negócio em poucos minutos!
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-inter">
            Leva menos de 3 minutos para descobrir!
          </p>
          <Button
            onClick={nextStep}
            className="bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Vamos começar! <ArrowRight className="ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1a1a2e] to-[#0D0D0D] p-4 py-8">
      {/* Barra de Progresso */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="bg-[#1a1a1a] rounded-full h-3 overflow-hidden border border-[#00E5FF]/20">
          <div
            className="bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-center text-gray-400 mt-2 text-sm font-inter">
          Etapa {step} de 18
        </p>
      </div>

      <Card className="max-w-3xl mx-auto bg-[#1a1a1a]/90 backdrop-blur-sm border-[#00E5FF]/20 p-6 md:p-10">
        {/* Etapa 1 - Nome da Empresa */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              Qual é o nome da sua empresa?
            </h2>
            <Input
              type="text"
              placeholder="Digite o nome da sua empresa"
              value={quizData.nomeEmpresa}
              onChange={(e) => setQuizData({ ...quizData, nomeEmpresa: e.target.value })}
              className="bg-[#0D0D0D] border-[#00E5FF]/30 text-white text-lg p-6 font-inter"
            />
            <Button
              onClick={nextStep}
              disabled={!quizData.nomeEmpresa}
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg py-6 rounded-xl"
            >
              Continuar <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 2 - Tamanho da Empresa */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              Qual o tamanho da sua empresa?
            </h2>
            <div className="grid gap-4">
              {['Microempresas', 'Pequenas empresas', 'Médias empresas', 'Grandes empresas'].map((option) => (
                <Button
                  key={option}
                  onClick={() => handleMultipleChoice('tamanhoEmpresa', option)}
                  className="w-full bg-[#0D0D0D] hover:bg-[#00E5FF]/20 border-2 border-[#00E5FF]/30 hover:border-[#00E5FF] text-white text-lg py-6 rounded-xl transition-all duration-300"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Etapa 3 - Usa Software */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              Você já utiliza algum software para gestão?
            </h2>
            <div className="grid gap-4">
              {['Sim', 'Não'].map((option) => (
                <Button
                  key={option}
                  onClick={() => handleMultipleChoice('usaSoftware', option)}
                  className="w-full bg-[#0D0D0D] hover:bg-[#00E5FF]/20 border-2 border-[#00E5FF]/30 hover:border-[#00E5FF] text-white text-lg py-6 rounded-xl transition-all duration-300"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Etapa 4 - Educação/Autoridade */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <TrendingUp className="w-20 h-20 text-[#00E5FF] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-inter">
              A gestão eficiente é crucial para o sucesso!
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter leading-relaxed">
              O GestorPro é a ferramenta ideal para unificar todas as áreas da sua empresa.
            </p>
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg px-8 py-6 rounded-xl"
            >
              Continuar <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 5 - Áreas para Melhorar */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              Quais áreas você gostaria de melhorar na sua empresa?
            </h2>
            <p className="text-gray-400 mb-4 font-inter">Selecione todas que se aplicam</p>
            <div className="grid gap-4">
              {['Vendas', 'Financeiro', 'Estoque', 'Relatórios'].map((option) => (
                <Button
                  key={option}
                  onClick={() => handleMultipleSelect(option)}
                  className={`w-full text-lg py-6 rounded-xl transition-all duration-300 ${
                    quizData.areasParaMelhorar.includes(option)
                      ? 'bg-[#00E5FF] text-black border-2 border-[#00E5FF]'
                      : 'bg-[#0D0D0D] hover:bg-[#00E5FF]/20 border-2 border-[#00E5FF]/30 hover:border-[#00E5FF] text-white'
                  }`}
                >
                  {quizData.areasParaMelhorar.includes(option) && (
                    <CheckCircle2 className="mr-2" />
                  )}
                  {option}
                </Button>
              ))}
            </div>
            <Button
              onClick={nextStep}
              disabled={quizData.areasParaMelhorar.length === 0}
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg py-6 rounded-xl mt-6"
            >
              Continuar <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 6 - Desafios Fornecedores */}
        {step === 6 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              Você enfrenta desafios na gestão de fornecedores?
            </h2>
            <div className="grid gap-4">
              {['Sempre', 'Às vezes', 'Nunca'].map((option) => (
                <Button
                  key={option}
                  onClick={() => handleMultipleChoice('desafiosFornecedores', option)}
                  className="w-full bg-[#0D0D0D] hover:bg-[#00E5FF]/20 border-2 border-[#00E5FF]/30 hover:border-[#00E5FF] text-white text-lg py-6 rounded-xl transition-all duration-300"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Etapa 7 - Dificuldade Estoque */}
        {step === 7 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              Qual é a sua maior dificuldade na hora de tomar decisões sobre estoque?
            </h2>
            <div className="grid gap-4">
              {[
                'Falta de informações precisas',
                'Controle difícil de realizar',
                'Não sei como analisar dados',
              ].map((option) => (
                <Button
                  key={option}
                  onClick={() => handleMultipleChoice('dificuldadeEstoque', option)}
                  className="w-full bg-[#0D0D0D] hover:bg-[#00E5FF]/20 border-2 border-[#00E5FF]/30 hover:border-[#00E5FF] text-white text-lg py-6 rounded-xl transition-all duration-300"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Etapa 8 - Explicação Científica */}
        {step === 8 && (
          <div className="space-y-6 text-center">
            <BarChart3 className="w-20 h-20 text-[#00E5FF] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-inter">
              Dados adequados e em tempo real facilitam a tomada de decisões
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter leading-relaxed">
              O GestorPro integra informações de diferentes áreas, proporcionando uma visão completa do seu negócio.
            </p>
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg px-8 py-6 rounded-xl"
            >
              Continuar <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 9 - Software Ideal */}
        {step === 9 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              O que seria ideal para você em um software de gestão?
            </h2>
            <Textarea
              placeholder="Descreva o que você considera ideal..."
              value={quizData.softwareIdeal}
              onChange={(e) => setQuizData({ ...quizData, softwareIdeal: e.target.value })}
              className="bg-[#0D0D0D] border-[#00E5FF]/30 text-white text-lg p-6 font-inter min-h-[150px]"
            />
            <Button
              onClick={nextStep}
              disabled={!quizData.softwareIdeal}
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg py-6 rounded-xl"
            >
              Continuar <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 10 - Relatórios Personalizados */}
        {step === 10 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              Você gostaria de ter acesso a relatórios personalizados para sua empresa?
            </h2>
            <div className="grid gap-4">
              {['Sim', 'Não'].map((option) => (
                <Button
                  key={option}
                  onClick={() => handleMultipleChoice('relatoriosPersonalizados', option)}
                  className="w-full bg-[#0D0D0D] hover:bg-[#00E5FF]/20 border-2 border-[#00E5FF]/30 hover:border-[#00E5FF] text-white text-lg py-6 rounded-xl transition-all duration-300"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Etapa 11 - Horas de Gestão */}
        {step === 11 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              Quantas horas por semana você dedica à gestão da sua empresa?
            </h2>
            <div className="grid gap-4">
              {['Menos de 5 horas', '5 a 10 horas', '10 horas ou mais'].map((option) => (
                <Button
                  key={option}
                  onClick={() => handleMultipleChoice('horasGestao', option)}
                  className="w-full bg-[#0D0D0D] hover:bg-[#00E5FF]/20 border-2 border-[#00E5FF]/30 hover:border-[#00E5FF] text-white text-lg py-6 rounded-xl transition-all duration-300"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Etapa 12 - Validação Social */}
        {step === 12 && (
          <div className="space-y-6 text-center">
            <Users className="w-20 h-20 text-[#00E5FF] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-inter">
              Empresas que utilizam o GestorPro relatam uma redução de 30% nas horas dedicadas à gestão
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter">
              Junte-se a centenas de empresas que já transformaram sua gestão!
            </p>
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg px-8 py-6 rounded-xl"
            >
              Continuar <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 13 - Captura de Lead */}
        {step === 13 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-inter">
              Para acessar seu relatório personalizado, insira seu e-mail
            </h2>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={quizData.email}
              onChange={(e) => setQuizData({ ...quizData, email: e.target.value })}
              className="bg-[#0D0D0D] border-[#00E5FF]/30 text-white text-lg p-6 font-inter"
            />
            <Button
              onClick={handleLoadingStep}
              disabled={!quizData.email || !quizData.email.includes('@')}
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg py-6 rounded-xl"
            >
              Gerar Relatório <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 14 - Loading */}
        {step === 14 && (
          <div className="space-y-6 text-center py-12">
            <Loader2 className="w-20 h-20 text-[#00E5FF] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-inter">
              Analisando suas respostas...
            </h2>
            <p className="text-xl text-gray-300 font-inter">Por favor, aguarde.</p>
          </div>
        )}

        {/* Etapa 15 - Resultados Personalizados */}
        {step === 15 && (
          <div className="space-y-6 text-center">
            <CheckCircle2 className="w-20 h-20 text-[#00E5FF] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-inter">
              Baseado nas suas respostas, você está pronto para transformar a gestão da sua empresa!
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter">
              O GestorPro foi desenvolvido especialmente para empresas como a {quizData.nomeEmpresa}.
            </p>
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg px-8 py-6 rounded-xl"
            >
              Ver Benefícios <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 16 - Benefícios Adicionais */}
        {step === 16 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center font-inter">
              Com o GestorPro, você terá:
            </h2>
            <div className="space-y-4">
              {[
                { icon: Users, text: 'Gestão completa de clientes' },
                { icon: Package, text: 'Controle eficiente de produtos e serviços' },
                { icon: BarChart3, text: 'Relatórios dinâmicos e personalizados' },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-[#0D0D0D] border border-[#00E5FF]/30 p-6 rounded-xl"
                >
                  <benefit.icon className="w-8 h-8 text-[#00E5FF] flex-shrink-0" />
                  <p className="text-white text-lg font-inter">{benefit.text}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={nextStep}
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg py-6 rounded-xl mt-6"
            >
              Continuar <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 17 - Taxa de Sucesso */}
        {step === 17 && (
          <div className="space-y-6 text-center">
            <div className="text-6xl font-bold text-[#00E5FF] mb-4 font-inter">92%</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-inter">
              dos nossos usuários reportaram uma melhoria significativa na administração de seus negócios
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter">
              Resultados comprovados por empresas reais!
            </p>
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-lg px-8 py-6 rounded-xl"
            >
              Ver Oferta Especial <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* Etapa 18 - Oferta Final */}
        {step === 18 && (
          <div className="space-y-6 text-center">
            <Sparkles className="w-20 h-20 text-[#00E5FF] mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 font-inter">
              Teste o GestorPro gratuitamente por 7 dias!
            </h2>
            <p className="text-xl text-gray-300 mb-6 font-inter">
              Experimente todas as funcionalidades na prática e transforme a gestão da sua empresa.
            </p>
            <div className="bg-[#0D0D0D] border-2 border-[#00E5FF] p-8 rounded-2xl mb-6">
              <p className="text-gray-400 text-lg mb-2 font-inter">Após o período de teste:</p>
              <p className="text-5xl font-bold text-[#00E5FF] mb-2 font-inter">R$ 27,90</p>
              <p className="text-gray-300 text-xl font-inter">por mês</p>
            </div>
            <Button
              onClick={handleFinishFunnel}
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00B8D4] hover:to-[#00E5FF] text-black font-bold text-xl py-8 rounded-xl transform hover:scale-105 transition-all duration-300"
            >
              Começar a usar o GestorPro! <ArrowRight className="ml-2" />
            </Button>
            <p className="text-sm text-gray-400 mt-4 font-inter">
              Sem compromisso. Cancele quando quiser.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

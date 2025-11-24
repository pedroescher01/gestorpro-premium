'use client';

import { MessageCircle, Mail, AlertCircle, Phone, Instagram, HelpCircle, FileText, Video } from 'lucide-react';

export default function SuportePage() {
  const handleWhatsApp = () => {
    window.open('https://wa.me/5519989590119', '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:contatogestorproapp@gmail.com?subject=Suporte GestorPro', '_blank');
  };

  const handleInstagram = () => {
    window.open('https://instagram.com/appgestorpro', '_blank');
  };

  const handleCentralAjuda = () => {
    // Abre FAQ/Central de Ajuda
    alert('Central de Ajuda em desenvolvimento. Por enquanto, entre em contato via WhatsApp ou Email.');
  };

  const handleReportarProblema = () => {
    const subject = encodeURIComponent('Reportar Problema - GestorPro');
    const body = encodeURIComponent(`
Olá equipe GestorPro,

Gostaria de reportar o seguinte problema:

Descrição do problema:
[Descreva aqui o problema encontrado]

Passos para reproduzir:
1. 
2. 
3. 

Comportamento esperado:
[O que deveria acontecer]

Comportamento atual:
[O que está acontecendo]

Informações adicionais:
- Navegador: 
- Sistema Operacional: 
- Data/Hora: ${new Date().toLocaleString('pt-BR')}

Obrigado!
    `);
    window.open(`mailto:contatogestorproapp@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#00E5FF] to-blue-600 mb-4">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Central de Suporte</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Estamos aqui para ajudar! Escolha a melhor forma de entrar em contato conosco.
          </p>
        </div>

        {/* Botões Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Central de Ajuda */}
          <button
            onClick={handleCentralAjuda}
            className="group relative overflow-hidden bg-gradient-to-br from-[#00E5FF]/10 to-blue-600/10 border border-[#00E5FF]/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00E5FF]/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/0 to-[#00E5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00E5FF] to-blue-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Central de Ajuda</h3>
              <p className="text-gray-400 text-sm">
                Acesse nossa base de conhecimento com tutoriais e FAQs
              </p>
            </div>
          </button>

          {/* Contato */}
          <button
            onClick={handleWhatsApp}
            className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Contato Direto</h3>
              <p className="text-gray-400 text-sm">
                Fale conosco via WhatsApp para suporte rápido
              </p>
            </div>
          </button>

          {/* Reportar Problema */}
          <button
            onClick={handleReportarProblema}
            className="group relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Reportar Problema</h3>
              <p className="text-gray-400 text-sm">
                Encontrou um bug? Nos ajude a melhorar o sistema
              </p>
            </div>
          </button>
        </div>

        {/* Canais de Contato */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Outros Canais de Contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">WhatsApp</h3>
                <p className="text-gray-400 text-sm">(19) 98959-0119</p>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={handleEmail}
              className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">Email</h3>
                <p className="text-gray-400 text-sm">contatogestorproapp@gmail.com</p>
              </div>
            </button>

            {/* Instagram */}
            <button
              onClick={handleInstagram}
              className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-600/10 border border-pink-500/20 hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold group-hover:text-pink-400 transition-colors">Instagram</h3>
                <p className="text-gray-400 text-sm">@appgestorpro</p>
              </div>
            </button>
          </div>
        </div>

        {/* Horário de Atendimento */}
        <div className="bg-gradient-to-br from-[#00E5FF]/5 to-blue-600/5 border border-[#00E5FF]/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Horário de Atendimento</h3>
          <div className="space-y-2 text-gray-400">
            <p>Segunda a Sexta: 9h às 18h</p>
            <p>Sábado: 9h às 13h</p>
            <p className="text-sm text-gray-500 mt-4">
              * Respostas por email podem levar até 24h úteis
            </p>
          </div>
        </div>

        {/* FAQ Rápido */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <details className="group bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-xl p-6 cursor-pointer hover:border-[#00E5FF]/30 transition-all">
              <summary className="text-white font-semibold flex items-center justify-between">
                Como faço para redefinir minha senha?
                <span className="text-[#00E5FF] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4 text-sm">
                Acesse a página de login e clique em "Esqueci minha senha". Você receberá um email com instruções para criar uma nova senha.
              </p>
            </details>

            <details className="group bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-xl p-6 cursor-pointer hover:border-[#00E5FF]/30 transition-all">
              <summary className="text-white font-semibold flex items-center justify-between">
                Como adicionar novos produtos ao sistema?
                <span className="text-[#00E5FF] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4 text-sm">
                Vá até a aba "Produtos" no menu lateral e clique no botão "Adicionar Produto". Preencha as informações necessárias e salve.
              </p>
            </details>

            <details className="group bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-xl p-6 cursor-pointer hover:border-[#00E5FF]/30 transition-all">
              <summary className="text-white font-semibold flex items-center justify-between">
                Posso exportar meus dados?
                <span className="text-[#00E5FF] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4 text-sm">
                Sim! Acesse "Configurações" → "Dados e Privacidade" e clique em "Exportar Dados". Você receberá um arquivo JSON com todas as suas informações.
              </p>
            </details>

            <details className="group bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-xl p-6 cursor-pointer hover:border-[#00E5FF]/30 transition-all">
              <summary className="text-white font-semibold flex items-center justify-between">
                O sistema funciona offline?
                <span className="text-[#00E5FF] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4 text-sm">
                Atualmente o GestorPro requer conexão com a internet para funcionar. Estamos trabalhando em uma versão offline para breve!
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

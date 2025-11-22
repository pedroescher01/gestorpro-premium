'use client';

import { Settings, User, Bell, Shield, Palette, Database } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20">
            <Settings className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Configurações</h1>
        </div>
        <p className="text-gray-400 text-sm">Personalize e configure o sistema</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Perfil */}
        <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-xl p-6 hover:border-[#00E5FF]/40 transition-all cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 group-hover:bg-[#00E5FF]/20 transition-all">
              <User className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Perfil</h3>
              <p className="text-sm text-gray-400">Dados pessoais</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Configure suas informações pessoais e preferências de conta
          </p>
        </div>

        {/* Notificações */}
        <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-xl p-6 hover:border-[#00E5FF]/40 transition-all cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 group-hover:bg-[#00E5FF]/20 transition-all">
              <Bell className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Notificações</h3>
              <p className="text-sm text-gray-400">Alertas e avisos</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Gerencie como e quando você recebe notificações
          </p>
        </div>

        {/* Segurança */}
        <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-xl p-6 hover:border-[#00E5FF]/40 transition-all cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 group-hover:bg-[#00E5FF]/20 transition-all">
              <Shield className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Segurança</h3>
              <p className="text-sm text-gray-400">Senha e acesso</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Configure senha, autenticação e permissões de acesso
          </p>
        </div>

        {/* Aparência */}
        <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-xl p-6 hover:border-[#00E5FF]/40 transition-all cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 group-hover:bg-[#00E5FF]/20 transition-all">
              <Palette className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Aparência</h3>
              <p className="text-sm text-gray-400">Tema e interface</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Personalize cores, tema e layout da interface
          </p>
        </div>

        {/* Dados */}
        <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-xl p-6 hover:border-[#00E5FF]/40 transition-all cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 group-hover:bg-[#00E5FF]/20 transition-all">
              <Database className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dados</h3>
              <p className="text-sm text-gray-400">Backup e exportação</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Faça backup, exporte ou importe dados do sistema
          </p>
        </div>

        {/* Sistema */}
        <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-xl p-6 hover:border-[#00E5FF]/40 transition-all cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 group-hover:bg-[#00E5FF]/20 transition-all">
              <Settings className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sistema</h3>
              <p className="text-sm text-gray-400">Configurações gerais</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Configurações avançadas e informações do sistema
          </p>
        </div>
      </div>
    </div>
  );
}

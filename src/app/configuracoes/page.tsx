'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Settings as SettingsIcon,
  Save,
  Camera,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Info,
  Moon,
  Sun,
  Monitor,
  Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type TabType = 'perfil' | 'notificacoes' | 'seguranca' | 'aparencia' | 'dados' | 'sistema';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para Perfil
  const [perfil, setPerfil] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: '',
    bio: '',
    avatar: ''
  });

  // Estados para Notificações
  const [notificacoes, setNotificacoes] = useState({
    emailVendas: true,
    emailEstoque: true,
    emailFinanceiro: false,
    pushVendas: true,
    pushEstoque: true,
    pushFinanceiro: false,
    resumoDiario: true,
    resumoSemanal: false
  });

  // Estados para Segurança
  const [seguranca, setSeguranca] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
    twoFactor: false,
    sessoes: true
  });

  // Estados para Aparência
  const [aparencia, setAparencia] = useState({
    tema: 'dark' as 'light' | 'dark' | 'system',
    tamanhoFonte: 'medium' as 'small' | 'medium' | 'large',
    corPrimaria: '#00E5FF',
    compactMode: false
  });

  // Carregar dados do usuário
  useEffect(() => {
    const carregarDados = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setPerfil({
          nome: user.user_metadata?.name || '',
          email: user.email || '',
          telefone: user.user_metadata?.telefone || '',
          empresa: user.user_metadata?.empresa || '',
          cargo: user.user_metadata?.cargo || '',
          bio: user.user_metadata?.bio || '',
          avatar: user.user_metadata?.avatar || ''
        });

        // Carregar preferências salvas do localStorage
        const savedNotificacoes = localStorage.getItem('notificacoes');
        if (savedNotificacoes) {
          setNotificacoes(JSON.parse(savedNotificacoes));
        }

        const savedAparencia = localStorage.getItem('aparencia');
        if (savedAparencia) {
          setAparencia(JSON.parse(savedAparencia));
        }
      }
    };

    carregarDados();
  }, []);

  // Aplicar tema
  useEffect(() => {
    if (aparencia.tema === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (aparencia.tema === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [aparencia.tema]);

  // Aplicar tamanho da fonte
  useEffect(() => {
    const root = document.documentElement;
    if (aparencia.tamanhoFonte === 'small') {
      root.style.fontSize = '14px';
    } else if (aparencia.tamanhoFonte === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [aparencia.tamanhoFonte]);

  // Aplicar cor primária
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', aparencia.corPrimaria);
  }, [aparencia.corPrimaria]);

  // Aplicar modo compacto
  useEffect(() => {
    const root = document.documentElement;
    if (aparencia.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [aparencia.compactMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPerfil({ ...perfil, avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSavePerfil = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            name: perfil.nome,
            telefone: perfil.telefone,
            empresa: perfil.empresa,
            cargo: perfil.cargo,
            bio: perfil.bio,
            avatar: perfil.avatar
          }
        });

        if (error) throw error;

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificacoes = () => {
    localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = async () => {
    if (seguranca.novaSenha !== seguranca.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if (seguranca.novaSenha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: seguranca.novaSenha
      });

      if (error) throw error;

      setSeguranca({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
        twoFactor: seguranca.twoFactor,
        sessoes: seguranca.sessoes
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAparencia = () => {
    localStorage.setItem('aparencia', JSON.stringify(aparencia));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simular exportação de dados
      const dados = {
        perfil,
        notificacoes,
        aparencia,
        dataExportacao: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gestorpro-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  };

  const handleLimparCache = () => {
    localStorage.clear();
    alert('Cache limpo com sucesso! A página será recarregada.');
    window.location.reload();
  };

  const tabs = [
    { id: 'perfil' as TabType, label: 'Perfil', icon: User },
    { id: 'notificacoes' as TabType, label: 'Notificações', icon: Bell },
    { id: 'seguranca' as TabType, label: 'Segurança', icon: Shield },
    { id: 'aparencia' as TabType, label: 'Aparência', icon: Palette },
    { id: 'dados' as TabType, label: 'Dados', icon: Database },
    { id: 'sistema' as TabType, label: 'Sistema', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2">
          Configurações
        </h1>
        <p className="text-gray-400 font-inter">
          Personalize sua experiência no GestorPro
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <p className="text-green-500 font-inter">Configurações salvas com sucesso!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20' 
                      : 'text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/5'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#00E5FF]' : ''}`} />
                  <span className="font-inter text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6">
            {/* Perfil Tab */}
            {activeTab === 'perfil' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-inter font-bold text-white mb-2">Perfil</h2>
                  <p className="text-gray-400 text-sm">Gerencie suas informações pessoais</p>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {perfil.avatar ? (
                      <img 
                        src={perfil.avatar} 
                        alt="Avatar" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#00E5FF]/20"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00E5FF] to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                        {perfil.nome.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button 
                    onClick={handleAvatarClick}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00E5FF]/10 text-[#00E5FF] rounded-lg hover:bg-[#00E5FF]/20 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-inter">Alterar foto</span>
                  </button>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter text-gray-400 mb-2">Nome completo</label>
                    <input
                      type="text"
                      value={perfil.nome}
                      onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-inter text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={perfil.email}
                      disabled
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-inter text-gray-400 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={perfil.telefone}
                      onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-inter text-gray-400 mb-2">Empresa</label>
                    <input
                      type="text"
                      value={perfil.empresa}
                      onChange={(e) => setPerfil({ ...perfil, empresa: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                      placeholder="Nome da empresa"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-inter text-gray-400 mb-2">Cargo</label>
                    <input
                      type="text"
                      value={perfil.cargo}
                      onChange={(e) => setPerfil({ ...perfil, cargo: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                      placeholder="Seu cargo"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-inter text-gray-400 mb-2">Bio</label>
                    <textarea
                      value={perfil.bio}
                      onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all resize-none"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleSavePerfil}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-[#00E5FF] text-black rounded-lg hover:bg-[#00E5FF]/90 transition-all font-inter font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            )}

            {/* Notificações Tab */}
            {activeTab === 'notificacoes' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-inter font-bold text-white mb-2">Notificações</h2>
                  <p className="text-gray-400 text-sm">Configure como deseja receber notificações</p>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-inter font-semibold text-white mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#00E5FF]" />
                      Notificações por Email
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'emailVendas', label: 'Novas vendas', desc: 'Receba um email quando uma nova venda for registrada' },
                        { key: 'emailEstoque', label: 'Alertas de estoque', desc: 'Seja notificado quando o estoque estiver baixo' },
                        { key: 'emailFinanceiro', label: 'Relatórios financeiros', desc: 'Receba resumos financeiros mensais' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                          <div>
                            <p className="text-white font-inter font-medium">{item.label}</p>
                            <p className="text-sm text-gray-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotificacoes({ ...notificacoes, [item.key]: !notificacoes[item.key as keyof typeof notificacoes] })}
                            className={`relative w-12 h-6 rounded-full transition-all ${
                              notificacoes[item.key as keyof typeof notificacoes] ? 'bg-[#00E5FF]' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                notificacoes[item.key as keyof typeof notificacoes] ? 'translate-x-6' : ''
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="text-lg font-inter font-semibold text-white mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-[#00E5FF]" />
                      Notificações Push
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'pushVendas', label: 'Novas vendas', desc: 'Notificações em tempo real de vendas' },
                        { key: 'pushEstoque', label: 'Alertas de estoque', desc: 'Avisos instantâneos de estoque baixo' },
                        { key: 'pushFinanceiro', label: 'Movimentações financeiras', desc: 'Notificações de transações importantes' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                          <div>
                            <p className="text-white font-inter font-medium">{item.label}</p>
                            <p className="text-sm text-gray-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotificacoes({ ...notificacoes, [item.key]: !notificacoes[item.key as keyof typeof notificacoes] })}
                            className={`relative w-12 h-6 rounded-full transition-all ${
                              notificacoes[item.key as keyof typeof notificacoes] ? 'bg-[#00E5FF]' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                notificacoes[item.key as keyof typeof notificacoes] ? 'translate-x-6' : ''
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumos */}
                  <div>
                    <h3 className="text-lg font-inter font-semibold text-white mb-4">Resumos Periódicos</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'resumoDiario', label: 'Resumo diário', desc: 'Receba um resumo das atividades do dia' },
                        { key: 'resumoSemanal', label: 'Resumo semanal', desc: 'Relatório semanal de desempenho' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                          <div>
                            <p className="text-white font-inter font-medium">{item.label}</p>
                            <p className="text-sm text-gray-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotificacoes({ ...notificacoes, [item.key]: !notificacoes[item.key as keyof typeof notificacoes] })}
                            className={`relative w-12 h-6 rounded-full transition-all ${
                              notificacoes[item.key as keyof typeof notificacoes] ? 'bg-[#00E5FF]' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                notificacoes[item.key as keyof typeof notificacoes] ? 'translate-x-6' : ''
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveNotificacoes}
                  className="flex items-center gap-2 px-6 py-3 bg-[#00E5FF] text-black rounded-lg hover:bg-[#00E5FF]/90 transition-all font-inter font-medium"
                >
                  <Save className="w-4 h-4" />
                  Salvar preferências
                </button>
              </div>
            )}

            {/* Segurança Tab */}
            {activeTab === 'seguranca' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-inter font-bold text-white mb-2">Segurança</h2>
                  <p className="text-gray-400 text-sm">Proteja sua conta e seus dados</p>
                </div>

                {/* Alterar Senha */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#00E5FF]" />
                    Alterar Senha
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-inter text-gray-400 mb-2">Senha atual</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={seguranca.senhaAtual}
                          onChange={(e) => setSeguranca({ ...seguranca, senhaAtual: e.target.value })}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all pr-12"
                          placeholder="Digite sua senha atual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00E5FF]"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter text-gray-400 mb-2">Nova senha</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={seguranca.novaSenha}
                          onChange={(e) => setSeguranca({ ...seguranca, novaSenha: e.target.value })}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all pr-12"
                          placeholder="Digite sua nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00E5FF]"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter text-gray-400 mb-2">Confirmar nova senha</label>
                      <input
                        type="password"
                        value={seguranca.confirmarSenha}
                        onChange={(e) => setSeguranca({ ...seguranca, confirmarSenha: e.target.value })}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                        placeholder="Confirme sua nova senha"
                      />
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={loading || !seguranca.novaSenha || !seguranca.confirmarSenha}
                      className="flex items-center gap-2 px-6 py-3 bg-[#00E5FF] text-black rounded-lg hover:bg-[#00E5FF]/90 transition-all font-inter font-medium disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      {loading ? 'Alterando...' : 'Alterar senha'}
                    </button>
                  </div>
                </div>

                {/* Autenticação de Dois Fatores */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#00E5FF]" />
                    Autenticação de Dois Fatores
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                    <div>
                      <p className="text-white font-inter font-medium">Ativar 2FA</p>
                      <p className="text-sm text-gray-400">Adicione uma camada extra de segurança à sua conta</p>
                    </div>
                    <button
                      onClick={() => setSeguranca({ ...seguranca, twoFactor: !seguranca.twoFactor })}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        seguranca.twoFactor ? 'bg-[#00E5FF]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          seguranca.twoFactor ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Sessões Ativas */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4">Sessões Ativas</h3>
                  <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                    <div>
                      <p className="text-white font-inter font-medium">Gerenciar sessões</p>
                      <p className="text-sm text-gray-400">Veja e encerre sessões ativas em outros dispositivos</p>
                    </div>
                    <button
                      onClick={() => setSeguranca({ ...seguranca, sessoes: !seguranca.sessoes })}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        seguranca.sessoes ? 'bg-[#00E5FF]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          seguranca.sessoes ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Aparência Tab */}
            {activeTab === 'aparencia' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-inter font-bold text-white mb-2">Aparência</h2>
                  <p className="text-gray-400 text-sm">Personalize a interface do sistema</p>
                </div>

                {/* Tema */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#00E5FF]" />
                    Tema
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: 'light', label: 'Claro', icon: Sun },
                      { value: 'dark', label: 'Escuro', icon: Moon },
                      { value: 'system', label: 'Sistema', icon: Monitor },
                    ].map((tema) => {
                      const Icon = tema.icon;
                      const isActive = aparencia.tema === tema.value;
                      
                      return (
                        <button
                          key={tema.value}
                          onClick={() => setAparencia({ ...aparencia, tema: tema.value as any })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isActive
                              ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                              : 'border-[#00E5FF]/20 hover:border-[#00E5FF]/40'
                          }`}
                        >
                          <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
                          <p className={`text-sm font-inter font-medium ${isActive ? 'text-[#00E5FF]' : 'text-gray-400'}`}>
                            {tema.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tamanho da Fonte */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4">Tamanho da Fonte</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: 'small', label: 'Pequena' },
                      { value: 'medium', label: 'Média' },
                      { value: 'large', label: 'Grande' },
                    ].map((size) => {
                      const isActive = aparencia.tamanhoFonte === size.value;
                      
                      return (
                        <button
                          key={size.value}
                          onClick={() => setAparencia({ ...aparencia, tamanhoFonte: size.value as any })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isActive
                              ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                              : 'border-[#00E5FF]/20 hover:border-[#00E5FF]/40'
                          }`}
                        >
                          <p className={`font-inter font-medium ${isActive ? 'text-[#00E5FF]' : 'text-gray-400'}`}>
                            {size.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cor Primária */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4">Cor de Destaque</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={aparencia.corPrimaria}
                      onChange={(e) => setAparencia({ ...aparencia, corPrimaria: e.target.value })}
                      className="w-16 h-16 rounded-lg cursor-pointer border-2 border-[#00E5FF]/20"
                    />
                    <div>
                      <p className="text-white font-inter font-medium">{aparencia.corPrimaria}</p>
                      <p className="text-sm text-gray-400">Escolha a cor de destaque do sistema</p>
                    </div>
                  </div>
                </div>

                {/* Modo Compacto */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4">Densidade da Interface</h3>
                  <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                    <div>
                      <p className="text-white font-inter font-medium">Modo compacto</p>
                      <p className="text-sm text-gray-400">Reduz o espaçamento entre elementos</p>
                    </div>
                    <button
                      onClick={() => setAparencia({ ...aparencia, compactMode: !aparencia.compactMode })}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        aparencia.compactMode ? 'bg-[#00E5FF]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          aparencia.compactMode ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveAparencia}
                  className="flex items-center gap-2 px-6 py-3 bg-[#00E5FF] text-black rounded-lg hover:bg-[#00E5FF]/90 transition-all font-inter font-medium"
                >
                  <Save className="w-4 h-4" />
                  Salvar preferências
                </button>
              </div>
            )}

            {/* Dados Tab */}
            {activeTab === 'dados' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-inter font-bold text-white mb-2">Dados</h2>
                  <p className="text-gray-400 text-sm">Gerencie seus dados e privacidade</p>
                </div>

                {/* Exportar Dados */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#00E5FF]" />
                    Exportar Dados
                  </h3>
                  <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                    <p className="text-white font-inter font-medium mb-2">Baixar seus dados</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Faça o download de todos os seus dados em formato JSON
                    </p>
                    <button
                      onClick={handleExportarDados}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00E5FF]/10 text-[#00E5FF] rounded-lg hover:bg-[#00E5FF]/20 transition-all font-inter"
                    >
                      <Download className="w-4 h-4" />
                      Exportar dados
                    </button>
                  </div>
                </div>

                {/* Limpar Cache */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-orange-500" />
                    Limpar Cache
                  </h3>
                  <div className="p-4 bg-[#1a1a1a] rounded-lg border border-orange-500/20">
                    <p className="text-white font-inter font-medium mb-2">Limpar dados temporários</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Remove todos os dados em cache. A página será recarregada.
                    </p>
                    <button
                      onClick={handleLimparCache}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-all font-inter"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar cache
                    </button>
                  </div>
                </div>

                {/* Privacidade */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4">Privacidade</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                      <p className="text-white font-inter font-medium mb-1">Política de Privacidade</p>
                      <p className="text-sm text-gray-400">
                        Leia nossa política de privacidade e termos de uso
                      </p>
                    </div>
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                      <p className="text-white font-inter font-medium mb-1">Consentimento de Dados</p>
                      <p className="text-sm text-gray-400">
                        Gerencie suas preferências de coleta de dados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sistema Tab */}
            {activeTab === 'sistema' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-inter font-bold text-white mb-2">Sistema</h2>
                  <p className="text-gray-400 text-sm">Informações sobre o sistema</p>
                </div>

                {/* Informações do Sistema */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#00E5FF]" />
                    Informações
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                      <span className="text-gray-400 font-inter">Versão do Sistema</span>
                      <span className="text-white font-inter font-medium">1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                      <span className="text-gray-400 font-inter">Última Atualização</span>
                      <span className="text-white font-inter font-medium">
                        {new Date().toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                      <span className="text-gray-400 font-inter">Ambiente</span>
                      <span className="text-white font-inter font-medium">Produção</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                      <span className="text-gray-400 font-inter">Status do Sistema</span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-green-500 font-inter font-medium">Operacional</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Suporte */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4">Suporte</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                      <p className="text-white font-inter font-medium mb-1">Central de Ajuda</p>
                      <p className="text-sm text-gray-400">
                        Acesse tutoriais e documentação do sistema
                      </p>
                    </div>
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                      <p className="text-white font-inter font-medium mb-1">Contato</p>
                      <p className="text-sm text-gray-400">
                        Entre em contato com nossa equipe de suporte
                      </p>
                    </div>
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                      <p className="text-white font-inter font-medium mb-1">Reportar Problema</p>
                      <p className="text-sm text-gray-400">
                        Encontrou um bug? Nos avise para que possamos corrigir
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sobre */}
                <div>
                  <h3 className="text-lg font-inter font-semibold text-white mb-4">Sobre o GestorPro</h3>
                  <div className="p-6 bg-[#1a1a1a] rounded-lg border border-[#00E5FF]/10">
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/87ca0b15-51af-4e61-9b82-c1d8d4d126aa.webp" 
                        alt="GestorPro Logo" 
                        className="h-16 w-auto"
                      />
                      <div>
                        <h4 className="text-xl font-inter font-bold text-white">GestorPro</h4>
                        <p className="text-sm text-gray-400">Sistema de Gestão Empresarial</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      O GestorPro é uma solução completa para gestão empresarial, oferecendo 
                      ferramentas poderosas para controle de vendas, estoque, financeiro e muito mais. 
                      Desenvolvido com tecnologia de ponta para garantir a melhor experiência.
                    </p>
                    <div className="mt-4 pt-4 border-t border-[#00E5FF]/10">
                      <p className="text-xs text-gray-500">
                        © 2024 GestorPro. Todos os direitos reservados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

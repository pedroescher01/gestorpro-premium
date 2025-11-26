'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  AlertCircle,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Shield,
  User,
  Briefcase,
  Calendar
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface PerfilEmpresa {
  id?: string;
  user_id?: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  cpf: string;
  inscricao_estadual: string;
  inscricao_municipal: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  celular: string;
  email: string;
  email_financeiro: string;
  site: string;
  regime_tributario: string;
  atividade_principal: string;
  data_abertura: string;
  capital_social: string;
  responsavel_legal: string;
  cpf_responsavel: string;
  contador_nome: string;
  contador_cpf: string;
  contador_crc: string;
  contador_telefone: string;
  contador_email: string;
  certificado_digital: string;
  senha_certificado: string;
  observacoes: string;
}

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState<PerfilEmpresa>({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    cpf: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    celular: '',
    email: '',
    email_financeiro: '',
    site: '',
    regime_tributario: 'simples_nacional',
    atividade_principal: '',
    data_abertura: '',
    capital_social: '',
    responsavel_legal: '',
    cpf_responsavel: '',
    contador_nome: '',
    contador_cpf: '',
    contador_crc: '',
    contador_telefone: '',
    contador_email: '',
    certificado_digital: '',
    senha_certificado: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ type: 'error', text: 'Usuário não autenticado' });
        return;
      }

      const { data, error } = await supabase
        .from('perfil_empresa')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData(data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar perfil da empresa' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage(null);

      // Validações básicas
      if (!formData.razao_social || (!formData.cnpj && !formData.cpf) || !formData.endereco) {
        setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios (Razão Social, CNPJ/CPF e Endereço)' });
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage({ type: 'error', text: 'Usuário não autenticado' });
        return;
      }

      const perfilData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      // Verificar se já existe perfil
      const { data: existingProfile } = await supabase
        .from('perfil_empresa')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingProfile) {
        // Atualizar perfil existente
        result = await supabase
          .from('perfil_empresa')
          .update(perfilData)
          .eq('user_id', user.id);
      } else {
        // Criar novo perfil
        result = await supabase
          .from('perfil_empresa')
          .insert([perfilData]);
      }

      if (result.error) throw result.error;

      setMessage({ type: 'success', text: 'Perfil da empresa salvo com sucesso!' });
      await carregarPerfil();
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil: ' + (error.message || 'Erro desconhecido') });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PerfilEmpresa, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto mb-4"></div>
          <p className="text-gray-400 font-inter">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-[#00E5FF]" />
          Perfil da Empresa
        </h1>
        <p className="text-gray-400 font-inter">
          Configure as informações completas da sua empresa
        </p>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="font-inter">{message.text}</p>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00E5FF]" />
            Dados Básicos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Razão Social *
              </label>
              <input
                type="text"
                required
                value={formData.razao_social}
                onChange={(e) => handleChange('razao_social', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="Ex: Minha Empresa LTDA"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={formData.nome_fantasia}
                onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="Ex: Minha Empresa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CNPJ *
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CPF (para MEI)
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Inscrição Estadual
              </label>
              <input
                type="text"
                value={formData.inscricao_estadual}
                onChange={(e) => handleChange('inscricao_estadual', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="000.000.000.000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Inscrição Municipal
              </label>
              <input
                type="text"
                value={formData.inscricao_municipal}
                onChange={(e) => handleChange('inscricao_municipal', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="000.000.000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Regime Tributário *
              </label>
              <select
                required
                value={formData.regime_tributario}
                onChange={(e) => handleChange('regime_tributario', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
              >
                <option value="simples_nacional">Simples Nacional</option>
                <option value="lucro_presumido">Lucro Presumido</option>
                <option value="lucro_real">Lucro Real</option>
                <option value="mei">MEI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Abertura
              </label>
              <input
                type="date"
                value={formData.data_abertura}
                onChange={(e) => handleChange('data_abertura', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Atividade Principal
              </label>
              <input
                type="text"
                value={formData.atividade_principal}
                onChange={(e) => handleChange('atividade_principal', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="Ex: Comércio varejista de produtos alimentícios"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capital Social
              </label>
              <input
                type="text"
                value={formData.capital_social}
                onChange={(e) => handleChange('capital_social', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="R$ 0,00"
              />
            </div>
          </div>
        </div>

        {/* Responsável Legal */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#00E5FF]" />
            Responsável Legal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.responsavel_legal}
                onChange={(e) => handleChange('responsavel_legal', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="Nome do responsável legal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CPF do Responsável
              </label>
              <input
                type="text"
                value={formData.cpf_responsavel}
                onChange={(e) => handleChange('cpf_responsavel', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00E5FF]" />
            Endereço
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logradouro *
              </label>
              <input
                type="text"
                required
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="Rua, Avenida, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número *
              </label>
              <input
                type="text"
                required
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Complemento
              </label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleChange('complemento', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="Sala, Andar, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bairro *
              </label>
              <input
                type="text"
                required
                value={formData.bairro}
                onChange={(e) => handleChange('bairro', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="Centro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado *
              </label>
              <select
                required
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
              >
                <option value="">Selecione...</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CEP *
              </label>
              <input
                type="text"
                required
                value={formData.cep}
                onChange={(e) => handleChange('cep', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#00E5FF]" />
            Contato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="(00) 0000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Celular
              </label>
              <input
                type="text"
                value={formData.celular}
                onChange={(e) => handleChange('celular', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-mail Principal
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="contato@empresa.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-mail Financeiro
              </label>
              <input
                type="email"
                value={formData.email_financeiro}
                onChange={(e) => handleChange('email_financeiro', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="financeiro@empresa.com.br"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site
              </label>
              <input
                type="url"
                value={formData.site}
                onChange={(e) => handleChange('site', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="https://www.empresa.com.br"
              />
            </div>
          </div>
        </div>

        {/* Dados do Contador */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#00E5FF]" />
            Dados do Contador
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Contador
              </label>
              <input
                type="text"
                value={formData.contador_nome}
                onChange={(e) => handleChange('contador_nome', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="Nome completo do contador"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CPF do Contador
              </label>
              <input
                type="text"
                value={formData.contador_cpf}
                onChange={(e) => handleChange('contador_cpf', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CRC (Registro Profissional)
              </label>
              <input
                type="text"
                value={formData.contador_crc}
                onChange={(e) => handleChange('contador_crc', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="CRC/UF 000000/O-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefone do Contador
              </label>
              <input
                type="text"
                value={formData.contador_telefone}
                onChange={(e) => handleChange('contador_telefone', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-mail do Contador
              </label>
              <input
                type="email"
                value={formData.contador_email}
                onChange={(e) => handleChange('contador_email', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="contador@contabilidade.com.br"
              />
            </div>
          </div>
        </div>

        {/* Certificado Digital (Opcional) */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00E5FF]" />
            Certificado Digital (Opcional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Caminho do Certificado
              </label>
              <input
                type="text"
                value={formData.certificado_digital}
                onChange={(e) => handleChange('certificado_digital', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="Caminho do arquivo .pfx"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha do Certificado
              </label>
              <input
                type="password"
                value={formData.senha_certificado}
                onChange={(e) => handleChange('senha_certificado', e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00E5FF]" />
            Observações
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Informações Adicionais
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all resize-none"
              placeholder="Adicione informações complementares sobre a empresa..."
            />
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all font-inter font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Perfil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

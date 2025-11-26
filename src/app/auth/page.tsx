'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Verificar se o e-mail já existe quando o usuário digita (apenas no cadastro)
  useEffect(() => {
    if (!isLogin && email && email.includes('@')) {
      const timeoutId = setTimeout(async () => {
        await checkEmailExists(email);
      }, 800);

      return () => clearTimeout(timeoutId);
    } else {
      setEmailExists(false);
    }
  }, [email, isLogin]);

  const checkEmailExists = async (emailToCheck: string) => {
    try {
      setCheckingEmail(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToCheck,
        password: 'random-password-check-12345',
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setEmailExists(true);
        } else if (error.message.includes('Email not confirmed')) {
          setEmailExists(true);
        } else {
          setEmailExists(false);
        }
      } else {
        setEmailExists(true);
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Erro ao verificar e-mail:', error);
      setEmailExists(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Mensagens de erro mais claras
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('E-mail não confirmado. Verifique sua caixa de entrada.');
          } else {
            throw error;
          }
        }

        setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
        setTimeout(() => router.push('/'), 1500);
      } else {
        // Cadastro
        if (emailExists) {
          setMessage({ type: 'error', text: 'Este e-mail já está cadastrado no aplicativo!' });
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'As senhas não coincidem!' });
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres!' });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            setMessage({ 
              type: 'error', 
              text: 'Este e-mail já está cadastrado no aplicativo!' 
            });
          } else {
            throw error;
          }
          setLoading(false);
          return;
        }

        setMessage({ 
          type: 'success', 
          text: 'Cadastro realizado! Verifique seu e-mail para confirmar sua conta.' 
        });
        
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setEmailExists(false);
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Ocorreu um erro. Tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      setMessage(null);

      // Verificar se o Supabase está configurado
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuração do Supabase não encontrada. Verifique as variáveis de ambiente.');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error(`Erro ao conectar com ${provider}:`, error);
        
        // Mensagens de erro específicas
        if (error.message.includes('OAuth')) {
          throw new Error(`Erro ao conectar com ${provider}. Verifique se o OAuth está configurado corretamente no Supabase.`);
        } else if (error.message.includes('redirect')) {
          throw new Error('Erro de redirecionamento. Verifique as URLs autorizadas no Supabase.');
        } else {
          throw error;
        }
      }

      // OAuth redireciona automaticamente, então não precisamos fazer nada aqui
    } catch (error: any) {
      console.error('Erro no login social:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || `Erro ao conectar com ${provider}. Tente novamente.` 
      });
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Digite seu e-mail para recuperar a senha.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Erro ao enviar e-mail de recuperação:', error);
        
        if (error.message.includes('not found')) {
          throw new Error('E-mail não encontrado. Verifique se está correto.');
        } else {
          throw error;
        }
      }

      setMessage({ 
        type: 'success', 
        text: 'E-mail de recuperação enviado! Verifique sua caixa de entrada e spam.' 
      });
    } catch (error: any) {
      console.error('Erro ao recuperar senha:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao enviar e-mail de recuperação. Tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4">
            <svg width="120" height="120" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="barGradientAuth" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#00E5FF', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#0099CC', stopOpacity:1}} />
                </linearGradient>
              </defs>
              
              <circle cx="100" cy="100" r="90" fill="#0D0D0D" stroke="#00E5FF" strokeWidth="2" opacity="0.3"/>
              
              <rect x="50" y="110" width="20" height="40" rx="4" fill="url(#barGradientAuth)" opacity="0.7">
                <animate attributeName="height" values="40;50;40" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="y" values="110;100;110" dur="2s" repeatCount="indefinite"/>
              </rect>
              
              <rect x="80" y="90" width="20" height="60" rx="4" fill="url(#barGradientAuth)" opacity="0.85">
                <animate attributeName="height" values="60;70;60" dur="2s" begin="0.3s" repeatCount="indefinite"/>
                <animate attributeName="y" values="90;80;90" dur="2s" begin="0.3s" repeatCount="indefinite"/>
              </rect>
              
              <rect x="110" y="60" width="20" height="90" rx="4" fill="url(#barGradientAuth)">
                <animate attributeName="height" values="90;100;90" dur="2s" begin="0.6s" repeatCount="indefinite"/>
                <animate attributeName="y" values="60;50;60" dur="2s" begin="0.6s" repeatCount="indefinite"/>
              </rect>
              
              <rect x="140" y="80" width="20" height="70" rx="4" fill="url(#barGradientAuth)" opacity="0.8">
                <animate attributeName="height" values="70;80;70" dur="2s" begin="0.9s" repeatCount="indefinite"/>
                <animate attributeName="y" values="80;70;80" dur="2s" begin="0.9s" repeatCount="indefinite"/>
              </rect>
              
              <line x1="40" y1="150" x2="170" y2="150" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round"/>
              
              <circle cx="100" cy="40" r="4" fill="#00E5FF">
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="115" cy="35" r="3" fill="#00E5FF" opacity="0.7">
                <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" begin="0.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="85" cy="35" r="3" fill="#00E5FF" opacity="0.7">
                <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" begin="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <p className="text-gray-400 font-inter">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta e comece agora'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-[#1A1A1A] rounded-xl border border-[#00E5FF]/10">
          <button
            onClick={() => {
              setIsLogin(true);
              setMessage(null);
              setEmailExists(false);
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-inter font-medium transition-all duration-300 ${
              isLogin
                ? 'bg-[#00E5FF] text-white shadow-lg shadow-[#00E5FF]/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setMessage(null);
              setEmailExists(false);
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-inter font-medium transition-all duration-300 ${
              !isLogin
                ? 'bg-[#00E5FF] text-white shadow-lg shadow-[#00E5FF]/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cadastro
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome (apenas no cadastro) */}
          {!isLogin && (
            <div className="space-y-2 animate-slide-in">
              <label className="text-sm font-inter text-gray-300">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg py-3 px-10 text-white font-inter focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all"
                  placeholder="Digite seu nome"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-inter text-gray-300">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMessage(null);
                }}
                className={`w-full bg-[#1A1A1A] border rounded-lg py-3 px-10 text-white font-inter focus:outline-none focus:ring-2 transition-all ${
                  !isLogin && emailExists
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[#00E5FF]/20 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20'
                }`}
                placeholder="seu@email.com"
                required
              />
              {!isLogin && checkingEmail && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-[#00E5FF] animate-spin" />
                </div>
              )}
            </div>
            
            {!isLogin && emailExists && !checkingEmail && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-slide-in">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400 font-inter">
                  Este e-mail já tem cadastro no aplicativo. Faça login ou use outro e-mail.
                </p>
              </div>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label className="text-sm font-inter text-gray-300">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg py-3 px-10 text-white font-inter focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00E5FF] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha (apenas no cadastro) */}
          {!isLogin && (
            <div className="space-y-2 animate-slide-in">
              <label className="text-sm font-inter text-gray-300">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg py-3 px-10 text-white font-inter focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all"
                  placeholder="••••••••"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00E5FF] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Lembrar-me e Esqueci senha (apenas no login) */}
          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#00E5FF]/20 bg-[#1A1A1A] text-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 cursor-pointer"
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors font-inter">
                  Lembrar-me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[#00E5FF] hover:text-[#00CCDD] transition-colors font-inter"
              >
                Esqueci a senha
              </button>
            </div>
          )}

          {/* Mensagem de feedback */}
          {message && (
            <div
              className={`p-4 rounded-lg border animate-slide-in ${
                message.type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              <p className="text-sm font-inter">{message.text}</p>
            </div>
          )}

          {/* Botão de submit */}
          <button
            type="submit"
            disabled={loading || (!isLogin && emailExists)}
            className="w-full bg-[#00E5FF] hover:bg-[#00CCDD] text-white font-inter font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>{isLogin ? 'Entrar' : 'Cadastrar'}</>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#00E5FF]/20"></div>
          <span className="text-sm text-gray-400 font-inter">ou continue com</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#00E5FF]/20"></div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#00E5FF]/10 hover:border-[#00E5FF]/30 text-white font-inter py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#00E5FF]/10 hover:border-[#00E5FF]/30 text-white font-inter py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

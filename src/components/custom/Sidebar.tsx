'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Briefcase, 
  Layers,
  ShoppingCart,
  Warehouse,
  DollarSign,
  Truck,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  HelpCircle,
  ChefHat,
  Factory,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Clientes', href: '/clientes' },
  { icon: Package, label: 'Produtos', href: '/produtos' },
  { icon: Briefcase, label: 'Serviços', href: '/servicos' },
  { icon: Layers, label: 'Insumos', href: '/insumos' },
  { icon: ChefHat, label: 'Receitas', href: '/receitas' },
  { icon: FileText, label: 'Orçamentos', href: '/orcamentos' },
  { icon: Factory, label: 'Produção', href: '/producao' },
  { icon: ShoppingCart, label: 'Vendas', href: '/vendas' },
  { icon: Warehouse, label: 'Estoque', href: '/estoque' },
  { icon: DollarSign, label: 'Financeiro', href: '/financeiro' },
  { icon: Truck, label: 'Fornecedores', href: '/fornecedores' },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  { icon: HelpCircle, label: 'Suporte', href: '/suporte' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário');
      }
    };

    getUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0D0D0D] border border-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-[#0D0D0D] border-r border-[#00E5FF]/10
          w-64 z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#00E5FF]/10">
            <div className="flex items-center gap-3">
              {/* Logo Original com Gráficos de Barras */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="barGradientSidebar" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#00E5FF', stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:'#0099CC', stopOpacity:1}} />
                    </linearGradient>
                  </defs>
                  
                  {/* Bar Chart Representation */}
                  <rect x="50" y="110" width="20" height="40" rx="4" fill="url(#barGradientSidebar)" opacity="0.7"/>
                  <rect x="80" y="90" width="20" height="60" rx="4" fill="url(#barGradientSidebar)" opacity="0.85"/>
                  <rect x="110" y="60" width="20" height="90" rx="4" fill="url(#barGradientSidebar)"/>
                  <rect x="140" y="80" width="20" height="70" rx="4" fill="url(#barGradientSidebar)" opacity="0.8"/>
                  
                  {/* Base Line */}
                  <line x1="40" y1="150" x2="170" y2="150" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round"/>
                  
                  {/* Accent Dots */}
                  <circle cx="100" cy="40" r="4" fill="#00E5FF"/>
                  <circle cx="115" cy="35" r="3" fill="#00E5FF" opacity="0.7"/>
                  <circle cx="85" cy="35" r="3" fill="#00E5FF" opacity="0.7"/>
                </svg>
              </div>
              
              {/* Texto */}
              <div>
                <h1 className="text-xl font-inter font-bold text-white">
                  Gestor<span className="text-[#00E5FF]">Pro</span>
                </h1>
                <p className="text-xs text-gray-400 tracking-wider">SISTEMA DE GESTÃO</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20' 
                      : 'text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/5'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#00E5FF]' : ''}`} />
                  <span className="font-inter text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#00E5FF]/10 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#00E5FF]/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF] to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-inter font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-inter text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

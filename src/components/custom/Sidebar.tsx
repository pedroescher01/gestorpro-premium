'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Factory,
  Calculator,
  FileCheck,
  PackageCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  name: string;
  icon: any;
  path: string;
  submenu?: { name: string; path: string }[];
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { 
      name: 'Produtos', 
      icon: Package, 
      path: '/produtos',
      submenu: [
        { name: 'Lista de Produtos', path: '/produtos' },
        { name: 'Insumos', path: '/insumos' },
        { name: 'Fornecedores', path: '/fornecedores' }
      ]
    },
    { name: 'Serviços', icon: Briefcase, path: '/servicos' },
    { name: 'Vendas', icon: ShoppingCart, path: '/vendas' },
    { name: 'Orçamentos', icon: FileText, path: '/orcamentos' },
    { name: 'NFE', icon: FileCheck, path: '/nfe' },
    { name: 'Produção', icon: Factory, path: '/producao' },
    { name: 'Recebimentos', icon: PackageCheck, path: '/recebimentos' },
    { name: 'Financeiro', icon: DollarSign, path: '/financeiro' },
    { name: 'Calculadora', icon: Calculator, path: '/calculadora-bobina' },
    { name: 'Configurações', icon: Settings, path: '/configuracoes' },
  ];

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white hover:bg-[#00E5FF]/10 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-64 bg-[#0D0D0D] border-r border-[#00E5FF]/10
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#00E5FF]/10">
          <h1 className="text-2xl font-inter font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00E5FF] to-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            GestorPro
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-inter">Sistema de Gestão</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`
                      w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200 font-inter
                      ${isActive(item.path)
                        ? 'bg-gradient-to-r from-[#00E5FF]/20 to-blue-600/20 text-[#00E5FF] border border-[#00E5FF]/30'
                        : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {expandedMenus.includes(item.name) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedMenus.includes(item.name) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          onClick={() => setIsOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-2 rounded-lg
                            transition-all duration-200 font-inter text-sm
                            ${isActive(subItem.path)
                              ? 'bg-gradient-to-r from-[#00E5FF]/20 to-blue-600/20 text-[#00E5FF] border border-[#00E5FF]/30'
                              : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-white'
                            }
                          `}
                        >
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 font-inter
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-[#00E5FF]/20 to-blue-600/20 text-[#00E5FF] border border-[#00E5FF]/30'
                      : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#00E5FF]/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-200 font-inter font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  X
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Clientes', href: '/clientes' },
  { icon: Package, label: 'Produtos', href: '/produtos' },
  { icon: Briefcase, label: 'Serviços', href: '/servicos' },
  { icon: Layers, label: 'Insumos', href: '/insumos' },
  { icon: ShoppingCart, label: 'Vendas', href: '/vendas' },
  { icon: Warehouse, label: 'Estoque', href: '/estoque' },
  { icon: DollarSign, label: 'Financeiro', href: '/financeiro' },
  { icon: Truck, label: 'Fornecedores', href: '/fornecedores' },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
            <h1 className="text-2xl font-inter font-bold text-[#00E5FF] tracking-tight">
              GestorPro
            </h1>
            <p className="text-xs text-gray-400 mt-1">Sistema de Gestão</p>
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
          <div className="p-4 border-t border-[#00E5FF]/10">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#00E5FF]/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF] to-blue-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm font-inter font-medium text-white">Admin</p>
                <p className="text-xs text-gray-400">admin@gestorpro.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  FolderTree,
  GitBranch,
  Package,
  Users,
  Settings,
  LogOut,
  User,
  BookOpen,
  Database,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import logo from '../../imports/logo.png';

interface MenuItem {
  path?: string;
  label: string;
  icon: React.ElementType;
  children?: { path: string; label: string; icon: React.ElementType }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Master',
    icon: Database,
    children: [
      { path: '/categories', label: 'Categories', icon: FolderTree },
      { path: '/subcategories', label: 'Subcategories', icon: GitBranch },
    ]
  },
  { path: '/items', label: 'Products', icon: Package },
  { path: '/catalogues', label: 'Catalogues', icon: BookOpen },
  { path: '/all-pdfs', label: 'All PDFs', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [masterMenuOpen, setMasterMenuOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.background }}>
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } transition-all duration-300 flex flex-col`}
        style={{ backgroundColor: colors.sidebarBg, borderRight: `1px solid ${colors.border}` }}
      >
        <div className="p-4 border-b flex items-center justify-center" style={{ borderColor: colors.border }}>
          <img
            src={logo}
            alt="Gift Ideas Logo"
            style={{
              height: sidebarOpen ? '60px' : '50px',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            // Handle nested menu (Master)
            if (item.children) {
              const hasActiveChild = item.children.some(child => location.pathname === child.path);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setMasterMenuOpen(!masterMenuOpen)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition"
                    title={!sidebarOpen ? item.label : undefined}
                    style={{
                      backgroundColor: hasActiveChild ? colors.cardBg : 'transparent',
                      color: hasActiveChild ? colors.accent.gold : colors.text.secondary,
                      boxShadow: hasActiveChild ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!hasActiveChild) e.currentTarget.style.backgroundColor = colors.hover;
                    }}
                    onMouseLeave={(e) => {
                      if (!hasActiveChild) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="text-sm font-medium flex-1 text-left" style={{ letterSpacing: '0.3px' }}>
                          {item.label}
                        </span>
                        {masterMenuOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </button>
                  {masterMenuOpen && sidebarOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg transition"
                            style={{
                              backgroundColor: isActive ? colors.hover : 'transparent',
                              color: isActive ? colors.accent.gold : colors.text.tertiary,
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = colors.hover;
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <ChildIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-medium" style={{ letterSpacing: '0.3px' }}>
                              {child.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Handle regular menu items
            const isActive = location.pathname === item.path ||
                           (item.path === '/catalogues' && location.pathname.startsWith('/catalogue'));
            return (
              <Link
                key={item.path}
                to={item.path!}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition"
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  backgroundColor: isActive ? colors.cardBg : 'transparent',
                  color: isActive ? colors.accent.gold : colors.text.secondary,
                  boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = colors.hover;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium" style={{ letterSpacing: '0.3px' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-3 border-t" style={{ borderColor: colors.border }}>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition"
              style={{
                backgroundColor: userMenuOpen ? colors.hover : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!userMenuOpen) e.currentTarget.style.backgroundColor = colors.hover;
              }}
              onMouseLeave={(e) => {
                if (!userMenuOpen) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.accent.gold }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {currentUser?.name}
                  </p>
                  <p className="text-xs capitalize" style={{ color: colors.text.tertiary }}>
                    {currentUser?.role}
                  </p>
                </div>
              )}
            </button>

            {userMenuOpen && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-lg"
                style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm rounded-lg transition hover:bg-red-500/10"
                  style={{ color: '#DC2626' }}
                >
                  <LogOut className="w-4 h-4" />
                  {sidebarOpen && <span>Logout</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto" style={{ backgroundColor: colors.background }}>
        <Outlet />
        <footer
          className="px-4 py-3 text-center text-xs border-t mt-2"
          style={{
            borderColor: colors.border,
            color: colors.text.secondary,
            backgroundColor: colors.cardBg,
          }}
        >
          Copyright Metaphi Innovations Private Limited
        </footer>
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Scissors,
  Calendar,
  Users,
  Menu as MenuIcon,
  X,
  LogOut,
  BarChart2,
  PlusSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'ダッシュボード', path: '/dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { name: '予約一覧', path: '/appointments', icon: <Calendar className="w-5 h-5" /> },
    { name: '顧客管理', path: '/customers', icon: <Users className="w-5 h-5" /> },
    { name: 'サービス管理', path: '/services', icon: <Scissors className="w-5 h-5" /> },
    { name: '休日設定', path: '/holidays', icon: <PlusSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* モバイル用サイドバー */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">サイドバーを閉じる</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex flex-col items-center text-center px-4 cursor-pointer">
              <p className="text-xs text-gray-500 tracking-widest font-great">Hair Salon</p>
              <h1 className="text-lg font-luana tracking-widest text-gray-700">
                LUANA • S • MIRUTO
              </h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${location.pathname.startsWith(item.path)
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              className="flex items-center text-gray-600 hover:text-gray-900"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>

      {/* デスクトップ用サイドバー */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex flex-col items-center text-center px-4 cursor-pointer">
                <p className="text-xs text-gray-500 tracking-widest font-great">Hair Salon</p>
                <h1 className="text-lg font-luana tracking-widest text-gray-700">
                  LUANA • S • MIRUTO
                </h1>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${location.pathname.startsWith(item.path)
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                className="flex items-center text-gray-600 hover:text-gray-900"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-col w-full">
        {/* モバイル用ヘッダーメニュー */}
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">サイドバーを開く</span>
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

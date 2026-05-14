import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    BarChart3
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../config/translations';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user] = useState(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch {
            return null;
        }
    });
    const { language } = useLanguage();
    const t = translations[language];

    // Determine active tab based on URL
    const getActiveTab = () => {
        const path = location.pathname.split('/').pop();
        if (path === 'seller-dashboard' || path === '') return 'overview';
        return path;
    };

    const activeTab = getActiveTab();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'farmer') {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
    };

    const menuItems = [
        { id: 'overview', label: t.sellerDashboard.overview, icon: LayoutDashboard, path: '/seller-dashboard' },
        { id: 'products', label: t.sellerDashboard.products, icon: Package, path: '/seller-dashboard/products' },
        { id: 'orders', label: t.sellerDashboard.orders, icon: ShoppingCart, path: '/seller-dashboard/orders' },
        { id: 'reports', label: t.sellerDashboard.reports, icon: BarChart3, path: '/seller-dashboard/reports' },
        // { id: 'settings', label: t.sellerDashboard.settings, icon: Settings, path: '/seller-dashboard/settings' }, // Uncomment when settings page is ready
    ];

    if (!user) return null; // Or a loading spinner

    return (
        <div className={`min-h-screen bg-gray-50 flex font-outfit ${language === 'si' ? 'font-sinhala' : ''}`}>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo area */}
                    <div className="p-8 border-b border-gray-50">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{t.sellerDashboard.title}</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-6 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onClick={() => {
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-6 border-t border-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-200">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium"
                        >
                            <LogOut size={18} />
                            {t.sellerDashboard.signOut}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-6 md:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 capitalize hidden sm:block">
                            {activeTab === 'overview' ? t.sellerDashboard.dashboardOverview :
                                activeTab === 'products' ? t.sellerDashboard.products :
                                    activeTab === 'orders' ? t.sellerDashboard.orders :
                                        activeTab === 'reports' ? t.sellerDashboard.reports :
                                            activeTab}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <Link to="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                            {t.sellerDashboard.visitStore}
                        </Link>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SellerDashboard;

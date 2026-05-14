
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Package, ChevronDown, CheckCircle, AlertCircle, Filter, X, Trash2 } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';
import { useLanguage } from '../../../context/LanguageContext';
import { translations } from '../../../config/translations';

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const PAY_STATUS_COLORS = {
    paid: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    failed: 'bg-red-100 text-red-800',
};

const getStatusOptions = (t) => [
    { value: 'pending', label: t.sellerDashboard.ordersPage.statuses.pending },
    { value: 'confirmed', label: t.sellerDashboard.ordersPage.statuses.confirmed },
    { value: 'processing', label: t.sellerDashboard.ordersPage.statuses.processing },
    { value: 'shipped', label: t.sellerDashboard.ordersPage.statuses.shipped },
    { value: 'delivered', label: t.sellerDashboard.ordersPage.statuses.delivered },
    { value: 'cancelled', label: t.sellerDashboard.ordersPage.statuses.cancelled },
];

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatus] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const { language } = useLanguage();
    const t = translations[language];
    const statusOptions = getStatusOptions(t);
    const [notification, setNotification] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/seller-orders');
           let ordersData = [];
            if (data && Array.isArray(data.data)) {
                ordersData = data.data;
            } else if (Array.isArray(data)) {
                ordersData = data;
            } else if (data && typeof data === 'object' && data.data && typeof data.data === 'object') {
                // In case it serialized as an object with numeric keys
                ordersData = Object.values(data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (o) =>
                    String(o.id).includes(q) ||
                    o.customer?.toLowerCase().includes(q) ||
                    o.email?.toLowerCase().includes(q) ||
                    o.city?.toLowerCase().includes(q)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter((o) => o.status === statusFilter);
        }

        setFiltered(result);
    }, [search, statusFilter, orders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus });
            const updatedOrders = orders.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            );
            setOrders(updatedOrders);
            setOrders(updatedOrders);
            const successMsg = t.sellerDashboard.ordersPage.notifications.updateSuccess
                .replace('$1', orderId)
                .replace('$2', newStatus);
            showNotification('success', successMsg);
        } catch (err) {
            console.error(err);
            showNotification('error', t.sellerDashboard.ordersPage.notifications.updateError);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm(t.sellerDashboard.ordersPage.deleteConfirm)) return;

        try {
            await api.delete(`/orders/${orderId}`);
            setOrders(orders.filter(o => o.id !== orderId));
            setFiltered(filtered.filter(o => o.id !== orderId));
            showNotification('success', t.sellerDashboard.ordersPage.notifications.deleteSuccess);
        } catch (err) {
            console.error(err);
            showNotification('error', 'Failed to delete order');
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const getStatusStyle = (status) =>
        STATUS_COLORS[status?.toLowerCase()] ?? 'bg-gray-100 text-gray-800 border-gray-200';

    return (
        <div className="font-outfit relative min-h-[500px]">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <Motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-medium text-sm backdrop-blur-md ${notification.type === 'success'
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-red-500/90 text-white'
                            }`}
                    >
                        {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {notification.message}
                    </Motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t.sellerDashboard.ordersPage.title}</h2>
                    <p className="text-gray-500 mt-1">{t.sellerDashboard.ordersPage.subtitle}</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    {t.sellerDashboard.ordersPage.refresh}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center hover:shadow-md transition-shadow">
                <div className="relative w-full sm:w-96">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.sellerDashboard.ordersPage.searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-emerald-500 rounded-lg outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative group min-w-[160px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full appearance-none pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-emerald-500 focus:border-emerald-500 outline-none cursor-pointer transition-colors"
                        >
                            <option value="all">{t.sellerDashboard.ordersPage.allStatuses}</option>
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
                        <p className="text-sm font-medium">{t.sellerDashboard.ordersPage.loading}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                            <Package size={40} className="text-gray-300" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-gray-900 mb-1">{t.sellerDashboard.ordersPage.noOrders}</p>
                            <p className="text-sm max-w-xs mx-auto text-gray-500">
                                {orders.length === 0
                                    ? t.sellerDashboard.ordersPage.noOrdersDesc
                                    : t.sellerDashboard.ordersPage.noFilterMatch}
                            </p>
                        </div>
                        {search || statusFilter !== 'all' ? (
                            <button
                                onClick={() => { setSearch(''); setStatus('all'); }}
                                className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1"
                            >
                                <X size={14} /> {t.sellerDashboard.ordersPage.clearFilters}
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.ordersPage.tableHeaders.orderDetails}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.ordersPage.tableHeaders.date}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.ordersPage.tableHeaders.customer}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.ordersPage.tableHeaders.total}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.ordersPage.tableHeaders.status}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t.sellerDashboard.ordersPage.tableHeaders.payment}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t.sellerDashboard.ordersPage.tableHeaders.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                                                    #{order.id}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{order.items} {t.sellerDashboard.ordersPage.items}</p>
                                                    <p className="text-xs text-gray-500">{t.sellerDashboard.ordersPage.viewDetails}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(order.date || order.created_at).toLocaleDateString()}
                                            <p className="text-xs text-gray-400">
                                                {new Date(order.date || order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {order.customer?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                                                    <p className="text-xs text-gray-500">{order.city || t.sellerDashboard.ordersPage.local}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            LKR {Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative group/status w-36">
                                                <select
                                                    disabled={updatingId === order.id}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500/30 transition-all ${getStatusStyle(order.status)} border-transparent`}
                                                >
                                                    {statusOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    {updatingId === order.id ? (
                                                        <RefreshCw size={12} className="animate-spin text-gray-500" />
                                                    ) : (
                                                        <ChevronDown size={12} className="text-current opacity-60" />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex flex-col items-end">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1 ${PAY_STATUS_COLORS[order.payment_status?.toLowerCase()] ?? 'bg-gray-100 text-gray-800'}`}>
                                                    {order.payment_status}
                                                </span>
                                                <span className="text-xs text-gray-500">{order.payment}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;

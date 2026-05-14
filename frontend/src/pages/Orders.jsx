import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    CalendarRange,
    ChevronDown,
    MapPin,
    CreditCard,
    Wallet,
    ArrowRight,
    ShoppingBag,
    Receipt,
    XCircle,
    PackageCheck,
    AlertCircle
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const { language } = useLanguage();
    const t = translations[language];

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            navigate('/login');
            return;
        }

        fetchOrders();
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders');
            // Handle paginated response from backend
            const orderData = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setOrders(orderData);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock };
            case 'confirmed': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle2 };
            case 'shipped': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Truck };
            case 'delivered': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: PackageCheck };
            case 'cancelled': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle };
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: Package };
        }
    };

    return (
        <div className={`min-h-screen bg-slate-50 font-outfit ${language === 'si' ? 'font-sinhala' : ''}`}>
            {/* Hero Section */}
            <section className="relative h-[45vh] min-h-[400px] w-full overflow-hidden">
                <img
                    src="https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=1600"
                    alt="Fields"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-slate-50" />

                <div className="relative z-10 h-full flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center pb-20">
                        <div className="text-center px-4 max-w-4xl mx-auto">
                            <Motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="text-4xl sm:text-6xl font-semibold text-white mb-6 tracking-tight"
                            >
                                <span className="block">{t.orders.manageYour}</span>
                                <span className="text-emerald-300">{t.orders.harvestHistory}</span>
                            </Motion.h1>
                            <Motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="text-slate-200 text-lg sm:text-xl font-light"
                            >
                                {t.orders.heroDesc}
                            </Motion.p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 pb-24">
                {/* Stats / Summary or Back Button could go here if needed */}
                <div className="flex justify-end mb-6">
                    <Motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 text-sm font-semibold text-emerald-950 shadow-sm hover:bg-white/20 transition-all"
                    >
                        <ShoppingBag size={18} strokeWidth={1.5} className="mr-2" />
                        {t.orders.backToShop}
                    </Motion.button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                    </div>
                ) : orders.length === 0 ? (
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] shadow-xl shadow-emerald-900/5 p-16 text-center border border-emerald-100"
                    >
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300 mx-auto mb-8">
                            <Package size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">{t.orders.noOrdersTitle}</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                            {t.orders.noOrdersDesc}
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all hover:scale-105"
                        >
                            {t.orders.startShopping}
                            <ArrowRight size={20} strokeWidth={1.5} className="ml-2" />
                        </Link>
                    </Motion.div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => {
                            const statusStyle = getStatusStyles(order.status);
                            const StatusIcon = statusStyle.icon;

                            return (
                                <Motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div
                                        onClick={() => toggleOrder(order.id)}
                                        className="p-6 sm:p-8 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex items-start gap-6">
                                                <div className={`p-4 rounded-2xl ${statusStyle.bg} ${statusStyle.text} hidden sm:flex transition-transform duration-300 group-hover:scale-110`}>
                                                    <StatusIcon size={28} strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-slate-900">{t.orders.orderId}{order.id}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                            <span className="capitalize">{t.orders.status[order.status] || order.status}</span>
                                                        </span>
                                                        {order.payment_status === 'paid' ? (
                                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                                                <CheckCircle2 size={12} strokeWidth={2} /> {t.orders.status.paid}
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                                                <AlertCircle size={12} strokeWidth={2} /> {order.payment_status === 'failed' ? t.orders.status.failed : t.orders.status.pending}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center text-sm text-slate-500 gap-4 sm:gap-6">
                                                        <span className="flex items-center gap-2">
                                                            <CalendarRange size={16} strokeWidth={1.5} className="text-slate-400" />
                                                            {new Date(order.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full" />
                                                        <span className="flex items-center gap-2">
                                                            <Receipt size={16} strokeWidth={1.5} className="text-slate-400" />
                                                            {order.items?.length || 0} {t.orders.items}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
                                                <div className="text-left lg:text-right">
                                                    <p className="text-sm font-medium text-slate-500 mb-1">{t.orders.totalAmount}</p>
                                                    <p className="text-2xl font-bold text-emerald-600">
                                                        LKR {Number(order.total_price).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className={`w-12 h-12 rounded-full border border-slate-100 bg-white flex items-center justify-center text-slate-400 transform transition-all duration-300 group-hover:border-emerald-200 group-hover:text-emerald-600 ${expandedOrder === order.id ? 'rotate-180 bg-emerald-50 text-emerald-600 border-emerald-200' : ''}`}>
                                                    <ChevronDown size={24} strokeWidth={1.5} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedOrder === order.id && (
                                            <Motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="border-t border-slate-100 bg-slate-50/50"
                                            >
                                                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                    {/* Order Details */}
                                                    <div className="lg:col-span-2 space-y-6">
                                                        <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                                                            <ShoppingBag size={18} strokeWidth={1.5} className="text-emerald-600" />
                                                            {t.orders.itemsHeader}
                                                        </h4>
                                                        <div className="space-y-4">
                                                            {order.items?.map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01]"
                                                                >
                                                                    <div className="h-20 w-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative group/image">
                                                                        <img
                                                                            src={(() => {
                                                                                let img = item.product?.images;
                                                                                if (Array.isArray(img) && img.length > 0) return img[0];
                                                                                if (typeof img === 'string') {
                                                                                    try {
                                                                                        const parsed = JSON.parse(img);
                                                                                        return Array.isArray(parsed) ? parsed[0] : parsed;
                                                                                    } catch {
                                                                                        return img;
                                                                                    }
                                                                                }
                                                                                return 'https://placehold.co/100';
                                                                            })()}
                                                                            alt={item.product?.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 w-full text-center sm:text-left">
                                                                        <h5 className="font-semibold text-slate-900 text-lg">
                                                                            {item.product?.name || 'Product Item'}
                                                                        </h5>
                                                                        <p className="text-sm text-slate-500">
                                                                            {t.orders.unit}: LKR {Number(item.price).toFixed(2)} × {item.quantity}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right font-bold text-emerald-600 text-lg">
                                                                        LKR {(Number(item.price) * item.quantity).toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Delivery & Payment Info */}
                                                    <div className="space-y-8">
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                                                <Truck size={18} strokeWidth={1.5} className="text-emerald-600" />
                                                                {t.orders.deliveryDetails}
                                                            </h4>
                                                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="mt-1 p-2 bg-emerald-50 text-emerald-600 rounded-full">
                                                                        <MapPin size={20} strokeWidth={1.5} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-900">{t.orders.shippingAddress}</p>
                                                                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                                                            {order.shipping_address}<br />
                                                                            {order.city} {order.zip}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="border-t border-slate-50 pt-4 flex items-start gap-4">
                                                                    <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-full">
                                                                        {order.payment_method === 'cod' ? (
                                                                            <Wallet size={20} strokeWidth={1.5} />
                                                                        ) : (
                                                                            <CreditCard size={20} strokeWidth={1.5} />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-900">{t.orders.paymentMethod}</p>
                                                                        <p className="text-sm text-slate-600 mt-1 capitalize">
                                                                            {order.payment_method === 'cod' ? t.orders.cod : order.payment_method}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Footer */}
                                                <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <span className="text-xs text-slate-400">
                                                        {t.orders.orderId}{order.id} • {t.orders.placedOn} {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-2">
                                                        <AlertCircle size={16} strokeWidth={1.5} />
                                                        {t.orders.needHelp}
                                                    </button>
                                                </div>
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </Motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Orders;

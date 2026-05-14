
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Package, Truck, CheckCircle, Clock, Calendar, ChevronDown, ChevronUp, MapPin, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const BuyerDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!token || !storedUser) {
            navigate('/login');
            return;
        } else if (storedUser.role !== 'buyer' && storedUser.role !== 'farmer') {
            // Allow both buyers and farmers to access this dashboard
            navigate('/');
            return;
        }

        fetchOrders(token);
    }, [navigate]);

    const fetchOrders = async (token) => {
        try {
            const response = await axios.get('http://localhost:8000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrderMain = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <CheckCircle size={16} />;
            default: return <Package size={16} />;
        }
    };

    const getPaymentStatusColor = (ps) => {
        switch (ps) {
            case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-outfit flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-500 mt-2">Manage and track your recent purchases.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-6">
                            <Package size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                        <Link
                            to="/"
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors inline-block"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
                            >
                                {/* Order Header */}
                                <div
                                    onClick={() => toggleOrderMain(order.id)}
                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                                <Package size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        <span className="capitalize">{order.status}</span>
                                                    </span>
                                                    {/* Payment status badge */}
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.payment_status)}`}>
                                                        {order.payment_method === 'card' ? <CreditCard size={12} className="inline mr-1" /> : <Banknote size={12} className="inline mr-1" />}
                                                        {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'failed' ? 'Payment Failed' : order.payment_method === 'cod' ? 'Cash on Delivery' : 'Payment Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500 gap-4">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={14} />
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{order.items?.length || 0} items</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 mb-0.5">Total Amount</p>
                                                <p className="text-lg font-bold text-emerald-600">LKR {Number(order.total_price).toFixed(2)}</p>
                                            </div>
                                            <div className={`transform transition-transform duration-200 ${expandedOrder === order.id ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} className="text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details (Expandable) */}
                                <AnimatePresence>
                                    {expandedOrder === order.id && (
                                        <Motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-t border-gray-100 bg-gray-50/30"
                                        >
                                            <div className="p-6">
                                                {/* Shipping Info */}
                                                <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                                                    <MapPin className="text-gray-400 mt-1" size={20} />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Shipping Address</h4>
                                                        <p className="text-sm text-gray-600">{order.shipping_address}</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {order.city}, {order.zip}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <h4 className="font-semibold text-gray-900 mb-4">Items</h4>
                                                <div className="space-y-4">
                                                    {order.items?.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
                                                            <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={(() => {
                                                                        let img = item.product?.images;
                                                                        if (Array.isArray(img) && img.length > 0) return img[0];
                                                                        if (typeof img === 'string') {
                                                                            try {
                                                                                const parsed = JSON.parse(img);
                                                                                return Array.isArray(parsed) ? parsed[0] : parsed;
                                                                            } catch { return img; }
                                                                        }
                                                                        return "https://placehold.co/100";
                                                                    })()}
                                                                    alt={item.product?.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h5 className="font-medium text-gray-900 md:text-lg">{item.product?.name || 'Unknown Product'}</h5>
                                                                <p className="text-sm text-gray-500">Unit Price: LKR {Number(item.price).toFixed(2)}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-gray-600">Qty: {item.quantity}</p>
                                                                <p className="text-emerald-600 font-bold">LKR {(Number(item.price) * item.quantity).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default BuyerDashboard;

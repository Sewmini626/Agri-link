
import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Users, Activity, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <Motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color.replace('bg-', 'text-')}`}>
            <Icon size={80} />
        </div>

        <div className="flex justify-between items-start z-10">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100 ${color.replace('bg-', 'text-')}`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {trendValue}
                </div>
            )}
        </div>

        <div className="z-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-1 font-outfit">{value}</h3>
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
    </Motion.div>
);

const Overview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        products: 0,
        customers: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch concurrent data
                const [productsRes, ordersRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/my-products', config),
                    axios.get('http://localhost:8000/api/seller-orders', config)
                ]);

                const products = productsRes.data.data || productsRes.data || [];
                const orders = ordersRes.data.data || ordersRes.data || [];

                // Calculate Stats
                const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
                const uniqueCustomers = new Set(orders.map(o => o.email)).size;

                setStats({
                    revenue: totalRevenue,
                    orders: orders.length,
                    products: products.length,
                    customers: uniqueCustomers
                });

                // Recent Activity (Top 5 recent orders)
                const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setRecentActivity(sortedOrders.slice(0, 5));

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 h-40 rounded-3xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 font-outfit">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`LKR ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    trend="up"
                    trendValue="+12%" // Placeholder trend
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders}
                    icon={ShoppingBag}
                    color="bg-blue-500"
                    trend="up"
                    trendValue="+5%" // Placeholder trend
                />
                <StatCard
                    title="Total Products"
                    value={stats.products}
                    icon={Package}
                    color="bg-purple-500"
                    trend="up" // Placeholder
                    trendValue="Active"
                />
                <StatCard
                    title="Total Customers"
                    value={stats.customers}
                    icon={Users}
                    color="bg-orange-500"
                    trend="up"
                    trendValue="+2" // Placeholder
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Placeholder - Improved Visuals */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Revenue Analytics</h3>
                            <p className="text-sm text-gray-500">Overview of your earnings over the year</p>
                        </div>
                        <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-3 sm:gap-4 px-2">
                        {/* Mock Chart Data - could be replaced with real monthly aggregations */}
                        {[35, 45, 30, 60, 55, 75, 50, 65, 80, 70, 90, 85].map((h, i) => (
                            <div key={i} className="w-full h-full flex flex-col justify-end group">
                                <Motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                                    className="w-full bg-emerald-100 rounded-t-xl relative group-hover:bg-emerald-500 transition-colors duration-300"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl z-20 whitespace-nowrap">
                                        LKR {(h * 150).toLocaleString()}
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                </Motion.div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                            <span key={i} className="text-center w-full">{m}</span>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                        <Activity size={20} className="text-emerald-500" />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar max-h-[400px]">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((order, i) => (
                                <div key={order.id || i} className="flex items-start gap-4 group">
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white shadow-sm ${i === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        <ShoppingBag size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                        <p className="text-sm text-gray-900 font-semibold truncate">
                                            New order <span className="text-emerald-600">#{order.id}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                            From {order.customer || order.email}
                                        </p>
                                        <p className="text-xs font-medium text-gray-400 mt-2">
                                            {new Date(order.created_at || Date.now()).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-gray-900 block">LKR {Number(order.total).toFixed(2)}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/seller-dashboard/orders')}
                        className="w-full mt-6 py-3.5 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 group"
                    >
                        View All Activity
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Overview;

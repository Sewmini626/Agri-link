import { useEffect, useState } from 'react';
import api from '../api';
import { Users, ShoppingBag, ClipboardList, DollarSign } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        orders: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, productsRes, ordersRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/products'),
                    api.get('/orders')
                ]);

                const ordersData = ordersRes.data.data || ordersRes.data || [];
                const totalRevenue = Array.isArray(ordersData) 
                    ? ordersData.reduce((acc, order) => acc + parseFloat(order.total_price || 0), 0)
                    : 0;

                setStats({
                    users: usersRes.data.total || usersRes.data.length || 0,
                    products: productsRes.data.total || productsRes.data.length || 0,
                    orders: ordersRes.data.total || ordersRes.data.length || 0,
                    revenue: totalRevenue
                });
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const cards = [
        { title: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Active Products', value: stats.products, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Total Orders', value: stats.orders, icon: ClipboardList, color: 'text-violet-600', bg: 'bg-violet-50' },
        { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for charts or recent activity */}
            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome to AgriLink Admin</h2>
                <p className="text-gray-600">Use the sidebar to navigate and manage platform resources.</p>
            </div>
        </div>
    );
}
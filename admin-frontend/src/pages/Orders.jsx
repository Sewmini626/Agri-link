import { useEffect, useState } from 'react';
import api from '../api';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders'); // Admin gets all orders
            setOrders(res.data.data || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}`, { status });
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-gray-500">Order ID</th>
                                <th className="p-4 font-medium text-gray-500">Customer</th>
                                <th className="p-4 font-medium text-gray-500">Total Price</th>
                                <th className="p-4 font-medium text-gray-500">Status</th>
                                <th className="p-4 font-medium text-gray-500">Date</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">#{order.id}</td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{order.first_name} {order.last_name}</p>
                                            <p className="text-xs text-gray-500">{order.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium">LKR {order.total_price}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} uppercase`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

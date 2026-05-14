import { useEffect, useState } from 'react';
import api from '../api';
import { Trash2, Edit, Check, X } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', role: 'buyer', password: '', phone: '', address: ''
    });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            const usersData = res.data?.data ? res.data.data : res.data;
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (err) {
            console.error(err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(u => u.id !== id));
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (editingUser && !payload.password) {
                delete payload.password;
            }

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, payload);
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'buyer', password: '', phone: '', address: '' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
            console.error(err);
        }
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setFormData({ ...user, password: '' }); // Don't show password
        setShowModal(true);
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-gray-500">Name</th>
                                <th className="p-4 font-medium text-gray-500">Email</th>
                                <th className="p-4 font-medium text-gray-500">Role</th>
                                <th className="p-4 font-medium text-gray-500">Joined</th>
                                <th className="p-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{user.name}</td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'farmer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => openEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input required className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input required type="email" className="w-full border rounded p-2" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select className="w-full border rounded p-2" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="buyer">Buyer</option>
                                    <option value="farmer">Farmer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="text" className="w-full border rounded p-2" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <textarea className="w-full border rounded p-2" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} rows="2"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password {editingUser && '(Leave blank to keep)'}</label>
                                <input type="password" className="w-full border rounded p-2" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover save-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

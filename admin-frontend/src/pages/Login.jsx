import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { email, password });
            const { user, token } = response.data;

            if (user.role !== 'admin') {
                setError('Access Denied: Admins Only');
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="flex flex-col items-center">
                    <Leaf className="w-12 h-12 text-accent" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">AgriLink Admin</h1>
                    <p className="text-sm text-gray-500">Sign in to manage the platform</p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-accent focus:border-accent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-accent focus:border-accent"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                    >
                        <Lock className="w-4 h-4" /> Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}

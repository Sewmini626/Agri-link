import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Tractor,
    ShoppingCart,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Mail
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import Footer from '../components/Footer';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

const Login = () => {
    const { language } = useLanguage();
    const t = translations[language].auth;

    const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        identifier: '', // email or phone
        password: '',
        rememberMe: false
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await api.post('/login', {
                email: formData.identifier,
                password: formData.password
            });

            console.log('Login success:', response.data);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.dispatchEvent(new Event('auth-change'));

            navigate('/');
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || t.loginFailed);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen relative font-sans ${language === 'si' ? 'font-sinhala' : ''}`}>
            {/* Background Image & Overlay */}
            <div className="fixed inset-0 z-0">
                <img
                    src="https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=1600"
                    alt="Background"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-emerald-950/15 backdrop-blur-[2px]" />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="absolute w-full top-0 p-6 flex justify-between items-center z-50">
                    <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">{t.home || "Back to Home"}</span>
                    </Link>
                    <Link to="/">
                        <span className="text-xl font-bold font-outfit tracking-tight text-white">
                            AGRILINK.
                        </span>
                    </Link>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-12">
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 sm:p-12 border border-white/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lime-400 to-emerald-600" />

                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-emerald-950 mb-3">{t.welcomeBack}</h1>
                            <p className="text-slate-500 text-lg font-light">{t.accessDashboard}</p>
                        </div>

                        <div className="space-y-8">
                            {/* Role Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-900/60 uppercase tracking-widest mb-3">{t.iAmA}</label>
                                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setRole('farmer')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${role === 'farmer'
                                            ? 'bg-white text-emerald-950 shadow-md ring-1 ring-black/5'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <Tractor size={18} className={role === 'farmer' ? 'text-lime-500' : ''} />
                                        <span>{t.farmer}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('buyer')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${role === 'buyer'
                                            ? 'bg-white text-emerald-950 shadow-md ring-1 ring-black/5'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <ShoppingCart size={18} className={role === 'buyer' ? 'text-lime-500' : ''} />
                                        <span>{t.buyer}</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Identifier */}
                                <div>
                                    <label className="block text-sm font-semibold text-emerald-950 mb-2">{t.emailOrPhone}</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            name="identifier"
                                            value={formData.identifier}
                                            onChange={handleInputChange}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-emerald-950 placeholder:text-slate-400 font-medium"
                                            placeholder={t.emailPlaceholder}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-emerald-950 mb-2">{t.password}</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-emerald-950 placeholder:text-slate-400 font-medium"
                                            placeholder={t.passwordPlaceholder}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">{t.forgotPassword}</a>
                                    </div>
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-600">
                                        {t.rememberMe}
                                    </label>
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-full shadow-lg shadow-lime-400/20 text-base font-bold text-emerald-950 bg-lime-400 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-400/30 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? t.signingIn : t.signIn}
                                    {!isLoading && <ArrowRight size={20} />}
                                </button>

                                <div className="text-center mt-6 text-sm text-slate-500 font-medium">
                                    {t.dontHaveAccount} <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-500">{t.signUp}</Link>
                                </div>
                            </form>
                        </div>
                    </Motion.div>

                    {/* Trust Indicators */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-12 w-full max-w-4xl text-center text-white/90">
                        <div className="flex flex-col items-center gap-2 drop-shadow-md">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-80">{t.secureData}</span>
                            <p className="text-sm font-light">{t.secureDesc}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 drop-shadow-md">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-80">{t.verifiedUsers}</span>
                            <p className="text-sm font-light">{t.verifiedDesc}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 drop-shadow-md">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-80">{t.support}</span>
                            <p className="text-sm font-light">{t.supportDesc}</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default Login;

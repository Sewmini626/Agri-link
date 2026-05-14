import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    Heart,
    ShoppingCart,
    Trash2,
    ArrowRight,
    ShoppingBag,
    Star,
    AlertCircle
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/useCart';
import { useSaved } from '../context/SavedContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

const Saved = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { savedItems, isSaved, toggleSave, loading } = useSaved();
    const { language } = useLanguage();
    const t = translations[language];

    const handleAddToCart = (product) => {
        addToCart(product);
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
                                <span className="block">{t.saved.yourCurated}</span>
                                <span className="text-emerald-300">{t.saved.wishlist}</span>
                            </Motion.h1>
                            <Motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="text-slate-200 text-lg sm:text-xl font-light"
                            >
                                {t.saved.heroDesc}
                            </Motion.p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 pb-24">
                <div className="flex justify-end mb-6">
                    <Motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 text-sm font-semibold text-emerald-950 shadow-sm hover:bg-white/20 transition-all"
                    >
                        <ShoppingBag size={18} strokeWidth={1.5} className="mr-2" />
                        {t.saved.backToShop}
                    </Motion.button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                    </div>
                ) : savedItems.length === 0 ? (
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] shadow-xl shadow-emerald-900/5 p-16 text-center border border-emerald-100"
                    >
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300 mx-auto mb-8">
                            <Heart size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">{t.saved.noSavedTitle}</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                            {t.saved.noSavedDesc}
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all hover:scale-105"
                        >
                            {t.saved.startExploring}
                            <ArrowRight size={20} strokeWidth={1.5} className="ml-2" />
                        </Link>
                    </Motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence>
                            {savedItems.map((product, index) => (
                                <Motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 group flex flex-col"
                                >
                                    {/* Image Area */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                        <img
                                            src={(() => {
                                                let img = product.images || product.image;
                                                if (Array.isArray(img) && img.length > 0) return img[0];
                                                if (typeof img === 'string') {
                                                    try {
                                                        const parsed = JSON.parse(img);
                                                        return Array.isArray(parsed) ? parsed[0] : parsed;
                                                    } catch {
                                                        return img;
                                                    }
                                                }
                                                return 'https://placehold.co/400';
                                            })()}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <button
                                            onClick={() => toggleSave(product)}
                                            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm text-red-500 hover:bg-white hover:text-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                                            title={t.saved.removeFromSaved}
                                        >
                                            <Trash2 size={18} strokeWidth={1.5} />
                                        </button>
                                        {product.category && (
                                            <span className="absolute top-4 left-4 px-3 py-1 bg-black/30 backdrop-blur-md text-white text-xs font-medium rounded-full uppercase tracking-wider">
                                                {product.category}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 line-clamp-1 text-lg group-hover:text-emerald-700 transition-colors">
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-1 mb-4 text-amber-400">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-xs font-medium text-slate-500 ml-1">4.5 (24 {t.saved.reviews})</span>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between gap-4">
                                            <span className="text-2xl font-bold text-emerald-600">
                                                LKR {Number(product.price).toFixed(0)}
                                            </span>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-100 transition-colors gap-2 group/btn"
                                            >
                                                <ShoppingCart size={16} strokeWidth={1.5} className="group-hover/btn:scale-110 transition-transform" />
                                                {t.saved.addToCart}
                                            </button>
                                        </div>
                                    </div>
                                </Motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Saved;

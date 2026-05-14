
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { language } = useLanguage();
    const t = translations[language];

    // Filter state
    const [filters, setFilters] = useState({
        categories: [],
        minPrice: '',
        maxPrice: '',
        rating: 0,
        region: ''
    });

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Fetching all products for client-side filtering
                const response = await axios.get('http://localhost:8000/api/products');
                const data = response.data.data || response.data;
                setProducts(Array.isArray(data) ? data : []);
                setFilteredProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = [...products];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        // Category
        if (filters.categories.length > 0) {
            result = result.filter(p =>
                p.category && filters.categories.some(c => c.toLowerCase() === p.category.toLowerCase())
            );
        }

        // Price
        if (filters.minPrice) {
            result = result.filter(p => Number(p.price) >= Number(filters.minPrice));
        }
        if (filters.maxPrice) {
            result = result.filter(p => Number(p.price) <= Number(filters.maxPrice));
        }

        // Rating
        if (filters.rating > 0) {
            result = result.filter(p => !p.rating || p.rating >= filters.rating);
        }

        setFilteredProducts(result);
    }, [products, filters, searchQuery]);

    return (
        <div className={`min-h-screen bg-slate-50 font-outfit ${language === 'si' ? 'font-sinhala' : ''}`}>
            {/* Hero Section */}
            <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
                <img
                    src="https://images.pexels.com/photos/95425/pexels-photo-95425.jpeg?auto=compress&cs=tinysrgb&w=1600"
                    alt="Marketplace"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                <div className="relative z-10 h-full flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <Motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight"
                        >
                            {t.marketplace.pageTitle}
                        </Motion.h1>
                        <Motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-100 max-w-2xl font-light"
                        >
                            {t.marketplace.pageSubtitle}
                        </Motion.p>
                    </div>
                </div>
            </section>

            <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Mobile Filter Toggle & Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 lg:mb-10 justify-between items-center">
                    <button
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 font-medium"
                        onClick={() => setMobileFiltersOpen(true)}
                    >
                        <Filter size={18} />
                        {t.marketplace.filters}
                    </button>

                    <div className="relative w-full sm:w-96">
                        <input
                            type="text"
                            placeholder={t.marketplace.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow shadow-sm"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>

                    <p className="text-gray-500 text-sm font-medium hidden sm:block">
                        {t.marketplace.showingResults} ({filteredProducts.length})
                    </p>
                </div>

                <div className="flex items-start gap-8">
                    {/* Sidebar - Desktop */}
                    <div className="hidden lg:block shrink-0">
                        <FilterSidebar filters={filters} setFilters={setFilters} />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse relative overflow-hidden border border-gray-100">
                                        <div className="h-64 bg-slate-200" />
                                        <div className="p-6 space-y-3">
                                            <div className="h-6 bg-slate-200 rounded w-3/4" />
                                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.marketplace.noProductsTitle}</h3>
                                <p className="text-gray-500">{t.marketplace.noProductsDesc}</p>
                                <button
                                    onClick={() => {
                                        setFilters({ categories: [], minPrice: '', maxPrice: '', rating: 0 });
                                        setSearchQuery('');
                                    }}
                                    className="mt-6 px-6 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-full hover:bg-emerald-100 transition-colors"
                                >
                                    {t.marketplace.clearFilters}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                                <AnimatePresence mode='popLayout'>
                                    {filteredProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {mobileFiltersOpen && (
                    <>
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileFiltersOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
                        />
                        <Motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white z-50 lg:hidden shadow-2xl overflow-y-auto"
                        >
                            <div className="p-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
                                <h2 className="text-lg font-bold text-gray-900">{t.marketplace.filters}</h2>
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4">
                                <FilterSidebar filters={filters} setFilters={setFilters} />
                            </div>
                            <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition-colors"
                                >
                                    {t.marketplace.showResults} ({filteredProducts.length})
                                </button>
                            </div>
                        </Motion.div>
                    </>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default Marketplace;

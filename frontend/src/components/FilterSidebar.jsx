
import React from 'react';
import {
    Star,
    Check,
    RotateCcw
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

const FilterSidebar = ({ filters, setFilters }) => {
    const { language } = useLanguage();
    const t = translations[language];
    // Categories list - could be passed as prop or fetched
    const categoryOptions = ['Grains & Cereals', 'Vegetables', 'Fruits', 'Legumes', 'Equipment', 'Seeds', 'Dairy'];

    const handleCategoryChange = (category) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter(c => c !== category)
            : [...filters.categories, category];

        setFilters({ ...filters, categories: newCategories });
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleRatingToggle = (rating) => {
        setFilters({ ...filters, rating: rating === filters.rating ? 0 : rating });
    };

    const resetFilters = () => {
        setFilters({ categories: [], minPrice: '', maxPrice: '', rating: 0, region: '' });
    };

    const hasActiveFilters = filters.categories.length > 0 || filters.minPrice || filters.maxPrice || filters.rating > 0;

    return (
        <div className="bg-white w-full lg:w-72 p-6 rounded-none lg:rounded-[1.5rem] lg:border border-gray-100 lg:shadow-sm lg:sticky lg:top-24 h-auto lg:max-h-[85vh] overflow-y-auto no-scrollbar font-outfit">

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t.marketplace.sidebar.title}</h2>
                <AnimatePresence>
                    {hasActiveFilters && (
                        <Motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={resetFilters}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            title={t.marketplace.sidebar.reset}
                        >
                            <RotateCcw size={18} />
                        </Motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Category */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {t.marketplace.sidebar.category}
                </h3>
                <div className="space-y-1">
                    {categoryOptions.map((category) => {
                        const isSelected = filters.categories.includes(category);
                        return (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${isSelected
                                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm ring-1 ring-emerald-100'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span>{t.marketplace.sidebar.categories[category] || category}</span>
                                {isSelected && (
                                    <Motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-emerald-600"
                                    >
                                        <Check size={16} strokeWidth={3} />
                                    </Motion.span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="w-full h-px bg-gray-100 mb-8" />

            {/* Price */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {t.marketplace.sidebar.priceRange}
                </h3>
                <div className="bg-gray-50 p-1 rounded-xl flex items-center gap-2 border border-gray-100 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">LKR</span>
                        <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handlePriceChange}
                            placeholder={t.marketplace.sidebar.min}
                            className="w-full bg-transparent border-none py-2.5 pl-11 pr-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-0"
                        />
                    </div>
                    <div className="w-px h-6 bg-gray-200" />
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">LKR</span>
                        <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handlePriceChange}
                            placeholder={t.marketplace.sidebar.max}
                            className="w-full bg-transparent border-none py-2.5 pl-11 pr-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-0"
                        />
                    </div>
                </div>

                {/* Price Presets */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {[
                        { label: t.marketplace.sidebar.pricePresets.under20, min: '', max: '20' },
                        { label: t.marketplace.sidebar.pricePresets.range20to100, min: '20', max: '100' },
                    ].map((preset, i) => (
                        <button
                            key={i}
                            onClick={() => setFilters({ ...filters, minPrice: preset.min, maxPrice: preset.max })}
                            className="text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-gray-100"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-gray-100 mb-8" />

            {/* Rating */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {t.marketplace.sidebar.rating}
                </h3>
                <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => {
                        const isSelected = filters.rating === stars;
                        return (
                            <button
                                key={stars}
                                onClick={() => handleRatingToggle(stars)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ${isSelected
                                    ? 'bg-amber-50 ring-1 ring-amber-100' // Selected styling
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < stars ? "#fbbf24" : "transparent"}
                                                className={i < stars ? "text-amber-400" : "text-gray-200"}
                                                strokeWidth={i < stars ? 0 : 1.5}
                                            />
                                        ))}
                                    </div>
                                    <span className={`text-sm ${isSelected ? 'text-amber-700 font-medium' : 'text-gray-500'}`}>
                                        {t.marketplace.sidebar.ratingAndUp}
                                    </span>
                                </div>
                                {isSelected && <Check size={16} className="text-amber-600" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;

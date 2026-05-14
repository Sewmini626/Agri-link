
import React from 'react';
import {
    Heart,
    MapPin,
    ShieldCheck,
    User,
    ArrowRight
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { useSaved } from '../context/SavedContext';
import { ShoppingCart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isSaved, toggleSave } = useSaved();
    const { language } = useLanguage();
    const t = translations[language];

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Image Area */}
            <div className="relative aspect-square w-full h-[400px] rounded-sm overflow-hidden bg-gray-100 mb-4">
                <img
                    src={(() => {
                        let imgList = product.images;
                        if (typeof imgList === 'string') {
                            try { imgList = JSON.parse(imgList); } catch { imgList = [imgList]; }
                        }
                        if (Array.isArray(imgList) && imgList.length > 0) return imgList[0];
                        return product.image || "https://placehold.co/400";
                    })()}
                    alt={product.name || product.title}
                    className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        className="p-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-emerald-600 hover:text-white shadow-sm transition-all hover:scale-110"
                        title={t.productCard.addToCart}
                    >
                        <ShoppingCart size={20} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(product);
                        }}
                        className={`p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110 ${isSaved(product.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-700 hover:text-red-500'
                            }`}
                        title={isSaved(product.id) ? t.productCard.removeFromSaved : t.productCard.saveForLater}
                    >
                        <Heart size={20} fill={isSaved(product.id) ? "currentColor" : "none"} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="font-medium text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {product.name || product.title}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                        {product.category || t.productCard.generalCategory}
                    </p>
                </div>
                <span className="text-lg font-medium text-gray-700">
                    LKR {(Number(product.price) || 0).toFixed(0)}
                </span>
            </div>
        </Motion.div>
    );
};

export default ProductCard;


import React from 'react';
import { useCart } from '../context/useCart';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

const CartDrawer = () => {
    const {
        isCartOpen,
        setIsCartOpen,
        cartItems,
        removeFromCart,
        updateQuantity,
        cartTotal
    } = useCart();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    // Prevent body scroll when cart is open
    React.useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen]);

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout'); // We can create this route later or just use it as placeholder
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer */}
                    <Motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col font-outfit ${language === 'si' ? 'font-sinhala' : ''}`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <ShoppingBag size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{t.cart.title}</h2>
                                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {cartItems.length} {t.cart.items}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                                        <ShoppingBag size={40} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{t.cart.emptyTitle}</h3>
                                    <p className="text-gray-500 max-w-[200px]">
                                        {t.cart.emptyDesc}
                                    </p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                                    >
                                        {t.cart.startShopping}
                                    </button>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                                            <img
                                                src={(() => {
                                                    let img = item.images;
                                                    if (Array.isArray(img) && img.length > 0) return img[0];
                                                    if (typeof img === 'string') {
                                                        try {
                                                            const parsed = JSON.parse(img);
                                                            return Array.isArray(parsed) ? parsed[0] : parsed;
                                                        } catch { return img; }
                                                    }
                                                    return "https://placehold.co/100";
                                                })()}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="text-emerald-600 font-bold">
                                                    LKR {Number(item.price).toFixed(2)}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Number(item.quantity) - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="p-1 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all text-gray-600"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Number(item.quantity) + 1)}
                                                        className="p-1 rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                                {/* Summary */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>{t.cart.subtotal}</span>
                                        <span>LKR {cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>{t.cart.shipping}</span>
                                        <span>{t.cart.free}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                        <span>{t.cart.total}</span>
                                        <span>LKR {cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group"
                                >
                                    {t.cart.checkout}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </Motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;

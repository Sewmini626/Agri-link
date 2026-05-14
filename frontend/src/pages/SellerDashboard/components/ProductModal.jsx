
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Check, Tag, Package, FileText, ArrowRight, LayoutGrid } from 'lucide-react';
import CloudinaryUpload from '../../../components/CloudinaryUpload';
import { useLanguage } from '../../../context/LanguageContext';
import { translations } from '../../../config/translations';

const ProductModal = ({ isOpen, onClose, product = null, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        images: [],
        resetKey: 0
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { language } = useLanguage();
    const t = translations[language];

    // Populate form if editing
    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    quantity: product.quantity,
                    category: product.category,
                    images: product.images || [],
                    resetKey: product.id // Force re-render of Cloudinary component with existing images
                });
            } else {
                // Reset form for new product
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    quantity: '',
                    category: '',
                    images: [],
                    resetKey: Date.now()
                });
            }
            setMessage({ type: '', text: '' });
        }
    }, [isOpen, product]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImagesUploaded = (urls) => {
        setFormData({ ...formData, images: urls });
    };

    const validateForm = () => {
        if (!formData.name.trim() || formData.name.length < 3) {
            return t.sellerDashboard.productModal.errorNameLength;
        }
        if (!formData.category) {
            return t.sellerDashboard.productModal.errorCategory;
        }
        if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
            return t.sellerDashboard.productModal.errorPrice;
        }
        if (!formData.quantity || isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
            return t.sellerDashboard.productModal.errorQuantity;
        }
        if (!formData.description.trim() || formData.description.length < 10) {
            return t.sellerDashboard.productModal.errorDescription;
        }
        if (formData.images.length === 0) {
            return t.sellerDashboard.productModal.errorImage;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        const validationError = validateForm();
        if (validationError) {
            setMessage({ type: 'error', text: validationError });
            setSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            if (product) {
                // Edit existing product
                await axios.put(`http://localhost:8000/api/products/${product.id}`, formData, config);
                setMessage({ type: 'success', text: t.sellerDashboard.productModal.successUpdate });
            } else {
                // Create new product
                await axios.post('http://localhost:8000/api/products', formData, config);
                setMessage({ type: 'success', text: t.sellerDashboard.productModal.successAdd });
            }

            // Close modal after delay
            setTimeout(() => {
                onSuccess(); // Refresh product list
                onClose();
            }, 1500);

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || t.sellerDashboard.productModal.errorOperation });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 sm:p-6"
                    >
                        <Motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col font-outfit"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        {product ? <Tag className="text-emerald-200" /> : <Package className="text-emerald-200" />}
                                        {product ? t.sellerDashboard.productModal.editProduct : t.sellerDashboard.productModal.addNewProduct}
                                    </h2>
                                    <p className="text-emerald-100 mt-1 text-sm opacity-90">
                                        {product ? t.sellerDashboard.productModal.updateDetails : t.sellerDashboard.productModal.shareHarvest}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white backdrop-blur-sm"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                                {message.text && (
                                    <Motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 mb-6 rounded-2xl flex items-center gap-3 shadow-sm ${message.type === 'success'
                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                            : 'bg-red-50 text-red-800 border border-red-100'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                            {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                        </div>
                                        <p className="font-medium text-sm">{message.text}</p>
                                    </Motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-5">
                                        {/* Product Name */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{t.sellerDashboard.productModal.productName}</label>
                                            <div className="relative">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                                    placeholder={t.sellerDashboard.productModal.placeholderName}
                                                />
                                            </div>
                                        </div>

                                        {/* Category & Price Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="group">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{t.sellerDashboard.productModal.category}</label>
                                                <div className="relative">
                                                    <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                                    <select
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                                                    >
                                                        <option value="">{t.sellerDashboard.productModal.selectCategory}</option>
                                                        <option value="Vegetables">{t.marketplace.sidebar.categories['Vegetables']}</option>
                                                        <option value="Fruits">{t.marketplace.sidebar.categories['Fruits']}</option>
                                                        <option value="Grains">{t.marketplace.sidebar.categories['Grains & Cereals']}</option>
                                                        <option value="Machinery">{t.marketplace.sidebar.categories['Equipment']}</option>
                                                        <option value="Seeds">{t.marketplace.sidebar.categories['Seeds']}</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="group">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{t.sellerDashboard.productModal.price}</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        value={formData.price}
                                                        onChange={handleInputChange}
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{t.sellerDashboard.productModal.stockQuantity}</label>
                                            <div className="relative">
                                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                                    placeholder="e.g., 100"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{t.sellerDashboard.productsPage.units}</span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{t.sellerDashboard.productModal.description}</label>
                                            <div className="relative">
                                                <FileText className="absolute left-4 top-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    required
                                                    rows="4"
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 resize-none leading-relaxed"
                                                    placeholder={t.sellerDashboard.productModal.placeholderDesc}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="border-t border-gray-100 pt-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Upload className="text-emerald-500" size={20} />
                                            <h3 className="text-lg font-bold text-gray-900">{t.sellerDashboard.productModal.productGallery}</h3>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-200 hover:border-emerald-300 transition-colors">
                                            <CloudinaryUpload
                                                key={formData.resetKey}
                                                initialImages={formData.images}
                                                onUploadSuccess={handleImagesUploaded}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    {t.sellerDashboard.productModal.cancel}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            {t.sellerDashboard.productModal.processing}
                                        </>
                                    ) : (
                                        <>
                                            {product ? t.sellerDashboard.productModal.saveChanges : t.sellerDashboard.productModal.createProduct}
                                            {!product && <ArrowRight size={20} />}
                                        </>
                                    )}
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProductModal;

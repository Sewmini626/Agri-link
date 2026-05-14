
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Edit, Trash2, Package, MoreHorizontal, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import ProductModal from './ProductModal';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { translations } from '../../../config/translations';

const Products = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { language } = useLanguage();
    const t = translations[language];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const response = await axios.get('http://localhost:8000/api/my-products', config);

            // Handle Laravel pagination wrapper
            const data = response.data.data ? response.data.data : response.data;
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                await axios.delete(`http://localhost:8000/api/products/${productId}`, config);
                fetchProducts();
            } catch (error) {
                console.error("Failed to delete product", error);
                alert("Failed to delete product. Please try again.");
            }
        }
    };

    // Parse images helper
    const getProductImage = (product) => {
        if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
        if (typeof product.images === 'string') {
            try {
                const parsed = JSON.parse(product.images);
                return Array.isArray(parsed) ? parsed[0] : parsed;
            } catch { return product.images; }
        }
        return "https://placehold.co/100?text=No+Image";
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t.sellerDashboard.productsPage.title}</h2>
                    <p className="text-gray-500 mt-1">{t.sellerDashboard.productsPage.subtitle}</p>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Plus size={20} />
                    {t.sellerDashboard.productsPage.addProduct}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center transition-all hover:shadow-md">
                <div className="relative w-full sm:w-96">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t.sellerDashboard.productsPage.searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
                {/* Future filter buttons can go here */}
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.productsPage.tableHeaders.product}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.productsPage.tableHeaders.category}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.productsPage.tableHeaders.price}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.productsPage.tableHeaders.stock}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.sellerDashboard.productsPage.tableHeaders.status}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t.sellerDashboard.productsPage.tableHeaders.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                                            <Loader2 size={32} className="animate-spin text-emerald-500" />
                                            <p className="text-sm">{t.sellerDashboard.productsPage.loading}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                                <Package size={32} />
                                            </div>
                                            <p className="font-medium text-gray-600">{t.sellerDashboard.productsPage.noProducts}</p>
                                            <p className="text-sm max-w-xs mx-auto">
                                                {searchTerm
                                                    ? t.sellerDashboard.productsPage.tryAdjusting
                                                    : t.sellerDashboard.productsPage.noProductsSubtitle}
                                            </p>
                                            {!searchTerm && (
                                                <button
                                                    onClick={handleAddProduct}
                                                    className="mt-4 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                                >
                                                    {t.sellerDashboard.productsPage.addNewProduct}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                    <img
                                                        src={getProductImage(product)}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{product.name}</p>
                                                    {product.description && (
                                                        <p className="text-xs text-gray-500 truncate max-w-[180px] mt-0.5">{product.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 capitalize border border-gray-200">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            LKR {Number(product.price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {product.quantity} {t.sellerDashboard.productsPage.units}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${product.quantity > 0
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${product.quantity > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {product.quantity > 0
                                                    ? t.sellerDashboard.productsPage.inStock
                                                    : t.sellerDashboard.productsPage.outOfStock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination Placeholder */}
                {filteredProducts.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
                        <span>{t.sellerDashboard.productsPage.showing} {filteredProducts.length} {t.sellerDashboard.productsPage.title.toLowerCase()}</span>
                        {/* Add real pagination controls here if api/my-products supports numbered pages later */}
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSuccess={() => {
                    fetchProducts();
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
};

export default Products;

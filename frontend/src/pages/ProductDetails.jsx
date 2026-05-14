
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    ArrowLeft,
    ShoppingCart,
    Heart,
    Star,
    MapPin,
    User,
    ShieldCheck,
    Loader2,
    Plus,
    Minus,
    ChevronRight,
    Share2,
    Truck,
    Package
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/useCart';
import { useSaved } from '../context/SavedContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewsError, setReviewsError] = useState('');
    const [ratingInput, setRatingInput] = useState(5);
    const [commentInput, setCommentInput] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [canReview, setCanReview] = useState(false);
    const [canReviewChecked, setCanReviewChecked] = useState(false);
    const { language } = useLanguage();
    const t = translations[language];
    const { isSaved, toggleSave } = useSaved();

    // Helper to safely access nested translation keys (fallback for safety)
    const tp = t.productDetails || {};

    const maxQuantity = product && typeof product.quantity === 'number' && product.quantity > 0
        ? product.quantity
        : 1;

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            setQuantity(1);
            return;
        }
        const clamped = Math.min(Math.max(parsed, 1), maxQuantity);
        setQuantity(clamped);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/products/${id}`);
                setProduct(response.data);
            } catch {
                setError('Failed to load product details.'); // Fallback, though we should use tp.failedLoad
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        setCurrentUser(parsedUser);

        const fetchReviews = async () => {
            setReviewsLoading(true);
            setReviewsError('');
            try {
                const response = await axios.get(`http://localhost:8000/api/products/${id}/feedback`);
                setReviews(response.data.feedback || []);
                setAverageRating(response.data.average_rating || 0);
                setTotalReviews(response.data.total_reviews || 0);
            } catch {
            } finally {
                setReviewsLoading(false);
            }
        };

        const checkReviewPermission = async () => {
            setCanReview(false);
            setCanReviewChecked(false);
            const token = localStorage.getItem('token');
            if (!parsedUser || !token) {
                setCanReviewChecked(true);
                return;
            }
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/products/${id}/can-review`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setCanReview(Boolean(response.data?.can_review));
            } catch {
                setCanReview(false);
            } finally {
                setCanReviewChecked(true);
            }
        };

        fetchReviews();
        checkReviewPermission();
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            navigate('/login');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setSubmittingReview(true);
        setReviewsError('');

        try {
            const response = await axios.post(
                `http://localhost:8000/api/products/${id}/feedback`,
                {
                    rating: ratingInput,
                    comment: commentInput,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const saved = response.data.feedback;
            setAverageRating(response.data.average_rating || 0);
            setTotalReviews(response.data.total_reviews || 0);

            setReviews((prev) => {
                const index = prev.findIndex((item) => item.id === saved.id);
                if (index !== -1) {
                    const updated = [...prev];
                    updated[index] = saved;
                    return updated;
                }
                return [saved, ...prev];
            });

            setCommentInput('');
        } catch (err) {
            setReviewsError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={`min-h-screen bg-white flex flex-col font-outfit ${language === 'si' ? 'font-sinhala' : ''}`}>
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                        <Package size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{tp.productNotFound || "Product Not Found"}</h2>
                    <p className="text-gray-500 mb-8 max-w-md">
                        {error && error !== 'Failed to load product details.' ? error : (tp.productError || "The product you're looking for might have been removed or is temporarily unavailable.")}
                    </p>
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="px-8 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all font-medium flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        {tp.backToMarketplace || "Back to Marketplace"}
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    let images = [];
    if (typeof product.images === 'string') {
        try { images = JSON.parse(product.images); } catch { images = [product.images]; }
    } else if (Array.isArray(product.images)) {
        images = product.images;
    }
    if (!images || images.length === 0) images = ['https://placehold.co/600x400?text=No+Image'];

    return (
        <div className={`min-h-screen bg-white font-outfit text-gray-900 ${language === 'si' ? 'font-sinhala' : ''}`}>
            <Navbar />

            {/*Back Navigation */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <button onClick={() => navigate('/')} className="hover:text-emerald-600 transition-colors">{tp.home}</button>
                        <ChevronRight size={14} />
                        <button onClick={() => navigate('/marketplace')} className="hover:text-emerald-600 transition-colors">{tp.marketplace}</button>
                        <ChevronRight size={14} />
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                    {/* Left Column - Images */}
                    <div className="lg:col-span-7 space-y-6">
                        <Motion.div
                            layout
                            className="aspect-[4/3] lg:aspect-square bg-gray-100 rounded-xl overflow-hidden relative group"
                        >
                            <img
                                src={images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4 flex flex-col gap-3">
                                <button
                                    onClick={() => product && toggleSave(product)}
                                    className={`p-3 bg-white/90 backdrop-blur rounded-full shadow-sm transition-all hover:scale-110 ${product && isSaved(product.id)
                                        ? 'text-red-500 hover:text-red-600'
                                        : 'text-gray-500 hover:text-red-500'
                                        }`}
                                    title={
                                        product && isSaved(product.id)
                                            ? t.productCard?.removeFromSaved
                                            : t.productCard?.saveForLater
                                    }
                                >
                                    <Heart
                                        size={20}
                                        fill={product && isSaved(product.id) ? 'currentColor' : 'none'}
                                    />
                                </button>
                                <button className="p-3 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-emerald-600 hover:bg-white shadow-sm transition-all hover:scale-110">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </Motion.div>

                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(index)}
                                        className={`relative w-24 h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === index
                                            ? 'border-emerald-600 ring-2 ring-emerald-100 ring-offset-2'
                                            : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Product Details */}
                    <div className="lg:col-span-5 flex flex-col pt-2">
                        <div className="mb-1">
                            {product.category && (
                                <span className="text-emerald-600 font-semibold tracking-wide uppercase text-xs mb-3 block">
                                    {product.category}
                                </span>
                            )}
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                                {product.name}
                            </h1>

                            {/* Rating & Location */}
                            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm">
                                <button 
                                    onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 hover:bg-amber-100 transition-all active:scale-95"
                                >
                                    <Star size={16} className="text-amber-400 fill-amber-400" />
                                    <span className="font-bold text-gray-900">{averageRating ? averageRating.toFixed(1) : 'New'}</span>
                                    <span className="text-gray-500 border-l border-amber-200 pl-1.5 ml-0.5">
                                        {totalReviews} {tp.reviews}
                                    </span>
                                </button>
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <MapPin size={16} />
                                    <span>{product.location || 'Location varies'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                                        LKR {Number(product.price).toFixed(2)}
                                    </span>
                                    {product.unit && (
                                        <span className="text-gray-500 font-medium mb-1.5 text-lg">
                                            / {product.unit}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <Truck size={14} />
                                    {tp.freeDelivery}
                                </p>
                            </div>
                            {(!product.quantity || product.quantity < 1) && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-sm">
                                    <Package size={18} />
                                    <span>{tp.outOfStock || "Out of Stock"}</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-900 mb-3">{tp.aboutProduct}</h3>
                            <p className="text-gray-600 leading-relaxed text-base">
                                {product.description || tp.noDescription}
                            </p>
                        </div>

                        {/* Seller */}
                        <div className="mb-8 py-4 border-y border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                                    {product.user?.name?.charAt(0) || <User size={20} />}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-0.5">{tp.soldBy}</p>
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-bold text-gray-900">{product.user?.name || tp.unknownSeller}</p>
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                    </div>
                                </div>
                            </div>
                          
                        </div>

                        {/* Actions */}
                        <div className="mt-auto space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center border border-gray-200 rounded-full h-14 w-32 justify-between px-2 ${product.quantity < 1 ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-white'}`}>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={product.quantity < 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:cursor-not-allowed"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        max={maxQuantity}
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        disabled={product.quantity < 1}
                                        className="w-12 text-center font-semibold text-lg border-none focus:outline-none focus:ring-0 bg-transparent disabled:cursor-not-allowed"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                        disabled={product.quantity < 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:cursor-not-allowed"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => addToCart(product, quantity)}
                                    disabled={product.quantity < 1}
                                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart size={20} strokeWidth={2} />
                                    {product.quantity > 0 ? tp.addToCart : tp.outOfStock}
                                </button>
                                </div>
                                <button
                                    onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full h-14 bg-white border-2 border-emerald-100 text-emerald-700 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all active:scale-[0.98]"
                                >
                                    <Star size={20} />
                                    {tp.writeReview}
                                </button>
                            
                            <p className={`text-center text-xs font-semibold ${product.quantity > 0 ? 'text-gray-400' : 'text-red-500'}`}>
                                {tp.secureTransaction} • {product.quantity > 0 ? tp.inStock : tp.outOfStock}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div id="reviews-section" className="mt-24 pt-12 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{tp.customerReviews}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Summary & Form */}
                            <div className="md:col-span-1 space-y-8">
                                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                                    <div className="text-5xl font-bold text-gray-900 mb-2">
                                        {averageRating ? averageRating.toFixed(1) : '0.0'}
                                    </div>
                                    <div className="flex justify-center gap-1 mb-2 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={18}
                                                fill={i < Math.round(averageRating) ? "currentColor" : "none"}
                                                className={i >= Math.round(averageRating) ? "text-gray-300" : ""}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {tp.basedOn} {totalReviews} {tp.reviews}
                                    </p>
                                </div>

                                {!currentUser ? (
                                    <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                                        <p className="text-gray-500 mb-4 text-sm">{tp.logInToReview}</p>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            {tp.logIn}
                                        </button>
                                    </div>
                                ) : canReviewChecked && canReview ? (
                                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-4">{tp.writeReview}</h3>
                                        <form onSubmit={handleSubmitReview} className="space-y-4">
                                            <div className="flex gap-2 justify-center mb-4">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRatingInput(star)}
                                                        className="text-amber-400 focus:outline-none transform hover:scale-110 transition-transform"
                                                    >
                                                        <Star
                                                            size={24}
                                                            fill={star <= ratingInput ? "currentColor" : "none"}
                                                            className={star > ratingInput ? "text-gray-200" : ""}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={commentInput}
                                                onChange={(e) => setCommentInput(e.target.value)}
                                                rows={3}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                                placeholder={tp.tellUs}
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={submittingReview}
                                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-black transition-colors disabled:opacity-50"
                                            >
                                                {submittingReview ? tp.submitting : tp.postReview}
                                            </button>
                                        </form>
                                    </div>
                                ) : canReviewChecked && !canReview ? (
                                    <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                                        <p className="text-gray-500 text-sm">
                                            You can only review products you have purchased.
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            {/* Review List */}
                            <div className="md:col-span-2 space-y-6">
                                {reviewsLoading ? (
                                    <div className="text-center py-10">
                                        <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto" />
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <p>{tp.noReviews}</p>
                                    </div>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">
                                                        {review.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{review.user?.name || 'User'}</p>
                                                        <div className="flex text-amber-400 text-xs">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-200" : ""} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed pl-[3.25rem]">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductDetails;

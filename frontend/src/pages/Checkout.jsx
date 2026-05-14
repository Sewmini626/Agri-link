
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/useCart';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    CreditCard,
    Truck,
    CheckCircle,
    ArrowLeft,
    ShieldCheck,
    Banknote,
    XCircle,
    ShoppingBag,
    ChevronRight,
    Lock
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

// ─── Load Stripe ─────────────────────────────────────────────────────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#1f2937',
            fontFamily: '"Outfit", sans-serif',
            '::placeholder': { color: '#9ca3af' },
            iconColor: '#10b981',
        },
        invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
    hidePostalCode: true,
};

const CheckoutForm = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const { language } = useLanguage();
    const t = translations[language];
    // Safety check for checkout translations
    const tc = t.checkout || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [payStatus, setPayStatus] = useState(''); // 'success' | 'failed'
    const [step, setStep] = useState(1); // 1: Checkout, 2: Success/Fail

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        paymentMethod: 'card',
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            navigate('/login');
        }
    }, [navigate]);

    const isValidSriLankaPhone = (phone) => {
        const normalized = phone.replace(/\s+/g, '');
        return /^(0\d{9}|\+94\d{9})$/.test(normalized);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentMethodChange = (method) =>
        setFormData({ ...formData, paymentMethod: method });

    const validateForm = () => {
        const nextErrors = {};
        if (!isValidSriLankaPhone(formData.phone)) {
            nextErrors.phone = 'Enter a valid Sri Lanka phone number (0XXXXXXXXX or +94XXXXXXXXX)';
        }
        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    // ── COD Order ────────────────────────────────────────────────────────────
    const placeCodOrder = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const payload = {
            items: cartItems.map(i => ({ id: i.id, quantity: i.quantity })),
            shipping_address: formData.address,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            zip: formData.zip,
            payment_method: 'cod',
        };

        await axios.post('http://localhost:8000/api/orders', payload, {
            headers: { Authorization: `Bearer ${token}` },
        });

        setPayStatus('success');
        setStep(2);
        clearCart();
    };

    // ── Card Order ───────────────────────────────────────────────────────────
    const placeCardOrder = async () => {
        if (!stripe || !elements) throw new Error('Stripe not loaded');

        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        // 1. Create PaymentIntent
        const { data } = await axios.post(
            'http://localhost:8000/api/stripe/payment-intent',
            {
                items: cartItems.map(i => ({ id: i.id, quantity: i.quantity })),
                shipping_address: formData.address,
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                zip: formData.zip,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const { client_secret, order_id } = data;

        // 2. Confirm Payment
        const cardElement = elements.getElement(CardElement);
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                },
            },
        });

        if (stripeError) throw new Error(stripeError.message);

        if (paymentIntent.status === 'succeeded') {
            await axios.post(
                'http://localhost:8000/api/stripe/confirm-order-paid',
                {
                    order_id,
                    payment_intent_id: paymentIntent.id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPayStatus('success');
        } else {
            setPayStatus('failed');
        }

        setStep(2);
        clearCart();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            if (formData.paymentMethod === 'card') {
                await placeCardOrder();
            } else {
                await placeCodOrder();
            }
        } catch (err) {
            console.error(err);
            const apiMessage = err.response?.data?.message;
            const apiErrors = err.response?.data?.errors;
            let friendly = apiMessage || err.message;

            if (apiErrors && typeof apiErrors === 'object') {
                const allErrors = Object.values(apiErrors).flat().filter(Boolean);
                if (allErrors.length > 0) friendly = allErrors[0];
            }
            setError(friendly || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && step !== 2) {
        return (
            <div className={`min-h-screen bg-gray-50 font-outfit flex flex-col ${language === 'si' ? 'font-sinhala' : ''}`}>
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
                        <ShoppingBag size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{tc.emptyCart || "Your cart is empty"}</h2>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="px-8 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                        >
                            {tc.browseMarketplace || "Browse Marketplace"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gray-50 font-outfit pb-20 ${language === 'si' ? 'font-sinhala' : ''}`}>
            <Navbar />

            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <span className="text-emerald-600">{tc.cart || "Cart"}</span>
                        <ChevronRight size={14} />
                        <span className={step === 1 ? "text-gray-900" : "text-emerald-600"}>{tc.title || "Checkout"}</span>
                        <ChevronRight size={14} />
                        <span className={step === 2 ? "text-gray-900" : "text-gray-400"}>{tc.confirmation || "Confirmation"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
                        <Lock size={12} />
                        {tc.secureCheckout || "Secure Checkout"}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {step === 2 ? (
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto bg-white rounded-3xl p-8 lg:p-12 text-center shadow-sm border border-gray-100"
                    >
                        {payStatus === 'success' ? (
                            <>
                                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 animate-bounce-slow">
                                    <CheckCircle size={48} strokeWidth={2} />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">{tc.orderSuccess || "Order Successful!"}</h2>
                                <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                                    {tc.thankYou || "Thank you for your purchase via"} {formData.paymentMethod === 'card' ? (tc.card || 'Card') : (tc.cod || 'Cash on Delivery')}.
                                    <br />{tc.emailConfirm || "You will receive an email confirmation shortly."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => navigate('/orders')}
                                        className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                                    >
                                        {tc.trackOrder || "Track Order"}
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        {tc.backToHome || "Back to Home"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                                    <XCircle size={48} strokeWidth={2} />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">{tc.paymentFailed || "Payment Failed"}</h2>
                                <p className="text-gray-500 mb-8 text-lg">
                                    {tc.paymentError || "Something went wrong with the transaction. Please try again."}
                                </p>
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors"
                                >
                                    {tc.tryAgain || "Try Again"}
                                </button>
                            </>
                        )}
                    </Motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Form Section */}
                        <div className="lg:col-span-7 space-y-8">

                            {error && (
                                <Motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700"
                                >
                                    <XCircle size={20} className="shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium">{error}</p>
                                </Motion.div>
                            )}

                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* Contact & Shipping */}
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">1</span>
                                        {tc.shippingInfo || "Shipping Information"}
                                    </h3>

                                    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tc.firstName || "First Name"}</label>
                                            <input type="text" name="firstName" required className="input-field" value={formData.firstName} onChange={handleInputChange} />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tc.lastName || "Last Name"}</label>
                                            <input type="text" name="lastName" required className="input-field" value={formData.lastName} onChange={handleInputChange} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tc.email || "Email Address"}</label>
                                            <input type="email" name="email" required className="input-field" value={formData.email} onChange={handleInputChange} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tc.phone || "Phone"}</label>
                                            <input type="tel" name="phone" required className="input-field" value={formData.phone} onChange={handleInputChange} />
                                            {fieldErrors.phone && (
                                                <p className="mt-1 text-xs text-red-500 font-medium">
                                                    {fieldErrors.phone}
                                                </p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tc.streetAddress || "Street Address"}</label>
                                            <input type="text" name="address" required className="input-field" value={formData.address} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tc.city || "City"}</label>
                                            <input type="text" name="city" required className="input-field" value={formData.city} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tc.zip || "ZIP Code"}</label>
                                            <input type="text" name="zip" required className="input-field" value={formData.zip} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </section>

                                {/* Payment Method */}
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">2</span>
                                        {tc.paymentMethod || "Payment Method"}
                                    </h3>

                                    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 space-y-4">
                                        <div
                                            onClick={() => handlePaymentMethodChange('card')}
                                            className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'card'
                                                ? 'border-emerald-500 bg-emerald-50/30'
                                                : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.paymentMethod === 'card' ? 'border-emerald-600' : 'border-gray-300'}`}>
                                                        {formData.paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{tc.payWithCard || "Pay with Card"}</p>
                                                        <p className="text-xs text-gray-500">{tc.secureStripe || "Secure transaction via Stripe"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <CreditCard size={24} className="text-emerald-600" />
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {formData.paymentMethod === 'card' && (
                                                    <Motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-4 pt-4 border-t border-emerald-100"
                                                    >
                                                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                                                            <CardElement options={cardElementOptions} />
                                                        </div>
                                                    </Motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div
                                            onClick={() => handlePaymentMethodChange('cod')}
                                            className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod'
                                                ? 'border-emerald-500 bg-emerald-50/30'
                                                : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.paymentMethod === 'cod' ? 'border-emerald-600' : 'border-gray-300'}`}>
                                                    {formData.paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{tc.cod || "Cash on Delivery"}</p>
                                                    <p className="text-xs text-gray-500">{tc.payOnDelivery || "Pay when you receive your order"}</p>
                                                </div>
                                                <Banknote size={24} className="ml-auto text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 lg:p-8 sticky top-28">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">{tc.orderSummary || "Order Summary"}</h3>

                                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
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
                                                        return 'https://placehold.co/100';
                                                    })()}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-sm text-gray-500 mb-1">Quantity: {item.quantity}</p>
                                                <p className="text-emerald-600 font-semibold">LKR {Number(item.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-6 border-t border-gray-100 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>{tc.subtotal || "Subtotal"}</span>
                                        <span>LKR {cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>{tc.shipping || "Shipping"}</span>
                                        <span className="text-emerald-600 font-medium">{tc.free || "Free"}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100 mt-3">
                                        <span>{tc.total || "Total"}</span>
                                        <span>LKR {cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={loading || (formData.paymentMethod === 'card' && !stripe)}
                                    className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            <span>{tc.processing || "Processing..."}</span>
                                        </>
                                    ) : (
                                        <>
                                            {formData.paymentMethod === 'card' ? (tc.payNow || 'Pay Now') : (tc.placeOrder || 'Place Order')}
                                            <ArrowLeft size={20} className="rotate-180" />
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                                    <Lock size={12} />
                                    <span>{tc.encrypted || "Encrypted and Secure Payment"}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    outline: none;
                }
                .input-field:focus {
                    background-color: #ffffff;
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }
            `}</style>
            <Footer />
        </div>
    );
};

const Checkout = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default Checkout;

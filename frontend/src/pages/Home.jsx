
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { Leaf, Users, Star, ArrowRight, Plus, Minus, MapPin, Phone, Mail } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';
import { Link } from 'react-router-dom';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [activeFeature, setActiveFeature] = useState(1);
    const { language, switchLanguage } = useLanguage();
    const t = translations[language];

    const fetchProducts = async (url = 'http://localhost:8000/api/products') => {
        try {
            setLoading(true);
            const response = await axios.get(url);

            if (url === 'http://localhost:8000/api/products') {
                setProducts(response.data.data || response.data);
            } else {
                setProducts(prev => [...prev, ...(response.data.data || response.data)]);
            }

            setNextPageUrl(response.data.next_page_url);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);



    return (
        <div className={`min-h-screen bg-slate-50 ${language === 'si' ? 'font-sinhala' : ''}`}>

            <section className="relative min-h-screen w-full overflow-hidden">
                <Motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    src="https://images.pexels.com/photos/3560020/pexels-photo-3560020.jpeg"
                    alt="Bright green crop fields under sky"
                    className="absolute inset-0 h-full w-full object-cover b"
                />
                <div className="absolute inset-0 bg-black/5" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />

                    <div className="flex-1 flex">
                        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-end w-full pb-12">
                            <div className="max-w-xl space-y-6">


                                <Motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="text-3xl sm:text-5xl lg:text-5xl font-semibold leading-tight text-white"
                                >
                                    {t.heroTitle}
                                    <span className="block italic text-lime-100">
                                        {t.heroSubtitle}
                                    </span>
                                </Motion.h1>

                                <Motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="text-sm sm:text-base text-slate-100/90 max-w-md"
                                >
                                    {t.heroDescription}
                                </Motion.p>

                                <Motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="flex flex-wrap gap-4 pt-1"
                                >
                                    <Link to="/marketplace" className="inline-flex items-center justify-center rounded-full bg-lime-400 px-6 sm:px-7 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-lime-400/40 hover:bg-lime-300 transition-colors">
                                        {t.startInvesting}
                                        <ArrowRight size={16} className="ml-2" />
                                    </Link>
                                    <Link to="/login" className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/5 px-6 sm:px-7 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                                        {t.meetFarmers}
                                    </Link>
                                </Motion.div>
                            </div>

                            <Motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="mt-10 border-t border-white/20 pt-4 flex items-center gap-4 text-xs sm:text-sm text-slate-100/85"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] sm:text-xs tracking-[0.25em] uppercase">
                                        {t.scroll}
                                    </span>
                                </div>
                                <div className="ml-auto flex items-center gap-6">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={14} className="text-amber-300" />
                                        <span>4.9</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1">
                                            <span className="h-7 w-7 rounded-full bg-white/35 border border-white/50" />
                                            <span className="h-7 w-7 rounded-full bg-white/35 border border-white/50" />
                                            <span className="h-7 w-7 rounded-full bg-white/35 border border-white/50" />
                                        </div>
                                        <span>{t.farmersCount}</span>
                                    </div>
                                </div>
                            </Motion.div>
                        </div>
                    </div>
                </div>
            </section>


            <main className="max-w-8xl mx-auto px-4 sm:px-6 ">
                <section id="about" className="py-16 sm:py-20 px-6 sm:px-10">
                    <div className="max-w-8xl mx-auto">


                        <Motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-3xl sm:text-5xl lg:text-5xl font leading-[1.1] tracking-tight text-emerald-950"
                        >
                            {t.platformDesc}
                            <span className="text-gray-400"> {t.byDelivering} </span>
                            <span className="inline-block align-middle mx-1">
                                <img
                                    src="https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=300"
                                    alt="Technology"
                                    className="h-10 w-20 sm:h-12 sm:w-24 object-cover rounded-full border border-emerald-100"
                                />
                            </span>
                            <span className="text-gray-400"> {t.practicalTools}</span>
                        </Motion.h2>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-start max-w-8xl mx-auto px-4 sm:px-6 mb-24">
                    <div className="space-y-8">
                        <Motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h3 className="text-3xl sm:text-4xl text-emerald-950 mb-2">
                                {t.smartSolutionsTitle}
                            </h3>
                            <p className="text-2xl sm:text-3xl font-light text-emerald-800">
                                {t.smartSolutionsSubtitle}
                            </p>
                        </Motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
                            {[
                                {
                                    id: 0,
                                    title: t.features[0].title,
                                    icon: <Leaf className="w-5 h-5 text-emerald-600" />,
                                    desc: t.features[0].desc
                                },
                                {
                                    id: 1,
                                    title: t.features[1].title,
                                    icon: <Users className="w-5 h-5 text-emerald-600" />,
                                    desc: t.features[1].desc
                                },
                                {
                                    id: 2,
                                    title: t.features[2].title,
                                    icon: <Star className="w-5 h-5 text-emerald-600" />,
                                    desc: t.features[2].desc
                                }
                            ].map((feature, index) => (
                                <Motion.div
                                    key={feature.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    onClick={() => setActiveFeature(feature.id)}
                                    className={`cursor-pointer rounded-2xl transition-all duration-300 overflow-hidden ${activeFeature === feature.id
                                        ? 'bg-white shadow-lg shadow-emerald-900/5 ring-1 ring-emerald-100'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                        } md:col-span-1 lg:col-span-1`}
                                >
                                    <div className="p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {activeFeature === feature.id && (
                                                <div className="bg-emerald-100 p-2 rounded-full hidden sm:block">
                                                    {feature.icon}
                                                </div>
                                            )}
                                            <span className={`font-semibold text-sm sm:text-base ${activeFeature === feature.id ? 'text-emerald-950' : 'text-gray-600'}`}>
                                                {feature.title}
                                            </span>
                                        </div>
                                        <button className="text-emerald-600 shrink-0">
                                            {activeFeature === feature.id ? <Minus size={20} /> : <Plus size={20} />}
                                        </button>
                                    </div>

                                    <Motion.div
                                        initial={false}
                                        animate={{ height: activeFeature === feature.id ? 'auto' : 0, opacity: activeFeature === feature.id ? 1 : 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 sm:pl-[4.5rem]">
                                            <p className="text-gray-500 text-sm leading-relaxed">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </Motion.div>
                                </Motion.div>
                            ))}
                        </div>
                    </div>

                    <Motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative h-64 sm:h-[500px] w-full rounded-[2.5rem] overflow-hidden group mt-8 lg:mt-0"
                    >
                        <img
                            src="https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=1600"
                            alt="Smart Farming"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                        <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-white">
                            <p className="text-sm sm:text-lg font-medium max-w-sm backdrop-blur-md bg-white/10 p-4 rounded-2xl border border-white/20">
                                {t.quote}
                            </p>
                        </div>
                    </Motion.div>
                </section>



                <section className="py-20 border-t border-gray-100">
                    <Motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                <span className="text-xs font-semibold tracking-widest uppercase text-emerald-900">{t.featuredProduce}</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-semibold text-emerald-950">
                                {t.freshHarvest}
                            </h2>
                        </div>
                        <a href="/marketplace" className="group inline-flex items-center gap-2 font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                            {t.viewAll}
                            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                        </a>
                    </Motion.div>

                    <Motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8"
                    >
                        {loading && products.length === 0 ? (
                            <div className="col-span-full flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500 py-10">
                                {t.noProducts}
                            </p>
                        ) : (
                            products.slice(0, 3).map((product, index) => (
                                <Motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <ProductCard product={product} />
                                </Motion.div>
                            ))
                        )}
                    </Motion.div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-20 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto text-center mb-12">
                        <Motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                <span className="text-xs font-semibold tracking-widest uppercase text-emerald-900">{t.contact?.getInTouch || "Contact"}</span>
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-semibold text-emerald-950 mb-4">
                                {t.contact?.subtitle || "We'd love to hear from you."}
                            </h2>
                        </Motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Office */}
                        <Motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-emerald-900/5 text-center group hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <MapPin size={28} />
                            </div>
                            <h3 className="text-xl font-semibold text-emerald-950 mb-3">{t.contact?.officeTitle || "Our Office"}</h3>
                            <p className="text-gray-600">{t.contact?.officeAddress || "123 AgriLink Way, Colombo, Sri Lanka"}</p>
                        </Motion.div>

                        {/* Phone */}
                        <Motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-emerald-900/5 text-center group hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Phone size={28} />
                            </div>
                            <h3 className="text-xl font-semibold text-emerald-950 mb-3">{t.contact?.phoneTitle || "Phone"}</h3>
                            <p className="text-gray-600">{t.contact?.phoneValue || "+94 11 234 5678"}</p>
                        </Motion.div>

                        {/* Email */}
                        <Motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-emerald-900/5 text-center group hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Mail size={28} />
                            </div>
                            <h3 className="text-xl font-semibold text-emerald-950 mb-3">{t.contact?.emailTitle || "Email"}</h3>
                            <p className="text-gray-600">{t.contact?.emailValue || "support@agrilink.lk"}</p>
                        </Motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;

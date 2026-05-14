import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Mail, MapPin, Phone, ShieldCheck, Calendar, Camera, Heart, Star, Leaf, Edit3, Activity, Award } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';
import api from '../api/axios';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';

const Profile = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language]?.profile || translations['en'].profile;

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        if (!stored) {
            return null;
        }
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    });

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        profile_picture: '',
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                bio: user.bio || '',
                profile_picture: user.profile_picture || '',
            });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        setError('');

        const formDataCloudinary = new FormData();
        formDataCloudinary.append('file', file);
        formDataCloudinary.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formDataCloudinary,
                }
            );

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, profile_picture: data.secure_url }));
        } catch (err) {
            console.error("Upload Error:", err);
            setError('Failed to upload profile picture. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError('');

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                address: formData.address || null,
                bio: formData.bio || null,
                profile_picture: formData.profile_picture || null,
            };

            const response = await api.put('/me', payload);
            const updated = response.data;

            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
            window.dispatchEvent(new Event('auth-change'));
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return null;
    }

    const displayPic = user.profile_picture || "https://images.unsplash.com/photo-1595152772224-eb9029e88cdc?auto=format&fit=crop&q=80&w=400&h=400";
    const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString() : t.recentMember || "Recent Member";

    // Bento Box Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.04 }
        }
    };

    const boxVariants = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
    };

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-800 font-inter ${language === 'si' ? 'font-sinhala' : ''} selection:bg-emerald-100`}>

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
                                <span className="block">{t.title || "User Profile"}</span>
                                <span className="text-emerald-300">{t.settings || "Settings"}</span>
                            </Motion.h1>
                            <Motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="text-slate-200 text-lg sm:text-xl font-light"
                            >
                                {t.subtitle || "Manage your account settings and agricultural operations."}
                            </Motion.p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 pb-24">

                {/* Header Actions */}
                <div className="mb-8 flex justify-end">
                    {!editing && (
                        <Motion.button
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            onClick={() => setEditing(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 rounded-full text-slate-700 font-semibold transition-all duration-300"
                        >
                            <Edit3 size={18} className="text-emerald-500" />
                            <span>{t.editProfile || "Edit Profile"}</span>
                        </Motion.button>
                    )}
                </div>

                {error && (
                    <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                        {error}
                    </Motion.div>
                )}

                <AnimatePresence mode="wait">
                    {editing ? (
                        /* Editing Form Area */
                        <Motion.div
                            key="edit-profile"
                            initial="hidden" animate="visible" exit="hidden" variants={containerVariants}
                            className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50"
                        >
                            <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                                <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <Edit3 size={24} />
                                </span>
                                {t.editDetailsConfig || "Edit Details Configuration"}
                            </h2>

                            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">

                                <div className="space-y-6">
                                    {/* Name Input */}
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                            {t.fullName || 'Full Name'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                    </div>

                                    {/* Email Input */}
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                            {t.email || "Email"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Input */}
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                            {t.phone || "Phone"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Location Input */}
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                            {t.location || "Location"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Bio Textarea */}
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                            {t.bioLabel || "Bio"}
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 resize-none"
                                            placeholder={t.bioPlaceholder || "Tell us about your agricultural journey..."}
                                        />
                                    </div>

                                    {/* Profile Picture Upload */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                            {t.avatarSelection || "Avatar Selection"}
                                        </label>
                                        <div className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-3xl">
                                            <div className="shrink-0 relative">
                                                <img
                                                    src={formData.profile_picture || displayPic}
                                                    alt="Avatar Preview"
                                                    className="w-20 h-20 rounded-2xl object-cover shadow-sm bg-white"
                                                />
                                                {uploadingImage && (
                                                    <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                                        <Activity className="animate-spin text-emerald-600" size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="relative group/upload cursor-pointer mt-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={uploadingImage}
                                                        className="block w-full text-sm text-slate-500
                                                    file:mr-4 file:py-2.5 file:px-4
                                                    file:rounded-xl file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-white file:text-emerald-700
                                                    hover:file:bg-emerald-50 file:shadow-sm cursor-pointer transition-colors"
                                                    />
                                                </div>
                                                <p className="mt-2 text-xs text-slate-400">{t.avatarRecommended || "Recommended: Square image, max 2MB."}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-6 mt-auto">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {saving ? (t.processing || 'Processing...') : (t.saveConfig || 'Save Configuration')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(false)}
                                            className="px-8 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all"
                                        >
                                            {t.cancel || "Cancel"}
                                        </button>
                                    </div>
                                </div>

                            </form>
                        </Motion.div>
                    ) : (
                        /* White Theme Bento Box Grid */
                        <Motion.div
                            key="view-profile"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-6"
                        >
                            {/* Box 1: Profile Main Identity Card */}
                            <Motion.div variants={boxVariants} className="md:col-span-12 lg:col-span-8 bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden group">
                                <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-center sm:items-center gap-8 h-full">

                                    {/* Avatar */}
                                    <div className="relative w-36 h-36 shrink-0">
                                        <img
                                            src={displayPic}
                                            alt={user.name}
                                            className="relative w-full h-full object-cover rounded-[2rem] shadow-lg bg-slate-100 z-10"
                                        />
                                        <div className="absolute -bottom-3 -right-3 bg-emerald-100 text-emerald-600 p-2.5 rounded-xl z-20 shadow-sm border border-emerald-50">
                                            <ShieldCheck size={20} className="fill-emerald-100" />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4 mx-auto sm:mx-0 w-max border border-slate-200">
                                            <Leaf size={14} className="text-emerald-500" />
                                            {user.role} {t.role || "Member"}
                                        </div>
                                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                                            {user.name}
                                        </h2>
                                        <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-2 font-medium">
                                            <MapPin size={16} className="text-emerald-500" />
                                            {(user.address || "").split(',')[0] || t.locationNotSet || "Location Not Set"}
                                        </p>

                                        {/* Status metrics */}
                                        <div className="flex items-center justify-center sm:justify-start gap-8 mt-6">
                                            <div className="text-center sm:text-left">
                                                <span className="block text-2xl font-bold text-slate-800">{t.active || "Active"}</span>
                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.status || "Status"}</span>
                                            </div>
                                            <div className="w-px h-10 bg-slate-200" />
                                            <div className="text-center sm:text-left">
                                                <span className="block w-min mx-auto sm:mx-0 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold flex gap-1.5 items-center">
                                                    <Star fill="currentColor" size={14} /> {t.verified || "Verified"}
                                                </span>
                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 block">{t.identity || "Identity"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Motion.div>

                            {/* Box 2: Quick Bio */}
                            <Motion.div variants={boxVariants} className="md:col-span-12 lg:col-span-4 bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-emerald-900 pointer-events-none">
                                    <Award size={120} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 relative z-10">
                                    <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <User size={18} />
                                    </span>
                                    {t.biography || "Biography"}
                                </h3>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex-1 mt-2">
                                    <p className="text-slate-600 font-medium text-sm leading-relaxed relative z-10 text-center sm:text-left">
                                        {user.bio ? (
                                            <span>"{user.bio}"</span>
                                        ) : (
                                            <span className="opacity-60 italic">{t.noBio || "No biography provided yet. Edit your profile to tell the community about your expertise."}</span>
                                        )}
                                    </p>
                                </div>
                            </Motion.div>

                            {/* Box 3: Contact Detailed */}
                            <Motion.div variants={boxVariants} className="md:col-span-12 lg:col-span-8 bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-[2.5rem] p-8 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                        <Activity size={18} />
                                    </span>
                                    {t.contactInfo || "Contact Information"}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ContactCard icon={<Mail />} label={t.emailAddress || "Email Address"} value={user.email} />
                                    <ContactCard icon={<Phone />} label={t.phoneNumber || "Phone Number"} value={user.phone || t.notProvided || "Not Provided"} />
                                    <ContactCard icon={<MapPin />} label={t.fullAddress || "Full Address"} value={user.address || t.notProvided || "Not Provided"} className="sm:col-span-2" />
                                </div>
                            </Motion.div>

                            {/* Box 4: Account Timeline */}
                            <Motion.div variants={boxVariants} className="md:col-span-12 lg:col-span-4 bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors pointer-events-none" />
                                <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center gap-6 relative z-10 h-full justify-center">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                                        <Calendar size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.joinedAgrilink || "Joined Agrilink"}</p>
                                        <p className="text-3xl font-extrabold text-slate-800">{memberSince}</p>
                                    </div>
                                </div>
                            </Motion.div>

                        </Motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
};

// Component for Contact Cards inside the Box
const ContactCard = ({ icon, label, value, className = "" }) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-colors ${className}`}>
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 shrink-0">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
        </div>
    </div>
);

export default Profile;

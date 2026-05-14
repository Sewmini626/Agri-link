import React from "react";
import { Link } from "react-router-dom";
import { Mail, Facebook, Instagram, Linkedin, Twitter, ArrowRight, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

import { useLanguage } from '../context/LanguageContext';
import { translations } from '../config/translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <footer className="bg-emerald-100 text-gray-900 mt-auto border-t border-gray-100">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-8 md:pb-10">
        {/* CTA Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-100 pb-12 mb-12 gap-8 text-center lg:text-left">
          <div className="max-w-2xl mx-auto lg:mx-0">
            <h2 className="text-3xl md:text-4xl font-medium mb-4 tracking-tight text-emerald-950">
              {t.footer.readyToTransform}
            </h2>
            <p className="text-gray-500 text-base md:text-lg">
              {t.footer.joinThousands}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-emerald-200 text-center">
              {t.footer.getStarted}
            </Link>
            <Link to="/contact" className="border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 px-8 py-3.5 rounded-full font-semibold transition-all duration-300 text-center">
              {t.footer.contactSales}
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold tracking-tight text-emerald-950">AGRILINK.</span>
            </div>
            <p className="text-gray-500 leading-relaxed max-w-sm text-sm md:text-base">
              {t.footer.brandDesc}
            </p>
            <div className="flex gap-4 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <h3 className="font-semibold text-lg text-emerald-950">{t.footer.platform}</h3>
            <ul className="space-y-3 text-sm md:text-base text-gray-500">
              <li><Link to="/products" className="hover:text-emerald-600 transition-colors">{t.footer.marketplace}</Link></li>
              <li><Link to="/products" className="hover:text-emerald-600 transition-colors">{t.footer.buyers}</Link></li>
              <li><Link to="/seller-dashboard" className="hover:text-emerald-600 transition-colors">{t.footer.sellers}</Link></li>
              <li><Link to="/pricing" className="hover:text-emerald-600 transition-colors">{t.footer.pricing}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <h3 className="font-semibold text-lg text-emerald-950">{t.footer.company}</h3>
            <ul className="space-y-3 text-sm md:text-base text-gray-500">
              <li><Link to="/about" className="hover:text-emerald-600 transition-colors">{t.footer.aboutUs}</Link></li>
              <li><Link to="/careers" className="hover:text-emerald-600 transition-colors">{t.footer.careers}</Link></li>
              <li><Link to="/blog" className="hover:text-emerald-600 transition-colors">{t.footer.blog}</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600 transition-colors">{t.footer.contact}</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4 md:space-y-6">
            <h3 className="font-semibold text-lg text-emerald-950">{t.footer.contactUs}</h3>
            <ul className="space-y-4 text-sm md:text-base text-gray-500">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <span>No. 123, Galle Road,<br />Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>+94 77 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>support@agrilink.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 text-center md:text-left">
          <p>© {new Date().getFullYear()} AgriLink Inc. {t.footer.allRightsReserved}</p>
          <div className="flex gap-6 md:gap-8 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-emerald-600 transition-colors">{t.footer.privacyPolicy}</Link>
            <Link to="/terms" className="hover:text-emerald-600 transition-colors">{t.footer.termsOfService}</Link>
            <Link to="/cookies" className="hover:text-emerald-600 transition-colors">{t.footer.cookieSettings}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Calendar, DollarSign, Package, Download } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [productsRes, ordersRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/my-products', config),
                    axios.get('http://localhost:8000/api/seller-orders', config)
                ]);

                setProducts(productsRes.data.data || productsRes.data || []);
                setOrders(ordersRes.data.data || ordersRes.data || []);
            } catch (error) {
                console.error("Failed to fetch reports data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    // Process Date: "Feb 21, 2026"
    const processMonthlyRevenue = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueByMonth = new Array(12).fill(0);

        orders.forEach(order => {
            // order.date is like "Feb 21, 2026"
            const dateParts = order.date.split(' ');
            if (dateParts.length >= 3) {
                const monthStr = dateParts[0];
                const yearStr = dateParts[2];

                if (parseInt(yearStr) === selectedYear) {
                    const monthIndex = months.indexOf(monthStr);
                    if (monthIndex !== -1) {
                        revenueByMonth[monthIndex] += Number(order.total) || 0;
                    }
                }
            }
        });

        const maxRevenue = Math.max(...revenueByMonth, 1); // Avoid division by zero

        return { months, revenueByMonth, maxRevenue };
    };

    const processProductPrices = () => {
        // Top 10 products by price
        const sortedProducts = [...products].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 10);
        const maxPrice = Math.max(...sortedProducts.map(p => Number(p.price)), 1);

        return { sortedProducts, maxPrice };
    };

    const { months, revenueByMonth, maxRevenue } = processMonthlyRevenue();
    const { sortedProducts, maxPrice } = processProductPrices();

    const totalRevenueYear = revenueByMonth.reduce((a, b) => a + b, 0);

    const generatePDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.text("AgriLink Seller Report", 14, 20);

        doc.setFontSize(14);
        doc.setTextColor(75, 85, 99); // Gray-600
        doc.text(`Yearly Summary - ${selectedYear}`, 14, 30);

        // Add Summary Stats
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55); // Gray-800
        doc.text(`Total Revenue: LKR ${totalRevenueYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 45);
        doc.text(`Total Active Products: ${products.length}`, 14, 52);
        doc.text(`Total Items Sold: ${orders.reduce((sum, order) => sum + (Number(order.items) || 0), 0)}`, 14, 59);

        // Add Monthly Revenue Table
        const monthlyData = months.map((month, index) => [
            month,
            `LKR ${revenueByMonth[index].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);

        autoTable(doc, {
            startY: 70,
            head: [['Month', 'Revenue']],
            body: monthlyData,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] },
        });

        // Add Top Products Table
        const finalY = doc.lastAutoTable.finalY + 15;

        doc.setFontSize(16);
        doc.setTextColor(16, 185, 129);
        doc.text("Top Products by Price", 14, finalY);

        const productsData = sortedProducts.map(p => [
            p.name,
            p.category || 'N/A',
            `LKR ${Number(p.price).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: finalY + 10,
            head: [['Product Name', 'Category', 'Price']],
            body: productsData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }, // Blue-500
        });

        const date = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175);
        doc.text(`Generated on: ${date}`, 14, doc.internal.pageSize.height - 10);

        // Save the PDF
        doc.save(`AgriLink_Report_${selectedYear}.pdf`);
    };

    return (
        <div className="space-y-8 font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                    <p className="text-gray-500 text-sm mt-1">Comprehensive view of your sales and pricing.</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <Calendar size={18} className="text-gray-500 ml-2" />
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer outline-none pr-4"
                    >
                        {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={generatePDF}
                    className="flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto mt-4 sm:mt-0"
                >
                    <Download size={18} />
                    Export to PDF
                </button>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <BarChart3 size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Monthly Revenue</h3>
                        </div>
                        <p className="text-sm text-gray-500">Sales performance for {selectedYear}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-emerald-600">LKR {totalRevenueYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className="h-72 flex items-end justify-between gap-2 sm:gap-4 px-2 mt-10">
                    {revenueByMonth.map((revenue, i) => {
                        const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                        return (
                            <div key={i} className="w-full h-full flex flex-col justify-end group relative">
                                <Motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(heightPercent, 2)}%` }} // Minimum height for visibility
                                    transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                                    className={`w-full rounded-t-xl transition-colors duration-300 relative ${revenue > 0 ? 'bg-gradient-to-t from-emerald-400 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-500' : 'bg-gray-100'}`}
                                >
                                    {revenue > 0 && (
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl z-20 whitespace-nowrap pointer-events-none">
                                            LKR {revenue.toLocaleString()}
                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                        </div>
                                    )}
                                </Motion.div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                    {months.map((m, i) => (
                        <span key={i} className="text-center w-full">{m}</span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Price Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Top Products by Price</h3>
                    </div>

                    <div className="space-y-5 mt-8">
                        {sortedProducts.length > 0 ? sortedProducts.map((product, index) => {
                            const widthPercent = (Number(product.price) / maxPrice) * 100;
                            return (
                                <div key={product.id || index} className="group">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-semibold text-gray-800 truncate pr-4">{product.name}</span>
                                        <span className="font-bold text-blue-600 whitespace-nowrap">LKR {Number(product.price).toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <Motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${widthPercent}%` }}
                                            transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                                            className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <Package size={48} className="mb-3 opacity-20" />
                                <p>No products found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl shadow-lg border border-transparent text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <DollarSign size={100} />
                        </div>
                        <h3 className="text-emerald-100 font-medium mb-1">Average Order Value</h3>
                        <p className="text-4xl font-bold font-outfit z-10 relative">
                            LKR {orders.length > 0 ? (totalRevenueYear / orders.filter(o => {
                                const y = o.date.split(' ')[2];
                                return parseInt(y) === selectedYear;
                            }).length || 1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </p>
                        <div className="mt-6 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                            <TrendingUp size={16} />
                            Based on {orders.length} total orders
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <h3 className="text-gray-500 text-sm font-medium mb-2">Products Sold</h3>
                            <p className="text-3xl font-bold text-gray-900">
                                {orders.reduce((sum, order) => sum + (Number(order.items) || 0), 0)}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <h3 className="text-gray-500 text-sm font-medium mb-2">Active Products</h3>
                            <p className="text-3xl font-bold text-gray-900">
                                {products.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Reports;

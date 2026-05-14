import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const SavedContext = createContext();

export const useSaved = () => useContext(SavedContext);

export const SavedProvider = ({ children }) => {
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Monitor auth state to fetch/clear items
    useEffect(() => {
        const checkUser = () => {
            const stored = localStorage.getItem('user');
            try {
                const parsed = stored ? JSON.parse(stored) : null;
                setUser(parsed);
            } catch {
                setUser(null);
            }
        };

        checkUser();

        const handleAuthChange = () => checkUser();
        window.addEventListener('auth-change', handleAuthChange);
        window.addEventListener('storage', handleAuthChange); // Cross-tab support

        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    useEffect(() => {
        if (user) {
            fetchSavedItems();
        } else {
            setSavedItems([]);
        }
    }, [user]);

    const fetchSavedItems = async () => {
        try {
            setLoading(true);
            const response = await api.get('/saved-items');
            // Backend returns list of products directly
            setSavedItems(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching saved items", error);
        } finally {
            setLoading(false);
        }
    };

    const isSaved = (productId) => {
        return savedItems.some(item => item.id === productId);
    };

    const toggleSave = async (product) => {
        if (!user) {
            // Redirect to login if not logged in
            window.location.href = '/login';
            return;
        }

        const alreadySaved = isSaved(product.id);

        // Optimistic UI Update
        if (alreadySaved) {
            setSavedItems(prev => prev.filter(item => item.id !== product.id));
            try {
                await api.delete(`/saved-items/${product.id}`);
            } catch (error) {
                console.error("Failed to remove saved item", error);
                // Revert on failure
                setSavedItems(prev => [...prev, product]);
            }
        } else {
            setSavedItems(prev => [...prev, product]);
            try {
                await api.post('/saved-items', { product_id: product.id });
                // We don't necessarily need to update state with response if optimistically added
            } catch (error) {
                console.error("Failed to save item", error);
                // Revert on failure
                setSavedItems(prev => prev.filter(item => item.id !== product.id));
            }
        }
    };

    return (
        <SavedContext.Provider value={{ savedItems, isSaved, toggleSave, loading }}>
            {children}
        </SavedContext.Provider>
    );
};

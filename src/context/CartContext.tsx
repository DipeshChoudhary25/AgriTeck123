import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; discount: number; message: string };
  removeCoupon: () => void;
  discountAmount: number;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  placeOrder: (shippingAddress: string, paymentMethod: string) => Promise<Order>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('agritech_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('agritech_cart', JSON.stringify(cart));
  }, [cart]);

  const refreshOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [user]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const rawTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const discountAmount = appliedCoupon === 'KISAN2026' ? Math.round(rawTotal * 0.15) : 0;
  const totalAmount = Math.max(0, rawTotal - discountAmount);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'KISAN2026') {
      setAppliedCoupon('KISAN2026');
      return { success: true, discount: 15, message: '15% Kisan Subsidized Discount Applied!' };
    }
    return { success: false, discount: 0, message: 'Invalid coupon code. Try KISAN2026' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const placeOrder = async (deliveryAddress: string, paymentMethod: string): Promise<Order> => {
    const orderData = {
      items: cart,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      farmerName: user?.name || 'Ramesh Patel',
    };

    const newOrder = await api.createOrder(orderData);
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setIsCartOpen(false);
    return newOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        orders,
        refreshOrders,
        placeOrder,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

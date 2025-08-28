
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem, MenuItem, Order } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { createOrder, getOrders as fetchOrders, completeOrder as completeOrderInDB } from '@/ai/flows/order-flow';

interface OrderContextType {
  cart: CartItem[];
  orders: Order[]; // All orders for the kitchen view
  myOrders: Order[]; // Orders placed by the current user
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (customerName: string, customerPhone: string) => Promise<string | null>;
  getOrders: () => Promise<void>; // To refresh orders
  completeOrder: (token: string) => Promise<void>; // To update an order's status
  cartTotal: number;
  cartCount: number;
  loading: boolean;
  error: string | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const MY_ORDERS_KEY = 'myOrderTokens';

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrderTokens, setMyOrderTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load my order tokens from local storage on initial load
  useEffect(() => {
    try {
      const storedTokens = localStorage.getItem(MY_ORDERS_KEY);
      if (storedTokens) {
        setMyOrderTokens(JSON.parse(storedTokens));
      }
    } catch (error) {
        console.error("Could not read from localStorage", error)
    }
    getOrders();
  }, []);

  const myOrders = orders.filter(order => myOrderTokens.includes(order.token))
    .sort((a, b) => b.timestamp - a.timestamp);

  const getOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const allOrders = await fetchOrders();
      setOrders(allOrders);
    } catch (err) {
      setError('Failed to fetch orders.');
      console.error(err);
      toast({ title: 'Error', description: 'Could not load orders. Please try again later.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };


  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const placeOrder = async (customerName: string, customerPhone: string): Promise<string | null> => {
    if (!cart.length) {
        toast({ title: "Your cart is empty", variant: "destructive"});
        return null;
    }
    
    setLoading(true);
    try {
        const newOrder = await createOrder({
            items: cart,
            customerName,
            customerPhone,
            total: cartTotal
        });
        
        // Refresh orders from the backend
        await getOrders();

        const updatedTokens = [...myOrderTokens, newOrder.token];
        setMyOrderTokens(updatedTokens);
        try {
            localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(updatedTokens));
        } catch(error) {
            console.error("Could not write to localStorage", error);
        }
        
        clearCart();
        return newOrder.token;
    } catch (err) {
        setError("Failed to place order.");
        toast({ title: "Error", description: "Could not place your order. Please try again.", variant: "destructive" });
        console.error(err);
        return null;
    } finally {
        setLoading(false);
    }
  };

  const completeOrder = async (token: string) => {
    setLoading(true);
    try {
        await completeOrderInDB(token);
        // Refresh orders from the backend
        await getOrders();
    } catch (err) {
        setError("Failed to update order.");
        toast({ title: "Error", description: "Could not update order status.", variant: "destructive" });
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        cart,
        orders,
        myOrders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        completeOrder,
        getOrders,
        cartTotal,
        cartCount,
        loading,
        error,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

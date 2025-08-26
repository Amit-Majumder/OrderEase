
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem, MenuItem, Order } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface OrderContextType {
  cart: CartItem[];
  orders: Order[];
  myOrders: Order[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (customerName: string, customerPhone: string) => string;
  completeOrder: (token: string) => void;
  cartTotal: number;
  cartCount: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const MY_ORDERS_KEY = 'myOrderTokens';
const ALL_ORDERS_KEY = 'allOrders';


export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrderTokens, setMyOrderTokens] = useState<string[]>([]);
  
  // Load initial state from local storage
  useEffect(() => {
    try {
      const storedTokens = localStorage.getItem(MY_ORDERS_KEY);
      if (storedTokens) {
        setMyOrderTokens(JSON.parse(storedTokens));
      }
      const storedOrders = localStorage.getItem(ALL_ORDERS_KEY);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
        console.error("Could not read from localStorage", error)
    }
  }, []);

  const myOrders = orders.filter(order => myOrderTokens.includes(order.token))
    .sort((a, b) => b.timestamp - a.timestamp);

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

  const placeOrder = (customerName: string, customerPhone: string): string => {
    const token = String(Math.floor(Math.random() * 9000) + 1000);
    const newOrder: Order = {
      token,
      items: cart,
      customerName: customerName || 'Guest',
      customerPhone,
      total: cartTotal,
      timestamp: Date.now(),
      status: 'new',
    };
    
    setOrders((prevOrders) => {
        const newOrders = [newOrder, ...prevOrders];
        try {
            localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(newOrders));
        } catch(error) {
            console.error("Could not write to localStorage", error)
        }
        return newOrders;
    });

    const updatedTokens = [...myOrderTokens, token];
    setMyOrderTokens(updatedTokens);
    try {
        localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(updatedTokens));
    } catch(error) {
        console.error("Could not write to localStorage", error)
    }
    
    clearCart();
    return token;
  };

  const completeOrder = (token: string) => {
    setOrders((prevOrders) => {
        const newOrders = prevOrders.map((order) => (order.token === token ? { ...order, status: 'completed' } : order));
        try {
            localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(newOrders));
        } catch(error) {
            console.error("Could not write to localStorage", error)
        }
        return newOrders;
    });
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
        cartTotal,
        cartCount,
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

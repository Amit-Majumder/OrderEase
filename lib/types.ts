export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Starters' | 'Heavy Snacks' | 'Rice & Noodles' | 'Sides';
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  token: string;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  total: number;
  timestamp: number;
  status: 'new' | 'completed';
}

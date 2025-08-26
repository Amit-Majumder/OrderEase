export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Burgers' | 'Pizzas' | 'Sides' | 'Drinks';
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

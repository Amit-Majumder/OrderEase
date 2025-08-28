
'use server';
/**
 * @fileOverview A flow for managing restaurant orders.
 *
 * - createOrder - Creates a new order from cart items and customer details.
 * - getOrders - Retrieves all existing orders.
 * - completeOrder - Marks a specific order as complete.
 * - CreateOrderInput - The input type for the createOrder function.
 * - Order - The data type for a single order.
 */

import { ai } from '@/ai/genkit';
import type { CartItem, Order } from '@/lib/types';
import { z } from 'zod';

// Zod schema for a single item in the cart
const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
  category: z.enum(['Starters', 'Heavy Snacks', 'Rice & Noodles', 'Sides']),
  quantity: z.number(),
});

// Zod schema for the input when creating an order
const CreateOrderInputSchema = z.object({
  items: z.array(CartItemSchema),
  customerName: z.string(),
  customerPhone: z.string(),
  total: z.number(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;


// This is a temporary in-memory "database" to store orders.
// In a production application, you should replace this with a real database like Firestore or a SQL database.
let orders: Order[] = [];


/**
 * Creates a new order and saves it.
 * @param input - The details of the order to be created.
 * @returns The newly created order.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return await createOrderFlow(input);
}

const createOrderFlow = ai.defineFlow(
  {
    name: 'createOrderFlow',
    inputSchema: CreateOrderInputSchema,
    outputSchema: z.custom<Order>(),
  },
  async (input) => {
    const { items, customerName, customerPhone, total } = input;

    const newOrder: Order = {
      token: String(Math.floor(Math.random() * 9000) + 1000), // Generate a random 4-digit token
      items,
      customerName,
      customerPhone,
      total,
      timestamp: Date.now(),
      status: 'new',
    };

    // TODO: Replace this with your database logic to save the new order.
    orders.unshift(newOrder);

    return newOrder;
  }
);

/**
 * Retrieves all orders.
 * @returns A promise that resolves to an array of all orders.
 */
export async function getOrders(): Promise<Order[]> {
    return await getOrdersFlow();
}

const getOrdersFlow = ai.defineFlow(
    {
        name: 'getOrdersFlow',
        inputSchema: z.void(),
        outputSchema: z.array(z.custom<Order>()),
    },
    async () => {
        // TODO: Replace this with your database logic to fetch all orders.
        return orders;
    }
);

/**
 * Marks an order as complete.
 * @param token - The token of the order to mark as complete.
 * @returns A promise that resolves when the order is updated.
 */
export async function completeOrder(token: string): Promise<void> {
    await completeOrderFlow(token);
}

const completeOrderFlow = ai.defineFlow(
    {
        name: 'completeOrderFlow',
        inputSchema: z.string(),
        outputSchema: z.void(),
    },
    async (token) => {
        // TODO: Replace this with your database logic to update the order status.
        const orderIndex = orders.findIndex(o => o.token === token);
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'completed';
        }
    }
);

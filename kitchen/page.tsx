
'use client';

import { OrderCard } from '@/components/OrderCard';
import { useOrder } from '@/context/OrderContext';
import { ChefHat, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

export default function KitchenPage() {
  const { orders, getOrders, loading, error } = useOrder();

  // Fetch orders when component mounts
  useEffect(() => {
    getOrders();
  }, []);

  const newOrders = orders.filter((o) => o.status === 'new');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background shadow-sm sticky top-0 z-10">
        <div className="container mx-auto p-4 flex justify-center items-center">
          <div className="flex items-center gap-3 cursor-default">
             <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline">Kitchen</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">

        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="ml-4 text-muted-foreground">Loading orders...</p>
          </div>
        )}

        {error && (
            <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg">
                <p>Error: {error}</p>
                <p>Could not load orders. Please try again later.</p>
            </div>
        )}

        {!loading && !error && (
            <>
                <section>
                <h2 className="text-2xl font-semibold font-headline text-primary mb-4">New Orders ({newOrders.length})</h2>
                {newOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {newOrders.map((order) => (
                        <OrderCard key={order.token} order={order} />
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-background rounded-lg">
                    <p className="text-muted-foreground">No new orders at the moment.</p>
                    </div>
                )}
                </section>

                <Separator className="my-12" />

                <section>
                <h2 className="text-2xl font-semibold font-headline text-muted-foreground mb-4">Completed Orders ({completedOrders.length})</h2>
                {completedOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {completedOrders.map((order) => (
                        <OrderCard key={order.token} order={order} />
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-background rounded-lg">
                    <p className="text-muted-foreground">No orders have been completed yet.</p>
                    </div>
                )}
                </section>
            </>
        )}
      </main>
    </div>
  );
}

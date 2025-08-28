
'use client';

import { useOrder } from '@/context/OrderContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubPageHeader } from '@/components/SubPageHeader';
import { Separator } from '@/components/ui/separator';
import { CircleDashed, CheckCircle, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/lib/types';
import { useEffect, useState } from 'react';

function MyOrderCard({ order }: { order: Order }) {
    const time = new Date(order.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                         {order.status === 'new' ? (
                            <CircleDashed className="h-6 w-6 text-primary animate-spin" />
                        ) : (
                            <CheckCircle className="h-6 w-6 text-accent" />
                        )}
                        Order #{order.token}
                    </span>
                    <span className={cn(
                        "text-sm font-semibold px-3 py-1 rounded-full",
                        order.status === 'new' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                    )}>
                        {order.status === 'new' ? 'In Progress' : 'Completed'}
                    </span>
                </CardTitle>
                <CardDescription>Placed at {time}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between">
                            <span>{item.name} x {item.quantity}</span>
                            <span>INR {(item.price * item.quantity)}</span>
                        </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold">
                        <span>Total Paid</span>
                        <span>INR {order.total}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MyOrdersPage() {
  const { myOrders, loading, error, getOrders } = useOrder();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    getOrders();
  }, []);


  if (!isClient) {
    return null; 
  }

  return (
    <>
      <SubPageHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">My Orders</h1>
          <p className="text-lg text-muted-foreground mt-2">Here's a list of your recent orders.</p>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="ml-4 text-muted-foreground">Loading your orders...</p>
          </div>
        )}

        {error && (
            <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg">
                <p>Error: {error}</p>
                 <p>Could not load your orders. Please try again later.</p>
            </div>
        )}

        {!loading && !error && myOrders.length > 0 ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {myOrders.map(order => (
              <MyOrderCard key={order.token} order={order} />
            ))}
          </div>
        ) : null}

        {!loading && !error && myOrders.length === 0 ? (
           <div className="text-center py-16 bg-background rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            <Button asChild className="mt-4">
              <Link href="/menu">Go to Menu</Link>
            </Button>
          </div>
        ) : null}
      </main>
    </>
  );
}

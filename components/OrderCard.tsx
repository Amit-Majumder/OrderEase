
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useOrder } from '@/context/OrderContext';
import type { Order } from '@/lib/types';
import { Button } from './ui/button';
import { CheckCircle, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const { completeOrder } = useOrder();

  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      className={cn(
        'flex flex-col transition-all',
        order.status === 'completed' ? 'bg-muted/50 border-dashed' : 'bg-card'
      )}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    {order.status === 'completed' ? (
                        <CheckCircle className="text-accent" />
                    ) : (
                        <CircleDashed className="text-primary animate-spin" />
                    )}
                    #{order.token}
                </CardTitle>
                <CardDescription>
                    For: {order.customerName} ({order.customerPhone}) at {time}
                </CardDescription>
            </div>
             <div className="text-lg font-bold text-right text-primary">
                INR {order.total}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-32 pr-4">
            <ul className="space-y-1 text-sm">
            {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                <span>
                    {item.quantity}x {item.name}
                </span>
                </li>
            ))}
            </ul>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        {order.status === 'new' && (
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => completeOrder(order.token)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Complete
          </Button>
        )}
        {order.status === 'completed' && (
           <p className="w-full text-center text-sm text-muted-foreground">Order fulfilled.</p>
        )}
      </CardFooter>
    </Card>
  );
}

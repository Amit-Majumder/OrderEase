
'use client';

import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubPageHeader } from '@/components/SubPageHeader';
import { Separator } from '@/components/ui/separator';
import { MinusCircle, PlusCircle, Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, placeOrder, cartCount } = useOrder();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
   const [isClient, setIsClient] = useState(false);
   const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
   const router = useRouter();


  useEffect(() => {
    setIsClient(true);
  }, []);


  const handlePayment = (method: 'gpay' | 'phonepe') => {
    const orderToken = placeOrder(customerName, customerPhone);
    const vendorUpiId = 'vendor@upi';
    const vendorName = 'OrderEase Store';
    const amount = cartTotal;
    const note = `Order #${orderToken}`;

    const baseUpiUrl = `pa=${vendorUpiId}&pn=${encodeURIComponent(vendorName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    let upiUrl;
    if (method === 'gpay') {
      upiUrl = `gpay://upi/pay?${baseUpiUrl}`;
    } else {
      upiUrl = `phonepe://pay?${baseUpiUrl}`;
    }
    
    // This will redirect the user to their UPI app
    window.location.href = upiUrl;

    // After attempting to redirect, we also push to our own success page.
    // The browser might block this, but it's a good fallback.
    // In a real app, a webhook would confirm payment and redirect.
    setTimeout(() => {
        router.push(`/order/${orderToken}`);
    }, 1000);
    
    setIsPaymentDialogOpen(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only alphabets and spaces
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setCustomerName(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and limit to 10
    if (/^\d*$/.test(value) && value.length <= 10) {
      setCustomerPhone(value);
    }
  };
  
  const isPlaceOrderDisabled = !customerName.trim() || customerPhone.length !== 10;

  if (!isClient) {
    return null;
  }

  return (
    <>
      <SubPageHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">My Cart</h1>
           <p className="text-lg text-muted-foreground mt-2">You have {cartCount} items in your cart.</p>
        </div>
        
        {cart.length > 0 ? (
          <div className="max-w-2xl mx-auto">
             <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                          data-ai-hint={item.name.toLowerCase().split(' ').slice(0,2).join(' ')}
                        />
                        <div className="flex-grow">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            INR {item.price}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
             </Card>
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Total</span>
                      <span>INR {cartTotal}</span>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Your Name</Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={handleNameChange}
                          placeholder="e.g. John D."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">Phone Number</Label>
                        <Input
                          id="customerPhone"
                          type="tel"
                          value={customerPhone}
                          onChange={handlePhoneChange}
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="w-full" disabled={isPlaceOrderDisabled}>
                        Place Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Complete Your Payment</DialogTitle>
                        <DialogDescription>
                          Select a payment method to finalize your order.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                          <span className="font-semibold text-muted-foreground">Order Total</span>
                          <span className="font-bold text-2xl text-primary">INR {cartTotal}</span>
                        </div>
                        <p className="text-center text-sm text-muted-foreground my-4">Pay with UPI</p>
                        <div className="grid grid-cols-2 gap-4">
                           <Button variant="outline" className="h-12 flex items-center justify-center gap-2" onClick={() => handlePayment('gpay')}>
                              Google Pay
                          </Button>
                          <Button variant="outline" className="h-12 flex items-center justify-center gap-2" onClick={() => handlePayment('phonepe')}>
                              PhonePe
                          </Button>
                        </div>
                      </div>
                       <DialogFooter className="sm:justify-center">
                         <p className="text-xs text-muted-foreground text-center">
                            You will be redirected to your UPI app to complete the payment.
                         </p>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
             </Card>
          </div>
        ) : (
          <div className="text-center py-16 bg-background rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4">
              <Link href="/menu">Go to Menu</Link>
            </Button>
          </div>
        )}
      </main>
    </>
  );
}

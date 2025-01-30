"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CartItems from "../components/cart-items";
import { Button } from "@/components/ui/button";
import useCart from "@/hooks/use-cart";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();
  const params = useParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <CartItems />
        </div>
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-medium">Order Summary</h2>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  ${cart.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>
                  ${cart.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = `/checkout`}
              className="w-full"
              disabled={cart.items.length === 0}
              size="lg"
            >
              Proceed to Checkout
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Taxes and shipping calculated at checkout</p>
            <p className="mt-2">We accept all major credit cards and PayPal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

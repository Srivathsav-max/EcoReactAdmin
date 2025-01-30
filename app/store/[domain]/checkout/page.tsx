"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { ShoppingBag, Lock } from "lucide-react";

import useCart from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import CartItems from "../components/cart-items";
import { Card } from "@/components/ui/card";
import { Currency } from "@/components/ui/currency";

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const cart = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onCheckout = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/${params.storeId}/checkout`, {
        items: cart.items,
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.log("[CHECKOUT_ERROR]", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <Card className="bg-white shadow-sm mb-6">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ShoppingBag className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <CartItems isPreview />
                </div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <Card className="bg-white shadow-sm">
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-medium text-gray-900">Payment Summary</h2>
                  </div>
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <Currency 
                        value={cart.items.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-500">Calculated at next step</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-500">Calculated at next step</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-base font-medium text-gray-900">Total</span>
                        <Currency 
                          value={cart.items.reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          )}
                          className="text-lg"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={onCheckout}
                    disabled={loading || cart.items.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Processing..." : "Proceed to Payment"}
                  </Button>
                  <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Lock className="h-4 w-4" />
                    <p>Secure checkout powered by Stripe</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <div className="flex flex-col space-y-2 text-sm text-gray-500">
                    <p className="flex items-center">
                      ✓ SSL Encrypted Payment
                    </p>
                    <p className="flex items-center">
                      ✓ 100% Secure Checkout
                    </p>
                    <p className="flex items-center">
                      ✓ Money Back Guarantee
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

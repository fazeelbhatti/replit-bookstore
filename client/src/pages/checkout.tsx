import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  phone: z.string().min(7, "Phone must be at least 7 characters"),
  sameAsBilling: z.boolean().default(true),
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCountry: z.string().optional(),
  billingPhone: z.string().optional(),
  paymentMethod: z.enum(["credit-card", "paypal", "apple-pay"]),
});

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      sameAsBilling: true,
      paymentMethod: "credit-card",
    },
  });
  
  const { mutate: submitOrder, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const billingAddress = data.sameAsBilling
        ? {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            phone: data.phone,
          }
        : {
            firstName: data.billingFirstName || "",
            lastName: data.billingLastName || "",
            address: data.billingAddress || "",
            city: data.billingCity || "",
            state: data.billingState || "",
            postalCode: data.billingPostalCode || "",
            country: data.billingCountry || "",
            phone: data.billingPhone || "",
          };
        
      return apiRequest("POST", "/api/checkout", {
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone,
        },
        billingAddress,
        paymentMethod: data.paymentMethod,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.orderId} has been confirmed.`,
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    submitOrder(values);
  };
  
  const watchSameAsBilling = form.watch("sameAsBilling");
  
  if (cart.items.length === 0 && !isSubmitting) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some books to your cart before proceeding to checkout.</p>
        <Link href="/">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Billing Address */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Billing Address</h2>
                  <FormField
                    control={form.control}
                    name="sameAsBilling"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Same as shipping address
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                {!watchSameAsBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="billingFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingPostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
              
              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2 border p-3 rounded-md">
                            <RadioGroupItem value="credit-card" id="credit-card" />
                            <FormLabel htmlFor="credit-card" className="flex items-center cursor-pointer">
                              <i className="fas fa-credit-card mr-2"></i>
                              Credit Card
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2 border p-3 rounded-md">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <FormLabel htmlFor="paypal" className="flex items-center cursor-pointer">
                              <i className="fab fa-paypal mr-2"></i>
                              PayPal
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2 border p-3 rounded-md">
                            <RadioGroupItem value="apple-pay" id="apple-pay" />
                            <FormLabel htmlFor="apple-pay" className="flex items-center cursor-pointer">
                              <i className="fab fa-apple-pay mr-2"></i>
                              Apple Pay
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="lg:hidden">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
              {isPending ? (
                <>
                  <div className="flex space-x-4">
                    <Skeleton className="h-16 w-12" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Skeleton className="h-16 w-12" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </>
              ) : (
                cart.items.map((item) => (
                  <div key={item.id} className="flex">
                    <div className="h-16 w-12 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(cart.total * 0.08).toFixed(2)}</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${(cart.total + cart.total * 0.08).toFixed(2)}</span>
            </div>
            
            <div className="mt-6 hidden lg:block">
              <Button 
                type="button" 
                className="w-full" 
                disabled={isPending}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isPending ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

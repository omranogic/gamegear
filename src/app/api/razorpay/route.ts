import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize the Razorpay instance with your server-side keys
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    // Parse the incoming cart total from your checkout page
    const body = await request.json();
    const { amount } = body; 

    // Define the order parameters
    const options = {
      amount: Math.round(amount * 100), // Razorpay requires amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_gg_${Date.now()}`,
    };

    // Ask Razorpay to generate a secure Order ID
    const order = await razorpay.orders.create(options);
    
    // Send the Order ID back to your frontend
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
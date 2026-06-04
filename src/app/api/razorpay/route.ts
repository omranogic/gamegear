import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    // Initialize Razorpay only when a request is made (not at build time)
    const razorpay = new Razorpay({
      key_id: "rzp_test_BFzb5flFOieaX7",
      key_secret: "e5QVMSzjI8Y5jklKoByJ4WKl",
    });

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
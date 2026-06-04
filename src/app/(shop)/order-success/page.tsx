"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Package, MessageSquare, FileText } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { fetchGraphQL } from "@/lib/cartService";
import { gql } from "@apollo/client";

const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: ID!) {
    order(id: $id, idType: DATABASE_ID) {
      databaseId
      orderNumber
      status
      total
      subtotal
      shippingTotal
      taxTotal
      customerNote
      lineItems(first: 50) {
        nodes {
          product {
            node {
              name
            }
          }
          quantity
          total
        }
      }
      billing {
        firstName
        lastName
        email
        phone
      }
    }
  }
`;

function SuccessDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId === "N/A") {
        setLoading(false);
        return;
      }

      try {
        const { data, errors } = await fetchGraphQL(GET_ORDER_DETAILS, { id: orderId });
        if (errors) {
          console.error("Error fetching order:", errors);
        } else {
          setOrderData(data?.order);
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="gg-suc-card">
      <div className="gg-suc-icon">
        <CheckCircle size={48} />
      </div>
      <h1 className="gg-suc-title">Order Confirmed</h1>
      <p className="gg-suc-subtitle">Your order has been confirmed and will be prepared for shipment.</p>
      
      <div className="gg-data-box">
        <div className="gg-data-row">
          <span className="gg-data-label"><Package size={14}/> Order Number</span>
          <span className="gg-data-value">#{orderId}</span>
        </div>
        <div className="gg-data-row">
          <span className="gg-data-label"><ShieldCheck size={14}/> Order Status</span>
          <span className="gg-data-value text-[#00ffc2]">{orderData?.status?.toUpperCase() || "PENDING"}</span>
        </div>
      </div>

      {/* Order Items */}
      {orderData?.lineItems?.nodes && orderData.lineItems.nodes.length > 0 && (
        <div className="gg-order-items mt-6">
          <h3 className="text-sm font-bold text-[#00ffc2] mb-3 flex items-center gap-2">
            <Package size={14} /> Order Items
          </h3>
          {orderData.lineItems.nodes.map((item: any, idx: number) => (
            <div key={idx} className="gg-item-row">
              <span className="text-sm">{item.product.node.name}</span>
              <span className="text-xs text-gray-400">x{item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Order Notes */}
      {orderData?.customerNote && (
        <div className="gg-order-notes mt-6 p-4 bg-rgba(0,255,194,0.03) border border-rgba(0,255,194,0.1) rounded-lg">
          <h3 className="text-sm font-bold text-[#00ffc2] mb-2 flex items-center gap-2">
            <MessageSquare size={14} /> Order Notes
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">{orderData.customerNote}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-8">
        <Link href="/dashboard" className="gg-btn-suc-primary">
          Go to My Orders
        </Link>
        <Link href="/shop" className="gg-btn-suc-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Exo+2:wght@400;500;600&display=swap');
        .gg-suc-wrapper { font-family: 'Exo 2', sans-serif; min-height: calc(100vh - 68px); background: #04060c; display: flex; align-items: center; justify-content: center; padding: 40px 24px; color: #fff; }
        .gg-suc-card { width: 100%; max-width: 600px; background: rgba(10, 14, 23, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(0, 255, 194, 0.15); border-radius: 16px; padding: 48px 40px; box-shadow: 0 0 40px rgba(0, 255, 194, 0.05); text-align: center; }
        .gg-suc-icon { color: #00ffc2; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; filter: drop-shadow(0 0 12px rgba(0, 255, 194, 0.4)); }
        .gg-suc-title { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; text-transform: uppercase; tracking-wide: 0.02em; margin-bottom: 8px; }
        .gg-suc-subtitle { color: rgba(255, 255, 255, 0.5); font-size: 14px; margin-bottom: 32px; }
        .gg-data-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; text-align: left; }
        .gg-data-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; }
        .gg-data-row:last-child { margin-bottom: 0; }
        .gg-data-label { color: rgba(255, 255, 255, 0.4); display: flex; align-items: center; gap: 8px; font-size: 12px; text-transform: uppercase; font-weight: 600; }
        .gg-data-value { font-mono: true; font-weight: 700; color: #fff; }
        .gg-order-items { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: left; }
        .gg-item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .gg-item-row:last-child { border-bottom: none; }
        .gg-order-notes { background: rgba(0,255,194,0.03); border: 1px solid rgba(0,255,194,0.1); border-radius: 8px; padding: 16px; text-align: left; }
        .gg-btn-suc-primary { display: block; width: 100%; background: #00ffc2; color: #04060c; text-align: center; padding: 14px; font-size: 14px; font-weight: 700; text-transform: uppercase; border-radius: 8px; transition: all 0.2s; text-decoration: none; }
        .gg-btn-suc-primary:hover { background: #00e6af; transform: translateY(-1px); }
        .gg-btn-suc-secondary { display: block; width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); text-align: center; padding: 14px; font-size: 14px; font-weight: 700; text-transform: uppercase; border-radius: 8px; transition: all 0.2s; text-decoration: none; }
        .gg-btn-suc-secondary:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
        .gg-data-value { font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #fff; }
        @media (max-width: 768px) {
          .gg-suc-wrapper { padding: 32px 18px; }
          .gg-suc-card { padding: 36px 28px; }
          .gg-suc-title { font-size: 28px; }
          .gg-suc-subtitle { font-size: 13px; }
          .gg-data-box { padding: 18px; }
          .gg-data-row { font-size: 13px; gap: 8px; }
          .gg-btn-suc-primary, .gg-btn-suc-secondary { padding: 13px; font-size: 13px; }
          .gg-order-items, .gg-order-notes { padding: 12px; }
        }
        @media (max-width: 480px) {
          .gg-suc-wrapper { padding: 24px 12px; }
          .gg-suc-card { padding: 28px 20px; max-width: 100%; }
          .gg-suc-title { font-size: 24px; }
          .gg-data-row { flex-direction: column; align-items: flex-start; gap: 6px; }
          .gg-data-label { font-size: 11px; }
          .gg-data-value { font-size: 14px; }
          .gg-item-row { flex-direction: column; gap: 4px; }
        }
      `}</style>
      
      <div className="gg-suc-wrapper">
        <Suspense fallback={<div className="text-sm tracking-widest text-[#00ffc2] font-mono">Loading order details...</div>}>
          <SuccessDetails />
        </Suspense>
      </div>
    </>
  );
}
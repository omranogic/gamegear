"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Terminal } from "lucide-react";
import { Suspense } from "react";

function SuccessDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";

  return (
    <div className="gg-suc-card">
      <div className="gg-suc-icon">
        <CheckCircle size={48} />
      </div>
      <h1 className="gg-suc-title">Transaction Authorized</h1>
      <p className="gg-suc-subtitle">Hardware generation payload processed successfully.</p>
      
      <div className="gg-data-box">
        <div className="gg-data-row">
          <span className="gg-data-label"><Terminal size={14}/> Secure Deployment ID</span>
          <span className="gg-data-value">#GG-{orderId}</span>
        </div>
        <div className="gg-data-row">
          <span className="gg-data-label"><ShieldCheck size={14}/> Node Integrity</span>
          <span className="gg-data-value text-[#00ffc2]">VERIFIED</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <Link href="/dashboard" className="gg-btn-suc-primary">
          Enter Control Dashboard
        </Link>
        <Link href="/shop" className="gg-btn-suc-secondary">
          Return to Armory
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
        .gg-suc-card { width: 100%; max-width: 500px; background: rgba(10, 14, 23, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(0, 255, 194, 0.15); border-radius: 16px; padding: 48px 40px; box-shadow: 0 0 40px rgba(0, 255, 194, 0.05); text-align: center; }
        .gg-suc-icon { color: #00ffc2; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; filter: drop-shadow(0 0 12px rgba(0, 255, 194, 0.4)); }
        .gg-suc-title { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; text-transform: uppercase; tracking-wide: 0.02em; margin-bottom: 8px; }
        .gg-suc-subtitle { color: rgba(255, 255, 255, 0.5); font-size: 14px; margin-bottom: 32px; }
        .gg-data-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; text-align: left; }
        .gg-data-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; }
        .gg-data-row:last-child { margin-bottom: 0; }
        .gg-data-label { color: rgba(255, 255, 255, 0.4); display: flex; align-items: center; gap: 8px; font-size: 12px; text-transform: uppercase; font-weight: 600; }
        .gg-data-value { font-mono: true; font-weight: 700; color: #fff; }
        .gg-btn-suc-primary { display: block; width: 100%; background: #00ffc2; color: #04060c; text-align: center; padding: 14px; font-size: 14px; font-weight: 700; text-transform: uppercase; border-radius: 8px; transition: all 0.2s; text-decoration: none; }
        .gg-btn-suc-primary:hover { background: #00e6af; transform: translateY(-1px); }
        .gg-btn-suc-secondary { display: block; width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); text-align: center; padding: 14px; font-size: 14px; font-weight: 700; text-transform: uppercase; border-radius: 8px; transition: all 0.2s; text-decoration: none; }
        .gg-btn-suc-secondary:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
      `}</style>
      
      <div className="gg-suc-wrapper">
        <Suspense fallback={<div className="text-sm tracking-widest text-[#00ffc2] font-mono">LOADING DATA CHANNEL...</div>}>
          <SuccessDetails />
        </Suspense>
      </div>
    </>
  );
}
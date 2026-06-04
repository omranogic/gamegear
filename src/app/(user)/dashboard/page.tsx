"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Package, Settings, LogOut, ShieldCheck, Zap } from "lucide-react";

interface OrderNode {
  databaseId: number;
  date: string;
  status: string;
  total: string;
  orderNumber: string;
  customerNote?: string;
  notes?: string;
}

export default function DashboardPage() {
  const { isAuthenticated, loading, token, user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  
  // Real-time backend states
  const [orders, setOrders] = useState<OrderNode[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Route guard: Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch user orders from WooCommerce
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchUserOrders = async () => {
      setOrdersLoading(true);
      try {
        const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "http://localhost/graphql";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            query: `
              query GetCustomerOrders {
                customer {
                  orders {
                    nodes {
                      databaseId
                      orderNumber
                      date
                      status
                      total
                      customerNote
                      notes
                    }
                  }
                }
              }
            `
          })
        });

        const { data } = await res.json();
        if (data?.customer?.orders?.nodes) {
          setOrders(data.customer.orders.nodes);
        }
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [isAuthenticated, token, activeTab]);

  // Dynamic Status Parser: Transforms database strings into design layout tokens
  const formatStatus = (rawStatus: string) => {
    switch (rawStatus.toUpperCase()) {
      case "PENDING":
        return <span className="gg-status-pill gg-status-pending">Awaiting Payment</span>;
      case "PROCESSING":
        return <span className="gg-status-pill gg-status-processing">Shipped / In Route</span>;
      case "COMPLETED":
        return <span className="gg-status-pill gg-status-completed">Delivered</span>;
      case "CANCELLED":
      case "FAILED":
        return <span className="gg-status-pill gg-status-failed">Aborted</span>;
      default:
        return <span className="gg-status-pill gg-status-processing">{rawStatus}</span>;
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#04060c] text-[#00ffc2] font-mono text-sm uppercase tracking-widest">
        Authenticating...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Exo+2:wght@400;500;600&display=swap');
        .gg-dash-wrapper { font-family: 'Exo 2', sans-serif; background: #04060c; color: #fff; min-height: calc(100vh - 68px); padding: 40px 24px; }
        .gg-dash-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 260px 1fr; gap: 40px; }
        .gg-dash-sidebar { background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px 16px; height: max-content; }
        .gg-user-card { text-align: center; padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .gg-user-avatar { width: 64px; height: 64px; background: linear-gradient(135deg, rgba(0,255,194,0.1), rgba(0,184,255,0.1)); border: 1px solid rgba(0,255,194,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: #00ffc2; }
        .gg-user-name { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 20px; letter-spacing: 0.05em; text-transform: uppercase; }
        .gg-user-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(0,255,194,0.1); color: #00ffc2; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 100px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
        .gg-nav-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: transparent; border: 1px solid transparent; border-radius: 8px; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: left; margin-bottom: 8px; }
        .gg-nav-btn:hover { color: #fff; background: rgba(255,255,255,0.03); }
        .gg-nav-btn.active { background: rgba(0,255,194,0.05); border-color: rgba(0,255,194,0.2); color: #00ffc2; }
        .gg-nav-btn.logout { margin-top: 24px; color: #ff3b6b; }
        .gg-nav-btn.logout:hover { background: rgba(255,59,107,0.1); }
        .gg-dash-content { background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 40px; }
        .gg-content-header { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px; }
        .gg-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .gg-stat-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; }
        .gg-stat-label { font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: 600; }
        .gg-stat-value { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; color: #00ffc2; }
        .gg-order-table { width: 100%; border-collapse: collapse; }
        .gg-order-table th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.1); }
        .gg-order-table td { padding: 16px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .gg-status-pill { padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid; }
        .gg-status-pending { background: rgba(255,170,0,0.1); color: #ffaa00; border-color: rgba(255,170,0,0.2); }
        .gg-status-processing { background: rgba(0,184,255,0.1); color: #00b8ff; border-color: rgba(0,184,255,0.2); }
        .gg-status-completed { background: rgba(0,255,194,0.1); color: #00ffc2; border-color: rgba(0,255,194,0.2); }
        .gg-status-failed { background: rgba(255,59,107,0.1); color: #ff3b6b; border-color: rgba(255,59,107,0.2); }
        @media (max-width: 900px) { .gg-dash-container { grid-template-columns: 1fr; gap: 24px; } .gg-stats-grid { grid-template-columns: 1fr; } .gg-dash-content { padding: 24px; } }
      `}</style>

      <div className="gg-dash-wrapper">
        <div className="gg-dash-container">
          <aside className="gg-dash-sidebar">
            <div className="gg-user-card">
              <div className="gg-user-avatar"><ShieldCheck size={28} /></div>
              <h2 className="gg-user-name">{user?.username || "User"}</h2>
              <div className="gg-user-badge"><Zap size={10}/> Verified Account</div>
            </div>
            <nav>
              <button className={`gg-nav-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}><LayoutDashboard size={16} /> Dashboard</button>
              <button className={`gg-nav-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}><Package size={16} /> Order History</button>
              <button className={`gg-nav-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}><Settings size={16} /> Profile Settings</button>
              <button className="gg-nav-btn logout" onClick={logout}><LogOut size={16} /> Sign Out</button>
            </nav>
          </aside>

          <main className="gg-dash-content">
            {activeTab === "overview" && (
              <div>
                <h1 className="gg-content-header">Dashboard</h1>
                <div className="gg-stats-grid">
                  <div className="gg-stat-card">
                    <div className="gg-stat-label">Total Orders</div>
                    <div className="gg-stat-value">{orders.length}</div>
                  </div>
                  <div className="gg-stat-card">
                    <div className="gg-stat-label">Active Orders</div>
                    <div className="gg-stat-value" style={{color: '#00b8ff'}}>
                      {orders.filter(o => o.status.toUpperCase() === "PROCESSING").length}
                    </div>
                  </div>
                  <div className="gg-stat-card">
                    <div className="gg-stat-label">Account Status</div>
                    <div className="gg-stat-value" style={{fontSize: "20px"}}>ONLINE</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 leading-relaxed border border-white/5 bg-white/5 p-6 rounded-xl">
                  Welcome to your GameGear account. View your order history, track shipments, and manage your preferences in one place.
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h1 className="gg-content-header">Order History</h1>
                {ordersLoading ? (
                  <div className="text-sm font-mono text-[#00ffc2] tracking-widest py-8">Loading orders...</div>
                ) : (
                  <div className="space-y-2">
                    {orders.length === 0 ? (
                      <div className="text-center text-gray-500 italic py-8">You have no orders yet.</div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.databaseId} className="border border-white/5 rounded-lg overflow-hidden">
                          {/* Order Row */}
                          <div
                            className="gg-order-row"
                            onClick={() => setExpandedOrderId(expandedOrderId === order.databaseId ? null : order.databaseId)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '16px',
                              background: 'rgba(255,255,255,0.01)',
                              cursor: 'pointer',
                              borderBottom: expandedOrderId === order.databaseId ? '1px solid rgba(0,255,194,0.2)' : '1px solid rgba(255,255,255,0.05)'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div className="font-mono font-bold text-gray-300">#{order.orderNumber || order.databaseId}</div>
                              <div className="text-sm text-gray-400 mt-1">{new Date(order.date).toLocaleDateString()}</div>
                            </div>
                            <div>{formatStatus(order.status)}</div>
                            <div className="text-[#00ffc2] font-semibold ml-8">{order.total}</div>
                            <div className="text-gray-400 ml-4">{expandedOrderId === order.databaseId ? '▼' : '▶'}</div>
                          </div>

                          {/* Expanded Details */}
                          {expandedOrderId === order.databaseId && (
                            <div style={{
                              padding: '20px',
                              background: 'rgba(0,255,194,0.02)',
                              borderTop: '1px solid rgba(0,255,194,0.1)'
                            }}>
                              {/* Customer Notes */}
                              {order.customerNote && (
                                <div style={{ marginBottom: '16px' }}>
                                  <h4 className="text-sm font-bold text-white mb-2">Your Order Notes:</h4>
                                  <div style={{
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    color: 'rgba(255,255,255,0.7)',
                                    lineHeight: '1.5'
                                  }}>
                                    {order.customerNote}
                                  </div>
                                </div>
                              )}

                              {/* Admin Notes */}
                              {order.notes && (
                                <div>
                                  <h4 className="text-sm font-bold text-[#00ffc2] mb-2">📦 Shipping Updates:</h4>
                                  <div style={{
                                    padding: '12px',
                                    background: 'rgba(0,255,194,0.05)',
                                    border: '1px solid rgba(0,255,194,0.2)',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    color: '#00ffc2',
                                    lineHeight: '1.5'
                                  }}>
                                    {order.notes}
                                  </div>
                                </div>
                              )}

                              {!order.notes && !order.customerNote && (
                                <div className="text-sm text-gray-500 italic">No notes for this order yet.</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h1 className="gg-content-header">Account Settings</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/40 border border-white/10 p-4 rounded-lg">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Identifier</label>
                    <div className="font-semibold">{user?.username}</div>
                  </div>
                  <div className="bg-black/40 border border-white/10 p-4 rounded-lg">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Comms Core</label>
                    <div className="font-semibold text-gray-300">{user?.email}</div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
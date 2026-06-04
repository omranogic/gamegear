"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, ArrowRight, Gamepad2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      // Define the target GraphQL endpoint
      const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "http://localhost/graphql";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation LoginUser($username: String!, $password: String!) {
              login(input: { username: $username, password: $password }) {
                authToken
                user {
                  name
                  email
                }
              }
            }
          `,
          variables: {
            username: formData.email,
            password: formData.password,
          },
        }),
      });

      const { data, errors } = await res.json();

      if (errors || !data?.login?.authToken) {
        throw new Error(errors?.[0]?.message || "Invalid credentials. Please try again.");
      }

      // Execute global login context push
      const { authToken, user } = data.login;
      login(authToken, { username: user.name, email: user.email });

    } catch (err: any) {
      setError(err.message || "Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Exo+2:wght@400;500;600&display=swap');
        .gg-auth-wrapper { font-family: 'Exo 2', sans-serif; min-height: calc(100vh - 68px); display: flex; align-items: center; justify-content: center; padding: 40px 24px; position: relative; }
        .gg-auth-card { width: 100%; max-width: 440px; background: rgba(10, 14, 23, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 48px 40px; box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4); }
        .gg-auth-header { text-align: center; margin-bottom: 32px; }
        .gg-auth-icon { width: 48px; height: 48px; background: rgba(0, 255, 194, 0.1); color: #00ffc2; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 1px solid rgba(0, 255, 194, 0.2); }
        .gg-auth-title { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; color: #fff; margin-bottom: 8px; letter-spacing: 0.02em; }
        .gg-auth-subtitle { color: rgba(255, 255, 255, 0.5); font-size: 14px; }
        .gg-form-group { margin-bottom: 20px; }
        .gg-form-label { display: block; font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.7); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .gg-input-box { position: relative; }
        .gg-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: rgba(255, 255, 255, 0.4); transition: color 0.2s; }
        .gg-input-field { width: 100%; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; padding: 14px 16px 14px 48px; color: #fff; font-size: 15px; transition: all 0.2s ease; }
        .gg-input-field:focus { outline: none; border-color: #00ffc2; box-shadow: 0 0 0 4px rgba(0, 255, 194, 0.1); }
        .gg-input-field:focus + .gg-input-icon { color: #00ffc2; }
        .gg-form-options { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; font-size: 13px; }
        .gg-checkbox-label { display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.7); cursor: pointer; }
        .gg-checkbox { appearance: none; width: 16px; height: 16px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; background: rgba(0, 0, 0, 0.3); cursor: pointer; position: relative; }
        .gg-checkbox:checked { background: #00ffc2; border-color: #00ffc2; }
        .gg-checkbox:checked::after { content: '✔'; position: absolute; color: #000; font-size: 10px; font-weight: 900; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .gg-forgot-link { color: #00ffc2; text-decoration: none; transition: opacity 0.2s; }
        .gg-forgot-link:hover { opacity: 0.8; text-decoration: underline; }
        .gg-btn-primary { width: 100%; background: #00ffc2; color: #04060c; border: none; border-radius: 8px; padding: 14px; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .gg-btn-primary:hover { background: #00e6af; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 255, 194, 0.2); }
        .gg-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .gg-auth-footer { text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-top: 24px; }
        .gg-auth-footer a { color: #fff; font-weight: 600; text-decoration: none; margin-left: 4px; border-bottom: 1px solid #00ffc2; padding-bottom: 2px; transition: color 0.2s; }
        .gg-auth-footer a:hover { color: #00ffc2; }
        .gg-error-alert { background: rgba(255, 59, 107, 0.1); border: 1px solid rgba(255, 59, 107, 0.2); color: #ff3b6b; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 24px; text-align: center; }
      `}</style>

      <div className="gg-auth-wrapper">
        <div className="gg-auth-card">
          <div className="gg-auth-header">
            <div className="gg-auth-icon">
              <Gamepad2 size={24} />
            </div>
            <h1 className="gg-auth-title">Welcome Back</h1>
            <p className="gg-auth-subtitle">Sign in to your GameGear account</p>
          </div>

          {error && <div className="gg-error-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="gg-form-group">
              <label className="gg-form-label">Email Address</label>
              <div className="gg-input-box">
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="gg-input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  suppressHydrationWarning
                  required
                />
                <Mail size={18} className="gg-input-icon" />
              </div>
            </div>

            <div className="gg-form-group">
              <label className="gg-form-label">Password</label>
              <div className="gg-input-box">
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="gg-input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  suppressHydrationWarning
                  required
                />
                <Lock size={18} className="gg-input-icon" />
              </div>
            </div>

            <div className="gg-form-options">
              <label className="gg-checkbox-label">
                <input type="checkbox" className="gg-checkbox" />
                Remember me
              </label>
              <Link href="/forgot-password" className="gg-forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} suppressHydrationWarning className="gg-btn-primary">
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="gg-auth-footer">
            Don't have an account? 
            <Link href="/register">Sign up here</Link>
          </div>
        </div>
      </div>
    </>
  );
}
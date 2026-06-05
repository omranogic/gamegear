import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { MapPin, Mail, Phone, Send, MessageSquare } from "lucide-react";

// GraphQL query to fetch dynamic ACF content for the Contact Page
const GET_CONTACT_DATA = gql`
  query GetContactACFData {
     page(id: "/contact-us", idType: URI) {
      contactPageSettings {
        contactEmail
        contactPhone
        contactAddress
        googleMapUrl
      }
    }
  }
`;

export default async function ContactPage() {
  let acf = null;

  try {
    const client = getClient();
    const { data } = await client.query({ query: GET_CONTACT_DATA });
    acf = data?.page?.contactPageSettings;
  } catch (err) {
    console.error("❌ GraphQL Error on contact page:", err);
  }

  // Enterprise Fallbacks (Standard E-commerce Format)
  const email = acf?.contactEmail || "support@gamegear.com";
  const phone = acf?.contactPhone || "+91 98765 43210";
  const address = acf?.contactAddress || "GameGear Headquarters\nAhmedabad, Gujarat 380015\nIndia";
  const mapUrl = acf?.googleMapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.583202111554!2d72.5694209!3d23.0388918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Exo+2:wght@300;400;600;800&display=swap');

        .gg-contact-page {
          font-family: 'Exo 2', sans-serif;
          background: #04060c;
          color: #fff;
          min-height: 100vh;
          padding-bottom: 120px;
        }

        /* ─── HEADER BANNER ───────────────────────── */
        .gg-contact-header {
          position: relative;
          background: linear-gradient(135deg, #050d18 0%, #040911 100%);
          border-bottom: 1px solid rgba(0, 255, 194, 0.1);
          padding: 80px 24px;
          text-align: center;
          overflow: hidden;
        }

        .gg-contact-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,194,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,194,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
        }

        .gg-contact-title {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: clamp(36px, 5vw, 54px);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          background: linear-gradient(90deg, #fff 30%, #00b8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ─── MAIN LAYOUT ─────────────────────────── */
        .gg-contact-container {
          max-width: 1400px;
          margin: 60px auto 0;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
          align-items: start;
        }

        /* ─── LEFT: INFO & MAP ────────────────────── */
        .gg-info-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 40px;
        }

        .gg-info-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 20px;
          transition: all 0.3s ease;
        }

        .gg-info-card:hover {
          border-color: rgba(0, 255, 194, 0.3);
          background: rgba(0, 255, 194, 0.02);
          transform: translateX(4px);
        }

        .gg-info-icon-box {
          width: 48px;
          height: 48px;
          background: rgba(0,255,194,0.05);
          border: 1px solid rgba(0,255,194,0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00ffc2;
          flex-shrink: 0;
        }

        .gg-info-label {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 4px;
        }

        .gg-info-value {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-line;
        }

        .gg-map-wrapper {
          width: 100%;
          height: 300px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          background: #0a0e1a;
          position: relative;
        }

        .gg-map-wrapper iframe {
          width: 100%;
          height: 100%;
          border: none;
          filter: invert(90%) hue-rotate(180deg) brightness(80%) contrast(120%);
        }

        /* ─── RIGHT: FORM ─────────────────────────── */
        .gg-form-card {
          background: rgba(10, 14, 26, 0.6);
          border: 1px solid rgba(0, 255, 194, 0.15);
          border-radius: 20px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          position: relative;
          overflow: hidden;
        }

        .gg-form-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #00ffc2, #00b8ff);
        }

        .gg-form-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 24px;
        }

        .gg-input-group {
          margin-bottom: 24px;
        }

        .gg-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(0, 255, 194, 0.7);
          margin-bottom: 8px;
        }

        .gg-input {
          width: 100%;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 16px;
          color: #fff;
          font-family: 'Exo 2', sans-serif;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .gg-input:focus {
          outline: none;
          border-color: #00ffc2;
          background: rgba(0,255,194,0.02);
          box-shadow: 0 0 15px rgba(0,255,194,0.1);
        }

        textarea.gg-input {
          resize: vertical;
          min-height: 120px;
        }

        .gg-submit-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, #00ffc2, #00b8ff);
          color: #04060c;
          padding: 18px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .gg-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 194, 0.3);
        }

        @media (max-width: 968px) {
          .gg-contact-container { grid-template-columns: 1fr; gap: 40px; }
          .gg-form-card { padding: 32px; }
        }
      `}</style>

      <div className="gg-contact-page">
        
        {/* TOP BANNER */}
        <header className="gg-contact-header">
          <div className="gg-contact-grid-bg" />
          <h1 className="gg-contact-title">Contact Us</h1>
          <p className="text-xs text-[#00b8ff] max-w-xs mx-auto uppercase tracking-widest mt-2 border border-[#00b8ff]/20 bg-[#00b8ff]/5 px-4 py-1.5 inline-block rounded-full relative z-10">
            24/7 Customer Support
          </p>
        </header>

        <div className="gg-contact-container">
          
          {/* LEFT: INFO & MAP */}
          <div>
            <div className="gg-info-grid">
              
              <div className="gg-info-card">
                <div className="gg-info-icon-box"><Mail size={20} /></div>
                <div>
                  <div className="gg-info-label">Email Support</div>
                  <div className="gg-info-value">{email}</div>
                </div>
              </div>

              <div className="gg-info-card">
                <div className="gg-info-icon-box"><Phone size={20} /></div>
                <div>
                  <div className="gg-info-label">Phone Support</div>
                  <div className="gg-info-value">{phone}</div>
                </div>
              </div>

              <div className="gg-info-card">
                <div className="gg-info-icon-box"><MapPin size={20} /></div>
                <div>
                  <div className="gg-info-label">Store Location</div>
                  <div className="gg-info-value">{address}</div>
                </div>
              </div>

            </div>

            
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div>
            <div className="gg-form-card">
              <div className="gg-form-header">
                <MessageSquare className="text-[#00ffc2]" size={24} />
                <h2 className="font-['Rajdhani'] font-bold text-2xl uppercase tracking-wide m-0">
                  Send a Message
                </h2>
              </div>

              <form action="#" method="POST">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="gg-input-group">
                    <label className="gg-label">Full Name</label>
                    <input type="text" className="gg-input" required placeholder="John Doe" suppressHydrationWarning />
                  </div>
                  <div className="gg-input-group">
                    <label className="gg-label">Email Address</label>
                    <input type="email" className="gg-input" required placeholder="name@domain.com" suppressHydrationWarning />
                  </div>
                </div>

                <div className="gg-input-group">
                  <label className="gg-label">Subject</label>
                  <input type="text" className="gg-input" required placeholder="Order Inquiry / Product Support" suppressHydrationWarning />
                </div>

                <div className="gg-input-group">
                  <label className="gg-label">Message</label>
                  <textarea className="gg-input" required placeholder="How can we help you today?" suppressHydrationWarning></textarea>
                </div>

                <button type="button" className="gg-submit-btn" suppressHydrationWarning>
                  Send Message <Send size={18} />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
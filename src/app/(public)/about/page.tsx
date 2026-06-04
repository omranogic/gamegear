import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { Target, Rocket, Shield, Cpu, Terminal } from "lucide-react";

// GraphQL query to fetch dynamic ACF content for the About Page layout
const GET_ABOUT_DATA = gql`
  query GetAboutACFData {
    page(id: "about-us", idType: URI) {
      aboutPageSettings {
        ourStory {
          storyTitle
          storyDescription
        }
        missionVision {
          missionTitle
          missionDescription
          visionTitle
          visionDescription
        }
        teamMembers {
          member1 {
            name
            role
            bio
            avatar
          }
          member2 {
            name
            role
            bio
            avatar
          }
          member3 {
            name
            role
            bio
            avatar
          }
        }
      }
    }
  }
`;

export default async function AboutPage() {
  const client = getClient();
  const { data } = await client.query({ query: GET_ABOUT_DATA });
  
  const acf = data?.page?.aboutPageSettings;
  const story = acf?.ourStory;
  const mv = acf?.missionVision;
  const teamData = acf?.teamMembers;

  // Process the dynamic member fields from WordPress into a rendering array
  const teamArray = teamData ? [
    teamData.member1,
    teamData.member2,
    teamData.member3
  ].filter(member => member && member.name) : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Exo+2:wght@300;400;600;800&display=swap');

        .gg-about-page {
          font-family: 'Exo 2', sans-serif;
          background: #04060c;
          color: #fff;
          min-height: 100vh;
          padding-bottom: 120px;
        }

        /* ─── HEADER BANNER ───────────────────────── */
        .gg-about-header {
          position: relative;
          background: linear-gradient(135deg, #050d18 0%, #040911 100%);
          border-bottom: 1px solid rgba(0, 255, 194, 0.1);
          padding: 80px 24px;
          text-align: center;
          overflow: hidden;
        }

        .gg-about-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,194,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,194,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
        }

        .gg-about-title {
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

        /* ─── SECTION 1: OUR STORY ────────────────── */
        .gg-about-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 40px;
        }

        .gg-story-block {
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 20px;
          padding: 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .gg-about-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #00ffc2;
          margin-bottom: 12px;
          display: block;
        }

        .gg-about-h2 {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 32px;
          text-transform: uppercase;
          margin-bottom: 20px;
          letter-spacing: 0.02em;
        }

        .gg-about-p {
          font-size: 15px;
          line-height: 1.75;
          color: rgba(255,255,255,0.5);
          font-weight: 300;
          margin-bottom: 20px;
        }

        /* ─── SECTION 2: MISSION & VISION ─────────── */
        .gg-mission-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 40px;
        }

        .gg-mission-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .gg-mission-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #00ffc2;
        }

        .gg-mission-card.vision::before {
          background: #00b8ff;
        }

        .gg-about-icon-box {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: #00ffc2;
        }

        .gg-mission-card.vision .gg-about-icon-box {
          color: #00b8ff;
        }

        /* ─── SECTION 3: TEAM MEMBERS ────────────── */
        .gg-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 40px;
        }

        .gg-team-card {
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .gg-team-card:hover {
          border-color: rgba(0, 255, 194, 0.2);
          transform: translateY(-4px);
          background: rgba(0, 255, 194, 0.01);
        }

        .gg-team-avatar-box {
          width: 72px;
          height: 72px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .gg-team-card:hover .gg-team-avatar-box {
          border-color: #00ffc2;
          background: rgba(0,255,194,0.05);
        }

        .gg-team-name {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: 0.02em;
          margin-bottom: 4px;
        }

        .gg-team-role {
          font-size: 12px;
          font-weight: 600;
          color: #00b8ff;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }

        @media (max-width: 968px) {
          .gg-story-block { grid-template-columns: 1fr; gap: 32px; padding: 32px; }
          .gg-mission-grid { grid-template-columns: 1fr; }
          .gg-team-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="gg-about-page">
        
        {/* TOP BANNER */}
        <header className="gg-about-header">
          <div className="gg-about-grid-bg" />
          <h1 className="gg-about-title">Command Protocol</h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto uppercase tracking-widest">
            System Origin & Mission Parameters
          </p>
        </header>

        {/* SECTION 1: OUR STORY */}
        {story && (
          <section className="gg-about-section">
            <div className="gg-story-block">
              <div>
                <span className="gg-about-label">Establishment Log</span>
                <h2 className="gg-about-h2">{story.storyTitle}</h2>
                <p 
                  className="gg-about-p"
                  dangerouslySetInnerHTML={{ __html: story.storyDescription }}
                />
              </div>
              
              <div className="border border-white/5 bg-black/40 p-8 rounded-xl flex flex-col gap-4">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <Terminal size={18} className="text-[#00ffc2]" />
                  <span className="font-mono text-xs text-gray-400">System Core Initialized // 2026</span>
                </div>
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <Cpu size={18} className="text-[#00b8ff]" />
                  <span className="font-mono text-xs text-gray-400">1ms Component Synchronicity Secured</span>
                </div>
                <div className="flex items-center gap-4">
                  <Shield size={18} className="text-[#00ffc2]" />
                  <span className="font-mono text-xs text-gray-400">Zero-Loss Latency Standard Maintained</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: MISSION & VISION */}
        {mv && (
          <section className="gg-about-section !pt-0">
            <div className="gg-mission-grid">
              
              <div className="gg-mission-card">
                <div className="gg-about-icon-box">
                  <Target size={20} />
                </div>
                <h3 className="font-['Rajdhani'] font-bold text-xl uppercase tracking-wide mb-3">
                  {mv.missionTitle}
                </h3>
                <p className="gg-about-p !mb-0 text-gray-400">
                  {mv.missionDescription}
                </p>
              </div>

              <div className="gg-mission-card vision">
                <div className="gg-about-icon-box">
                  <Rocket size={20} />
                </div>
                <h3 className="font-['Rajdhani'] font-bold text-xl uppercase tracking-wide mb-3">
                  {mv.visionTitle}
                </h3>
                <p className="gg-about-p !mb-0 text-gray-400">
                  {mv.visionDescription}
                </p>
              </div>

            </div>
          </section>
        )}

        {/* SECTION 3: TEAM MEMBERS */}
        {teamArray.length > 0 && (
          <section className="gg-about-section !pt-4">
            <div className="text-center mb-10">
              <span className="gg-about-label">Personnel Matrix</span>
              <h2 className="gg-about-h2 !mb-0">The Dev Team</h2>
            </div>

            <div className="gg-team-grid">
              {teamArray.map((member: any, i: number) => (
                <div key={i} className="gg-team-card">
                  <div className="gg-team-avatar-box">
                    {member.avatar || "👤"}
                  </div>
                  <h3 className="gg-team-name">{member.name}</h3>
                  <div className="gg-team-role">{member.role}</div>
                  <p className="text-sm text-gray-400 font-light leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </>
  );
}
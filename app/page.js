import Link from 'next/link';
import { Award, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="page-wrapper" style={{ background: '#080b11', color: '#f1f5f9' }}>
      {/* Top Navigation */}
      <header style={{
        background: '#05080e',
        borderBottom: '1px solid #162334',
        padding: '16px 0',
        color: '#ffffff'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg height="32" viewBox="0 0 16 16" version="1.1" width="32" fill="#00ff66" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <div>
              <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-0.3px', color: '#00ff66' }}>
                Certify
              </span>
              <span style={{
                marginLeft: '8px',
                fontSize: '11px',
                background: '#070c14',
                color: '#38bdf8',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '600',
                border: '1px solid #162334'
              }}>
                Portal
              </span>
            </div>
          </div>

          {/* Centered Middle Navbar Text */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '1px',
              color: '#f1f5f9',
              textTransform: 'uppercase'
            }}>
              INNOVATORS AND VISIONARIES CLUB
            </span>
          </div>

          <div style={{ width: '130px' }} />
        </div>
      </header>

      {/* Hero Section */}
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', padding: '40px 0 60px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          {/* Organization & Club Logos */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '28px',
                padding: '14px 34px',
                background: 'rgba(13, 21, 32, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid #1e314b',
                borderRadius: '60px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
              }}
            >
              <img
                src="/logos/inunity-logo.png"
                alt="Inunity - Innovation for Community"
                style={{
                  height: '48px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  mixBlendMode: 'screen'
                }}
              />
              <div style={{ width: '1.5px', height: '42px', background: '#1e314b' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src="/logos/ivc-logo.jpg"
                  alt="Innovators & Visionaries Club (IVC)"
                  style={{
                    height: '60px',
                    width: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    display: 'block'
                  }}
                />
                <span style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#f1f5f9',
                  letterSpacing: '0.8px'
                }}>
                  IVC
                </span>
              </div>
            </div>
          </div>

          <div style={{
            background: '#0d1520',
            borderRadius: '16px',
            border: '1px solid #1e314b',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
            padding: '48px 40px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(0, 255, 102, 0.12)',
              color: '#00ff66',
              borderRadius: '20px',
              border: '1px solid rgba(0, 255, 102, 0.3)',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              <Award size={16} />
              Official Verification & Certificate System
            </div>

            <h1 style={{
              fontSize: '44px',
              fontWeight: '800',
              letterSpacing: '-1px',
              color: '#f1f5f9',
              marginBottom: '12px'
            }}>
              Certify
            </h1>
            
            <h2 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#38bdf8',
              marginBottom: '24px'
            }}>
              Workshop Certificate Generation Portal
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#8b9cb3',
              maxWidth: '640px',
              margin: '0 auto 36px',
              lineHeight: '1.6'
            }}>
              Welcome to Certify. Participants can enter their designated session access code to instantly generate, preview, and download their official certificate of completion.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '16px'
            }}>
              <Link
                href="/portal"
                className="btn btn-primary btn-lg"
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  borderRadius: '10px'
                }}
              >
                Access Participant Portal
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#05080e',
        borderTop: '1px solid #162334',
        padding: '24px 0',
        textAlign: 'center',
        fontSize: '13px',
        color: '#57687d'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            Certify – Workshop Certificate Generation Portal &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}

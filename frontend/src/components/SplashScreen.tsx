import clinicoLogo from '../assets/Clinico-removebg-preview.png';

const SplashScreen = () => {
  return (
    <div
      className="clinico-splash-screen"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #ffffff 0%, #edf4ff 100%)',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <svg
        viewBox="0 0 800 600"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '1200px',
        }}
      >
        <defs>
          <radialGradient id="glowG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0" />
            <stop offset="15%" stopColor="#60A5FA" stopOpacity="1" />
            <stop offset="85%" stopColor="#60A5FA" stopOpacity="1" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
          </linearGradient>

          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#2563EB" floodOpacity="0.15" />
          </filter>
        </defs>

        <style>
          {`
            .logo-group {
              opacity: 0;
              transform-origin: 400px 240px;
              animation: clinicoFadeScale 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
            }
            .glow-circle {
              transform-origin: 400px 240px;
              animation: clinicoPulseGlow 2.5s infinite ease-out;
            }
            .ecg-line {
              stroke-dasharray: 2000;
              stroke-dashoffset: 2000;
              animation: clinicoDrawEcg 3s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards;
            }
            .ecg-shimmer {
              stroke-dasharray: 2000;
              stroke-dashoffset: 2000;
              animation: clinicoDrawEcg 3s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards, clinicoShimmer 4s linear infinite 3.6s;
            }
            @keyframes clinicoFadeScale {
              0% { opacity: 0; transform: scale(0.85) translateY(15px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .clinico-float {
              animation: clinicoFloatAnim 4s ease-in-out infinite;
            }
            @keyframes clinicoFloatAnim {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-12px); }
            }
            @keyframes clinicoPulseGlow {
              0% { transform: scale(0.8); opacity: 0; }
              50% { opacity: 0.6; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            @keyframes clinicoDrawEcg {
              0% { stroke-dashoffset: 2000; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes clinicoShimmer {
              0% { stroke-dashoffset: 2000; }
              100% { stroke-dashoffset: -2000; }
            }
          `}
        </style>

        {/* Pulsing Glow behind the logo */}
        <circle cx="400" cy="240" r="100" fill="url(#glowG)" className="glow-circle" />

        {/* Logo and Brand Text */}
        <g className="logo-group" filter="url(#shadow)">
          <image 
            href={clinicoLogo} 
            x="175" 
            y="40" 
            width="450" 
            height="450" 
            className="clinico-float"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>

        {/* Premium Enhanced ECG Signal */}
        <g>
          {/* Deep Ambient Glow Trace */}
          <path
            className="ecg-line ecg-shimmer"
            d="M 0 480 L 80 480 C 90 480, 95 470, 105 470 C 115 470, 120 480, 130 480 L 150 480 L 165 510 L 185 410 L 205 540 L 225 480 L 245 480 C 260 480, 270 460, 285 460 C 300 460, 310 480, 325 480 L 350 480 C 360 480, 365 470, 375 470 C 385 470, 390 480, 400 480 L 420 480 L 435 510 L 455 410 L 475 540 L 495 480 L 515 480 C 530 480, 540 460, 555 460 C 570 460, 580 480, 595 480 L 620 480 C 630 480, 635 470, 645 470 C 655 470, 660 480, 670 480 L 690 480 L 705 510 L 725 410 L 745 540 L 765 480 L 785 480 L 800 480"
            fill="none"
            stroke="url(#ecgGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.3, filter: 'blur(4px)' }}
          />
          {/* Bright Core Trace */}
          <path
            className="ecg-line"
            d="M 0 480 L 80 480 C 90 480, 95 470, 105 470 C 115 470, 120 480, 130 480 L 150 480 L 165 510 L 185 410 L 205 540 L 225 480 L 245 480 C 260 480, 270 460, 285 460 C 300 460, 310 480, 325 480 L 350 480 C 360 480, 365 470, 375 470 C 385 470, 390 480, 400 480 L 420 480 L 435 510 L 455 410 L 475 540 L 495 480 L 515 480 C 530 480, 540 460, 555 460 C 570 460, 580 480, 595 480 L 620 480 C 630 480, 635 470, 645 470 C 655 470, 660 480, 670 480 L 690 480 L 705 510 L 725 410 L 745 540 L 765 480 L 785 480 L 800 480"
            fill="none"
            stroke="url(#ecgGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Loading Dots removed */}
      </svg>
    </div>
  );
};

export default SplashScreen;

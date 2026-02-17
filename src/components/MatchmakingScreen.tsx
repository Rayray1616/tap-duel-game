import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function MatchmakingScreen() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'searching' | 'found' | 'navigating'>('searching');

  useEffect(() => {
    // Stage 1: Searching for opponent (2 seconds)
    const foundTimer = setTimeout(() => {
      setStatus('found');
    }, 2000);

    // Stage 2: Opponent found! (1 second)
    const navigateTimer = setTimeout(() => {
      setStatus('navigating');
      navigate('/duel');
    }, 3000);

    return () => {
      clearTimeout(foundTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 cyberpunk-grid"></div>
        <div className="absolute inset-0 cyberpunk-particles"></div>
        
        {/* Scan-line overlay */}
        <div className="absolute inset-0 scan-line-overlay"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        
        {/* Pulsing neon ring */}
        <div className="relative mb-12">
          <div className={`neon-ring ${status === 'found' ? 'found-flash' : ''}`}>
            <div className="neon-ring-inner"></div>
            <div className="neon-ring-pulse"></div>
            <div className="neon-ring-glow"></div>
          </div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-6xl ${status === 'searching' ? 'animate-spin' : 'animate-bounce'}`}>
              {status === 'searching' ? '⚡' : '⚔️'}
            </div>
          </div>
        </div>

        {/* Status text with hologram effect */}
        <div className="text-center">
          <h1 className={`status-text ${status === 'found' ? 'found-text' : 'searching-text'}`}>
            {status === 'searching' && 'Searching for opponent…'}
            {status === 'found' && 'Opponent found!'}
            {status === 'navigating' && 'Entering duel arena...'}
          </h1>
          
          {/* Subtitle */}
          <div className="mt-4 text-cyan-600 text-sm tracking-widest uppercase">
            {status === 'searching' && 'Scanning for worthy adversaries'}
            {status === 'found' && 'Prepare for battle'}
            {status === 'navigating' && 'Initiating combat protocols'}
          </div>
        </div>

        {/* Loading dots animation */}
        {status === 'searching' && (
          <div className="mt-8 flex space-x-2">
            <div className="loading-dot"></div>
            <div className="loading-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="loading-dot" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}

        {/* Cancel button */}
        <button
          onClick={() => navigate('/')}
          className="mt-12 neon-button-cancel"
        >
          CANCEL SEARCH
        </button>
      </div>

      <style>{`
        .cyberpunk-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 10s linear infinite;
        }

        .cyberpunk-particles {
          background-image: 
            radial-gradient(2px 2px at 20% 30%, rgba(0, 255, 255, 0.4), transparent),
            radial-gradient(2px 2px at 60% 70%, rgba(0, 255, 255, 0.4), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(0, 255, 255, 0.4), transparent);
          background-size: 200px 200px, 150px 150px, 100px 100px;
          animation: particles-float 30s linear infinite;
        }

        .scan-line-overlay {
          background: linear-gradient(
            0deg,
            transparent 0%,
            rgba(0, 255, 255, 0.1) 50%,
            transparent 100%
          );
          background-size: 100% 4px;
          animation: scanline-move 2s linear infinite;
        }

        .neon-ring {
          width: 200px;
          height: 200px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .neon-ring-inner {
          position: absolute;
          inset: 20px;
          border: 3px solid #00ffff;
          border-radius: 50%;
          box-shadow: 
            0 0 20px #00ffff,
            inset 0 0 20px rgba(0, 255, 255, 0.3);
          animation: ring-pulse 2s ease-in-out infinite;
        }

        .neon-ring-pulse {
          position: absolute;
          inset: 10px;
          border: 2px solid rgba(0, 255, 255, 0.5);
          border-radius: 50%;
          animation: ring-expand 2s ease-out infinite;
        }

        .neon-ring-glow {
          position: absolute;
          inset: -20px;
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%);
          filter: blur(10px);
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .neon-ring.found-flash {
          animation: found-flash 0.5s ease-out;
        }

        .neon-ring.found-flash .neon-ring-inner {
          border-color: #ff00ff;
          box-shadow: 
            0 0 40px #ff00ff,
            inset 0 0 40px rgba(255, 0, 255, 0.5);
        }

        .neon-ring.found-flash .neon-ring-pulse {
          border-color: rgba(255, 0, 255, 0.8);
        }

        .neon-ring.found-flash .neon-ring-glow {
          background: radial-gradient(circle, rgba(255, 0, 255, 0.2) 0%, transparent 70%);
        }

        .status-text {
          font-family: 'Orbitron', monospace;
          font-size: 2.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
        }

        .searching-text {
          color: #00ffff;
          text-shadow: 
            0 0 20px #00ffff,
            0 0 40px #00ffff;
          animation: hologram-flicker 3s infinite;
        }

        .found-text {
          color: #ff00ff;
          text-shadow: 
            0 0 30px #ff00ff,
            0 0 60px #ff00ff;
          animation: found-text-flash 0.5s ease-out;
        }

        .loading-dot {
          width: 12px;
          height: 12px;
          background: #00ffff;
          border-radius: 50%;
          box-shadow: 0 0 10px #00ffff;
          animation: dot-pulse 1.4s ease-in-out infinite both;
        }

        .neon-button-cancel {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.2) 100%);
          border: 2px solid rgba(255, 0, 0, 0.6);
          border-radius: 12px;
          padding: 12px 24px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 0.875rem;
          color: #ff4444;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-button-cancel:hover {
          transform: scale(1.05);
          border-color: rgba(255, 0, 0, 0.8);
          box-shadow: 
            0 0 20px rgba(255, 0, 0, 0.5),
            inset 0 0 20px rgba(255, 0, 0, 0.1);
        }

        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes particles-float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-50px, 30px); }
          50% { transform: translate(30px, 50px); }
          75% { transform: translate(20px, -30px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes scanline-move {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes ring-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes ring-expand {
          0% { 
            transform: scale(1);
            opacity: 1;
          }
          100% { 
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes glow-pulse {
          0%, 100% { 
            opacity: 0.3;
            filter: blur(10px);
          }
          50% { 
            opacity: 0.6;
            filter: blur(15px);
          }
        }

        @keyframes found-flash {
          0% { 
            transform: scale(1);
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.2);
            filter: brightness(1.5);
          }
          100% { 
            transform: scale(1);
            filter: brightness(1);
          }
        }

        @keyframes hologram-flicker {
          0%, 100% { 
            opacity: 1;
            text-shadow: 
              0 0 20px #00ffff,
              0 0 40px #00ffff;
          }
          92% { 
            opacity: 0.8;
            text-shadow: 
              0 0 10px #00ffff,
              0 0 20px #00ffff;
          }
          93% { 
            opacity: 1;
            text-shadow: 
              0 0 20px #00ffff,
              0 0 40px #00ffff;
          }
          96% { 
            opacity: 0.9;
            text-shadow: 
              0 0 15px #00ffff,
              0 0 30px #00ffff;
          }
          97% { 
            opacity: 1;
            text-shadow: 
              0 0 20px #00ffff,
              0 0 40px #00ffff;
          }
        }

        @keyframes found-text-flash {
          0% { 
            opacity: 0;
            transform: scale(0.8);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes dot-pulse {
          0%, 60%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          30% {
            transform: scale(1.3);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .neon-ring {
            width: 150px;
            height: 150px;
          }
          
          .status-text {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}

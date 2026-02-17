import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/telegram/useTelegram';
import { useReferral } from '@/hooks/useReferral';
import { useGems } from '@/hooks/useGems';

export function ReferralScreen() {
  const navigate = useNavigate();
  const { user: telegramUser } = useTelegram();
  const { 
    myCode, 
    hasUsedCode, 
    referrals, 
    loading, 
    getMyReferralCode, 
    formatStatus, 
    getStatusColor, 
    getStatusBgColor, 
    formatDate, 
    copyToClipboard, 
    shareReferralCode 
  } = useReferral(telegramUser?.id?.toString());
  const { gemsInfo } = useGems(telegramUser?.id?.toString());
  
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const handleCopyCode = async () => {
    if (!myCode) return;
    
    const success = await copyToClipboard(myCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareCode = async () => {
    if (!myCode) return;
    
    const success = await shareReferralCode(myCode);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleGetCode = async () => {
    const code = await getMyReferralCode();
    if (code) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const referralUrl = myCode ? `${window.location.origin}?ref=${myCode}` : '';

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col relative overflow-hidden"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 cyberpunk-grid"></div>
        <div className="absolute inset-0 cyberpunk-particles"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="neon-button-back"
          >
            ← BACK
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-center flex-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              REFERRALS
            </span>
          </h1>
          
          <div className="w-16"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-4 pb-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Referral Code Section */}
          <div className="neon-referral-card">
            <div className="text-center mb-6">
              <div className="text-lg font-bold text-green-400 mb-2">Your Referral Code</div>
              <div className="text-sm text-green-600 mb-4">Share with friends to earn gems!</div>
              
              {myCode ? (
                <div className="space-y-4">
                  <div className="neon-code-display">
                    <div className="text-2xl font-black text-white font-mono">
                      {myCode}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCopyCode}
                      className="flex-1 neon-copy-button"
                    >
                      {copied ? '✓ COPIED' : '📋 COPY'}
                    </button>
                    <button
                      onClick={handleShareCode}
                      className="flex-1 neon-share-button"
                    >
                      {shared ? '✓ SHARED' : '🔗 SHARE'}
                    </button>
                  </div>
                  
                  <div className="text-xs text-green-600 font-mono break-all">
                    {referralUrl}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGetCode}
                  className="neon-generate-button"
                >
                  GENERATE CODE
                </button>
              )}
            </div>
          </div>

          {/* Rewards Info */}
          <div className="neon-rewards-card">
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-blue-400 mb-2">Referral Rewards</div>
              <div className="text-sm text-blue-600 mb-4">Earn gems when friends join!</div>
            </div>

            <div className="space-y-3">
              <div className="neon-reward-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <div className="text-sm font-bold text-green-400">You (Referrer)</div>
                      <div className="text-xs text-green-600">+50 gems per friend</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-400">+50 💎</div>
                </div>
              </div>

              <div className="neon-reward-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <div className="text-sm font-bold text-blue-400">Friend (Referred)</div>
                      <div className="text-xs text-blue-600">+25 gems bonus</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-400">+25 💎</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-xs text-green-600">
                ✨ Rewards credited when friend completes first duel or reaches level 2
              </div>
            </div>
          </div>

          {/* Referral Status */}
          {hasUsedCode && (
            <div className="neon-status-card">
              <div className="text-center">
                <div className="text-sm font-bold text-blue-400 mb-2">Referral Status</div>
                <div className="text-xs text-blue-600">
                  You joined using a referral code! 🎉
                </div>
              </div>
            </div>
          )}

          {/* Referrals List */}
          <div className="neon-history-card">
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-green-400 mb-2">Your Referrals</div>
              <div className="text-sm text-green-600">Friends you've invited</div>
            </div>

            {loading ? (
              <div className="text-center text-green-400">
                Loading referrals...
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center text-green-400">
                No referrals yet. Share your code to start earning!
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral, index) => (
                  <div key={referral.referred_user_id} className={`neon-referral-item ${getStatusBgColor(referral.status)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-bold text-green-400">
                            {referral.referred_username}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(referral.status)}`}>
                            {formatStatus(referral.status)}
                          </span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          {formatDate(referral.created_at)}
                        </div>
                        {referral.status === 'rewarded' && (
                          <div className="text-xs text-green-500 mt-1">
                            ✅ Rewards awarded!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Gems */}
          {gemsInfo && (
            <div className="neon-balance-card">
              <div className="text-center">
                <div className="text-sm text-green-600 uppercase tracking-wider mb-2">Current Balance</div>
                <div className="text-2xl font-black text-green-400">
                  {gemsInfo.gems.toLocaleString()} 💎
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="neon-info-card">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400 mb-2">How It Works</div>
              <div className="space-y-2 text-sm text-green-600">
                <div>• Share your referral code with friends</div>
                <div>• Friends sign up using your code</div>
                <div>• Complete first duel or reach level 2</div>
                <div>• Both of you earn gems instantly!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-30">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <div className="text-4xl font-black text-green-400 mb-2">
              CODE GENERATED!
            </div>
            <div className="text-2xl text-green-400 mb-2">
              {myCode}
            </div>
            <div className="text-lg text-blue-400">
              Start sharing to earn gems!
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cyberpunk-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 10s linear infinite;
        }

        .cyberpunk-particles {
          background-image: 
            radial-gradient(2px 2px at 20% 30%, rgba(0, 255, 0, 0.4), transparent),
            radial-gradient(2px 2px at 60% 70%, rgba(0, 255, 0, 0.4), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(0, 255, 0, 0.4), transparent);
          background-size: 200px 200px, 150px 150px, 100px 100px;
          animation: particles-float 30s linear infinite;
        }

        .neon-button-back {
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 136, 255, 0.1) 100%);
          border: 2px solid rgba(0, 255, 0, 0.5);
          padding: 8px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ff00;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-button-back:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 0, 0.8);
          box-shadow: 
            0 0 20px rgba(0, 255, 0, 0.5),
            inset 0 0 20px rgba(0, 255, 0, 0.1);
        }

        .neon-referral-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 0, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .neon-referral-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%);
          pointer-events: none;
        }

        .neon-code-display {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(0, 255, 0, 0.5);
          border-radius: 12px;
          padding: 16px;
          font-family: 'Orbitron', monospace;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .neon-code-display::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%);
          pointer-events: none;
        }

        .neon-copy-button, .neon-share-button {
          background: linear-gradient(135deg, #00ff00 0%, #0088ff 50%, #00ff00 100%);
          border: none;
          padding: 12px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #000;
          border-radius: 8px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.9rem;
        }

        .neon-copy-button:hover, .neon-share-button:hover {
          transform: scale(1.05);
          box-shadow: 
            0 0 20px rgba(0, 255, 0, 0.5),
            inset 0 0 20px rgba(0, 255, 0, 0.1);
        }

        .neon-generate-button {
          background: linear-gradient(135deg, #00ff00 0%, #0088ff 50%, #00ff00 100%);
          border: none;
          padding: 16px 24px;
          font-family: 'Orbitron', monospace;
          font-size: 1.1rem;
          font-weight: 900;
          color: #000;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 
            0 0 30px #00ff00,
            inset 0 0 30px rgba(0, 255, 0, 0.3);
          animation: generate-pulse 2s ease-in-out infinite;
        }

        .neon-generate-button:hover {
          transform: scale(1.05);
          box-shadow: 
            0 0 40px #00ff00,
            inset 0 0 40px rgba(0, 255, 0, 0.4);
        }

        .neon-rewards-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 136, 255, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .neon-rewards-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 136, 255, 0.1) 0%, rgba(0, 136, 255, 0.05) 100%);
          pointer-events: none;
        }

        .neon-reward-item {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(0, 255, 0, 0.2);
          border-radius: 8px;
          padding: 12px;
          backdrop-filter: blur(10px);
        }

        .neon-status-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 136, 255, 0.3);
          border-radius: 16px;
          padding: 1rem;
          backdrop-filter: blur(10px);
        }

        .neon-history-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 0, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .neon-referral-item {
          border: 1px solid;
          border-radius: 8px;
          padding: 12px;
          backdrop-filter: blur(10px);
        }

        .neon-balance-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 0, 0.3);
          border-radius: 16px;
          padding: 1rem;
          backdrop-filter: blur(10px);
        }

        .neon-info-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 0, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
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

        @keyframes generate-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 30px #00ff00,
              inset 0 0 30px rgba(0, 255, 0, 0.3);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 40px #00ff00,
              inset 0 0 40px rgba(0, 255, 0, 0.4);
          }
        }

        @media (max-width: 768px) {
          .neon-referral-card,
          .neon-rewards-card,
          .neon-status-card,
          .neon-history-card,
          .neon-balance-card,
          .neon-info-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

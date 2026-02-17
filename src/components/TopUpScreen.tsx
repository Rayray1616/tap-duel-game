import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/telegram/useTelegram';
import { useTonTopUp } from '@/hooks/useTonTopUp';
import { useGems } from '@/hooks/useGems';

export function TopUpScreen() {
  const navigate = useNavigate();
  const { user: telegramUser } = useTelegram();
  const { depositStatus, loading, refreshing, getDepositAddress, refreshDepositStatus, isPending, isConfirmed, hasDeposit } = useTonTopUp(telegramUser?.id?.toString());
  const { gemsInfo, refresh: refreshGems } = useGems(telegramUser?.id?.toString());
  const [showGemsAnimation, setShowGemsAnimation] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    // Auto-refresh deposit status every 10 seconds if pending
    if (isPending) {
      const interval = setInterval(() => {
        refreshDepositStatus();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isPending, refreshDepositStatus]);

  useEffect(() => {
    // Show animation when deposit is confirmed
    if (isConfirmed && depositStatus?.gems_credited && depositStatus.gems_credited > 0) {
      setShowGemsAnimation(true);
      refreshGems();
      
      setTimeout(() => {
        setShowGemsAnimation(false);
      }, 5000);
    }
  }, [isConfirmed, depositStatus?.gems_credited, refreshGems]);

  const handleCreateAddress = async () => {
    const result = await getDepositAddress();
    if (result?.success) {
      console.log('Deposit address created:', result.deposit_address);
    }
  };

  const handleCopyAddress = async () => {
    if (depositStatus?.deposit_address) {
      try {
        await navigator.clipboard.writeText(depositStatus.deposit_address);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const handleRefresh = async () => {
    await refreshDepositStatus();
  };

  const handleBackToShop = () => {
    navigate('/shop');
  };

  const generateQRCode = (address: string): string => {
    // Simple QR code placeholder - in production, use a proper QR library
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="20" height="20" fill="black"/>
        <rect x="40" y="10" width="20" height="20" fill="black"/>
        <rect x="70" y="10" width="20" height="20" fill="black"/>
        <rect x="100" y="10" width="20" height="20" fill="black"/>
        <rect x="130" y="10" width="20" height="20" fill="black"/>
        <rect x="160" y="10" width="20" height="20" fill="black"/>
        <rect x="10" y="40" width="20" height="20" fill="black"/>
        <rect x="70" y="40" width="20" height="20" fill="black"/>
        <rect x="130" y="40" width="20" height="20" fill="black"/>
        <rect x="160" y="40" width="20" height="20" fill="black"/>
        <rect x="10" y="70" width="20" height="20" fill="black"/>
        <rect x="40" y="70" width="20" height="20" fill="black"/>
        <rect x="70" y="70" width="20" height="20" fill="black"/>
        <rect x="100" y="70" width="20" height="20" fill="black"/>
        <rect x="130" y="70" width="20" height="20" fill="black"/>
        <rect x="160" y="70" width="20" height="20" fill="black"/>
        <rect x="10" y="100" width="20" height="20" fill="black"/>
        <rect x="70" y="100" width="20" height="20" fill="black"/>
        <rect x="130" y="100" width="20" height="20" fill="black"/>
        <rect x="160" y="100" width="20" height="20" fill="black"/>
        <rect x="10" y="130" width="20" height="20" fill="black"/>
        <rect x="40" y="130" width="20" height="20" fill="black"/>
        <rect x="70" y="130" width="20" height="20" fill="black"/>
        <rect x="100" y="130" width="20" height="20" fill="black"/>
        <rect x="130" y="130" width="20" height="20" fill="black"/>
        <rect x="160" y="130" width="20" height="20" fill="black"/>
        <rect x="10" y="160" width="20" height="20" fill="black"/>
        <rect x="40" y="160" width="20" height="20" fill="black"/>
        <rect x="70" y="160" width="20" height="20" fill="black"/>
        <rect x="100" y="160" width="20" height="20" fill="black"/>
        <rect x="130" y="160" width="20" height="20" fill="black"/>
        <rect x="160" y="160" width="20" height="20" fill="black"/>
        <text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="8" fill="black">${address.slice(0, 20)}...</text>
      </svg>
    `)}`;
  };

  const formatGems = (amount: number): string => {
    return amount.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="text-cyan-400 text-2xl font-bold animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col relative overflow-hidden"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>
        <div className="absolute inset-0 cyberpunk-grid"></div>
        <div className="absolute inset-0 cyberpunk-particles"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToShop}
            className="neon-button-back"
          >
            ← BACK
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-center flex-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              TON TOP-UP
            </span>
          </h1>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="neon-button-refresh"
          >
            {refreshing ? '⟳' : '↻'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-4 pb-4">
        <div className="max-w-md mx-auto space-y-4">
          {!hasDeposit ? (
            /* No Deposit State */
            <div className="neon-topup-card">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">💎</div>
                <div className="text-xl text-cyan-400 mb-2">Buy Gems with TON</div>
                <div className="text-sm text-cyan-600">1 TON = 100 Gems</div>
              </div>

              <button
                onClick={handleCreateAddress}
                className="w-full neon-create-button"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">🏦</span>
                  <span className="font-bold">CREATE DEPOSIT ADDRESS</span>
                </div>
              </button>

              <div className="text-center mt-6">
                <div className="text-xs text-cyan-600">
                  Send TON to your deposit address
                </div>
                <div className="text-xs text-cyan-600 mt-1">
                  Gems will be credited automatically
                </div>
              </div>
            </div>
          ) : (
            /* Has Deposit State */
            <div className="neon-topup-card">
              {/* Status Badge */}
              <div className="text-center mb-6">
                <div className={`neon-status-badge ${isPending ? 'pending' : 'confirmed'}`}>
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isPending ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                    <span className="text-sm font-bold uppercase">
                      {isPending ? 'Waiting for Payment' : 'Payment Confirmed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code and Address */}
              <div className="text-center mb-6">
                <div className="text-sm text-cyan-600 uppercase tracking-wider mb-2">Deposit Address</div>
                {depositStatus?.deposit_address && (
                  <div className="mb-4">
                    <div className="inline-block p-4 bg-white rounded-lg">
                      <img 
                        src={generateQRCode(depositStatus.deposit_address)} 
                        alt="QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <div className="font-mono text-xs text-cyan-400 break-all bg-black/50 p-3 rounded border border-cyan-600/30">
                    {depositStatus?.deposit_address}
                  </div>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="neon-copy-button"
                >
                  {copiedAddress ? '✓ COPIED' : '📋 COPY ADDRESS'}
                </button>
              </div>

              {/* Deposit Info */}
              {isConfirmed && depositStatus && (
                <div className="text-center mb-6">
                  <div className="text-sm text-cyan-600 uppercase tracking-wider mb-2">Transaction Details</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-cyan-600">Amount:</span>
                      <span className="text-sm font-bold text-cyan-400">{depositStatus.amount_ton} TON</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-cyan-600">Gems Credited:</span>
                      <span className="text-sm font-bold text-green-400">+{formatGems(depositStatus.gems_credited)} 💎</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-cyan-600">TX Hash:</span>
                      <span className="text-xs font-mono text-cyan-400">{depositStatus.tx_hash?.slice(0, 10)}...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Gems Balance */}
              <div className="text-center">
                <div className="text-sm text-cyan-600 uppercase tracking-wider mb-2">Current Gems Balance</div>
                <div className="text-2xl font-black text-green-400">
                  {formatGems(gemsInfo?.gems || 0)} 💎
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="neon-info-card">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400 mb-2">How It Works</div>
              <div className="space-y-2 text-sm text-cyan-600">
                <div>1. Create a deposit address</div>
                <div>2. Send TON to the address</div>
                <div>3. Wait for confirmation (auto-detect)</div>
                <div>4. Gems credited instantly</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gems Credited Animation */}
      {showGemsAnimation && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-30">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">💎</div>
            <div className="text-4xl font-black text-green-400 mb-2">
              GEMS CREDITED!
            </div>
            <div className="text-2xl text-green-400 mb-2">
              +{formatGems(depositStatus?.gems_credited || 0)} 💎
            </div>
            <div className="text-lg text-cyan-400">
              New Balance: {formatGems(gemsInfo?.gems || 0)} 💎
            </div>
          </div>
        </div>
      )}

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

        .neon-button-back {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 136, 255, 0.1) 100%);
          border: 2px solid rgba(0, 255, 255, 0.5);
          padding: 8px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ffff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-button-back:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.5),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .neon-button-refresh {
          background: linear-gradient(135deg, rgba(255, 0, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%);
          border: 2px solid rgba(255, 0, 255, 0.5);
          width: 40px;
          height: 40px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #ff00ff;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .neon-button-refresh:hover:not(:disabled) {
          transform: scale(1.1);
          border-color: rgba(255, 0, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(255, 0, 255, 0.5),
            inset 0 0 20px rgba(255, 0, 255, 0.1);
        }

        .neon-button-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .neon-topup-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 136, 255, 0.3);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .neon-topup-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 136, 255, 0.1) 0%, rgba(128, 0, 255, 0.1) 100%);
          pointer-events: none;
        }

        .neon-create-button {
          background: linear-gradient(135deg, #0088ff 0%, #8000ff 50%, #0088ff 100%);
          border: none;
          padding: 16px 24px;
          font-family: 'Orbitron', monospace;
          font-size: 1.1rem;
          font-weight: 900;
          color: #fff;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 
            0 0 30px #0088ff,
            inset 0 0 30px rgba(0, 136, 255, 0.3);
          animation: create-pulse 2s ease-in-out infinite;
        }

        .neon-create-button:hover {
          transform: scale(1.05);
          box-shadow: 
            0 0 40px #0088ff,
            inset 0 0 40px rgba(0, 136, 255, 0.4);
        }

        .neon-copy-button {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 136, 255, 0.1) 100%);
          border: 2px solid rgba(0, 255, 255, 0.5);
          padding: 8px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ffff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-copy-button:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.5),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .neon-status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .neon-status-badge.pending {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%);
          border: 2px solid rgba(255, 215, 0, 0.5);
          color: #ffd700;
        }

        .neon-status-badge.confirmed {
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 255, 0, 0.1) 100%);
          border: 2px solid rgba(0, 255, 0, 0.5);
          color: #00ff00;
        }

        .neon-info-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 136, 255, 0.2);
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

        @keyframes create-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 30px #0088ff,
              inset 0 0 30px rgba(0, 136, 255, 0.3);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 40px #0088ff,
              inset 0 0 40px rgba(0, 136, 255, 0.4);
          }
        }

        @media (max-width: 768px) {
          .neon-topup-card {
            padding: 1.5rem;
          }
          
          .neon-info-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

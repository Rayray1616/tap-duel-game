import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/telegram/useTelegram';
import { useTonWallet } from '@/hooks/useTonWallet';

export function WalletScreen() {
  const navigate = useNavigate();
  const { user: telegramUser } = useTelegram();
  const { walletInfo, balance, loading, connecting, connectWallet, disconnectWallet, refreshBalance, maskAddress } = useTonWallet(telegramUser?.id?.toString());
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  const handleConnect = async () => {
    if (!addressInput.trim()) return;
    
    const result = await connectWallet(addressInput.trim());
    if (result?.success) {
      setConnectModalOpen(false);
      setAddressInput('');
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  const handleBack = () => {
    navigate('/');
  };

  const formatBalance = (balance: number | null): string => {
    if (balance === null) return '0.00';
    return balance.toFixed(4);
  };

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
            onClick={handleBack}
            className="neon-button-back"
          >
            ← BACK
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-center flex-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              TON WALLET
            </span>
          </h1>
          
          <button
            onClick={refreshBalance}
            className="neon-button-refresh"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-4 pb-4 flex items-center justify-center">
        {loading ? (
          <div className="text-center">
            <div className="text-cyan-400 text-xl font-bold animate-pulse">LOADING WALLET...</div>
          </div>
        ) : !walletInfo?.connected ? (
          <div className="w-full max-w-md">
            {/* Not Connected State */}
            <div className="neon-wallet-card">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">💎</div>
                <div className="text-xl text-cyan-400 mb-2">No Wallet Connected</div>
                <div className="text-sm text-cyan-600">Connect your TON wallet to manage your assets</div>
              </div>

              <button
                onClick={() => setConnectModalOpen(true)}
                className="w-full neon-connect-button"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">🔗</span>
                  <span className="font-bold">CONNECT WALLET</span>
                </div>
              </button>

              <div className="mt-6 text-center">
                <div className="text-xs text-cyan-600">
                  Supported: Any TON wallet address
                </div>
                <div className="text-xs text-cyan-600 mt-1">
                  Balance will be displayed in TON
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            {/* Connected State */}
            <div className="neon-wallet-card">
              {/* Wallet Address */}
              <div className="text-center mb-6">
                <div className="text-sm text-cyan-600 uppercase tracking-wider mb-2">Wallet Address</div>
                <div className="text-lg font-mono text-blue-400">
                  {maskAddress(walletInfo.ton_address)}
                </div>
              </div>

              {/* Balance Display */}
              <div className="text-center mb-6">
                <div className="text-sm text-cyan-600 uppercase tracking-wider mb-2">Balance</div>
                <div className="text-5xl font-black text-purple-400">
                  {formatBalance(balance)}
                </div>
                <div className="text-lg text-purple-400">TON</div>
              </div>

              {/* Status Badge */}
              <div className="text-center mb-6">
                <div className="inline-block neon-status-badge">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold">CONNECTED</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={refreshBalance}
                  className="w-full neon-secondary-button"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>🔄</span>
                    <span>REFRESH BALANCE</span>
                  </div>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full neon-disconnect-button"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>🔓</span>
                    <span>DISCONNECT WALLET</span>
                  </div>
                </button>
              </div>

              <div className="mt-6 text-center">
                <div className="text-xs text-cyan-600">
                  Last updated: {walletInfo.updated_at ? new Date(walletInfo.updated_at).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {connectModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-30">
          <div className="neon-modal">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-blue-400 mb-2">Connect TON Wallet</div>
              <div className="text-sm text-cyan-600">Enter your TON wallet address</div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="EQD..."
                className="w-full neon-input"
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setConnectModalOpen(false);
                  setAddressInput('');
                }}
                className="flex-1 neon-cancel-button"
              >
                CANCEL
              </button>
              <button
                onClick={handleConnect}
                disabled={connecting || !addressInput.trim()}
                className="flex-1 neon-confirm-button"
              >
                {connecting ? 'CONNECTING...' : 'CONNECT'}
              </button>
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

        .neon-button-refresh:hover {
          transform: scale(1.1);
          border-color: rgba(255, 0, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(255, 0, 255, 0.5),
            inset 0 0 20px rgba(255, 0, 255, 0.1);
        }

        .neon-wallet-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 136, 255, 0.3);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .neon-wallet-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 136, 255, 0.1) 0%, rgba(128, 0, 255, 0.1) 100%);
          pointer-events: none;
        }

        .neon-connect-button {
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
          animation: connect-pulse 2s ease-in-out infinite;
        }

        .neon-connect-button:hover {
          transform: scale(1.05);
          box-shadow: 
            0 0 40px #0088ff,
            inset 0 0 40px rgba(0, 136, 255, 0.4);
        }

        .neon-secondary-button {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 136, 255, 0.1) 100%);
          border: 2px solid rgba(0, 255, 255, 0.5);
          padding: 12px 20px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ffff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-secondary-button:hover {
          transform: scale(1.02);
          border-color: rgba(0, 255, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.5),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .neon-disconnect-button {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.1) 100%);
          border: 2px solid rgba(255, 0, 0, 0.5);
          padding: 12px 20px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #ff4444;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-disconnect-button:hover {
          transform: scale(1.02);
          border-color: rgba(255, 0, 0, 0.8);
          box-shadow: 
            0 0 20px rgba(255, 0, 0, 0.5),
            inset 0 0 20px rgba(255, 0, 0, 0.1);
        }

        .neon-status-badge {
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 255, 0, 0.1) 100%);
          border: 2px solid rgba(0, 255, 0, 0.5);
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .neon-modal {
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid rgba(0, 136, 255, 0.5);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          width: 90%;
          max-width: 400px;
        }

        .neon-input {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(0, 136, 255, 0.3);
          padding: 12px 16px;
          border-radius: 8px;
          color: #00ffff;
          font-family: 'Orbitron', monospace;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .neon-input:focus {
          outline: none;
          border-color: rgba(0, 136, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(0, 136, 255, 0.5),
            inset 0 0 20px rgba(0, 136, 255, 0.1);
        }

        .neon-cancel-button {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 12px 20px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #ffffff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-cancel-button:hover {
          transform: scale(1.02);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.3),
            inset 0 0 20px rgba(255, 255, 255, 0.1);
        }

        .neon-confirm-button {
          background: linear-gradient(135deg, #0088ff 0%, #8000ff 50%, #0088ff 100%);
          border: none;
          padding: 12px 20px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-confirm-button:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 
            0 0 30px #0088ff,
            inset 0 0 30px rgba(0, 136, 255, 0.3);
        }

        .neon-confirm-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        @keyframes connect-pulse {
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
          .neon-wallet-card {
            padding: 1.5rem;
          }
          
          .neon-modal {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

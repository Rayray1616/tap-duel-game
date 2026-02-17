import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/telegram/useTelegram';
import { usePayouts } from '@/hooks/usePayouts';
import { useGems } from '@/hooks/useGems';
import { useTonWallet } from '@/hooks/useTonWallet';

export function PayoutScreen() {
  const navigate = useNavigate();
  const { user: telegramUser } = useTelegram();
  const { payouts, loading, requesting, requestPayout, formatStatus, getStatusColor, getStatusBgColor, shortenTxHash, formatDate } = usePayouts(telegramUser?.id?.toString());
  const { gemsInfo } = useGems(telegramUser?.id?.toString());
  const { walletInfo } = useTonWallet(telegramUser?.id?.toString());
  
  const [amountTon, setAmountTon] = useState('');
  const [tonAddress, setTonAddress] = useState(walletInfo?.ton_address || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRequest, setLastRequest] = useState<{ amount: number; address: string } | null>(null);

  const handleRequestPayout = async () => {
    const amount = parseFloat(amountTon);
    if (!amount || amount <= 0 || !tonAddress) {
      return;
    }

    const result = await requestPayout(amount, tonAddress);
    if (result?.success) {
      setLastRequest({ amount, address: tonAddress });
      setShowSuccess(true);
      setAmountTon('');
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const maxWithdrawal = gemsInfo ? (gemsInfo.gems / 100).toFixed(2) : '0';
  const canWithdraw = gemsInfo && parseFloat(amountTon) > 0 && parseFloat(amountTon) <= parseFloat(maxWithdrawal);

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col relative overflow-hidden"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              WITHDRAW
            </span>
          </h1>
          
          <div className="w-16"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-4 pb-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Current Balance */}
          <div className="neon-balance-card">
            <div className="text-center mb-4">
              <div className="text-sm text-purple-600 uppercase tracking-wider mb-2">Available Balance</div>
              <div className="text-3xl font-black text-green-400">
                {gemsInfo?.gems?.toLocaleString() || '0'} 💎
              </div>
              <div className="text-sm text-purple-400">
                = {maxWithdrawal} TON available
              </div>
            </div>
          </div>

          {/* Payout Form */}
          <div className="neon-payout-card">
            <div className="text-center mb-6">
              <div className="text-lg font-bold text-purple-400 mb-2">Request Payout</div>
              <div className="text-sm text-purple-600">Convert gems to TON</div>
            </div>

            <div className="space-y-4">
              {/* TON Address */}
              <div>
                <label className="block text-sm text-purple-600 uppercase tracking-wider mb-2">
                  TON Address
                </label>
                <input
                  type="text"
                  value={tonAddress}
                  onChange={(e) => setTonAddress(e.target.value)}
                  placeholder="Enter your TON address"
                  className="w-full neon-input"
                />
                {walletInfo?.connected && !tonAddress && (
                  <div className="text-xs text-purple-400 mt-1">
                    Use your connected wallet address
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-purple-600 uppercase tracking-wider mb-2">
                  Amount (TON)
                </label>
                <input
                  type="number"
                  value={amountTon}
                  onChange={(e) => setAmountTon(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={maxWithdrawal}
                  className="w-full neon-input"
                />
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-purple-400">
                    Cost: {amountTon ? Math.ceil(parseFloat(amountTon) * 100).toLocaleString() : '0'} gems
                  </div>
                  <div className="text-xs text-purple-400">
                    Max: {maxWithdrawal} TON
                  </div>
                </div>
              </div>

              {/* Request Button */}
              <button
                onClick={handleRequestPayout}
                disabled={!canWithdraw || requesting}
                className={`w-full neon-payout-button ${requesting ? 'requesting' : ''}`}
              >
                {requesting ? 'PROCESSING...' : 'REQUEST PAYOUT'}
              </button>
            </div>
          </div>

          {/* Payout History */}
          <div className="neon-history-card">
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-purple-400 mb-2">Payout History</div>
              <div className="text-sm text-purple-600">Recent withdrawals</div>
            </div>

            {loading ? (
              <div className="text-center text-purple-400">
                Loading history...
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center text-purple-400">
                No payout history yet
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div key={payout.id} className={`neon-payout-item ${getStatusBgColor(payout.status)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-bold text-purple-400">
                            {payout.amount_ton} TON
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(payout.status)}`}>
                            {formatStatus(payout.status)}
                          </span>
                        </div>
                        <div className="text-xs text-purple-600 font-mono break-all">
                          {payout.ton_address.slice(0, 10)}...{payout.ton_address.slice(-8)}
                        </div>
                        <div className="text-xs text-purple-600 mt-1">
                          {formatDate(payout.created_at)}
                        </div>
                        {payout.tx_hash && (
                          <div className="text-xs text-purple-500 mt-1">
                            TX: {shortenTxHash(payout.tx_hash)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="neon-info-card">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400 mb-2">Withdrawal Info</div>
              <div className="space-y-2 text-sm text-purple-600">
                <div>• 100 gems = 1 TON</div>
                <div>• Minimum withdrawal: 0.01 TON</div>
                <div>• Processing time: 1-24 hours</div>
                <div>• Admin approval required</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && lastRequest && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-30">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">💎</div>
            <div className="text-4xl font-black text-green-400 mb-2">
              PAYOUT REQUESTED!
            </div>
            <div className="text-2xl text-green-400 mb-2">
              {lastRequest.amount} TON
            </div>
            <div className="text-lg text-purple-400">
              Processing... 1-24 hours
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

        .neon-balance-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 0, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .neon-balance-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%);
          pointer-events: none;
        }

        .neon-payout-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(128, 0, 255, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .neon-payout-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(128, 0, 255, 0.1) 0%, rgba(255, 0, 128, 0.1) 100%);
          pointer-events: none;
        }

        .neon-input {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(128, 0, 255, 0.5);
          border-radius: 8px;
          padding: 12px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #fff;
          transition: all 0.3s ease;
        }

        .neon-input:focus {
          outline: none;
          border-color: rgba(128, 0, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(128, 0, 255, 0.3),
            inset 0 0 20px rgba(128, 0, 255, 0.1);
        }

        .neon-payout-button {
          background: linear-gradient(135deg, #8000ff 0%, #ff0080 50%, #8000ff 100%);
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
            0 0 30px #8000ff,
            inset 0 0 30px rgba(128, 0, 255, 0.3);
          animation: payout-pulse 2s ease-in-out infinite;
        }

        .neon-payout-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 
            0 0 40px #8000ff,
            inset 0 0 40px rgba(128, 0, 255, 0.4);
        }

        .neon-payout-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .neon-payout-button.requesting {
          animation: payout-processing 1s ease-in-out infinite;
        }

        .neon-history-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(128, 0, 255, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .neon-payout-item {
          border: 1px solid;
          border-radius: 8px;
          padding: 12px;
          backdrop-filter: blur(10px);
        }

        .neon-info-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(128, 0, 255, 0.2);
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

        @keyframes payout-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 30px #8000ff,
              inset 0 0 30px rgba(128, 0, 255, 0.3);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 40px #8000ff,
              inset 0 0 40px rgba(128, 0, 255, 0.4);
          }
        }

        @keyframes payout-processing {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(0.95);
            opacity: 0.8;
          }
        }

        @media (max-width: 768px) {
          .neon-balance-card,
          .neon-payout-card,
          .neon-history-card,
          .neon-info-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/telegram/useTelegram';
import { useGems } from '@/hooks/useGems';
import { useTonTopUp } from '@/hooks/useTonTopUp';

interface GemBundle {
  id: string;
  amount: number;
  price: string;
  bonus?: string;
  popular?: boolean;
}

export function ShopScreen() {
  const navigate = useNavigate();
  const { user: telegramUser } = useTelegram();
  const { gemsInfo, loading, addGems } = useGems(telegramUser?.id?.toString());
  const { isPending, hasDeposit } = useTonTopUp(telegramUser?.id?.toString());
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const gemBundles: GemBundle[] = [
    {
      id: 'small',
      amount: 50,
      price: '0.5 TON',
      bonus: 'Starter Pack'
    },
    {
      id: 'medium',
      amount: 120,
      price: '1 TON',
      bonus: 'Popular Choice',
      popular: true
    },
    {
      id: 'large',
      amount: 300,
      price: '2.5 TON',
      bonus: 'Best Value'
    }
  ];

  const handlePurchase = async (bundle: GemBundle) => {
    setPurchasing(bundle.id);
    
    // For demo purposes, we'll add gems directly
    // In production, this would integrate with TON payment
    const result = await addGems(bundle.amount);
    
    if (result?.success) {
      // Show success feedback
      setTimeout(() => {
        setPurchasing(null);
      }, 1000);
    } else {
      setPurchasing(null);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const formatGems = (amount: number): string => {
    return amount.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col relative overflow-hidden"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-emerald-900/20"></div>
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              GEM SHOP
            </span>
          </h1>
          
          <div className="w-16"></div>
        </div>
      </div>

      {/* Gems Balance Display */}
      <div className="relative z-10 px-4 mb-6">
        <div className="neon-gems-balance">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">💎</span>
              <div>
                <div className="text-xs text-green-600 uppercase tracking-wider">Current Balance</div>
                <div className="text-2xl font-black text-green-400">
                  {loading ? '...' : formatGems(gemsInfo?.gems || 0)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-green-600 uppercase tracking-wider">Gems</div>
              <div className="text-sm text-green-400">Soft Currency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-4 pb-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* TON Top-Up Section */}
          <div className="neon-ton-topup">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">💎</span>
                <div>
                  <div className="text-lg font-bold text-blue-400">Buy Gems with TON</div>
                  <div className="text-sm text-blue-600">1 TON = 100 Gems</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/topup')}
                className="neon-topup-button"
              >
                {isPending ? 'PENDING' : 'TOP-UP'}
              </button>
            </div>
            
            {isPending && (
              <div className="text-center">
                <div className="text-xs text-yellow-400 animate-pulse">
                  ⏳ TON deposit pending - check status
                </div>
              </div>
            )}
          </div>

          {/* Gem Bundles */}
          {gemBundles.map((bundle) => (
            <div key={bundle.id} className="neon-gem-bundle">
              {bundle.popular && (
                <div className="absolute -top-2 -right-2">
                  <div className="neon-popular-badge">
                    POPULAR
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">💎</div>
                  <div>
                    <div className="text-2xl font-black text-green-400">
                      {formatGems(bundle.amount)}
                    </div>
                    <div className="text-sm text-green-600">Gems</div>
                    {bundle.bonus && (
                      <div className="text-xs text-emerald-400">{bundle.bonus}</div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-cyan-400 mb-2">
                    {bundle.price}
                  </div>
                  <button
                    onClick={() => handlePurchase(bundle)}
                    disabled={purchasing === bundle.id}
                    className={`neon-purchase-button ${
                      purchasing === bundle.id ? 'purchasing' : ''
                    }`}
                  >
                    {purchasing === bundle.id ? 'PROCESSING...' : 'BUY NOW'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Info Section */}
          <div className="neon-info-card">
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-green-400 mb-2">About Gems</div>
              <div className="text-sm text-green-600">
                💎 Soft currency for in-game purchases
              </div>
              <div className="text-sm text-green-600">
                🎁 Earn rewards and battle bonuses
              </div>
              <div className="text-sm text-green-600">
                🛍️ Use in shop for exclusive items
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-emerald-400 mb-2">How to Earn Gems:</div>
              <div className="space-y-1 text-xs text-green-600">
                <div>• Daily rewards (5 + streak × 2 gems)</div>
                <div>• Win duels (+3 gems)</div>
                <div>• Lose duels (+1 gem)</div>
                <div>• Purchase with TON</div>
              </div>
            </div>
          </div>

          {/* Phase 3 Placeholder */}
          <div className="neon-placeholder-card">
            <div className="text-center">
              <div className="text-sm text-yellow-400 mb-2">🚀 Coming Soon</div>
              <div className="text-xs text-yellow-600">
                Direct TON → Gems conversion
              </div>
              <div className="text-xs text-yellow-600">
                Special offers and discounts
              </div>
              <div className="text-xs text-yellow-600">
                Limited-time bundles
              </div>
            </div>
          </div>
        </div>
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

        .neon-gems-balance {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 0, 0.3);
          border-radius: 16px;
          padding: 1rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .neon-gems-balance::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%);
          pointer-events: none;
        }

        .neon-gem-bundle {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 0, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .neon-gem-bundle:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 255, 0, 0.5);
          box-shadow: 
            0 0 30px rgba(0, 255, 0, 0.3),
            inset 0 0 30px rgba(0, 255, 0, 0.1);
        }

        .neon-gem-bundle::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%);
          pointer-events: none;
        }

        .neon-popular-badge {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: popular-pulse 2s ease-in-out infinite;
        }

        .neon-purchase-button {
          background: linear-gradient(135deg, #00ff00 0%, #00cc00 50%, #00ff00 100%);
          border: none;
          padding: 8px 16px;
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
          font-size: 0.8rem;
          box-shadow: 
            0 0 20px #00ff00,
            inset 0 0 20px rgba(0, 255, 0, 0.3);
        }

        .neon-purchase-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 
            0 0 30px #00ff00,
            inset 0 0 30px rgba(0, 255, 0, 0.4);
        }

        .neon-purchase-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .neon-purchase-button.purchasing {
          animation: purchase-processing 1s ease-in-out infinite;
        }

        .neon-info-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 0, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .neon-ton-topup {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 136, 255, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .neon-ton-topup::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 136, 255, 0.1) 0%, rgba(128, 0, 255, 0.1) 100%);
          pointer-events: none;
        }

        .neon-topup-button {
          background: linear-gradient(135deg, #0088ff 0%, #8000ff 50%, #0088ff 100%);
          border: none;
          padding: 8px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.8rem;
          box-shadow: 
            0 0 20px #0088ff,
            inset 0 0 20px rgba(0, 136, 255, 0.3);
        }

        .neon-topup-button:hover {
          transform: scale(1.05);
          box-shadow: 
            0 0 30px #0088ff,
            inset 0 0 30px rgba(0, 136, 255, 0.4);
        }

        .neon-placeholder-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(255, 215, 0, 0.2);
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

        @keyframes popular-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(255, 107, 107, 0.7);
          }
        }

        @keyframes purchase-processing {
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
          .neon-gem-bundle {
            padding: 1rem;
          }
          
          .neon-info-card,
          .neon-placeholder-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

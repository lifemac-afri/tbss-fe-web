import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import RegionalFlyer from './RegionalFlyer';

const CelebrationModal = ({ isOpen, onClose, stats, productImage }) => {
  const modalRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay for firework feel
      const timer = setTimeout(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
        
        return () => clearInterval(interval);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDownload = async () => {
    const flyer = document.getElementById('purchase-flyer');
    if (!flyer) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(flyer, {
        useCORS: true,
        backgroundColor: null,
        scale: 2, // Higher quality
      });
      
      const link = document.createElement('a');
      link.download = `TBSS-Celebration-${stats?.product_title || 'Order'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Content */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-[32px] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-[#F46B03]" size={20} />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Celebration Time!</h2>
          </div>
          
          <p className="text-sm text-gray-500 mb-8 text-center max-w-[300px]">
            You've just join a select group of readers. Share your achievement with others!
          </p>

          {/* The Flyer */}
          <div className="mb-8 scale-90 sm:scale-100 origin-center">
            <RegionalFlyer stats={stats} productImage={productImage} />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50"
            >
              <Download size={18} />
              {downloading ? 'Preparing...' : 'Download PNG'}
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'TBSS Purchase Celebration',
                    text: `I'm the ${stats.rank}th person in ${stats.region} to get "${stats.product_title}"!`,
                    url: window.location.origin
                  });
                } else {
                  // Fallback to copy link
                  navigator.clipboard.writeText(window.location.origin);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center justify-center gap-2 py-4 border-2 border-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebrationModal;

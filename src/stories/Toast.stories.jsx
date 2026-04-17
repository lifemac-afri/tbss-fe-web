import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import Button from '../components/Button';

// Inline ToastItem and ToastProvider for isolated story rendering
// (avoids importing the real provider which wraps the entire app)

const icons = {
  success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
  error: <AlertCircle size={18} className="text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-500 flex-shrink-0" />,
};

const ToastItem = ({ id, type = 'info', message, onRemove }) => (
  <div className="flex items-start gap-3 w-80 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-card-hover">
    {icons[type]}
    <p className="text-sm text-gray-700 flex-1">{message}</p>
    <button onClick={() => onRemove?.(id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 -mt-0.5">
      <X size={16} />
    </button>
  </div>
);

const ToastCtx = createContext(null);

const StoryToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback(({ message, type = 'info', duration = 3000 }) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);
  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const toast = {
    success: (m) => add({ message: m, type: 'success' }),
    error: (m) => add({ message: m, type: 'error' }),
    warning: (m) => add({ message: m, type: 'warning' }),
    info: (m) => add({ message: m, type: 'info' }),
  };
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => <ToastItem key={t.id} {...t} onRemove={remove} />)}
      </div>
    </ToastCtx.Provider>
  );
};

const useStoryToast = () => useContext(ToastCtx);

export default {
  title: 'Overlays / Toast',
  parameters: { layout: 'centered' },
};

// Static previews of each variant
export const SuccessToast = {
  render: () => <ToastItem id="1" type="success" message="Book added to your cart successfully!" />,
};

export const ErrorToast = {
  render: () => <ToastItem id="2" type="error" message="Payment failed. Please try a different card." />,
};

export const WarningToast = {
  render: () => <ToastItem id="3" type="warning" message="Only 2 copies left in stock." />,
};

export const InfoToast = {
  render: () => <ToastItem id="4" type="info" message="Your order is being processed." />,
};

export const AllToasts = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ToastItem id="1" type="success" message="Book added to your cart successfully!" />
      <ToastItem id="2" type="error" message="Payment failed. Please try a different card." />
      <ToastItem id="3" type="warning" message="Only 2 copies left in stock." />
      <ToastItem id="4" type="info" message="Your order is being processed." />
    </div>
  ),
};

// Live demo — buttons trigger real toasts
const LiveDemo = () => {
  const toast = useStoryToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="solid" size="sm" onClick={() => toast.success('Added to cart!')}>
        Success
      </Button>
      <Button variant="danger" size="sm" onClick={() => toast.error('Something went wrong.')}>
        Error
      </Button>
      <Button variant="secondary" size="sm" onClick={() => toast.warning('Low stock warning.')}>
        Warning
      </Button>
      <Button variant="ghost" size="sm" onClick={() => toast.info('New edition available.')}>
        Info
      </Button>
    </div>
  );
};

export const LiveToasts = {
  render: () => (
    <StoryToastProvider>
      <LiveDemo />
    </StoryToastProvider>
  ),
  parameters: { layout: 'centered' },
};

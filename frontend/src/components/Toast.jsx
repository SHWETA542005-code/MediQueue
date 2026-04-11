import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${colors[type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
};

export default Toast;
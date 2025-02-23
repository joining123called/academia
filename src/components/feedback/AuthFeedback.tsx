import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

let currentToastId: string | undefined;

const TOAST_DURATION = 5000; // 5 seconds for all toasts

const dismissCurrentToast = () => {
  if (currentToastId) {
    toast.dismiss(currentToastId);
    currentToastId = undefined;
  }
};

// Custom animation keyframes
const customAnimationStyles = {
  enter: `
    transform-origin: top;
    animate-[toast-enter_0.35s_cubic-bezier(0.21,1.02,0.73,1)_forwards]
  `,
  leave: `
    transform-origin: top;
    animate-[toast-leave_0.35s_cubic-bezier(0.06,0.71,0.55,1)_forwards]
  `
};

export const showAuthSuccess = (message: string) => {
  dismissCurrentToast();
  currentToastId = toast.custom((t) => (
    <div 
      className={`
        ${t.visible ? customAnimationStyles.enter : customAnimationStyles.leave}
        max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5
        transform transition-all duration-300
      `}
      style={{
        opacity: t.visible ? 1 : 0,
        transform: `translateY(${t.visible ? '0' : '-100%'}) scale(${t.visible ? '1' : '0.9'})`
      }}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <CheckCircle className="h-5 w-5 text-green-500 animate-[success-bounce_0.5s_ease-in-out]" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 animate-[fade-in_0.3s_ease-in]">Success</p>
            <p className="mt-1 text-sm text-gray-500 animate-[slide-up_0.3s_ease-out]">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            currentToastId = undefined;
          }}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none transition-colors duration-200 group"
        >
          <span className="group-hover:scale-105 transform transition-transform duration-200">Close</span>
        </button>
      </div>
    </div>
  ), { 
    duration: TOAST_DURATION,
    id: 'auth-toast',
  });
};

export const showAuthError = (message: string) => {
  dismissCurrentToast();
  currentToastId = toast.custom((t) => (
    <div 
      className={`
        ${t.visible ? customAnimationStyles.enter : customAnimationStyles.leave}
        max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5
        transform transition-all duration-300
      `}
      style={{
        opacity: t.visible ? 1 : 0,
        transform: `translateY(${t.visible ? '0' : '-100%'}) scale(${t.visible ? '1' : '0.9'})`
      }}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <XCircle className="h-5 w-5 text-red-500 animate-[error-shake_0.5s_ease-in-out]" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 animate-[fade-in_0.3s_ease-in]">Error</p>
            <p className="mt-1 text-sm text-gray-500 animate-[slide-up_0.3s_ease-out]">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            currentToastId = undefined;
          }}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none transition-colors duration-200 group"
        >
          <span className="group-hover:scale-105 transform transition-transform duration-200">Dismiss</span>
        </button>
      </div>
    </div>
  ), { 
    duration: TOAST_DURATION, // Changed from 8000 to use the standard duration
    id: 'auth-toast'
  });
};
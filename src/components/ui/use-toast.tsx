import { useState, useEffect } from 'react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

const toastState = {
  toasts: [] as ToastProps[],
  listeners: [] as Function[],
  
  addToast: (toast: ToastProps) => {
    toastState.toasts.push(toast);
    toastState.notifyListeners();
    
    // Auto remove after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        toastState.toasts = toastState.toasts.filter(t => t !== toast);
        toastState.notifyListeners();
      }, toast.duration || 3000);
    }
  },
  
  notifyListeners: () => {
    toastState.listeners.forEach(listener => listener(toastState.toasts));
  },
  
  subscribe: (listener: Function) => {
    toastState.listeners.push(listener);
    return () => {
      toastState.listeners = toastState.listeners.filter(l => l !== listener);
    };
  }
};

export function toast(props: ToastProps) {
  toastState.addToast({
    ...props,
    duration: props.duration || 3000
  });
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>(toastState.toasts);
  
  useEffect(() => {
    return toastState.subscribe(setToasts);
  }, []);
  
  return {
    toast,
    toasts,
    dismiss: (index: number) => {
      toastState.toasts.splice(index, 1);
      toastState.notifyListeners();
    }
  };
} 
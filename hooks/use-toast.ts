import { useState, useEffect } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success';

export interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: ToastVariant;
}

let subscribers: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notify = () => {
    subscribers.forEach((callback) => callback([...toasts]));
};

export const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant };
    toasts = [...toasts, newToast];
    notify();

    setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id);
        notify();
    }, 3000);
};

export const useToast = () => {
    const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

    useEffect(() => {
        subscribers.push(setCurrentToasts);
        return () => {
            subscribers = subscribers.filter((s) => s !== setCurrentToasts);
        };
    }, []);

    return { toasts: currentToasts, toast };
};

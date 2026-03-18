'use client';

import { useCalendarContext } from '@/hooks/useCalendarContext';

export default function Toast() {
  const { toasts } = useCalendarContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-text text-white px-[18px] py-[10px] rounded-[10px] text-[13px] font-medium shadow-[0_8px_30px_rgba(0,0,0,0.15)] animate-[toast-in_0.3s_ease]"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

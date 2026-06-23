import { Supabase } from "../../services/supabase/supabase";

export function waitForLoad(supabase: Supabase): Promise<void> {
  return new Promise((resolve) => {

    // لو خلص تحميل - resolve فوراً
    if (supabase.isInitialLoadDone()) {
      resolve();
      return;
    }

    // استنى كل 100ms بدل 50ms
    const interval = setInterval(() => {
      if (supabase.isInitialLoadDone()) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve();
      }
    }, 100);

    // بعد 8 ثواني وقف - زودنا الوقت
    const timeout = setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 8000);

  });
}
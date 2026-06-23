import { Supabase } from "../../services/supabase/supabase";

export function waitForLoad(supabase: Supabase): Promise<void> {
  return new Promise((resolve) => {

    if (supabase.isInitialLoadDone()) {
      resolve();
      return;
    }

    const interval = setInterval(() => {
      if (supabase.isInitialLoadDone()) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve();
      }
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 5000);

  });
}
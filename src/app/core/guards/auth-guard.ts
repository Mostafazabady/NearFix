import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Supabase } from '../services/supabase/supabase';
import { waitForLoad } from './WaitForLoadTs/wait-for-load';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(Supabase);
  const router   = inject(Router);

  await waitForLoad(supabase);

  const user = supabase.currentUser();

  if (user) return true;

  router.navigate(['/Auth/Login']);
  return false;
};
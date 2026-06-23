// client.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Supabase } from '../../services/supabase/supabase';
import { waitForLoad } from '../WaitForLoadTs/wait-for-load';

export const clientGuard: CanActivateFn = async () => {
  const supabase = inject(Supabase);
  const router   = inject(Router);

  // ✅ استنى لحد ما الـ supabase يخلص تحميل اليوزر
  await waitForLoad(supabase);

  const user = supabase.currentUser();
  const role = supabase.currentRole();

  // مش مسجل
  if (!user) {
    router.navigate(['/Auth/Login']);
    return false;
  }

  // مسجل بس مش عميل
  if (role !== 'client') {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
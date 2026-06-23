import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { waitForLoad } from '../WaitForLoadTs/wait-for-load';
import { Supabase } from '../../services/supabase/supabase';


export const artisanGuard: CanActivateFn = async () => {
  const supabase = inject(Supabase);
  const router   = inject(Router);

  // ✅ استنى لحد ما يخلص تحميل
  await waitForLoad(supabase);

  const user = supabase.currentUser();
  const role = supabase.currentRole();

  if (!user) {
    router.navigate(['/Auth/Login']);
    return false;
  }

  if (role !== 'artisan') {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
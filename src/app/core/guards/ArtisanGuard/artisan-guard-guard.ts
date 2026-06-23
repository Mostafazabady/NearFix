import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Supabase } from '../../services/supabase/supabase';
import { waitForLoad } from '../WaitForLoadTs/wait-for-load';

export const artisanGuard: CanActivateFn = async () => {
  const supabase = inject(Supabase);
  const router   = inject(Router);

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
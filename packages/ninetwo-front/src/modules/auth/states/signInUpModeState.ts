import { SignInUpMode } from '@/auth/types/signInUpMode';
import { createState } from 'ninetwo-ui/utilities';

export const signInUpModeState = createState<SignInUpMode>({
  key: 'signInUpModeState',
  defaultValue: SignInUpMode.SignIn,
});

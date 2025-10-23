import { createState } from 'ninetwo-ui/utilities';

export const qrCodeState = createState<string | null>({
  key: 'qrCodeState',
  defaultValue: null,
});

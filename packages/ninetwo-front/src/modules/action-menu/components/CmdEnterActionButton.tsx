import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';
import { Button } from 'ninetwo-ui/input';
import { getOsControlSymbol } from 'ninetwo-ui/utilities';

export const CmdEnterActionButton = ({
  title,
  onClick,
  disabled = false,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => onClick(),
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [onClick],
  });

  return (
    <Button
      title={title}
      variant={disabled ? 'secondary' : 'primary'}
      accent="blue"
      size="medium"
      onClick={onClick}
      disabled={disabled}
      hotkeys={[getOsControlSymbol(), '⏎']}
    />
  );
};

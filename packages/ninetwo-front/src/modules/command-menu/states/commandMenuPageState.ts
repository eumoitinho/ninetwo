import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { createState } from 'ninetwo-ui/utilities';

export const commandMenuPageState = createState<CommandMenuPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: CommandMenuPages.Root,
});

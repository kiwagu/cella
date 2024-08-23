import { GridSuggestionMenuController } from '@blocknote/react';
import type { Member } from '~/types';
import { CustomFormattingToolbar } from './custom-formatting-toolbar';
import { CustomSlashMenu } from './custom-slash-menu';
import { getMentionMenuItems, type schemaWithMentions } from './mention';

export const BlockNoteForTaskContent = ({ editor, members }: { editor: typeof schemaWithMentions.BlockNoteEditor; members: Member[] }) => (
  <>
    <CustomSlashMenu />
    <GridSuggestionMenuController
      triggerCharacter={'@'}
      getItems={async () =>
        getMentionMenuItems(members, editor).map((item) => ({
          ...item,
          title: item.id,
        }))
      }
      columns={2}
      minQueryLength={0}
    />
    <GridSuggestionMenuController
      triggerCharacter={':'}
      // Changes the Emoji Picker to only have 10 columns & min length of 0.
      columns={10}
      minQueryLength={0}
    />
    <CustomFormattingToolbar />
  </>
);
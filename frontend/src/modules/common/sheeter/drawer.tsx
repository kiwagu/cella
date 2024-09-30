import type { SheetProp } from '~/modules/common/sheeter/sheet';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '~/modules/ui/drawer';
import { cn } from '~/utils/utils';

export default function MobileSheet({ title, description, content, className, onOpenChange }: SheetProp) {
  return (
    <Drawer open={true} direction="right" noBodyStyles onOpenChange={onOpenChange}>
      <DrawerContent className={cn('min-h-[60vh]', className)}>
        <DrawerHeader className={`${description || title ? '' : 'hidden'}`}>
          <DrawerTitle className={`font-medium mb-2 ${title ? '' : 'hidden'}`}>{title}</DrawerTitle>
          <DrawerDescription className={`text-muted-foreground font-light pb-4${description ? '' : 'hidden'}`}>{description}</DrawerDescription>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  );
}
import { type Edge, attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { ContextEntity } from 'backend/types/common';
import { motion } from 'framer-motion';
import { Archive, ArchiveRestore, Bell, BellOff, GripVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { type UpdateMenuOptionsProp, updateMembership as baseUpdateMembership } from '~/api/memberships';
import { useMutation } from '~/hooks/use-mutations';
import { arrayMove, getDraggableItemData, getReorderDestinationIndex, sortById, updateOrderInMembership } from '~/lib/utils';
import { AvatarWrap } from '~/modules/common/avatar-wrap';
import { Button } from '~/modules/ui/button';
import { useNavigationStore } from '~/store/navigation';
import type { DraggableItemData, UserMenuItem } from '~/types';
import { DropIndicator } from '../drop-indicator';
import { MenuArchiveToggle } from './menu-archive-toggle';
import type { MenuItem } from './sheet-menu-section';

interface MenuItemProps {
  isGlobalDragging?: boolean;
  setGlobalDragging?: (dragging: boolean) => void;
}

type PageDraggableItemData = DraggableItemData<MenuItem>;

const isPageData = (data: Record<string | symbol, unknown>): data is PageDraggableItemData => {
  return data.dragItem === true && typeof data.index === 'number';
};

export const SheetMenuItemsOptions = ({
  data,
  shownOption,
  isGlobalDragging,
  setGlobalDragging,
}: MenuItemProps & { data: UserMenuItem[]; shownOption: 'archived' | 'unarchive' }) => {
  const { t } = useTranslation();
  const [submenuVisibility, setSubmenuVisibility] = useState<Record<string, boolean>>({});
  const { hideSubmenu, menuOrder } = useNavigationStore();
  const entityType = data[0].entity;
  const parentItemId = data[0].parentId;

  if (data.length === 0) {
    return (
      <li className="py-2 text-muted-foreground text-sm text-light text-center">
        {t('common:no_resource_yet', { resource: t(entityType.toLowerCase()).toLowerCase() })}
      </li>
    );
  }

  const filteredItems = data
    .filter((i) => (shownOption === 'archived' ? i.membership.archived : !i.membership.archived))
    .sort((a, b) => sortById(a.id, b.id, parentItemId ? menuOrder[entityType].subList[parentItemId] : menuOrder[entityType].mainList));

  const toggleSubmenuVisibility = (itemId: string) => {
    setSubmenuVisibility((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  return filteredItems.map((item) => {
    const isSubmenuArchivedVisible = submenuVisibility[item.id] || false;

    return (
      <div key={item.id}>
        <ItemOptions
          filteredItems={filteredItems}
          item={item}
          itemType={entityType}
          isGlobalDragging={isGlobalDragging}
          setGlobalDragging={setGlobalDragging}
          parentItemId={parentItemId}
        />
        {!item.membership.archived && item.submenu && !!item.submenu.length && !hideSubmenu && (
          <>
            <SheetMenuItemsOptions
              data={item.submenu}
              shownOption={shownOption}
              isGlobalDragging={isGlobalDragging}
              setGlobalDragging={setGlobalDragging}
            />
            <MenuArchiveToggle
              archiveToggleClick={() => toggleSubmenuVisibility(item.id)}
              inactiveCount={item.submenu.filter((i) => i.membership.archived).length}
              isArchivedVisible={isSubmenuArchivedVisible}
              isSubmenu
            />
            {isSubmenuArchivedVisible && <SheetMenuItemsOptions data={item.submenu} shownOption="archived" />}
          </>
        )}
      </div>
    );
  });
};

const ItemOptions = ({
  filteredItems,
  item,
  itemType,
  isGlobalDragging,
  parentItemId,
  setGlobalDragging,
}: MenuItemProps & { filteredItems: UserMenuItem[]; parentItemId?: string; item: MenuItem; itemType: ContextEntity }) => {
  const { t } = useTranslation();
  const dragRef = useRef(null);
  const dragButtonRef = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [isItemArchived, setItemArchived] = useState(item.membership.archived);
  const [isItemMuted, setItemMuted] = useState(item.membership.muted);
  const archiveStateToggle = useNavigationStore((state) => state.archiveStateToggle);
  const { menuOrder, setSubMenuOrder, setMainMenuOrder } = useNavigationStore();

  const { mutate: updateMembership } = useMutation({
    mutationFn: (values: UpdateMenuOptionsProp) => {
      return baseUpdateMembership(values);
    },
    onSuccess: (updatedMembership) => {
      if (updatedMembership.inactive !== isItemArchived) {
        const archived = updatedMembership.inactive || !isItemArchived;
        archiveStateToggle(item.id, archived, parentItemId ? parentItemId : null);
        toast.success(
          updatedMembership.inactive
            ? t('common:success.archived_resource', { resource: t(`common:${itemType.toLowerCase()}`) })
            : t('common:success.restore_resource', { resource: t(`common:${itemType.toLowerCase()}`) }),
        );
        setItemArchived(archived);
      }
      if (updatedMembership.muted !== isItemMuted) {
        const muted = updatedMembership.muted || !isItemMuted;
        toast.success(
          muted
            ? t('common:success.mute_resource', { resource: t(`common:${itemType.toLowerCase()}`) })
            : t('common:success.unmute_resource', { resource: t(`common:${itemType.toLowerCase()}`) }),
        );
        setItemMuted(muted);
      }
    },
    onError: () => {
      toast.error(t('common:error.error'));
    },
  });

  const itemOptionStatesHandle = (state: 'archive' | 'mute') => {
    const archive = state === 'archive' ? !isItemArchived : isItemArchived;
    const muted = state === 'mute' ? !isItemMuted : isItemMuted;
    const role = item.membership.role ? item.membership.role : undefined;
    updateMembership({ membershipId: item.membership.id, role, archive, muted });
  };

  const onDragOver = () => {
    setClosestEdge(null);
  };
  // create draggable & dropTarget elements and auto scroll
  useEffect(() => {
    const submenuItemIndex = parentItemId ? menuOrder[itemType].subList[parentItemId].findIndex((el) => el === item.id) : 0;
    const itemIndex = menuOrder[itemType].mainList ? menuOrder[itemType].mainList.findIndex((el) => el === item.id) : 0;
    const element = dragRef.current;
    const dragButton = dragButtonRef.current;
    const data = getDraggableItemData(item, parentItemId ? submenuItemIndex : itemIndex, 'menuItem', itemType);

    if (!element || !dragButton) return;

    return combine(
      draggable({
        element,
        dragHandle: dragButton,
        getInitialData: () => data,
        onDragStart: () => {
          setDragging(true);
          if (setGlobalDragging) setGlobalDragging(true);
        },
        onDrop: () => {
          setDragging(false);
          if (setGlobalDragging) setGlobalDragging(false);
        },
      }),
      dropTargetForElements({
        element,
        // allow drop if both have sum menu or both have not
        canDrop({ source }) {
          return isPageData(source.data) && source.data.item.id !== item.id && source.data.itemType === itemType;
        },
        getIsSticky: () => true,
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          });
        },
        onDrag: ({ self, source }) => {
          if (isPageData(source.data) && source.data.item.id === item.id) {
            setClosestEdge(null);
            return;
          }
          setClosestEdge(extractClosestEdge(self.data));
        },
        onDrop: () => onDragOver(),
        onDragLeave: () => onDragOver(),
      }),
    );
  }, [item, menuOrder[itemType], parentItemId]);

  // monitoring drop event
  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isPageData(source.data) && source.data.item.id === item.id;
      },
      async onDrop({ location, source }) {
        const target = location.current.dropTargets[0];

        const sourceData = source.data;
        if (!target || !isPageData(sourceData) || !isPageData(target.data)) return;
        const targetIndex = target.data.index;
        const closestEdgeOfTarget: Edge | null = extractClosestEdge(target.data);
        const destination = getReorderDestinationIndex(sourceData.index, closestEdgeOfTarget, targetIndex, 'vertical');
        const subList = menuOrder[itemType].subList;
        if (subList) {
          const mainMenuId = Object.keys(subList).find((key) => {
            return subList[key].includes(item.id);
          });
          if (!mainMenuId) return;
          const newItemOrder = arrayMove(menuOrder[itemType].subList[mainMenuId], sourceData.index, destination);
          setSubMenuOrder(itemType, mainMenuId, newItemOrder);
        } else {
          const newItemOrder = arrayMove(menuOrder[itemType].mainList, sourceData.index, destination);
          setMainMenuOrder(itemType, newItemOrder);
        }
        await updateOrderInMembership(filteredItems, targetIndex, item.membership.id);
      },
    });
  }, [item, menuOrder[itemType]]);

  return (
    <div key={item.id} className="relative my-1" ref={dragRef}>
      <motion.div
        layoutId={`sheet-menu-item-${item.id}`}
        ref={dragRef}
        style={{ opacity: `${dragging ? 0.3 : 1}` }}
        className={`group flex relative items-center sm:max-w-[18rem] ${parentItemId ? 'h-12 relative menu-item-sub' : 'h-14 '} w-full p-0  cursor-pointer justify-start rounded  focus:outline-none
      ring-inset ring-muted/25 focus:ring-foreground hover:bg-accent/50 hover:text-accent-foreground space-x-1
      ${!isItemArchived && 'ring-1'} `}
      >
        <AvatarWrap
          className={`${parentItemId ? 'my-2 mx-3 h-8 w-8 text-xs' : 'm-2'}`}
          type={itemType}
          id={item.id}
          name={item.name}
          url={item.thumbnailUrl}
        />
        <div className="truncate grow py-2 text-left">
          <div className={`truncate text-foreground/80 ${parentItemId ? 'text-sm' : 'text-base mb-1'} leading-5`}>{item.name}</div>
          <div className={`flex items-center gap-4 transition-opacity ${isGlobalDragging ? 'opacity-40 delay-0' : 'delay-500'}`}>
            <Button
              variant="link"
              size="sm"
              className="p-0 font-light text-xs h-4 leading-3 opacity-80 group-hover:opacity-100"
              aria-label="Toggle archive"
              onClick={() => itemOptionStatesHandle('archive')}
            >
              {isItemArchived ? (
                <>
                  <ArchiveRestore size={parentItemId ? 12 : 14} className="mr-1" /> {t('common:restore')}
                </>
              ) : (
                <>
                  <Archive size={parentItemId ? 12 : 14} className="mr-1" />
                  {t('common:archive')}
                </>
              )}
            </Button>
            <Button
              variant="link"
              size="sm"
              className="p-0 font-light text-xs h-4 leading-3 opacity-80 group-hover:opacity-100"
              aria-label="Toggle mute"
              onClick={() => itemOptionStatesHandle('mute')}
            >
              {isItemMuted ? (
                <>
                  <Bell size={parentItemId ? 12 : 14} className="mr-1" />
                  {t('common:unmute')}
                </>
              ) : (
                <>
                  <BellOff size={parentItemId ? 12 : 14} className="mr-1" />
                  {t('common:mute')}
                </>
              )}
            </Button>
          </div>
        </div>

        {!isItemArchived && (
          <Button size="xs" variant="none" ref={dragButtonRef} className="p-2 px-3 cursor-grab focus-visible:ring-inset focus-visible:ring-offset-0">
            <GripVertical size={16} className="opacity-50 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />
          </Button>
        )}
      </motion.div>
      {closestEdge && <DropIndicator className="h-[2px] w-full" edge={closestEdge} gap="2px" />}
    </div>
  );
};

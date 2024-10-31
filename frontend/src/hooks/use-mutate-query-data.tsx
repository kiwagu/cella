import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { queryClient } from '~/lib/router';

interface Item {
  id: string;
  membership?: { id: string } | null;
}

// TODO: add comments in this file
type QueryDataActions = 'create' | 'update' | 'delete' | 'updateMembership';

const updateItems = (items: Item[], dataItems: Item[], action: QueryDataActions) => {
  switch (action) {
    case 'create':
      return [...items, ...dataItems];
    case 'update':
      return dataItems.map((item) => items.find((i) => i.id === item.id) || item);
    case 'delete':
      return dataItems.filter((item) => !items.some((deletedItem) => deletedItem.id === item.id));
    case 'updateMembership':
      return dataItems.map((item) => {
        const updatedItem = items.find((i) => item.membership && i.id === item.membership.id);
        return updatedItem ? { ...item, membership: { ...item.membership, ...updatedItem } } : item;
      });
  }
};

// TODO this is not used anymore?
export const useMutateQueryData = (queryKey: QueryKey) => {
  return (items: Item[], action: QueryDataActions) => {
    queryClient.setQueryData<{ items: Item[]; total: number }>(queryKey, (data) => {
      if (!data) return;

      const updatedItems = updateItems(items, data.items, action);
      const totalAdjustment = action === 'create' ? items.length : action === 'delete' ? -items.length : 0;
      return { items: updatedItems, total: data.total + totalAdjustment };
    });
  };
};

export const useMutateInfiniteQueryData = (queryKey: QueryKey, invalidateKeyGetter: (item: Item) => QueryKey) => {
  return (items: Item[], action: QueryDataActions) => {
    changeInfiniteQueryData(queryKey, items, action);

    for (const index in items) {
      const queryKeyToInvalidate = invalidateKeyGetter(items[index]);
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
    }
  };
};

//TODO: can we merge this with useMutateInfiniteQueryData?
export const useMutateSimilarInfiniteQueryData = (passedQueryKey: QueryKey, invalidateKeyGetter: (item: Item) => QueryKey) => {
  return (items: Item[], action: QueryDataActions) => {
    const queries = queryClient.getQueriesData({ queryKey: passedQueryKey });

    for (const query of queries) {
      const [queryKey] = query;
      changeInfiniteQueryData(queryKey, items, action);
    }

    for (const index in items) {
      const queryKeyToInvalidate = invalidateKeyGetter(items[index]);
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
    }
  };
};

const changeInfiniteQueryData = (queryKey: QueryKey, items: Item[], action: QueryDataActions) => {
  queryClient.setQueryData<InfiniteData<{ items: Item[]; total: number }>>(queryKey, (data) => {
    if (!data) return;

    const totalAdjustment = action === 'create' ? items.length : action === 'delete' ? -items.length : 0;

    const pages = data.pages.map((page) => ({
      items: updateItems(items, page.items, action),
      total: page.total + totalAdjustment,
    }));

    return { pages, pageParams: data.pageParams };
  });
};

import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { Bird } from 'lucide-react';
import type { SortColumn } from 'react-data-grid';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import { useDebounce } from '~/hooks/use-debounce';
import ContentPlaceholder from '~/modules/common/content-placeholder';
import { RequestsTableRoute } from '~/routes/system';
import type { Requests } from '~/types';
import useSaveInSearchParams from '../../../hooks/use-save-in-search-params';
import { DataTable } from '../../common/data-table';
import { useColumns } from './columns';
import Toolbar from './toolbar';
import type { getRequestsQuerySchema } from 'backend/modules/general/schema';
import { actionRequests } from '~/api/general';

export type RequestsSearch = z.infer<typeof getRequestsQuerySchema>;

const LIMIT = 40;

type RequestsTableModes = { mode?: 'system' | 'organization' };

const RequestsTable = ({ mode = 'system' }: RequestsTableModes) => {
  const search = useSearch({
    from: RequestsTableRoute.id,
  });
  const { t } = useTranslation();
  const [rows, setRows] = useState<Requests[]>([]);
  const [selectedRows, setSelectedRows] = useState(new Set<string>());
  const [sortColumns, setSortColumns] = useState<SortColumn[]>(
    search.sort && search.order
      ? [{ columnKey: search.sort, direction: search.order === 'asc' ? 'ASC' : 'DESC' }]
      : [{ columnKey: 'createdAt', direction: 'DESC' }],
  );
  const [query, setQuery] = useState<RequestsSearch['q']>(search.q);

  const debounceQuery = useDebounce(query, 300);
  // Save filters in search params
  const filters = useMemo(
    () => ({
      q: debounceQuery,
      sort: sortColumns[0]?.columnKey,
      order: sortColumns[0]?.direction.toLowerCase(),
    }),
    [debounceQuery, sortColumns],
  );

  useSaveInSearchParams(filters, { sort: 'createdAt', order: 'desc' });

  const queryResult = useInfiniteQuery({
    queryKey: ['requests', debounceQuery, sortColumns],
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const fetchedData = await actionRequests(
        {
          page: pageParam,
          q: debounceQuery,
          sort: sortColumns[0]?.columnKey as RequestsSearch['sort'],
          order: sortColumns[0]?.direction.toLowerCase() as RequestsSearch['order'],
          limit: LIMIT,
        },
        signal,
      );
      return fetchedData;
    },
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
  });

  const [columns, setColumns] = useColumns();

  const onRowsChange = async (records: Requests[]) => {
    if (mode === 'organization') return setRows(records.filter((el) => el.type === 'ORGANIZATION_REQUEST'));
    setRows(records);
  };

  const isFiltered = !!debounceQuery;

  const onResetFilters = () => {
    setQuery('');
    setSelectedRows(new Set<string>());
  };

  useEffect(() => {
    const data = queryResult.data?.pages?.flatMap((page) => page.requestsInfo);

    if (data) {
      setSelectedRows(new Set<string>([...selectedRows].filter((id) => data.some((row) => row.id === id))));
      if (mode === 'organization') return setRows(data.filter((el) => el.type === 'ORGANIZATION_REQUEST'));
      setRows(data);
    }
  }, [queryResult.data]);

  return (
    <div className="space-y-4 h-full">
      <Toolbar
        total={queryResult.data?.pages?.[0]?.total}
        query={query}
        setQuery={setQuery}
        isFiltered={isFiltered}
        selectedRequests={rows.filter((row) => selectedRows.has(row.id))}
        onResetFilters={onResetFilters}
        onResetSelectedRows={() => setSelectedRows(new Set<string>())}
        columns={columns}
        setColumns={setColumns}
        sort={sortColumns[0]?.columnKey as RequestsSearch['sort']}
        order={sortColumns[0]?.direction.toLowerCase() as RequestsSearch['order']}
      />
      <DataTable<Requests>
        {...{
          columns: columns.filter((column) => column.visible),
          rows,
          totalCount: queryResult.data?.pages[0].total,
          rowHeight: 42,
          rowKeyGetter: (row) => row.id,
          error: queryResult.error,
          isLoading: queryResult.isLoading,
          isFetching: queryResult.isFetching,
          enableVirtualization: false,
          isFiltered,
          limit: LIMIT,
          selectedRows,
          onRowsChange,
          fetchMore: queryResult.fetchNextPage,
          onSelectedRowsChange: setSelectedRows,
          sortColumns,
          onSortColumnsChange: setSortColumns,
          NoRowsComponent: <ContentPlaceholder Icon={Bird} title={t('common:no_requests')} />,
        }}
      />
    </div>
  );
};

export default RequestsTable;

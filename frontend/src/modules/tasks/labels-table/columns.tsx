import { Dot } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dateShort } from '~/lib/utils';
import CheckboxColumn from '~/modules/common/data-table/checkbox-column';
import type { ColumnOrColumnGroup } from '~/modules/common/data-table/columns-view';
import HeaderCell from '~/modules/common/data-table/header-cell';
import type { Label } from '~/types';
import { badgeStyle } from '../task-selectors/select-labels';

export const useColumns = () => {
  const { t } = useTranslation();

  const columns: ColumnOrColumnGroup<Label>[] = [
    CheckboxColumn,
    {
      key: 'name',
      name: t('common:name'),
      visible: true,
      minWidth: 200,
      sortable: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => t(row.name),
    },
    {
      key: 'color',
      name: t('common:color'),
      visible: true,
      minWidth: 40,
      sortable: false,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => <Dot className="rounded-md" size={22} style={badgeStyle(row.color)} strokeWidth={0} />,
    },
    {
      key: 'useCount',
      name: t('common:use_count'),
      visible: true,
      minWidth: 20,
      sortable: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => row.useCount.toString(),
    },
    {
      key: 'lastUsed',
      name: t('common:last_used'),
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => dateShort(row.lastUsed.toString()),
    },
  ];

  return useState<ColumnOrColumnGroup<Label>[]>(columns);
};

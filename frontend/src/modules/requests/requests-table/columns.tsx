import { useTranslation } from 'react-i18next';
import type { Requests } from '~/types';

import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useBreakpoints } from '~/hooks/use-breakpoints';
import { dateShort } from '~/lib/utils';
import CheckboxColumn from '~/modules/common/data-table/checkbox-column';
import { AvatarWrap } from '../../common/avatar-wrap';
import type { ColumnOrColumnGroup } from '../../common/data-table/columns-view';
import HeaderCell from '../../common/data-table/header-cell';

export const useColumns = () => {
  const { t } = useTranslation();
  const isMobile = useBreakpoints('max', 'sm');

  const mobileColumns: ColumnOrColumnGroup<Requests>[] = [
    CheckboxColumn,
    {
      key: 'email',
      name: t('common:email'),
      minWidth: 120,
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row, tabIndex }) => (
        <a href={`mailto:${row.email}`} tabIndex={tabIndex} className="truncate hover:underline underline-offset-4 font-light outline-0 ring-0">
          {row.email || '-'}
        </a>
      ),
    },
    {
      key: 'requestType',
      name: 'Request Type',
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => (row.type ? row.type : '-'),
      width: 120,
    },
  ];

  return useState<ColumnOrColumnGroup<Requests>[]>(
    isMobile
      ? mobileColumns
      : [
          ...mobileColumns,
          {
            key: 'createdAt',
            name: t('common:created_at'),
            sortable: true,
            visible: true,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => dateShort(row.createdAt),
            minWidth: 180,
          },
          {
            key: 'accompanyingMessage',
            name: 'accompanyingMessage',
            visible: true,
            sortable: false,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => <>{row.message || '-'}</>,
          },
          {
            key: 'user',
            name: 'user',
            visible: true,
            sortable: true,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row, tabIndex }) => {
              return (
                <>
                  {row.userId !== null ? (
                    <Link
                      tabIndex={tabIndex}
                      to="/user/$idOrSlug"
                      params={{ idOrSlug: row.userId }}
                      className="flex space-x-2 items-center outline-0 ring-0 group"
                    >
                      <AvatarWrap type="USER" className="h-8 w-8" id={row.userId} name={row.userName} url={row.userThumbnail} />
                      <span className="group-hover:underline underline-offset-4 truncate font-medium">{row.userName || '-'}</span>
                    </Link>
                  ) : (
                    '-'
                  )}
                </>
              );
            },
          },
          {
            key: 'organization',
            name: 'organization',
            visible: true,
            sortable: true,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row, tabIndex }) => {
              return (
                <>
                  {row.organizationId !== null ? (
                    <Link
                      to="/$idOrSlug/members"
                      tabIndex={tabIndex}
                      params={{ idOrSlug: row.organizationId }}
                      className="flex space-x-2 items-center outline-0 ring-0 group"
                    >
                      <AvatarWrap
                        type="ORGANIZATION"
                        className="h-8 w-8"
                        id={row.organizationId}
                        name={row.organizationName}
                        url={row.organizationThumbnail}
                      />
                      <span className="group-hover:underline underline-offset-4 truncate font-medium">{row.organizationName || '-'}</span>
                    </Link>
                  ) : (
                    '-'
                  )}
                </>
              );
            },
          },
        ],
  );
};
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { FormattedRelative, defineMessages, injectIntl } from 'react-intl';

import { Layout } from '../Layout';
import { BodyCard } from '../Components';

const BigBodyCard = styled(BodyCard)`
  width: 60vw;
  max-width: 850px;
`;

const messages = defineMessages({
  tableHeader: {
    id: 'admin_table.table_header',
    defaultMessage: 'Active Teams',
  },
  teamname: {
    id: 'admin_table.teamname',
    defaultMessage: 'Teamname',
  },
  ready: {
    id: 'admin_table.ready',
    defaultMessage: 'Ready',
  },
  created: {
    id: 'admin_table.created',
    defaultMessage: 'Created',
  },
  lastUsed: {
    id: 'admin_table.lastUsed',
    defaultMessage: 'Last Used',
  },
});

export default injectIntl(({ intl }) => {
  const [teams, setTeams] = useState([]);

  const { formatMessage, formatDate } = intl;

  function updateAdminData() {
    return axios.get(`/balancer/admin/all`).then(({ data }) => {
      setTeams(data.instances);
    });
  }

  useEffect(() => {
    updateAdminData();

    const interval = setInterval(updateAdminData, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const columns = [
    {
      name: formatMessage(messages.teamname),
      selector: 'team',
      sortable: true,
    },
    {
      name: formatMessage(messages.ready),
      selector: 'ready',
      sortable: true,
      right: true,
      format: ({ ready }) => (ready ? '✅' : '❌'),
    },
    {
      name: formatMessage(messages.created),
      selector: 'createdAt',
      sortable: true,
      format: ({ createdAt }) => {
        return (
          <span title={createdAt}>
            <FormattedRelative value={createdAt} />
          </span>
        );
      },
    },
    {
      name: formatMessage(messages.lastUsed),
      selector: 'lastConnect',
      sortable: true,
      format: ({ lastConnect }) => {
        return (
          <span title={formatDate(lastConnect)}>
            <FormattedRelative value={lastConnect} />
          </span>
        );
      },
    },
  ];

  return (
    <Layout>
      <BigBodyCard>
        <DataTable
          title={formatMessage(messages.tableHeader)}
          defaultSortField="lastConnect"
          defaultSortAsc={false}
          columns={columns}
          data={teams}
        />
      </BigBodyCard>
    </Layout>
  );
});

import React from 'react';

import { Table as TableAntd, Tag, Space } from 'antd';

import ListPageTable from '../../components/ListPageTable';

const { Column } = TableAntd;

function CursoListPage() {
  return (
    <ListPageTable
      title="Cursos"
    >
      <Column title="Age" dataIndex="age" key="age" />
      <Column title="Address" dataIndex="address" key="address" />
      <Column
        title="Tags"
        dataIndex="tags"
        key="tags"
        render={tags => (
          <>
            {tags.map(tag => (
              <Tag color="blue" key={tag}>
                {tag}
              </Tag>
            ))}
          </>
        )}
      />
      <Column
        title="Action"
        key="action"
        render={(text, record) => (
          <Space size="middle">
            <a href="/">Invite {record.lastName}</a>
            <a href="/">Delete</a>
          </Space>
        )}
      />
    </ListPageTable>
  );
}

export default CursoListPage;

/* eslint-disable */
import React, { useCallback, useMemo, useState } from 'react';

import {
  Button, PageHeader, Checkbox, Popover, Row, Col,
} from 'antd';

import Table from './Table';
import styles from './ListPageTable.module.scss';

const ListPageTable = ({ title, subTitle, children }) => {
  const [selectedColumns, setSelectedColumns] = useState();

  const columns = useMemo(() => {
    return React.Children.toArray(children);
  }, [children]);

  console.log('Columns ', columns);

  const renderActions = useCallback(() => {
    const renderCheckboxColumns = () => {
      const onChangeCheckedValues = checkedValues => {
        console.log('checked ', checkedValues);
      };

      return (
        <div className={styles.divCheckbox}>
          <Checkbox.Group onChange={onChangeCheckedValues} >
            <Row>
            {columns.map(column => {

              return (
              <Col span={8}>
                <Checkbox value={column.key}>
                  {column.props.title}
                </Checkbox>
              </Col>
              )
            })}
            </Row>
          </Checkbox.Group> 
        </div>
      );
    };

    return (
      <div>
        <Popover content={renderCheckboxColumns()} title="Selecione as colunas desejadas" trigger="click">
          <Button>Colunas</Button>
        </Popover>
        <Button key="1" type="primary">
          Adicionar
        </Button>
      </div>
    );
  }, []);

  return (
    <div>
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title={title}
        subTitle={subTitle}
        extra={renderActions()}
      />
      <Table>
        {columns}
      </Table>
    </div>
  );
};

export default ListPageTable;

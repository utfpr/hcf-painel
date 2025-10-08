import React from 'react';
import {
  Divider, Card, Row, Col, Input, Button, notification, Form, Select
} from 'antd';
import TotalRecordFound from '@/components/TotalRecordsFound';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

import ModalCadastroComponent from '@/components/ModalCadastroComponent';
import SimpleTableComponent from '@/components/SimpleTableComponent';

const columns = [
  { title: 'Estado', dataIndex: 'nome', key: 'nome', sorter: true },
  { title: 'Sigla', dataIndex: 'sigla', key: 'sigla', sorter: true },
  { title: 'Código Telefone', dataIndex: 'codigo_telefone', key: 'codigo_telefone', sorter: true },
  { title: 'País', dataIndex: 'paisNome', key: 'paisNome', sorter: true },
  { title: 'Ação', key: 'acao' }
];

const ListaEstadosComponent = ({
  form,
  estados,
  paises,
  metadados,
  loading,
  visibleModal,
  loadingModal,
  tituloModal,
  onBusca,
  onLimparBusca,
  onTabelaChange,
  onExcluir,
  onAbrirModal,
  onFecharModal,
  onSalvar,
  isCuradorOuOperador,
}) => {
  const renderActionButtons = (item) => {
    if (!isCuradorOuOperador) return null;
    return (
      <span>
        <a onClick={() => onAbrirModal(item)}>
          <EditOutlined style={{ color: '#FFCC00' }} />
        </a>
        <Divider type="vertical" />
        <a onClick={() => onExcluir(item.id)}>
          <DeleteOutlined style={{ color: '#e30613' }} />
        </a>
      </span>
    );
  };

  const formattedEstados = (estados || []).map(item => ({
    ...item,
    key: item.id,
    paisNome: item.pais?.nome || '-',
    acao: renderActionButtons(item),
  }));

  const finalColumns = isCuradorOuOperador
    ? columns
    : columns.filter(col => col.key !== 'acao');

  const handleSearch = () => {
    const valores = form.getFieldsValue();
    onBusca(valores);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.nomeEstado && values.nomeEstado.trim() !== '') {
        onSalvar({
          nome: values.nomeEstado,
          sigla: values.ufEstado,
          codigo_telefone: values.codigoTelefone,
          pais_id: parseInt(values.paisId, 10)
        });
      }
    } catch {
      notification.warning({
        message: 'Falha',
        description: 'Preencha os campos obrigatórios.',
      });
    }
  };

  return (
    <div>
      <Row gutter={24} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={14} md={18} lg={20} xl={20}>
          <h2 style={{ fontWeight: 200 }}>Estados</h2>
        </Col>
        <Col xs={24} sm={10} md={6} lg={4} xl={4}>
          {isCuradorOuOperador && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onAbrirModal()}
              style={{
                backgroundColor: '#5CB85C',
                borderColor: '#5CB85C',
                width: '100%',
              }}
            >
              Adicionar
            </Button>
          )}
        </Col>
      </Row>
      <Divider dashed />
      <Card title="Buscar estado">
        <Form form={form} onFinish={handleSearch}>
          <Row gutter={8}>
            <Col span={24}><span>Nome do estado:</span></Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item name="nome">
                <Input placeholder="Paraná" type="text" />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginTop: 32 }}>
            <Col span={24}>
              <Row justify="end" align="middle" gutter={16}>
                <Col xs={24} sm={8} md={12} lg={16} xl={16}>
                  <TotalRecordFound total={metadados?.total} />
                </Col>
                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                  <Button onClick={onLimparBusca}>Limpar</Button>
                </Col>
                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                  <Button type="primary" htmlType="submit">Pesquisar</Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Card>
      <Divider dashed />
      <SimpleTableComponent
        columns={finalColumns}
        data={formattedEstados}
        metadados={metadados}
        loading={loading}
        changePage={onTabelaChange}
      />
      <Divider dashed />
      <ModalCadastroComponent
        title={tituloModal}
        visibleModal={visibleModal}
        loadingModal={loadingModal}
        onCancel={onFecharModal}
        onOk={handleModalOk}
      >
        <Form form={form} layout="vertical">
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item label="Nome" name="nomeEstado" rules={[{ required: true, message: 'Informe o nome do estado' }]}>
                <Input placeholder="Paraná" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item
                label="Sigla"
                name="ufEstado"
                rules={[
                  { required: true, message: 'Informe a sigla' },
                  { pattern: /^[A-Za-z]+$/, message: 'A sigla deve conter apenas letras' }
                ]}
              >
                <Input maxLength={3} placeholder="PR" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item
                label="Código de telefone"
                name="codigoTelefone"
                rules={[
                  { required: true, message: 'Informe o código de telefone' },
                  { pattern: /^[0-9]+$/, message: 'O código deve conter apenas números' }
                ]}
              >
                <Input maxLength={3} placeholder="44" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item
                label="País"
                name="paisId"
                rules={[{ required: true, message: 'Informe o país' }]}
              >
                <Select placeholder="Selecione o país" optionFilterProp="children">
                  {paises.map(pais => (
                    <Select.Option key={pais.id} value={pais.id}>
                      {pais.nome}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </ModalCadastroComponent>
    </div>
  );
};

export default ListaEstadosComponent;

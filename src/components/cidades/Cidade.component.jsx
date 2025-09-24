import React from 'react';
import {
  Divider, Card, Row, Col, Input, Button, notification, Form, Select
} from 'antd';
import TotalRecordFound from '@/components/TotalRecordsFound';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

import ModalCadastroComponent from '@/components/ModalCadastroComponent';
import SimpleTableComponent from '@/components/SimpleTableComponent';

const { Option } = Select;

const columns = [
  { title: 'Cidade', dataIndex: 'nome', key: 'nome', sorter: true },
  { title: 'Estado', dataIndex: 'estadoNome', key: 'estadoNome', sorter: true },
  { title: 'Latitude', dataIndex: 'latitude', key: 'latitude' },
  { title: 'Longitude', dataIndex: 'longitude', key: 'longitude' },
  { title: 'Ação', key: 'acao' }
];

const CidadesComponent = ({
  form,
  cidades,
  estados,
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

  const formattedCidades = (cidades || []).map(item => ({
    ...item,
    key: item.id,
    estadoNome: item.estado?.nome || '-',
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
      if (values.nomeCidade && values.nomeCidade.trim() !== '') {
        onSalvar({
          nome: values.nomeCidade,
          estado_id: parseInt(values.estadoId, 10),
          latitude: values.latitude,
          longitude: values.longitude,
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
          <h2 style={{ fontWeight: 200 }}>Cidades</h2>
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
      <Card title="Buscar cidade">
        <Form form={form} onFinish={handleSearch}>
          <Row gutter={8}>
            <Col span={24}><span>Nome da cidade:</span></Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item name="nome">
                <Input placeholder="Curitiba" type="text" />
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
        data={formattedCidades}
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
              <Form.Item label="Nome" name="nomeCidade" rules={[{ required: true, message: 'Informe o nome da cidade' }]}>
                <Input placeholder="Curitiba" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item
                label="Estado"
                name="estadoId"
                rules={[{ required: true, message: 'Informe o estado' }]}
              >
                <Select placeholder="Selecione o estado">
                  {estados.map(estado => (
                    <Option key={estado.id} value={`${estado.id}`}>
                      {estado.nome}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="Latitude" name="latitude">
                <Input placeholder="-25.4284" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Longitude" name="longitude">
                <Input placeholder="-49.2733" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </ModalCadastroComponent>
    </div>
  );
};

export default CidadesComponent;

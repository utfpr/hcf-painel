import React from 'react';

import {
  Col, Radio, Row, Tag,
} from 'antd';

import Input from '../../../components/Input';

const MainFeatures = () => {
  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="nomes_populares"
            label="Nome Popular"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          {/* select */}
          <Input
            name="herbario"
            label="Herbário"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="numero_coleta"
            label="Número da coleta"
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="nomes_populares"
            label="Dia da coleta"
            type="number"
            min={1}
            max={31}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          {/* select */}
          <Input
            name="herbario"
            label="Mês da coleta"
            type="number"
            min={1}
            max={12}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="herbario"
            label="Ano da coleta"
            type="number"
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="nomes_populares"
            label="Localidade"
            type="radioGroup"
          >
            <Radio value="VERMELHO"><Tag color="red">Paraná</Tag></Radio>
            <Radio value="VERDE"><Tag color="green">Brasil</Tag></Radio>
            <Radio value="AZUL"><Tag color="blue">Outros países</Tag></Radio>
          </Input>
        </Col>
        <Col xs={24} sm={12} md={8}>
          {/* select */}
          <Input
            name="herbario"
            label="Tipo"
          />
        </Col>
      </Row>
    </>
  );
};

export default MainFeatures;

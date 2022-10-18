import React from 'react';

import { Col, Row } from 'antd';

import Input from '../../../components/Input';

const CollectionPlace = () => {
  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="nomes_populares"
            label="Latitude"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="herbario"
            label="Longitude"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="numero_coleta"
            label="Altitude"
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="nomes_populares"
            label="País"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          {/* select */}
          <Input
            name="herbario"
            label="Estado"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="numero_coleta"
            label="Cidade"
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Input
            name="nomes_populares"
            label="Complemento"
          />
        </Col>
      </Row>
    </>
  );
};

export default CollectionPlace;

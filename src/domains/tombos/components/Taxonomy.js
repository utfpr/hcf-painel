import React from 'react';

import { Col, Input, Row } from 'antd';

const Taxonomy = () => {
    return (
        <>
            <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                    <Input
                        name="familia"
                        label="Família"
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Input
                        name="subfamilia"
                        label="Subfamília"
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Input
                        name="genero"
                        label="Gênero"
                    />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                    <Input
                        name="especie"
                        label="Espécie"
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    {/* select */}
                    <Input
                        name="subespecie"
                        label="Subespécie"
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Input
                        name="variedade"
                        label="Variedade"
                    />
                </Col>
            </Row>
        </>
    );
};

export default Taxonomy;

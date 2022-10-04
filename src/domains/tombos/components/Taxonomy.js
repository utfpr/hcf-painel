import React, { useMemo } from 'react';

import { Col, Input, Row } from 'antd';
import { useFormContext } from 'react-hook-form';

import requestFamilias from '../../../components/SearchSelect/requests/familias';
import requestSubfamilias from '../../../components/SearchSelect/requests/subfamilias';
import { SearchSelectField } from '../../../components/SearchSelect/SearchSelect';

const Taxonomy = () => {
    const { watch } = useFormContext();
    const familiaSelected = watch('familia');

    const subfamiliaRequestParams = useMemo(() => ({
        familiaId: familiaSelected?.value,
    }), [familiaSelected]);

    return (
        <>
            <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                    <SearchSelectField
                        label="Família"
                        name="familia"
                        request={requestFamilias}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <SearchSelectField
                        label="Subfamília"
                        name="subfamilia"
                        request={requestSubfamilias}
                        requestParams={subfamiliaRequestParams}
                        disabled={!watch('familia')}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <SearchSelectField
                        label="Gênero"
                        name="genero"
                        request={requestFamilias}
                        disabled={!watch('familia')}
                    />
                    {/* <Input
                        name="genero"
                        label="Gênero"
                    /> */}
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

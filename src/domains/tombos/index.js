/* eslint-disable react-perf/jsx-no-new-array-as-prop */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';

import { CaretRightOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
    Button,
    Col, Collapse, Row, Spin,
} from 'antd';

import CardTombo from '../../components/CardTombo';
import Input from '../../components/Input';
import { wrapForm } from '../../helpers/form-helper';
import useAsync from '../../hooks/use-async';
import useDidMount from '../../hooks/use-did-mount';
import useScroll from '../../hooks/use-scroll';
import { getTombos } from '../../services/tombo-service';
import styles from './TombosPage.module.scss';

const { Panel } = Collapse;

// length: 100
// limit: 100
// page: 1
// total: 23580

const TombosPage = ({ form, handleSubmit }) => {
    const [tombos, setTombos] = useState([]);
    const [metadata, setMetadata] = useState({
        page: 1,
    });
    const scrollInfo = useScroll();
    const [currentPage, setCurrentPage] = useState(1);
    const { watch } = form;

    const [loading, requestTombos] = useAsync(async page => {
        const hcf = watch('hcf');
        const nomesPopulares = watch('nomes_populares');
        const nomeCientifico = watch('nome_cientifico');
        const localColeta = watch('local_coleta');
        const filters = {
            hcf, nomesPopulares, nomeCientifico, localColeta,
        };

        const data = await getTombos(page, 20, filters);
        if (data) {
            setMetadata(data.metadata);
            setCurrentPage(data.metadata.page);
            setTombos([
                ...tombos,
                ...data.records,
            ]);
        }
        console.log('use', data);
    });

    useDidMount(() => {
        requestTombos(currentPage);
        handleSubmit(requestTombos);
    });

    const onChangePage = nextPage => {
        if (currentPage !== nextPage) {
            setCurrentPage(nextPage);
            requestTombos(nextPage);
        }
    };

    const renderLoading = () => {
        if (scrollInfo.hasScrolled) {
            if (scrollInfo.percentage === 100) {
                const nextPage = metadata.page + 1;
                const totalPage = Math.ceil(metadata.total / metadata.limit);

                if (nextPage <= totalPage) {
                    onChangePage(nextPage);
                }
            }
        }

        if (loading) {
            return (
                <div className={styles.loading}>
                    <Spin tip="Loading..." />
                </div>
            );
        }

        return null;
    };

    const renderFilters = () => {
        return (
            <Collapse
                bordered={false}
                defaultActiveKey={['1']}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                className="site-collapse-custom-collapse"
            >
                <Panel header="Filtros" key="1" className="site-collapse-custom-panel">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                size="large"
                                name="hcf"
                                placeholder="HCF"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                size="large"
                                name="nomes_populares"
                                placeholder="Nome Popular"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                size="large"
                                name="nome_cientifico"
                                placeholder="Nome Científico"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                size="large"
                                name="local_coleta"
                                placeholder="Local coleta"
                            />
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Button icon={<DeleteOutlined />}>Limpar</Button>
                        <Button
                            onClick={handleSubmit(requestTombos)}
                            type="primary"
                            icon={<SearchOutlined />}
                        >Buscar
                        </Button>
                    </Row>
                </Panel>
            </Collapse>
        );
    };

    return (
        <div className={styles.content}>
            <div className={styles.filters}>
                {renderFilters()}
            </div>
            <div className={styles.tombos}>
                {tombos?.map(tombo => {
                    return (
                        <CardTombo tombo={tombo} size="large" />
                    );
                })}
                {renderLoading()}
            </div>
        </div>
    );
};

export default wrapForm(TombosPage);

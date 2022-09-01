/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from 'react';

import {
    Carousel, Col, Divider, Image, Row, Spin,
} from 'antd';
import {
    useParams,
} from 'react-router-dom';

import MapWithMarker from '../../components/MapWithMarker';
import useAsync from '../../hooks/use-async';
import useDidMount from '../../hooks/use-did-mount';
import { decimalToDMS, getCollectionDate, getDetailsTombo } from '../../services/tombo-service';
import strings from '../../values/strings';
import styles from './DetailsTomboPage.module.scss';

const mapStyle = { height: '40vh' };

const ItemTomboDetail = ({ title, value }) => {
    return (
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Col span={24}>
                <h4>{title}</h4>
            </Col>
            <Col span={24}>
                <span> {value || 'Sem valor'} </span>
            </Col>
        </Col>
    );
};

const DetailsTomboPage = () => {
    const { tomboId } = useParams();
    const [detailsTombo, setDetailsTombo] = useState(null);

    const coordinates = useMemo(() => {
        if (!detailsTombo) return null;

        const {
            latitude, longitude,
        } = detailsTombo;

        if (latitude === 0 || longitude === 0) return null;

        return [
            latitude,
            longitude,
        ];
    }, [detailsTombo]);

    const city = useMemo(() => {
        if (!detailsTombo) return '';
        const { local_coleta: localColeta } = detailsTombo;
        if (!localColeta.cidade) return '';
        let cityName = localColeta.cidade.nome;

        if (localColeta.cidade.estado != null) {
            cityName += `${cityName} - ${localColeta.cidade.estado.nome}`;
        }
        return cityName;
    }, [detailsTombo]);

    const collectionDate = useMemo(() => {
        if (!detailsTombo) return '';

        const {
            data_coleta_ano: dataColetaAno,
            data_coleta_dia: dataColetaDia, data_coleta_mes: dataColetaMes,
        } = detailsTombo;
        return getCollectionDate(dataColetaDia, dataColetaMes, dataColetaAno);
    }, [detailsTombo]);

    const latLng = useMemo(() => {
        if (!detailsTombo) return '';

        const {
            latitude, longitude,
        } = detailsTombo;
        if (!latitude || !longitude) return '';
        const location = decimalToDMS(latitude, longitude);
        return (
            `${location.latResult} - ${location.lngResult}`
        );
    }, [detailsTombo]);

    const colectors = useMemo(() => {
        if (!detailsTombo) return '';

        const {
            coletores,
        } = detailsTombo;
        return coletores.map(colector => colector.nome).join(', ');
    }, [detailsTombo]);

    const [loading, requestDetailsTombo] = useAsync(async (page, filters) => {
        const data = await getDetailsTombo(tomboId);
        if (data) {
            setDetailsTombo(data);
        }
    });

    useDidMount(() => {
        requestDetailsTombo();
    });

    if (!detailsTombo) {
        return (
            <div>
                <Spin />
            </div>
        );
    }

    const {
        hcf, nomes_populares: nomesPopulares, herbario, numero_coleta: numeroColeta,
        data_tombo: dataTombo, nome_cientifico: nomeCientifico, tipo, altitude,
        local_coleta: localColeta,
    } = detailsTombo;

    const {
        descricao, fase_sucessional: faseSucessional,
        relevo, solo, vegetacao,
    } = localColeta;

    return (
        <div>
            <Row type="flex" justify="center">
                <Col span={12}>
                    <Carousel autoplay>
                        {detailsTombo.fotos?.map(photo => {
                            return (
                                <Image
                                    // width={340}
                                    height={500}
                                    src={`${strings.urlImage}/${photo.caminho_foto}`}
                                    // eslint-disable-next-line max-len
                                    fallback="data:image/png;base64,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"
                                />
                            );
                        })}
                    </Carousel>
                </Col>
            </Row>
            <Divider dashed />
            <Row gutter={8} className={styles.item}>
                <ItemTomboDetail title="Número do tombo:" value={hcf} />
                <ItemTomboDetail title="Nome popular:" value={nomesPopulares} />
                <ItemTomboDetail title="Herbário:" value={herbario?.nome} />
            </Row>
            <Row gutter={8} className={styles.item}>
                <ItemTomboDetail title="Número da coleta:" value={numeroColeta} />
                <ItemTomboDetail title="Data de coleta:" value={collectionDate} />
                <ItemTomboDetail title="Data de tombo:" value={dataTombo} />
            </Row>
            <Row gutter={8} className={styles.item}>
                <ItemTomboDetail title="Nome científico:" value={nomeCientifico} />
                <ItemTomboDetail title="Tipo:" value={tipo?.nome} />
            </Row>
            <Divider dashed />
            <Row gutter={8} className={styles.item}>
                <ItemTomboDetail title="Latitude e Longitude:" value={latLng} />
                <ItemTomboDetail title="Altitude:" value={altitude ? `${altitude}m` : ''} />
                <ItemTomboDetail title="Cidade de coleta:" value={city} />
            </Row>
            <Divider dashed />
            <Row gutter={8} className={styles.item}>
                <ItemTomboDetail title="Solo:" value={solo?.nome} />
                <ItemTomboDetail title="Relevo:" value={relevo?.nome} />
                <ItemTomboDetail title="Vegetação:" value={vegetacao?.nome} />
            </Row>
            <Row gutter={8} className={styles.item}>
                <ItemTomboDetail title="Fase sucessional:" value={faseSucessional?.nome} />
                <ItemTomboDetail title="Descrição:" value={descricao} />
            </Row>
            <Divider dashed />
            <Row gutter={8} className={styles.item}>
                <ItemTomboDetail title="Coletores:" value={colectors} />
            </Row>
            <Divider dashed />
            {coordinates ? (
                <MapWithMarker coordinates={coordinates} style={mapStyle} />
            ) : null}
        </div>
    );
};

export default DetailsTomboPage;

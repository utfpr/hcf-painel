import React from 'react';

import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Card, Space } from 'antd';
import { FaUserAlt, FaCalendarDay } from 'react-icons/fa';

import styles from './CardTombo.module.scss';

const { Meta } = Card;

const actions = [
    <EyeOutlined key="visualizar" />,
    <EditOutlined key="edit" />,
    <DeleteOutlined key="setting" />,
];

const CardTombo = ({ tombo }) => {
    const {
        nomePopular, nomeCientifico,
        dataCriacao, coletor, imageUrl,
    } = tombo;
    return (
        <Card
            className={styles.card}
            cover={(
                <img
                    alt="example"
                    src={imageUrl}
                    className={styles.image}
                />
            )}
            actions={actions}
        >
            <Meta
                title={nomeCientifico}
                description={nomePopular}
            />
            <div className={styles.content}>
                <Space>
                    <FaUserAlt />
                    {coletor}
                </Space>
            </div>
            <div>
                <Space>
                    <FaCalendarDay />
                    {dataCriacao}
                </Space>
            </div>
        </Card>
    );
};

export default CardTombo;

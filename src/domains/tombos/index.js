import React from 'react';

import CardTombo from '../../components/CardTombo';
import styles from './TombosPage.module.scss';

const tombos = [
    {
        id: '14905',
        nomePopular: 'Tomate',
        nomeCientifico: 'Solanum lycopersicum',
        dataCriacao: '10/08/2010',
        coletor: 'Marcelo Caxambu',
        imageUrl:
            'https://herbariomfs.uepa.br/wp-content/uploads/tainacan-items/75741/78825/MFS000331_etn_a-1-scaled.jpg',
    },
    {
        id: '14905',
        nomePopular: 'Abacaxi',
        nomeCientifico: 'Solanum lycopersicum',
        dataCriacao: '10/08/2010',
        coletor: 'Marcelo Caxambu',
        imageUrl:
            'https://herbariomfs.uepa.br/wp-content/uploads/tainacan-items/75741/78825/MFS000331_etn_a-1-scaled.jpg',
    },
    {
        id: '14905',
        nomePopular: 'Hortela',
        nomeCientifico: 'Solanum lycopersicum',
        dataCriacao: '10/08/2010',
        coletor: 'Marcelo Caxambu',
        imageUrl:
            'https://herbariomfs.uepa.br/wp-content/uploads/tainacan-items/75741/78825/MFS000331_etn_a-1-scaled.jpg',
    },
    {
        id: '14905',
        nomePopular: 'Capim',
        nomeCientifico: 'Solanum lycopersicum',
        dataCriacao: '10/08/2010',
        coletor: 'Marcelo Caxambu',
        imageUrl:
            'https://herbariomfs.uepa.br/wp-content/uploads/tainacan-items/75741/78825/MFS000331_etn_a-1-scaled.jpg',
    },
    {
        id: '14905',
        nomePopular: 'Tomate',
        nomeCientifico: 'Solanum lycopersicum',
        dataCriacao: '10/08/2010',
        coletor: 'Marcelo Caxambu',
        imageUrl:
            'https://herbariomfs.uepa.br/wp-content/uploads/tainacan-items/75741/78825/MFS000331_etn_a-1-scaled.jpg',
    },
    {
        id: '14905',
        nomePopular: 'Abacaxi',
        nomeCientifico: 'Solanum lycopersicum',
        dataCriacao: '10/08/2010',
        coletor: 'Marcelo Caxambu',
        imageUrl:
            'https://herbariomfs.uepa.br/wp-content/uploads/tainacan-items/75741/78825/MFS000331_etn_a-1-scaled.jpg',
    },
    {
        id: '14905',
        nomePopular: 'Hortela',
        nomeCientifico: 'Solanum lycopersicum',
        dataCriacao: '10/08/2010',
        coletor: 'Marcelo Caxambu',
        imageUrl:
            'https://herbariomfs.uepa.br/wp-content/uploads/tainacan-items/75741/78825/MFS000331_etn_a-1-scaled.jpg',
    },
    {
        id: '14905',
        nomePopular: 'Capim',
        nomeCientifico: 'Solanum lycopersicum',
        dataCriacao: '10/08/2010',
        coletor: 'Marcelo Caxambu',
        imageUrl:
            'https://herbariomfs.uepa.br/wp-content/uploads/tainacan-items/75741/78825/MFS000331_etn_a-1-scaled.jpg',
    },
];

const index = () => {
    return (
        <div className={styles.content}>
            {tombos.map(tombo => {
                return (
                    <CardTombo tombo={tombo} />
                );
            })}
        </div>
    );
};

export default index;

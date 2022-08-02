import { lazy } from 'react';

import { IoMdMap } from 'react-icons/io';

import DetailsTomboPage from '../domains/tombos/DetailsTomboPage';

const TombosListPage = lazy(() => import('../domains/tombos'));
const MapasPage = lazy(() => import('../domains/mapas'));

const routes = [
    {
        path: '/',
        component: TombosListPage,
        menu: {
            text: 'Tombos',
            icon: IoMdMap,
        },
    },
    {
        path: '/tombos/:tomboId',
        component: DetailsTomboPage,
    },
    {
        path: '/mapas',
        component: MapasPage,
        menu: {
            text: 'Mapas',
            icon: IoMdMap,
        },
    },
];

export default routes;

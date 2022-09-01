import { lazy } from 'react';

import { IoMdMap } from 'react-icons/io';

import DashboardPage from '../domains/DashboardPage';
import CreateUpdateTombo from '../domains/tombos/CreateUpdateTombo';
import DetailsTomboPage from '../domains/tombos/DetailsTomboPage';

const TombosListPage = lazy(() => import('../domains/tombos'));
const MapasPage = lazy(() => import('../domains/mapas'));

const routes = [
    {
        path: '/',
        component: DashboardPage,
    },
    {
        path: '/tombos/novo',
        component: CreateUpdateTombo,
    },
    {
        path: '/tombos/:tomboId',
        component: DetailsTomboPage,
    },
    {
        path: '/tombos',
        component: TombosListPage,
        menu: {
            key: 'tombo',
            text: 'Tombos',
            icon: IoMdMap,
        },
    },
    {
        path: '/mapas',
        component: MapasPage,
        menu: {
            key: 'map',
            text: 'Mapas',
            icon: IoMdMap,
        },
    },
];

export default routes;

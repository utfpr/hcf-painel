import { lazy } from 'react';

import { IoMdMap } from 'react-icons/io';

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
        path: '/mapas',
        component: MapasPage,
        menu: {
            text: 'Mapas',
            icon: IoMdMap,
        },
    // permissions: [
    //   {
    //     can: 'create',
    //     an: 'Curso',
    //   },
    // ],
    },
];

export default routes;

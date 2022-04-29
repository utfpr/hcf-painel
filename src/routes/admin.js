import { lazy } from 'react';

import { AiFillFileText } from 'react-icons/ai';
import { IoMdMap } from 'react-icons/io';

const TombosListPage = lazy(() => import('../domains/tombos'));
const MapasPage = lazy(() => import('../domains/mapas'));

const routes = [
    {
        path: '/',
        component: TombosListPage,
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
    {
        path: '/fichas',
        component: MapasPage,
        menu: {
            text: 'Ficha Tombo',
            icon: AiFillFileText,
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

import { lazy } from 'react';

import { FaAccessibleIcon } from 'react-icons/fa';

const CursoListPage = lazy(() => import('../domains/cursos/CursoListPage'));
const CursoCreateUpdatePage = lazy(() => import('../domains/cursos/CursoCreateUpdatePage'));
const UsuarioListPage = lazy(() => import('../domains/cursos/UsuarioListPage'));
const UsuarioCreateUpdatePage = lazy(() => import('../domains/cursos/UsuarioCreateUpdatePage'));

export const USUARIOS_GROUP = {
  group: {
    key: '/usuarios',
    text: 'Usuários',
    icon: FaAccessibleIcon,
  },
  permissions: [
    {
      action: 'menu',
      subject: 'Usuario',
    },
  ],
  routes: [
    {
      path: '/usuarios',
      component: UsuarioListPage,
      menu: {
        text: 'Listar usuários',
        icon: FaAccessibleIcon,
      },
      permissions: [
        {
          action: 'find',
          subject: 'Usuario',
        },
      ],
    },
    {
      path: '/usuarios/criacao',
      component: UsuarioCreateUpdatePage,
      menu: {
        text: 'Listar usuários',
        icon: FaAccessibleIcon,
      },
      permissions: [
        {
          action: 'find',
          subject: 'Usuario',
        },
      ],
    },
    {
      path: '/usuarios/:usuarioId/edicao',
      component: UsuarioCreateUpdatePage,
      menu: {
        text: 'Listar usuários',
        icon: FaAccessibleIcon,
      },
      permissions: [
        {
          action: 'find',
          subject: 'Usuario',
        },
      ],
    },
  ],
};

const routes = [
  USUARIOS_GROUP,
  {
    path: '/cursos',
    component: CursoListPage,
    menu: {
      key: '/cursos',
      group: '/cursos',
      text: 'Listar cursos',
      icon: FaAccessibleIcon,
    },
    permissions: [
      {
        can: 'find',
        an: 'Curso',
      },
    ],
  },
  {
    path: '/cursos/criacao',
    component: CursoCreateUpdatePage,
    menu: {
      group: '/cursos',
      text: 'Cadas',
      icon: FaAccessibleIcon,
    },
    permissions: [
      {
        can: 'create',
        an: 'Curso',
      },
    ],
  },
];

export default routes;

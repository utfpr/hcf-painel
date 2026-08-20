import {
  App, Divider, Space, Table, type TableProps
} from 'antd6'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { HeaderList } from '@/components/HeaderList'
import { useAuth } from '@/contexts/Auth/useAuth'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { UsuarioSearchForm } from './components/UsuarioSearchForm'
import { useUsuariosList } from './hooks/useUsuariosList'
import type { UsuarioRow } from './types'

function getErrorMessage(err: unknown): string | undefined {
  return err instanceof Error ? err.message : undefined
}

export default function ListaUsuariosScreen() {
  const { t } = useTranslation()
  const auth = useAuth()
  const { modal, notification } = App.useApp()
  const list = useUsuariosList()

  const confirmDelete = (id: number) => {
    modal.confirm({
      title: t('listaUsuariosScreen:confirmarExcluirUsuario'),
      content: t('listaUsuariosScreen:descricaoExcluirUsuario'),
      okText: t('common:sim'),
      okType: 'danger',
      cancelText: t('common:nao'),
      onOk: async () => {
        try {
          const deleted = await list.remove(id)
          if (deleted) {
            notification.success({
              message: t('common:excluir'),
              description: t('listaUsuariosScreen:sucessoExcluirUsuario')
            })
          }
        } catch (err) {
          notification.error({
            message: t('listaUsuariosScreen:erroExcluirUsuario'),
            description: getErrorMessage(err)
                ?? t('listaUsuariosScreen:erroInesperadoExcluirUsuario')
          })
        }
      }
    })
  }

  const columns: TableProps<UsuarioRow>['columns'] = [
    {
      title: t('listaUsuariosScreen:colunaNome'),
      dataIndex: 'nome',
      key: 'nome',
      width: 300
    },
    {
      title: t('listaUsuariosScreen:colunaTipo'),
      dataIndex: 'tipo',
      key: 'tipo',
      width: 300
    },
    {
      title: t('listaUsuariosScreen:colunaEmail'),
      dataIndex: 'email',
      key: 'email',
      width: 300
    },
    {
      title: t('listaUsuariosScreen:colunaTelefone'),
      dataIndex: 'telefone',
      key: 'telefone',
      width: 300
    },
    {
      title: t('listaUsuariosScreen:colunaDataCriacao'),
      dataIndex: 'dataCriacao',
      key: 'dataCriacao',
      width: 300
    },
    {
      title: t('listaUsuariosScreen:colunaAcao'),
      key: 'acao',
      width: 100,
      render: (_, row) => (
        <Space>
          <Link to={`/usuarios/${row.key}`}>
            <EditOutlined style={{ color: '#FFCC00' }} />
          </Link>
          <a
            href="#excluir"
            onClick={event => {
              event.preventDefault()
              confirmDelete(row.key)
            }}
          >
            <DeleteOutlined style={{ color: '#e30613' }} />
          </a>
        </Space>
      )
    }
  ]

  return (
    <div>
      <HeaderList
        title={t('listaUsuariosScreen:titulo')}
        addTo="/usuarios/novo"
        canAdd={auth.can('create', 'Usuario')}
      />
      <Divider dashed />
      <UsuarioSearchForm
        total={list.metadados.total}
        onSearch={list.search}
        onClear={list.clear}
      />
      <Divider dashed />
      <Table<UsuarioRow>
        columns={columns}
        dataSource={list.usuarios}
        loading={list.loading}
        scroll={{ x: 800 }}
        pagination={{
          total: list.metadados.total ?? 0,
          current: list.metadados.pagina ?? 1,
          pageSize: list.metadados.limite ?? 20,
          showSizeChanger: true,
          locale: {
            items_per_page: `/ ${t('simpleTableComponent:pagina')}`,
            jump_to: t('simpleTableComponent:irPara'),
            jump_to_confirm: t('simpleTableComponent:irParaConfirmar'),
            page: t('simpleTableComponent:pagina'),
            prev_page: t('simpleTableComponent:paginaAnterior'),
            next_page: t('simpleTableComponent:proximaPagina'),
            prev_5: t('simpleTableComponent:voltar5Paginas'),
            next_5: t('simpleTableComponent:avancar5Paginas'),
            prev_3: t('simpleTableComponent:voltar3Paginas'),
            next_3: t('simpleTableComponent:avancar3Paginas')
          }
        }}
        locale={{
          triggerDesc: t('simpleTableComponent:ordenacaoDecrescente'),
          triggerAsc: t('simpleTableComponent:ordenacaoCrescente'),
          cancelSort: t('simpleTableComponent:cancelarOrdenacao')
        }}
        onChange={pagination => {
          list.changePage(pagination.current ?? 1, pagination.pageSize)
        }}
      />
      <Divider dashed />
    </div>
  )
}

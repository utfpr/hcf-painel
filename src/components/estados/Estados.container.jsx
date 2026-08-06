import React, { useState, useEffect } from 'react'

import { Form, notification, Modal } from 'antd'
import axios from 'axios'

import { isCuradorOuOperador } from '@/helpers/usuarios'
import { withTranslation } from 'react-i18next'
import ListaEstadosComponent from './Estados.component'

const { confirm } = Modal

const ListaEstadosContainer = ({ t }) => {
    const [form] = Form.useForm()
    const [estadosOriginais, setEstadosOriginais] = useState([])
    const [estados, setEstados] = useState([])
    const [metadados, setMetadados] = useState({ total: 0, pagina: 1, limite: 20 })
    const [pagina, setPagina] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [loading, setLoading] = useState(false)
    const [visibleModal, setVisibleModal] = useState(false)
    const [loadingModal, setLoadingModal] = useState(false)
    const [tituloModal, setTituloModal] = useState('Cadastrar')
    const [idEstado, setIdEstado] = useState(-1)
    const [paises, setPaises] = useState([])
    const [estadosFiltrados, setEstadosFiltrados] = useState([])

    const requisitaPaises = async () => {
        try {
            const response = await axios.get('/paises')
            if (response.status === 200 && Array.isArray(response.data)) {
                setPaises(response.data)
            }
        } catch {
            notification.error({
                message: t('common:erro'),
                description: t('estadoContainer:erroBuscarPaises')
            })
        }
    }

    const atualizaPagina = (pg, size, data = estadosOriginais) => {
        const start = (pg - 1) * size
        const end = start + size
        setEstados(data.slice(start, end))
        setMetadados({ total: data.length, pagina: pg, limite: size })
    }

    const requisitaListaEstados = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/estados')
            if (response.status === 200 && Array.isArray(response.data)) {
                const ordenados = response.data.sort((a, b) => a.nome.localeCompare(b.nome))
                setEstadosOriginais(ordenados)
                atualizaPagina(pagina, pageSize, ordenados)
            }
        } catch {
            notification.error({
                message: t('common:erro'),
                description: t('estadoContainer:erroBuscarEstados')
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        requisitaPaises()
        requisitaListaEstados()
    }, [])

    const handleTabelaChange = (page, pageSize) => {
        setPagina(page)
        setPageSize(pageSize)
        const dataAtual = estadosFiltrados.length > 0 ? estadosFiltrados : estadosOriginais
        atualizaPagina(page, pageSize, dataAtual)
    }

    const handleExcluir = id => {
        confirm({
            title: t('estadoContainer:confirmarExcluirEstado'),
            content: t('estadoContainer:descricaoExcluirEstado'),
            okText: t('common:sim'),
            okType: 'danger',
            cancelText: t('common:nao'),
            onOk: () => requisitaExclusao(id)
        })
    }

    const requisitaExclusao = async id => {
        setLoading(true)
        try {
            await axios.delete(`/estados/${id}`)
            const novos = estadosOriginais
                .filter(e => e.id !== id)
                .sort((a, b) => a.nome.localeCompare(b.nome))
            setEstadosOriginais(novos)
            atualizaPagina(pagina, pageSize, novos)
            notification.success({
                message: t('common:tituloSucesso'),
                description: t('estadoContainer:sucessoExcluirEstado')
            })
        } catch (err) {
            const mensagem = err.response?.data?.error?.mensagem || t('estadoContainer:erroExcluirEstado')
            notification.error({
                message: t('common:erro'),
                description: mensagem
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSalvar = async values => {
        setLoadingModal(true)
        try {
            if (idEstado === -1) {
                const resp = await axios.post('/estados', values)
                const novos = [...estadosOriginais, resp.data].sort((a, b) => a.nome.localeCompare(b.nome))
                setEstadosOriginais(novos)
                atualizaPagina(pagina, pageSize, novos)
                notification.success({ message: t('common:tituloSucesso'), description: t('estadoContainer:sucessoCadastroEstado') })
            } else {
                await axios.put(`/estados/${idEstado}`, values)
                const atualizados = estadosOriginais
                    .map(e => (e.id === idEstado ? { ...e, ...values } : e))
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                setEstadosOriginais(atualizados)
                atualizaPagina(pagina, pageSize, atualizados)
                notification.success({ message: t('common:tituloSucesso'), description: t('estadoContainer:sucessoAtualizarEstado') })
            }
            setVisibleModal(false)
            setIdEstado(-1)
        } catch (err) {
            if (err.response?.data?.error?.code === 308) {
                notification.error({
                    message: err.response.data.error.mensagem || t('estadoContainer:estadoJaCadastrado'),
                })
            } else {
                notification.warning({
                    message: t('common:tituloFalha'),
                    description: t('estadoContainer:erroSalvarEstado')
                })
            }
        } finally {
            setLoadingModal(false)
        }
    }

    const handleAbrirModal = (estado = null) => {
        if (estado) {
            setVisibleModal(true)
            setTituloModal(t('common:atualizar'))
            setIdEstado(estado.id)
            form.setFieldsValue({
                nomeEstado: estado.nome,
                ufEstado: estado.sigla,
                codigoTelefone: estado.codigo_telefone,
                paisId: estado.pais_id
            })
        } else {
            form.resetFields()
            setVisibleModal(true)
            setTituloModal(t('common:cadastrar'))
            setIdEstado(-1)
        }
    }

    const handleFecharModal = () => {
        setVisibleModal(false)
        setIdEstado(-1)
    }

    const handleBusca = valores => {
        let filtrados = estadosOriginais
        if (valores.nome) {
            filtrados = filtrados.filter(e => e.nome.toLowerCase().includes(valores.nome.toLowerCase()))
        }
        if (valores.paisId) {
            filtrados = filtrados.filter(e => e.pais_id === parseInt(valores.paisId))
        }

        setEstadosFiltrados(filtrados)
        setPagina(1)
        atualizaPagina(1, pageSize, filtrados)
    }

    const handleLimparBusca = () => {
        form.resetFields()
        setPagina(1)
        setEstadosFiltrados([])
        atualizaPagina(1, pageSize, estadosOriginais)
    }

    return (
        <ListaEstadosComponent
            form={form}
            paises={paises}
            estados={estados}
            metadados={metadados}
            loading={loading}
            visibleModal={visibleModal}
            loadingModal={loadingModal}
            tituloModal={tituloModal}
            idEstado={idEstado}
            onBusca={handleBusca}
            onLimparBusca={handleLimparBusca}
            onTabelaChange={handleTabelaChange}
            onExcluir={handleExcluir}
            onAbrirModal={handleAbrirModal}
            onFecharModal={handleFecharModal}
            onSalvar={handleSalvar}
            isCuradorOuOperador={isCuradorOuOperador()}
        />
    )
}

export default withTranslation()(ListaEstadosContainer)

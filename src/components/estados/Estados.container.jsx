import React, { useState, useEffect } from 'react';
import { Form, notification, Modal } from 'antd';
import axios from 'axios';
import { isCuradorOuOperador } from '@/helpers/usuarios';
import ListaEstadosComponent from './Estados.component';

const { confirm } = Modal;

const ListaEstadosContainer = () => {
    const [form] = Form.useForm();
    const [estadosOriginais, setEstadosOriginais] = useState([]);
    const [estados, setEstados] = useState([]);
    const [metadados, setMetadados] = useState({ total: 0, pagina: 1, limite: 20 });
    const [pagina, setPagina] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [loading, setLoading] = useState(false);
    const [visibleModal, setVisibleModal] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [tituloModal, setTituloModal] = useState('Cadastrar');
    const [idEstado, setIdEstado] = useState(-1);
    const [paises, setPaises] = useState([]);

    const requisitaPaises = async () => {
        try {
            const response = await axios.get('/paises');
            if (response.status === 200 && Array.isArray(response.data)) {
                setPaises(response.data);
            }
        } catch {
            notification.error({
                message: 'Erro',
                description: 'Falha ao buscar países.',
            });
        }
    };

    const atualizaPagina = (pg, size, data = estadosOriginais) => {
        const start = (pg - 1) * size;
        const end = start + size;
        setEstados(data.slice(start, end));
        setMetadados({ total: data.length, pagina: pg, limite: size });
    };

    const requisitaListaEstados = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/estados');
            if (response.status === 200 && Array.isArray(response.data)) {
                setEstadosOriginais(response.data);
                atualizaPagina(pagina, pageSize, response.data);
            }
        } catch {
            notification.error({
                message: 'Erro',
                description: 'Falha ao buscar estados.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        requisitaPaises();
        requisitaListaEstados();
    }, []);

    const handleTabelaChange = (page, pageSize, sorter) => {
        setPagina(page);
        setPageSize(pageSize);
        atualizaPagina(page, pageSize);
    };

    const handleExcluir = (id) => {
        confirm({
            title: 'Você tem certeza que deseja excluir este estado?',
            content: 'Ao clicar em SIM, o estado será excluído.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk: () => requisitaExclusao(id),
        });
    };

    const requisitaExclusao = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/estados/${id}`);
            const novos = estadosOriginais.filter(e => e.id !== id);
            setEstadosOriginais(novos);
            atualizaPagina(pagina, pageSize, novos);
            notification.success({
                message: 'Sucesso',
                description: 'O estado foi excluído com sucesso.',
            });
        } catch (err) {
            console.log(err.response.data.error.mensagem)
            const mensagem = err.response?.data?.error?.mensagem || 'Falha ao excluir o estado.';
            notification.error({
                message: 'Erro',
                description: mensagem,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSalvar = async (values) => {
        setLoadingModal(true);
        try {
            if (idEstado === -1) {
                const resp = await axios.post('/estados', values);
                const novos = [...estadosOriginais, resp.data];
                setEstadosOriginais(novos);
                atualizaPagina(pagina, pageSize, novos);
                notification.success({ message: 'Sucesso', description: 'Estado cadastrado com sucesso.' });
            } else {
                await axios.put(`/estados/${idEstado}`, values);
                const atualizados = estadosOriginais.map(e => e.id === idEstado ? { ...e, ...values } : e);
                setEstadosOriginais(atualizados);
                atualizaPagina(pagina, pageSize, atualizados);
                notification.success({ message: 'Sucesso', description: 'Estado atualizado com sucesso.' });
            }
            setVisibleModal(false);
            setIdEstado(-1);
        } catch (err) {
            if (err.response?.data?.error?.code === 308) {
                notification.error({
                    message: err.response.data.error.mensagem || "Nome, sigla ou DDD do estado já está cadastrado.",
                });
            } else {
                notification.warning({
                    message: 'Falha',
                    description: 'Houve um problema ao salvar o estado.',
                });
            }
        } finally {
            setLoadingModal(false);
        }
    };

    const handleAbrirModal = (estado = null) => {
        if (estado) {
            setVisibleModal(true);
            setTituloModal('Atualizar');
            setIdEstado(estado.id);
            form.setFieldsValue({
                nomeEstado: estado.nome,
                ufEstado: estado.sigla,
                codigoTelefone: estado.codigo_telefone,
                paisId: estado.pais_id,
            });
        } else {
            form.resetFields();
            setVisibleModal(true);
            setTituloModal('Cadastrar');
            setIdEstado(-1);
        }
    };

    const handleFecharModal = () => {
        setVisibleModal(false);
        setIdEstado(-1);
    };

    const handleBusca = (valores) => {
        const filtrados = estadosOriginais.filter(e =>
            !valores.nome || e.nome.toLowerCase().includes(valores.nome.toLowerCase())
        );
        setPagina(1);
        atualizaPagina(1, pageSize, filtrados);
    };

    const handleLimparBusca = () => {
        form.resetFields();
        setPagina(1);
        atualizaPagina(1, pageSize, estadosOriginais);
    };

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
    );
};

export default ListaEstadosContainer;

import React, { useState, useEffect } from 'react';
import { Form, notification, Modal } from 'antd';
import axios from 'axios';
import { isCuradorOuOperador } from '@/helpers/usuarios';
import CidadesComponent from './Cidade.component';

const { confirm } = Modal;

const CidadesContainer = () => {
  const [form] = Form.useForm();
  const [cidadesOriginais, setCidadesOriginais] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [metadados, setMetadados] = useState({ total: 0, pagina: 1, limite: 20 });
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [tituloModal, setTituloModal] = useState('Cadastrar');
  const [idCidade, setIdCidade] = useState(-1);

  const atualizaPagina = (pg, size, data = cidadesOriginais) => {
    const start = (pg - 1) * size;
    const end = start + size;
    setCidades(data.slice(start, end));
    setMetadados({ total: data.length, pagina: pg, limite: size });
  };

  const requisitaListaCidades = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/cidades');
      if (response.status === 200 && Array.isArray(response.data)) {
        setCidadesOriginais(response.data);
        atualizaPagina(pagina, pageSize, response.data);
      }
    } catch {
      notification.error({ message: 'Erro', description: 'Falha ao buscar cidades.' });
    } finally {
      setLoading(false);
    }
  };

  const requisitaListaEstados = async () => {
    try {
      const response = await axios.get('/estados');
      if (response.status === 200 && Array.isArray(response.data)) {
        setEstados(response.data);
      }
    } catch {
      notification.error({ message: 'Erro', description: 'Falha ao buscar estados.' });
    }
  };

  useEffect(() => {
    requisitaListaCidades();
    requisitaListaEstados();
  }, []);

  const handleTabelaChange = (page, pageSize) => {
    setPagina(page);
    setPageSize(pageSize);
    atualizaPagina(page, pageSize);
  };

  const handleExcluir = (id) => {
    confirm({
      title: 'Você tem certeza que deseja excluir esta cidade?',
      content: 'Ao clicar em SIM, a cidade será excluída.',
      okText: 'SIM',
      okType: 'danger',
      cancelText: 'NÃO',
      onOk: () => requisitaExclusao(id),
    });
  };

  const requisitaExclusao = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/cidades/${id}`);
      const novas = cidadesOriginais.filter(c => c.id !== id);
      setCidadesOriginais(novas);
      atualizaPagina(pagina, pageSize, novas);
      notification.success({ message: 'Sucesso', description: 'Cidade excluída com sucesso.' });
    } catch (err) {
      const mensagem = err.response?.data?.error?.mensagem || 'Falha ao excluir a cidade.';
      notification.error({ message: 'Erro', description: mensagem });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (values) => {
    setLoadingModal(true);
    try {
      if (idCidade === -1) {
        const resp = await axios.post('/cidades', values);
        const novas = [...cidadesOriginais, resp.data];
        setCidadesOriginais(novas);
        atualizaPagina(pagina, pageSize, novas);
        notification.success({ message: 'Sucesso', description: 'Cidade cadastrada com sucesso.' });
      } else {
        await axios.put(`/cidades/${idCidade}`, values);
        const atualizadas = cidadesOriginais.map(c => c.id === idCidade ? { ...c, ...values } : c);
        setCidadesOriginais(atualizadas);
        atualizaPagina(pagina, pageSize, atualizadas);
        notification.success({ message: 'Sucesso', description: 'Cidade atualizada com sucesso.' });
      }
      setVisibleModal(false);
      setIdCidade(-1);
    } catch (err) {
      if (err.response?.data?.error?.code === 308) {
        notification.error({
          message: 'Cidade já cadastrada',
          description: err.response.data.error.mensagem,
        });
      } else {
        notification.warning({ message: 'Falha', description: 'Houve um problema ao salvar a cidade.' });
      }
    } finally {
      setLoadingModal(false);
    }
  };

  const handleAbrirModal = (cidade = null) => {
    if (cidade) {
      setVisibleModal(true);
      setTituloModal('Atualizar');
      setIdCidade(cidade.id);
      form.setFieldsValue({
        nomeCidade: cidade.nome,
        estadoId: cidade.estado.nome,
        latitude: cidade.latitude,
        longitude: cidade.longitude,
      });
    } else {
      form.resetFields();
      setVisibleModal(true);
      setTituloModal('Cadastrar');
      setIdCidade(-1);
    }
  };

  const handleFecharModal = () => {
    setVisibleModal(false);
    setIdCidade(-1);
  };

  const handleBusca = (valores) => {
    const filtradas = cidadesOriginais.filter(c =>
      !valores.nome || c.nome.toLowerCase().includes(valores.nome.toLowerCase())
    );
    setPagina(1);
    atualizaPagina(1, pageSize, filtradas);
  };

  const handleLimparBusca = () => {
    form.resetFields();
    setPagina(1);
    atualizaPagina(1, pageSize, cidadesOriginais);
  };

  return (
    <CidadesComponent
      form={form}
      cidades={cidades}
      estados={estados}
      metadados={metadados}
      loading={loading}
      visibleModal={visibleModal}
      loadingModal={loadingModal}
      tituloModal={tituloModal}
      idCidade={idCidade}
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

export default CidadesContainer;

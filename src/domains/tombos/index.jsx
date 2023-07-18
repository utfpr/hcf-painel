/* eslint-disable react-perf/jsx-no-new-array-as-prop */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-unused-vars */
import React, { useCallback, useState } from 'react'

import {
  Button,
  Col, Collapse, Row, Spin
} from 'antd'
import { useNavigate } from 'react-router-dom'

import { CaretRightOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'

import CardTombo from '../../components/CardTombo'
import Input from '../../components/Input'
import { wrapForm } from '../../helpers/form-helper'
import useAsync from '../../hooks/use-async'
import useDidMount from '../../hooks/use-did-mount'
import useScroll from '../../hooks/use-scroll'
import { getTombos } from '../../services/tombo-service'
import styles from './TombosPage.module.scss'

const { Panel } = Collapse

const TombosPage = ({ form, handleSubmit }) => {
  const [tombos, setTombos] = useState([])
  const [metadata, setMetadata] = useState({
    page: 1
  })
  const scrollInfo = useScroll()
  const [currentPage, setCurrentPage] = useState(1)
  const { watch, reset } = form
  const navigate = useNavigate()

  const [loading, requestTombos] = useAsync(async (page, filters) => {
    const data = await getTombos(page, 20, filters)
    if (data) {
      setMetadata(data.metadata)
      setCurrentPage(data.metadata.page)
      if (data.metadata.page === 1) {
        setTombos(data.records)
        return
      }
      setTombos([
        ...tombos,
        ...data.records
      ])
    }
  })

  useDidMount(() => {
    requestTombos(currentPage)
      .catch(console.warn)
    handleSubmit(requestTombos)
  })

  const onChangePage = nextPage => {
    if (currentPage !== nextPage) {
      setCurrentPage(nextPage)
      requestTombos(nextPage)
        .catch(console.warn)
    }
  }

  const renderLoading = () => {
    if (scrollInfo.hasScrolled) {
      if (scrollInfo.percentage === 100) {
        const nextPage = metadata.page + 1
        const totalPage = Math.ceil(metadata.total / metadata.limit)

        if (nextPage <= totalPage) {
          onChangePage(nextPage)
        }
      }
    }

    if (loading) {
      return (
        <div className={styles.loading}>
          <Spin tip="Loading..." />
        </div>
      )
    }

    return null
  }

  const onClickFilter = useCallback(() => {
    const hcf = watch('hcf')
    const nomesPopulares = watch('nomes_populares')
    const nomeCientifico = watch('nome_cientifico')
    const localColeta = watch('local_coleta')
    const filters = {
      hcf, nomesPopulares, nomeCientifico, localColeta
    }
    setCurrentPage(1)
    requestTombos(1, filters)
      .catch(console.warn)
  }, [requestTombos, watch])

  const onClickClean = useCallback(() => {
    reset()
    setCurrentPage(1)
    requestTombos(1, null)
      .catch(console.warn)
  }, [requestTombos, reset])

  const onClickViewTombo = useCallback(tomboId => {
    navigate(`${tomboId}`)
  }, [navigate])

  const renderFilters = () => {
    return (
      <Collapse
        bordered={false}
        defaultActiveKey={['1']}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        className="site-collapse-custom-collapse"
      >
        <Panel header="Filtros" key="1" className="site-collapse-custom-panel">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input
                size="large"
                name="hcf"
                placeholder="HCF"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Input
                size="large"
                name="nomes_populares"
                placeholder="Nome Popular"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Input
                size="large"
                name="nome_cientifico"
                placeholder="Nome Científico"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Input
                size="large"
                name="local_coleta"
                placeholder="Local coleta"
              />
            </Col>
          </Row>
          <Row justify="end">
            <Button
              onClick={onClickClean}
              icon={<DeleteOutlined />}
            >
              Limpar
            </Button>
            <Button
              onClick={handleSubmit(onClickFilter)}
              type="primary"
              icon={<SearchOutlined />}
            >
              Buscar
            </Button>
          </Row>
        </Panel>
      </Collapse>
    )
  }

  const onClickNewTombo = useCallback(() => {
    navigate('novo')
  }, [navigate])

  return (
    <div className={styles.content}>
      <div className={styles.newTombo}>
        <Button
          size="large"
          type="primary"
          onClick={onClickNewTombo}
        >
          Novo tombo
        </Button>
      </div>
      <div className={styles.filters}>
        {renderFilters()}
      </div>
      <div className={styles.tombos}>
        {tombos?.map(tombo => {
          return (
            <CardTombo
              tombo={tombo}
              onClickViewTombo={onClickViewTombo}
              size="large"
            />
          )
        })}
        {renderLoading()}
      </div>
    </div>
  )
}

export default wrapForm(TombosPage)

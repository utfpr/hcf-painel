import React, { useMemo } from 'react'

import { Col, Input, Row } from 'antd'
import { useFormContext } from 'react-hook-form'

import requestEspecies from '../../../components/SearchSelect/requests/especies'
import requestFamilias from '../../../components/SearchSelect/requests/familias'
import requestGeneros from '../../../components/SearchSelect/requests/generos'
import requestSubespecies from '../../../components/SearchSelect/requests/subespecies'
import requestSubfamilias from '../../../components/SearchSelect/requests/subfamilias'
import { SearchSelectField } from '../../../components/SearchSelect/SearchSelect'

const Taxonomy = () => {
  const { watch } = useFormContext()
  const familiaSelected = watch('familia')
  const generoSelected = watch('genero')
  const especieSelected = watch('especie')

  const familiaRequestParams = useMemo(() => ({
    familiaId: familiaSelected?.value
  }), [familiaSelected])

  const especieRequestParams = useMemo(() => ({
    familiaId: familiaSelected?.value,
    generoId: generoSelected?.value
  }), [familiaSelected, generoSelected])

  const subespecieRequestParams = useMemo(() => ({
    familiaId: familiaSelected?.value,
    generoId: generoSelected?.value,
    especieId: especieSelected?.value
  }), [familiaSelected, generoSelected, especieSelected])

  const shouldDisableSubespecie = !familiaSelected || !especieSelected

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <SearchSelectField
            label="Família"
            name="familia"
            request={requestFamilias}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <SearchSelectField
            label="Subfamília"
            name="subfamilia"
            request={requestSubfamilias}
            requestParams={familiaRequestParams}
            disabled={!familiaSelected}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <SearchSelectField
            label="Gênero"
            name="genero"
            request={requestGeneros}
            requestParams={familiaRequestParams}
            disabled={!familiaSelected}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <SearchSelectField
            label="Espécie"
            name="especie"
            request={requestEspecies}
            requestParams={especieRequestParams}
            disabled={!familiaSelected}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <SearchSelectField
            label="Subespécie"
            name="subespecie"
            request={requestSubespecies}
            requestParams={subespecieRequestParams}
            disabled={shouldDisableSubespecie}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <SearchSelectField
            label="Subespécie"
            name="subespecie"
            request={requestSubespecies}
            requestParams={subespecieRequestParams}
            disabled={shouldDisableSubespecie}
          />
          <Input
            name="variedade"
            label="Variedade"
          />
        </Col>
      </Row>
    </>
  )
}

export default Taxonomy

import axios from 'axios'

const catchError = error => {
    const { response } = error
    if (response.status === 400) {
        throw new Error(response.data.error.message)
    }
    if (response && response.data) {
        const { error } = response.data
        console.error(error.message)
    }
    window.location.reload()
    throw new Error('')
}

export const excluirFotoTomboService = (getResponse, codBarras) => {
    return axios.delete(`/tombos/codBarras/${codBarras}`)
        .then(response => {
            if (response.status === 204) {
                window.location.reload()
            }
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const atualizarFotoTomboService = (getResponse, foto, tomboCodBar) => {
    const form = new FormData()
    form.append('imagem', foto)
    form.append('tombo_codBarr', tomboCodBar)

    return axios.post('/uploads/atualizaImagem', form, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        window.location.reload()
        getResponse(response)
    })
        .catch(error => {
            catchError(error)
        })
}

export const criaCodigoBarrasSemFotosService = (getResponse, emVivo, numeroHcf) => {
    const form = new FormData()
    form.append('tombo_hcf', numeroHcf)
    form.append('em_vivo', emVivo)

    return axios.post('/uploads/criaCodigoSemFoto', form, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        window.location.reload()
        getResponse(response)
    })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaDadosEdicaoService = (getResponse, id) => {
    return axios.get(`/tombos/${id}`)
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaDadosFormularioService = getResponse => {
    return axios.get('/tombos/dados')
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaIdentificadoresPredicaoService = getResponse => {
    return axios.get('/identificadores-predicao?nome=')
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const verificaPendenciasService = (getResponse, tomboId) => {
    return axios.get(`/pendencias/TomboId/${tomboId}`)
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaCodigoBarrasService = (getResponse, tomboId) => {
    return axios.get(`/tombos/codigo_barras/${tomboId}`)
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const handleSubmitIdentificadorService = (getResponse, tomboId, json) => {
    return axios.put(`/tombos/${tomboId}`, json)
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaEdicaoTomboService = (getResponse, tomboId, json) => {
    return axios.put(`/tombos/${tomboId}`, { json })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaCadastroTomboService = (getResponse, json) => {
    return axios.post('/tombos', { json })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaNumeroHcfService = getResponse => {
    return axios.get('/tombos/filtrar_ultimo_numero')
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaEstadosService = (getResponse, id) => {
    return axios.get('/estados', {
        params: {
            pais_id: id
        }
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaCidadesService = (getResponse, id) => {
    return axios.get('/cidades', {
        params: {
            id
        }
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovoTipoService = (getResponse, nome) => {
    return axios.post('/tipos', {
        nome
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaTiposService = getResponse => {
    return axios.get('/tipos')
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovaFamiliaService = (getResponse, nome) => {
    return axios.post('/familias', {
        nome
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaFamiliasService = getResponse => {
    return axios.get('/familias', {
        params: {
            limite: 9999999999
        }
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovaSubfamiliaService = (getResponse, nome, familiaId) => {
    return axios.post('/subfamilias', {
        nome,
        familia_id: familiaId
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaSubfamilias = (getResponse, id) => {
    return axios.get('/subfamilias', {
        params: {
            familia_id: id,
            limite: 999999999
        }
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovoGeneroService = (getResponse, nome, familiaId) => {
    return axios.post('/generos', {
        nome,
        familia_id: familiaId
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaGenerosService = (getResponse, familiaId) => {
    return axios.get('/generos', {
        params: {
            familia_id: familiaId,
            limite: 9999999999
        }
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovaEspecie = (getResponse, nome, familiaId, generoId, autorId) => {
    return axios.post('/especies', {
        nome,
        familia_id: familiaId,
        genero_id: generoId,
        autor_id: autorId
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaEspeciesService = (getResponse, nome, familiaId, generoId, autorId) => {
    return axios.post('/especies', {
        nome,
        familia_id: familiaId,
        genero_id: generoId,
        autor_id: autorId
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovaSubespecieService = (getResponse, nome, familiaId, generoId, especieId, autorId) => {
    return axios.post('/subespecies', {
        nome,
        familia_id: familiaId,
        genero_id: generoId,
        especie_id: especieId,
        autor_id: autorId
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaSubespeciesService = (getResponse, id) => {
    return axios.get('/subespecies', {
        params: {
            especie_id: id,
            limite: 999999999
        }
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovaVariedadeService = (getResponse, nome, familiaId, generoId, especieId, autorId) => {
    return axios.post('/variedades', {
        nome,
        familia_id: familiaId,
        genero_id: generoId,
        especie_id: especieId,
        autor_id: autorId
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaVariedadesService = (getResponse, id) => {
    return axios.get('/variedades', {
        params: {
            especie_id: id,
            limite: 999999999
        }
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovoAutorService = (getResponse, nome) => {
    return axios.post('/autores', {
        nome,
        iniciais: ''
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaAutoresService = getResponse => {
    return axios.get('/autores')
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovoSoloService = (getResponse, nome) => {
    return axios.post('/solos', {
        nome
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaSolosService = getResponse => {
    return axios.get('/solos')
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovoRelevoService = (getResponse, nome) => {
    return axios.post('/relevos', {
        nome
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaRelevosService = getResponse => {
    return axios.get('/relevos')
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovaVegetacaoService = (getResponse, nome) => {
    return axios.post('/vegetacoes', {
        nome
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaVegetacoesService = getResponse => {
    return axios.get('/vegetacoes')
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const cadastraNovoColetorService = (getResponse, nome, email, numero) => {
    return axios.post('/coletores', {
        nome,
        email,
        numero
    })
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaColetoresService = (getResponse, nome) => {
    return axios.get(`/coletores-predicao?nome=${nome}`)
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

export const requisitaIdentificadoresService = (getResponse, nome) => {
    return axios.get(`/identificadores-predicao?nome=${nome}`)
        .then(response => {
            getResponse(response)
        })
        .catch(error => {
            catchError(error)
        })
}

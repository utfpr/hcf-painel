import React, { useState, useEffect } from 'react'

import { Pagination } from 'antd'
import axios from 'axios'

import { PlusCircleTwoTone, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons'
import 'antd/dist/antd.css'

const PopupContentCity = ({ cidade }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState({
        points: [], totalPages: 0, totalPoints: 0, currentPage: 1
    })
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        if (cidade && mounted) {
            fetchPoints(1, '')
        }
    }, [cidade, mounted])

    const fetchPoints = async (pagina, search) => {
        setIsLoading(true)
        const limite = 5
        try {
            const response = await axios.get('http://localhost:3000/api/pontos/', {
                params: {
                    cidade,
                    limite,
                    pagina,
                    search
                }
            })
            const {
                points, totalPages, totalPoints, currentPage
            } = response.data
            setResults({
                points,
                totalPages,
                totalPoints,
                currentPage
            })
        } catch (error) {
            console.error('Erro ao buscar pontos:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const clearSearch = event => {
        event.stopPropagation()
        setSearchTerm('')
        fetchPoints(1, '')
    }

    const handleInputChange = e => {
        const { value } = e.target
        if (/^\d*$/.test(value)) {
            setSearchTerm(value)
        }
    }

    const handleKeyDown = e => {
        if (e.key === 'Enter') {
            fetchPoints(1, searchTerm)
        }
    }

    const itemRender = (current, type) => {
        if (type === 'prev') return <a>&lt;</a>
        if (type === 'next') return <a>&gt;</a>
        if (type === 'page') {
            return (
                <a
                    style={
                        current === results.currentPage
                            ? { backgroundColor: '#1890ff', color: '#fff', borderRadius: '4px' }
                            : {}
                    }
                >
                    {current}
                </a>
            )
        }
        return null
    }

    return (
        <div className="custom-popup">
            <style>
                {`
                .custom-popup .result-item {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 5px;
                }
                .custom-popup .hcf-number {
                    margin-right: 8px;
                }
                .custom-popup .result-item strong {
                    white-space: nowrap;
                }
                .custom-popup .button-container {
                    display: flex;
                    align-items: center;
                }
                .custom-popup input:focus {
                    border-color: #1D54BF !important;
                    outline: none;
                }
            `}
            </style>
            <div style={{
                display: 'flex', alignItems: 'center', marginBottom: '10px', marginTop: '4px', justifyContent: 'center'
            }}
            >
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Pesquisar HCF..."
                    maxLength={10}
                    style={{
                        width: '200px', marginRight: '8px', marginTop: '8px', borderRadius: '8px', padding: '5px 10px', border: '1px solid #ccc'
                    }}
                />
                {searchTerm && (
                    <CloseCircleOutlined
                        onClick={clearSearch}
                        style={{
                            cursor: 'pointer', color: 'red', marginRight: '8px', fontSize: '13px'
                        }}
                    />
                )}
                <SearchOutlined
                    onClick={() => !isLoading && fetchPoints(1, searchTerm)}
                    style={{ cursor: isLoading ? 'not-allowed' : 'pointer', color: '#1D54BF', fontSize: '15px' }}
                />
            </div>
            <div id="results">
                {results.points.map(point => (
                    <div className="result-item" key={point.hcf}>
                        <div className="button-container">
                            <strong className="hcf-number">
                                HCF:
                                {' '}
                                {point.hcf}
                            </strong>

                            <button
                                type="button"
                                onClick={() => window.open(`/tombos/detalhes/${point.hcf}`, '_blank')}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginLeft: '8px'
                                }}
                            >
                                <PlusCircleTwoTone twoToneColor="#008000" style={{ fontSize: '24px' }} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <Pagination
                    current={results.currentPage} // Usando results.currentPage
                    total={results.totalPoints} // Total de pontos
                    pageSize={5} // Limite de pontos por página
                    onChange={page => !isLoading && fetchPoints(page, searchTerm)}
                    disabled={isLoading}
                    showSizeChanger={false}
                    itemRender={itemRender}
                    simple
                />
            </div>
        </div>
    )
}

export default PopupContentCity

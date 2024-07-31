import React, { useState, useEffect } from 'react'

import { Pagination } from 'antd'
import axios from 'axios'

import { PlusCircleTwoTone, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons'
import 'antd/dist/antd.css'

const PopupContentCity = ({ cidade }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState({ points: [], totalPages: 0 })
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (cidade && mounted) {
            fetchPoints(cidade, 1, '')
        }
    }, [cidade, mounted])

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    const fetchPoints = async (cidade, page, search) => {
        setIsLoading(true)
        const limit = 5
        const response = await axios.get(`http://localhost:3000/api/pontos/?cidade=${cidade}&limite=${limit}&page=${page}&search=${search}`)
        const { data } = response
        setResults({
            points: data.points,
            totalPages: data.totalPages
        })
        setCurrentPage(page)
        setIsLoading(false)
    }

    const clearSearch = event => {
        event.stopPropagation()
        setSearchTerm('')
        fetchPoints(cidade, 1, '')
    }

    const handleInputChange = e => {
        const { value } = e.target
        if (/^\d*$/.test(value)) {
            setSearchTerm(value)
        }
    }

    const itemRender = (current, type, originalElement) => {
        if (type === 'prev') {
            return <a>&lt;</a>
        }
        if (type === 'next') {
            return <a>&gt;</a>
        }
        if (type === 'page' && (current === 1 || current === results.totalPages)) {
            return <a>{current}</a>
        }
        if (type === 'page' && current === currentPage) {
            return <a style={{ backgroundColor: '#1890ff', color: '#fff', borderRadius: '4px' }}>{current}</a>
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
                    onClick={() => !isLoading && fetchPoints(cidade, 1, searchTerm)}
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
                                <span style={{ color: '#008000', fontSize: '24px' }}>
                                    <PlusCircleTwoTone twoToneColor="#008000" />
                                </span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <Pagination
                    current={currentPage}
                    total={results.totalPages * 10}
                    onChange={page => !isLoading && fetchPoints(cidade, page, searchTerm)}
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

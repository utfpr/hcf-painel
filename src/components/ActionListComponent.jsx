import React from 'react';

import { SearchOutlined, EditFilled, DeleteFilled } from '@ant-design/icons'

import { isCuradorOuOperador, isIdentificador } from '../helpers/usuarios';

const ActionListComponent = ({ hcf, onClickDelete, pathOnSearch, pathOnEdit }) => {
    const editStyle = { color: "#FFCC00" }
    const deleteStyle = { color: "#e30613" }

    const onDelete = () => {
        onClickDelete(hcf)
    }

    const renderExcluir = () => {
        return (
            <span>
                <Divider type="vertical" />
                <a href="#" onClick={onDelete}>
                    <DeleteFilled style={deleteStyle} />
                </a>
            </span>
        )
    }

    const renderEditar = () => {
        return (
            <span>
                <Divider type="vertical" />
                <Link to={pathOnEdit}>
                    <EditFilled style={editStyle} />
                </Link>
            </span>
        )
    }

    const renderDetalhes = () => {
        return (
            <Link to={pathOnSearch}>
                <SearchOutlined />
            </Link>
        )
    }

    const gerarAcao = () => {
        if (isCuradorOuOperador()) {
            return [
                renderDetalhes(),
                renderEditar(),
                renderExcluir()
            ];
        } if (isIdentificador()) {
            return [
                renderDetalhes(),
                renderEditar(),
            ]
        } else {
            return renderDetalhes()
        }
    }

    return gerarAcao()
}

export default ActionListComponent;

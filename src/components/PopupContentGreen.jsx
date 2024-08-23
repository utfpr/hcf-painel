import React from 'react'

import { PlusCircleTwoTone } from '@ant-design/icons'

const PopupContentGreen = ({ hcf }) => {
    const handleClick = () => {
        window.open(`/tombos/detalhes/${hcf}`, '_blank')
    }

    return (
        <div className="custom-popup">
            <strong>
                HCF:
                {` ${hcf}`}
            </strong>
            <br />
            <button
                type="button"
                onClick={handleClick}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto'
                }}
            >
                <PlusCircleTwoTone twoToneColor="#008000" style={{ fontSize: '24px' }} />
            </button>
        </div>
    )
}

export default PopupContentGreen

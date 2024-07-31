import React from 'react'

import { PlusCircleTwoTone } from '@ant-design/icons'

const PopupContentGreen = ({ hcf }) => {
    return (
        <div className="custom-popup">
            <strong>
                HCF:
                {' '}
                {hcf}
            </strong>
            <br />
            <button
                type="button"
                onClick={() => window.open(`/tombos/detalhes/${hcf}`, '_blank')}
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
                <span style={{ color: '#008000', fontSize: '24px' }}>
                    <PlusCircleTwoTone twoToneColor="#008000" />
                </span>
            </button>
        </div>
    )
}

export default PopupContentGreen

import React from 'react'

import { Row, Col } from 'antd'
import Barcode from 'react-barcode'

export default function GradeDeCartoes({ dados }) {
    return (
        <>
            <style>
                {`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .grid-print {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            page-break-inside: avoid;
          }

          .codigo-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 16px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }

        /* Também aplicável para visualização antes da impressão */
        .grid-print {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .codigo-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 16px;
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .printable, .printable * {
            visibility: visible;
          }

          .printable {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `}
            </style>

            <div className="grid-print printable">
                {dados.map(item => (
                    <div key={item.id} className="codigo-item">
                        <strong>{item.id}</strong>
                        <Barcode value={item.codigobarras} />
                        <span>{item.codigobarras}</span>
                    </div>
                ))}
            </div>
        </>
    )
}

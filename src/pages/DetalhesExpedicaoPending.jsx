import { Alert, Button } from 'antd'
import { Link, useParams } from 'react-router'

export default function DetalhesExpedicaoPending() {
    const { id } = useParams()
    return (
        <div>
            <h2>
                Expedição
                {id}
            </h2>
            <Alert type="info" showIcon message="A tela de detalhes da expedição ainda não foi implementada." />
            <Button style={{ marginTop: 16 }}><Link to="/expedicoes">Voltar à listagem</Link></Button>
        </div>
    )
}

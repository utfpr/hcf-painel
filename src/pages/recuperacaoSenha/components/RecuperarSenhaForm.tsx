import { useState } from 'react'

import {
    Form, Input, Button, Typography, message
} from 'antd'

const { Title, Paragraph, Text } = Typography

type Props = { onSuccess?: () => void }
type CatchError = { message: string }

export default function RecuperarSenhaForm({ onSuccess }: Props) {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleFinish = async (values: { email: string }) => {
        setLoading(true)
        try {
            // Colocar chamada para API aqui
            await message.success('Se existir uma conta com este e-mail, enviamos instruções de recuperação.')
            onSuccess?.()
            form.resetFields()
        } catch (e: unknown) {
            await message.warning((e as CatchError).message)
        } finally {
            setLoading(false)
        }
        return values // Somente para tirar warning do linter. Ao terminar a implementação, remover.
    }

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <Title level={3} style={{ marginBottom: 4, textAlign: 'center' }}>Recuperar senha</Title>
            <Paragraph type="secondary" style={{ marginTop: 0, textAlign: 'center' }}>
                Informe seu e-mail para receber um link de redefinição.
            </Paragraph>

            <Form layout="vertical" form={form} onFinish={handleFinish}>
                <Form.Item
                    name="email"
                    label="E-mail"
                    rules={[
                        { required: true, message: 'Informe o e-mail.' },
                        { type: 'email', message: 'E-mail inválido.' }
                    ]}
                >
                    <Input placeholder="seuemail@exemplo.com" autoComplete="email" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Enviar link de recuperação
                    </Button>
                </Form.Item>

                <Text type="secondary" style={{ fontSize: 12 }}>
                    *Por segurança, a resposta é genérica (não revela se o e-mail existe).
                </Text>
            </Form>
        </div>
    )
}

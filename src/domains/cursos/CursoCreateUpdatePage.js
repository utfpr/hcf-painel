/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';

import { Button, Space } from 'antd';
import * as yup from 'yup';

import Input from '../../components/Input';
import { wrapForm } from '../../helpers/form-helper';

const schema = yup.object({
    name: yup.string().email('Deve ser informado um e-mail válido').required('E-mail é obrigatório'),
    password: yup.string().min(8).max(32).required('Senha é obrigatório'),
}).required();

function CursoCreateUpdatePage({ form, onSubmit }) {
    const {
        register,
        handleSubmit,
        watch, setValue,
        formState: { errors },
    } = form;

    const onSubmitForm = data => {
        console.warn('data ', data);
    };

    useEffect(() => {
        onSubmit(onSubmitForm);
    }, [onSubmit]);

    return (
        <div>
            <Space direction="vertical">
                <Input name="name" />
                <Input name="password" type="password" />
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Space>
        </div>
    );
}

// export default wrapForm(CursoCreateUpdatePage);

export default wrapForm(CursoCreateUpdatePage, {
    resolver: schema,
});

import React, {
    memo, useContext, useCallback, useEffect,
} from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from 'antd';
import { FormProvider, useForm } from 'react-hook-form';

const FormSubmitContext = React.createContext({});

/**
 * @callback UseFormSubmitCallback
 * @param {Object.<string, any>} values
 * @param {any} event
 */

/**
 * @typedef {Object} WrapFormOptions
 * @property {import('yup').AnySchema} validationSchema
 */

/**
 * Called when the form submit
 * @param {UseFormSubmitCallback} callback
 */
export const useWhenFormSubmit = callback => {
    const changeOnSubmit = useContext(FormSubmitContext);

    useEffect(() => {
        changeOnSubmit(callback);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

/**
 * Used to wrap a component with form
 * @param {import('react').ElementType} Component
 * @param {WrapFormOptions} options
 * @returns {import('react').ElementType}
 */
export const wrapForm = (Component, options = {}) => {
    const { validationSchema } = options;
    const resolver = validationSchema ? yupResolver(validationSchema) : undefined;
    let onSubmitCallback;

    const ComponentWrapper = memo(() => {
        const form = useForm({ resolver, mode: 'onBlur' });
        const { handleSubmit } = form;

        const onFormSubmit = useCallback(async (...args) => {
            if (onSubmitCallback) {
                return handleSubmit(onSubmitCallback)(...args);
            }
            return {};
        }, [handleSubmit]);

        const handleSubmitWrapper = useCallback(callback => {
            onSubmitCallback = callback;
            return handleSubmit(onSubmitCallback);
        }, [handleSubmit]);

        return (
            <Form layout="vertical">
                <FormProvider {...form}>
                    <form onSubmit={onFormSubmit}>
                        <FormSubmitContext.Provider value={handleSubmitWrapper}>
                            <Component form={form} handleSubmit={handleSubmitWrapper} />
                        </FormSubmitContext.Provider>
                    </form>
                </FormProvider>
            </Form>
        );
    });

    return ComponentWrapper;
};

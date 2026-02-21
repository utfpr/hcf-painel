import { TipoUsuario, Usuario } from '@/@types/components'

import { getCookie } from './cookie'

const storage: { token?: string; usuario?: Usuario } = {
    token: getCookie<string>('Access_Token'),
    usuario: JSON.parse(window.localStorage.getItem('Logged_User') ?? '{}') as Usuario
}

/** @deprecated Use `useAuth` hook with `token` and `user` properties instead */
export default storage

/** @deprecated Use `useAuth` hook with `logIn` method instead */
export const setTokenUsuario = (token: string) => {
    storage.token = token
}

/** @deprecated Use `useAuth` hook with `canAny` method instead */
export const isCuradorOuOperador = () => {
    if (!storage.usuario?.tipo_usuario_id) {
        return false
    }
    return Number(storage.usuario?.tipo_usuario_id) as TipoUsuario === TipoUsuario.Curador
    || Number(storage.usuario?.tipo_usuario_id) as TipoUsuario === TipoUsuario.Operador
}

/** @deprecated Use `useAuth` hook with `canAny` method instead */
export const isCuradorOuOperadorOuIdentificador = () => {
    if (!storage.usuario?.tipo_usuario_id) {
        return false
    }
    return Number(storage.usuario?.tipo_usuario_id) as TipoUsuario === TipoUsuario.Curador
    || Number(storage.usuario?.tipo_usuario_id) as TipoUsuario === TipoUsuario.Operador
    || Number(storage.usuario?.tipo_usuario_id) as TipoUsuario === TipoUsuario.Identificador
}

/** @deprecated Use `useAuth` hook with `can` method instead */
export const isIdentificador = () => {
    if (!storage.usuario?.tipo_usuario_id) {
        return false
    }
    return Number(storage.usuario?.tipo_usuario_id) as TipoUsuario === TipoUsuario.Identificador
}

/** @deprecated Use `useAuth` hook with `logIn` method instead */
export const setUsuario = (usuario: Usuario) => {
    storage.usuario = usuario
}

window.addEventListener('cookie.updated', (event: Event) => {
    if (event instanceof CustomEvent && (event as CustomEvent<{ name: string }>).detail.name === 'Access_Token') {
        storage.token = getCookie<string>('Access_Token')
    }
})
window.addEventListener('local_storage.updated', (event: Event) => {
    if (event instanceof CustomEvent && (event as CustomEvent<{ key: string }>).detail.key === 'Logged_User') {
        storage.usuario = JSON.parse(window.localStorage.getItem('Logged_User') ?? '{}') as Usuario
    }
})

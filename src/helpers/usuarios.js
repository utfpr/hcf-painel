const storage = {
    token: '',
    usuario: {},
};

export default storage;

export const getTokenUsuario = () => storage.token;

export const setTokenUsuario = token => {
    storage.token = token;
};

export const isLogado = () => !(Object.keys(storage.usuario).length < 1);

export const isCurador = () => (storage.usuario.tipo_usuario_id) === 1;

export const isCuradorOuOperador = () => (storage.usuario.tipo_usuario_id) === 1 || (storage.usuario.tipo_usuario_id) === 2;

export const isCuradorOuOperadorOuIdentificador = () => (storage.usuario.tipo_usuario_id) === 1 || (storage.usuario.tipo_usuario_id) === 2 || (storage.usuario.tipo_usuario_id) === 3;

export const isIdentificador = () => (storage.usuario.tipo_usuario_id) === 3;

export const getUsuario = () => storage.usuario;

export const setUsuario = usuario => {
    storage.usuario = usuario;
};

const {
    REACT_APP_API_URL = 'http://localhost:3003',
} = process.env;

export const baseUrl = REACT_APP_API_URL;

export const fotosBaseUrl = `${baseUrl}/fotos`;

export default {};

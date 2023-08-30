import { fotosBaseUrl } from '../config/api';

export default foto => ({
    original: `${fotosBaseUrl}/${foto.original}`,
    thumbnail: `${fotosBaseUrl}/${foto.thumbnail}`
})

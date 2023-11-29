import { fotosBaseUrl } from '../config/api'

export default foto => ({
    original: `${fotosBaseUrl}/${foto.original}`.replace('api/', ''),
    thumbnail: `${fotosBaseUrl}/${foto.thumbnail}`.replace('api/', '')
})

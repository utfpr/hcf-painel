import { fotosBaseUrl } from '../config/api'

export default foto => ({
    fullscreen: `${fotosBaseUrl}/${foto.original}`,
    original: `${fotosBaseUrl}/crop/500/400/${foto.original}`,
    thumbnail: `${fotosBaseUrl}/200/${foto.thumbnail}`,
    originalAlt: foto.original,
    originalTitle: foto.original,
    thumbnailAlt: foto.thumbnail,
    thumbnailTitle: foto.thumbnail
})

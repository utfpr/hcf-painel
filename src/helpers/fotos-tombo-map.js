import { fotosBaseUrl } from '../config/api'

export default foto => ({
    fullscreen: `${fotosBaseUrl}/${foto.original}`,
    original: `${fotosBaseUrl}/${foto.original}/resize?height=800`,
    thumbnail: `${fotosBaseUrl}/${foto.thumbnail}/resize?height=200`,
    originalAlt: foto.original,
    originalTitle: foto.original,
    thumbnailAlt: foto.thumbnail,
    thumbnailTitle: foto.thumbnail,
    originalHeight: 500
})

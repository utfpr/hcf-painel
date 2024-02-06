import { Component } from 'react'

import ImageGallery from 'react-image-gallery'

export default class GalleryComponent extends Component {
    handleClick = () => {
        if (this.props.fotos.length > 0) window.open(this.props.fotos[0].original, '_blank')
    }

    handleImageError = e => {
        e.target.src = 'https://t4.ftcdn.net/jpg/01/39/16/63/240_F_139166369_NdTDXc0lM57N66868lC66PpsaMkFSwaf.jpg'
    }

    render() {
        return (
            <ImageGallery
                items={this.props.fotos}
                showPlayButton={false}
                showFullscreenButton={false}
                showThumbnails={this.props.fotos.length > 1}
                onClick={this.handleClick}
                onImageError={this.handleImageError}
            />
        )
    }
}

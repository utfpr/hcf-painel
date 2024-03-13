import { Component } from 'react'

import ImageGallery from 'react-image-gallery'

export default class GalleryComponent extends Component {
    handleImageError = e => {
        e.target.src = '/not-found.jpg'
    }

    render() {
        return (
            <ImageGallery
                items={this.props.fotos}
                showPlayButton={false}
                showThumbnails={this.props.fotos.length > 1}
                onImageError={this.handleImageError}
            />
        )
    }
}

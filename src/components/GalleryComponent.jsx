import { Component } from 'react'

import ImageGallery from 'react-image-gallery'

export default class GalleryComponent extends Component {
    render() {
        return <ImageGallery items={this.props.fotos} />
    }
}

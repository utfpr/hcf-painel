import { Component } from 'react'

import ImageGallery from 'react-image-gallery'

const buttonStyle = {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    padding: '20px 10px',
    cursor: 'pointer',
    borderRadius: '5px'
}

export default class GalleryComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            zoomLevel: 100
        }
    }

    handleImageError = e => {
        e.target.src = '/not-found.jpg'
    }

    increaseZoom = () => {
        this.setState(prevState => ({
            zoomLevel: Math.min(prevState.zoomLevel + 10, 999)
        }))
    }

    decreaseZoom = () => {
        this.setState(prevState => ({
            zoomLevel: Math.max(prevState.zoomLevel - 40, 100)
        }))
    }

    renderItem = item => {
        const isFullscreen = document.fullscreenElement !== null
        const { zoomLevel } = this.state

        return (
            <div
                style={
                    isFullscreen
                        ? {
                            maxHeight: '100vh',
                            overflow: 'auto',
                            position: 'relative',
                            textAlign: 'center'
                        }
                        : {}
                }
            >
                {isFullscreen && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 10,
                            right: 10,
                            zIndex: 9999,
                            display: 'flex',
                            gap: 10
                        }}
                    >
                        <button
                            type="button"
                            style={buttonStyle}
                            onClick={this.decreaseZoom}
                        >
                            ➖
                        </button>
                        <button
                            type="button"
                            style={buttonStyle}
                            onClick={this.increaseZoom}
                        >
                            ➕
                        </button>
                    </div>
                )}

                <img
                    src={
                        isFullscreen && item.fullscreen ? item.fullscreen : item.original
                    }
                    alt={item.originalAlt}
                    title={item.originalTitle}
                    onError={this.handleImageError}
                    onLoad={isFullscreen ? this.handleImageLoad : undefined}
                    style={{
                        maxWidth: isFullscreen ? '100%' : undefined,
                        maxHeight: isFullscreen ? `${zoomLevel}vh` : '57vh',
                        objectFit: 'contain',
                        transition: 'width 0.2s ease'
                    }}
                />
            </div>
        )
    }

    render() {
        return (
            <ImageGallery
                items={this.props.fotos}
                showPlayButton={false}
                showThumbnails={this.props.fotos.length > 1}
                onImageError={this.handleImageError}
                renderItem={this.renderItem}
            />
        )
    }
}

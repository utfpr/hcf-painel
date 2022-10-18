import React from 'react';

import { Divider } from 'antd';
// import ImageGallery from 'react-image-gallery';

import { wrapForm } from '../../helpers/form-helper';
import CollectionPlace from './components/CollectionPlace';
import MainFeatures from './components/MainFeatures';
import Taxonomy from './components/Taxonomy';

// const images = [
//     {
//         original: 'https://picsum.photos/id/1018/1000/600/',
//         thumbnail: 'https://picsum.photos/id/1018/250/150/',
//     },
//     {
//         original: 'https://picsum.photos/id/1015/1000/600/',
//         thumbnail: 'https://picsum.photos/id/1015/250/150/',
//     },
//     {
//         original: 'https://picsum.photos/id/1019/1000/600/',
//         thumbnail: 'https://picsum.photos/id/1019/250/150/',
//     },
// ];

const CreateUpdateTombo = () => {
  return (
    <div>
      {/* <ImageGallery items={images} /> */}
      <br />
      <MainFeatures />
      <Divider />
      <CollectionPlace />
      <Divider />
      <Taxonomy />
      <Divider />
    </div>
  );
};

export default wrapForm(CreateUpdateTombo);

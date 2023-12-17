import React from 'react';
import { TouchableOpacity, Image } from 'react-native';

const ImageButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={require('../images/List.png')}
        style={{ width: 20, height: 20 }}
      />
    </TouchableOpacity>
  );
};

export default ImageButton;

import React from 'react';
import { TouchableOpacity, Image } from 'react-native';

const AddSubjectButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={require('../images/Add.png')}
        style={{ width: 25, height: 25 }}
      />
    </TouchableOpacity>
  );
};

export default AddSubjectButton;


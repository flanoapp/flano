import React from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

// @ts-ignore
const DismissKeyboard = ({ children }) => {
    return <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>{children}</TouchableWithoutFeedback>;
};

export default DismissKeyboard;

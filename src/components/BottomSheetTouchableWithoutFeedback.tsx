import React, { memo } from 'react';
import { Platform, TouchableWithoutFeedback } from 'react-native';
import { TouchableWithoutFeedback as RNGHTTouchableWithoutFeedback } from 'react-native-gesture-handler';

// @ts-ignore
const BottomSheetTouchableWithoutFeedback = ({ children, onPress, style = {} }) => {
    if (Platform.OS === 'android') {
        return (
            <RNGHTTouchableWithoutFeedback onPress={onPress} style={style}>
                {children}
            </RNGHTTouchableWithoutFeedback>
        );
    }
    return (
        <TouchableWithoutFeedback onPress={onPress} style={style}>
            {children}
        </TouchableWithoutFeedback>
    );
};

export default memo(BottomSheetTouchableWithoutFeedback);

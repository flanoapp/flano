import React, { memo } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { TouchableOpacity as RNGHTTouchableOpacity } from 'react-native-gesture-handler';

// @ts-ignore
const BottomSheetTouchable = ({ children, onPress, disabled = false, style = {} }) => {
    if (Platform.OS === 'android') {
        return (
            <RNGHTTouchableOpacity onPress={onPress} disabled={disabled} style={style}>
                {children}
            </RNGHTTouchableOpacity>
        );
    } else {
        return (
            <TouchableOpacity onPress={onPress} disabled={disabled} style={style}>
                {children}
            </TouchableOpacity>
        );
    }
};
export default memo(BottomSheetTouchable);

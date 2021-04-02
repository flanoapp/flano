import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { SECONDARY_LIGHT_COLOR } from '../styles/globalStyles';

export default () => (
    <View style={{ alignItems: 'center' }}>
        <ActivityIndicator color={SECONDARY_LIGHT_COLOR} animating size={'large'} />
    </View>
);

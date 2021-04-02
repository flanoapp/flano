import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import HyperLink from 'react-native-hyperlink';
import { Text } from 'react-native-elements';
import { useTranslation } from 'react-i18next';

import globalStyles, { SECONDARY_TEXT_COLOR } from '../../styles/globalStyles';

interface IDetailsEntry {
    name: string;
    text?: string;
}

const DetailsEntry: FC<IDetailsEntry> = props => {
    const { name, text } = props;
    const { t } = useTranslation();

    return text?.trim() ? (
        <View style={styles.container}>
            <HyperLink linkDefault={true} linkStyle={{ color: '#0353a4' }}>
                <Text style={styles.label}>{t(`objDetails_${name}`)}</Text>
                <Text style={styles.text}>{text}</Text>
            </HyperLink>
        </View>
    ) : null;
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginRight: 30,
    },
    label: {
        fontSize: 14,
        color: SECONDARY_TEXT_COLOR,
        fontFamily: 'OpenSans Regular',
    },
    text: {
        ...globalStyles.primaryText,
    },
});

export default DetailsEntry;

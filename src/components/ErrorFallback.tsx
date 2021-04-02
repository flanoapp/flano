import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import React from 'react';
import { useTranslation } from 'react-i18next';
import globalStyles, { PRIMARY_COLOR } from '../styles/globalStyles';

export default (props: { error: Error; resetError: Function }) => {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{t('somethingWentWrong')}</Text>
            <Text style={styles.text}>{props.error.toString()}</Text>

            <Button
                buttonStyle={styles.button}
                //@ts-ignore
                onPress={props.resetError}
                title={t('tryAgain')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        alignContent: 'center',
        paddingHorizontal: 12,
    },
    button: {
        backgroundColor: PRIMARY_COLOR,
    },
    text: {
        ...globalStyles.primaryText,
    },
});

import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DetailsEntry from './DetailsEntry';
import { useTranslation } from 'react-i18next';

import { PRIMARY_COLOR } from '../../styles/globalStyles';

interface IDetailsEntries {
    details: {
        title: string;
        artist: string;
        date: string;
        category: string;
    };
    isTopSpot: boolean;
}

const DetailsEntries: FC<IDetailsEntries> = props => {
    const {
        details: { title, artist, date, category, ...details },
        isTopSpot,
    } = props;

    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            {isTopSpot && (
                <>
                    <Text style={styles.topSpot}>{t('topspot')}</Text>
                    <Text style={styles.topSpotExplanation}>{t('topspot_explanation')}</Text>
                </>
            )}

            <DetailsEntry name={'title'} text={title} />
            <DetailsEntry name={'artist'} text={artist} />

            <View style={styles.flex}>
                <DetailsEntry name={'origin'} text={date} />
                <DetailsEntry name={'category'} text={category} />

                {Object.entries(details).map(([name, text], index) => (
                    <DetailsEntry key={index} name={name} text={text} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    flex: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginRight: -30,
    },
    topSpot: {
        marginTop: 10,
        color: PRIMARY_COLOR,
        fontSize: 17,
        textAlign: 'center',
        fontFamily: 'OpenSans SemiBold',
    },
    topSpotExplanation: {
        color: PRIMARY_COLOR,
        fontSize: 17,
        textAlign: 'center',
        fontFamily: 'OpenSans Light',
    },
});

export default DetailsEntries;

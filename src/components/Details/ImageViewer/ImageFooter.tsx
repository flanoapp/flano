import React, { FC, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

import { IObjectDetailImage } from '../../Card/DetailCardPanel';
import ImageFooterLink from './ImageFooterLink';
import globalStyles from '../../../styles/globalStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { height: HEIGHT } = Dimensions.get('window');

export interface IImageFooter {
    title: string;
    author: string;
    resourceUrl: string;
    license: string;
    licenseUrl: string;
}

const ImageFooter: FC<IImageFooter> = props => {
    let { title, author, resourceUrl, license, licenseUrl } = props;
    const { t } = useTranslation();

    const [showLongText, setShowLongText] = useState(false);

    const authorText = showLongText ? (
        <Text style={styles.footerText}>{author ? `© ${author}` : t('copyright_no_author')}</Text>
    ) : (
        <Text style={styles.footerText} numberOfLines={1}>
            {author ? `© ${author} ...` : t('copyright_no_author')}
        </Text>
    );
    const titleText = resourceUrl ? (
        <ImageFooterLink href={resourceUrl} style={styles.footerText}>
            {title ?? t('copyright_no_title')}
        </ImageFooterLink>
    ) : (
        <Text style={styles.footerText}>{title ?? t('copyright_no_title')}</Text>
    );
    const licenseText = licenseUrl ? (
        <ImageFooterLink href={licenseUrl} style={styles.footerText}>
            {license ?? t('copyright_no_license')}
        </ImageFooterLink>
    ) : (
        <Text style={styles.footerText}>{license ?? t('copyright_no_license')}</Text>
    );

    return (
        <TouchableWithoutFeedback onPress={() => setShowLongText(!showLongText)}>
            {showLongText ? (
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.overlay}>
                    <View style={styles.footer}>
                        <View style={styles.footerRow}>
                            {titleText}
                            <View />
                        </View>
                        <View style={styles.footerRow}>
                            {authorText}
                            {licenseText}
                        </View>
                    </View>
                </LinearGradient>
            ) : (
                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        {authorText}
                        <View />
                    </View>
                </View>
            )}
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    overlay: {
        height: (HEIGHT / 3) * 2,
        display: 'flex',
        justifyContent: 'flex-end',
    },
    footer: {
        paddingVertical: 20,
    },
    footerRow: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'center',
        paddingHorizontal: 20,
    },
    footerText: {
        ...globalStyles.primaryText,
        color: 'white',
    },
});

export default ImageFooter;

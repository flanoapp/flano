import React, { FC } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { openBrowser } from '../../../utils/utils';

export interface IImageFooterLink {
    href: string;
    style: StyleProp<TextStyle>;
}

const ImageFooterLink: FC<IImageFooterLink> = props => {
    const { href, style, children } = props;

    return (
        <Text style={style}>
            <Text style={styles.link} onPress={() => openBrowser(href)}>
                {children}
            </Text>
        </Text>
    );
};

const styles = StyleSheet.create({
    link: {
        textDecorationLine: 'underline',
    },
});

export default ImageFooterLink;

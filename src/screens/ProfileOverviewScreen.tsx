import React, { useEffect } from 'react';
import { BackHandler, Linking, Platform, SectionList, StyleSheet, View } from 'react-native';
import { Header, Icon, Image, ListItem, Text } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import globalStyles, {
    BACKGROUND_COLOR,
    iconButtonSize,
    LOGO_FONT_COLOR,
    PRIMARY_COLOR,
    secondaryIconButtonSize,
} from '../styles/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openBrowser } from '../utils/utils';

interface IListItems {
    title: string;
    icon: string;
    onPress: () => void;
    about: boolean;
}

// @ts-ignore
const ProfileOverviewScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const data = [
        {
            title: 'personal',
            data: [
                {
                    title: t('profile_liked'),
                    icon: 'heart',
                    onPress: () => navigation.navigate('Liked'),
                    about: false,
                },
                {
                    title: t('profile_bookmarked'),
                    icon: 'bookmark',
                    onPress: () => navigation.navigate('Bookmarked'),
                    about: false,
                },
            ],
        },
        {
            title: 'about',
            data: [
                {
                    title: t('profile_about'),
                    icon: 'information',
                    onPress: () => openBrowser('https://flano.at/about'),
                    about: true,
                },
                {
                    title: t('profile_privacy'),
                    icon: 'shield',
                    onPress: () => openBrowser('https://flano.at/privacy'),
                    about: true,
                },
                {
                    title: t('profile_feedback'),
                    icon: 'message',
                    onPress: () => Linking.openURL('mailto:contact@flano.at'),
                    about: true,
                },
                {
                    title: t('profile_donate'),
                    icon: 'gift',
                    onPress: () => Linking.openURL('https://flano.at/donate'),
                    about: true,
                },
            ],
        },
    ];

    const styles = stylesFunction(insets.bottom);

    const renderHeader = (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Image source={require('../../assets/flano_logo.png')} style={styles.headerImg} />
            <Text h1 style={styles.headerText}>
                {'f\u200Blano'}
            </Text>
        </View>
    );

    const iconProps = (icon: string, about: boolean) => ({
        name: icon,
        type: 'material-community',
        size: about ? secondaryIconButtonSize : iconButtonSize,
        color: about ? LOGO_FONT_COLOR : PRIMARY_COLOR,
    });

    const renderData = (item: IListItems) => (
        <ListItem
            bottomDivider
            onPress={item.onPress}
            containerStyle={item.about ? { height: 50, paddingVertical: 0 } : {}}
        >
            <Icon {...iconProps(item.icon, item.about)} />
            <ListItem.Content>
                <ListItem.Title style={styles.listText}>{item.title}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
        </ListItem>
    );

    const renderSeparator = () => {
        return <View style={{ height: 10 }} />;
    };

    function handleAndroidBackButton() {
        return false;
    }

    useEffect(() => {
        if (Platform.OS === 'android') {
            const focusListener = navigation.addListener('didFocus', () => {
                BackHandler.addEventListener('hardwareBackPress', handleAndroidBackButton);
            });

            const blurListener = navigation.addListener('willBlur', () => {
                BackHandler.removeEventListener('hardwareBackPress', handleAndroidBackButton);
            });
            return () => {
                focusListener.remove();
                blurListener.remove();
                BackHandler.removeEventListener('hardwareBackPress', handleAndroidBackButton);
            };
        }
    }, []);

    return (
        <View>
            <Header containerStyle={styles.header} centerComponent={renderHeader} />
            <SectionList
                scrollEnabled={false}
                renderItem={({ item }) => renderData(item)}
                keyExtractor={item => item.title}
                sections={data}
                SectionSeparatorComponent={renderSeparator}
            />
            <Text style={styles.infoText}>{t('profile_info')}</Text>
        </View>
    );
};

const stylesFunction = (bottomInset: number) =>
    StyleSheet.create({
        header: {
            backgroundColor: 'white',
            height: 100 + bottomInset,
            marginBottom: 10,
            borderBottomColor: 'gray',
        },
        headerImg: {
            width: 27,
            resizeMode: 'contain',
            marginRight: 10,
        },
        headerText: {
            ...globalStyles.profileHeaderTitle,
        },
        listItem: {
            backgroundColor: BACKGROUND_COLOR,
        },
        listText: {
            ...globalStyles.primaryText,
        },
        infoText: {
            marginHorizontal: 10,
            fontFamily: 'OpenSans Light',
        },
    });

export default ProfileOverviewScreen;

import { Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import I18n from './../../i18n';
import { openBrowserAsync } from 'expo-web-browser';

export const REQUEST_TIMEOUT = 10000;

const randomColor = require('randomcolor');

export const PANEL_POS = {
    hidden: 3,
    bottom: 2,
    middle: 1,
    top: 0,
};

export const BOTTOMSHEET_SNAPPOINTS = {
    hidden: '200%',
    bottom: '77%',
    middle: '55%',
    top: '5%',
};

export const BOTTOMSHEET_SNAPPOINTS_INSET = {
    middle: 380,
    bottom: 160,
};

export const BOTTOMSHEET_TYPE = {
    objectList: 'objectList',
    tourList: 'tourList',
    objectDetails: 'objectDetails',
};

export const isObjectLiked = async (objectId: string) => {
    try {
        const currentLiked = await AsyncStorage.getItem('@liked_objects');
        const currentLikedArr: Array<string> = JSON.parse(currentLiked || '[]');
        return currentLikedArr.includes(objectId);
    } catch (e) {
        console.log(e);
    }
};

export const isObjectBookmarked = async (objectId: string) => {
    try {
        const currentBookmarked = await AsyncStorage.getItem('@bookmarked_objects');
        const currentBookmarkedArr: Array<string> = JSON.parse(currentBookmarked || '[]');
        return currentBookmarkedArr.includes(objectId);
    } catch (e) {
        console.log(e);
    }
};

export const determinePanelMovement = (oldIndex: number, newIndex: number) => {
    if (
        oldIndex === newIndex ||
        oldIndex === PANEL_POS.hidden ||
        newIndex === PANEL_POS.hidden ||
        (oldIndex === PANEL_POS.middle && newIndex === PANEL_POS.top) ||
        (oldIndex === PANEL_POS.top && newIndex === PANEL_POS.middle)
    ) {
        return '';
    }
    return oldIndex > newIndex ? 'up' : 'down';
};

export const tryAgainAlert = (message: string, callback: () => {}) => {
    Alert.alert(
        I18n.t('somethingWentWrong'),
        message,
        [
            {
                text: I18n.t('cancel'),
                onPress: () => null,
                style: 'cancel',
            },
            {
                text: I18n.t('tryAgain'),
                onPress: callback,
            },
        ],
        { cancelable: true },
    );
};

export const generateRandomColors = () => {
    return randomColor({
        count: 20,
        hue: '#FF8349',
        luminosity: 'bright',
    });
};

export const calculateMapZoomLevel = (screenWidth: number, longitudeDelta: number) => {
    return Math.floor(Math.log2(360 * (screenWidth / 256 / longitudeDelta)) + 1);
};

export const openBrowser = async (url: string) => {
    setTimeout(() => StatusBar.setHidden(false), 350);
    await openBrowserAsync(url);
    StatusBar.setHidden(true);
};

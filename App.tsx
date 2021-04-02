import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from 'react-native-error-boundary';
import 'react-native-gesture-handler';

import AppLoading from 'expo-app-loading';
import * as Linking from 'expo-linking';
import * as Font from 'expo-font';
import { FontAwesome5 } from '@expo/vector-icons';

import I18n from './i18n';

import ExploreScreen from './src/screens/ExploreScreen';
import BookmarkedScreen from './src/screens/BookmarkedScreen';
import LikedScreen from './src/screens/LikedScreen';
import ProfileOverviewScreen from './src/screens/ProfileOverviewScreen';
import TourScreen from './src/screens/TourScreen';
import ErrorFallback from './src/components/ErrorFallback';
import useMarkers from './src/hooks/useMarkers';
import useLocation from './src/hooks/useLocation';

import { markerProvider as MarkerProvider } from './src/context/markerContext';
import { BACKGROUND_COLOR, INACTIVE_SYMBOL_COLOR, PRIMARY_COLOR } from './src/styles/globalStyles';

// flow inside the profile tab should be stacked
// means: multiple screens inside the same tab
const profileFlow = createStackNavigator(
    {
        Overview: ProfileOverviewScreen,
        Liked: LikedScreen,
        Bookmarked: BookmarkedScreen,
    },
    {
        headerMode: 'none',
    },
);

//@ts-ignore
const getScreenRegisteredFunctions = navState => {
    const { routes, index, params } = navState;
    if (navState.hasOwnProperty('index')) {
        return getScreenRegisteredFunctions(routes[index]);
    } else {
        return params;
    }
};

const bottomTab = createBottomTabNavigator(
    {
        // the screens which are associated with the tabs in the navigator
        // the left id is the routename which is per default also the title of the tab
        // profileFlow consists of the stack navigator with multiple screens
        Explore: {
            screen: ExploreScreen,
            path: 'objects/:objectId',
            navigationOptions: {
                tabBarLabel: I18n.t('exploreScreen'),
            },
        },
        Tour: {
            screen: TourScreen,
            path: 'tours',
            navigationOptions: {
                tabBarLabel: I18n.t('tourScreen'),
            },
        },
        profileFlow: {
            screen: profileFlow,
            navigationOptions: {
                tabBarLabel: I18n.t('profileScreen'),
            },
        },
    },
    {
        initialRouteName: 'Explore',

        // function to set the icons and colors of the tabs
        // 'navigation' is the the current route which is focued
        defaultNavigationOptions: ({ navigation }) => ({
            // the tintColor is defined in the tabBarOptions and given to
            // the tabbaricon
            tabBarIcon: ({ tintColor }) => {
                let { routeName } = navigation.state;
                let iconName; // the FontAwesome5 name of the icon according to @expo/vector-icons
                if (routeName === 'Explore') {
                    iconName = 'compass';
                } else if (routeName === 'Tour') {
                    iconName = 'route';
                } else if (routeName === 'profileFlow') {
                    iconName = 'user-circle';
                }
                return (
                    <>
                        {/* set the colors of the status bar to be visible; default is white content */}
                        <StatusBar backgroundColor={'transparent'} translucent barStyle='dark-content' />
                        <FontAwesome5 name={`${iconName}`} size={26} color={`${tintColor}`} />
                    </>
                );
            },
            tabBarOnPress: ({ defaultHandler }) => {
                if (navigation && navigation.isFocused()) {
                    const screenFunctions = getScreenRegisteredFunctions(navigation.state);
                    if (screenFunctions && typeof screenFunctions.tapOnNavigator === 'function') {
                        screenFunctions.tapOnNavigator();
                    }
                }
                defaultHandler();
            },
        }),
        tabBarOptions: {
            activeBackgroundColor: BACKGROUND_COLOR,
            inactiveBackgroundColor: BACKGROUND_COLOR,
            activeTintColor: PRIMARY_COLOR,
            inactiveTintColor: INACTIVE_SYMBOL_COLOR,
            style: {
                backgroundColor: BACKGROUND_COLOR,
            },
        },
    },
);

// switch navigator will be neccessary as soon as we have a splash screen
// after the loading of the app is ready => app should switch from the splash screen to our mainFlow
const switchNavigator = createSwitchNavigator({
    mainFlow: { screen: bottomTab, path: '' },
});

const App = createAppContainer(switchNavigator);

const prefix = Linking.makeUrl('/');

export default () => {
    const [ready, setReady] = useState<boolean>(false);
    const [getMarkers, getMarkersBySearch, markerResult, markerApiLoading, markerApiErrorMessage] = useMarkers();
    const { checkLocationPermission } = useLocation();
    const onInit = async () => {
        await Font.loadAsync({
            'OpenSans Regular': require('./assets/fonts/OpenSans-Regular.ttf'),
            'OpenSans Italic': require('./assets/fonts/OpenSans-Italic.ttf'),
            'OpenSans SemiBold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
            'OpenSans SemiBold Italic': require('./assets/fonts/OpenSans-SemiBoldItalic.ttf'),
            'OpenSans Light': require('./assets/fonts/OpenSans-Light.ttf'),
            'OpenSans Light Italic': require('./assets/fonts/OpenSans-LightItalic.ttf'),
            'Lato Bold Italic': require('./assets/fonts/Lato-BoldItalic.ttf'),
        });
        //await checkLocationPermission();
        await getMarkers();
    };

    return !ready ? (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AppLoading startAsync={onInit} onFinish={() => setReady(true)} onError={console.warn} />
        </ErrorBoundary>
    ) : (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <MarkerProvider value={markerResult}>
                <SafeAreaProvider>
                    <App uriPrefix={prefix} />
                </SafeAreaProvider>
            </MarkerProvider>
        </ErrorBoundary>
    );
};

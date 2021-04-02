import React, { useContext, useEffect, useRef, useState } from 'react';
import { BackHandler, Dimensions, Linking, Platform, StyleSheet } from 'react-native';

import ObjectListCardPanel, { IObjectListCardPanel } from '../components/Card/ObjectListCardPanel';
import Map from '../components/Map/Map';
import DetailCardPanel, { IDetailCardPanel, IObjectDetailItem } from '../components/Card/DetailCardPanel';
import useObjects from '../hooks/useObjects';
import useLocation from '../hooks/useLocation';
import useCategories from '../hooks/useCategories';
import useMarkers from '../hooks/useMarkers';
import { markerContext } from '../context/markerContext';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { IObjectListItem } from '../components/List/ObjectListItem';
import { withNavigation } from 'react-navigation';

import { BOTTOMSHEET_TYPE, determinePanelMovement, PANEL_POS } from '../utils/utils';

const { height: HEIGHT } = Dimensions.get('window');

// @ts-ignore
const ExploreScreen = ({ navigation }) => {
    const [detailItem, setDetailItema] = useState<string | null>(null);
    const setDetailItem = (item: string | null) => {
        setDetailItema(item);
    };
    //@ts-ignore
    const mapRef = useRef<Map>(null);
    const [panelMovement, setPanelMovement] = useState<string>('');

    const allMarkers = useContext(markerContext);

    const {
        getObject,
        getAllObjects,
        objectResult,
        loadObjectListPage,
        searchObjects,
        loadSearchResultPage,
        toggleLikeObject,
        setObjectApiLoading,
        objectListResult,
        searchResult,
        objectApiErrorMessage,
        objectApiLoading,
        allObjectsEndReached,
        searchEndReached,
    } = useObjects();

    const [getCategories, categoriesResult, categoriesApiLoading, categoriesApiErrorMessage] = useCategories();

    const [getMarkers, getMarkersBySearch, markerResult, markerApiLoading, markerApiErrorMessage] = useMarkers();

    const [searchActive, setSearchActive] = useState<boolean>(false);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeFilters, setActiveFilters] = useState<Array<string>>([]);

    const { getCurrentUserLocation, currentUserLocation, userLocationErrorMessage } = useLocation();

    const detailBottomSheetRef = useRef<ScrollBottomSheet<IObjectDetailItem> | null>(null);
    const objectListBottomSheetRef = useRef<ScrollBottomSheet<IObjectListItem> | null>(null);
    const objectListBottomSheetSnap = useRef<number>(PANEL_POS.middle);

    // save current panelsnap to animate map region properly
    const panelSnap = useRef<number>(PANEL_POS.middle);

    const currentSheet = useRef<string>(BOTTOMSHEET_TYPE.objectList);

    const _onPanelSnap = (index: number) => {
        if (index !== PANEL_POS.hidden) {
            setPanelMovement(determinePanelMovement(panelSnap.current, index));
            panelSnap.current = index;
        }
    };
    useEffect(() => {
        if (detailItem && panelMovement === 'up') {
            // @ts-ignore
            const coords = allMarkers.find(obj => obj.objectId === detailItem).coordinates;
            mapRef.current.panelSnap(coords);
        }
    }, [panelSnap.current]);

    const _onObectListSnap = (index: number) => {
        if (index !== PANEL_POS.hidden) {
            _onPanelSnap(index);
            objectListBottomSheetSnap.current = index;
        }
    };

    const showDetail = (itemId: string) => {
        setObjectApiLoading(true);
        detailBottomSheetRef.current?.snapTo(PANEL_POS.middle);
        objectListBottomSheetRef.current?.snapTo(PANEL_POS.hidden);
        getObject(itemId);
        setDetailItem(itemId);
        currentSheet.current = BOTTOMSHEET_TYPE.objectDetails;
        // @ts-ignore
        const coords = allMarkers.find(obj => obj.objectId === itemId).coordinates;

        mapRef.current.focusMarker(itemId, coords);
    };

    const showUrlObjectDetail = (itemId: string) => {
        setObjectApiLoading(true);
        setTimeout(() => {
            detailBottomSheetRef.current?.snapTo(PANEL_POS.middle);
            objectListBottomSheetRef.current?.snapTo(PANEL_POS.hidden);
        }, 50);
        getObject(itemId);
        setDetailItem(itemId);
        currentSheet.current = BOTTOMSHEET_TYPE.objectDetails;
        // @ts-ignore
        const coords = allMarkers.find(obj => obj.objectId === itemId).coordinates;

        mapRef.current.focusMarker(itemId, coords);
    };

    const onSearchSubmit = (searchTerm: string, categories: Array<string>) => {
        getMarkersBySearch(searchTerm, categories);
    };

    const hideDetail = () => {
        detailBottomSheetRef.current?.snapTo(PANEL_POS.hidden);
        objectListBottomSheetRef.current?.snapTo(objectListBottomSheetSnap.current);
        setDetailItem(null);
        currentSheet.current = BOTTOMSHEET_TYPE.objectList;
    };

    function handleAndroidBackButton() {
        if (currentSheet.current === BOTTOMSHEET_TYPE.objectDetails) {
            hideDetail();
            return true;
        } else if (currentSheet.current === BOTTOMSHEET_TYPE.objectList && panelSnap.current !== PANEL_POS.bottom) {
            objectListBottomSheetRef.current?.snapTo(PANEL_POS.bottom);
            return true;
        } else {
            //BackHandler.exitApp();
            // call default backbutton action
            return false;
        }
    }

    const listCardProps: IObjectListCardPanel = {
        bottomSheetRef: objectListBottomSheetRef,
        initialSnap: objectListBottomSheetSnap.current,
        headerProps: {
            showBackArrow: false,
            headerType: 'search',
            titleText: 'list',
            categories: categoriesResult,
            handleSearchSubmit: onSearchSubmit,
            searchTerm: searchTerm,
            setSearchTerm: setSearchTerm,
            activeFilters: activeFilters,
            setActiveFilters: setActiveFilters,
            setLoading: setObjectApiLoading,
            handleAndroidBackButton: handleAndroidBackButton,
            currentBottomSheet: currentSheet,
        },
        listData: searchActive ? searchResult : objectListResult,
        loading: objectApiLoading,
        loadPage: () => loadObjectListPage(currentUserLocation),
        onItemPress: showDetail,
        onPanelSettle: _onObectListSnap,
        searchObjects: searchObjects,
        searchActive: searchActive,
        setSearchActive: setSearchActive,
        loadSearchPage: loadSearchResultPage,
        allObjectsEndReached: allObjectsEndReached,
        searchEndReached: searchEndReached,
    };

    const detailCardProps: IDetailCardPanel = {
        bottomSheetRef: detailBottomSheetRef,
        headerProps: {
            showBackArrow: true,
            headerType: 'title',
            handleBackButton: hideDetail,
        },
        detailData: objectResult as IObjectDetailItem,
        loading: objectApiLoading,
        onPanelSettle: _onPanelSnap,
        handleLike: toggleLikeObject,
    };

    const openUrl = (url: string) => {
        if (url && url.includes('object')) {
            const urlObject = url.split('/').pop();
            if (urlObject) {
                showUrlObjectDetail(urlObject);
            }
        }
    };

    // pressing the navigator tab should close the detail screen
    const onTabPress = () => {
        if (currentSheet.current === BOTTOMSHEET_TYPE.objectDetails) {
            hideDetail();
        }
    };

    useEffect(() => {
        console.log('explorescreen did mount');

        // pass function to navigator which should be called when tapping the tab
        navigation.setParams({ tapOnNavigator: onTabPress });
        setDetailItem(null);
        //get initial user location and object list
        getCurrentUserLocation(getAllObjects).then(() => {
            setTimeout(() => {
                Linking.getInitialURL().then((url: string | null) => {
                    if (url && url?.includes('object')) {
                        openUrl(url);
                    }
                });

                Linking.addEventListener('url', ({ url }) => openUrl(url));
            }, 50);
        });
        return () => {
            Linking.removeEventListener('url', ({ url }) => openUrl(url));
        };
    }, []);

    if (Platform.OS === 'android') {
        useEffect(() => {
            const focusListener = navigation.addListener('didFocus', () => {
                BackHandler.addEventListener('hardwareBackPress', handleAndroidBackButton);
            });

            const blurListener = navigation.addListener('willBlur', () => {
                BackHandler.removeEventListener('hardwareBackPress', handleAndroidBackButton);
            });
            return () => {
                BackHandler.removeEventListener('hardwareBackPress', handleAndroidBackButton);
                focusListener.remove();
                blurListener.remove();
            };
        }, []);
    }

    return (
        // <DismissKeyboard>
        <>
            <Map
                ref={mapRef}
                panelMovement={panelMovement}
                markerOnPress={showDetail}
                objects={searchActive ? markerResult : allMarkers}
                showTourRoute={false}
                selectedMarker={detailItem}
                setSelectedMarker={setDetailItem}
                markerPressEnabled={true}
            />
            <ObjectListCardPanel {...listCardProps} />

            <DetailCardPanel {...detailCardProps} />
        </>
        //  </DismissKeyboard>
    );
};

const styles = StyleSheet.create({});

export default withNavigation(ExploreScreen);

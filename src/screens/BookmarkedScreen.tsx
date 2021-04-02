import React, { useContext, useEffect, useRef, useState } from 'react';
import { BackHandler, Dimensions, Platform, StyleSheet } from 'react-native';
import { LatLng } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import ObjectListCardPanel, { IObjectListCardPanel } from '../components/Card/ObjectListCardPanel';
import Map from '../components/Map/Map';
import DetailCardPanel, { IDetailCardPanel, IObjectDetailItem } from '../components/Card/DetailCardPanel';
import { IObjectListItem } from '../components/List/ObjectListItem';
import useLikedList from '../hooks/useLocalLists';
import useObjects from '../hooks/useObjects';
import useLocation from '../hooks/useLocation';
import { markerContext } from '../context/markerContext';

import { BOTTOMSHEET_TYPE, determinePanelMovement, PANEL_POS } from '../utils/utils';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { withNavigation } from 'react-navigation';

const { height } = Dimensions.get('window');

// @ts-ignore
const BookmarkedScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const {
        getObject,
        getObjectList,
        objectResult,
        toggleLikeObject,
        setObjectApiLoading,
        objectListResult,
        objectApiErrorMessage,
        objectApiLoading,
    } = useObjects();

    const { getBookmarkedObjects, toggleBookmarked, currentlyBookmarked } = useLikedList();
    const { getCurrentUserLocation, currentUserLocation, userLocationErrorMessage } = useLocation();

    useEffect(() => {
        getBookmarkedObjects((array: Array<string>) =>
            getCurrentUserLocation((region: LatLng) => getObjectList(array, region)),
        );
    }, []);

    const detailBottomSheetRef = useRef<ScrollBottomSheet<IObjectDetailItem> | null>(null);
    const objectListBottomSheetRef = useRef<ScrollBottomSheet<IObjectListItem> | null>(null);
    const objectListBottomSheetSnap = useRef<number>(PANEL_POS.middle);

    // save current panelsnap to animate map region properly
    const panelSnap = useRef<number>(PANEL_POS.middle);
    // @ts-ignore
    const mapRef = useRef<Map>(null);
    const [panelMovement, setPanelMovement] = useState<string>('');

    const [detailItem, setDetailItem] = useState<string | null>(null);

    const allMarkers = useContext(markerContext);

    const currentSheet = useRef<string>(BOTTOMSHEET_TYPE.objectList);

    const _onPanelSnap = (index: number) => {
        if (index !== PANEL_POS.hidden) {
            setPanelMovement(determinePanelMovement(panelSnap.current, index));
            panelSnap.current = index;
        }
    };

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
        const coords = allMarkers.find(obj => obj.objectId === itemId)?.coordinates;
        mapRef.current.focusMarker(itemId, coords);
        currentSheet.current = BOTTOMSHEET_TYPE.objectDetails;
    };

    const hideDetail = () => {
        detailBottomSheetRef.current?.snapTo(PANEL_POS.hidden);
        objectListBottomSheetRef.current?.snapTo(objectListBottomSheetSnap.current);
        setDetailItem(null);
        currentSheet.current = BOTTOMSHEET_TYPE.objectList;
    };

    const listCardProps: IObjectListCardPanel = {
        bottomSheetRef: objectListBottomSheetRef,
        loading: objectApiLoading,
        headerProps: {
            showBackArrow: true,
            headerType: 'title',
            titleText: t('bookmarked'),
            handleBackButton: () => navigation.navigate('Overview'),
        },
        listData: objectListResult.map(o =>
            Object.assign(
                {},
                {
                    ...o,
                    icon: 'bookmark',
                    isIconSolid: currentlyBookmarked.includes(o.objectId),
                    pressIcon: () => toggleBookmarked(o.objectId),
                },
            ),
        ) as Array<IObjectListItem>,
        onItemPress: showDetail,
        initialSnap: objectListBottomSheetSnap.current,
        onPanelSettle: _onPanelSnap,
    };

    const detailCardProps: IDetailCardPanel = {
        bottomSheetRef: detailBottomSheetRef,
        loading: objectApiLoading,
        headerProps: {
            showBackArrow: true,
            headerType: 'title',
            handleBackButton: hideDetail,
        },
        detailData: objectResult as IObjectDetailItem,
        onPanelSettle: _onPanelSnap,
        handleLike: toggleLikeObject,
    };

    function handleAndroidBackButton() {
        if (currentSheet.current === BOTTOMSHEET_TYPE.objectDetails) {
            hideDetail();
            return true;
        } else if (currentSheet.current === BOTTOMSHEET_TYPE.objectList && panelSnap.current !== PANEL_POS.bottom) {
            objectListBottomSheetRef.current?.snapTo(PANEL_POS.bottom);
            return true;
        } else {
            return false;
        }
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
        <>
            <Map
                ref={mapRef}
                panelMovement={panelMovement}
                markerOnPress={showDetail}
                objects={objectListResult}
                showTourRoute={false}
                selectedMarker={detailItem}
                setSelectedMarker={setDetailItem}
                markerPressEnabled={true}
            />
            <ObjectListCardPanel {...listCardProps} />

            <DetailCardPanel {...detailCardProps} />
        </>
    );
};

const styles = StyleSheet.create({});

export default withNavigation(BookmarkedScreen);

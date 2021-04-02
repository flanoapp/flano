import React, { useContext, useEffect, useRef, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { LatLng } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import Map, { IObjectMarker } from '../components/Map/Map';
import TourListCardPanel, { ITourListCardPanel } from '../components/Card/TourListCardPanel';
import ObjectListCardPanel, { IObjectListCardPanel } from '../components/Card/ObjectListCardPanel';
import DetailCardPanel, { IDetailCardPanel, IObjectDetailItem } from '../components/Card/DetailCardPanel';
import useTours from '../hooks/useTours';
import useObjects from '../hooks/useObjects';
import useLocation from '../hooks/useLocation';
import { markerContext } from '../context/markerContext';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { IObjectListItem } from '../components/List/ObjectListItem';
import { ITourListItem } from '../components/List/TourListItem';
import { withNavigation } from 'react-navigation';

import { BOTTOMSHEET_TYPE, determinePanelMovement, PANEL_POS } from '../utils/utils';

//@ts-ignore
const TourScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const allMarkers = useContext(markerContext);

    const [selectedTour, setSelectedTour] = useState<string>('');
    const [previewItems, setPreviewItems] = useState<Array<IObjectMarker>>([]);
    const [panelMovement, setPanelMovement] = useState<string>('');
    const [detailItem, setDetailItem] = useState<string | null>(null);

    const currentSheet = useRef<String>(BOTTOMSHEET_TYPE.tourList);

    const detailBottomSheetRef = useRef<ScrollBottomSheet<IObjectDetailItem> | null>(null);
    const objectListBottomSheetRef = useRef<ScrollBottomSheet<IObjectListItem> | null>(null);
    const objectListBottomSheetSnap = useRef<number>(PANEL_POS.middle);
    const tourListBottomSheetRef = useRef<ScrollBottomSheet<ITourListItem> | null>(null);
    const tourListBottomSheetSnap = useRef<number>(PANEL_POS.middle);

    // save current panelsnap to animate map region properly
    const panelSnap = useRef<number>(PANEL_POS.middle);

    const { getTourList, tourListResult, tourApiLoading } = useTours();
    const {
        getObject,
        getObjectList,
        setObjectApiLoading,
        objectResult,
        toggleLikeObject,
        resetObjectList,
        objectListResult,
        objectApiLoading,
    } = useObjects();

    const { getCurrentUserLocation } = useLocation();

    //@ts-ignore
    const mapRef = useRef<Map>(null);

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

    const _onTourListSnap = (index: number) => {
        if (index !== PANEL_POS.hidden) {
            _onPanelSnap(index);
            tourListBottomSheetSnap.current = index;
        }
    };

    // select tour in tour list => preview tour if not already on preview
    const onTourSelect = (id: string) => {
        setObjectApiLoading(true);
        tourListBottomSheetRef.current?.snapTo(PANEL_POS.hidden);
        objectListBottomSheetRef.current?.snapTo(PANEL_POS.middle);
        //getTour(id);
        const tourObjects = tourListResult[tourListResult.findIndex(item => item.id === id)].objects;
        getCurrentUserLocation((region: LatLng) =>
            getObjectList(
                tourObjects.map(obj => obj.objectId),
                region,
            ),
        );
        setDetailItem(null);
        if (selectedTour !== id) {
            setSelectedTour(id);
            //const objects = tourListResult[tourListResult.findIndex(item => item.id == id)].objects;
            //const objects = [];
            setPreviewItems(tourObjects);
            // fit map to given objects
            const polyline = tourListResult[tourListResult.findIndex(item => item.id === id)].polyline;
            mapRef.current.fitToMarkers(polyline);
        }
        currentSheet.current = BOTTOMSHEET_TYPE.objectList;
    };

    // exit the object list to a certain tour
    const hideObjectList = () => {
        objectListBottomSheetRef.current?.snapTo(PANEL_POS.hidden);
        tourListBottomSheetRef.current?.snapTo(tourListBottomSheetSnap.current);
        resetObjectList();
        setDetailItem(null);
        setSelectedTour('');
        setPreviewItems([]);
        currentSheet.current = BOTTOMSHEET_TYPE.tourList;
    };

    // show detail page of an object inside the tour
    const showDetail = (item: string) => {
        setObjectApiLoading(true);
        objectListBottomSheetRef.current?.snapTo(PANEL_POS.hidden);
        detailBottomSheetRef.current?.snapTo(PANEL_POS.middle);
        getObject(item);
        setDetailItem(item);
        currentSheet.current = BOTTOMSHEET_TYPE.objectDetails;
        //@ts-ignore
        const coords = allMarkers.find(obj => obj.objectId === item).coordinates;

        mapRef.current.focusMarker(item, coords);
    };

    // exit the detail page of an object
    const hideDetail = () => {
        detailBottomSheetRef.current?.snapTo(PANEL_POS.hidden);
        objectListBottomSheetRef.current?.snapTo(objectListBottomSheetSnap.current);
        setDetailItem(null);
        // fit to full tour again
        mapRef.current.fitToMarkers();
        currentSheet.current = BOTTOMSHEET_TYPE.objectList;
    };

    const listCardProps: ITourListCardPanel = {
        bottomSheetRef: tourListBottomSheetRef,
        initialSnap: PANEL_POS.middle,
        headerProps: {
            showBackArrow: false,
            headerType: 'title',
            titleText: t('tours_tours'),
        },
        listData: tourListResult,
        loading: tourApiLoading,
        onItemPress: onTourSelect,
        onPanelSettle: _onTourListSnap,
    };

    const objectListCardProps: IObjectListCardPanel = {
        bottomSheetRef: objectListBottomSheetRef,
        initialSnap: PANEL_POS.hidden,
        headerProps: {
            showBackArrow: true,
            headerType: 'title',
            titleText: selectedTour ? tourListResult[tourListResult.findIndex(t => t.id === selectedTour)].title : '',
            handleBackButton: hideObjectList,
        },
        listData: objectListResult,
        loading: objectApiLoading,
        onItemPress: showDetail,
        onPanelSettle: _onObectListSnap,
    };

    const getIndex = () => {
        return objectListResult.findIndex(o => o.objectId === objectResult?.objectId);
    };

    const getPosition = () => {
        const index = getIndex();
        if (index === 0) return 'first';
        if (index === objectListResult.length - 1) return 'last';
        return 'middle';
    };

    const nextItem = () => {
        setObjectApiLoading(true);
        const index = getIndex();
        if (index < objectListResult.length - 1) {
            showDetail(objectListResult[index + 1].objectId);
        }
    };

    const previousItem = () => {
        setObjectApiLoading(true);
        const index = getIndex();
        if (index > 0) {
            showDetail(objectListResult[getIndex() - 1].objectId);
        }
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
        isTour: true,
        positionInTour: getPosition(),
        handleBackwardPress: previousItem,
        handleForwardPress: nextItem,
    };

    function handleAndroidBackButton() {
        if (currentSheet.current === BOTTOMSHEET_TYPE.objectDetails) {
            hideDetail();
            return true;
        } else if (currentSheet.current === BOTTOMSHEET_TYPE.objectList) {
            objectListBottomSheetRef.current?.snapTo(PANEL_POS.hidden);
            tourListBottomSheetRef.current?.snapTo(tourListBottomSheetSnap.current);
            resetObjectList();
            setTimeout(() => setDetailItem(null), 100);
            setTimeout(() => setPreviewItems([]), 100);
            setTimeout(() => setSelectedTour(''), 100);
            currentSheet.current = BOTTOMSHEET_TYPE.tourList;
            return true;
        } else if (
            currentSheet.current === BOTTOMSHEET_TYPE.tourList &&
            tourListBottomSheetSnap.current !== PANEL_POS.bottom
        ) {
            tourListBottomSheetRef.current?.snapTo(PANEL_POS.bottom);
            return true;
        } else {
            return false;
        }
    }

    // if tab in navigator is pressed we want to go back to the tour list
    const onTabPress = () => {
        if (currentSheet.current === BOTTOMSHEET_TYPE.objectDetails) {
            hideDetail();
        }
        if (currentSheet.current === BOTTOMSHEET_TYPE.objectList) {
            hideObjectList();
        }
    };

    // get object list right after screen was rendered
    useEffect(() => {
        // pass function to navigator which should be called when tapping the tab
        navigation.setParams({ tapOnNavigator: onTabPress });
        // get initial user location and get tours/objects
        getCurrentUserLocation(getTourList);

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

    useEffect(() => {
        if (tourListResult) {
            const polyLines = tourListResult.map(tour => tour.polyline);
            if (polyLines.length > 0) {
                mapRef.current.fitToMarkers(polyLines.flat());
            }
        }
    }, [tourListResult]);

    const getObjects = (): IObjectMarker[] => {
        if (selectedTour) return previewItems;
        if (!tourListResult) return [];
        const objects = tourListResult.map(tour => tour.objects).flat();
        // @ts-ignore
        return objects
            .map(o => o.objectId)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(oId => objects.find(o => o.objectId === oId));
    };

    return (
        <>
            <Map
                ref={mapRef}
                objects={getObjects()}
                markerOnPress={() => console.log('marker logic')}
                showTourRoute={selectedTour !== ''}
                panelMovement={panelMovement}
                selectedTourId={selectedTour}
                selectedMarker={detailItem}
                setSelectedMarker={setDetailItem}
                markerPressEnabled={false}
                polyLines={
                    tourListResult
                        ? tourListResult.map(tour => ({
                              tourId: tour.id,
                              polyLine: tour.polyline,
                          }))
                        : null
                }
                onPolyLinePress={onTourSelect}
            />
            <TourListCardPanel {...listCardProps} />

            <ObjectListCardPanel {...objectListCardProps} />

            <DetailCardPanel {...detailCardProps} />
        </>
    );
};

export default withNavigation(TourScreen);

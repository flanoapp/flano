import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { LatLng, Polyline, Region } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import { SafeAreaView } from 'react-native-safe-area-context';

import MapMarker from './MapMarker';
import useLocation from '../../hooks/useLocation';

import { BACKGROUND_COLOR, PRIMARY_COLOR, SECONDARY_LIGHT_COLOR } from '../../styles/globalStyles';
import googleMapStyle from '../../styles/googleMapStyle.json';
import { ITourPolyline } from '../List/TourListItem';
import { calculateMapZoomLevel, generateRandomColors } from '../../utils/utils';

const { height: HEIGHT, width: WIDTH } = Dimensions.get('window');

export interface IObjectMarker {
    objectId: string;
    coordinates: LatLng;
    isTopSpot: boolean;
}

interface IMapProps {
    panelMovement: string;
    objects: Array<IObjectMarker>;
    markerOnPress: (id: string) => void;
    showTourRoute: boolean;
    selectedTourId?: string;
    polyLines?: Array<ITourPolyline> | null;
    onPolyLinePress?: (tourId: string) => void;
    selectedMarker: string | null;
    setSelectedMarker: (id: string) => void;
    markerPressEnabled: boolean;
}

// initial region if user has not given location listData permissions
// or has turned of GPS
const initialRegion = {
    latitude: 48.209,
    longitude: 16.37,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

const Map = forwardRef((props: IMapProps, ref) => {
    const mapRef = useRef<MapView>(null);
    const [ready, setReady] = useState<boolean>(true);
    const currentRegion = useRef<Region>(initialRegion);
    const [objects, setObjects] = useState(props.objects);

    const [showTourRoute, setShowTourRoute] = useState<boolean>(false);

    const [clusterRadius, setClusterradius] = useState<number>(45);

    const focuserPressed = useRef<boolean>(false);
    const [locationFocused, setLocationFocused] = useState<boolean>(false);

    const [polylineColors, setPolylineColors] = useState([]);

    const { checkLocationPermission, getCurrentUserLocation } = useLocation();

    useImperativeHandle(ref, () => ({
        panelSnap(coords: LatLng) {
            const { latitude, latitudeDelta, longitudeDelta } = currentRegion.current;
            const markerInRegion =
                coords.latitude >= latitude - latitudeDelta * 0.07 || coords.latitude <= latitude - latitudeDelta / 2;

            const offset = latitudeDelta * 0.24;

            if (!markerInRegion) {
                console.log('setRegion by panelSnap');
                setRegion({
                    latitude: coords.latitude - offset,
                    longitude: coords.longitude,
                    latitudeDelta,
                    longitudeDelta,
                });
            }
        },
        focusMarker(id: string, coords: LatLng) {
            props.setSelectedMarker(id);
            setLocationFocused(false);

            const { latitude, latitudeDelta, longitude, longitudeDelta } = currentRegion.current;
            const markerInRegion =
                coords.latitude <= latitude + latitudeDelta / 2 &&
                coords.latitude >= latitude - latitudeDelta * 0.07 &&
                coords.longitude <= longitude + longitudeDelta / 2 &&
                coords.longitude >= longitude - longitudeDelta / 2;

            const markerBehindPanel =
                coords.latitude < latitude - latitudeDelta * 0.07 && coords.latitude > latitude - latitudeDelta / 2;

            const newLatDelta = 0.0027;

            // this doesn't do anything but we need to provide it
            const newLngDelta = 0.0023;

            /*
                4 because panel goes until delta/2 and we want the marker centered between panel and top
                + constant in the end to compensate for the marker height
            */
            //const offset = newLatDelta * 0.24;
            const offset = latitudeDelta * 0.24;

            if (!markerInRegion) {
                console.log('setRegion by focusMarker');
                setRegion({
                    latitude: coords.latitude - offset,
                    longitude: coords.longitude,
                    latitudeDelta: markerBehindPanel ? latitudeDelta : newLatDelta,
                    longitudeDelta: markerBehindPanel ? longitudeDelta : newLngDelta,
                });
            }
        },
        fitToMarkers(coords: Array<LatLng>) {
            fitToMarkers(coords);
        },
    }));

    const setRegion = (region: Region) => {
        if (ready) {
            //@ts-ignore
            mapRef.current ? mapRef.current.animateToRegion(region) : null;
        }
    };

    const fitToMarkers = (coords: Array<LatLng>) => {
        if (coords && coords.length > 0) {
            setTimeout(
                () =>
                    //@ts-ignore
                    mapRef.current.fitToCoordinates(coords, {
                        edgePadding: {
                            top: 50,
                            right: 20,
                            bottom: HEIGHT * 0.4,
                            left: 20,
                        },
                        animated: true,
                    }),
                10,
            );
            setLocationFocused(false);
        }
    };

    useEffect(() => {
        console.debug('map did mount');
        getCurrentUserLocation((region: Region) => {
            setRegion(region);
            focuserPressed.current = true;
            setLocationFocused(true);
        });

        setPolylineColors(() => generateRandomColors());
    }, []);

    useEffect(() => {
        setObjects(props.objects);
    }, [props.objects]);

    useEffect(() => {
        setShowTourRoute(props.showTourRoute);
    }, [props.showTourRoute]);

    const onMapReady = () => {
        console.debug('map ready');
        if (!ready) {
            setReady(true);
        }
    };

    const _onRegionChangeComplete = (region: Region) => {
        currentRegion.current = region;
        if (!focuserPressed.current && locationFocused) {
            setLocationFocused(false);
        } else {
            focuserPressed.current = false;
        }

        // determine the current zoom level of the map
        // if zoomed in closer, the markers should not be grouped extensively and stand alone (small radius)
        // if zoomed out further, group markers to reveal more of the map (large radius)
        const zoomlevel = calculateMapZoomLevel(WIDTH, region.longitudeDelta);
        const newRadius = zoomlevel < 18 ? 50 : 10;
        if (clusterRadius != newRadius) {
            setClusterradius(newRadius);
        }
    };

    const _onPress = (coordinates: LatLng, objectId: string) => {
        if (props.markerPressEnabled && props.selectedMarker !== objectId) {
            props.markerOnPress(objectId);
            props.setSelectedMarker(objectId);
        }
    };

    const mapPadding = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 120,
    };

    return (
        <>
            <MapView
                showsUserLocation={true}
                ref={mapRef}
                initialRegion={initialRegion}
                onMapReady={() => onMapReady()}
                showsMyLocationButton={false}
                style={styles.map}
                mapPadding={mapPadding}
                onRegionChangeComplete={_onRegionChangeComplete}
                clusterColor={SECONDARY_LIGHT_COLOR}
                showsCompass={false}
                animationEnabled={false}
                showsPointsOfInterest={false}
                showsTraffic={false}
                radius={clusterRadius}
                extent={600}
                spiralEnabled={true}
                spiderLineColor={PRIMARY_COLOR}
                onPress={() => null}
                userLocationAnnotationTitle={''}
                //@ts-ignore
                customMapStyle={googleMapStyle}
            >
                {objects.map(marker =>
                    // it has to be split up like this because the cluster prop on non selected markers causes errors
                    marker.objectId === props.selectedMarker ? (
                        <MapMarker
                            selected={true}
                            isTopSpot={marker.isTopSpot}
                            coordinate={marker.coordinates}
                            key={marker.objectId}
                            onPress={() => _onPress(marker.coordinates, marker.objectId)}
                            id={marker.objectId}
                            // @ts-ignore
                            //cluster={false} //TODO: disabled because it caused bugs with spirals
                        />
                    ) : (
                        <MapMarker
                            selected={false}
                            isTopSpot={marker.isTopSpot}
                            coordinate={marker.coordinates}
                            key={marker.objectId}
                            onPress={() => _onPress(marker.coordinates, marker.objectId)}
                            id={marker.objectId}
                        />
                    ),
                )}
                {props.polyLines &&
                    props.polyLines.map((line, index) => {
                        if (!showTourRoute || props.selectedTourId === line.tourId) {
                            if (line.polyLine.length > 0) {
                                return (
                                    <Polyline
                                        key={line.tourId}
                                        coordinates={line.polyLine || []}
                                        strokeColor={polylineColors[index % polylineColors.length]}
                                        strokeWidth={4}
                                        lineCap={'round'}
                                        tappable={true}
                                        onPress={() =>
                                            props.onPolyLinePress ? props.onPolyLinePress(line.tourId) : null
                                        }
                                    />
                                );
                            }
                        }
                    })}
            </MapView>

            {/* location Focuser */}
            <SafeAreaView style={styles.locationFocuser}>
                <Icon
                    name={!locationFocused ? 'crosshairs' : 'crosshairs-gps'}
                    type={'material-community'}
                    reverse={true}
                    raised={true}
                    size={25}
                    //background
                    color={BACKGROUND_COLOR}
                    //icon
                    iconProps={{
                        name: !locationFocused ? 'crosshairs' : 'crosshairs-gps',
                        size: 30,
                        color: PRIMARY_COLOR,
                    }}
                    onPress={() => {
                        checkLocationPermission();
                        getCurrentUserLocation((region: Region) => {
                            setRegion(region);
                            focuserPressed.current = true;
                            setLocationFocused(true);
                        });
                    }}
                />
            </SafeAreaView>
        </>
    );
});

const styles = StyleSheet.create({
    map: {
        height: '100%',
    },
    locationFocuser: {
        zIndex: 0,
        position: 'absolute',
        right: 10,
        top: 10,
    },
});

export default Map;

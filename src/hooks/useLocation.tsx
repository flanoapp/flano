import { useState } from 'react';
import { LatLng, Region } from 'react-native-maps';
import { requestPermissionsAsync } from 'expo-location';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = 0.01;

const defaultLocation = {
    latitude: 48.209,
    longitude: 16.37,
};

export default () => {
    const [userLocationErrorMessage, setErrorMessage] = useState<string>('');
    const [currentUserLocation, setCurrentLocation] = useState<LatLng>({
        //default position
        latitude: 48.209,
        longitude: 16.37,
    });
    const { t } = useTranslation();

    const checkLocationPermission = async () => {
        try {
            const { status } = await requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('locationPermissionNotGrantedTitle'), t('locationPermissionNotGranted'));
            }
            return;
        } catch (err) {
            console.log(err);
            setErrorMessage(err);
        }
    };

    const getCurrentUserLocation = async (callback?: (region: Region) => void) => {
        try {
            const { status } = await requestPermissionsAsync();
            if (status !== 'granted') {
                setCurrentLocation(defaultLocation);
                if (callback) {
                    callback({
                        ...defaultLocation,
                        longitudeDelta: LONGITUDE_DELTA,
                        latitudeDelta: LATITUDE_DELTA,
                    });
                }
                return;
            }
        } catch (err) {
            console.log(err);
            setErrorMessage(err);
        }

        try {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const coords = position.coords;
                    setCurrentLocation(coords);
                    if (callback) {
                        callback({
                            longitude: coords.longitude,
                            latitude: coords.latitude,
                            longitudeDelta: LONGITUDE_DELTA,
                            latitudeDelta: LONGITUDE_DELTA,
                        });
                    }
                },

                error => {
                    console.log(error.message);
                },
            );
        } catch (err) {
            console.log(err);
            setErrorMessage(err);
        }
    };

    return { checkLocationPermission, getCurrentUserLocation, currentUserLocation, userLocationErrorMessage } as const;
};

import { useState } from 'react';

import { REQUEST_TIMEOUT, tryAgainAlert } from '../utils/utils';
import { IObjectMarker } from '../components/Map/Map';

import flanoApi from '../api/flanoApi';
import { useTranslation } from 'react-i18next';

export default () => {
    const [markerResult, setMarkerResult] = useState<Array<IObjectMarker>>([]);
    const [markerApiLoading, setMarkerApiLoading] = useState<boolean>(true);
    const [markerApiErrorMessage, setMarkerApiErrorMessage] = useState<string>('');

    const { t } = useTranslation();

    const getAllMarkers = async () => {
        setMarkerApiLoading(true);
        try {
            console.debug('fetch markers');
            const response = await flanoApi.get('/objects/markers', { timeout: REQUEST_TIMEOUT });
            setMarkerResult(response.data);
        } catch (err) {
            console.debug(err);
            setMarkerApiErrorMessage(err);
            tryAgainAlert(t('couldNotLoadMarkers'), () => getAllMarkers());
        } finally {
            setMarkerApiLoading(false);
        }
    };

    const getMarkersBySearch = async (searchTerm: string, categories: Array<string>) => {
        setMarkerApiLoading(true);
        try {
            console.debug(`find markers by term: "${searchTerm}" and categories [${categories}]`);
            const response = await flanoApi.get('/objects/markers', {
                params: {
                    search: searchTerm,
                    categories: categories.length > 0 ? JSON.stringify(categories) : '',
                },
                timeout: REQUEST_TIMEOUT,
            });
            setMarkerResult(response.data);
        } catch (err) {
            console.debug(err);
            setMarkerApiErrorMessage(err);
            tryAgainAlert(t('couldNotLoadSearchMarkers'), () => getMarkersBySearch(searchTerm, categories));
        } finally {
            setMarkerApiLoading(false);
        }
    };

    return [getAllMarkers, getMarkersBySearch, markerResult, markerApiLoading, markerApiErrorMessage] as const;
};

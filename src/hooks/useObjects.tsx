import { useState } from 'react';
import { LatLng } from 'react-native-maps';

import flanoApi from '../api/flanoApi';
import { IObjectDetailItem } from '../components/Card/DetailCardPanel';
import { IObjectListItem } from '../components/List/ObjectListItem';

import { REQUEST_TIMEOUT, tryAgainAlert } from '../utils/utils';
import { useTranslation } from 'react-i18next';

const PAGE_LENGTH = 20;

export default () => {
    const [objectResult, setObjectResult] = useState<IObjectDetailItem | null>(null);
    const [objectListResult, setObjectListResult] = useState<Array<IObjectListItem>>([]);
    const [objectApiErrorMessage, setObjectApiErrorMessage] = useState('');
    const [objectApiLoading, setObjectApiLoading] = useState<boolean>(true);
    const [allObjectsEndReached, setAllObjectsEndReached] = useState<boolean>(false);
    const [searchResult, setSearchResult] = useState<Array<IObjectListItem>>([]);
    const [searchEndReached, setSearchEndReached] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [categories, setCategories] = useState<Array<string>>([]);
    const [position, setPosition] = useState<LatLng>({
        latitude: 48.209,
        longitude: 16.37,
    });

    const { t } = useTranslation();

    const resetObjectList = () => {
        setObjectListResult([]);
    };

    const getObject = async (id: string) => {
        setObjectResult(null);
        setObjectApiLoading(true);
        try {
            console.log('fetch object: ', id);
            const response = await flanoApi.get('/objects/' + id.toString(), { timeout: REQUEST_TIMEOUT });
            setObjectResult(response.data);
        } catch (err) {
            console.log(err);
            tryAgainAlert(t('couldNotLoadObject'), () => getObject(id));
            setObjectApiErrorMessage(err);
        } finally {
            setObjectApiLoading(false);
        }
    };

    const getAllObjects = async (position: LatLng) => {
        setObjectApiLoading(true);
        try {
            console.log('fetch object list');
            const response = await flanoApi.get('/objects/', {
                params: {
                    skip: 0,
                    limit: PAGE_LENGTH,
                    longitude: position.longitude,
                    latitude: position.latitude,
                },
                timeout: REQUEST_TIMEOUT,
            });

            setObjectListResult(response.data);
            if (response.data.length < PAGE_LENGTH) {
                setAllObjectsEndReached(true);
            }
        } catch (err) {
            console.log(err);
            tryAgainAlert(t('couldNotLoadObjects'), () => getAllObjects(position));
            setObjectApiErrorMessage(err);
        } finally {
            setObjectApiLoading(false);
        }
    };

    const loadObjectListPage = async (position: LatLng) => {
        setObjectApiLoading(true);
        try {
            console.log('load object list page');
            const response = await flanoApi.get('/objects/', {
                params: {
                    //latitude: 48.209,
                    //longitude: 16.37,
                    latitude: position.latitude,
                    longitude: position.longitude,
                    skip: objectListResult.length,
                    limit: PAGE_LENGTH,
                },
                timeout: REQUEST_TIMEOUT,
            });

            if (response.data.length < PAGE_LENGTH) {
                setAllObjectsEndReached(true);
            }
            const newResultList = objectListResult.concat(response.data);
            setObjectListResult(newResultList);
        } catch (err) {
            console.log(err);
            tryAgainAlert(t('couldNotLoadObjects'), () => loadObjectListPage(position));
            setObjectApiErrorMessage(err);
        } finally {
            setObjectApiLoading(false);
        }
    };

    const getObjectList = async (ids: Array<string>, position: LatLng) => {
        setObjectListResult([]);
        setObjectApiLoading(true);
        try {
            console.log(`load objects with ids: ${ids}`);
            const idString = JSON.stringify(ids);
            const response = await flanoApi.get('/objects/find', {
                params: {
                    objects: idString,
                    latitude: position.latitude,
                    longitude: position.longitude,
                },
                timeout: REQUEST_TIMEOUT,
            });
            setObjectListResult(response.data);
        } catch (err) {
            console.log(err);
            tryAgainAlert(t('couldNotLoadObjects'), () => getObjectList(ids, position));

            setObjectApiErrorMessage(err);
        } finally {
            setObjectApiLoading(false);
        }
    };

    const toggleLikeObject = async (id: string, like: boolean) => {
        try {
            const endpoint = like ? 'like' : 'unlike';
            console.log(`${endpoint} object with id ${id}`);
            const response = await flanoApi.patch(`/objects/${id}/${endpoint}`, { timeout: REQUEST_TIMEOUT });
            setObjectResult(response.data);
        } catch (err) {
            console.log(err);
            //TODO try again or not?
            setObjectApiErrorMessage(err);
        }
    };

    const searchObjects = async (position: LatLng, searchTerm: string, categories: Array<string>) => {
        setSearchResult([]);
        setObjectApiLoading(true);
        setSearchEndReached(false);
        try {
            console.log(
                `find objects by term: "${searchTerm}" and categories ${categories} on location [${position.latitude}, ${position.longitude}]`,
            );
            const response = await flanoApi.get('/objects/', {
                params: {
                    latitude: position.latitude,
                    longitude: position.longitude,
                    skip: 0,
                    limit: PAGE_LENGTH,
                    search: searchTerm,
                    categories: categories.length > 0 ? JSON.stringify(categories) : '',
                },
                timeout: REQUEST_TIMEOUT,
            });

            if (response.data.length < PAGE_LENGTH) {
                setSearchEndReached(true);
            }
            setSearchResult(response.data);
            // save parameters for next page load
            setCategories(categories);
            setPosition(position);
            setSearchTerm(searchTerm);
        } catch (err) {
            console.log(err);
            setObjectApiErrorMessage(err);
            tryAgainAlert(t('couldNotLoadSearch'), () => searchObjects(position, searchTerm, categories));
        } finally {
            setObjectApiLoading(false);
        }
    };

    const loadSearchResultPage = async () => {
        setObjectApiLoading(true);
        try {
            console.log(`load search result page`);
            const response = await flanoApi.get('/objects/', {
                params: {
                    latitude: position.latitude,
                    longitude: position.longitude,
                    skip: searchResult.length,
                    limit: PAGE_LENGTH,
                    search: searchTerm,
                    categories: categories.length > 0 ? JSON.stringify(categories) : '',
                },
            });
            if (response.data.length < PAGE_LENGTH) {
                console.log(response.data.length);
                setSearchEndReached(true);
            }
            const newResultList = searchResult.concat(response.data);
            setSearchResult(newResultList);
        } catch (err) {
            console.log(err);
            tryAgainAlert(t('couldNotLoadSearch'), () => loadSearchResultPage());
            setObjectApiErrorMessage(err);
        } finally {
            setObjectApiLoading(false);
        }
    };

    return {
        getObject,
        getAllObjects,
        loadObjectListPage,
        getObjectList,
        toggleLikeObject,
        searchObjects,
        loadSearchResultPage,
        resetObjectList,
        setObjectApiLoading,
        objectResult,
        objectListResult,
        searchResult,
        objectApiErrorMessage,
        objectApiLoading,
        allObjectsEndReached,
        searchEndReached,
    } as const;
};

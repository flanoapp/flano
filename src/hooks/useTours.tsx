import { useState } from 'react';

import flanoApi from '../api/flanoApi';
import { ITourListItem } from '../components/List/TourListItem';

import { REQUEST_TIMEOUT, tryAgainAlert } from '../utils/utils';
import { useTranslation } from 'react-i18next';

export interface IUseTours {}

export default () => {
    const [tourResult, setTourResult] = useState<ITourListItem>();
    const [tourListResult, setTourListResult] = useState<Array<ITourListItem>>([]);
    const [tourApiErrorMessage, setTourErrorMessage] = useState<string>('');
    const [tourApiLoading, setTourApiLoading] = useState<boolean>(true);

    const { t } = useTranslation();

    const getTourList = async () => {
        setTourApiLoading(true);
        try {
            console.log('fetch tour list');
            const response = await flanoApi.get('/tours/', { timeout: REQUEST_TIMEOUT });
            setTourListResult(response.data);
        } catch (err) {
            console.log(err);
            setTourErrorMessage(err);
            tryAgainAlert(t('couldNotLoadTours'), () => getTourList());
        } finally {
            setTourApiLoading(false);
        }
    };

    const getTour = async (id: string) => {
        setTourApiLoading(true);
        try {
            console.log('fetch tour with id: ', id);
            const response = await flanoApi.get('/tours/' + id, { timeout: REQUEST_TIMEOUT });
            setTourResult(response.data);
        } catch (err) {
            console.log(err);
            setTourErrorMessage(err);
            tryAgainAlert(t('couldNotLoadTour'), () => getTour(id));
        } finally {
            setTourApiLoading(false);
        }
    };

    return { getTourList, getTour, tourResult, tourListResult, tourApiErrorMessage, tourApiLoading } as const;
};

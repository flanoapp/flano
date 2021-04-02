import { useEffect, useState } from 'react';

import flanoApi from '../api/flanoApi';
import { REQUEST_TIMEOUT } from '../utils/utils';

export default () => {
    const [categoriesResult, setCategoriesResult] = useState<Array<string>>([]);
    const [categoriesApiLoading, setCategoriesApiLoading] = useState<boolean>(true);
    const [categoriesApiErrorMessage, setCategoriesApiErrorMessage] = useState<string>('');

    const getCategories = async () => {
        setCategoriesApiLoading(true);
        try {
            console.log('fetch object categories');
            const response = await flanoApi.get('/categories', { timeout: REQUEST_TIMEOUT });
            setCategoriesResult(response.data);
        } catch (err) {
            console.log(err);
            setCategoriesApiErrorMessage(err);
            //TODO try again?
            setCategoriesApiLoading(false);
        } finally {
            setCategoriesApiLoading(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    return [getCategories, categoriesResult, categoriesApiLoading, categoriesApiErrorMessage] as const;
};

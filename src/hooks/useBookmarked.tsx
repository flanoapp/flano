import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

import { isObjectBookmarked } from '../utils/utils';

export default (objectId: string, loading: boolean) => {
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

    const resetBookmarkedState = () => {
        setIsBookmarked(false);
    };

    const toggleBookmarkedObject = async () => {
        try {
            const currentBookmarked = await AsyncStorage.getItem('@bookmarked_objects');
            const currentBookmarkedArr: Array<string> = JSON.parse(currentBookmarked || '[]');

            const alreadyBookmarked = await isObjectBookmarked(objectId);

            let newBookmarked;
            if (alreadyBookmarked) {
                newBookmarked = currentBookmarkedArr.filter(o => o !== objectId);
                await AsyncStorage.setItem('@bookmarked_objects', JSON.stringify(newBookmarked));
                setIsBookmarked(false);
            } else {
                newBookmarked = [...currentBookmarkedArr, objectId];
                await AsyncStorage.setItem('@bookmarked_objects', JSON.stringify(newBookmarked));
                setIsBookmarked(true);
            }
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (!loading) {
            isObjectBookmarked(objectId).then(bookmarked => {
                setIsBookmarked(bookmarked || false);
            });
        }
    }, [loading]);

    return [toggleBookmarkedObject, resetBookmarkedState, isBookmarked] as const;
};

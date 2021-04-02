import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

import { isObjectLiked } from '../utils/utils';

export default (objectId: string, loading: boolean) => {
    const [isLiked, setIsLiked] = useState<boolean>(false);

    const resetLikedState = () => {
        setIsLiked(false);
    };

    const toggleLikedObject = async (callback: (id: string, like: boolean) => void) => {
        try {
            const currentLiked = await AsyncStorage.getItem('@liked_objects');
            const currentLikedArr: Array<string> = JSON.parse(currentLiked || '[]');

            const alreadyLiked = await isObjectLiked(objectId);

            let newLiked;
            if (alreadyLiked) {
                // remove from liked list
                newLiked = currentLikedArr.filter(o => o !== objectId);
                await AsyncStorage.setItem('@liked_objects', JSON.stringify(newLiked));
                setIsLiked(false);
                callback(objectId, false);
            } else {
                // add to liked list
                newLiked = [...currentLikedArr, objectId];
                await AsyncStorage.setItem('@liked_objects', JSON.stringify(newLiked));
                setIsLiked(true);
                callback(objectId, true);
            }
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (!loading) {
            isObjectLiked(objectId).then(bookmarked => {
                setIsLiked(bookmarked || false);
            });
        }
    }, [loading]);

    return [toggleLikedObject, resetLikedState, isLiked] as const;
};

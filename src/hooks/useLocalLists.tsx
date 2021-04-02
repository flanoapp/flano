import { useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

import { isObjectBookmarked, isObjectLiked } from '../utils/utils';

export default () => {
    const [currentlyLiked, setCurrentlyLiked] = useState<Array<string>>([]);
    const [currentlyBookmarked, setCurrentlyBookmarked] = useState<Array<string>>([]);

    const getLikedObjects = async (callback: Function) => {
        try {
            const currentLikedList = await AsyncStorage.getItem('@liked_objects');
            const currentLikedArr: Array<string> = JSON.parse(currentLikedList || '[]');
            setCurrentlyLiked(currentLikedArr);
            callback(currentLikedArr);
        } catch (e) {
            console.log(e);
        }
    };

    const toggleLiked = async (objectId: string, callback: (id: string, like: boolean) => void) => {
        try {
            const currentLikedList = await AsyncStorage.getItem('@liked_objects');
            const currentLikedArr: Array<string> = JSON.parse(currentLikedList || '[]');

            const alreadyLiked = await isObjectLiked(objectId);

            let newLiked;
            if (alreadyLiked) {
                //remove from liked list
                newLiked = currentLikedArr.filter(o => o !== objectId);
                await AsyncStorage.setItem('@liked_objects', JSON.stringify(newLiked));
                setCurrentlyLiked(currentlyLiked.filter(o => o !== objectId));
                callback(objectId, false);
            } else {
                //add to liked list
                newLiked = [...currentLikedArr, objectId];
                await AsyncStorage.setItem('@liked_objects', JSON.stringify(newLiked));
                setCurrentlyLiked([...currentlyLiked, objectId]);
                callback(objectId, true);
            }
            console.log('new Liked:', newLiked);
        } catch (e) {
            console.log(e);
        }
    };

    const getBookmarkedObjects = async (callback: Function) => {
        try {
            const currentlyBookmarkedList = await AsyncStorage.getItem('@bookmarked_objects');
            const currentlyBookmarkedArr: Array<string> = JSON.parse(currentlyBookmarkedList || '[]');
            setCurrentlyBookmarked(currentlyBookmarkedArr);
            callback(currentlyBookmarkedArr);
        } catch (e) {
            console.log(e);
        }
    };

    const toggleBookmarked = async (objectId: string) => {
        try {
            const currentlyBookmarkedList = await AsyncStorage.getItem('@bookmarked_objects');
            const currentlyBookmarkedArr: Array<string> = JSON.parse(currentlyBookmarkedList || '[]');

            const alreadyBookmarked = await isObjectBookmarked(objectId);

            let newBookmarked;
            if (alreadyBookmarked) {
                newBookmarked = currentlyBookmarkedArr.filter(o => o !== objectId);
                await AsyncStorage.setItem('@bookmarked_objects', JSON.stringify(newBookmarked));
                setCurrentlyBookmarked(currentlyBookmarked.filter(o => o !== objectId));
            } else {
                newBookmarked = [...currentlyBookmarkedArr, objectId];
                await AsyncStorage.setItem('@bookmarked_objects', JSON.stringify(newBookmarked));
                setCurrentlyBookmarked([...currentlyBookmarked, objectId]);
            }
            console.log('new Bookmarked:', newBookmarked);
        } catch (e) {
            console.log(e);
        }
    };

    return {
        getLikedObjects,
        toggleLiked,
        getBookmarkedObjects,
        toggleBookmarked,
        currentlyLiked,
        currentlyBookmarked,
    } as const;
};

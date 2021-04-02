import React, { FC } from 'react';
import { StyleSheet,Platform, View } from 'react-native';
import { Button } from 'react-native-elements';
import { LatLng } from 'react-native-maps';
import { showLocation } from 'react-native-map-link';
import { useTranslation } from 'react-i18next';

import BottomSheetTouchable from '../BottomSheetTouchable';

import globalStyles, {
    iconButtonSize,
    PRIMARY_COLOR,
    PRIMARY_TEXT_COLOR,
    SECONDARY_TEXT_COLOR,
} from '../../styles/globalStyles';

interface IButtonBar {
    likeCount: number;
    isLiked: boolean;
    handleLikePress: () => Promise<void>;
    isBookmarked: boolean;
    handleBookmarkPress: () => Promise<void>;
    handleSharePress: () => Promise<void>;
    coords: LatLng;
    isTour: boolean;
    positionInTour?: 'first' | 'middle' | 'last';
    handleBackwardPress: () => void;
    handleForwardPress: () => void;
}

const ButtonBar: FC<IButtonBar> = props => {
    const {
        coords,
        likeCount,
        isLiked,
        handleLikePress,
        isBookmarked,
        handleBookmarkPress,
        handleSharePress,
        isTour = false,
        positionInTour = 'first',
        handleBackwardPress,
        handleForwardPress,
    } = props;
    const { t } = useTranslation();

    const isFirstElement = positionInTour === 'first';
    const isLastElement = positionInTour === 'last';

    const iconProps = {
        size: iconButtonSize,
        type: 'material-community',
        color: PRIMARY_TEXT_COLOR,
    };

    const arrowProps = {
        size: 20,
        type: 'font-awesome-5',
        color: PRIMARY_TEXT_COLOR,
    };

    const likedProps = {
        ...iconProps,
        name: isLiked ? 'heart' : 'heart-outline',
        color: isLiked ? PRIMARY_COLOR : PRIMARY_TEXT_COLOR,
    };
    const bookmarkedProps = {
        ...iconProps,
        name: isBookmarked ? 'bookmark' : 'bookmark-outline',
        color: isBookmarked ? PRIMARY_COLOR : PRIMARY_TEXT_COLOR,
    };
    const shareProps = {
        ...iconProps,
        name: Platform.OS === 'ios' ? 'export-variant' : 'share-variant',
        size: 30,
        marginBottom: 2,
    };

    const directionProps = {
        ...iconProps,
        name: 'map-outline',
    };

    const backwardProps = {
        ...arrowProps,
        name: 'arrow-left',
        disabled: isFirstElement,
        iconStyle: isFirstElement ? styles.arrowDisabled : {},
        onPress: handleBackwardPress,
    };

    const forwardProps = {
        ...arrowProps,
        name: 'arrow-right',
        disabled: isLastElement,
        iconStyle: isLastElement ? styles.arrowDisabled : {},
        onPress: handleForwardPress,
    };

    // options for map link, to open coordinates of an object in external maps app
    // for more info see: https://github.com/flexible-agency/react-native-map-link
    const showLocationOptions = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        googleForceLatLon: true,
        alwaysIncludeGoogle: true,
        dialogTitle: t('extNav_dialogTitle'),
        dialogMessage: t('extNav_dialogMessage'),
        cancelText: t('cancel'),
    };

    return (
        <View style={styles.buttonContainer}>
            {/* previous tour item button */}
            {isTour && (
                <BottomSheetTouchable onPress={handleBackwardPress} disabled={isFirstElement}>
                    <Button
                        type='clear'
                        containerStyle={styles.buttonStyle}
                        icon={backwardProps}
                        iconContainerStyle={styles.arrow}
                        onPress={handleBackwardPress}
                        disabled={isFirstElement}
                    />
                </BottomSheetTouchable>
            )}
            {/* like button */}
            <BottomSheetTouchable onPress={handleLikePress}>
                <Button
                    type='clear'
                    containerStyle={styles.buttonStyle}
                    icon={likedProps}
                    titleStyle={styles.likeCount}
                    title={`${likeCount}`}
                    onPress={handleLikePress}
                />
            </BottomSheetTouchable>

            {/* bookmark button */}
            <BottomSheetTouchable onPress={handleBookmarkPress}>
                <Button
                    type='clear'
                    containerStyle={styles.buttonStyle}
                    icon={bookmarkedProps}
                    onPress={handleBookmarkPress}
                />
            </BottomSheetTouchable>

            {/* share button */}
            <View style={styles.autoMargin}>
                <BottomSheetTouchable onPress={handleSharePress}>
                    <Button
                        type='clear'
                        containerStyle={StyleSheet.flatten([styles.buttonStyle, styles.autoMargin])}
                        icon={shareProps}
                        onPress={handleSharePress}
                    />
                </BottomSheetTouchable>
            </View>

            {/* map link button: opens coordinates in external maps app */}
            <BottomSheetTouchable onPress={() => showLocation(showLocationOptions)}>
                <Button
                    type='clear'
                    containerStyle={styles.buttonStyle}
                    icon={directionProps}
                    onPress={() => showLocation(showLocationOptions)}
                />
            </BottomSheetTouchable>

            {/* next tour item button */}
            {isTour && (
                <BottomSheetTouchable onPress={handleForwardPress} disabled={isLastElement}>
                    <Button
                        type='clear'
                        containerStyle={styles.buttonStyle}
                        icon={forwardProps}
                        iconContainerStyle={styles.arrow}
                        onPress={handleForwardPress}
                        disabled={isLastElement}
                    />
                </BottomSheetTouchable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginVertical: 8,
        alignItems: 'center',
    },
    buttonStyle: {},
    autoMargin: {
        marginLeft: 'auto',
    },
    likeCount: {
        width: 15,
        fontSize: 13,
        alignSelf: 'flex-end',
        marginBottom: -6,
        marginLeft: -10,
        color: PRIMARY_TEXT_COLOR,
        fontFamily: 'OpenSans SemiBold',
    },
    arrow: {
        marginHorizontal: 0,
    },
    arrowDisabled: {
        color: SECONDARY_TEXT_COLOR,
        ...globalStyles.background,
    },
});

export default ButtonBar;

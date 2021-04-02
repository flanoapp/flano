import {
    ActivityIndicator,
    Dimensions,
    Share,
    StatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import React, { FC, RefObject, useCallback, useState } from 'react';
import { Divider, Image } from 'react-native-elements';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import ImageViewing from 'react-native-image-viewing';
import { ImageSource } from 'react-native-image-viewing/dist/@types';
import { LatLng } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CardHeader, { ICardHeader } from './CardHeader';
import ButtonBar from '../Details/ButtonBar';
import DetailsEntries from '../Details/DetailsEntries';
import useBookmarked from '../../hooks/useBookmarked';
import useLiked from '../../hooks/useLiked';

import LoadingIndicator from '../../utils/LoadingIndicator';
import { BOTTOMSHEET_SNAPPOINTS, BOTTOMSHEET_SNAPPOINTS_INSET, PANEL_POS, tryAgainAlert } from '../../utils/utils';
import { useTranslation } from 'react-i18next';
import globalStyles from '../../styles/globalStyles';
import ImageFooter from '../Details/ImageViewer/ImageFooter';
import BottomSheetTouchableWithoutFeedback from '../BottomSheetTouchableWithoutFeedback';

const { height: HEIGHT } = Dimensions.get('window');

export interface IObjectDetailImage {
    imageSrc: string;
    copyright: {
        title: string;
        author: string;
        resourceUrl: string;
        license: string;
        licenseUrl: string;
    };
}

export interface IObjectDetailItem {
    objectId: string;
    coordinates: LatLng;
    isTopSpot: boolean;
    images: Array<IObjectDetailImage>;
    likeCount: number;
    details: {
        title: string;
        artist: string;
        category: string;
        date: string;
    };
}

export interface IDetailCardPanel {
    headerProps: ICardHeader;
    detailData: IObjectDetailItem | null;
    onPanelSettle: (index: number) => void; // action which should be called after bottomSheet settles in a snap point
    loading: boolean;
    handleLike: (id: string, like: boolean) => void; // api call after user clicks on the like button
    isTour?: boolean; // determines whether the object is part of a tour to display additional control elements
    positionInTour?: 'first' | 'middle' | 'last';
    // functions which are called when user presses back/forwards buttons in the detail view of a tour object
    handleBackwardPress?: () => void;
    handleForwardPress?: () => void;
    bottomSheetRef: RefObject<ScrollBottomSheet<IObjectDetailItem>>;
}

const DetailCardPanel: FC<IDetailCardPanel> = props => {
    const {
        bottomSheetRef,
        headerProps,
        detailData,
        onPanelSettle,
        loading,
        handleLike,
        isTour = false,
        positionInTour = 'middle',
        handleBackwardPress = () => console.log('something went wrong'),
        handleForwardPress = () => console.log('something went wrong'),
    } = props;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets(); // insets for phones with notch

    // hooks for handling likes and bookmarks
    // bookmarks should be stored locally, likes lead to and api call to increment the counter (also saved locally)
    const [toggleLiked, resetLikedState, isLiked] = useLiked(detailData?.objectId || '', loading);
    const [toggleBookmarked, resetBookmarkedState, isBookmarked] = useBookmarked(detailData?.objectId || '', loading);

    // state which determines whether the images should be displayed in fullscreen
    const [imageFullScreenVisible, setImageFullScreenVisible] = useState(false);

    const setImageFullscreen = (fullscreen: boolean) => {
        const timeout = fullscreen ? 0 : 20;
        setTimeout(() => StatusBar.setHidden(fullscreen), timeout);
        setImageFullScreenVisible(fullscreen);
    };

    // if share button is pressed, native share menu should be opened
    const handleSharePress = async () => {
        try {
            // create link pointing to the object
            const shareUrl = `https://flano.at/objects/${detailData?.objectId}`;
            const result = await Share.share({
                title: t('share_title'),
                message: t('share_message', { url: shareUrl }),
                url: shareUrl,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            tryAgainAlert(t('couldNotShare'), handleSharePress);
        }
    };

    const renderHeader = () => (
        <CardHeader
            {...headerProps}
            //handleBackButton={_handleBackButton}
            titleText={loading ? '' : detailData?.details.title}
            handleFocusSearch={() => bottomSheetRef.current?.snapTo(PANEL_POS.top)}
            handleBlurSearch={() => bottomSheetRef.current?.snapTo(PANEL_POS.middle)}
            handleBackButton={() => {
                if (headerProps.handleBackButton) {
                    headerProps.handleBackButton();
                }
                resetBookmarkedState();
                resetLikedState();
            }}
        />
    );

    const renderBody = () => {
        if (loading) {
            // show a loading indicator if data to object is being fetched from the API
            return <LoadingIndicator />;
        }
        return (
            // we have to wrap all the content in a touchable, otherwise it is not scrollable
            // this is due to the used bottom sheet library
            <TouchableWithoutFeedback>
                <View style={styles.contentContainer}>
                    {/* only render content if the data was fetched before */}
                    {detailData && (
                        <>
                            {/* tapping on the image should open the images in fullscreen */}
                            <BottomSheetTouchableWithoutFeedback onPress={() => setImageFullscreen(true)}>
                                <Image
                                    // render the first image, all others can be viewed in fullscreen
                                    source={{ uri: detailData?.images[0].imageSrc }}
                                    style={styles.image}
                                    onPress={() => setImageFullscreen(true)}
                                    PlaceholderContent={<LoadingIndicator />}
                                />
                            </BottomSheetTouchableWithoutFeedback>
                            <ButtonBar
                                likeCount={detailData.likeCount}
                                isLiked={isLiked}
                                handleLikePress={() => toggleLiked(handleLike)}
                                isBookmarked={isBookmarked}
                                handleBookmarkPress={toggleBookmarked}
                                handleSharePress={handleSharePress}
                                coords={detailData.coordinates}
                                isTour={isTour}
                                positionInTour={positionInTour}
                                handleBackwardPress={handleBackwardPress}
                                handleForwardPress={handleForwardPress}
                            />
                            <Divider />
                            <DetailsEntries details={detailData.details} isTopSpot={detailData.isTopSpot} />
                        </>
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    };

    // callback function called after bottom sheet settles on a snap point
    // important to handle marker focusing in case of occlusions
    const _onSettle = useCallback(index => {
        if (index !== PANEL_POS.hidden) {
            onPanelSettle(index);
        }
    }, []);

    const snapPoints = [
        BOTTOMSHEET_SNAPPOINTS.top,
        HEIGHT - (BOTTOMSHEET_SNAPPOINTS_INSET.middle + insets.bottom),
        HEIGHT - (BOTTOMSHEET_SNAPPOINTS_INSET.bottom + insets.bottom),
        BOTTOMSHEET_SNAPPOINTS.hidden,
    ];

    return (
        <>
            <ScrollBottomSheet<IObjectDetailItem>
                ref={bottomSheetRef}
                componentType='ScrollView'
                snapPoints={snapPoints}
                initialSnapIndex={PANEL_POS.hidden}
                renderHandle={renderHeader}
                onSettle={_onSettle}
                containerStyle={styles.container}
                contentContainerStyle={styles.container}
            >
                {renderBody()}
            </ScrollBottomSheet>
            {detailData && (

                // show all images in fullscreen if tapped on image
                <ImageViewing
                    images={detailData.images.map(image => {
                        return { uri: image.imageSrc } as ImageSource;
                    })}
                    // show first image initially
                    imageIndex={0}
                    // show fullscreen image viewer on tap on image
                    visible={imageFullScreenVisible}
                    // update state to hide fullscreen
                    onRequestClose={() => {
                        setImageFullscreen(false);
                        // setShowLongText(false);
                    }}
                    // footer containing copyright data about the image
                    FooterComponent={({ imageIndex }) => <ImageFooter {...detailData?.images[imageIndex].copyright} />}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        ...globalStyles.background,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    image: {
        height: 150,
        resizeMode: 'cover',
    },
});
export default DetailCardPanel;

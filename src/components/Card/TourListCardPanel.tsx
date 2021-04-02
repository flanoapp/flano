import React, { FC, RefObject, useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { useTranslation } from 'react-i18next';

import CardHeader, { ICardHeader } from './CardHeader';
import TourListItem, { ITourListItem } from '../List/TourListItem';

import globalStyles, { SECONDARY_TEXT_COLOR, TOUR_LIST_ITEM_HEIGHT } from '../../styles/globalStyles';
import LoadingIndicator from '../../utils/LoadingIndicator';
import { BOTTOMSHEET_SNAPPOINTS, BOTTOMSHEET_SNAPPOINTS_INSET, PANEL_POS } from '../../utils/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: HEIGHT, width: WIDTH } = Dimensions.get('window');

export interface ITourListCardPanel {
    bottomSheetRef: RefObject<ScrollBottomSheet<ITourListItem>>;
    initialSnap?: number;
    headerProps: ICardHeader;
    listData: Array<ITourListItem>;
    loading: boolean;
    onItemPress: (item: string) => void;
    onPanelSettle?: (index: number) => void;
    onPreview?: (id: string) => void;
}

const TourListCardPanel: FC<ITourListCardPanel> = props => {
    const {
        bottomSheetRef,
        initialSnap,
        headerProps,
        listData,
        loading,
        onItemPress,
        onPanelSettle,
        onPreview,
    } = props;

    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [selectedTour, setSelectedTour] = useState('');

    const renderHeader = () => (
        <CardHeader
            {...headerProps}
            handleFocusSearch={() => bottomSheetRef.current?.snapTo(PANEL_POS.top)}
            handleBlurSearch={() => bottomSheetRef.current?.snapTo(PANEL_POS.middle)}
        />
    );

    const renderEmptyContainer = () => {
        if (!loading) {
            return (
                <View>
                    <Text style={styles.emptyContainer}>{t('tours_noToursFound')}</Text>
                </View>
            );
        }
        return null;
    };

    //set value of ref in parent to persist last snapped index
    const _onSettle = useCallback(index => {
        onPanelSettle ? onPanelSettle(index) : null;
    }, []);

    const getItemLayout = (data: ITourListItem[] | null | undefined, index: number) => ({
        length: TOUR_LIST_ITEM_HEIGHT,
        offset: TOUR_LIST_ITEM_HEIGHT * index,
        index,
    });

    const renderFooter = () => {
        if (loading) {
            return <LoadingIndicator />;
        }
        return null;
    };

    const snapPoints = [
        BOTTOMSHEET_SNAPPOINTS.top,
        HEIGHT - (BOTTOMSHEET_SNAPPOINTS_INSET.middle + insets.bottom),
        HEIGHT - (BOTTOMSHEET_SNAPPOINTS_INSET.bottom + insets.bottom),
        BOTTOMSHEET_SNAPPOINTS.hidden,
    ];

    return (
        <ScrollBottomSheet<ITourListItem>
            ref={bottomSheetRef}
            componentType='FlatList'
            snapPoints={snapPoints}
            initialSnapIndex={initialSnap ? initialSnap : PANEL_POS.middle}
            renderHandle={renderHeader}
            data={listData}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <TourListItem
                    {...item}
                    selected={item.id === selectedTour}
                    onPress={onItemPress}
                />
            )}
            getItemLayout={getItemLayout}
            containerStyle={styles.container}
            contentContainerStyle={styles.container}
            viewabilityConfig={{ itemVisiblePercentThreshold: 90 }}
            onSettle={_onSettle}
            ListEmptyComponent={renderEmptyContainer}
            ListFooterComponent={renderFooter}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        ...globalStyles.background,
    },
    emptyContainer: {
        textAlign: 'center',
        color: SECONDARY_TEXT_COLOR,
    },
});

export default TourListCardPanel;

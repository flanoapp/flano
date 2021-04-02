import React, { FC, RefObject, useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, Keyboard, StyleSheet, Text, View } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { LatLng } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import CardHeader, { ICardHeader } from './CardHeader';
import ObjectListItem, { IObjectListItem } from '../List/ObjectListItem';
import { BOTTOMSHEET_SNAPPOINTS, BOTTOMSHEET_SNAPPOINTS_INSET, PANEL_POS } from '../../utils/utils';
import useLocation from '../../hooks/useLocation';

import globalStyles, { OBJECT_LIST_ITEM_HEIGHT } from '../../styles/globalStyles';
import LoadingIndicator from '../../utils/LoadingIndicator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: HEIGHT, width: WIDTH } = Dimensions.get('window');

export interface IObjectListCardPanel {
    bottomSheetRef: RefObject<ScrollBottomSheet<IObjectListItem>>;
    initialSnap?: number;
    headerProps: ICardHeader;
    listData: Array<IObjectListItem>;
    loading: boolean;
    onItemPress: (item: string) => void;
    onPanelSettle: (index: number) => void;
    loadPage?: () => void;
    searchObjects?: (position: LatLng, searchterm: string, categories: Array<string>) => void;
    searchActive?: boolean;
    setSearchActive?: (active: boolean) => void;
    loadSearchPage?: () => void;
    allObjectsEndReached?: boolean;
    searchEndReached?: boolean;
}

const ObjectListCardPanel: FC<IObjectListCardPanel> = props => {
    const {
        bottomSheetRef,
        initialSnap,
        headerProps,
        listData,
        loading,
        onItemPress,
        onPanelSettle,
        loadPage,
        searchObjects,
        searchActive,
        setSearchActive,
        loadSearchPage,
        allObjectsEndReached,
        searchEndReached,
    } = props;
    const [hasScrolled, setHasScrolled] = useState<boolean>(false);

    const { getCurrentUserLocation, currentUserLocation, userLocationErrorMessage } = useLocation();

    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const handleSearchSubmit = (searchTerm: string, categories: Array<string>) => {
        setSearchActive ? setSearchActive(true) : null;
        headerProps.handleSearchSubmit ? headerProps.handleSearchSubmit(searchTerm, categories) : null;
        getCurrentUserLocation(position => (searchObjects ? searchObjects(position, searchTerm, categories) : null));
    };

    const handleSearchCancel = () => {
        setSearchActive ? setSearchActive(false) : null;
    };

    const handleLoadMore = () => {
        if (!hasScrolled) {
            return;
        }
        if (!loading) {
            if (!searchActive && !allObjectsEndReached && loadPage) {
                loadPage();
                return;
            }
            if (searchActive && !searchEndReached && loadSearchPage) {
                loadSearchPage();
                return;
            }
        }
    };

    const renderHeader = () => (
        <CardHeader
            {...headerProps}
            handleFocusSearch={() => bottomSheetRef.current?.snapTo(PANEL_POS.top)}
            handleBlurSearch={() => bottomSheetRef.current?.snapTo(PANEL_POS.middle)}
            handleSearchSubmit={handleSearchSubmit}
            handleSearchCancel={handleSearchCancel}
            searchActive={searchActive}
        />
    );

    const renderEmptyContainer = () => {
        if (!loading) {
            return (
                <View>
                    <Text style={styles.emptyContainer}>{t('noObjectsFound')}</Text>
                </View>
            );
        }
        return null;
    };

    //set value of ref in parent to persist last snapped index
    const _onSettle = useCallback(index => {
        onPanelSettle(index);

        Keyboard && index !== PANEL_POS.top ? Keyboard.dismiss() : null;
    }, []);

    const getItemLayout = useCallback(
        (data, index) => ({
            length: OBJECT_LIST_ITEM_HEIGHT,
            offset: OBJECT_LIST_ITEM_HEIGHT * index,
            index,
        }),
        [],
    );

    const renderFooter = () => {
        if (loading) {
            return <LoadingIndicator />;
        }
    };

    const _onItemPress = useCallback(itemId => {
        onItemPress(itemId);
    }, []);

    const renderItem = useCallback(({ item }) => <ObjectListItem {...item} onPress={_onItemPress} />, []);

    const keyExtractor = useCallback((item: IObjectListItem) => item.objectId, []);

    const snapPoints = [
        BOTTOMSHEET_SNAPPOINTS.top,
        HEIGHT - (BOTTOMSHEET_SNAPPOINTS_INSET.middle + insets.bottom),
        HEIGHT - (BOTTOMSHEET_SNAPPOINTS_INSET.bottom + insets.bottom),
        BOTTOMSHEET_SNAPPOINTS.hidden,
    ];

    // an empty innerref for flatlist caused crashes, so we define one
    const listRef = useRef<FlatList>(null);

    return (
        <ScrollBottomSheet<IObjectListItem>
            ref={bottomSheetRef}
            innerRef={listRef}
            componentType='FlatList'
            snapPoints={snapPoints}
            initialSnapIndex={initialSnap ? initialSnap : PANEL_POS.middle}
            renderHandle={renderHeader}
            data={listData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            containerStyle={styles.container}
            contentContainerStyle={styles.container}
            onSettle={_onSettle}
            ListEmptyComponent={renderEmptyContainer}
            ListFooterComponent={renderFooter()}
            extraData={loading}
            onEndReachedThreshold={0.4}
            onEndReached={() => handleLoadMore()}
            onScroll={() => setHasScrolled(true)}
            windowSize={10}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        ...globalStyles.background,
    },
    emptyContainer: {
        textAlign: 'center',
        ...globalStyles.secondaryText,
    },
});

export default ObjectListCardPanel;

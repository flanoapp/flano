import React, { FC, RefObject, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { Button, SearchBar, Text } from 'react-native-elements';
import { useTranslation } from 'react-i18next';

import Accordion from '../Accordion';
import BottomSheetTouchable from '../BottomSheetTouchable';
import BottomSheetTouchableWithoutFeedback from '../BottomSheetTouchableWithoutFeedback';

import globalStyles, { BORDER_COLOR, PRIMARY_TEXT_COLOR } from '../../styles/globalStyles';
import { BOTTOMSHEET_TYPE } from '../../utils/utils';

export interface ICardHeader {
    handleBlurSearch?: () => void;  //method triggered when leaving the searchbar
    handleFocusSearch?: () => void; //method triggere when tapping on searchbar
    handleBackButton?: () => void;
    showBackArrow?: boolean;
    headerType: 'search' | 'title'; //list screens should have searchbars, detail screens should have a title
    titleText?: string;
    onScroll?: () => void;
    handleSearchSubmit?: (searchTerm: string, categories: Array<string>) => void;
    handleSearchCancel?: () => void;
    categories?: Array<string>;
    searchActive?: boolean; //determines whether user is currently searching or search results are listed
    searchTerm?: string;
    setSearchTerm?: (searchTerm: string) => void;
    activeFilters?: Array<string>; //currently selected filters
    setActiveFilters?: (filters: Array<string>) => void;
    setLoading?: (loading: boolean) => void; //if loading is set, a spinner should be visible
    currentBottomSheet?: RefObject<string>; //determines whether a list or detail card panel is currently visible
    // only for android back button
    handleAndroidBackButton?: () => void;
}

const CardHeader: FC<ICardHeader> = props => {
    const {
        handleBlurSearch,
        handleFocusSearch,
        handleBackButton,
        showBackArrow = false,
        headerType,
        titleText,
        onScroll,
        handleSearchSubmit,
        handleSearchCancel,
        categories,
        searchActive,
        searchTerm = '',
        setSearchTerm,
        activeFilters = [],
        setActiveFilters,
        setLoading,
        handleAndroidBackButton,
        currentBottomSheet,
    } = props;

    const { t } = useTranslation();

    // determines whether the filter accordeon should be visible or not
    // should only be visible if search is active
    const [showFilter, setShowFilter] = useState<boolean>(false);
    // determines whether the filter accordeon is currently open or collapsed
    const [filterExpanded, setFilterExpanded] = useState<boolean>(false);

    const searchFocused = useRef(false);
    const searchBarRef = useRef<SearchBar>(null);

    const onSearchBarFocus = () => {
        setShowFilter(true);
        handleFocusSearch ? handleFocusSearch() : null;
    };

    const onSearchBarCancel = () => {
        setShowFilter(false);
        handleSearchCancel ? handleSearchCancel() : null;
        handleBlurSearch ? handleBlurSearch() : null;
        searchFocused.current = false;
        setActiveFilters ? setActiveFilters([]) : null;
    };

    const _handleSearch = () => {
        setLoading ? setLoading(true) : null;
        setShowFilter(false);
        if (searchTerm || activeFilters.length > 0) { // do not submit an empty search
            handleSearchSubmit ? handleSearchSubmit(searchTerm, activeFilters) : null;
            handleBlurSearch ? handleBlurSearch() : null;
            searchFocused.current = false;
            setFilterExpanded(false);
        }
    };

    const _handleResetFilters = () => {
        if (activeFilters.length > 0 && setActiveFilters) {
            setActiveFilters([]);
            if (searchActive) {
                if (searchTerm) {
                    handleSearchSubmit?.(searchTerm, []);
                } else {
                    onSearchBarCancel();
                }
            }
        }
    };

    const _handleAndroidBackButton = () => {
        // if a detail view is opened, we do not want to exit the search
        // in this case we just want to call the perviously defined back button action
        if (currentBottomSheet?.current === BOTTOMSHEET_TYPE.objectDetails) {
            handleAndroidBackButton ? handleAndroidBackButton() : null;
            return true;
        } else {
            onSearchBarCancel();
            // @ts-ignore
            searchBarRef.current ? searchBarRef.current.cancel() : null;
            return true;
        }
    };

    // add event listeners to close search with hardware back button on android
    useEffect(() => {
        if (searchActive || searchFocused.current) {
            BackHandler.addEventListener('hardwareBackPress', _handleAndroidBackButton);
        } else {
            BackHandler.removeEventListener('hardwareBackPress', _handleAndroidBackButton);
        }
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', _handleAndroidBackButton);
        };
    }, [searchActive, searchFocused.current]);

    return (
        <View style={styles.headerContainer}>
            <View style={styles.panelHandle} />
            {
                // Search bar
                headerType === 'search' && (
                    <BottomSheetTouchableWithoutFeedback
                        onPress={() => {
                            if (searchFocused.current || searchActive) {
                                onSearchBarCancel();
                                // @ts-ignore
                                searchBarRef.current ? searchBarRef.current.cancel() : null;
                            }
                        }}
                    >
                        <SearchBar
                            // @ts-ignore
                            ref={search => (searchBarRef.current = search)}
                            placeholder={t('search')}
                            platform='ios'
                            containerStyle={styles.searchContainer}
                            inputContainerStyle={styles.searchInput}
                            inputStyle={styles.searchInputText}
                            onFocus={() => {
                                searchFocused.current = true;
                                onSearchBarFocus();
                            }}
                            onCancel={() => {
                                onSearchBarCancel();
                            }}
                            returnKeyType={'search'}
                            showCancel={true}
                            onClear={() => (setSearchTerm ? setSearchTerm('') : null)}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            cancelButtonTitle={t('cancel')}
                            cancelButtonProps={{ buttonTextStyle: styles.searchCancelButtonText }}
                            onSubmitEditing={_handleSearch}
                        />
                    </BottomSheetTouchableWithoutFeedback>
                )
            }

            {
                //Filter
                (showFilter || searchActive) && (
                    <View style={styles.filterContainer}>
                        <Accordion
                            // title of accordion should show the number of currently selected filters
                            title={
                                activeFilters && activeFilters.length > 0
                                    ? `${t('filters_filter')} (${activeFilters.length})`
                                    : `${t('filters_filter')}`
                            }
                            data={
                                categories && activeFilters
                                    ? categories.map(obj => ({
                                          key: obj,
                                            // selected filters should have another icon
                                          value: activeFilters.includes(obj),
                                      }))
                                    : []
                            }
                            setActiveFilter={setActiveFilters ? setActiveFilters : () => null}
                            handleSearch={_handleSearch}
                            onExpand={handleFocusSearch ? handleFocusSearch : () => null}
                            expanded={filterExpanded}
                            setExpanded={setFilterExpanded}
                            resetFilters={_handleResetFilters}
                            activeFilters={activeFilters}
                        />
                    </View>
                )
            }

            {headerType === 'title' && (
                <View
                    style={
                        showBackArrow ? styles.titleContainer : [styles.titleContainer, styles.titleOnlyTextContainer]
                    }
                >
                    {showBackArrow && (
                        <BottomSheetTouchable onPress={handleBackButton}>
                            <Button
                                type={'clear'}
                                buttonStyle={styles.backArrow}
                                onPress={handleBackButton}
                                icon={iconProps}
                            />
                        </BottomSheetTouchable>
                    )}
                    <Text numberOfLines={2} style={styles.titleText}>
                        {titleText ? titleText : ''}
                    </Text>
                </View>
            )}
        </View>
    );
};

const iconProps = {
    name: 'chevron-left',
    type: 'font-awesome-5',
    size: 28,
    color: PRIMARY_TEXT_COLOR,
};

const styles = StyleSheet.create({
    searchContainer: {
        ...globalStyles.background,
        height: 40,
    },
    searchInput: {
        height: 40,
    },
    searchInputText: {
        fontFamily: 'OpenSans Regular',
    },
    searchCancelButtonText: {
        fontFamily: 'OpenSans Regular',
        fontSize: 17,
        letterSpacing: -0.2,
    },
    titleContainer: {
        height: 'auto',
        display: 'flex',
        flexDirection: 'row',
        marginHorizontal: 15,
        paddingBottom: 10,
        paddingRight: 50,
    },

    titleOnlyTextContainer: {
        justifyContent: 'center',
        paddingLeft: 50,
        height: 'auto',
    },
    backArrow: {
        marginRight: 10,
        padding: 0,
        marginTop: 6,
    },
    titleText: {
        ...globalStyles.headerTitle,
        fontSize: 27,
    },

    headerContainer: {
        ...globalStyles.background,
        paddingVertical: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: 'black',
        shadowOpacity: 0.16,
        shadowOffset: {
            width: 0,
            height: -10,
        },
        shadowRadius: 9,
    },
    panelHandle: {
        width: 50,
        height: 4,
        borderRadius: 3,
        backgroundColor: BORDER_COLOR,
        marginBottom: 10,
        alignSelf: 'center',
    },
    filterContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
});

export default CardHeader;

import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Keyboard,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    UIManager,
    View,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import globalStyles, {
    BACKGROUND_COLOR,
    BORDER_COLOR,
    PRIMARY_COLOR,
    PRIMARY_TEXT_COLOR,
} from '../styles/globalStyles';
import BottomSheetTouchableWithoutFeedback from './BottomSheetTouchableWithoutFeedback';
import BottomSheetTouchable from './BottomSheetTouchable';

const { height: HEIGHT, width: WIDTH } = Dimensions.get('window');

export interface IAccordionProps {
    title: string;
    data: Array<any>;
    setActiveFilter: (filters: Array<string>) => void;
    handleSearch: () => void;
    onExpand: () => void;
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
    resetFilters: () => void;
    activeFilters: Array<string>;
}

const Accordion = (props: IAccordionProps) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [data, setData] = useState(props.data);

    if (Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        !props.expanded ? props.onExpand() : null;
        props.setExpanded(!props.expanded);
        Keyboard.dismiss();
    };

    const onClick = (index: number) => {
        const temp = data.slice();
        temp[index].value = !temp[index].value;
        setData(temp);
        const selected = data.filter(o => o.value).map(o => o.key);
        props.setActiveFilter(selected);
    };

    const clearFilters = () => {
        data.forEach(obj => (obj.value = false));
        setData(data);
        props.resetFilters();
        props.setExpanded(!props.expanded);
    };

    const handleSearch = () => {
        props.handleSearch();
        props.setExpanded(!props.expanded);
    };

    const styles = stylesFunction(insets.bottom);

    return (
        <View>
            <BottomSheetTouchableWithoutFeedback onPress={() => toggleExpand()}>
                <View style={styles.titleContainer}>
                    <Icon
                        name={props.expanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                        size={30}
                        color={PRIMARY_TEXT_COLOR}
                    />
                    <Icon name={'sliders-h'} type={'font-awesome-5'} size={15} color={PRIMARY_TEXT_COLOR} />
                    <Text style={styles.title}>{props.title}</Text>
                </View>
            </BottomSheetTouchableWithoutFeedback>
            {props.expanded && (
                <View style={styles.listContainer}>
                    <FlatList
                        data={data}
                        numColumns={1}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (
                            <View>
                                <BottomSheetTouchableWithoutFeedback onPress={() => onClick(index)}>
                                    <View style={styles.filterContainer}>
                                        <Icon
                                            name={item.value ? 'check-circle' : 'circle'}
                                            type={'font-awesome-5'}
                                            size={17}
                                            color={item.value ? PRIMARY_COLOR : PRIMARY_TEXT_COLOR}
                                        />
                                        <Text style={styles.filter}>{item.key}</Text>
                                    </View>
                                </BottomSheetTouchableWithoutFeedback>
                            </View>
                        )}
                    />
                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        {/*clear filters*/}
                        <BottomSheetTouchable onPress={() => clearFilters()}>
                            <Button
                                buttonStyle={[styles.buttonInactive]}
                                titleStyle={styles.buttonText}
                                title={t('filters_deleteFilters')}
                                onPress={clearFilters}
                            />
                        </BottomSheetTouchable>
                        {/*apply filters*/}
                        <BottomSheetTouchable onPress={() => handleSearch()}>
                            <Button
                                buttonStyle={[styles.buttonActive]}
                                titleStyle={styles.buttonText}
                                title={t('filters_applyFilters')}
                                onPress={handleSearch}
                            />
                        </BottomSheetTouchable>
                    </View>
                </View>
            )}
        </View>
    );
};

const stylesFunction = (bottomInset: number) =>
    StyleSheet.create({
        container: {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'yellow',
        },
        title: {
            ...globalStyles.primaryText,
            fontSize: 17,
            paddingLeft: 17,
        },
        titleContainer: {
            flexDirection: 'row',
            width: WIDTH,
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 10,
            paddingLeft: 16,
        },
        listContainer: {
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: HEIGHT - (190 + bottomInset),
        },
        filterContainer: {
            flexDirection: 'row',
            width: WIDTH,
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: 22,
            marginTop: 17,
        },
        filter: {
            ...globalStyles.primaryText,
            paddingHorizontal: 10,
            fontSize: 17,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 17,
            paddingLeft: 20,
            paddingRight: 20,
        },
        button: {
            borderRadius: 4,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 12,
            paddingRight: 12,
        },
        buttonActive: {
            backgroundColor: PRIMARY_COLOR,
        },
        buttonInactive: {
            backgroundColor: BORDER_COLOR,
        },
        buttonText: {
            ...globalStyles.primaryText,
            fontSize: 17,
            color: BACKGROUND_COLOR,
        },
    });

export default Accordion;

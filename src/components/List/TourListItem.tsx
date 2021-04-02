import React, { FC } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { ListItem, Text } from 'react-native-elements';
import { LatLng } from 'react-native-maps';

import BottomSheetTouchable from '../BottomSheetTouchable';
import { IObjectMarker } from '../Map/Map';

import globalStyles, {
    BACKGROUND_COLOR,
    PRIMARY_COLOR,
    PRIMARY_TEXT_COLOR,
    TOUR_LIST_ITEM_HEIGHT,
} from '../../styles/globalStyles';

const { width: WIDTH } = Dimensions.get('window');

export interface ITourListItem {
    id: string;
    title: string;
    description: string;
    objects: Array<IObjectMarker>;
    polyline: Array<LatLng>;
    selected: boolean;
    onPress?: (item: string) => void;
}

export interface ITourPolyline {
    tourId: string;
    polyLine: Array<LatLng>;
}

const TourListItem: FC<ITourListItem> = props => {
    const { id, title, description, selected, onPress } = props;

    const iconProps = {
        name: 'eye',
        type: 'font-awesome-5',
        solid: selected,
        color: selected ? PRIMARY_COLOR : PRIMARY_TEXT_COLOR,
    };

    const titleText = (
        <Text numberOfLines={1} style={styles.title}>
            {title}
        </Text>
    );
    const descText = (
        <Text numberOfLines={3} style={styles.subTitle}>
            {description}
        </Text>
    );

    const handlePress = () => {
        if (onPress) {
            onPress(id);
        }
    };

    return (
        <ListItem containerStyle={styles.container} bottomDivider onPress={() => handlePress()}>
            <ListItem.Content>
                <BottomSheetTouchable onPress={() => handlePress()} style={styles.contentContainer}>
                    <ListItem.Title style={styles.title} numberOfLines={1}>
                        {titleText}
                    </ListItem.Title>
                    <ListItem.Subtitle style={styles.subTitle} numberOfLines={3}>
                        {descText}
                    </ListItem.Subtitle>
                </BottomSheetTouchable>
            </ListItem.Content>
        </ListItem>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND_COLOR,
        height: TOUR_LIST_ITEM_HEIGHT,
    },
    contentContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
    },
    title: {
        ...globalStyles.primaryText,
    },
    subTitle: {
        ...globalStyles.secondaryText,
    },
    button: {
        marginRight: 10,
    },
});

export default TourListItem;

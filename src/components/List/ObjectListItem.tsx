import React, { FC, memo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Avatar, Button, ListItem } from 'react-native-elements';
import { LatLng } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import BottomSheetTouchable from '../BottomSheetTouchable';
import globalStyles, {
    BACKGROUND_COLOR,
    iconButtonSize,
    OBJECT_LIST_ITEM_HEIGHT,
    PRIMARY_COLOR,
    PRIMARY_TEXT_COLOR,
} from '../../styles/globalStyles';

const { width: WIDTH } = Dimensions.get('window');

export interface IObjectListItem {
    objectId: string;
    coordinates: LatLng;
    isTopSpot: boolean;
    image: string;
    title: string;
    category: string;
    distance: string;
    icon?: 'heart' | 'bookmark';
    isIconSolid?: boolean;
    pressIcon?: () => void;
    onPress?: (item: string) => void;
}

const ObjectListItem: FC<IObjectListItem> = props => {
    const {
        objectId,
        coordinates,
        isTopSpot,
        image,
        title,
        category,
        distance,
        icon = undefined,
        onPress,
        isIconSolid = true,
        pressIcon = () => {},
    } = props;

    const { t } = useTranslation();

    const iconProps = {
        name: isIconSolid ? icon : `${icon}-outline`,
        type: 'material-community',
        color: isIconSolid ? PRIMARY_COLOR : PRIMARY_TEXT_COLOR,
        size: iconButtonSize,
    };

    const handlePress = () => {
        if (onPress) {
            onPress(objectId);
        }
    };

    return (
        <ListItem containerStyle={styles.container} bottomDivider onPress={() => handlePress()}>
            <Avatar
                source={{ uri: image }}
                rounded={false}
                size={60}
                avatarStyle={isTopSpot ? styles.topSpotImage : {}}
            />
            <ListItem.Content>
                <BottomSheetTouchable onPress={handlePress} style={styles.contentContainer}>
                    <ListItem.Title numberOfLines={2} style={styles.title}>
                        {title}
                    </ListItem.Title>
                    {!isTopSpot && (
                        <ListItem.Subtitle
                            numberOfLines={1}
                            style={styles.subTitle}
                        >{`${distance} - ${category}`}</ListItem.Subtitle>
                    )}
                    {isTopSpot && (
                        <ListItem.Subtitle numberOfLines={1} style={styles.topSpotSubtitle}>{`${distance} - ${t(
                            'topspot',
                        )}`}</ListItem.Subtitle>
                    )}
                </BottomSheetTouchable>
            </ListItem.Content>
            {icon && (
                <BottomSheetTouchable onPress={pressIcon}>
                    <Button type={'clear'} icon={iconProps} onPress={pressIcon} />
                </BottomSheetTouchable>
            )}
        </ListItem>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND_COLOR,
        height: OBJECT_LIST_ITEM_HEIGHT,
    },
    contentContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
    },
    title: {
        ...globalStyles.primaryText,
    },
    subTitle: {
        ...globalStyles.secondaryText,
    },
    topSpotSubtitle: {
        fontSize: 14,
        color: PRIMARY_COLOR,
    },
    topSpotImage: {
        borderColor: PRIMARY_COLOR,
        borderWidth: 2,
    },
});

export default memo(ObjectListItem);

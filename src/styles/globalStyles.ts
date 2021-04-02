import { StyleSheet } from 'react-native';

export const PRIMARY_COLOR = '#FF8349';
export const SECONDARY_LIGHT_COLOR = '#FF955A';
export const SECONDARY_DARK_COLOR = '#FF6D38';
export const BACKGROUND_COLOR = '#F9F9F9';
export const INACTIVE_SYMBOL_COLOR = '#686D7D';
export const ALERT_COLOR = '#EF5151';
export const PRIMARY_TEXT_COLOR = '#363B4C';
export const SECONDARY_TEXT_COLOR = '#A6AAB5';
export const BORDER_COLOR = '#ABAFB0';
export const LOGO_FONT_COLOR = '#797b80';

export const OBJECT_LIST_ITEM_HEIGHT = 95;
export const TOUR_LIST_ITEM_HEIGHT = 110;

export const iconButtonSize = 33;
export const secondaryIconButtonSize = 27;

const globalStyles = StyleSheet.create({
    primaryText: {
        color: PRIMARY_TEXT_COLOR,
        fontFamily: 'OpenSans Regular',
        fontSize: 16,
    },
    secondaryText: {
        color: PRIMARY_TEXT_COLOR,
        fontFamily: 'OpenSans Light',
        fontSize: 14,
    },
    headerTitle: {
        fontSize: 30,
        fontFamily: 'OpenSans Regular',
        color: PRIMARY_TEXT_COLOR,
    },
    profileHeaderTitle: {
        fontSize: 30,
        fontFamily: 'Lato Bold Italic',
        color: LOGO_FONT_COLOR,
    },
    background: {
        backgroundColor: BACKGROUND_COLOR,
    },
});

export default globalStyles;

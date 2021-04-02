import React from 'react';
import { Icon } from 'react-native-elements';
import { View } from 'react-native';
import { LatLng, Marker } from 'react-native-maps';

import { BACKGROUND_COLOR, PRIMARY_COLOR } from '../../styles/globalStyles';

export interface IMapMarkerProps {
    selected: boolean;
    isTopSpot: boolean;
    coordinate: LatLng;
    key: string;
    onPress: () => void;
    id: string;
}

class MapMarker extends React.Component<IMapMarkerProps> {
    constructor(props: IMapMarkerProps) {
        super(props);
        this.handlePress = this.handlePress.bind(this);
    }

    shouldComponentUpdate(prevProps: IMapMarkerProps) {
        return prevProps.selected !== this.props.selected;
    }

    handlePress(){
        this.props.onPress();
    }

    render() {

        return (
            <Marker
                coordinate={this.props.coordinate}
                onPress={this.handlePress}
                tracksViewChanges={false}
                centerOffset={{ x: 0, y: -12 }} //iOS
                // anchor={{ x: 0.5, y: 0.95 }} // android
            >
                <View style={{ left: 0, top: 0, position: 'absolute' }}>
                    <Icon
                        name={this.props.isTopSpot ? 'map-marker-alert' : 'map-marker'}
                        type={'material-community'}
                        color={this.props.selected ? PRIMARY_COLOR : BACKGROUND_COLOR}
                        size={this.props.selected ? 35 : 30}
                    />
                </View>
                <Icon
                    name={this.props.isTopSpot ? 'map-marker-alert-outline' : 'map-marker-outline'}
                    type={'material-community'}
                    color={!this.props.selected ? PRIMARY_COLOR : 'transparent'}
                    size={this.props.selected ? 35 : 30}
                    style={{ fontSize: 11 }}
                />
            </Marker>
        );
    }
}

export default MapMarker;

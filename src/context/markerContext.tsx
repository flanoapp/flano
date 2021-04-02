import React from 'react';

import { IObjectMarker } from '../components/Map/Map';
import useMarkers from '../hooks/useMarkers';

export const markerContext = React.createContext<Array<IObjectMarker>>([]);

export const markerProvider = (props: { value: Array<IObjectMarker>; children: any }) => {
    const [getMarkers, getMarkersBySearch, markerResult, markerApiLoading, markerApiErrorMessage] = useMarkers();

    const contextValue = props.value;

    return <markerContext.Provider value={contextValue}>{props.children}</markerContext.Provider>;
};

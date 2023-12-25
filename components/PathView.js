import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from "react-native-maps";

const PathView = ({ currentData }) => {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: currentData.coords[0].latitude,
       longitude: currentData.coords[0].longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
      showsCompass={true}
      rotateEnabled={true}
    >
      <Marker
        key='startLocation'
        coordinate={currentData.coords[0]}
        pinColor='green'
        title='Start'
      />

      {currentData.spots.map((spot, index) => (
        <Marker
          key={index}
          coordinate={spot.coord}
          title={spot.title}
          description={spot.moreInfo}
          pinColor='purple'
        />
      ))}

      <Marker
        key='stopLocation'
        coordinate={currentData.coords[currentData.coords.length - 1]}
        pinColor='red'
        title='Stop Location'
      />

      {currentData.coords.length > 0 && (
        <Polyline
          coordinates={currentData.coords}
          strokeColor="#000"
          strokeWidth={3}
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 2,
    width: '100%',
    height: '100%',
  },
});

export default PathView;
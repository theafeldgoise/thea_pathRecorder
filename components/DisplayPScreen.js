/*
 * Adapted by Lyn from https://chafikgharbi.com/expo-location-tracking/
 * 
 * Illustrates foreground location tracking. 
 * 
 * Updated 2023/11/02 to remove TaskManager, which is *not* needed for 
 * foreground location tracking.
 */
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useState, useEffect } from 'react';
import { TextInput, Button, Text, View, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from 'expo-location';
import samplePaths from '../samplePaths.js';
import * as PathStore from '../PathStore.js';
let subscription = null; // location tracking service

export default function ({ selectedPath, changePscreen, allPaths, setAllPaths }){

// for delete confirmaiton
const [confirmation, setConfirmation] = useState(false);
const [duration, setDuration] = useState('');



const formatDuration = (startTime, stopTime) => {
  const start = new Date(startTime);
  const stop = new Date(stopTime);
  const duration = new Date(stop - start);
  const hours = duration.getUTCHours();
  const minutes = duration.getUTCMinutes();
  const seconds = duration.getUTCSeconds();
  return `${hours}h ${minutes}m ${seconds}s`;
};



useEffect(() => {
  setDuration(formatDuration(selectedPath.startTime, selectedPath.stopTime));
}, [selectedPath]);


function toggleConfirmation(){
  setConfirmation(!confirmation);
}

async function deletePath(){

  await PathStore.deletePath(selectedPath)
  //resets summary
  setAllPaths(allPaths.filter(path => path !== selectedPath));

  changePscreen('summary');
}

return (
  <SafeAreaView style={styles.container}>
    {allPaths.length > 0 && (
      <>
        <View style={styles.title}>  
            <Text style={styles.title}> {`Name: ${selectedPath.name}`} </Text>
        </View>
        <MapView style={styles.map}
        initialRegion={{
        latitude: selectedPath.coords[0].latitude,
        longitude: selectedPath.coords[0].longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
        }}
        showsCompass={true} 
        rotateEnabled={true}
      >
        <Marker key='startLocation'                                                          
          coordinate={selectedPath.coords[0]}
          pinColor='green'
          title='Start'>
        </Marker>
        
        {selectedPath.spots.map((spot, index) => (
          <Marker
            key={index}
            coordinate={spot.coord}
            title={spot.title}
            description={spot.moreInfo}
            pinColor='purple'
          /> 
        ))}
        <Marker key='stopLocation'                                                          
              coordinate={selectedPath.coords[selectedPath.coords.length-1]}
              pinColor='red'
              title='Stop Location'>
        </Marker>
        {selectedPath.coords.length > 0 && (
          <Polyline
            coordinates={selectedPath.coords}
            strokeColor="#000" // black color for the polyline
            strokeWidth={3} // line thickness
          />
        )}
        </MapView>  

        <View style={styles.container}> 
            <Text>{`Date: ${selectedPath.dateFormatted}`}</Text>
            <Text>{`Start Time: ${selectedPath.timeFormatted}`}</Text>
            <Text>{`Duration: ${duration}`}</Text>
            <Text>{`Distance: ${selectedPath.pathDistance} km`}</Text>
        </View>
    
        <ScrollView style={styles.data}>
            <Text>Spots: </Text>  
            {selectedPath.spots.map((spot, index) => (
            <View key={index} style={styles.spotContainer}>
              <Text style={styles.spotTitle}>{spot.title}</Text>
            </View>
          ))}    
        </ScrollView>
        <View style={confirmation ? styles.hidden : styles.inputGroup}>
          <Button title="Delete Path" onPress={toggleConfirmation} color='red' style={styles.inputGroup}>
            Delete Path
          </Button>
        </View>
        <View style={confirmation ? styles.inputGroup: styles.hidden}>
          <Text> Are you Sure?</Text>
          <Button title="Yes Delete." onPress={deletePath} color='red' style={styles.inputGroup}>
          </Button>
        </View>
      </>
    )}
  </SafeAreaView>
);
};



const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    marginBottom: 16,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  map: {
    flex: 2, 
    width: '100%',
    height: '100%',
  },
  controls: {
    marginTop: 10, 
    padding: 10, 
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1, 
    backgroundColor: 'rgb(237, 221, 246)',
  },
  data: {
    flex: 1
  },
  hidden: {
    display: 'none',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  creatingSpot: {
    width: '75%',
    marginTop: 10, 
    padding: 5, 
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1, 
    backgroundColor: 'rgb(237, 221, 246)',
  },

});
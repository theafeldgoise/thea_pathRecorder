/*
 * Adapted by Lyn from https://chafikgharbi.com/expo-location-tracking/
 * 
 * Illustrates foreground location tracking. 
 * 
 * Updated 2023/11/02 to remove TaskManager, which is *not* needed for 
 * foreground location tracking.
 */
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useState, useSyncExternalStore } from 'react';
import { TextInput, Button, Text, View, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from 'expo-location';
import samplePaths from '../samplePaths.js';
import * as PathStore from '../PathStore.js';
let subscription = null; // location tracking service


export default function RecordingPScreen({ changePscreen, setAllPaths, setSelectedPath, selectedPath }) {

  
  //general state variables
  const [permissionText, setPermissionText] 
     = useState('Location permission not requested yet');
  const [myCoord, setMyCoord] = useState(null);
  const [addingSpot, setAddingSpot] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [savingPath, setSavingPath] = useState(false);
  

  //state variables for a path
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [stopTime, setStopTime] = useState('');
  const [pathDistance, setPathDistance] = useState(0);
  const [spots, setSpots] = useState([]);
  const [coords, setCoords] = useState({});
  const [startLocation, setStartLocation] = useState(null);
  const [stopLocation, setStopLocation] = useState(null);
  const [startInstance, setStartInstance] = useState(false);
  const [dateFormatted, setDateFormatted] = useState('');
  const [timeFormatted, setTimeFormatted] = useState('');
  

  const pathData = {
    name,
    startTime,
    stopTime,
    pathDistance,
    spots,
    coords,
    dateFormatted,
    timeFormatted,

  };


  //state variables for a spot
  const [title, setTitle] = useState('');
  const [moreInfo, setMoreInfo] = useState([]);
  const [time, setTime] = useState('');
  const [coord, setCoord] = useState({});

  const spotData = {
    title,
    moreInfo,
    time,
    coord, 
  };

  const formatDate = (isoString) => {
    const myDate = new Date(isoString);
    return `${myDate.getMonth() + 1}/${myDate.getDate()}/${myDate.getFullYear()}`;
  };
  
  //asked brother for help with this
  const formatStart = (startTime) => {
  const start = new Date(startTime);
  let hours = start.getHours();
  const minutes = start.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // displays hour '0' as '12'
  const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
  return( `${hours}:${minutesFormatted} ${ampm}`);
  };
  
//from snack in class
  function haversineDistance(coords1, coords2) {
    const R = 6371; // Radius of the Earth in kilometers
    const lat1 = coords1.latitude * Math.PI / 180; // Convert degrees to radians
    const lat2 = coords2.latitude * Math.PI / 180; // Convert degrees to radians
    const diffLat = lat2 - lat1;
    const diffLng = (coords2.longitude - coords1.longitude) * Math.PI / 180;

    const a = Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * 
        Math.sin(diffLng / 2) * Math.sin(diffLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}
  // function for calculating the distance of a polyLine
  function calculateDistance(line) {
    let totalDistance = 0;

    line.forEach((point, index) => {
        if (index > 0) {
            totalDistance += haversineDistance(line[index - 1], point);
            console.log(totalDistance)
        }
    });
    totalDistance = parseFloat(totalDistance.toFixed(3))
    console.log('path distance: ' , totalDistance);
    return totalDistance
    
}



    // Start foreground location tracking
  async function startTracking() {
    if (tracking ===true){
      console.log('Button is disabled. Tracking is in session.')
    }
    let perm = await Location.requestForegroundPermissionsAsync();
    setPermissionText(perm);
    
    // Reset myCoord and coords state variables for new tracking session
    setStartInstance(true);
    setTracking(true);
    setMyCoord(null);
    setCoords([]);
    setName('');
    let currentDate = new Date();
    let isoDateTime = currentDate.toISOString();
    setStartTime(isoDateTime);
    setPathDistance(0);
    

    console.log('Starting location subscription service.')
    subscription = await Location.watchPositionAsync(
      // Argument #1: location options                      
      {
      // accuracy options at https://docs.expo.dev/versions/latest/sdk/location/#accuracy
        // accuracy: Location.Accuracy.Lowest, // 3km
        // accuracy: Location.Accuracy.Low, // 1km
        // accuracy: Location.Accuracy.Balanced, // 100m
        // accuracy: Location.Accuracy.High, // 10m
        // accuracy: Location.Accuracy.Highest,
        accuracy: Location.Accuracy.BestForNavigation,
        
        distanceInterval: 1 // In meters. Try other distance intervals!
      // Argument #2: callback invoked on each new location from tracking service 
      
    },                                                                     
      newLocation => {
        const newCoord = {
          latitude: newLocation.coords.latitude, 
          longitude: newLocation.coords.longitude
        }
        //console.log('Moved to new coord.', newCoord);
       
        setMyCoord(prevMyCoord => {
          console.log('prevMyCoord =', prevMyCoord); 
          return newCoord;
        });
        setCoords(prevCoords => {
          console.log('prevCoords =', prevCoords); 
          return [...prevCoords, newCoord]; 
        });

  
      }
      
    );
    setStartLocation(myCoord);
  }

  // Stop foreground location tracking
  function stopTracking() {
    if (subscription !== null) {
      console.log('Stopping active location subscription service.')
      subscription.remove();
      setTracking(false);
      setStopLocation(myCoord)
      setMyCoord(null);
     
      setDateFormatted(formatDate(startTime));
      console.log(dateFormatted);
      setPathDistance(calculateDistance(coords));
      setTimeFormatted(formatStart(startTime));
      let currentDate = new Date();
      let isoDateTime = currentDate.toISOString();
      setStopTime(isoDateTime);
      setSavingPath(true);
  

      
    }
  };

  async function savePath() {
    //spots, coords and start time already set
    //const [startTime, setStartTime] = useState('');
    setSavingPath(true);
  
  setAllPaths(previousPaths => [...previousPaths, pathData]);
  PathStore.storePath(pathData);
  setSelectedPath(pathData)
  changePscreen('summary')
  setSavingPath(false);
  setSpots([]);
  setStartInstance(false);
  
  }


  function addSpot() {
    //title and more info set below in input bars!
    setAddingSpot(true);
    setCoord(myCoord);
    let currentDate = new Date();
    let isoDateTime = currentDate.toISOString();
    setTime(isoDateTime);
    console.log(spotData)
    }


  function saveSpot(){
   setSpots(previousSpots => [...previousSpots, spotData]);
   setTitle('');
   setMoreInfo('');
   setAddingSpot(false);
   setTime('');
  };




  return (
    <SafeAreaView style={styles.container}>
     { (myCoord === null) ?
        <Text>Map Only Viewable When Tracking a Path</Text> :
        <MapView style={!startInstance ? styles.hidden : styles.map} 
        initialRegion={{
        latitude: myCoord.latitude,
        longitude: myCoord.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
        }}
        showsCompass={true} 
        showsUserLocation={true} 
        rotateEnabled={true}
      >
        <Marker key='startLocation'                                                          
          coordinate={coords[0]}
          pinColor='green'
          title='Start'>
        </Marker>
        
  {spots.map((spot, index) => (
    <Marker
      key={index}
      coordinate={spot.coord}
      title={spot.title}
      description={spot.moreInfo}
      pinColor='purple'
    /> 
    ))}
    <Marker key='stopLocation'                                                          
          coordinate={ stopLocation }
          pinColor='red'
          title='Stop Location'>
        </Marker>
        <Polyline
      coordinates={coords}
      strokeColor="#000" // black color for the polyline
      strokeWidth={3} // line thickness
    />
     </MapView>  
    }
    <View style={styles.controls}>
        <Button title="Start Tracking" onPress={startTracking} color='violet' disabled={tracking || (!tracking && savingPath )}/>
        <Button title="Stop Tracking" onPress={stopTracking} color='purple' disabled={!tracking || addingSpot}/>
    </View>
    <View style={ tracking ? styles.controls : styles.hidden}>
    <Button title="Add Spot" onPress={addSpot} color='navy'  disabled={addingSpot}>
    Add Spot
    </Button>
    </View>
    <ScrollView style={addingSpot === true? styles.creatingSpot: styles.hidden}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          onChangeText={(text) => setTitle(text)}
          style={styles.input}
        />
      <View style={addingSpot === true? styles.inputGroup: styles.hidden}>
      <Text style={styles.label}>More Info</Text>
        <TextInput
          onChangeText={(text) => setMoreInfo(text)}
          style={styles.input}
        />
      <Button title="Save Spot" onPress={saveSpot} color='navy' >
    Save Spot
    </Button>
      </View>
     </ScrollView>
      <View style={(tracking === false && startTime !== '')? styles.inputGroup: styles.hidden}>
     <View style={ styles.inputGroup}>
      <Text style={styles.label}>Path Name</Text>
        <TextInput
          onChangeText={(text) => setName(text)}
          style={styles.input}
        />
      </View>
     <View style={(name !== '' ? styles.inputGroup : styles.hidden)}>
     <Button title="Save Path" onPress={savePath} color='navy' style={styles.controls}>
    Save Path
    </Button>
     </View>
     </View>
     <ScrollView style={styles.data}>
       <Text>My Spots: {JSON.stringify(spots)}</Text>      
     </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

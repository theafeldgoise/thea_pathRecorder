import { StatusBar } from 'expo-status-bar';
import  {SafeAreaView, StyleSheet, Text, View,  TouchableOpacity, Alert, ImageBackground, Image} from 'react-native';

import React, { useState, useEffect } from "react";
import * as PathStore from './PathStore.js';

import SummaryPScreen from './components/SummaryPScreen';
import DisplayPScreen from './components/DisplayPScreen';
import RecordingPScreen from './components/RecordingPScreen';
import { SegmentedButtons } from 'react-native-paper';
import samplePaths from './samplePaths.js';

export default function App() {
  const [pscreen, setPscreen] = useState("summary")
  const [selectedPath, setSelectedPath] = useState([]);
  const [allPaths, setAllPaths] = useState([]);

  useEffect(() => {
    async function addPersistentPaths() {
      const persistentPaths = await PathStore.init();
      console.log(`In useEffect, have ${persistentPaths.length} saved paths`);
      combineWithSamplePaths(persistentPaths);
    }
  
    async function combineWithSamplePaths(paths){
      await setAllPaths(previousPaths => [...previousPaths, ...paths]);
      // Removed console.log here as it will log the stale state
    };
  
    addPersistentPaths();
  }, []);
  
  useEffect(() => {
    // This will run when allPaths is updated
    if (allPaths.length > 0) {
      setSelectedPath(allPaths[allPaths.length - 1]);
    }
  }, [allPaths]);


  //changes pscreen
  function changePscreen(screenName) {
    console.log('screenName: ', screenName);
    setPscreen(screenName);
  }
    return (
      <SafeAreaView style={styles.container}>
        { pscreen === "summary" &&
          <SummaryPScreen 
            changePscreen={changePscreen}
            allPaths={allPaths}
            setAllPaths={setAllPaths}
            setSelectedPath={setSelectedPath}
            />
        }
        { pscreen === "display" &&
          <DisplayPScreen 
          selectedPath={selectedPath}
          changePscreen={changePscreen}
          allPaths={allPaths}
          setAllPaths={setAllPaths}
            />
       }
       { pscreen === "recording" &&
          <RecordingPScreen 
            changePscreen={changePscreen}
            setAllPaths={setAllPaths}
            setSelectedPath={setSelectedPath}
            selectedPath/>
        }
        <View style={{width: '100%'}}>
        <SegmentedButtons
          style={styles.pscreenButtons}
          value={pscreen}
          onValueChange={changePscreen}
          buttons={[
            {
              value: 'summary',
              label: 'Summary',
            },
            {
              value: 'display',
              label: 'Display',
            },
            {
              value: 'recording',
              label: 'Recording',
            },
          ]}
        />
        </View>
  
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
      padding: 8,
    },
    pscreen: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    pscreenText: {
      textAlign: 'center',
      fontSize: 25
    },
    pscreenButtons: {
      textAlign: 'center',
      fontSize: 25,
      iconColor: 'lavender',
    },
  });
  

//import { useState, useEffect } from "react";

import  {FlatList, StyleSheet, Text, View,  TouchableOpacity, } from 'react-native';
const SummaryPScreen = ({changePscreen, allPaths, setSelectedPath}) => {

  const handlePathSelect = (path) => {
    setSelectedPath(path);
    changePscreen('display');
  }
  return (
    <View style={styles.container}>
      {allPaths.length < 1 ? (
        <Text style={styles.title}>Record a Path!</Text>) : (
        <>
         <Text style={styles.title}>Paths</Text>
          <FlatList
            style={styles.results}
            data={allPaths}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.box}
                onPress={() => handlePathSelect(item)}
              >
                <Text>{`Path Name: ${item.name}`}</Text>
                <Text>{`Date: ${item.dateFormatted}`}</Text>
                <Text>{`Start Time: ${item.timeFormatted}`}</Text>
                <Text>{`Distance: ${item.pathDistance} km`}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    title: {
      fontSize: 24,
      marginBottom: 16,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 16,
      paddingHorizontal: 8,
      width: '100%',
    },
    box: {
      marginBottom: 16,
      borderColor: 'gray',
      borderWidth: 1,
      padding: 8,
    },
    results:{
      flexDirection: 'column',
      padding: 10,
      marginVertical: 8,
      marginHorizontal: 16,
      backgroundColor: 'rgb(237, 221, 246)',
      borderWidth: 2,
      borderColor: 'purple',
    },
  });


export default SummaryPScreen;

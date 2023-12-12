import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Button, Text, View, FlatList, Alert, TextInput, Dimensions } from 'react-native';
import ImageButton from './listBtn';
import AddSubjectButton from './addSubjectBtn';
import Dropdown from './dropdown';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

function DetailScreen({ route }) {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const chartWidth = screenWidth * 0.70; // 80% of screen width (adjust as needed)
    const chartHeight = screenHeight * 0.25;
    const { subject } = route.params;
    const [grades, setGrades] = useState(route.params.grades || []);
    const [newGrade, setNewGrade] = useState('');
  
    const handleAddGrade = async () => {
      if (newGrade.trim() === '' || newGrade < 0 || newGrade > 6) {
        return;
      }
    
      const { semesterId, studentId } = route.params;
    
      try {
        const storedSemesters = await AsyncStorage.getItem('semesters');
        if (storedSemesters !== null) {
          const parsedSemesters = JSON.parse(storedSemesters);
          const updatedSemesters = parsedSemesters.map((semester) => {
            if (
              semester.grades.hasOwnProperty(subject) &&
              semester.studentId === studentId &&
              semester.id === semesterId
            ) {
              const updatedGrades = [...semester.grades[subject], newGrade];
              return {
                ...semester,
                grades: {
                  ...semester.grades,
                  [subject]: updatedGrades,
                },
              };
            }
            return semester;
          });
    
          await AsyncStorage.setItem('semesters', JSON.stringify(updatedSemesters));
    
          setGrades([...grades, newGrade]);
          setNewGrade('');
        }
      } catch (error) {
        console.error('Error adding grade:', error);
      }
    };
    
    const handleDeleteGrade = async (index) => {
      try {
        const { semesterId, studentId } = route.params;
        const storedSemesters = await AsyncStorage.getItem('semesters');
        if (storedSemesters !== null) {
          const parsedSemesters = JSON.parse(storedSemesters);
          const updatedSemesters = parsedSemesters.map((semester) => {
            if (
              semester.grades.hasOwnProperty(subject) &&
              semester.studentId === studentId &&
              semester.id === semesterId
            ) {
              const updatedGrades = semester.grades[subject].filter((_, i) => i !== index);
              return {
                ...semester,
                grades: {
                  ...semester.grades,
                  [subject]: updatedGrades,
                },
              };
            }
            return semester;
          });
    
          await AsyncStorage.setItem('semesters', JSON.stringify(updatedSemesters));
    
          const updatedGrades = [...grades.slice(0, index), ...grades.slice(index + 1)];
          setGrades(updatedGrades);
          }
          } catch (error) {
          console.error('Error deleting grade:', error);
          }
        };
  
        return (
          <View style={styles.container}>
            <View style={styles.subjectContainer}>
              <Text style={styles.subjectTitle}>{subject}</Text>
              <FlatList
                data={grades}
                renderItem={({ item, index }) => (
                  <View
                    style={[
                      styles.row,
                      { backgroundColor: index % 2 === 0 ? '#caf0f8' : '#90e0ef' },
                    ]}
                  >
                    <View style={styles.gradeItem}>
                      <Text>{item}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteGrade(index)}>
                      <Image source={require('./images/trash.png')} style={styles.deleteButton} />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item, index) => `${subject}_${index}`}
              />
              {grades.length > 1 && new Set(grades).size > 1 && (
                <View style={styles.chartContainer}>
                  <LineChart
                    data={{
                      labels: grades.map((_, index) => `${index + 1}`),
                      datasets: [{ data: grades }],
                    }}
                    withVerticalLabelsOffset={-10} // Adjust the offset for vertical labels
                    withHorizontalLabelsOffset={-100}
                    width={chartWidth}
                    height={chartHeight}
                    chartConfig={{
                      backgroundColor: '#FFFFFF',
                      backgroundGradientFrom: '#FFFFFF',
                      backgroundGradientTo: '#FFFFFF',
                      decimalPlaces: 2,
                      color: (opacity = 1) => `rgba(62,146,204, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                    }}
                  />
                </View>
              )}
  
              {grades.length <= 1 || new Set(grades).size <= 1 && (
                <View style={{width: "100%"}}>
                  <Text style={{textAlign: 'center'}}>Not enough data to display the chart.</Text>
                </View>
              )}
              <View style={styles.addButtonContainer}>
              <TextInput style={{textAlign: 'center', marginBottom: 5}}
                  placeholder="Enter new grade"
                  value={newGrade}
                  onChangeText={(text) => setNewGrade(text)}
                  keyboardType="numeric" // Set the keyboardType to 'numeric' for a number pad
                />
                <TouchableOpacity onPress={handleAddGrade}>
                <Text>Add Grade</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );      
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#e3e4ef',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      width: "100%",
    },
    subjectContainer:{
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 5,
      backgroundColor: "white",
      width: "80%",
      minHeight: "70%",
      borderWidth: 10,
      borderColor: 'white',
      borderStyle: 'solid',
      },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 5,
      borderBottomWidth: 1,
      borderBottomColor: '#00b4d8',
      width: "100%",
    },
    rowItem: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'center',
      justifyContent: "space-evenly",
    },
    tableTitle:{
      fontWeight: "bold", 
      textAlign: "center",
    },
    addButtonContainer: {
      alignItems: 'center',
      marginBottom: 10,
      marginTop: 10,
    },
    gradeItem: {
      flex: 1,
    },
    deleteButton: {
      width: 25,
      height: 25,
      resizeMode: 'contain',
      tintColor: 'red', // Add a tint color or customize as needed
    },
    subjectTitle: {
      fontSize: 20, // Adjust the size as needed
      textAlign: 'center',
      marginBottom: 10,
    },
    chartContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginRight: 30,
    },
  });

 export default DetailScreen; 
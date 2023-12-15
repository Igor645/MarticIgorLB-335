import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Button, Text, View, ScrollView, FlatList, Alert, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
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
    const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedGrade, setEditedGrade] = useState('');

  const handleEditGrade = (index) => {
    setIsEditing(true);
    setEditingIndex(index);
    setEditedGrade(grades[index].toString());
  };

  const handleUpdateGrade = async () => {
    if (editedGrade.trim() === '' || editedGrade < 0 || editedGrade > 6) {
      return;
    }

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
            const updatedGrades = [...semester.grades[subject]];
            updatedGrades[editingIndex] = parseFloat(editedGrade);
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
        setGrades(updatedSemesters.find((semester) => semester.id === semesterId).grades[subject]);
        setIsEditing(false);
        setEditingIndex(null);
        setEditedGrade('');
      }
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  };

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
          <ScrollView>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
          <View style={styles.container}>
            <View style={styles.subjectContainer}>
              <Text style={styles.subjectTitle}>{subject}</Text>
              {grades.map((item, index) => (
              <View
              key={`${subject}_${index}`}
              style={[
                styles.row,
                { backgroundColor: index % 2 === 0 ? '#caf0f8' : '#90e0ef' },
              ]}
            >
              <View style={styles.gradeItem}>
                {isEditing && editingIndex === index ? (
                  <TextInput
                    style={{
                      textAlign: 'center',
                      borderBottomWidth: 1,
                      borderBottomColor: '#e3e4ef',
                      backgroundColor: '#f0f0f5',
                      paddingLeft: 25,
                      paddingRight: 25,
                    }}
                    value={editedGrade}
                    onChangeText={(text) => setEditedGrade(text)}
                    keyboardType="numeric"
                    onSubmitEditing={handleUpdateGrade}
                  />
                ) : (
                  <TouchableOpacity onPress={() => handleEditGrade(index)}>
                    <Text>
                        {item}
                    </Text>
                  </TouchableOpacity> 
                )}
              </View>
              <TouchableOpacity onPress={() => handleDeleteGrade(index)}>
                <Image
                  source={require('./images/trash.png')}
                  style={styles.deleteButton}
                />
              </TouchableOpacity>
            </View>
            ))}
              {grades.length > 1 && new Set(grades).size > 1 && (
                <View style={styles.chartContainer}>
                  <LineChart
                    data={{
                      labels: grades.map((_, index) => `${index + 1}`),
                      datasets: [{ data: grades }],
                    }}
                    withVerticalLabelsOffset={-10}
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
              <TextInput style={{textAlign: 'center', marginBottom: 5, borderBottomWidth: 1,
                    borderBottomColor: '#e3e4ef',
                    backgroundColor: '#f0f0f5',
                    paddingLeft: 25,
                    paddingRight: 25,
                    marginTop: 25,}}
                  placeholder="Enter new grade"
                  value={newGrade}
                  onChangeText={(text) => setNewGrade(text)}
                  keyboardType="numeric"
                  onSubmitEditing={handleAddGrade}
                />
                <TouchableOpacity onPress={handleAddGrade}>
                <Text>Add Grade</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </KeyboardAvoidingView>
          </ScrollView>
        );      
  }
  
  const styles = StyleSheet.create({
    container: {
      minHeight: Dimensions.get('window').height * 0.92,
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
      justifyContent: 'space-evenly',
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
      marginTop: "auto",
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
      marginTop: 25,
      marginRight: 30,
    },
  });

 export default DetailScreen; 
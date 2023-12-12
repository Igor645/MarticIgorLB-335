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
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Overview" component={Overview} />
        <Stack.Screen name="Details" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Overview(){
  const isFocused = useIsFocused();
  const [semesters, setSemesters] = useState([]);

  let clearAsyncStorage = async() => {
    AsyncStorage.clear();
  }
  // Function to load semesters from local storage
  const loadSemesters = async () => {
    try {
      const storedSemesters = await AsyncStorage.getItem('semesters');
      if (storedSemesters !== null) {
        const parsedSemesters = JSON.parse(storedSemesters);
        console.log('Semesters JSON:', JSON.stringify(parsedSemesters, null, 2));
        setSemesters(parsedSemesters);
      } else {
        // If there are no semesters in local storage, set a default semester
        await AsyncStorage.setItem('semesters', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error loading semesters:', error);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, [isFocused]); // Load semesters on component mount

  // Function to save semesters to local storage
  const saveSemesters = async (data) => {
    try {
      await AsyncStorage.setItem('semesters', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving semesters:', error);
    }
  };


  const [selectedSemester, setSelectedSemester] = useState(null);
  const [newSubject, setNewSubject] = useState('');
  let currentStudentId = 1

  const handleDropdownChange = (semesterId) => {
    setSelectedSemester(semesterId);
  };

  const navigation = useNavigation();

  const handleDetail = (subject, grades) => {
    navigation.navigate('Details', {
      subject,
      grades,
      semesterId: selectedSemester, // Pass the semesterId
      studentId: currentStudentId,    // Pass the studentId
    });  };

  const handleAddSubject = () => {
    if (newSubject.trim() === '') {
      Alert.alert('Please enter a subject name');
      return;
    }

    console.log(`This was selected ${selectedSemester}`);
  
    const foundSemesterIndex = semesters.findIndex(
      (semester) => semester.studentId === currentStudentId && semester.id === selectedSemester
    );
  
    if (foundSemesterIndex !== -1) {
      const currentSemester = { ...semesters[foundSemesterIndex] };
  
      if (currentSemester.grades.hasOwnProperty(newSubject)) {
        Alert.alert('Subject already exists!');
      } else {
        currentSemester.grades = { ...currentSemester.grades, [newSubject]: [] };
        const updatedSemesters = [...semesters];
        updatedSemesters[foundSemesterIndex] = currentSemester;
  
        setSemesters(updatedSemesters);
        setNewSubject('');
        saveSemesters(updatedSemesters);
      }
    } else {
      const newSemester = {
        id: selectedSemester,
        studentId: currentStudentId,
        grades: { [newSubject]: [] }
      };

      const updatedSemesters = [...semesters, newSemester];
      setSemesters(updatedSemesters);
      setNewSubject('');
      saveSemesters(updatedSemesters);
    }    
  };

  const calculateAverage = (semester, subject) => {
    if (semester.grades.hasOwnProperty(subject)) {
      const grades = semester.grades[subject].map(parseFloat); // Convert grades to numbers
      if (grades.length > 0) {
        const sumOfGrades = grades.reduce((sum, grade) => sum + grade, 0);
        const averageGrade = sumOfGrades / grades.length;
        return averageGrade.toFixed(2);
      }
    }
    return '--'; // Default value if no grades exist
  };
  
  const handleDeleteSubject = (semesterId, subject) => {
    const updatedSemesters = semesters.map((semester) => {
      if (semester.id === semesterId) {
        const updatedGrades = { ...semester.grades };
        delete updatedGrades[subject];
        return { ...semester, grades: updatedGrades };
      }
      return semester;
    });
  
    setSemesters(updatedSemesters);
    saveSemesters(updatedSemesters);
  };
  

  const renderItem = ({ item, semesterId, studentId }) => {
    if (item.id === semesterId && item.studentId === studentId) {
      const subjectGrades = Object.entries(item.grades);
  
      return subjectGrades.map(([subject, grades], index) => {
        let averageGrade = calculateAverage(item, subject);
  
        return (
          <View
            style={[
              styles.row,
              { backgroundColor: index % 2 === 0 ? '#caf0f8' : '#90e0ef' },
            ]}
            key={`${subject}_${index}`}
          >
            <View style={styles.rowItem}>
              <Text>{subject}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text>{averageGrade}</Text>
            </View>
            <View style={styles.rowItem}>
              <ImageButton onPress={() => handleDetail(subject, grades)} />
              <TouchableOpacity onPress={() => handleDeleteSubject(item.id, subject)}>
                <Image source={require('./images/trash.png')} style={styles.deleteButton} />
              </TouchableOpacity>
            </View>
          </View>
        );
      });
    } else {
      return null;
    }
  };
  
  
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Dropdown onSelect={handleDropdownChange} semesters={semesters}/>
      <View style={styles.subjectContainer}>

        <View>
          <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.tableTitle}>Subject</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.tableTitle}>Average Grade</Text>
          </View>
          <View style={styles.rowItem}>
              <Text style={styles.tableTitle}>Details</Text>
          </View>
          </View>

          <FlatList
  data={semesters}
  renderItem={({ item, index }) => renderItem({ item, index, semesterId: selectedSemester, studentId: currentStudentId })}
  keyExtractor={(item, index) => `${item.studentId}_${index}`}
/>

        </View>

        <View style={styles.addButtonContainer}>
        <TextInput style={{textAlign: 'center', marginBottom: 5}}
            placeholder="Enter subject name"
            value={newSubject}
            onChangeText={(text) => setNewSubject(text)} 
          />
          <AddSubjectButton onPress={handleAddSubject} />
        </View>

      </View>
      <Button onPress={clearAsyncStorage} title="Clear Async Storage">
      </Button>
    </View>
  );
}

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
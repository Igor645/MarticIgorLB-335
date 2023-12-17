import React, { useState, useEffect } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadSemesters } from './App';

const Dropdown = ({ onSelect, semesters, onDeleteCompleted }) => {
  const [selectedValue, setSelectedValue] = useState(1);
  const [options, setOptions] = useState([]);
  const [deleteOptionExists, setDeleteOptionExists] = useState(false);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const storedSemesters = await AsyncStorage.getItem('semesters');
        if (storedSemesters !== null) {
          const parsedSemesters = JSON.parse(storedSemesters);
          const loggedInUser = JSON.parse(await AsyncStorage.getItem('loggedInUser'));
          const studentId = loggedInUser.studentId;
          const studentSemesters = parsedSemesters.filter(semester => semester.studentId === studentId);
          const highestSemesterId = studentSemesters.reduce((maxId, semester) => Math.max(maxId, semester.id), 0);
          
          const generatedOptions = Array.from({ length: highestSemesterId }, (_, index) => ({
            label: `Semester ${index + 1}`,
            value: index + 1,
          }));
          generatedOptions.push({ label: 'Add Semester', value: 'add_semester', color: '#009688' });
          if(generatedOptions.length > 2){
            generatedOptions.push({ label: 'Delete most recent semester', value: 'del_semester', color: '#ff0000' });
            setDeleteOptionExists(true);
          }
          
          setOptions(generatedOptions);
        }
        else{
          const generatedOptions = []
          generatedOptions.push({ label: 'Semester 1', value: 1});
          generatedOptions.push({ label: 'Add Semester', value: 'add_semester', color: '#009688' });
          setOptions(generatedOptions);
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
      }
    };
  
    fetchSemesters();
  }, []);
  

  useEffect(() => {
    onSelect(selectedValue);
  }, [onSelect, selectedValue]);

  const handleAddSemester = async () => {
    let newSemesterValue = options.length;
    let newSemesterLabel = `Semester ${options.length}`;
    if(deleteOptionExists){
      newSemesterValue = options.length - 1;
      newSemesterLabel = `Semester ${options.length - 1}`;
    }
    const newSemester = { label: newSemesterLabel, value: newSemesterValue, color:"black" };
    let insertIndex = options.length - 1;

    const deleteOptionIndex = options.findIndex(option => option.value === 'del_semester');
    
    if (deleteOptionIndex !== -1) {
      insertIndex = deleteOptionIndex-1;
    }
    
    const updatedOptions = [
      ...options.slice(0, insertIndex),
      newSemester,
      ...options.slice(insertIndex, options.length)
    ];
    
    if (updatedOptions.length > 2) {
      if (!deleteOptionExists) {
        setDeleteOptionExists(true);
        updatedOptions.push({ label: 'Delete most recent semester', value: 'del_semester', color: '#ff0000' });
      }
    }
    setOptions(updatedOptions);
    setSelectedValue(newSemesterValue);
  };

  const handleDeleteRecentSemester = async () => {
    if (options.length > 2) {
      const deletedSemesterId = options.length - 2;
      const loggedInUser = JSON.parse(await AsyncStorage.getItem('loggedInUser'));
      const studentId = loggedInUser.studentId;
  
      try {
        const storedSemesters = await AsyncStorage.getItem('semesters');
        if (storedSemesters !== null) {
          const parsedSemesters = JSON.parse(storedSemesters);
          
          const semesterToDeleteIndex = parsedSemesters.findIndex(semester => semester.studentId === studentId && semester.id === deletedSemesterId);

          if (semesterToDeleteIndex !== -1) {          
            const updatedSemesters = parsedSemesters.filter((semester, index) => !(semester.studentId === studentId && semester.id === deletedSemesterId));
            
            await AsyncStorage.setItem('semesters', JSON.stringify(updatedSemesters));
          }

          const updatedOptions = options.filter((_, index) => index !== options.length - 3);
          setSelectedValue(updatedOptions.length);
          setOptions(updatedOptions);

          if (onDeleteCompleted && typeof onDeleteCompleted === 'function') {
            onDeleteCompleted();
          }
        }
      } catch (error) {
        console.error('Error deleting semester:', error);
      }
    } else {
      console.log('Cannot delete default semesters');
    }
  };
  
  

  return (
    <View style={styles.dropdown}>
    <RNPickerSelect
      placeholder={{}}
      items={options}
      onValueChange={(value) => {
        if (value === 'add_semester') {
          handleAddSemester();
        } 
        else if(value === 'del_semester'){
          handleDeleteRecentSemester();
        }
        else {
          setSelectedValue(value);
        }
      }}
      value={selectedValue}
      hideDoneBar={true}
      style={{
        inputIOS: {
          color: '#0096FF',  
        },
        inputAndroid: {
          color: '#0096FF', 
        },
      }}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    width: '50%',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: "#FFFFFF",
  },
});

export default Dropdown;
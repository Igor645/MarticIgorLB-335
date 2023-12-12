import React, { useState, useEffect } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dropdown = ({ onSelect, semesters }) => {
  const [selectedValue, setSelectedValue] = useState(1);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const storedSemesters = await AsyncStorage.getItem('semesters');
        if (storedSemesters !== null) {
          const parsedSemesters = JSON.parse(storedSemesters);
          const studentSemesters = parsedSemesters.filter(semester => semester.studentId === 1);
          const highestSemesterId = studentSemesters.reduce((maxId, semester) => Math.max(maxId, semester.id), 0);
          
          const generatedOptions = Array.from({ length: highestSemesterId }, (_, index) => ({
            label: `Semester ${index + 1}`,
            value: index + 1,
          }));
          generatedOptions.push({ label: 'Add Semester', value: 'add_semester', color: '#009688' });
          
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

  const handleAddSemester = () => {
    const newSemesterValue = options.length;
    const newSemesterLabel = `Semester ${options.length}`;
    const newSemester = { label: newSemesterLabel, value: newSemesterValue };
    const updatedOptions = [...options.slice(0, -1), newSemester, options[options.length - 1]];
    setOptions(updatedOptions);
    setSelectedValue(newSemesterValue);
  };

  return (
    <View style={styles.dropdown}>
      <RNPickerSelect
        placeholder={{}}
        items={options}
        onValueChange={(value) => {
          if (value === 'add_semester') {
            handleAddSemester();
          } else {
            setSelectedValue(value);
          }
        }}
        value={selectedValue}
        hideDoneBar={true}
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
    //backgroundColor: '#90e0ef',
    backgroundColor: "#FFFFFF",
  },
});

export default Dropdown;
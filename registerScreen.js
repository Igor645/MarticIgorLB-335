import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, Button, Text, View, FlatList, Alert, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      if (!username || !password) {
        Alert.alert('Incomplete Information', 'Please provide username and password.');
        return;
      }
  
      let users = await AsyncStorage.getItem('users');
      let parsedUsers = users ? JSON.parse(users) : [];
      let studentId = parsedUsers.length + 1;
  
      // Ensure unique studentId
      while (parsedUsers.some(user => user.studentId === studentId)) {
        studentId++;
      }
  
      const existingUser = parsedUsers.find(user => user.username === username);
      if (existingUser) {
        Alert.alert('User Already Exists', 'Please use a different username.');
        return;
      }
  
      const newUser = { username, password, studentId };
  
      const updatedUsers = [...parsedUsers, newUser];
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
  
      Alert.alert('Registration Successful', 'You can now login.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error registering:', error);
      Alert.alert('Registration Failed', 'Please try again.');
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
    <View style={styles.container}>
    <View style={[styles.subjectContainer, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
    <Text style={{fontSize: 20}}>Register Screen</Text>
    <TextInput
      placeholder="Username"
      value={username}
      onChangeText={setUsername}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: '#e3e4ef',
        backgroundColor: '#f0f0f5',
        padding: 10, // Adjust the padding to fit the text comfortably
      }}    />
    <TextInput
      placeholder="Password"
      secureTextEntry
      value={password}
      onChangeText={setPassword}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: '#e3e4ef',
        backgroundColor: '#f0f0f5',
        padding: 10, // Adjust the padding to fit the text comfortably
      }}    />
    <Button title="Register" onPress={handleRegister} />
    </View>
  </View>
  </KeyboardAvoidingView>
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

export default RegisterScreen;

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
import App from './App';

function LoginScreen({ route }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
          if (!username || !password) {
            Alert.alert('Incomplete Information', 'Please provide username and password.');
            return;
          }
      
          const users = await AsyncStorage.getItem('users');
          const parsedUsers = users ? JSON.parse(users) : [];
      
          const user = parsedUsers.find(user => user.username === username && user.password === password);
          if (user) {
            // Assuming studentId is present in the user object
            await AsyncStorage.setItem('loggedInUser', JSON.stringify({ isLoggedIn: true, studentId: user.studentId, username: user.username }));
            navigation.navigate('Overview');
          } else {
            Alert.alert('Login Failed', 'Invalid username or password.');
          }
        } catch (error) {
          console.error('Error logging in:', error);
          Alert.alert('Login Failed', 'Please try again.');
        }
      };     
  
    return (
      <View style={styles.container}>
        <View style={[styles.subjectContainer, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
        <Text style={{fontSize: 20}}>Login Screen</Text>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          // Other TextInput props
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          // Other TextInput props
        />
        <Button title="Login" onPress={handleLogin} />
        <TouchableOpacity style={{
            backgroundColor: "lime", 
            padding: 3,
            }} onPress={() => navigation.navigate('Register')}>
        <Text>Register</Text>
        </TouchableOpacity>
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

  export default LoginScreen;
  
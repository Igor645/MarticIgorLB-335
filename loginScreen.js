import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Button, Text, View, FlatList, Alert, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import ImageButton from './listBtn';
import AddSubjectButton from './addSubjectBtn';
import Dropdown from './dropdown';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

function LoginScreen({ route }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const auth = FIREBASE_AUTH;

      const handleLogin = async () => {
        try {
          if (!email || !password) {
            Alert.alert('Incomplete Information', 'Please provide username and password.');
            return;
          }
      
          const response = await signInWithEmailAndPassword(auth, email.trim(), password)

          const atIndex = email.indexOf('@');
          const username = email.slice(0, atIndex);

          await AsyncStorage.setItem(
            'loggedInUser',
            JSON.stringify({
              isLoggedIn: true,
              studentId: email,
              username: username,
            })
          );
          navigation.navigate('Overview');
        } catch (error) {
          console.error('Error logging in:', error);
          Alert.alert('Login Failed', 'Please try again.');
        }
      };     
  
    return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
        <View style={styles.container}>
        <View style={[styles.subjectContainer, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
        <Text style={{fontSize: 20}}>Login Screen</Text>
        <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#e3e4ef',
          backgroundColor: '#f0f0f5',
          padding: 10,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#e3e4ef',
          backgroundColor: '#f0f0f5',
          padding: 10,
        }}
      />
        <Button title="Login" onPress={handleLogin} />
        <TouchableOpacity style={{
            backgroundColor: "lime", 
            padding: 3,
            borderRadius: 1,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 1,
            elevation: 1,
            }} onPress={() => navigation.navigate('Register')}>
        <Text style={{color: "white",}}>Register</Text>
        </TouchableOpacity>
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
      tintColor: 'red',
    },
    subjectTitle: {
      fontSize: 20,
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
  
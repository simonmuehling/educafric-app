import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ConnectionTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('Not tested');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing...');

    try {
      // Test basic connection to server
      const response = await axios.get('http://localhost:5000/api/currency/detect', {
        timeout: 5000,
        withCredentials: true,
      });

      if (response.status === 200) {
        setTestResult('✅ Server connection successful!');
        Alert.alert('Success', 'Your app can connect to the EDUCAFRIC server');
      } else {
        setTestResult(`❌ Server responded with status: ${response.status}`);
      }
    } catch (error: any) {
      let errorMessage = '❌ Connection failed: ';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Server not running or wrong IP';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += 'Connection timeout - check IP address';
      } else if (error.response) {
        errorMessage += `Server error ${error.response.status}`;
      } else if (error.request) {
        errorMessage += 'No response from server';
      } else {
        errorMessage += error.message;
      }
      
      setTestResult(errorMessage);
      
      Alert.alert(
        'Connection Failed', 
        'Check:\n1. Server is running on port 5000\n2. IP address is correct\n3. Both devices on same network'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Test</Text>
      <Text style={styles.subtitle}>Test if your app can reach the server</Text>
      
      <TouchableOpacity
        style={[styles.testButton, isLoading && styles.disabledButton]}
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{testResult}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Current Configuration:</Text>
        <Text style={styles.infoText}>API URL: http://localhost:5000</Text>
        <Text style={styles.infoText}>Target: EDUCAFRIC Platform</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#0079F2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
});

export default ConnectionTest;
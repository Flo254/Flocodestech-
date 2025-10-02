import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  ImageBackground
} from 'react-native';

// Import AsyncStorage - this is the correct way for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Background image - you can change this URL to any image you like
const BACKGROUND_IMAGE = { 
  uri: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' 
};

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(2);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);

  // Load history when app starts
  useEffect(() => {
    loadHistory();
  }, []);

  // Load history from AsyncStorage
  const loadHistory = async () => {
    try {
      console.log('Loading history from storage...');
      const savedHistory = await AsyncStorage.getItem('conversionHistory');
      console.log('Saved history found:', savedHistory);
      
      if (savedHistory !== null) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.log('Error loading history:', error);
      Alert.alert('Error', 'Failed to load history');
    }
  };

  // Save history to AsyncStorage
  const saveHistory = async (newHistory) => {
    try {
      console.log('Saving history:', newHistory);
      await AsyncStorage.setItem('conversionHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.log('Error saving history:', error);
      Alert.alert('Error', 'Failed to save history');
    }
  };

  const convertNumber = () => {
    if (!inputValue.trim()) {
      Alert.alert('Error', 'Please enter a number to convert');
      return;
    }

    try {
      // Validate input based on base
      if (!isValidInput(inputValue, fromBase)) {
        Alert.alert('Error', Invalid characters for base-${fromBase} number);
        return;
      }

      const decimalValue = parseInt(inputValue, fromBase);
      
      if (isNaN(decimalValue)) {
        Alert.alert('Error', 'Invalid number format');
        return;
      }
      
      const convertedValue = decimalValue.toString(toBase).toUpperCase();
      setResult(convertedValue);
      
      // Add to history
      const conversionRecord = {
        input: inputValue,
        fromBase: fromBase,
        output: convertedValue,
        toBase: toBase,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      };
      
      const newHistory = [conversionRecord, ...history.slice(0, 9)];
      setHistory(newHistory);
      saveHistory(newHistory);
      
    } catch (error) {
      Alert.alert('Error', 'Conversion failed. Please check your input.');
    }
  };

  const isValidInput = (value, base) => {
    const validChars = {
      2: /^[01]+$/,
      8: /^[0-7]+$/,
      10: /^[0-9]+$/,
      16: /^[0-9A-Fa-f]+$/
    };
    return validChars[base].test(value.toUpperCase());
  };

  const clearAll = () => {
    setInputValue('');
    setResult('');
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('conversionHistory');
      setHistory([]);
      Alert.alert('Success', 'History cleared successfully!');
    } catch (error) {
      console.log('Error clearing history:', error);
      Alert.alert('Error', 'Failed to clear history');
    }
  };

  const BaseButton = ({ base, label, currentBase, setBase }) => (
    <TouchableOpacity 
      style={[
        styles.baseButton, 
        currentBase === base && styles.activeBase
      ]} 
      onPress={() => setBase(base)}
    >
      <View style={styles.baseButtonContent}>
        <Text style={[
          styles.baseButtonText,
          currentBase === base && styles.activeBaseText
        ]}>
          {label}
        </Text>
        <Text style={[
          styles.baseNumber,
          currentBase === base && styles.activeBaseNumber
        ]}>
          {base}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getBaseName = (base) => {
    switch(base) {
      case 2: return 'Binary';
      case 8: return 'Octal';
      case 10: return 'Decimal';
      case 16: return 'Hexadecimal';
      default: return 'Base ' + base;
    }
  };

  return (
    <ImageBackground 
      source={BACKGROUND_IMAGE} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Dark overlay for better readability */}
      <View style={styles.overlay} />
      
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>🧮</Text>
          </View>
          <Text style={styles.title}>Base Converter Pro</Text>
          <Text style={styles.subtitle}>Advanced Number System Conversion</Text>
        </View>

        {/* Main Conversion Card */}
        <View style={styles.mainCard}>
          {/* Convert From Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📥</Text>
              <Text style={styles.sectionTitle}>Input Number</Text>
              <View style={[styles.currentBaseBadge]}>
                <Text style={styles.currentBaseText}>Base {fromBase}</Text>
              </View>
            </View>
            
            <View style={styles.baseSelector}>
              <BaseButton base={2} label="Binary" currentBase={fromBase} setBase={setFromBase} />
              <BaseButton base={8} label="Octal" currentBase={fromBase} setBase={setFromBase} />
              <BaseButton base={10} label="Decimal" currentBase={fromBase} setBase={setFromBase} />
              <BaseButton base={16} label="Hex" currentBase={fromBase} setBase={setFromBase} />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder={Enter ${getBaseName(fromBase).toLowerCase()} number...}
              placeholderTextColor="#a0a0a0"
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="default"
              autoCapitalize="characters"
            />
          </View>

          {/* Convert To Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📤</Text>
              <Text style={styles.sectionTitle}>Output Number</Text>
              <View style={[styles.currentBaseBadge]}>
                <Text style={styles.currentBaseText}>Base {toBase}</Text>
              </View>
            </View>
            
            <View style={styles.baseSelector}>
              <BaseButton base={2} label="Binary" currentBase={toBase} setBase={setToBase} />
              <BaseButton base={8} label="Octal" currentBase={toBase} setBase={setToBase} />
              <BaseButton base={10} label="Decimal" currentBase={toBase} setBase={setToBase} />
              <BaseButton base={16} label="Hex" currentBase={toBase} setBase={setToBase} />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]} 
              onPress={convertNumber}
            >
              <Text style={styles.actionButtonText}>⚡ Convert Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={clearAll}
            >
              <Text style={styles.actionButtonText}>🗑 Clear Input</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Result Section */}
        {result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>✅</Text>
              <Text style={styles.resultTitle}>Conversion Result</Text>
            </View>
            
            <View style={styles.resultContent}>
              <Text style={styles.resultValue}>{result}</Text>
              <Text style={styles.resultDetails}>
                {inputValue} (base {fromBase}) = {result} (base {toBase})
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderIcon}>🔍</Text>
            <Text style={styles.placeholderText}>
              Enter a number above to see conversion results
            </Text>
          </View>
        )}

        {/* History Section */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyIcon}>📊</Text>
            <Text style={styles.historyTitle}>Conversion History</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearHistoryText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {history.length > 0 ? (
            <ScrollView 
              style={styles.historyList}
              showsVerticalScrollIndicator={false}
            >
              {history.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyConversion}>
                      <Text style={styles.historyFrom}>{item.input}</Text>
                      <Text style={styles.historyArrow}> → </Text>
                      <Text style={styles.historyTo}>{item.output}</Text>
                    </Text>
                    <Text style={styles.historyBase}>
                      Base {item.fromBase} → Base {item.toBase}
                    </Text>
                    <Text style={styles.historyTime}>{item.timestamp}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noHistoryText}>No conversions yet. Convert some numbers to see them here!</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>💡</Text>
          <Text style={styles.footerText}>Base Converter Pro v2.0</Text>
          <Text style={styles.footerSubtext}>Works completely offline • Data saved locally</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  currentBaseBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  currentBaseText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  baseSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  baseButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeBase: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  baseButtonContent: {
    alignItems: 'center',
  },
  baseButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeBaseText: {
    color: 'white',
  },
  baseNumber: {
    fontSize: 10,
    color: '#adb5bd',
    marginTop: 2,
  },
  activeBaseNumber: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  input: {
    borderWidth: 2,
    borderColor: 'rgba(233, 236, 239, 0.8)',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    color: '#2c3e50',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: '#27ae60',
  },
  secondaryButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: 'rgba(212, 237, 218, 0.95)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#28a745',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#155724',
  },
  resultContent: {
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 10,
  },
  resultDetails: {
    fontSize: 14,
    color: '#155724',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  placeholderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: 'rgba(222, 226, 230, 0.5)',
  },
  placeholderIcon: {
    fontSize: 30,
    marginBottom: 10,
    opacity: 0.7,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  clearHistoryText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 14,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(241, 243, 244, 0.5)',
  },
  historyContent: {
    flex: 1,
  },
  historyConversion: {
    fontSize: 16,
    marginBottom: 4,
  },
  historyFrom: {
    fontWeight: '600',
    color: '#e74c3c',
  },
  historyArrow: {
    color: '#7f8c8d',
  },
  historyTo: {
    fontWeight: '600',
    color: '#27ae60',
  },
  historyBase: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 11,
    color: '#bdc3c7',
  },
  noHistoryText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    padding: 20,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
}); 
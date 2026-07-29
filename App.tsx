import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import { AppProvider, useApp } from './src/context/AppContext';
import { setupNotificationHandler } from './src/services/notifications';
import { RootStackParamList } from './src/types';
import { Colors, Typography, Spacing } from './src/theme';

import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PinGateScreen } from './src/screens/PinGateScreen';
import { CaregiverSetupScreen } from './src/screens/CaregiverSetupScreen';
import { AddMedicationScreen } from './src/screens/AddMedicationScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ChangePinScreen } from './src/screens/ChangePinScreen';
import { DoseLogScreen } from './src/screens/DoseLogScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { state } = useApp();

  // Show a splash/loading while AsyncStorage hydrates
  if (!state.isHydrated) {
    return (
      <View style={styles.splash}>
        <Ionicons name="medkit-outline" size={64} color={Colors.primary} />
        <Text style={styles.splashTitle}>PillPrompt</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  // If senior name is empty, the app hasn't been set up yet — show onboarding
  const initialRoute = state.settings.seniorName ? 'Home' : 'Onboarding';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'PillPrompt', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="PinGate"
        component={PinGateScreen}
        options={{ title: 'Setup', presentation: 'modal', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="CaregiverSetup"
        component={CaregiverSetupScreen}
        options={{ title: 'Caregiver Setup', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={({ route }) => ({
          title: route.params?.medicationId ? 'Edit Medication' : 'Add Medication',
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="ChangePin"
        component={ChangePinScreen}
        options={{ title: 'Change PIN', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="DoseLog"
        component={DoseLogScreen}
        options={{ title: 'Dose Log', headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    setupNotificationHandler();

    const sub = Notifications.addNotificationResponseReceivedListener((_response) => {
      // Handle notification tap — post-MVP enhancement
    });

    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashEmoji: {
    marginBottom: Spacing.md,
  },
  splashTitle: {
    ...Typography.h1,
    color: Colors.primary,
    marginTop: Spacing.md,
  },
});


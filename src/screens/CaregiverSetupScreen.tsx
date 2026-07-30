import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { MedicationListItem } from '../components/MedicationListItem';

type Props = NativeStackScreenProps<RootStackParamList, 'CaregiverSetup'>;

export function CaregiverSetupScreen({ navigation }: Props) {
  const { state, deleteMedication } = useApp();

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Medication', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMedication(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Medications Section */}
      <View style={styles.sectionTitleRow}>
        <Ionicons name="list-outline" size={18} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Medications</Text>
      </View>
      {state.medications.length === 0 ? (
        <Text style={styles.empty}>No medications yet. Tap below to add one.</Text>
      ) : (
        <FlatList
          data={state.medications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MedicationListItem
              medication={item}
              onPress={() => navigation.navigate('AddMedication', { medicationId: item.id })}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          )}
          style={styles.list}
        />
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddMedication', {})}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+ Add Medication</Text>
      </TouchableOpacity>

      {/* Settings Links */}
      <View style={styles.sectionTitleRow}>
        <Ionicons name="settings-outline" size={18} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Settings</Text>
      </View>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Settings')}>
        <View style={styles.linkIcon}>
          <Ionicons name="call-outline" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.linkText} numberOfLines={1}>Caregiver Phone, Grace Period & Name</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('ChangePin')}>
        <View style={styles.linkIcon}>
          <Ionicons name="key-outline" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.linkText}>Change PIN</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('DoseLog')}>
        <View style={styles.linkIcon}>
          <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.linkText}>Dose Log</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.primary,
  },
  empty: {
    ...Typography.body,
    fontStyle: 'italic',
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  list: {
    maxHeight: 250,
    marginBottom: Spacing.sm,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  addButtonText: {
    ...Typography.button,
    fontSize: 17,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  linkText: {
    ...Typography.body,
    flex: 1,
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

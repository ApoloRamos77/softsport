import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../src/constants/Colors';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, Entrenador</Text>
        <Text style={styles.date}>Martes, 20 Abril 2026</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: Colors.success, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>Entrenamientos de hoy</Text>
          <Text style={styles.statValue}>2</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: Colors.info, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>Alumnos Activos</Text>
          <Text style={styles.statValue}>24</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Próximas Sesiones</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Categoría U-14</Text>
          <Text style={styles.cardTime}>16:00 - 18:00</Text>
        </View>
        <Text style={styles.cardDesc}>Campo Principal - Táctico</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  date: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textInverse,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  cardTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.info,
  },
  cardDesc: {
    color: Colors.textMuted,
    fontSize: 14,
  }
});

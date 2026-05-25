import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const STEPS = [
  { key: 'antrian', label: 'Antrian' },
  { key: 'dicuci', label: 'Dicuci' },
  { key: 'disetrika', label: 'Setrika' },
  { key: 'siap diambil', label: 'Siap Ambil' },
];

const STATUS_ORDER = ['antrian', 'dicuci', 'disetrika', 'siap diambil', 'diambil'];

export default function StatusBar({ currentStatus }) {
  const rawIndex = STATUS_ORDER.indexOf(currentStatus);
  const currentIndex = rawIndex === -1 ? 0 : rawIndex;
  const isDone = currentStatus === 'diambil';

  // Calculate progress line width inside the background line
  const progressPercent = isDone 
    ? 100 
    : (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <View style={styles.container}>
      {/* Arrow Indicator Row floating above the dots */}
      <View style={styles.indicatorRow}>
        {STEPS.map((step, i) => {
          const stepIndex = STATUS_ORDER.indexOf(step.key);
          const isActive = stepIndex === currentIndex && !isDone;
          
          return (
            <View key={`arrow-${step.key}`} style={styles.arrowColumn}>
              {isActive ? (
                <Ionicons name="chevron-down" size={14} color="#59C1BD" style={styles.arrowIcon} />
              ) : (
                <View style={styles.arrowPlaceholder} />
              )}
            </View>
          );
        })}
      </View>

      {/* Track & Stepper Row */}
      <View style={styles.trackWrapper}>
        {/* Grey Background Track (strictly spans from center of first dot to center of last dot) */}
        <View style={styles.backgroundLine}>
          {/* Active Blue Progress Track */}
          <View style={[styles.activeLine, { width: `${progressPercent}%` }]} />
        </View>
        
        {/* Stepper Dots */}
        <View style={styles.dotsRow}>
          {STEPS.map((step, i) => {
            const stepIndex = STATUS_ORDER.indexOf(step.key);
            const isCompleted = isDone || stepIndex < currentIndex;
            const isActive = stepIndex === currentIndex && !isDone;

            return (
              <View key={step.key} style={styles.dotColumn}>
                {/* Step Circle */}
                <View style={[
                  styles.dotOuter,
                  isCompleted && styles.dotCompleted,
                  isActive && styles.dotActive
                ]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={[
                      styles.dotNumberText,
                      isActive && styles.dotActiveNumberText
                    ]}>
                      {i + 1}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Labels Row */}
      <View style={styles.labelsRow}>
        {STEPS.map((step, i) => {
          const stepIndex = STATUS_ORDER.indexOf(step.key);
          const isCompleted = isDone || stepIndex < currentIndex;
          const isActive = stepIndex === currentIndex && !isDone;

          return (
            <View key={`label-${step.key}`} style={styles.labelColumn}>
              <Text style={[
                styles.labelText,
                (isCompleted || isActive) && styles.labelActiveText,
                isActive && styles.labelFocusedText
              ]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorRow: {
    flexDirection: 'row',
    width: '100%',
    height: 16,
    marginBottom: 2,
  },
  arrowColumn: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    transform: [{ translateY: 2 }],
  },
  arrowPlaceholder: {
    height: 14,
  },
  trackWrapper: {
    width: '100%',
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundLine: {
    position: 'absolute',
    left: '12.5%',
    right: '12.5%',
    top: 14.5,
    height: 3,
    backgroundColor: '#CBD5E1',
    borderRadius: 1.5,
    overflow: 'hidden',
    zIndex: 1,
  },
  activeLine: {
    height: '100%',
    backgroundColor: '#59C1BD',
  },
  dotsRow: {
    flexDirection: 'row',
    width: '100%',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  dotColumn: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderColor: '#59C1BD',
    backgroundColor: '#59C1BD',
  },
  dotCompleted: {
    borderColor: '#59C1BD',
    backgroundColor: '#59C1BD',
  },
  dotNumberText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#94A3B8',
  },
  dotActiveNumberText: {
    color: '#FFFFFF',
  },
  labelsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
  },
  labelColumn: {
    width: '25%',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#94A3B8',
    textAlign: 'center',
  },
  labelActiveText: {
    color: '#64748B',
  },
  labelFocusedText: {
    color: '#59C1BD',
  },
});

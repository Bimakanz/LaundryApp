import React from 'react';
import { View, Text, Platform } from 'react-native';
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
    <View style={{ width: '100%', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
      {/* Arrow Indicator Row floating above the dots */}
      <View style={{ flexDirection: 'row', width: '100%', height: 16, marginBottom: 2 }}>
        {STEPS.map((step, i) => {
          const stepIndex = STATUS_ORDER.indexOf(step.key);
          const isActive = stepIndex === currentIndex && !isDone;
          
          return (
            <View key={`arrow-${step.key}`} style={{ width: '25%', alignItems: 'center', justifyContent: 'center' }}>
              {isActive ? (
                <Ionicons name="chevron-down" size={14} color="#56C3E2" style={{ transform: [{ translateY: 2 }] }} />
              ) : (
                <View style={{ height: 14 }} />
              )}
            </View>
          );
        })}
      </View>

      {/* Track & Stepper Row */}
      <View style={{ width: '100%', height: 32, justifyContent: 'center', position: 'relative' }}>
        {/* Grey Background Track (strictly spans from center of first dot to center of last dot) */}
        <View style={{ position: 'absolute', left: '12.5%', right: '12.5%', top: 14.5, height: 3, backgroundColor: '#CBD5E1', borderRadius: 1.5, overflow: 'hidden', zIndex: 1 }}>
          {/* Active Blue Progress Track */}
          <View style={[{ height: '100%', backgroundColor: '#56C3E2' }, { width: `${progressPercent}%` }]} />
        </View>
        
        {/* Stepper Dots */}
        <View style={{ flexDirection: 'row', width: '100%', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', zIndex: 2 }}>
          {STEPS.map((step, i) => {
            const stepIndex = STATUS_ORDER.indexOf(step.key);
            // Modified: Treat current step as completed visually so it shows a checkmark
            const isCompleted = isDone || stepIndex <= currentIndex;
            const isActive = stepIndex === currentIndex && !isDone;

            return (
              <View key={step.key} style={{ width: '25%', alignItems: 'center', justifyContent: 'center' }}>
                {/* Step Circle */}
                <View style={[
                  { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
                  isCompleted && { borderColor: '#56C3E2', backgroundColor: '#56C3E2' },
                  isActive && { borderColor: '#56C3E2', backgroundColor: '#56C3E2' }
                ]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={[
                      { fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', color: '#94A3B8' },
                      isActive && { color: '#FFFFFF' }
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
      <View style={{ flexDirection: 'row', width: '100%', marginTop: 8 }}>
        {STEPS.map((step, i) => {
          const stepIndex = STATUS_ORDER.indexOf(step.key);
          const isCompleted = isDone || stepIndex < currentIndex;
          const isActive = stepIndex === currentIndex && !isDone;

          return (
            <View key={`label-${step.key}`} style={{ width: '25%', alignItems: 'center' }}>
              <Text style={[
                { fontSize: 10, fontFamily: 'PlusJakartaSans-Bold', color: '#94A3B8', textAlign: 'center' },
                (isCompleted || isActive) && { color: '#64748B' },
                isActive && { color: '#56C3E2' }
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


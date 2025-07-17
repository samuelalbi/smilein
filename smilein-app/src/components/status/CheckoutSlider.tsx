/* eslint-disable react-native/no-inline-styles */
// src/components/status/CheckoutSlider.tsx
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AttendanceStatus } from '../../types/schedule';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDE_THRESHOLD = SCREEN_WIDTH * 0.4;

type CheckoutSliderProps = {
  status: AttendanceStatus;
  checkOutTime: string | null;
  onCheckout: () => void;
  isCheckingOut: boolean;
};

const CheckoutSlider: React.FC<CheckoutSliderProps> = ({
  status,
  checkOutTime,
  onCheckout,
  isCheckingOut,
}) => {
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const sliderTextOpacity = useRef(new Animated.Value(1)).current;

  // Create pan responder for slide gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !checkOutTime && !isCheckingOut, // Only allow sliding if not checked out
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx <= SCREEN_WIDTH - 80) {
          slideAnim.setValue(gestureState.dx);

          // Fade out slider text as slider moves
          const progress = gestureState.dx / (SCREEN_WIDTH - 80);
          sliderTextOpacity.setValue(1 - progress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= SLIDE_THRESHOLD) {
          // Slider passed threshold - complete checkout
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: SCREEN_WIDTH - 80,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(buttonOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(sliderTextOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onCheckout();
          });
        } else {
          // Return to start
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(sliderTextOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const getStatusColor = () => {
    switch (status) {
      case 'PRESENT':
        return '#4CAF50';
      case 'LATE':
        return '#FFC107';
      case 'ABSENT':
        return '#F44336';
      case 'ONGOING':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  // If already checked out, show confirmation message
  if (checkOutTime && (status === 'PRESENT' || status === 'LATE')) {
    return (
      <View style={[styles.bottomContainer, { backgroundColor: '#f0f0f0' }]}>
        <View style={styles.checkoutCompleteContainer}>
          <Icon name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.checkoutCompleteText}>
            Checkout Berhasil pada {checkOutTime}
          </Text>
        </View>
      </View>
    );
  }

  // If not checked out, show slider
  if (!checkOutTime && (status === 'PRESENT' || status === 'LATE')) {
    return (
      <View style={styles.bottomContainer}>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <Animated.View
              style={[
                styles.sliderButton,
                {
                  transform: [{ translateX: slideAnim }],
                  backgroundColor: getStatusColor(),
                  opacity: buttonOpacity,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Icon name="arrow-forward" size={24} color="#fff" />
            </Animated.View>
            <Animated.Text
              style={[
                styles.sliderText,
                { opacity: sliderTextOpacity },
              ]}
            >
              Slide untuk Checkout
            </Animated.Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sliderContainer: {
    alignItems: 'center',
  },
  sliderTrack: {
    width: '100%',
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sliderButton: {
    position: 'absolute',
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutCompleteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  checkoutCompleteText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default CheckoutSlider;

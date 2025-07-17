// ProfileCard.tsx - Safe version dengan fallback timezone handling
import React from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { getStatusColor } from '../../utils/statusHelpers';

// Safe import dengan fallback
let timezoneUtils: any = null;
try {
  timezoneUtils = require('../../utils/timezoneUtils');
  console.log('✅ ProfileCard: timezoneUtils imported successfully');
} catch (importError) {
  console.warn('⚠️ ProfileCard: Could not import timezoneUtils, using fallback:', importError);
}

type ProfileCardProps = {
  studentName: string;
  studentNIM: string;
  studentProgram: string;
  checkInTime: string | null;
  status: string;
  imageUrl: string;
  showStatusEffect: boolean;
  pulseScale: Animated.AnimatedInterpolation<number>;
  pulseOpacity: Animated.AnimatedInterpolation<number>;
  onImageError?: () => void;
};

const ProfileCard = ({
  studentName,
  studentNIM,
  studentProgram,
  checkInTime,
  status,
  imageUrl,
  showStatusEffect,
  pulseScale,
  pulseOpacity,
  onImageError,
}: ProfileCardProps) => {

  // SAFE: Format check-in time dengan fallback handling
  const formatCheckInTime = (timeString: string | null): string => {
    if (!timeString) {return '-';}

    // Try menggunakan timezone utils jika tersedia
    if (timezoneUtils && timezoneUtils.formatCheckInTime) {
      try {
        const result = timezoneUtils.formatCheckInTime(timeString);
        if (result && result !== '-') {
          return result;
        }
      } catch (utilError) {
        console.warn('timezoneUtils.formatCheckInTime failed, using fallback:', utilError);
      }
    }

    // Fallback manual formatting
    try {
      console.log('Using fallback time formatting for:', timeString);

      // Handle ISO date format
      if (timeString.includes('T')) {
        let dateObj: Date;

        // Jika sudah ada 'Z' di akhir, berarti sudah UTC
        if (timeString.endsWith('Z')) {
          dateObj = new Date(timeString);
        }
        // Jika tidak ada 'Z', asumsikan UTC juga (dari server)
        else {
          dateObj = new Date(timeString + 'Z');
        }

        // Manual konversi ke Jakarta (UTC+7)
        try {
          const jakartaTime = new Date(dateObj.getTime() + (7 * 3600000));
          const hours = jakartaTime.getHours().toString().padStart(2, '0');
          const minutes = jakartaTime.getMinutes().toString().padStart(2, '0');
          const result = `${hours}:${minutes}`;

          console.log(`🕐 Fallback time conversion: ${timeString} -> ${result} (Jakarta)`);
          return result;
        } catch (manualConversionError) {
          console.warn('Manual timezone conversion failed:', manualConversionError);

          // Last resort: ambil bagian waktu saja
          const timePart = timeString.split('T')[1];
          return timePart.substring(0, 5);
        }
      }

      // Handle simple time format (12:34)
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
      }

      return timeString;
    } catch (error) {
      console.error('All time formatting methods failed:', error, 'Input:', timeString);
      return timeString || '-';
    }
  };

  // Get status color and text
  const statusColor = getStatusColor(status);
  const statusText = status.replace('_', ' ');

  return (
    <View style={styles.card}>
      <View style={styles.profileSection}>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{studentName}</Text>
          <Text style={styles.nim}>{studentNIM}</Text>
          <Text style={styles.program}>{studentProgram}</Text>

          <View style={styles.attendanceInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{statusText}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Check In</Text>
              <Text style={styles.infoValue}>
                {formatCheckInTime(checkInTime)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.imageContainer}>
          {showStatusEffect && (
            <Animated.View
              style={[
                styles.pulseEffect,
                {
                  borderColor: statusColor,
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                },
              ]}
            />
          )}
          <View style={[styles.imageWrapper, { borderColor: statusColor }]}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.profileImage}
              onError={onImageError}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  nim: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  program: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  attendanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    marginLeft: 15,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  pulseEffect: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 50,
    borderWidth: 3,
  },
  profileImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
});

export default ProfileCard;

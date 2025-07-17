import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface HistoryHeaderProps {
  selectedDate: Date | null;
  formatDate: (date: Date) => string;
}

const HistoryHeader: React.FC<HistoryHeaderProps> = ({ selectedDate, formatDate }) => {
  return (
    <View style={styles.scheduleInfoContainer}>
      {/* Filter Button */}
      <View style={styles.locationBanner}>
        <Icon name="calendar-outline" size={18} color="#fff" style={styles.locationIcon} />
        <Text style={styles.locationText}>
          {selectedDate ? formatDate(selectedDate) : 'Semua Tanggal'}
        </Text>
      </View>

      {/* Schedule Title */}
      <View style={styles.scheduleTitleContainer}>
        <Text style={styles.scheduleHeading}>Riwayat Kehadiran</Text>
        <Text style={styles.dateText}>
          {selectedDate
            ? `Menampilkan data: ${formatDate(selectedDate)}`
            : 'Menampilkan semua data'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scheduleInfoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 30,
    alignSelf: 'flex-end',
  },
  locationIcon: {
    marginRight: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  scheduleTitleContainer: {
    marginBottom: 5,
  },
  scheduleHeading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
});

export default HistoryHeader;

// src/components/detail/history/FilterControls.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

interface FilterControlsProps {
  selectedDate: Date | null;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  handleDateChange: (event: any, date?: Date) => void;
  resetDateFilter: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedDate,
  showCalendar,
  setShowCalendar,
  handleDateChange,
  resetDateFilter,
}) => {
  // Format the selected date for display
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filter Riwayat</Text>

        <View style={styles.dateFilterContainer}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowCalendar(true)}
          >
            <Icon name="calendar-outline" size={20} color="#232F40" />
            <Text style={styles.datePickerText}>
              {selectedDate ? formatDateForDisplay(selectedDate) : 'Pilih Tanggal'}
            </Text>
          </TouchableOpacity>

          {selectedDate && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetDateFilter}
            >
              <Icon name="close-circle-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {showCalendar && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()} // Optional: prevent selecting future dates
          />
        )}
      </View>

      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#232F40',
    marginBottom: 12,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  datePickerText: {
    marginLeft: 8,
    color: '#232F40',
    fontSize: 14,
  },
  resetButton: {
    padding: 10,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
});

export default FilterControls;

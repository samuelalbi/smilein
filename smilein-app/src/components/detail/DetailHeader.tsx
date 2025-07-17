// src/components/detail/DetailHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type DetailHeaderProps = {
  title: string;
  subtitle: string;
  onBackPress: () => void;
};

const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
}) => {
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Navigation bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Mata Kuliah</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="grid-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Course info section */}
      <View style={styles.headerInfoContainer}>
        <Text style={styles.headerHeading}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
        <Text style={styles.dateText}>{formatDate()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#232F40',
    zIndex: 1,
    paddingBottom: 30,
  },
  header: {
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#232F40',
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 8,
  },
  headerInfoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  headerHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
});

export default DetailHeader;

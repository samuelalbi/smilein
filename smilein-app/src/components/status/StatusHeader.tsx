// src/components/status/StatusHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AttendanceStatus } from '../../types/schedule';
import { getStatusColor, getStatusText, getStatusDescription, getStatusIcon } from '../../utils/statusPresenceUtils';

type StatusHeaderProps = {
  status: AttendanceStatus;
  onBackPress: () => void;
  checkOutTime?: string | null;
};

const StatusHeader: React.FC<StatusHeaderProps> = ({
  status,
  onBackPress,
  checkOutTime = null,
}) => {
  // Langsung gunakan fungsi-fungsi dari utilitas
  const statusIcon = getStatusIcon(status, checkOutTime);
  const statusText = getStatusText(status);
  const statusDescription = getStatusDescription(status, checkOutTime);
  const statusColor = getStatusColor(status);

  return (
    <View style={[styles.header, { backgroundColor: statusColor }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Icon name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.statusContent}>
        <Icon name={statusIcon} size={60} color="#fff" />
        <Text style={styles.statusTitle}>{statusText}</Text>
        <Text style={styles.statusDescription}>{statusDescription}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statusDescription: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default StatusHeader;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ProfileHeaderProps {
    onBackPress: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onBackPress }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                <Icon name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Profil Saya</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 0 : 16,
        backgroundColor: '#1E2A40',
        position: 'relative',
    },
    backButton: {
        padding: 8,
        position: 'absolute',
        left: 8,
        zIndex: 10,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ProfileHeader;

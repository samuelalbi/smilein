import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import FormField from './FormField';
import { UserInfo } from '../../hooks/useUserInfo';
import { formatDate } from '../../utils/formatters';

interface ProfileContentProps {
    userInfo: UserInfo;
    onUpdateField: (key: keyof UserInfo, value: string) => void;
    onSaveChanges: () => void;
    isSaving?: boolean;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
    userInfo,
    onUpdateField,
    onSaveChanges,
    isSaving = false,
}) => {
    // Define which fields are editable
    const editableFields: Array<keyof UserInfo> = ['nim', 'username', 'full_name', 'major_name'];

    // Check if a field is editable
    const isEditable = (field: keyof UserInfo): boolean => {
        return editableFields.includes(field);
    };

    return (
        <View style={styles.contentContainer}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Informasi Akademik</Text>

                <FormField
                    label="NIM"
                    value={userInfo.nim}
                    icon="card-outline"
                    editable={isEditable('nim')}
                    onChange={(text) => onUpdateField('nim', text)}
                />

                <FormField
                    label="Username"
                    value={userInfo.username}
                    icon="person-outline"
                    editable={isEditable('username')}
                    onChange={(text) => onUpdateField('username', text)}
                />

                <FormField
                    label="Nama Lengkap"
                    value={userInfo.full_name}
                    icon="person-outline"
                    editable={isEditable('full_name')}
                    onChange={(text) => onUpdateField('full_name', text)}
                />

                <FormField
                    label="Program Studi"
                    value={userInfo.major_name}
                    icon="school-outline"
                    editable={isEditable('major_name')}
                    onChange={(text) => onUpdateField('major_name', text)}
                />

                <FormField
                    label="Tahun Akademik"
                    value={userInfo.year}
                    icon="calendar-outline"
                    editable={false} // Keep this as non-editable but we'll still send the value
                />

                <Text style={styles.sectionTitle}>Informasi Sistem</Text>

                <FormField
                    label="ID Mahasiswa"
                    value={String(userInfo.student_id)}
                    icon="id-card-outline"
                    editable={false}
                />

                <FormField
                    label="Dibuat Pada"
                    value={formatDate(userInfo.created_at)}
                    icon="time-outline"
                    editable={false}
                />

                <FormField
                    label="Diperbarui Pada"
                    value={formatDate(userInfo.updated_at)}
                    icon="refresh-outline"
                    editable={false}
                />

                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.savingButton]}
                    onPress={onSaveChanges}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <View style={styles.savingContainer}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.saveButtonText}>Menyimpan...</Text>
                        </View>
                    ) : (
                        <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        backgroundColor: '#f5f5f7',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -20,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 10,
        color: '#1E2A40',
    },
    saveButton: {
        backgroundColor: '#3498db',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    savingButton: {
        backgroundColor: '#7ab6e6',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    savingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ProfileContent;

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Modal,
    TouchableWithoutFeedback,
    BackHandler,
    ActivityIndicator,
} from 'react-native';
import { authService } from '../services/api';
const { width, height } = Dimensions.get('window');

interface LogoutModalProps {
    visible: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const LogoutModal = ({ visible, onClose, onLogout }: LogoutModalProps) => {
    // Animation values
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Loading state for logout process
    const [isLoading, setIsLoading] = useState(false);

    // Handle back button press
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (visible) {
                handleClose();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [visible]);

    // Handle animations when visibility changes
    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, 50); // Short delay to ensure smooth animation start
        }
    }, [visible, slideAnim, fadeAnim]);

    const handleClose = () => {
        // Flag to prevent multiple close attempts
        let isClosed = false;

        // Animate out before calling onClose
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (!isClosed) {
                isClosed = true;
                onClose();
            }
        });
    };

    const handleLogoutPress = async () => {
        // Set loading state to true
        setIsLoading(true);

        try {
            // Call the logout API service to remove the token
            await authService.logout();

            // Flag to prevent multiple logout attempts
            let isLoggedOut = false;

            // Animate out before calling onLogout
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (!isLoggedOut) {
                    isLoggedOut = true;
                    // Call the onLogout callback passed from parent component
                    onLogout();
                }
            });
        } catch (error) {
            console.error('Error during logout:', error);
            // You might want to show an error message here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none" // We'll handle animation ourselves
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                {/* Animated background overlay */}
                <Animated.View
                    style={[
                        styles.modalOverlay,
                        { opacity: fadeAnim },
                    ]}
                >
                    <TouchableWithoutFeedback onPress={handleClose}>
                        <View style={styles.overlayTouchable} />
                    </TouchableWithoutFeedback>
                </Animated.View>

                {/* Animated modal content */}
                <Animated.View
                    style={[
                        styles.modalContainer,
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Ingin Keluar?</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modalText}>
                        Pastikan semua aktivitas Anda sudah selesai, ya.{'\n'}
                        Terima kasih telah menggunakan SenDir!
                    </Text>

                    <TouchableOpacity
                        style={[styles.logoutButton, isLoading && styles.disabledButton]}
                        onPress={handleLogoutPress}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.logoutButtonText}>Keluar</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    overlayTouchable: {
        flex: 1,
    },
    modalContainer: {
        width: width,
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    modalText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    logoutButton: {
        backgroundColor: '#FF5757',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#ffadad',
    },
});

export default LogoutModal;

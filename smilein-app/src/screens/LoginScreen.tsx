/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    StatusBar,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LoginScreen = ({ }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Silakan masukkan nama pengguna dan kata sandi');
            return;
        }

        setIsLoading(true);
        try {
            const success = await login(username, password);
            if (!success) {
                Alert.alert('Login Gagal', 'Nama pengguna atau kata sandi tidak valid');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Terjadi kesalahan saat login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                <StatusBar backgroundColor="#232F40" barStyle="light-content" />

                {/* Blue header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Selamat Datang di</Text>
                    <Text style={styles.appName}>SmileIn</Text>
                </View>

                {/* White curved body */}
                <View style={styles.body}>
                    <Text style={styles.description}>
                        SmileIn merupakan aplikasi absensi untuk melakukan presensi senyuman.
                    </Text>

                    <View style={styles.inputWrapper}>
                        {/* Username input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                placeholderTextColor="#999"
                                style={styles.input}
                                placeholder="Nama Pengguna"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Kata Sandi"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye' : 'eye-off'}
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Forgot password link */}
                        {/* <TouchableOpacity style={styles.forgotPasswordContainer}>
                            <Text style={styles.forgotPasswordText}>Lupa Kata Sandi?</Text>
                        </TouchableOpacity> */}
                    </View>

                    {/* Login button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Masuk</Text>
                        )}
                    </TouchableOpacity>

                    {/* Add some extra padding at the bottom for keyboard */}
                    <View style={styles.bottomPadding} />
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#232F40',
    },
    contentContainer: {
        flexGrow: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    body: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 30,
        marginTop: 50,
    },
    description: {
        paddingTop: 15,
        fontSize: 14,
        color: '#333',
        marginBottom: 30,
        lineHeight: 20,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        marginBottom: 15,
        marginVertical: 20,
        paddingHorizontal: 15,
        height: 50,
        backgroundColor: '#FFFFFF',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 5,
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        color: '#232F40',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#232F40',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomPadding: {
        height: 100,
    },
});

export default LoginScreen;
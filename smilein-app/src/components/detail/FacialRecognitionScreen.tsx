// src/screens/FacialRecognitionScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useCameraDevices } from 'react-native-vision-camera';
import CameraView from './CameraView';

type RecognitionResult = {
    imagePath: string;
    recognitionResult?: {
        identity: string;
        confidence: number;
        faceDetected: boolean;
    };
};

const FacialRecognitionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [cameraMode, setCameraMode] = useState(true);
    const [result, setResult] = useState<RecognitionResult | null>(null);
    const devices = useCameraDevices();
    const device = devices.front; // Using front camera for face recognition

    // Handle successful capture
    const handleCapture = (captureResult: RecognitionResult) => {
        setResult(captureResult);
        setCameraMode(false);
    };

    // Go back to camera mode
    const handleRetake = () => {
        setResult(null);
        setCameraMode(true);
    };

    // Complete the recognition process
    const handleConfirm = () => {
        // Here you could save the result or navigate to another screen
        // Example:
        navigation.navigate('ConfirmationScreen', {
            identity: result?.recognitionResult?.identity,
            confidence: result?.recognitionResult?.confidence,
            imagePath: result?.imagePath
        });
    };

    // Cancel the entire process
    const handleCancel = () => {
        navigation.goBack();
    };

    if (!device) {
        // Camera not yet ready
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading camera...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {cameraMode ? (
                <CameraView
                    device={device}
                    onCapture={handleCapture}
                    onCancel={handleCancel}
                />
            ) : (
                <View style={styles.resultContainer}>
                    <Text style={styles.headerText}>Verification Result</Text>

                    {result?.imagePath && (
                        <Image
                            source={{ uri: `file://${result.imagePath}` }}
                            style={styles.capturedImage}
                        />
                    )}

                    {result?.recognitionResult && (
                        <View style={styles.resultBox}>
                            <Text style={styles.resultText}>
                                Face Detected: {result.recognitionResult.faceDetected ? 'Yes' : 'No'}
                            </Text>

                            {result.recognitionResult.faceDetected ? (
                                <>
                                    <Text style={styles.resultText}>
                                        Identity: {result.recognitionResult.identity}
                                    </Text>
                                    <Text style={styles.resultText}>
                                        Confidence: {(result.recognitionResult.confidence * 100).toFixed(2)}%
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.errorText}>
                                    No face detected. Please try again with your face clearly visible.
                                </Text>
                            )}
                        </View>
                    )}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.button} onPress={handleRetake}>
                            <Text style={styles.buttonText}>Retake</Text>
                        </TouchableOpacity>

                        {result?.recognitionResult?.faceDetected && (
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={handleConfirm}
                            >
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
    },
    resultContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 10,
    },
    capturedImage: {
        width: 280,
        height: 350,
        borderRadius: 10,
        marginBottom: 20,
    },
    resultBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 20,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultText: {
        fontSize: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        marginVertical: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 10,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FacialRecognitionScreen;

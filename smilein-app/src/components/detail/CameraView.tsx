// CODE 2 - FIXED VERSION
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, Dimensions, Platform, PermissionsAndroid } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor, CameraPosition, PhotoFile, useCameraPermission } from 'react-native-vision-camera';
import { Face, useFaceDetector, FaceDetectionOptions } from 'react-native-vision-camera-face-detector';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { decode as base64Decode } from 'base-64';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import { Worklets } from 'react-native-worklets-core';
import DeviceInfo from 'react-native-device-info';

// Extended type for TensorflowPlugin to include error
interface TensorflowPluginExtended {
  state: 'loading' | 'loaded' | 'error';
  model: any; // TensorflowModel type
  error?: Error;
}

type CameraViewProps = {
  onCapture: (result: {
    imagePath: string;
    status: 'checkin';
    smileDetected: boolean;
  }) => void;
  onCancel: () => void;
};

// Face Verification Error Dialog Props
type FaceVerificationErrorDialogProps = {
  visible: boolean;
  errorMessage: string;
  onRetry: () => void;
  onCancel: () => void;
};

// Device Performance Levels
enum DevicePerformanceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Performance-based configuration
interface PerformanceConfig {
  inputImageSize: number;
  detectionInterval: number;
  photoQuality: number;
  resizeQuality: number;
  frameProcessorFps: number;
  enableHdr: boolean;
  enableStabilization: boolean;
  performanceMode: 'fast' | 'balanced' | 'accurate';
}

// Configuration constants - MENGGUNAKAN NILAI DARI KODE 1
const INPUT_IMAGE_SIZE = 160; // Fixed value from code 1
const DETECTION_INTERVAL = 300; // Fixed value from code 1
const SMILE_THRESHOLD = 0.7;
const DEBUG_MODE = true;
const SMILE_HOLD_TIME = 2000; // 2 seconds of continuous smiling
const CONSECUTIVE_SMILES_REQUIRED = 3;

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Directory for saving captured images
const SAVE_DIR = `${RNFS.DocumentDirectoryPath}/captured_images`;

// Performance configurations for different device levels - DISESUAIKAN DENGAN KODE 1
const PERFORMANCE_CONFIGS: Record<DevicePerformanceLevel, PerformanceConfig> = {
  [DevicePerformanceLevel.LOW]: {
    inputImageSize: INPUT_IMAGE_SIZE, // Use fixed value
    detectionInterval: DETECTION_INTERVAL + 200, // Slightly slower for low-end
    photoQuality: 70,
    resizeQuality: 70,
    frameProcessorFps: 10,
    enableHdr: false,
    enableStabilization: false,
    performanceMode: 'fast'
  },
  [DevicePerformanceLevel.MEDIUM]: {
    inputImageSize: INPUT_IMAGE_SIZE, // Use fixed value
    detectionInterval: DETECTION_INTERVAL, // Use exact value from code 1
    photoQuality: 85,
    resizeQuality: 85,
    frameProcessorFps: 15,
    enableHdr: false,
    enableStabilization: true,
    performanceMode: 'balanced'
  },
  [DevicePerformanceLevel.HIGH]: {
    inputImageSize: INPUT_IMAGE_SIZE, // Use fixed value
    detectionInterval: DETECTION_INTERVAL - 100, // Slightly faster for high-end
    photoQuality: 95,
    resizeQuality: 95,
    frameProcessorFps: 30,
    enableHdr: true,
    enableStabilization: true,
    performanceMode: 'accurate'
  }
};

// Device performance detection utility
const detectDevicePerformance = async (): Promise<DevicePerformanceLevel> => {
  try {
    const totalMemory = await DeviceInfo.getTotalMemory();
    const totalMemoryGB = totalMemory / (1024 * 1024 * 1024);

    // Android performance detection
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      // High-end devices
      if (totalMemoryGB >= 6 && apiLevel >= 29) {
        return DevicePerformanceLevel.HIGH;
      }
      // Mid-range devices
      else if (totalMemoryGB >= 3 && apiLevel >= 26) {
        return DevicePerformanceLevel.MEDIUM;
      }
      // Low-end devices
      else {
        return DevicePerformanceLevel.LOW;
      }
    }
    // iOS performance detection
    else if (Platform.OS === 'ios') {
      const deviceId = DeviceInfo.getDeviceId();

      // iPhone 12 and newer
      if (deviceId.includes('iPhone13') || deviceId.includes('iPhone14') || deviceId.includes('iPhone15')) {
        return DevicePerformanceLevel.HIGH;
      }
      // iPhone 8 to iPhone 11
      else if (deviceId.includes('iPhone10') || deviceId.includes('iPhone11') || deviceId.includes('iPhone12')) {
        return DevicePerformanceLevel.MEDIUM;
      }
      // Older iPhones
      else {
        return DevicePerformanceLevel.LOW;
      }
    }

    // Default to medium if platform not recognized
    return DevicePerformanceLevel.MEDIUM;
  } catch (error) {
    console.error('Error detecting device performance:', error);
    // Default to medium for better compatibility
    return DevicePerformanceLevel.MEDIUM;
  }
};

// Camera format selector based on device performance
const selectOptimalCameraFormat = (device: any, performanceLevel: DevicePerformanceLevel) => {
  if (!device?.formats) return undefined;

  const formats = device.formats;
  let targetWidth, targetHeight;

  switch (performanceLevel) {
    case DevicePerformanceLevel.HIGH:
      targetWidth = 1920;
      targetHeight = 1080;
      break;
    case DevicePerformanceLevel.MEDIUM:
      targetWidth = 1280;
      targetHeight = 720;
      break;
    case DevicePerformanceLevel.LOW:
      targetWidth = 640;
      targetHeight = 480;
      break;
  }

  // Find the best matching format
  const optimalFormat = formats.reduce((best: any, format: any) => {
    if (!format.videoWidth || !format.videoHeight) return best;
    
    const currentDiff = Math.abs(format.videoWidth - targetWidth) + Math.abs(format.videoHeight - targetHeight);
    const bestDiff = best ? Math.abs(best.videoWidth - targetWidth) + Math.abs(best.videoHeight - targetHeight) : Infinity;

    if (currentDiff < bestDiff) {
      return format;
    }

    return best;
  }, null);

  return optimalFormat;
};

// Face Verification Error Dialog Component
const FaceVerificationErrorDialog: React.FC<FaceVerificationErrorDialogProps> = ({
  visible,
  errorMessage,
  onRetry,
  onCancel,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.errorModalOverlay}>
        <View style={styles.errorModalContainer}>
          <View style={styles.errorModalContent}>
            {/* Error Icon */}
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>

            {/* Error Title */}
            <Text style={styles.errorModalTitle}>Verifikasi Wajah Gagal</Text>

            {/* Error Message */}
            <Text style={styles.errorModalMessage}>{errorMessage}</Text>

            {/* Action Buttons */}
            <View style={styles.errorModalButtonContainer}>
              <TouchableOpacity
                style={[styles.errorModalButton, styles.errorModalCancelButton]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.errorModalCancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.errorModalButton, styles.errorModalRetryButton]}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <Text style={styles.errorModalRetryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const cameraRef = useRef<Camera>(null);
  const [processing, setProcessing] = useState(false);
  const device = useCameraDevice('front');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<string | null>(null);

  // Camera permissions
  const { hasPermission, requestPermission } = useCameraPermission();
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'checking'>('checking');

  // Performance optimization states
  const [devicePerformanceLevel, setDevicePerformanceLevel] = useState<DevicePerformanceLevel>(DevicePerformanceLevel.MEDIUM);
  const [performanceConfig, setPerformanceConfig] = useState<PerformanceConfig>(PERFORMANCE_CONFIGS[DevicePerformanceLevel.MEDIUM]);
  const [cameraFormat, setCameraFormat] = useState<any>(undefined);
  const [deviceInfo, setDeviceInfo] = useState<string>('');

  // Face detection state
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceData, setFaceData] = useState<Face | null>(null);
  const [isSmiling, setIsSmiling] = useState(false);
  const [smileConfidence, setSmileConfidence] = useState(0);
  const [capturedImagePath, setCapturedImagePath] = useState<string | null>(null);

  // Timer related states
  const [smileStartTime, setSmileStartTime] = useState<number | null>(null);
  const [smileDuration, setSmileDuration] = useState(0);
  const [smileProgress, setSmileProgress] = useState(0);
  const [consecutiveSmiles, setConsecutiveSmiles] = useState(0);
  const [inferenceTime, setInferenceTime] = useState(0);

  // Anti-flicker
  const [lastDetectionResult, setLastDetectionResult] = useState<boolean>(false);
  const [stabilityCounter, setStabilityCounter] = useState<number>(0);

  // Loading and Error States
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [showFaceVerificationError, setShowFaceVerificationError] = useState(false);
  const [faceVerificationErrorMessage, setFaceVerificationErrorMessage] = useState('');
  const [captureCompleted, setCaptureCompleted] = useState(false);

  // Set up TensorFlow model
  const modelState = useTensorflowModel(require('../../assets/smile_model.tflite')) as TensorflowPluginExtended;

  // Request camera permissions
  useEffect(() => {
    const requestCameraPermissions = async () => {
      try {
        console.log('Requesting camera permissions...');
        
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app needs access to camera for face detection',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android camera permission granted');
            setPermissionStatus('granted');
          } else {
            console.log('Android camera permission denied');
            setPermissionStatus('denied');
          }
        } else {
          // iOS
          if (hasPermission) {
            console.log('iOS camera permission already granted');
            setPermissionStatus('granted');
          } else {
            console.log('Requesting iOS camera permission...');
            const permission = await requestPermission();
            if (permission) {
              console.log('iOS camera permission granted');
              setPermissionStatus('granted');
            } else {
              console.log('iOS camera permission denied');
              setPermissionStatus('denied');
            }
          }
        }
      } catch (error) {
        console.error('Error requesting camera permissions:', error);
        setPermissionStatus('denied');
      }
    };

    requestCameraPermissions();
  }, [hasPermission, requestPermission]);

  // Initialize device performance detection
  useEffect(() => {
    const initializePerformance = async () => {
      try {
        const performanceLevel = await detectDevicePerformance();
        setDevicePerformanceLevel(performanceLevel);
        setPerformanceConfig(PERFORMANCE_CONFIGS[performanceLevel]);

        // Set device info for debugging
        const brand = DeviceInfo.getBrand();
        const model = DeviceInfo.getModel();
        const systemVersion = DeviceInfo.getSystemVersion();
        const totalMemory = await DeviceInfo.getTotalMemory();
        const totalMemoryGB = (totalMemory / (1024 * 1024 * 1024)).toFixed(2);

        const info = `${brand} ${model} (${systemVersion}) - RAM: ${totalMemoryGB}GB - Performance: ${performanceLevel}`;
        setDeviceInfo(info);
        console.log('Device Performance Level:', performanceLevel);
        console.log('Device Info:', info);
      } catch (error) {
        console.error('Error initializing performance:', error);
      }
    };

    initializePerformance();
  }, []);

  // Select optimal camera format when device is available
  useEffect(() => {
    if (device && permissionStatus === 'granted') {
      const format = selectOptimalCameraFormat(device, devicePerformanceLevel);
      setCameraFormat(format);
      console.log('Selected camera format:', format);
    }
  }, [device, devicePerformanceLevel, permissionStatus]);

  // Debug model loading - SAMA SEPERTI KODE 1
  useEffect(() => {
    console.log('Model state:', modelState.state);
    if (modelState.state === 'loaded') {
      try {
        // Check if model exists
        if (!modelState.model) {
          console.error('Model is loaded but model object is undefined');
          setModelError('Model loaded but model object is undefined');
          return;
        }

        // Get input information from inputs property
        if (modelState.model.inputs && modelState.model.inputs.length > 0) {
          const inputInfo = modelState.model.inputs[0];
          const modelDetails = `Model input: ${inputInfo.name}, Shape: ${JSON.stringify(inputInfo.shape)}, Type: ${inputInfo.dataType}`;
          console.log(modelDetails);
          setModelInfo(modelDetails);
          setModelReady(true);
          return;
        }

        // Fallback to getInputShape if available
        if (typeof modelState.model.getInputShape === 'function') {
          const inputShape = modelState.model.getInputShape(0);
          const outputShape = modelState.model.getOutputShape(0);
          const modelDetails = `Model inputs: ${JSON.stringify(inputShape)}\nOutputs: ${JSON.stringify(outputShape)}`;
          console.log(modelDetails);
          setModelInfo(modelDetails);
          setModelReady(true);
          return;
        }

        // Last resort fallback
        console.warn('Could not determine model input shape through standard methods');
        setModelInfo('Model loaded but shape information unavailable');
        setModelReady(true);
      } catch (err: unknown) {
        console.error('Error getting model info:', err);
        setModelError(`Model loaded but info error: ${err instanceof Error ? err.message : String(err)}`);
        // Still set model as ready to allow execution
        setModelReady(true);
      }
    } else if (modelState.state === 'error') {
      console.error('Model loading error:', modelState.error);
      setModelError(modelState.error?.message || 'Unknown error');
      Alert.alert('Model Error', `Failed to load smile detection model: ${modelState.error?.message}`);
    }
  }, [modelState]);

  // Create save directory on component mount
  useEffect(() => {
    const createSaveDir = async () => {
      try {
        const dirExists = await RNFS.exists(SAVE_DIR);
        if (!dirExists) {
          await RNFS.mkdir(SAVE_DIR);
          console.log(`Created directory: ${SAVE_DIR}`);
        }
      } catch (error) {
        console.error('Error creating save directory:', error);
      }
    };

    createSaveDir();
  }, []);

  // Setup global error handler
  useEffect(() => {
    // Setup global error handler for face verification
    (global as any).showCameraFaceVerificationError = (errorMessage: string) => {
      console.log('🚨 Face Verification Error:', errorMessage);
      // Don't immediately deactivate camera, let user see the error first
      setAwaitingVerification(false);
      setCaptureCompleted(false);
      setFaceVerificationErrorMessage(errorMessage);
      setShowFaceVerificationError(true);
      // Camera will be reactivated when user chooses retry
    };

    return () => {
      delete (global as any).showCameraFaceVerificationError;
    };
  }, []);

  // Configure face detector - MENGGUNAKAN PERFORMANCE MODE DARI CONFIG
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: performanceConfig.performanceMode,
    classificationMode: 'all',
  }).current;

  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  // Reset smile detection - SAMA SEPERTI KODE 1
  const resetSmileDetection = useCallback(() => {
    setConsecutiveSmiles(0);
    setIsSmiling(false);
    setSmileStartTime(null);
    setSmileDuration(0);
    setSmileProgress(0);
    setLastDetectionResult(false);
    setStabilityCounter(0);
  }, []);

  // Reset all states including new loading states
  const resetAllStates = useCallback(() => {
    resetSmileDetection();
    setAwaitingVerification(false);
    setCaptureCompleted(false);
    setShowFaceVerificationError(false);
    setFaceVerificationErrorMessage('');
    setCapturedImagePath(null);
    setIsCameraActive(true);
  }, [resetSmileDetection]);

  // Handle detected faces - SAMA SEPERTI KODE 1
  const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[]) => {
    // Don't process faces if error dialog is showing
    if (showFaceVerificationError || awaitingVerification) {
      return;
    }

    if (faces.length > 0) {
      if (!faceDetected) {
        console.log('Face detected:', faces[0]);
      }
      setFaceDetected(true);
      setFaceData(faces[0]);

      // Reset counter if face detected but no smile probability
      if (faces[0].smilingProbability && faces[0].smilingProbability < 0.2) {
        resetSmileDetection();
      }
    } else {
      if (faceDetected) {
        console.log('Face lost');
      }
      setFaceDetected(false);
      setFaceData(null);
      resetSmileDetection();
    }
  });

  // Frame processor for face detection with error handling
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    try {
      const faces = detectFaces(frame);
      handleDetectedFaces(faces);
    } catch (error) {
      console.error('Frame processor error:', error);
    }
  }, [handleDetectedFaces, detectFaces]);

  // Capture image - MODIFIKASI MINOR UNTUK PERFORMANCE
  const captureImage = useCallback(async () => {
    if (!cameraRef.current || awaitingVerification || captureCompleted || showFaceVerificationError) {
      return null;
    }

    try {
      console.log('Taking final high-quality photo...');

      // Take photo FIRST while camera is still active
      const finalPhoto = await cameraRef.current.takePhoto({
        flash: 'off',
        qualityPrioritization: devicePerformanceLevel === DevicePerformanceLevel.HIGH ? 'quality' : 'speed',
        enableAutoStabilization: performanceConfig.enableStabilization,
      });

      console.log('Photo captured successfully:', finalPhoto.path);

      // THEN set loading states after successful photo capture
      setCaptureCompleted(true);
      setAwaitingVerification(true);
      setIsCameraActive(false); // Hide camera AFTER successful capture

      const timestamp = Date.now();
      const savedImagePath = `${SAVE_DIR}/smile_${timestamp}.jpg`;

      await RNFS.copyFile(finalPhoto.path, savedImagePath);
      console.log(`Smile captured and saved to: ${savedImagePath}`);

      // Clean up original photo
      try {
        await RNFS.unlink(finalPhoto.path);
      } catch (cleanupError) {
        console.warn('Could not clean up original photo:', cleanupError);
      }

      setCapturedImagePath(savedImagePath);

      // Call onCapture - this will trigger API verification
      onCapture({
        imagePath: savedImagePath,
        status: 'checkin',
        smileDetected: true,
      });

      return savedImagePath;
    } catch (error) {
      console.error('Error capturing final image:', error);
      // Reset loading states on error
      setAwaitingVerification(false);
      setCaptureCompleted(false);
      setIsCameraActive(true);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
      return null;
    }
  }, [onCapture, awaitingVerification, captureCompleted, showFaceVerificationError, devicePerformanceLevel, performanceConfig.enableStabilization]);

  // Process image for smile detection - MENGGUNAKAN INPUT_IMAGE_SIZE FIXED
  const processImageForSmile = useCallback(async (imagePath: string): Promise<{ isSmiling: boolean, confidence: number } | null> => {
    try {
      // First, check if model is ready
      if (!modelState || modelState.state !== 'loaded' || !modelState.model) {
        console.warn('Model not loaded or unavailable, cannot process image');
        return null;
      }

      console.log('Processing image for smile detection:', imagePath);
      const correctPath = imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`;

      // Resize image to match model's input size - MENGGUNAKAN INPUT_IMAGE_SIZE FIXED
      const resizedImage = await ImageResizer.createResizedImage(
        correctPath,
        INPUT_IMAGE_SIZE, // Use fixed value from code 1
        INPUT_IMAGE_SIZE, // Use fixed value from code 1
        'JPEG',
        90, // Use fixed quality similar to code 1
        0  // NO ROTATION - keeping code 1 behavior
      );
      console.log('Image resized to:', resizedImage.path);

      // Read raw image data as bytes first
      const imageFile = await RNFS.readFile(resizedImage.path, 'base64');
      console.log('Image read as base64, length:', imageFile.length);

      // DEBUG: Save a copy of the processed image in debug mode
      if (DEBUG_MODE) {
        const debugPath = `${SAVE_DIR}/debug_${Date.now()}.jpg`;
        await RNFS.copyFile(resizedImage.path, debugPath);
        console.log(`Debug copy saved at: ${debugPath}`);
      }

      // Convert base64 to binary
      const binaryString = base64Decode(imageFile);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Use hardcoded values if getInputShape is not available - MENGGUNAKAN INPUT_IMAGE_SIZE FIXED
      let inputShape;
      try {
        if (typeof modelState.model.getInputShape === 'function') {
          inputShape = modelState.model.getInputShape(0);
          console.log('Model input shape from method:', inputShape);
        } else {
          // Default to expected values if method not available - MENGGUNAKAN INPUT_IMAGE_SIZE FIXED
          inputShape = [1, INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE, 3];
          console.log('Using default input shape:', inputShape);
        }
      } catch (error) {
        console.warn('Error getting input shape, using defaults:', error);
        inputShape = [1, INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE, 3];
      }

      // Extract dimensions
      const batchSize = inputShape[0] || 1;
      const height = inputShape[1] || INPUT_IMAGE_SIZE;
      const width = inputShape[2] || INPUT_IMAGE_SIZE;
      const channels = inputShape[3] || 3;

      const tensorSize = batchSize * height * width * channels;
      console.log(`Creating tensor of size: ${tensorSize} (${batchSize}x${height}x${width}x${channels})`);

      // Pre-allocate memory for the input tensor
      const inputData = new Float32Array(tensorSize);

      // Ensure tensor is properly initialized
      for (let i = 0; i < tensorSize; i++) {
        inputData[i] = 0.0;
      }

      // Normalization and preprocessing - SAMA SEPERTI KODE 1
      let pixelIndex = 0;
      const bytesPerPixel = 3; // RGB
      const totalPixels = width * height;

      // Only process as many pixels as the model needs
      const pixelsToProcess = Math.min(len / bytesPerPixel, totalPixels);

      for (let i = 0; i < pixelsToProcess; i++) {
        const offset = i * bytesPerPixel;

        if (offset + 2 < len) {
          // Index for tensor output (NHWC format)
          const outputIdx = i * channels;

          // Normalize to range -1 to 1
          inputData[outputIdx] = (bytes[offset] / 127.5) - 1.0;         // R
          inputData[outputIdx + 1] = (bytes[offset + 1] / 127.5) - 1.0; // G
          inputData[outputIdx + 2] = (bytes[offset + 2] / 127.5) - 1.0; // B
        }
      }

      // Log for checking normalization
      console.log(`Normalized first few pixels:
        [0]: ${inputData[0].toFixed(3)}, ${inputData[1].toFixed(3)}, ${inputData[2].toFixed(3)}
        [1]: ${inputData[3].toFixed(3)}, ${inputData[4].toFixed(3)}, ${inputData[5].toFixed(3)}`);

      // Check input value range
      let min = 1, max = -1;
      for (let i = 0; i < Math.min(tensorSize, 1000); i++) {
        min = Math.min(min, inputData[i]);
        max = Math.max(max, inputData[i]);
      }
      console.log(`Input range check (first 1000): min=${min.toFixed(3)}, max=${max.toFixed(3)}`);

      // Ensure model is still valid before running inference
      if (!modelState.model) {
        throw new Error('Model became unavailable');
      }

      // Reshape if needed based on model's expected input
      let finalInput;
      if (batchSize === 1) {
        // Add batch dimension if needed
        finalInput = [inputData];
      } else {
        finalInput = inputData; // Use as is if model expects a different shape
      }

      // Run inference with error handling and timing - SAMA SEPERTI KODE 1
      console.log('Running model inference...');
      const inferenceStart = performance.now();
      let outputTensor;

      try {
        // Try runSync first, fall back to run if needed
        if (typeof modelState.model.runSync === 'function') {
          outputTensor = modelState.model.runSync(finalInput);
        } else if (typeof modelState.model.run === 'function') {
          outputTensor = await modelState.model.run(finalInput);
        } else {
          throw new Error('No valid inference method found on model');
        }
      } catch (error) {
        console.error('Model inference error:', error);
        throw new Error(`Model inference failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      const inferenceEnd = performance.now();
      const timeMs = inferenceEnd - inferenceStart;
      setInferenceTime(timeMs);
      console.log(`Inference completed in: ${timeMs.toFixed(2)}ms`);

      if (!outputTensor || !outputTensor[0]) {
        throw new Error('Model did not return valid output');
      }

      const outputData = outputTensor[0];
      console.log('Raw output tensor:', outputData);

      // Process output - SAMA SEPERTI KODE 1
      let smileConfidence: number;

      if (outputData.length === 1) {
        // Single value output (sigmoid output)
        smileConfidence = outputData[0];
        console.log('Single output sigmoid:', smileConfidence);
      } else if (outputData.length === 2) {
        // Binary classification [not_smiling, smiling]
        console.log(`Binary outputs: [${outputData[0].toFixed(4)}, ${outputData[1].toFixed(4)}]`);
        smileConfidence = outputData[1];
      } else {
        // Multiple classes - find highest
        console.log(`Multiple outputs (${outputData.length}): ${Array.from(outputData).map((v: unknown) => (typeof v === 'number' ? v.toFixed(4) : '?')).join(', ')}`);

        let maxValue = outputData[0];
        let maxIndex = 0;

        for (let i = 1; i < outputData.length; i++) {
          if (outputData[i] > maxValue) {
            maxValue = outputData[i];
            maxIndex = i;
          }
        }

        console.log(`Max confidence at index ${maxIndex}: ${maxValue.toFixed(4)}`);
        // If highest result is not in the smile class, give a low value
        if (maxIndex !== 1) { // Assume index 1 is "smiling"
          maxValue = 0.1; // Low value for non-smile
        }
        smileConfidence = maxValue;
      }

      // Anti-flicker post-processing - SAMA SEPERTI KODE 1
      const currentDetection = smileConfidence >= SMILE_THRESHOLD;

      // Calculate difference from threshold
      const confidenceDelta = Math.abs(smileConfidence - SMILE_THRESHOLD);

      // If close to threshold, use previous result for stability
      let finalIsSmiling;
      if (confidenceDelta < 0.1) {
        // Value close to threshold, maintain previous result
        finalIsSmiling = lastDetectionResult;
        console.log(`Value close to threshold (${smileConfidence.toFixed(3)}), maintaining previous result: ${lastDetectionResult}`);
      } else {
        finalIsSmiling = currentDetection;
        setLastDetectionResult(currentDetection);
      }

      console.log(`Smile detection result: confidence=${smileConfidence.toFixed(4)}, threshold=${SMILE_THRESHOLD}, isSmiling=${finalIsSmiling}`);

      return {
        isSmiling: finalIsSmiling,
        confidence: smileConfidence,
      };
    } catch (error) {
      console.error('Error processing image for smile detection:', error);
      return null;
    }
  }, [modelState, lastDetectionResult]);

  // Detect smile - MENGGUNAKAN LOGIKA DARI KODE 1 DENGAN BEBERAPA OPTIMASI
  const detectSmile = useCallback(async () => {
    // Only proceed if we have all necessary conditions met
    if (!cameraRef.current || processing || !faceDetected || !modelReady || awaitingVerification || captureCompleted || showFaceVerificationError) {
      console.log(
        'Skipping smile detection:',
        !cameraRef.current ? 'No camera ref' :
          processing ? 'Already processing' :
            !faceDetected ? 'No face detected' :
              !modelReady ? 'Model not ready' :
                awaitingVerification ? 'Awaiting verification' :
                  captureCompleted ? 'Capture completed' :
                    showFaceVerificationError ? 'Error dialog showing' : 'Unknown reason'
      );
      return;
    }

    try {
      setProcessing(true);
      const startTime = performance.now();

      console.log('Checking for smile...');

      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        quality: 90, // Use fixed quality similar to code 1
      });
      console.log('Photo taken for analysis:', photo.path);

      // Check if face is still in frame before processing
      if (!faceDetected) {
        console.log('Face lost during photo capture, skipping smile detection');
        return;
      }

      const smileResult = await processImageForSmile(photo.path);

      const processingTime = performance.now() - startTime;
      console.log(`Smile processing completed in ${processingTime.toFixed(2)}ms`);

      // Clean up the temporary photo
      try {
        await RNFS.unlink(photo.path);
      } catch (e) {
        console.warn('Could not remove temporary photo:', e);
      }

      if (smileResult) {
        setSmileConfidence(smileResult.confidence);

        const currentTime = Date.now();

        if (smileResult.isSmiling) {
          const newConsecutiveSmiles = consecutiveSmiles + 1;
          setConsecutiveSmiles(newConsecutiveSmiles);

          console.log(`Detected smile: ${smileResult.confidence.toFixed(2)} - consecutive frames: ${newConsecutiveSmiles}`);

          if (newConsecutiveSmiles >= CONSECUTIVE_SMILES_REQUIRED) {
            if (!isSmiling) {
              setIsSmiling(true);
              setSmileStartTime(currentTime);
              console.log('Confirmed smile started at:', currentTime);
            } else if (smileStartTime) {
              const currentDuration = currentTime - smileStartTime;
              setSmileDuration(currentDuration);
              setSmileProgress(Math.min(100, (currentDuration / SMILE_HOLD_TIME) * 100));

              if (currentDuration >= SMILE_HOLD_TIME) {
                console.log(`SMILE MAINTAINED FOR ${SMILE_HOLD_TIME / 1000} SECONDS! Capturing now...`);
                await captureImage();
              }
            }
          }
        } else {
          // Don't immediately reset smile detection, use stability counter
          setStabilityCounter(prev => {
            const newCount = prev + 1;
            // Only reset after several consecutive non-smile frames
            if (newCount >= 3) {
              console.log('Multiple non-smile frames detected - resetting smile detection');
              setConsecutiveSmiles(0);

              if (isSmiling) {
                console.log('Smile broken - resetting timer');
                setIsSmiling(false);
                setSmileStartTime(null);
                setSmileDuration(0);
                setSmileProgress(0);
              }
              return 0;
            }
            return newCount;
          });
        }
      }
    } catch (error) {
      console.error('Smile detection error:', error);
    } finally {
      setProcessing(false);
    }
  }, [
    captureImage,
    consecutiveSmiles,
    faceDetected,
    isSmiling,
    modelReady,
    processing,
    smileStartTime,
    processImageForSmile,
    stabilityCounter,
    awaitingVerification,
    captureCompleted,
    showFaceVerificationError,
  ]);

  // Run smile detection on interval - MENGGUNAKAN INTERVAL DARI PERFORMANCE CONFIG
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (faceDetected && !processing && modelReady && !awaitingVerification && !captureCompleted && !showFaceVerificationError) {
      console.log('Starting smile detection interval with interval:', performanceConfig.detectionInterval);
      intervalId = setInterval(detectSmile, performanceConfig.detectionInterval);
    } else if ((!faceDetected || awaitingVerification || captureCompleted || showFaceVerificationError) && intervalId) {
      console.log('Stopping smile detection interval');
      clearInterval(intervalId);
      intervalId = null;
      resetSmileDetection();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [faceDetected, processing, modelReady, detectSmile, resetSmileDetection, awaitingVerification, captureCompleted, showFaceVerificationError, performanceConfig.detectionInterval]);

  // Handle face verification retry
  const handleFaceVerificationRetry = useCallback(() => {
    console.log('🔄 User chose to retry face verification...');
    setShowFaceVerificationError(false);
    setFaceVerificationErrorMessage('');
    resetAllStates();
    setIsCameraActive(true);
  }, [resetAllStates]);

  // Handle face verification cancel
  const handleFaceVerificationCancel = useCallback(() => {
    console.log('❌ User chose to cancel from face verification error...');
    setShowFaceVerificationError(false);
    setFaceVerificationErrorMessage('');
    resetAllStates();
    onCancel();
  }, [onCancel, resetAllStates]);

  // Handle errors
  if (modelError) {
    return (
      <View style={styles.centered}>
        <Text>Model Error: {modelError}</Text>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text>No camera device found</Text>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <View style={styles.centered}>
        <Text>Camera permission denied</Text>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (permissionStatus === 'checking') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text>Checking camera permissions...</Text>
      </View>
    );
  }

  // Loading state
  if (awaitingVerification) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" style={styles.loadingSpinner} />
          <Text style={styles.loadingTitle}>Memverifikasi Wajah Anda</Text>
          <Text style={styles.loadingSubtitle}>Mohon tunggu sebentar...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isCameraActive && !showFaceVerificationError && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          frameProcessor={frameProcessor}
          format={cameraFormat}
          fps={performanceConfig.frameProcessorFps}
          enableHighQualityPhotos={devicePerformanceLevel === DevicePerformanceLevel.HIGH}
          enableDepthData={false}
          enablePortraitEffectsMatteDelivery={false}
          photoHdr={performanceConfig.enableHdr}
        />
      )}

      <View style={styles.overlay}>
        {/* Model loading status */}
        {!modelReady && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>Loading smile detection model...</Text>
          </View>
        )}

        {/* Device info in debug mode */}
        {DEBUG_MODE && deviceInfo && (
          <View style={styles.debugBanner}>
            <Text style={styles.debugText}>{deviceInfo}</Text>
            <Text style={styles.debugText}>
              Config: {INPUT_IMAGE_SIZE}px | {performanceConfig.detectionInterval}ms | Q{performanceConfig.photoQuality}
            </Text>
          </View>
        )}

        {/* Face detection status */}
        {modelReady && !awaitingVerification && !captureCompleted && !showFaceVerificationError && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>
              {!faceDetected
                ? 'Position your face in the frame'
                : isSmiling
                  ? `Keep smiling for ${((SMILE_HOLD_TIME - smileDuration) / 1000).toFixed(1)}s more...`
                  : 'Face detected! Please smile'}
            </Text>
            {faceDetected && (
              <Text style={styles.confidenceText}>
                Confidence: {(smileConfidence * 100).toFixed(1)}%
                {consecutiveSmiles > 0 && ` | Frames: ${consecutiveSmiles}/${CONSECUTIVE_SMILES_REQUIRED}`}
                {inferenceTime > 0 && ` | ${inferenceTime.toFixed(0)}ms`}
              </Text>
            )}

            {/* Smile progress indicator */}
            {isSmiling && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${smileProgress}%` }]} />
              </View>
            )}
          </View>
        )}

      </View>

      {/* Only Cancel button - hidden during loading and error states */}
      {!awaitingVerification && !showFaceVerificationError && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton} disabled={processing}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Face guide overlay - hidden during loading and error states */}
      {!awaitingVerification && !showFaceVerificationError && (
        <View style={styles.faceGuideContainer}>
          <View style={[
            styles.faceGuide,
            faceDetected ? styles.faceGuideDetected : {},
            isSmiling ? styles.faceGuideSmiling : {},
          ]} />
        </View>
      )}

      {/* Face Verification Error Dialog */}
      <FaceVerificationErrorDialog
        visible={showFaceVerificationError}
        errorMessage={faceVerificationErrorMessage}
        onRetry={handleFaceVerificationRetry}
        onCancel={handleFaceVerificationCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    padding: 16,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    width: 150,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusBanner: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    marginTop: 40,
    borderRadius: 4,
    width: '90%',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '500',
  },
  confidenceText: {
    color: '#66ff66',
    fontWeight: '500',
    marginTop: 4,
    fontSize: 12,
  },
  debugBanner: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    marginTop: 10,
    borderRadius: 4,
    width: '90%',
  },
  debugText: {
    color: '#ffcc00',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  progressContainer: {
    marginTop: 8,
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#66ff66',
  },
  capturedImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  faceGuideContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  faceGuide: {
    width: 220,
    height: 280,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 140,
    borderStyle: 'dashed',
  },
  faceGuideDetected: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderStyle: 'solid',
  },
  faceGuideSmiling: {
    borderColor: 'rgba(102, 255, 102, 0.8)',
    borderWidth: 3,
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingSpinner: {
    marginBottom: 20,
    transform: [{ scale: 1.5 }],
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingSubtitle: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  // Face Verification Error Dialog Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorModalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  errorModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ffebee',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorModalMessage: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  errorModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  errorModalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  errorModalCancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorModalRetryButton: {
    backgroundColor: '#1976d2',
    shadowColor: '#1976d2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  errorModalCancelButtonText: {
    color: '#616161',
    fontSize: 16,
    fontWeight: '600',
  },
  errorModalRetryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraView;
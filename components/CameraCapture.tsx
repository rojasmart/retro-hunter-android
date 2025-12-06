import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import styles from "./CameraCapture.styles";

interface CameraCaptureProps {
  onImageCaptured: (imageUri: string) => void;
  isProcessing: boolean;
}

export default function CameraCapture({ onImageCaptured, isProcessing }: CameraCaptureProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>📸 We need camera permission to scan games</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>GRANT PERMISSION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setShowCamera(false);
        onImageCaptured(photo.uri);
      } catch (error) {
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageCaptured(result.assets[0].uri);
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraInstructions}>Point camera at game cover or cartridge</Text>
            <View style={styles.cameraButtonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
                <Text style={styles.buttonText}>✕</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture} disabled={isProcessing}>
                <View style={styles.captureButtonInner}>
                  <Text style={styles.captureButtonText}>{isProcessing ? "🔍" : "📷"}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                <Text style={styles.buttonText}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.actionButton, styles.cameraButton]} onPress={() => setShowCamera(true)} disabled={isProcessing}>
        <Text style={styles.actionButtonText}>{isProcessing ? "SCANNING..." : "SCAN GAME COVER"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, styles.galleryButton]} onPress={pickImage} disabled={isProcessing}>
        <Text style={styles.actionButtonText}>UPLOAD IMAGE</Text>
      </TouchableOpacity>
    </View>
  );
}

import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

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

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  permissionContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#06b6d4",
    marginVertical: 16,
  },
  permissionText: {
    color: "#67e8f9",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "monospace",
  },
  cameraContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  cameraInstructions: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    borderRadius: 12,
    fontFamily: "monospace",
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "rgba(239,68,68,0.9)",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  captureButton: {
    backgroundColor: "rgba(6,182,212,0.9)",
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#06b6d4",
  },
  captureButtonInner: {
    backgroundColor: "rgba(6,182,212,1)",
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonText: {
    fontSize: 24,
    color: "white",
  },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6b7280",
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: "center",
    borderWidth: 2,
  },
  cameraButton: {
    backgroundColor: "#06b6d4",
    borderColor: "rgba(6,182,212,0.5)",
  },
  galleryButton: {
    backgroundColor: "#8b5cf6",
    borderColor: "rgba(139,92,246,0.5)",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.5)",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
});

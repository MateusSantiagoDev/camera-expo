import { useEffect, useState } from "react";
import { View } from "react-native";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import * as FaceDetector from "expo-face-detector";
import { styles } from "./styles";

import grinning from "../assets/grinning.png";
import neutral from "../assets/neutral.png";
import winking from "../assets/winking.png";

export function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [type, setType] = useState(CameraType.front);
  const [faceDetected, setFaceDetected] = useState(false);
  const [emoji, setEmoji] = useState(neutral);

  // vou atualizar esses valores com as informações da face
  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  function handleFacesDetected({ faces }: FaceDetectionResult) {
    // validando se esta detectando uma face
    /* console.log(faces) */
    const face = faces[0] as any;
    if (face) {
      // size = dimenções da face / origin = posição da face na camera
      const { size, origin } = face.bounds;

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      };

      if(face.smilingProbability > 0.5) {
        setEmoji(grinning);
      } else if (face.leftEyOpenProbability < 0.5 && face.rightEyOpenProbability > 0.5) {
        setEmoji(winking);
      }
      
      else {
        setEmoji(neutral);
      }

      setFaceDetected(true);
    } else {
      setFaceDetected(false);
    }
  }

  // usando o useAnimatedStyle para criar uma estilização animada
  // coms os valores recebidos da face do usuário
  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y },
    ],
  }));

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) {
    return;
  }

  // usando o Animated para renderizar uma Tag animada
  return (
    <View style={styles.container}>
      {faceDetected && <Animated.Image
      source={emoji}
      style={animatedStyle} />}
      <Camera
        style={styles.camera}
        type={type}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}

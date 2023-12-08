import {
  FaceDetector,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8";
import drawFaceIndicator from "./drawMarkerUtil";

let instance;

class FaceDetection {
  constructor() {
    if (instance) {
      throw new Error("You  can only create one instance!");
    }
    this.detector = null;
    this.detectorInterval = null;
    instance = this;
  }

  getInstance() {
    return this;
  }

  setDetector(detector) {
    this.detector = detector;
  }

  /**
   * load model and create detector
   *
   * @param onDetectorLoaded callback when detector loaded
   */
  async createDetector(onDetectorLoaded = () => {}) {
    try {
      onDetectorLoaded(false);
      // console.log('detector loading')
      // check current detector
      if (this.detector !== null) {
        // console.log('detector exist')
        onDetectorLoaded(true);
        return this.detector;
      }
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
      );
      const faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
          modelAssetPath: `${process.env.PUBLIC_URL}/models/blaze_face_short.tflite`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        minDetectionConfidence: 0.5,
      });

      this.setDetector(faceDetector);
      // console.log('detector loaded')
      onDetectorLoaded(true);
      return this.detector;
    } catch (error) {
      const err = `Error @createDetector: ${error}`;
      throw new Error(err);
    }
  }

  /**
   * start face detector
   *
   * @param video input video
   * @param canvas canvas component for draw detection
   * @param onDetectorLoaded callback when detector loaded
   * @param onFaceDetected callback when face detected
   * @param onMultiFaceDetected callback when face detected > 1
   * @param onStarted callback when detector started
   */
  async startFaceDetector(
    video,
    canvas,
    {
      onStarted = () => {},
      onDetectorLoaded,
      onFaceDetected,
      onMultiFaceDetected,
    }
  ) {
    try {
      if (this.detector == null) {
        await this.createDetector((loaded) => onDetectorLoaded(loaded));
      }
      // console.log('detector started')
      if (this.detectorInterval === null) {
        this.detectorInterval = setInterval(() => {
          this.detectVideo(video, canvas, onFaceDetected, onMultiFaceDetected);
        }, 100);
      }
      onStarted();
    } catch (error) {
      const err = `Error @startFaceDetector: ${error}`;
      throw new Error(err);
    }
  }

  /**
   * detect face predictions
   *
   * @param video input source detection (video)
   * @param canvas canvas component for draw detection
   * @param onFaceDetected callback when face detected
   * @param onMultiFaceDetected callback when face detected > 1
   */
  async detectVideo(video, canvas, onFaceDetected, onMultiFaceDetected) {
    try {
      const ctx = canvas.getContext("2d");
      const startTimeMs = performance.now();
      const faces = this.detector.detectForVideo(video, startTimeMs).detections;

      onFaceDetected(faces.length !== 0);

      onMultiFaceDetected(faces.length > 1);

      requestAnimationFrame(() =>
        drawFaceMarker(faces, video, ctx, { withScore: true })
      );
    } catch (error) {
      const err = `Error @detectVideo: ${error}`;
      throw new Error(err);
    }
  }

  /**
   * detect face predictions
   *
   * @param image input source detection (image)
   * @param canvas canvas component for draw detection
   * @param onDetectorLoaded callback when detector loaded
   */
  async detectImage(image, canvas, { onDetectorLoaded = () => {} } = {}) {
    try {
      if (this.detector == null) {
        await this.createDetector(onDetectorLoaded);
      }
      const ctx = canvas.getContext("2d");
      const startTimeMs = performance.now();
      const faces = this.detector.detectForVideo(image, startTimeMs).detections;

      drawFaceMarker(faces, image, ctx, {
        withScore: true,
        withClear: false,
      });
    } catch (error) {
      const err = `Error @detectImage: ${error}`;
      throw new Error(err);
    }
  }

  /**
   * stop face detector
   *
   * @param onStop callback when detector stopped
   */
  stopFaceDetector(onStop = () => {}) {
    try {
      clearInterval(this.detectorInterval);
      this.detectorInterval = null;
      onStop();
    } catch (error) {
      const err = `Error @stopFaceDetector: ${error}`;
      throw new Error(err);
    }
  }
}

const faceDetection = new FaceDetection();

export default faceDetection;

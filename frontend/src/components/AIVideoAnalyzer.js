import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import './AIVideoAnalyzer.css';

// Keypoint connections for drawing the skeleton
const POSE_CONNECTIONS = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['right_shoulder', 'right_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['right_hip', 'right_knee'],
  ['left_knee', 'left_ankle'],
  ['right_knee', 'right_ankle']
];

export default function AIVideoAnalyzer({ videoFile, onAnalysisComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [detector, setDetector] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [status, setStatus] = useState('Model Loading...');
  
  // Jump calculation state
  const bestJumpRef = useRef({
    baseHipY: null,
    minHipY: null,
    pixelToCmRatio: null, // pixels per cm
    maxJumpCm: 0
  });

  const animationIdRef = useRef(null);

  useEffect(() => {
    // Load MoveNet model
    const loadModel = async () => {
      try {
        await tf.ready();
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        const movenet = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        setDetector(movenet);
        setStatus('Ready to Analyze');
      } catch (err) {
        console.error("Failed to load TensorFlow model", err);
        setStatus('Failed to load AI model');
      }
    };
    loadModel();

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (videoFile && videoRef.current) {
      const url = URL.createObjectURL(videoFile);
      videoRef.current.src = url;
      // Reset state for new video
      bestJumpRef.current = { baseHipY: null, minHipY: null, pixelToCmRatio: null, maxJumpCm: 0 };
      setProgress(0);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  const startAnalysis = async () => {
    if (!videoRef.current || !detector) return;
    
    setIsAnalyzing(true);
    setStatus('Analyzing Movement...');
    bestJumpRef.current = { baseHipY: null, minHipY: null, pixelToCmRatio: null, maxJumpCm: 0 };
    
    const video = videoRef.current;
    video.play();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const processFrame = async () => {
      // Setup canvas bounds
      if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      
      // Draw actual video frame first
      if (canvas.width > 0 && canvas.height > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      try {
        const poses = await detector.estimatePoses(video);
        if (poses.length > 0) {
          drawSkeleton(poses[0].keypoints, ctx);
          analyzeJump(poses[0].keypoints);
        }
      } catch (e) {
        console.error(e);
      }

      // Progress bar logic
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }

      if (!video.paused && !video.ended) {
        animationIdRef.current = requestAnimationFrame(processFrame);
      } else if (video.ended) {
        finalizeAnalysis();
      }
    };
    
    processFrame();
  };

  const drawSkeleton = (keypoints, ctx) => {
    // Draw joints
    keypoints.forEach(kp => {
      if (kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#5DCAA5';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }
    });

    // Draw bones
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(93, 202, 165, 0.7)';
    POSE_CONNECTIONS.forEach(([j1, j2]) => {
      const p1 = keypoints.find(k => k.name === j1);
      const p2 = keypoints.find(k => k.name === j2);
      
      if (p1 && p2 && p1.score > 0.3 && p2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
  };

  const analyzeJump = (keypoints) => {
    // Heuristic analysis: Calculate pixel/cm scale based on athlete standing height
    // Then track hip displacement for vertical jump height.
    const kpMap = {};
    keypoints.forEach(k => kpMap[k.name] = k);

    const lHip = kpMap['left_hip'];
    const rHip = kpMap['right_hip'];
    const lAnkle = kpMap['left_ankle'];
    const lEye = kpMap['left_eye'];

    if (!lHip || !rHip || lHip.score < 0.3 || rHip.score < 0.3) return;

    const avgHipY = (lHip.y + rHip.y) / 2;

    const state = bestJumpRef.current;

    // Establish scale on first good frame assuming athlete is standing (Eye to Ankle ~= 1.6m / 160cm)
    if (!state.pixelToCmRatio && lAnkle && lEye && lAnkle.score > 0.5 && lEye.score > 0.5) {
      const pixelHeight = Math.abs(lAnkle.y - lEye.y);
      if (pixelHeight > 100) { // arbitrary threshold to ensure it's a full body view
        state.pixelToCmRatio = pixelHeight / 160.0;
        state.baseHipY = avgHipY;
      }
    }

    // Continuously update baseHipY if they go lower (e.g. squatting down before jump)
    if (state.baseHipY === null || avgHipY > state.baseHipY) {
      // Y goes down in canvas, so larger Y is lower physically.
      // E.g., standing hip = 400. Squat hip = 500. So we update the standing/squatting baseline.
      if (state.baseHipY !== null && avgHipY > state.baseHipY) {
         // Do not constantly increase baseline if they just stand. 
         // Actually, max jump is max displacement from the highest standing hip Y or lowest squat?
         // Jump height is measured from flat standing position.
         // Let's just capture the very first standing Y as baseline.
      } else {
        state.baseHipY = avgHipY;
      }
    }

    // Minimum Y corresponds to the highest point in the air
    if (state.minHipY === null || avgHipY < state.minHipY) {
      state.minHipY = avgHipY;
    }

    // Calculate delta on the fly
    if (state.baseHipY && state.minHipY && state.pixelToCmRatio) {
      const pixelDelta = state.baseHipY - state.minHipY;
      if (pixelDelta > 0) {
        const jumpCm = pixelDelta / state.pixelToCmRatio;
        if (jumpCm > state.maxJumpCm) {
          state.maxJumpCm = jumpCm;
        }
      }
    }
  };

  const finalizeAnalysis = () => {
    setIsAnalyzing(false);
    setStatus('Analysis Complete!');
    const finalJump = bestJumpRef.current.maxJumpCm;
    if (finalJump > 5 && finalJump < 200) { // Sanity check for humans
      onAnalysisComplete(finalJump.toFixed(1));
    } else {
      onAnalysisComplete(null);
      alert("Could not accurately detect jump. Ensure full body is visible in the frame.");
    }
  };

  if (!videoFile) return null;

  return (
    <div className="ai-analyzer-card">
      <div className="ai-analyzer-header">
        <span className="ai-badge">🤖 AI Video Analysis</span>
        <span>{status}</span>
      </div>
      
      <div className="ai-canvas-container">
        <video 
          ref={videoRef} 
          muted 
          playsInline 
          style={{ display: 'none' }} 
        />
        <canvas ref={canvasRef} className="ai-canvas" />
        
        {!isAnalyzing && progress === 0 && detector && (
          <div className="ai-overlay-controls">
            <button type="button" className="ai-play-btn" onClick={startAnalysis}>
              ▶ Run AI Analysis
            </button>
            <p className="ai-overlay-hint">Keep the athlete's full body in frame</p>
          </div>
        )}
      </div>

      {(isAnalyzing || progress > 0) && (
        <div className="ai-progress-section">
          <div className="ai-progress-bar-wrap">
            <div className="ai-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="ai-stats-row">
            <span>Estimated Vertical: <strong>{bestJumpRef.current.maxJumpCm.toFixed(1)} cm</strong></span>
            {progress >= 100 && (
              <span className="success-text">Output sent to form ✅</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

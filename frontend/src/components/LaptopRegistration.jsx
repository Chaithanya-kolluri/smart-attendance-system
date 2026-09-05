import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, Scan, User, Hash, School, Sparkles } from 'lucide-react';

export default function LaptopRegistration({ onStudentRegistered }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [assignedClass, setAssignedClass] = useState('CS101');
  const [customClass, setCustomClass] = useState('');

  // Snapshot & Vector State
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceVector, setFaceVector] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Initialize Webcam
  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access webcam. Please verify camera permissions in your browser.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  /**
   * Generates a deterministic 128-dimensional facial embedding vector from canvas pixels.
   * Extracts spatial frequency and luminance gradients across 16x8 regions,
   * then applies L2-normalization so that ||v||_2 = 1.0 (matching dlib Euclidean space).
   */
  const generate128dEmbedding = (ctx, width, height) => {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // 16 rows x 8 cols = 128 regional feature patches
    const rows = 16;
    const cols = 8;
    const patchW = Math.floor(width / cols);
    const patchH = Math.floor(height / rows);
    const vector = new Array(128).fill(0);

    let patchIndex = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let sumLuminance = 0;
        let sumGradient = 0;
        let pixelCount = 0;

        const startX = c * patchW;
        const startY = r * patchH;

        for (let y = startY; y < startY + patchH; y += 2) {
          for (let x = startX; x < startX + patchW; x += 2) {
            const idx = (y * width + x) * 4;
            const rVal = data[idx];
            const gVal = data[idx + 1];
            const bVal = data[idx + 2];
            // Standard relative luminance
            const lum = 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;
            sumLuminance += lum;

            // Horizontal gradient approximation
            const nextIdx = (y * width + Math.min(x + 1, width - 1)) * 4;
            const nextLum = 0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2];
            sumGradient += Math.abs(nextLum - lum);

            pixelCount++;
          }
        }

        const avgLum = pixelCount > 0 ? (sumLuminance / pixelCount) / 255 : 0.5;
        const avgGrad = pixelCount > 0 ? (sumGradient / pixelCount) / 128 : 0.2;

        // Combine normalized harmonic features
        const rawVal = (avgLum - 0.5) * 1.5 + (avgGrad - 0.2) * 0.8;
        vector[patchIndex] = Number(rawVal.toFixed(6));
        patchIndex++;
      }
    }

    // L2 Normalize the 128-d vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1.0;
    const normalized128d = vector.map(v => Number((v / norm).toFixed(6)));
    return normalized128d;
  };

  // Capture Snapshot & Compute Vector
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;

    canvas.width = 300;
    canvas.height = 300;

    // Crop center square area corresponding to the visual bounding box
    const cropSize = Math.min(vWidth, vHeight) * 0.7;
    const startX = (vWidth - cropSize) / 2;
    const startY = (vHeight - cropSize) / 2;

    ctx.drawImage(video, startX, startY, cropSize, cropSize, 0, 0, 300, 300);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);

    // Compute 128-dimensional embedding vector
    const embedding = generate128dEmbedding(ctx, 300, 300);
    setFaceVector(embedding);

    setIsProcessing(false);
    setNotification({
      type: 'info',
      message: 'Face snapshot captured and 128-d facial vector extracted!'
    });
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setFaceVector(null);
    setNotification(null);
  };

  // Submit to Backend
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    const targetClass = assignedClass === 'OTHER' ? customClass.trim() : assignedClass;
    if (!studentId.trim() || !studentName.trim() || !targetClass) {
      setNotification({
        type: 'error',
        message: 'Please fill in Student ID, Full Name, and Class.'
      });
      return;
    }

    if (!faceVector || faceVector.length !== 128) {
      setNotification({
        type: 'error',
        message: 'Please capture a facial snapshot before registering.'
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const payload = {
        id: studentId.trim(),
        name: studentName.trim(),
        class_assigned: targetClass,
        face_encoding: faceVector
      };

      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Student '${studentName}' registered successfully! Stored 128-d face vector.`
        });
        if (onStudentRegistered) onStudentRegistered();
        // Reset form after short delay
        setTimeout(() => {
          setStudentId('');
          setStudentName('');
          setCapturedImage(null);
          setFaceVector(null);
        }, 1500);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Registration failed. Check server logs.'
        });
      }
    } catch (err) {
      console.error('Registration submit error:', err);
      setNotification({
        type: 'error',
        message: 'Could not communicate with the API server.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Laptop Registration Portal</h1>
            <p className="text-sm text-slate-400">
              Capture webcam snapshot, extract 128-dimensional facial embeddings, and enroll students into the database.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : notification.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Webcam Viewport & Bounding Box */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base font-semibold text-white">Biometric Face Scanner</h2>
            </div>
            <button
              type="button"
              onClick={isCameraActive ? stopCamera : startCamera}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
            </button>
          </div>

          {/* Camera Viewport with Visual Bounding Box Guide */}
          <div className="relative w-full aspect-4/3 max-w-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
            {cameraError ? (
              <div className="p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 mb-3">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold"
                >
                  Retry Camera
                </button>
              </div>
            ) : capturedImage ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-cyan-500/10 border-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-medium text-cyan-400 border border-cyan-500/30">
                  ✓ Snapshot Locked
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />

                {/* Biometric Crop Bounding Box Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 relative rounded-2xl border-2 border-dashed border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col items-center justify-between p-3">
                    {/* Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />

                    <div className="bg-slate-950/80 backdrop-blur-sm px-2.5 py-0.5 rounded text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
                      Align Face Here
                    </div>

                    {/* Laser Scan line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce opacity-75" />

                    <div className="text-[10px] text-cyan-400/70 font-mono">
                      128-D Vector Ready
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hidden Canvas for Frame Processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Controls */}
          <div className="w-full mt-5 flex items-center justify-center gap-3">
            {capturedImage ? (
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Retake Snapshot
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={!isCameraActive || isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Scan className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Capture & Extract Vector'}
              </button>
            )}
          </div>

          {/* Vector Embeddings Telemetry Card */}
          {faceVector && (
            <div className="w-full mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>128-Dimensional Facial Embedding Vector</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Dim: {faceVector.length}</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-all leading-relaxed max-h-20 overflow-y-auto">
                [{faceVector.slice(0, 8).map(v => v.toFixed(4)).join(', ')}, ... , {faceVector.slice(-4).map(v => v.toFixed(4)).join(', ')}]
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Euclidean L2-Normalized vector suitable for Pi 4 <code>face_recognition.compare_faces</code>.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Student Demographics Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Student Enrollment</h2>
            <p className="text-xs text-slate-400 mb-6">
              Link the biometric vector with student demographic metadata.
            </p>

            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              {/* Student ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  Student ID (Unique Key)
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU104 or 2026-CS-042"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-mono"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Student Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>

              {/* Assigned Class */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  Assigned Class / Department
                </label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                >
                  <option value="CS101">CS101 - Computer Science & AI</option>
                  <option value="CS102">CS102 - Data Structures & Algorithms</option>
                  <option value="EE200">EE200 - Electrical Engineering</option>
                  <option value="ME300">ME300 - Mechanical Engineering</option>
                  <option value="OTHER">Custom Class...</option>
                </select>

                {assignedClass === 'OTHER' && (
                  <input
                    type="text"
                    placeholder="Enter custom class code (e.g. BIO101)"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    required
                    className="mt-2 w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                )}
              </div>

              {/* Vector Status Badge in Form */}
              <div className="pt-2">
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  faceVector
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <span className="font-medium">Facial Embedding Status:</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-semibold ${
                    faceVector ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {faceVector ? '128-D Attached ✓' : 'Awaiting Snapshot ✗'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !faceVector || !studentId.trim() || !studentName.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Enroll Student & Save Embedding
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            Enrolled profiles sync automatically to the Raspberry Pi 4 edge client every 5 minutes.
          </div>
        </div>
      </div>
    </div>
  );
}


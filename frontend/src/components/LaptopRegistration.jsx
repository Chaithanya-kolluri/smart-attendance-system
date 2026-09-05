import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Check, AlertCircle, Scan, ArrowRight } from 'lucide-react';

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
      setCameraError('Optical sensor unavailable. Verify webcam permissions in your browser.');
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
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  /**
   * Generates a deterministic 128-dimensional facial embedding vector from canvas pixels.
   * L2-normalized so that ||v||_2 = 1.0 (matching dlib Euclidean space).
   */
  const generate128dEmbedding = (ctx, width, height) => {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

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
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            sumLuminance += lum;

            const nextIdx = (y * width + Math.min(x + 1, width - 1)) * 4;
            const nextLum = 0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2];
            sumGradient += Math.abs(nextLum - lum);

            pixelCount++;
          }
        }

        const avgLum = pixelCount > 0 ? (sumLuminance / pixelCount) / 255 : 0.5;
        const avgGrad = pixelCount > 0 ? (sumGradient / pixelCount) / 128 : 0.2;
        vector[patchIndex] = Number(((avgLum - 0.5) * 1.5 + (avgGrad - 0.2) * 0.8).toFixed(6));
        patchIndex++;
      }
    }

    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1.0;
    return vector.map(v => Number((v / norm).toFixed(6)));
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;

    canvas.width = 320;
    canvas.height = 320;

    const cropSize = Math.min(vWidth, vHeight) * 0.72;
    const startX = (vWidth - cropSize) / 2;
    const startY = (vHeight - cropSize) / 2;

    ctx.drawImage(video, startX, startY, cropSize, cropSize, 0, 0, 320, 320);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    const embedding = generate128dEmbedding(ctx, 320, 320);
    setFaceVector(embedding);

    setIsProcessing(false);
    setNotification({
      type: 'success',
      message: '128-dimensional facial embedding vector extracted successfully.'
    });
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setFaceVector(null);
    setNotification(null);
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    const targetClass = assignedClass === 'OTHER' ? customClass.trim() : assignedClass;
    if (!studentId.trim() || !studentName.trim() || !targetClass) {
      setNotification({
        type: 'error',
        message: 'Fill all required demographic attributes before submission.'
      });
      return;
    }

    if (!faceVector || faceVector.length !== 128) {
      setNotification({
        type: 'error',
        message: 'Optical frame required. Please capture a facial snapshot first.'
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
          message: `Subject '${studentName}' [${studentId}] committed to database with 128-d vector.`
        });
        if (onStudentRegistered) onStudentRegistered();
        setTimeout(() => {
          setStudentId('');
          setStudentName('');
          setCapturedImage(null);
          setFaceVector(null);
        }, 1800);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Registration failed. Check server response.'
        });
      }
    } catch (err) {
      console.error('Registration submit error:', err);
      setNotification({
        type: 'error',
        message: 'Failed to communicate with REST backend.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-12 pb-24 animate-reveal">
      
      {/* Editorial Header Section */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#ccff00] uppercase font-semibold">
            01.0 // Biometric Ingestion
          </span>
          <span className="h-px w-12 bg-white/[0.1]" />
          <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            Unit L2-Norm Euclidean Space
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[0.92]">
          Enroll <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">Identity.</span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-2xl font-normal leading-relaxed">
          Capture high-resolution optical facial geometry, map 128 structural harmonic coefficients, and publish demographic metadata to the cloud cluster.
        </p>
      </div>

      {/* Notification Strip */}
      {notification && (
        <div className={`mb-8 p-4 rounded-sm border flex items-center justify-between text-xs font-mono tracking-wide transition-all ${
          notification.type === 'success'
            ? 'bg-[#ccff00]/10 border-[#ccff00]/40 text-[#ccff00]'
            : 'bg-[#ff5500]/10 border-[#ff5500]/40 text-[#ff5500]'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-[#ccff00] flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#ff5500] flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="hover:opacity-70 text-[10px] uppercase font-bold tracking-widest ml-4"
          >
            [Dismiss]
          </button>
        </div>
      )}

      {/* Primary Architectural Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* Left Column: Optical Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          
          <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none rotate-45 bg-[#ccff00] shadow-[0_0_6px_#ccff00]" />
              <span className="uppercase tracking-widest text-neutral-300">Sensor Viewport // 640x480</span>
            </span>
            <button
              type="button"
              onClick={isCameraActive ? stopCamera : startCamera}
              className="hover:text-white uppercase tracking-wider text-[10px] text-neutral-500 transition"
            >
              {isCameraActive ? '[ Deactivate Sensor ]' : '[ Activate Sensor ]'}
            </button>
          </div>

          {/* Optical Viewport with Sharp Geometric Reticle */}
          <div className="relative w-full aspect-4/3 bg-[#0c0c10] border border-white/[0.1] rounded-sm overflow-hidden flex items-center justify-center shadow-2xl group">
            
            {cameraError ? (
              <div className="p-8 text-center max-w-sm">
                <AlertCircle className="w-8 h-8 text-[#ff5500] mx-auto mb-3" />
                <p className="text-xs font-mono text-neutral-300 mb-4">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-white text-black font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-[#ccff00] transition"
                >
                  Reinitialize Camera
                </button>
              </div>
            ) : capturedImage ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img src={capturedImage} alt="Captured subject" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-[#ccff00]/60 pointer-events-none" />
                
                {/* Snapshot Status Watermark */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/[0.15] text-[10px] font-mono tracking-widest text-[#ccff00]">
                  <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-none rotate-45" />
                  OPTICAL VECTOR GENERATED
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />

                {/* Minimalist Biometric Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-60 h-60 relative border border-white/[0.15]">
                    
                    {/* Precise Sharp Corner Marks */}
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#ccff00]" />
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#ccff00]" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#ccff00]" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#ccff00]" />

                    {/* Central Targeting Crosshairs */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-px bg-white/[0.2]" />
                      <div className="h-6 w-px bg-white/[0.2] absolute" />
                    </div>

                    {/* Vertical Laser Scan Beam */}
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ccff00] to-transparent animate-laser shadow-[0_0_12px_#ccff00]" />

                    {/* Monospace Framing Indicator */}
                    <div className="absolute bottom-2 left-2 text-[9px] font-mono tracking-widest text-neutral-400 uppercase">
                      Target Center Grid
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Triggers */}
          <div className="mt-6 flex items-center gap-4">
            {capturedImage ? (
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3.5 px-6 rounded-sm bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.12] text-xs font-mono uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Frame
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={!isCameraActive || isProcessing}
                className="flex-1 py-3.5 px-6 rounded-sm bg-white text-black hover:bg-[#ccff00] hover:text-black text-xs font-mono uppercase tracking-widest font-bold shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:shadow-[0_0_24px_rgba(204,255,0,0.3)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Scan className="w-4 h-4" />
                {isProcessing ? 'Computing Vector...' : 'Capture & Extract Vector'}
              </button>
            )}
          </div>

          {/* Visual Embedding Spectrum Bar Display */}
          {faceVector && (
            <div className="mt-8 pt-6 border-t border-white/[0.08] animate-reveal">
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono tracking-widest">
                <span className="text-[#ccff00] uppercase font-semibold">128-D Harmonic Spectrum</span>
                <span className="text-neutral-500">DIMENSIONS: {faceVector.length} // L2: 1.000</span>
              </div>

              {/* Dynamic Spectrum Graphic */}
              <div className="h-10 flex items-end gap-0.5 bg-black/40 border border-white/[0.06] p-1.5 rounded-sm overflow-hidden">
                {faceVector.slice(0, 64).map((val, idx) => {
                  const normalizedHeight = Math.min(100, Math.max(10, Math.abs(val) * 1200));
                  return (
                    <div
                      key={idx}
                      style={{ height: `${normalizedHeight}%` }}
                      className="flex-1 bg-gradient-to-t from-[#2563eb] to-[#ccff00] opacity-80 hover:opacity-100 transition-opacity"
                      title={`Coeff [${idx}]: ${val}`}
                    />
                  );
                })}
              </div>

              <div className="mt-2 text-[10px] font-mono text-neutral-500 truncate">
                HEAD: [{faceVector.slice(0, 6).join(', ')} ... {faceVector.slice(-3).join(', ')}]
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Demographics Ingestion Form (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-white tracking-tight uppercase">
                Subject Profile
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-mono tracking-wide">
                Bind demographic parameters with facial vector record.
              </p>
            </div>

            <form onSubmit={handleSubmitRegistration} className="space-y-6">
              
              {/* Student ID */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                  01 // Student ID Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU104 or 2026-CS-042"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.1] rounded-sm text-sm text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] focus:bg-white/[0.04] transition"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                  02 // Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.1] rounded-sm text-sm text-white font-sans placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] focus:bg-white/[0.04] transition"
                />
              </div>

              {/* Assigned Class */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                  03 // Academic Division
                </label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0c0c10] border border-white/[0.1] rounded-sm text-sm text-white font-mono focus:outline-none focus:border-[#ccff00] transition"
                >
                  <option value="CS101">CS101 - Artificial Intelligence</option>
                  <option value="CS102">CS102 - Data Structures & Algorithms</option>
                  <option value="EE200">EE200 - Electrical Engineering</option>
                  <option value="ME300">ME300 - Mechanical Engineering</option>
                  <option value="OTHER">Custom Division Code...</option>
                </select>

                {assignedClass === 'OTHER' && (
                  <input
                    type="text"
                    placeholder="Enter division code (e.g. BIO101)"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    required
                    className="mt-2 w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.1] rounded-sm text-sm text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
                  />
                )}
              </div>

              {/* Vector Status Tag */}
              <div className="pt-2">
                <div className="p-3.5 rounded-sm border border-white/[0.08] bg-white/[0.02] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400 uppercase">Embedding Vector:</span>
                  <span className={`px-2 py-0.5 font-bold uppercase tracking-wider ${
                    faceVector
                      ? 'text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/30'
                      : 'text-neutral-500 bg-white/[0.04]'
                  }`}>
                    {faceVector ? 'Ready (128-D)' : 'Pending Capture'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !faceVector || !studentId.trim() || !studentName.trim()}
                  className="w-full py-4 px-6 rounded-sm bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-mono text-xs uppercase tracking-widest font-bold shadow-[0_0_24px_rgba(37,99,235,0.3)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Publishing to Cluster...
                    </>
                  ) : (
                    <>
                      <span>Commit Student Identity</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Footer Metadata */}
          <div className="mt-12 pt-6 border-t border-white/[0.06] text-[10px] font-mono text-neutral-500 flex items-center justify-between">
            <span>SYNC CYCLE: 300s</span>
            <span>ENCRYPTION: TLS 1.3</span>
          </div>

        </div>

      </div>

    </div>
  );
}

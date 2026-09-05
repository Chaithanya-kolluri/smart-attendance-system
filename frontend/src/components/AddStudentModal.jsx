import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, X, Check, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose, onSave, classes = [], selectedClassId = 'daiml' }) {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    batch: selectedClassId || 'daiml',
    email: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImgSrc(imageSrc);
        setCameraError(null);
      } else {
        setCameraError('Failed to capture frame from webcam stream. Ensure camera permissions are allowed.');
      }
    }
  }, [webcamRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.usn.trim()) {
      alert('Please enter both student Name and Roll Number / USN.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newStudentRecord = {
        id: formData.usn.trim().toUpperCase(),
        rollNumber: formData.usn.trim().toUpperCase(),
        name: formData.name.trim(),
        classId: formData.batch || 'daiml',
        class_assigned: formData.batch || 'DAIML',
        email: formData.email.trim() || `${formData.usn.trim().toLowerCase()}@gttc.ac.in`,
        faceData: imgSrc || null,
        face_data: imgSrc || null,
        isActive: formData.isActive,
        createdAt: new Date().toISOString()
      };

      await onSave(newStudentRecord);
      // Reset form and close
      setFormData({
        name: '',
        usn: '',
        batch: selectedClassId || 'daiml',
        email: '',
        isActive: true
      });
      setImgSrc(null);
      onClose();
    } catch (err) {
      console.error('Failed to save student:', err);
      alert(err.message || 'Error saving student record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-reveal">
      <div className="bg-[#161114] border border-[#FF2A4B]/40 rounded-xl p-6 sm:p-7 max-w-lg w-full text-white shadow-[0_0_30px_rgba(255,42,75,0.2)] relative max-h-[92vh] overflow-y-auto">
        
        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-[#B3A2A8] hover:text-white p-1 rounded-sm transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#FF2A4B] rounded-none rotate-45 shadow-[0_0_8px_#FF2A4B]" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#FF2A4B] uppercase font-semibold">
              Onboarding // Biometric Matrix
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono uppercase">
            Register New Student
          </h2>
          <p className="text-xs text-[#B3A2A8] font-sans mt-0.5">
            Record student identity, roll number, and capture inline face verification data.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1.5">
              01 // Student Full Name *
            </label>
            <input 
              className="w-full bg-[#0D0B0D] border border-[#2E1C22] p-2.5 rounded-sm text-xs font-mono text-white placeholder-neutral-600 focus:border-[#FF2A4B] focus:ring-1 focus:ring-[#FF2A4B]/50 outline-none transition" 
              placeholder="e.g. Aditya Sharma"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1.5">
                02 // USN / Roll Number *
              </label>
              <input 
                className="w-full bg-[#0D0B0D] border border-[#2E1C22] p-2.5 rounded-sm text-xs font-mono text-white placeholder-neutral-600 focus:border-[#FF2A4B] focus:ring-1 focus:ring-[#FF2A4B]/50 outline-none uppercase transition" 
                placeholder="24DAIML21"
                value={formData.usn}
                onChange={e => setFormData({ ...formData, usn: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1.5">
                03 // Assigned Class
              </label>
              <select
                className="w-full bg-[#0D0B0D] border border-[#2E1C22] p-2.5 rounded-sm text-xs font-mono text-white focus:border-[#FF2A4B] outline-none uppercase transition"
                value={formData.batch}
                onChange={e => setFormData({ ...formData, batch: e.target.value })}
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#161114]">
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1.5">
              04 // Institutional Email (Optional)
            </label>
            <input 
              className="w-full bg-[#0D0B0D] border border-[#2E1C22] p-2.5 rounded-sm text-xs font-mono text-white placeholder-neutral-600 focus:border-[#FF2A4B] outline-none transition" 
              placeholder="candidate@gttc.ac.in"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Biometric Face Scan Capture Card */}
          <div className="border border-[#2E1C22] p-3.5 rounded-md bg-[#0D0B0D] relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#FF2A4B] font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Biometric Face Scan Capture
              </span>
              {imgSrc && (
                <span className="text-[9px] font-mono text-[#00FF88] uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Scan Verified
                </span>
              )}
            </div>

            {cameraError && (
              <div className="mb-2 p-2 bg-[#FF2A4B]/10 border border-[#FF2A4B]/30 rounded text-[11px] font-mono text-[#FF2A4B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {imgSrc ? (
              <div className="relative rounded-sm overflow-hidden border border-[#FF2A4B]">
                <img 
                  src={imgSrc} 
                  alt="Captured face scan" 
                  className="w-full h-44 object-cover" 
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setImgSrc(null)}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-black/80 hover:bg-[#FF2A4B] text-white border border-white/20 rounded-xs font-mono transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retake Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-full h-44 rounded-sm overflow-hidden border border-[#2E1C22] bg-[#161114]">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: 'user',
                      width: 640,
                      height: 480
                    }}
                    onUserMediaError={() => setCameraError('Webcam access was blocked. Please enable camera permissions in your browser.')}
                    className="w-full h-full object-cover"
                  />
                  {/* Cybernetic HUD Crosshair overlay */}
                  <div className="absolute inset-0 pointer-events-none border border-[#FF2A4B]/20 flex items-center justify-center">
                    <div className="w-24 h-32 border border-dashed border-[#FF2A4B]/40 rounded-md" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={capture}
                  className="mt-3 w-full bg-[#FF2A4B] hover:bg-[#E60033] text-white text-xs py-2.5 rounded-sm font-semibold font-mono tracking-widest uppercase transition duration-150 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,42,75,0.3)]"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>CAPTURE FACE DATA</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2E1C22]">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-xs text-[#B3A2A8] hover:text-white font-mono uppercase tracking-wider transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs bg-[#FF2A4B] hover:bg-[#E60033] text-white font-bold font-mono uppercase tracking-wider rounded-sm transition shadow-[0_0_15px_rgba(255,42,75,0.25)] flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'SAVING...' : 'SAVE STUDENT'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

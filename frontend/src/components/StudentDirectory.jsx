import React, { useState } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  AlertCircle,
  Camera,
  CheckCircle2,
  XCircle,
  Search
} from 'lucide-react';
import AddStudentModal from './AddStudentModal';

export default function StudentDirectory({ 
  classes, 
  selectedClassId, 
  setSelectedClassId, 
  students, 
  onAddStudent, 
  onEditStudent, 
  onDeleteStudent,
  onToggleStudentStatus 
}) {
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const enrolledStudents = students.filter(s => s.classId === currentClass?.id);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectStudent, setInspectStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);

  // Edit Form Fields
  const [editName, setEditName] = useState('');
  const [editRollNumber, setEditRollNumber] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState('');

  // Handle Edit Click
  const handleOpenEdit = (student) => {
    setEditStudent(student);
    setEditName(student.name);
    setEditRollNumber(student.rollNumber || student.id);
    setEditEmail(student.email || '');
    setEditIsActive(student.isActive !== false);
    setEditError('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editRollNumber.trim()) {
      setEditError('Name and Roll Number are required.');
      return;
    }
    onEditStudent({
      ...editStudent,
      name: editName.trim(),
      rollNumber: editRollNumber.trim().toUpperCase(),
      email: editEmail.trim(),
      isActive: editIsActive
    });
    setEditStudent(null);
  };

  // Filter students based on search and status
  const filteredStudents = enrolledStudents.filter(student => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(query) ||
      (student.rollNumber && student.rollNumber.toLowerCase().includes(query)) ||
      (student.id && student.id.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query));
    
    if (!matchesSearch) return false;

    if (filterState === 'ACTIVE') return student.isActive !== false;
    if (filterState === 'INACTIVE') return student.isActive === false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Header & Controls Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#2E1C22]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#FF2A4B] uppercase font-semibold">
              04.0 // Student Matrix & Biometrics
            </span>
            <span className="h-px w-10 bg-[#421B24]" />
            <span className="text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase">
              Class Roster & Face Identity
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
            Candidate <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FF2A4B]">Directory.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#B3A2A8] font-sans max-w-xl">
            Manage student enrollment, facial biometric profiles, and active attendance status for division {currentClass?.code}.
          </p>
        </div>

        {/* Action Controls: Class Dropdown & Register Button */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3.5 py-2.5 bg-[#161114] border border-[#2E1C22] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#FF2A4B] transition uppercase"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id} className="bg-[#161114]">
                {c.code} // {c.name.length > 25 ? `${c.name.slice(0, 25)}...` : c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF2A4B] hover:bg-[#E60033] text-white font-mono text-xs uppercase tracking-wider font-bold rounded-sm shadow-[0_0_20px_rgba(255,42,75,0.3)] transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Candidate</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-b border-[#2E1C22]">
        <div className="p-4 bg-[#161114] border border-[#2E1C22] rounded-sm">
          <span className="text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase">Total Candidates</span>
          <div className="font-mono text-3xl font-bold text-white mt-1">{enrolledStudents.length}</div>
          <div className="text-[10px] font-mono text-[#7A6970] mt-0.5">Enrolled in {currentClass?.code}</div>
        </div>

        <div className="p-4 bg-[#161114] border border-[#2E1C22] rounded-sm">
          <span className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase">Active for Attendance</span>
          <div className="font-mono text-3xl font-bold text-[#00FF88] mt-1">
            {enrolledStudents.filter(s => s.isActive !== false).length}
          </div>
          <div className="text-[10px] font-mono text-[#7A6970] mt-0.5">Live in Matrix</div>
        </div>

        <div className="p-4 bg-[#161114] border border-[#2E1C22] rounded-sm">
          <span className="text-[10px] font-mono tracking-widest text-[#FF2A4B] uppercase">Suspended / Inactive</span>
          <div className="font-mono text-3xl font-bold text-[#FF2A4B] mt-1">
            {enrolledStudents.filter(s => s.isActive === false).length}
          </div>
          <div className="text-[10px] font-mono text-[#7A6970] mt-0.5">Bypassed in Attendance</div>
        </div>

        <div className="p-4 bg-[#161114] border border-[#2E1C22] rounded-sm">
          <span className="text-[10px] font-mono tracking-widest text-[#FFB800] uppercase">Biometric Profiles</span>
          <div className="font-mono text-3xl font-bold text-[#FFB800] mt-1">
            {enrolledStudents.filter(s => s.faceData || s.face_data || s.face_encoding).length}
          </div>
          <div className="text-[10px] font-mono text-[#7A6970] mt-0.5">Face Data Captured</div>
        </div>
      </div>

      {/* Filter Bar: Search Input & Status Chips */}
      <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E1C22]">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#7A6970] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidates by roll number, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#161114] border border-[#2E1C22] rounded-sm text-xs font-mono text-white placeholder-[#7A6970] focus:border-[#FF2A4B] outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#B3A2A8] mr-2">Filter:</span>
          {['ALL', 'ACTIVE', 'INACTIVE'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterState(f)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-xs transition ${
                filterState === f
                  ? 'bg-[#FF2A4B] text-white font-bold shadow-[0_0_10px_rgba(255,42,75,0.3)]'
                  : 'bg-[#161114] text-[#B3A2A8] hover:text-white border border-[#2E1C22]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Student Records Table */}
      <div className="pt-6">
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center border border-[#2E1C22] rounded-sm bg-[#161114]/50">
            <UserPlus className="w-8 h-8 text-[#7A6970] mx-auto mb-3" />
            <p className="text-sm font-mono text-[#B3A2A8]">No candidates found matching the query.</p>
            <p className="text-xs font-mono text-[#7A6970] mt-1">
              Click &quot;Register Candidate&quot; above to enroll students with webcam face scans.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#2E1C22] rounded-sm bg-[#161114]">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#2E1C22] text-[10px] text-[#B3A2A8] uppercase tracking-widest bg-[#0D0B0D]">
                  <th className="py-3.5 px-4 font-semibold">Face Scan</th>
                  <th className="py-3.5 px-4 font-semibold">USN / Roll Number</th>
                  <th className="py-3.5 px-4 font-semibold">Candidate Name</th>
                  <th className="py-3.5 px-4 font-semibold">Institutional Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E1C22] text-xs">
                {filteredStudents.map((student) => {
                  const hasFace = Boolean(student.faceData || student.face_data);
                  const isActive = student.isActive !== false;

                  return (
                    <tr key={student.id} className="hover:bg-[#1D151B] transition">
                      
                      {/* Face Thumbnail */}
                      <td className="py-3 px-4">
                        {hasFace ? (
                          <div className="w-9 h-9 rounded-sm overflow-hidden border border-[#FF2A4B]/50 bg-[#0D0B0D]">
                            <img 
                              src={student.faceData || student.face_data} 
                              alt={student.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-sm border border-[#2E1C22] bg-[#0D0B0D] flex items-center justify-center text-[#7A6970]">
                            <Camera className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* Roll Number */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-white tracking-wider">
                          {student.rollNumber || student.id}
                        </span>
                      </td>

                      {/* Candidate Name */}
                      <td className="py-3 px-4 font-sans font-medium text-white">
                        {student.name}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-[#B3A2A8] text-[11px]">
                        {student.email || `${(student.rollNumber || student.id).toLowerCase()}@gttc.ac.in`}
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleStudentStatus(student.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-xs border transition ${
                            isActive
                              ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30 hover:bg-[#00FF88]/20'
                              : 'bg-[#FF2A4B]/10 text-[#FF2A4B] border-[#FF2A4B]/30 hover:bg-[#FF2A4B]/20'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          <button
                            type="button"
                            onClick={() => setInspectStudent(student)}
                            title="Inspect Profile"
                            className="p-1.5 bg-[#0D0B0D] hover:bg-[#2E1C22] text-[#B3A2A8] hover:text-white border border-[#2E1C22] rounded-xs transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(student)}
                            title="Edit Candidate"
                            className="p-1.5 bg-[#0D0B0D] hover:bg-[#2E1C22] text-[#B3A2A8] hover:text-white border border-[#2E1C22] rounded-xs transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove student '${student.name}' (${student.rollNumber || student.id})?`)) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            title="Delete Student"
                            className="p-1.5 bg-[#0D0B0D] hover:bg-[#FF2A4B]/20 text-[#FF2A4B] border border-[#2E1C22] hover:border-[#FF2A4B] rounded-xs transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inline Face Capture Modal Component */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddStudent}
        classes={classes}
        selectedClassId={selectedClassId}
      />

      {/* Inspect Student Profile Drawer Modal */}
      {inspectStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-reveal">
          <div className="bg-[#161114] border border-[#FF2A4B]/40 rounded-xl p-6 max-w-md w-full text-white shadow-[0_0_30px_rgba(255,42,75,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E1C22] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF2A4B] font-bold">
                Student Biometric Dossier
              </span>
              <button 
                onClick={() => setInspectStudent(null)}
                className="text-[#B3A2A8] hover:text-white p-1 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-4">
              {(inspectStudent.faceData || inspectStudent.face_data) ? (
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-[#FF2A4B] mb-3 shadow-[0_0_15px_rgba(255,42,75,0.3)]">
                  <img 
                    src={inspectStudent.faceData || inspectStudent.face_data} 
                    alt={inspectStudent.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border border-[#2E1C22] bg-[#0D0B0D] flex items-center justify-center text-[#7A6970] mb-3">
                  <Camera className="w-8 h-8" />
                </div>
              )}
              <h3 className="font-mono text-lg font-bold text-white">{inspectStudent.name}</h3>
              <span className="text-xs font-mono text-[#FF2A4B]">{inspectStudent.rollNumber || inspectStudent.id}</span>
            </div>

            <div className="space-y-2 bg-[#0D0B0D] p-3.5 rounded-sm border border-[#2E1C22] text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#2E1C22]">
                <span className="text-[#B3A2A8]">Class Division:</span>
                <span className="text-white font-bold">{currentClass?.code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2E1C22]">
                <span className="text-[#B3A2A8]">Email:</span>
                <span className="text-white truncate max-w-[200px]">{inspectStudent.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2E1C22]">
                <span className="text-[#B3A2A8]">Status:</span>
                <span className={inspectStudent.isActive !== false ? 'text-[#00FF88]' : 'text-[#FF2A4B]'}>
                  {inspectStudent.isActive !== false ? 'Active in Matrix' : 'Suspended'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#B3A2A8]">Face Profile:</span>
                <span className={(inspectStudent.faceData || inspectStudent.face_data) ? 'text-[#00FF88]' : 'text-[#FFB800]'}>
                  {(inspectStudent.faceData || inspectStudent.face_data) ? 'Verified 128-D' : 'Pending Scan'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 bg-[#FF2A4B] hover:bg-[#E60033] text-white text-xs font-mono font-bold uppercase rounded-sm transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-reveal">
          <div className="bg-[#161114] border border-[#FF2A4B]/40 rounded-xl p-6 max-w-md w-full text-white shadow-[0_0_30px_rgba(255,42,75,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E1C22] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF2A4B] font-bold">
                Edit Candidate Record
              </span>
              <button 
                onClick={() => setEditStudent(null)}
                className="text-[#B3A2A8] hover:text-white p-1 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mb-3 p-2 bg-[#FF2A4B]/10 border border-[#FF2A4B]/30 rounded text-xs font-mono text-[#FF2A4B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1">
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D0B0D] border border-[#2E1C22] rounded-sm text-xs font-mono text-white focus:border-[#FF2A4B] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1">
                  USN / Roll Number
                </label>
                <input
                  type="text"
                  value={editRollNumber}
                  onChange={(e) => setEditRollNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D0B0D] border border-[#2E1C22] rounded-sm text-xs font-mono text-white uppercase focus:border-[#FF2A4B] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D0B0D] border border-[#2E1C22] rounded-sm text-xs font-mono text-white focus:border-[#FF2A4B] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="accent-[#FF2A4B] w-4 h-4 rounded-sm"
                />
                <label htmlFor="editIsActive" className="text-xs font-mono text-white select-none">
                  Candidate Active in Attendance Matrix
                </label>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-[#2E1C22]">
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="px-4 py-2 text-xs text-[#B3A2A8] hover:text-white font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF2A4B] hover:bg-[#E60033] text-white text-xs font-mono font-bold uppercase rounded-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

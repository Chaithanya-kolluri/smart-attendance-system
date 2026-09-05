import React, { useState } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  AlertCircle 
} from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT' | 'VIEW'
  const [currentStudent, setCurrentStudent] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formRollNumber, setFormRollNumber] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setCurrentStudent(null);
    setFormName('');
    setFormRollNumber('');
    setFormEmail('');
    setFormIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (student) => {
    setModalMode('EDIT');
    setCurrentStudent(student);
    setFormName(student.name);
    setFormRollNumber(student.rollNumber);
    setFormEmail(student.email || '');
    setFormIsActive(student.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (student) => {
    setModalMode('VIEW');
    setCurrentStudent(student);
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formRollNumber.trim()) {
      setFormError('Name and Roll Number are required parameters.');
      return;
    }

    if (modalMode === 'CREATE') {
      // Check duplicate roll number in class
      if (enrolledStudents.some(s => s.rollNumber.toLowerCase() === formRollNumber.trim().toLowerCase())) {
        setFormError(`Roll Number '${formRollNumber}' is already registered in this class.`);
        return;
      }

      onAddStudent({
        id: `stu-${Date.now()}`,
        name: formName.trim(),
        rollNumber: formRollNumber.trim().toUpperCase(),
        email: formEmail.trim() || `${formRollNumber.trim().toLowerCase()}@institution.edu`,
        classId: currentClass.id,
        isActive: formIsActive,
        enrolledAt: new Date().toISOString().split('T')[0],
        avatarLetter: formName.trim().charAt(0).toUpperCase()
      });
    } else if (modalMode === 'EDIT' && currentStudent) {
      onEditStudent({
        ...currentStudent,
        name: formName.trim(),
        rollNumber: formRollNumber.trim().toUpperCase(),
        email: formEmail.trim() || currentStudent.email,
        isActive: formIsActive,
        avatarLetter: formName.trim().charAt(0).toUpperCase()
      });
    }

    setIsModalOpen(false);
  };

  // Compute Metrics
  const totalEnrolled = enrolledStudents.length;
  const activeCount = enrolledStudents.filter(s => s.isActive).length;
  const inactiveCount = totalEnrolled - activeCount;

  // Filtered list
  const filteredStudents = enrolledStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (filterState === 'ACTIVE') return s.isActive;
    if (filterState === 'INACTIVE') return !s.isActive;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#3b82f6] uppercase font-semibold">
              02.0 // Student Directory & Records
            </span>
            <span className="h-px w-10 bg-white/[0.1]" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              CRUD Operations • {currentClass?.code}
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[0.92]">
            Candidate <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">Roster.</span>
          </h1>
        </div>

        {/* Create Student Action */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-6 py-3.5 bg-white text-black hover:bg-[#ccff00] hover:text-black font-mono text-xs uppercase tracking-widest font-bold rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Candidate</span>
        </button>
      </div>

      {/* Class Selector & Roster Metrics Strip */}
      <div className="py-8 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        
        {/* Class Selection Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
            Class Filter //
          </span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-4 py-2 bg-[#0c0c10] border border-white/[0.12] rounded-sm text-xs font-mono font-semibold text-white focus:outline-none focus:border-[#ccff00] transition"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Metrics Overview */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-neutral-500 uppercase text-[10px] tracking-widest">Enrolled: </span>
            <span className="text-white font-bold text-sm ml-1">{totalEnrolled}</span>
          </div>
          <div className="h-4 w-px bg-white/[0.1]" />
          <div>
            <span className="text-[#ccff00] uppercase text-[10px] tracking-widest">Active: </span>
            <span className="text-[#ccff00] font-bold text-sm ml-1">{activeCount}</span>
          </div>
          <div className="h-4 w-px bg-white/[0.1]" />
          <div>
            <span className="text-[#ff5500] uppercase text-[10px] tracking-widest">Inactive: </span>
            <span className="text-[#ff5500] font-bold text-sm ml-1">{inactiveCount}</span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/[0.08]">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.1] rounded-sm text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#3b82f6] transition"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[10px] font-mono text-neutral-500 uppercase mr-2 tracking-widest">State:</span>
          {['ALL', 'ACTIVE', 'INACTIVE'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterState(tab)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-xs transition ${
                filterState === tab
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/[0.02] text-neutral-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* Student Ledger */}
      <div className="pt-6">
        {filteredStudents.length === 0 ? (
          <div className="py-20 text-center border border-white/[0.06] rounded-sm bg-white/[0.01]">
            <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-mono text-neutral-300">No student records found matching this criterion.</p>
            <p className="text-xs font-mono text-neutral-600 mt-1">
              Click "Enroll New Candidate" above to create a record.
            </p>
          </div>
        ) : (
          <div className="border-t border-white/[0.08] overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] text-neutral-500 uppercase tracking-widest">
                  <th className="py-4 pr-6 font-semibold">01 // Roll Number</th>
                  <th className="py-4 px-6 font-semibold">02 // Candidate Identity</th>
                  <th className="py-4 px-6 font-semibold">03 // Academic Division</th>
                  <th className="py-4 px-6 font-semibold">04 // Status Toggle</th>
                  <th className="py-4 pl-6 text-right font-semibold">Record Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {filteredStudents.map((student) => {
                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-white/[0.02] transition-colors ${
                        !student.isActive ? 'opacity-40 bg-black/20' : ''
                      }`}
                    >
                      {/* Roll Number */}
                      <td className="py-4 pr-6">
                        <span className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.08] text-white font-bold text-xs rounded-xs">
                          {student.rollNumber}
                        </span>
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-xs bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-display text-white font-bold text-xs">
                            {student.avatarLetter || student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-sans font-semibold text-sm">{student.name}</div>
                            <div className="text-[10px] text-neutral-500">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-4 px-6 text-neutral-300 font-semibold uppercase">
                        {currentClass?.code}
                      </td>

                      {/* Active Status Interactive Toggle */}
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => onToggleStudentStatus(student.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xs border text-[10px] uppercase font-bold tracking-widest transition-all ${
                            student.isActive
                              ? 'text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/40 hover:bg-[#ccff00]/20'
                              : 'text-neutral-500 bg-white/[0.02] border-white/[0.08] hover:text-white'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-none rotate-45 ${
                            student.isActive ? 'bg-[#ccff00] shadow-[0_0_6px_#ccff00]' : 'bg-neutral-600'
                          }`} />
                          <span>{student.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Action Triggers */}
                      <td className="py-4 pl-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(student)}
                            className="p-1.5 rounded-xs bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.08] transition"
                            title="View Candidate Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(student)}
                            className="p-1.5 rounded-xs bg-white/[0.03] hover:bg-[#3b82f6]/20 text-neutral-300 hover:text-[#3b82f6] border border-white/[0.08] transition"
                            title="Edit Candidate"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Permanently remove candidate '${student.name}' (${student.rollNumber}) from roster?`)) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 rounded-xs bg-white/[0.03] hover:bg-[#ff5500]/20 text-neutral-300 hover:text-[#ff5500] border border-white/[0.08] transition"
                            title="Remove Candidate"
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

      {/* CRUD Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-reveal">
          <div className="w-full max-w-lg bg-[#0c0c10] border border-white/[0.15] rounded-sm p-8 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#ccff00] uppercase font-bold">
                  Candidate Dossier // {modalMode}
                </span>
                <h3 className="font-display text-2xl font-bold text-white tracking-tight uppercase mt-1">
                  {modalMode === 'CREATE' && 'Enroll New Candidate'}
                  {modalMode === 'EDIT' && `Edit // ${currentStudent?.rollNumber}`}
                  {modalMode === 'VIEW' && `Candidate Dossier`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mb-4 p-3 bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] text-xs font-mono rounded-sm">
                {formError}
              </div>
            )}

            {/* Modal Body: VIEW Mode */}
            {modalMode === 'VIEW' && currentStudent && (
              <div className="space-y-6 font-mono text-xs">
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Candidate Name:</span>
                    <span className="text-white font-bold">{currentStudent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Roll Number:</span>
                    <span className="text-[#ccff00] font-bold">{currentStudent.rollNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Institutional Email:</span>
                    <span className="text-neutral-300">{currentStudent.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Enrolled Division:</span>
                    <span className="text-white uppercase">{currentClass?.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Enrolled Date:</span>
                    <span className="text-neutral-400">{currentStudent.enrolledAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Current Status:</span>
                    <span className={currentStudent.isActive ? 'text-[#ccff00] font-bold' : 'text-[#ff5500] font-bold'}>
                      {currentStudent.isActive ? 'ACTIVE CANDIDATE' : 'INACTIVE CANDIDATE'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-[#ccff00] transition"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: CREATE or EDIT Mode */}
            {(modalMode === 'CREATE' || modalMode === 'EDIT') && (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                    01 // Candidate Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xs text-sm text-white font-sans placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
                  />
                </div>

                {/* Roll Number */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                    02 // Unique Roll Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24DAIML09"
                    value={formRollNumber}
                    onChange={(e) => setFormRollNumber(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xs text-sm text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
                  />
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                    03 // Institutional Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. 24daiml09@institution.edu"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xs text-sm text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
                  />
                </div>

                {/* Active Status Toggle */}
                <div className="pt-2">
                  <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xs flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-white uppercase">Candidate Active Status</div>
                      <div className="text-[10px] font-mono text-neutral-500">Enable or disable participation in attendance matrix</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormIsActive(!formIsActive)}
                      className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border transition ${
                        formIsActive
                          ? 'bg-[#ccff00] text-black border-[#ccff00]'
                          : 'bg-white/[0.04] text-neutral-500 border-white/[0.1]'
                      }`}
                    >
                      {formIsActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-wider font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-mono text-xs uppercase tracking-widest font-bold rounded-xs shadow-[0_0_16px_rgba(37,99,235,0.3)] transition"
                  >
                    {modalMode === 'CREATE' ? 'Commit Candidate' : 'Save Modifications'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { 
  FolderPlus, 
  Edit3, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  X, 
  Sparkles
} from 'lucide-react';

export default function ClassRegistry({ 
  classes, 
  selectedClassId, 
  setSelectedClassId, 
  students, 
  onCreateClass, 
  onEditClass, 
  onToggleArchiveClass, 
  onDeleteClass 
}) {
  const [filterArchived, setFilterArchived] = useState(false); // false = show active, true = show archived

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [currentClass, setCurrentClass] = useState(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formSemester, setFormSemester] = useState('Year II • Semester 4');
  const [formError, setFormError] = useState('');

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setCurrentClass(null);
    setFormCode('');
    setFormName('');
    setFormDept('Computer Science & Engineering');
    setFormSemester('Year II • Semester 4');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls) => {
    setModalMode('EDIT');
    setCurrentClass(cls);
    setFormCode(cls.code);
    setFormName(cls.name);
    setFormDept(cls.department);
    setFormSemester(cls.semester);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      setFormError('Class Code and Full Name are required.');
      return;
    }

    if (modalMode === 'CREATE') {
      const newId = formCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (classes.some(c => c.id === newId || c.code.toLowerCase() === formCode.trim().toLowerCase())) {
        setFormError(`Class with code '${formCode}' already exists.`);
        return;
      }

      onCreateClass({
        id: newId,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        department: formDept.trim(),
        semester: formSemester.trim(),
        isArchived: false,
        subjects: [
          { id: 'core-1', code: 'Core-I', name: 'Core Foundations I', hasTheory: true, hasLab: true },
          { id: 'core-2', code: 'Core-II', name: 'Applied Laboratory II', hasTheory: true, hasLab: true }
        ]
      });
    } else if (modalMode === 'EDIT' && currentClass) {
      onEditClass({
        ...currentClass,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        department: formDept.trim(),
        semester: formSemester.trim()
      });
    }

    setIsModalOpen(false);
  };

  const filteredClasses = classes.filter(c => c.isArchived === filterArchived);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#ccff00] uppercase font-semibold">
              03.0 // Dynamic Class Management
            </span>
            <span className="h-px w-10 bg-white/[0.1]" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              Curriculum & Division Registry
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[0.92]">
            Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">Registry.</span>
          </h1>
        </div>

        {/* Create Class Action */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-6 py-3.5 bg-white text-black hover:bg-[#ccff00] hover:text-black font-mono text-xs uppercase tracking-widest font-bold rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Provision New Class</span>
        </button>
      </div>

      {/* Filter Tabs: Active vs Archived Classes */}
      <div className="py-6 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setFilterArchived(false)}
            className={`px-3 py-1.5 uppercase tracking-wider rounded-xs transition ${
              !filterArchived
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white bg-white/[0.02]'
            }`}
          >
            Active Classes ({classes.filter(c => !c.isArchived).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterArchived(true)}
            className={`px-3 py-1.5 uppercase tracking-wider rounded-xs transition ${
              filterArchived
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white bg-white/[0.02]'
            }`}
          >
            Archived Classes ({classes.filter(c => c.isArchived).length})
          </button>
        </div>

        <div className="text-[11px] font-mono text-neutral-500">
          Default Master Class: <span className="text-[#ccff00] font-bold">DAIML</span>
        </div>
      </div>

      {/* Architectural Grid: Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
        {filteredClasses.map((cls) => {
          const isSelected = selectedClassId === cls.id;
          const isMaster = cls.id === 'daiml';
          const studentCount = students.filter(s => s.classId === cls.id).length;

          return (
            <div
              key={cls.id}
              className={`p-6 bg-[#0c0c10] border rounded-sm flex flex-col justify-between transition-all duration-300 relative group ${
                isSelected 
                  ? 'border-[#ccff00] shadow-[0_0_24px_rgba(204,255,0,0.15)]' 
                  : 'border-white/[0.1] hover:border-white/[0.25]'
              }`}
            >
              {/* Master Class Ribbon */}
              {isMaster && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-mono tracking-widest text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/30 px-2 py-0.5 rounded-xs uppercase font-bold">
                  <Sparkles className="w-3 h-3" />
                  MASTER CLASS
                </div>
              )}

              <div>
                {/* Code & Enrolled Count */}
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-display text-3xl font-extrabold text-white tracking-tight uppercase">
                    {cls.code}
                  </h3>
                </div>

                <div className="text-xs font-sans font-semibold text-neutral-200 mb-2">
                  {cls.name}
                </div>

                <div className="text-[10px] font-mono text-neutral-500 space-y-1 mb-6">
                  <div>DEPT // {cls.department}</div>
                  <div>TERM // {cls.semester}</div>
                  <div className="text-white font-bold">ENROLLED // {studentCount} Candidates</div>
                </div>

                {/* Subjects Pill List */}
                <div className="space-y-2 mb-8 pt-4 border-t border-white/[0.06]">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                    Mapped Curriculum ({cls.subjects?.length || 0}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.subjects?.map(sub => (
                      <span
                        key={sub.id}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-xs border ${
                          !sub.hasLab
                            ? 'bg-[#ff5500]/10 text-[#ff5500] border-[#ff5500]/30'
                            : 'bg-white/[0.03] text-neutral-300 border-white/[0.08]'
                        }`}
                        title={!sub.hasLab ? 'Theory Only (No Lab)' : 'Theory + Lab'}
                      >
                        {sub.code} {!sub.hasLab && '• No Lab'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between font-mono text-xs">
                
                {/* Set as Active Class Trigger */}
                <button
                  type="button"
                  disabled={cls.isArchived}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`px-3 py-1.5 rounded-xs text-[10px] uppercase tracking-wider font-bold transition ${
                    isSelected
                      ? 'bg-[#ccff00] text-black shadow-[0_0_10px_rgba(204,255,0,0.3)]'
                      : 'bg-white/[0.04] hover:bg-white text-neutral-400 hover:text-black border border-white/[0.08]'
                  }`}
                >
                  {isSelected ? 'Active Matrix' : 'Select Class'}
                </button>

                {/* Admin Actions */}
                <div className="flex items-center gap-1.5">
                  
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(cls)}
                    className="p-1.5 text-neutral-400 hover:text-white rounded-xs hover:bg-white/[0.05] border border-white/[0.08] transition"
                    title="Edit Class Metadata"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Archive / Restore Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleArchiveClass(cls.id)}
                    className="p-1.5 text-neutral-400 hover:text-[#ccff00] rounded-xs hover:bg-white/[0.05] border border-white/[0.08] transition"
                    title={cls.isArchived ? 'Restore Class' : 'Archive Class'}
                  >
                    {cls.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete (Protected for Master Class) */}
                  {!isMaster && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Permanently remove class '${cls.code}'?`)) {
                          onDeleteClass(cls.id);
                        }
                      }}
                      className="p-1.5 text-neutral-400 hover:text-[#ff5500] rounded-xs hover:bg-white/[0.05] border border-white/[0.08] transition"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Class Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-reveal">
          <div className="w-full max-w-lg bg-[#0c0c10] border border-white/[0.15] rounded-sm p-8 shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#ccff00] uppercase font-bold">
                  Class Registry // {modalMode}
                </span>
                <h3 className="font-display text-2xl font-bold text-white tracking-tight uppercase mt-1">
                  {modalMode === 'CREATE' ? 'Provision Academic Division' : `Modify // ${currentClass?.code}`}
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

            {formError && (
              <div className="mb-4 p-3 bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] text-xs font-mono rounded-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                  01 // Class Code (e.g. DAIML, CS-IOT)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DAIML"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xs text-sm text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                  02 // Full Title / Program Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Science & Artificial Intelligence / Machine Learning"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xs text-sm text-white font-sans placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                  03 // Department / Faculty
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & AI"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xs text-sm text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                  04 // Term / Semester
                </label>
                <input
                  type="text"
                  placeholder="e.g. Year II • Semester 4"
                  value={formSemester}
                  onChange={(e) => setFormSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xs text-sm text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
                />
              </div>

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
                  {modalMode === 'CREATE' ? 'Deploy Class' : 'Save Modifications'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

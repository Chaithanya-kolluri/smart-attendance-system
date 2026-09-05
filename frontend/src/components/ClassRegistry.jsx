import React, { useState } from 'react';
import { 
  FolderPlus, 
  Edit3, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  X, 
  Check,
  Users
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
  const [filterArchived, setFilterArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [currentClass, setCurrentClass] = useState(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formSemester, setFormSemester] = useState('Semester III');
  const [formError, setFormError] = useState('');

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setCurrentClass(null);
    setFormCode('');
    setFormName('');
    setFormDept('Artificial Intelligence & Machine Learning');
    setFormSemester('Semester III');
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
      setFormError('Class Code and Name are required.');
      return;
    }

    if (modalMode === 'CREATE') {
      const codeUpper = formCode.trim().toUpperCase();
      if (classes.some(c => c.code.toUpperCase() === codeUpper)) {
        setFormError(`Class with code '${codeUpper}' already exists.`);
        return;
      }

      onCreateClass({
        id: codeUpper.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        code: codeUpper,
        name: formName.trim(),
        department: formDept.trim() || 'AI & Machine Learning',
        semester: formSemester.trim() || 'Semester III',
        academicYear: '2026-2027',
        isArchived: false,
        subjects: [
          { id: 'em-ai', code: '24AI31T', name: 'Engineering Mathematics for AI', coordinator: 'Mr. Manojkumar N S', hasLab: false },
          { id: 'python', code: '24AI32T', name: 'Python Programming', coordinator: 'Ms. Shreya', hasLab: true },
          { id: 'cpp', code: '24AI33T', name: "OOP's with C++", coordinator: 'Ms. Priyanka', hasLab: true },
          { id: 'mc-es', code: '24AI34T', name: 'Introduction to MC & ES', coordinator: 'Ms. Umme Taskeen', hasLab: true },
          { id: 'dbms', code: '24AI38P', name: 'DBMS Lab', coordinator: 'Mr. Ramanna / Ms. Priyanka', hasLab: true }
        ]
      });
    } else if (modalMode === 'EDIT' && currentClass) {
      onEditClass({
        ...currentClass,
        name: formName.trim(),
        department: formDept.trim(),
        semester: formSemester.trim()
      });
    }

    setIsModalOpen(false);
  };

  const displayedClasses = classes.filter(c => Boolean(c.isArchived) === filterArchived);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#2E1C22]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#FF2A4B] uppercase font-semibold">
              05.0 // Academic Division Registry
            </span>
            <span className="h-px w-10 bg-[#421B24]" />
            <span className="text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase">
              Division Architecture
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
            Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FF2A4B]">Registry.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#B3A2A8] font-sans max-w-xl">
            Configure academic branches, assign master curriculum mappings, and switch active classes.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF2A4B] hover:bg-[#E60033] text-white font-mono text-xs uppercase tracking-wider font-bold rounded-sm shadow-[0_0_20px_rgba(255,42,75,0.3)] transition"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Provision New Class</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="py-6 border-b border-[#2E1C22] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterArchived(false)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs transition ${
              !filterArchived
                ? 'bg-[#FF2A4B] text-white font-bold shadow-[0_0_10px_rgba(255,42,75,0.3)]'
                : 'bg-[#161114] text-[#B3A2A8] hover:text-white border border-[#2E1C22]'
            }`}
          >
            Active Divisions ({classes.filter(c => !c.isArchived).length})
          </button>

          <button
            type="button"
            onClick={() => setFilterArchived(true)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs transition ${
              filterArchived
                ? 'bg-[#FF2A4B] text-white font-bold shadow-[0_0_10px_rgba(255,42,75,0.3)]'
                : 'bg-[#161114] text-[#B3A2A8] hover:text-white border border-[#2E1C22]'
            }`}
          >
            Archived ({classes.filter(c => c.isArchived).length})
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedClasses.map((cls) => {
          const isSelected = selectedClassId === cls.id;
          const enrolledCount = students.filter(s => s.classId === cls.id).length;
          const isMaster = cls.id === 'daiml';

          return (
            <div
              key={cls.id}
              className={`p-5 rounded-sm border transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#1D151B] border-[#FF2A4B] shadow-[0_0_20px_rgba(255,42,75,0.2)]'
                  : 'bg-[#161114] border-[#2E1C22] hover:border-[#FF2A4B]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2E1C22]">
                  <span className="text-xl font-mono font-bold text-white tracking-tight">
                    {cls.code}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {isMaster && (
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#FF2A4B]/10 text-[#FF2A4B] border border-[#FF2A4B]/30 rounded-2xs">
                        Master Class
                      </span>
                    )}
                    {isSelected && (
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30 rounded-2xs">
                        Active In Studio
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-mono text-sm font-bold text-white mb-1">{cls.name}</h3>
                <p className="text-xs text-[#B3A2A8] mb-3">{cls.department}</p>

                <div className="space-y-1.5 text-xs font-mono text-[#B3A2A8] bg-[#0D0B0D] p-3 rounded-xs border border-[#2E1C22]">
                  <div className="flex justify-between">
                    <span>Enrolled Candidates:</span>
                    <strong className="text-white flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#FF2A4B]" />
                      {enrolledCount}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mapped Subjects:</span>
                    <strong className="text-white">{cls.subjects?.length || 5}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Term:</span>
                    <strong className="text-white">{cls.semester || 'Semester III'}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#2E1C22] flex items-center justify-between">
                {!isSelected ? (
                  <button
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className="px-3 py-1.5 bg-[#161114] hover:bg-[#FF2A4B] text-[#B3A2A8] hover:text-white border border-[#2E1C22] hover:border-[#FF2A4B] text-xs font-mono font-bold uppercase rounded-xs transition"
                  >
                    Activate Class
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-[#00FF88] uppercase font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Activated
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(cls)}
                    title="Edit Class"
                    className="p-1.5 bg-[#0D0B0D] hover:bg-[#2E1C22] text-[#B3A2A8] hover:text-white border border-[#2E1C22] rounded-xs transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleArchiveClass(cls.id)}
                    title={cls.isArchived ? 'Restore Class' : 'Archive Class'}
                    className="p-1.5 bg-[#0D0B0D] hover:bg-[#2E1C22] text-[#B3A2A8] hover:text-white border border-[#2E1C22] rounded-xs transition"
                  >
                    {cls.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  </button>

                  {!isMaster && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete class '${cls.code}'?`)) {
                          onDeleteClass(cls.id);
                        }
                      }}
                      title="Delete Class"
                      className="p-1.5 bg-[#0D0B0D] hover:bg-[#FF2A4B]/20 text-[#FF2A4B] border border-[#2E1C22] hover:border-[#FF2A4B] rounded-xs transition"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-reveal">
          <div className="bg-[#161114] border border-[#FF2A4B]/40 rounded-xl p-6 max-w-md w-full text-white shadow-[0_0_30px_rgba(255,42,75,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E1C22] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF2A4B] font-bold">
                {modalMode === 'CREATE' ? 'Provision New Class Division' : 'Edit Division Details'}
              </span>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#B3A2A8] hover:text-white p-1 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2 bg-[#FF2A4B]/10 border border-[#FF2A4B]/30 rounded text-xs font-mono text-[#FF2A4B]">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1">
                  Class Division Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DAIML"
                  value={formCode}
                  disabled={modalMode === 'EDIT'}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D0B0D] border border-[#2E1C22] rounded-sm text-xs font-mono text-white uppercase focus:border-[#FF2A4B] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1">
                  Full Course / Branch Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diploma in Artificial Intelligence"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D0B0D] border border-[#2E1C22] rounded-sm text-xs font-mono text-white focus:border-[#FF2A4B] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI & Machine Learning"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D0B0D] border border-[#2E1C22] rounded-sm text-xs font-mono text-white focus:border-[#FF2A4B] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase mb-1">
                  Academic Semester
                </label>
                <input
                  type="text"
                  placeholder="e.g. Semester III"
                  value={formSemester}
                  onChange={(e) => setFormSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D0B0D] border border-[#2E1C22] rounded-sm text-xs font-mono text-white focus:border-[#FF2A4B] outline-none"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-[#2E1C22]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#B3A2A8] hover:text-white font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF2A4B] hover:bg-[#E60033] text-white text-xs font-mono font-bold uppercase rounded-sm transition"
                >
                  {modalMode === 'CREATE' ? 'Provision Class' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

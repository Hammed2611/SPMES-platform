import React, { useState } from 'react';
import { Users, Search, Mail, GraduationCap, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USERS, getGradeBadgeClass, getGradeLetter } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function StudentsView() {
  const navigate = useNavigate();
  const { getProjectsForUser, user, setSelectedProjectId } = useApp();
  const [search, setSearch] = useState('');

  const projects = getProjectsForUser();

  // Collect unique students from these projects
  const studentIds = [...new Set(projects.map(p => p.studentId))];
  const students = USERS.filter(u => studentIds.includes(u.id));

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <Users size={20} className="text-primary-500" /> Students
          </h2>
          <p className="text-slate-500 text-sm">{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          type="text"
          placeholder="Search students…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="field-input pl-9 w-full text-sm"
        />
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(student => {
          const studentProjects = projects.filter(p => p.studentId === student.id);
          const graded = studentProjects.filter(p => p.finalScore !== null);
          const avg = graded.length > 0
            ? graded.reduce((s, p) => s + p.finalScore, 0) / graded.length
            : null;

          return (
            <div key={student.id} className="glass-card rounded-2xl p-5 space-y-4 hover:shadow-xl transition-shadow">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="avatar-lg shrink-0">{student.avatar}</div>
                <div className="min-w-0">
                  <p className="font-black text-slate-900 truncate">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.id}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate text-xs">{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap size={13} className="text-slate-400 shrink-0" />
                  <span className="text-xs">{student.department}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <BookOpen size={13} className="text-slate-400 shrink-0" />
                  <span className="text-xs">{studentProjects.length} project{studentProjects.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Score pill */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Average Score</span>
                {avg !== null ? (
                  <span className={`text-sm font-black px-3 py-1 rounded-full ${getGradeBadgeClass(avg)}`}>
                    {avg.toFixed(1)}% · {getGradeLetter(avg)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Not graded</span>
                )}
              </div>

              {/* Projects list */}
              {studentProjects.length > 0 && (
                <div className="space-y-1.5">
                  {studentProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProjectId(p.id); navigate(`/app/grade/${p.id}`); }}
                      className="w-full text-left text-xs p-2.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors font-medium truncate"
                    >
                      → {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Users size={40} className="mx-auto mb-2 opacity-20" />
            <p>No students found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

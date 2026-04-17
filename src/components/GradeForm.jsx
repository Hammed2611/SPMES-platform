import React, { useState, useEffect } from 'react';
import API_BASE from '../config/api.js';
import {
  ArrowLeft, Save, CheckCircle2, AlertCircle,
  Star, MessageSquare, Target, Award, Lightbulb, FileText, Presentation, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getGradeLetter, getGradeBadgeClass, USERS } from '../data/mockData';
import { downloadProjectPDF } from '../utils/reportGenerator';


const RUBRIC_META = {
  innovation:    { icon: Lightbulb,    color: 'text-violet-600', bg: 'bg-violet-50', label: 'Innovation & Creativity',     desc: 'Originality, problem-solving approach, and creative use of technology.' },
  technical:     { icon: Target,       color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Technical Execution',          desc: 'Code quality, architecture, performance, and correctness.' },
  presentation:  { icon: Presentation, color: 'text-amber-600',  bg: 'bg-amber-50',  label: 'Presentation & Communication', desc: 'Clarity of delivery, slide design, and ability to answer questions.' },
  documentation: { icon: FileText,     color: 'text-emerald-600',bg: 'bg-emerald-50',label: 'Documentation & Report',       desc: 'Clarity, completeness and professionalism of project report.' },
};

const AI_SUGGESTIONS = {
  innovation:    ['Exceptional novel approach', 'Good creative thinking but lacks originality in execution', 'Standard implementation with limited innovation', 'Similar to existing solutions, minimal novelty'],
  technical:     ['Production-ready code with excellent architecture', 'Solid implementation with minor code quality issues', 'Functional but needs refactoring and testing', 'Core functionality works but significant technical debt'],
  presentation:  ['Outstanding delivery with engaging storytelling', 'Clear and organized with room for improvement', 'Adequate but lacks confidence and preparation', 'Disorganized presentation, difficult to follow'],
  documentation: ['Comprehensive and professionally written report', 'Well-structured with minor gaps', 'Basic documentation, missing key sections', 'Incomplete and lacking required report sections'],
};

function RubricCategory({ categoryKey, data, meta, onScoreChange, onCommentChange, readonly }) {
  const { icon: Icon, color, bg, label, desc } = meta;
  const suggestions = AI_SUGGESTIONS[categoryKey];
  const [showSugg, setShowSugg] = useState(false);

  const scoreColor = data.score >= 80 ? 'text-emerald-600' : data.score >= 60 ? 'text-amber-600' : 'text-red-600';
  const trackColor = data.score >= 80 ? 'accent-emerald-500' : data.score >= 60 ? 'accent-amber-500' : 'accent-red-500';

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800">{label}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight: {data.weight}%</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-4xl font-black ${scoreColor}`}>{data.score}</span>
          <span className="text-slate-300 text-xl">/100</span>
        </div>
      </div>

      {/* Slider */}
      {!readonly && (
        <div className="space-y-1">
          <input
            type="range"
            min="0" max="100" value={data.score}
            onChange={e => onScoreChange(categoryKey, parseInt(e.target.value))}
            className={`w-full h-2 rounded-full cursor-pointer ${trackColor} bg-slate-100 appearance-none`}
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
        </div>
      )}
      {readonly && (
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${data.score >= 80 ? 'bg-emerald-500' : data.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${data.score}%` }}
          />
        </div>
      )}

      {/* Quick score buttons */}
      {!readonly && (
        <div className="flex gap-2 flex-wrap">
          {[0, 50, 60, 70, 80, 90, 100].map(v => (
            <button
              key={v}
              onClick={() => onScoreChange(categoryKey, v)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                data.score === v ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Comment + AI suggestions */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <MessageSquare size={12}/> Feedback
          </label>
          {!readonly && (
            <button
              onClick={() => setShowSugg(v => !v)}
              className="text-[10px] font-bold text-primary-600 flex items-center gap-1 hover:underline"
            >
              <Star size={10}/> {showSugg ? 'Hide' : 'AI Suggestions'}
            </button>
          )}
        </div>

        {showSugg && !readonly && (
          <div className="grid grid-cols-1 gap-1.5 animate-fade-in">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { onCommentChange(categoryKey, s); setShowSugg(false); }}
                className="text-left text-xs p-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors border border-primary-100"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <textarea
            value={data.comment}
            onChange={e => onCommentChange(categoryKey, e.target.value)}
            placeholder={readonly ? 'No feedback provided.' : `Provide detailed feedback on ${label.toLowerCase()}…`}
            readOnly={readonly}
            rows={3}
            className={`field-input w-full p-3 text-sm resize-none rounded-xl ${readonly ? 'bg-slate-50 cursor-default' : ''}`}
          />
          {!readonly && (
            <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">{data.comment.length}/500</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GradeForm() {
  const navigate = useNavigate();
  const { projects, selectedProjectId, saveGrade, user, allUsers } = useApp();
  const project = projects.find(p => p.id === selectedProjectId);
  const student = allUsers.find(u => u.id === project?.studentId);

  const isReadonly = user?.role === 'student' || project?.status === 'graded';

  const [rubric, setRubric]     = useState(project?.rubric || {});
  const [isSaved, setIsSaved]   = useState(false);
  const [activeTab, setActiveTab] = useState('rubric');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (project?.rubric) setRubric(project.rubric);
  }, [project?.id]);

  if (!project) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
      <AlertCircle size={40} className="opacity-30"/>
      <p>Project not found.</p>
      <button onClick={() => navigate('/app/dashboard')} className="btn-secondary text-sm">← Go Back</button>
    </div>
  );

  const calculateTotal = (r) =>
    Object.values(r).reduce((acc, { score, weight }) => acc + score * (weight / 100), 0);

  const total = calculateTotal(rubric);
  const gradeLetter = getGradeLetter(total);
  const badgeCls = getGradeBadgeClass(total);

  const handleScoreChange = (key, value) =>
    setRubric(prev => ({ ...prev, [key]: { ...prev[key], score: value } }));

  const handleCommentChange = (key, value) =>
    setRubric(prev => ({ ...prev, [key]: { ...prev[key], comment: value } }));

  const handleGenerateAIFeedback = async () => {
    setIsGeneratingAI(true);
    try {
      // Prepare scores with names matching seed data
      const scoresArray = Object.entries(rubric).map(([key, data]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        score: data.score,
        comment: data.comment
      }));

      const response = await authFetch(`${API_BASE}/api/grading/${project.id}/ai-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: scoresArray })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (confirm(`${data.feedback}\n\nWould you like to apply this AI-generated summary to the documentation feedback?`)) {
          handleCommentChange('documentation', data.feedback);
        }
      } else {
        alert(data.error || "Failed to generate AI feedback.");
      }
    } catch (err) {
      console.error("AI Error:", err);
      alert("Cannot connect to AI service.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = () => {
    saveGrade(project.id, rubric, parseFloat(total.toFixed(2)));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/app/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group text-sm"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Hero header */}
      <div className="glass-card rounded-2xl p-6 border-l-4 border-primary-500">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded">
                {project.category}
              </span>
              {project.tags?.map(t => (
                <span key={t} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">{t}</span>
              ))}
            </div>
            <h2 className="text-2xl font-black text-slate-900">{project.title}</h2>
            <p className="text-slate-500 text-sm mt-1">
              Student: <span className="font-bold text-slate-700">{student?.name}</span>
              <span className="text-slate-400 mx-2">·</span>
              Submitted: {project.submittedAt}
            </p>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl">{project.description}</p>
            {project.fileUrl && (
              <button 
                onClick={() => window.open(`${API_BASE}/${project.fileUrl.replace(/\\/g, '/')}`, '_blank')}
                className="mt-4 flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                <Download size={18} /> Download Student Submission
              </button>
            )}
          </div>

          {/* Live score gauge */}
          <div className="score-gauge shrink-0">
            <div className="text-center">
              <div className={`text-5xl font-black ${total >= 80 ? 'text-emerald-600' : total >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {total.toFixed(1)}%
              </div>
              <div className={`text-2xl font-black mt-1 px-4 py-1 rounded-xl ${badgeCls}`}>
                Grade: {gradeLetter}
              </div>
              <p className="text-xs text-slate-400 mt-1 mb-4">Weighted Score</p>
              
              <button 
                onClick={() => downloadProjectPDF(project, student, { name: user.name })}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-500/20"
              >
                <FileText size={14} /> Export Grade Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {['rubric', 'peer-reviews', 'overview'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'peer-reviews' ? 'Peer Reviews' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Rubric Tab */}
      {activeTab === 'rubric' && (
        <div className="space-y-4">
          {Object.entries(rubric).map(([key, data]) => (
            <RubricCategory
              key={key}
              categoryKey={key}
              data={data}
              meta={RUBRIC_META[key]}
              onScoreChange={handleScoreChange}
              onCommentChange={handleCommentChange}
              readonly={isReadonly}
            />
          ))}
        </div>
      )}

      {/* Peer Reviews Tab */}
      {activeTab === 'peer-reviews' && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-black text-slate-800">Peer Reviews</h3>
          {project.peerReviews?.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Star size={36} className="mx-auto mb-2 opacity-20" />
              <p>No peer reviews yet.</p>
            </div>
          ) : (
            project.peerReviews.map((rev, i) => {
              const reviewer = allUsers.find(u => u.id === rev.reviewerId);
              return (
                <div key={i} className="p-4 bg-slate-50 rounded-xl flex gap-4 items-start">
                  <div className="avatar-sm shrink-0">{reviewer?.avatar || '?'}</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{reviewer?.name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{rev.comment}</p>
                    <span className={`text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded-full ${getGradeBadgeClass(rev.score)}`}>
                      Score: {rev.score}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-black text-slate-800">Rubric Breakdown</h3>
          {Object.entries(rubric).map(([key, data]) => {
            const meta = RUBRIC_META[key];
            const contribution = (data.score * data.weight / 100).toFixed(1);
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{meta.label}</span>
                  <span className="font-bold text-slate-900">{data.score}/100 × {data.weight}% = <span className="text-primary-600">{contribution}pts</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${data.score}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-lg">
            <span>Total Weighted Score</span>
            <span className={`${total >= 80 ? 'text-emerald-600' : total >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
              {total.toFixed(2)}%  ({gradeLetter})
            </span>
          </div>
        </div>
      )}

      {/* Save footer */}
      {!isReadonly && (
        <div className="flex items-center justify-between p-5 glass-card rounded-2xl border-none bg-amber-50/60">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-bold">Ready to finalise?</p>
              <p className="text-xs mt-0.5 opacity-80">Once saved, the student will be notified and the score recorded officially.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-fade-in">
                <CheckCircle2 size={18}/> Saved!
              </span>
            )}
            <button
              onClick={handleGenerateAIFeedback}
              disabled={isGeneratingAI}
              className="btn-secondary flex items-center gap-2 px-4 py-3 border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              {isGeneratingAI ? <span className="spinner border-primary-500 border-t-primary-700" /> : <Star size={18} className="fill-primary-100" />}
              {isGeneratingAI ? 'Generating...' : 'AI Feedback'}
            </button>
            <button
              id="finalize-grade-btn"
              onClick={handleSave}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Save size={18}/> Finalise Grade
            </button>
          </div>
        </div>
      )}

      {isReadonly && project.status === 'graded' && (
        <div className="flex items-center gap-3 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700">
          <CheckCircle2 size={22} className="shrink-0" />
          <div>
            <p className="font-bold">This project has been graded.</p>
            <p className="text-xs mt-0.5">Final score: <strong>{project.finalScore?.toFixed(2)}%</strong> — Grade {getGradeLetter(project.finalScore)}</p>
          </div>
        </div>
      )}
    </div>
  );
}


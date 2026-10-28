import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Sparkles,
  Upload,
  MessageSquare,
  ThumbsUp,
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { useAuth } from '../context/AuthContext';
import { Expert, ForumPost, ConsultationBooking } from '../types';
import { api } from '../services/api';
import { VoiceReaderButton } from './VoiceReaderButton';

export const ExpertForumView: React.FC = () => {
  const { user } = useAuth();
  const { activeFarm, t } = useFarm();

  const [activeTab, setActiveTab] = useState<'doctor' | 'consult' | 'forum'>('doctor');

  // AI Crop Doctor States
  const [cropName, setCropName] = useState('Mustard (Sarson)');
  const [symptoms, setSymptoms] = useState(
    'Top apical leaves are curling inward with sticky honeydew and white powdery spots. Plants appear slightly stunted.'
  );
  const [previewImage, setPreviewImage] = useState<string>(
    '/src/assets/images/crop_doctor_diagnostic_1793208170133.jpg'
  );
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  // Expert Consultation States
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [consultTopic, setConsultTopic] = useState('Crop Disease & Pest Management');
  const [consultSlot, setConsultSlot] = useState('Today, 4:00 PM - 6:00 PM');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Forum States
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCropTag, setNewCropTag] = useState('Wheat');
  const [replyInput, setReplyInput] = useState<{ [postId: string]: string }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expList, postList] = await Promise.all([api.getExperts(), api.getForumPosts()]);
        setExperts(expList);
        setPosts(postList);
      } catch (err) {
        console.error('Failed to load experts or forum posts:', err);
      }
    };
    loadData();
  }, []);

  // Handle AI Diagnosis
  const handleRunDiagnosis = async () => {
    setIsDiagnosing(true);
    setDiagnosisResult(null);
    try {
      const res = await api.diagnoseCropAI({
        cropName,
        symptoms,
        imageBase64: previewImage.startsWith('data:') ? previewImage : undefined,
        farmContext: `Soil: ${activeFarm?.soilType || 'Alluvial'}, Region: ${activeFarm?.location.state || 'Punjab/Gujarat'}`,
      });
      setDiagnosisResult(res);
    } catch (err) {
      console.error('Diagnosis error:', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Booking
  const handleBookConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert) return;

    setIsBooking(true);
    try {
      const booking = await api.bookConsultation({
        expertId: selectedExpert.id,
        expertName: selectedExpert.name,
        farmTopic: consultTopic,
        cropConcern: symptoms,
        scheduledDate: new Date().toISOString().split('T')[0],
        slotTime: consultSlot,
        farmerName: user?.name || 'Ramesh Patel',
      });
      setBookingSuccess(`Consultation booked with ${selectedExpert.name}! Ref: ${booking.id}`);
      setSelectedExpert(null);
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setIsBooking(false);
    }
  };

  // Handle Forum Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    try {
      const post = await api.createForumPost({
        title: newTitle,
        content: newContent,
        cropTag: newCropTag,
        authorLocation: `${activeFarm?.location.district || 'Anand'}, ${activeFarm?.location.state || 'Gujarat'}`,
      });
      setPosts((prev) => [post, ...prev]);
      setShowPostModal(false);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      const res = await api.upvotePost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, upvotes: res.upvotes } : p))
      );
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handleAddReply = async (postId: string) => {
    const text = replyInput[postId];
    if (!text || !text.trim()) return;

    try {
      const reply = await api.replyForumPost(postId, text);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, replies: [...p.replies, reply] } : p
        )
      );
      setReplyInput((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Error submitting reply:', err);
    }
  };

  const diagnosisSpoken = diagnosisResult
    ? `Diagnosis for ${cropName}: ${diagnosisResult.diagnosis} with ${diagnosisResult.confidenceScore} percent confidence. Severity is ${diagnosisResult.severity}. Root cause: ${diagnosisResult.rootCause}. Recommended immediate action: ${diagnosisResult.immediateAction}. Organic treatment: ${diagnosisResult.organicRemedy}. Chemical treatment: ${diagnosisResult.chemicalRemedy}`
    : '';

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agronomic Diagnostics & Advisory</span>
          <h2 className="text-2xl font-bold text-slate-900">{t('nav_experts')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            AI-driven plant pathology scanner, 1-on-1 certified agronomist consultations, and peer farmer knowledge exchange.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-center">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'doctor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('crop_doctor_title')}</span>
          </button>
          <button
            onClick={() => setActiveTab('consult')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'consult' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Consult Experts</span>
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'forum' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('ask_community')}</span>
          </button>
        </div>
      </div>

      {bookingSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{bookingSuccess}</span>
          </div>
          <button onClick={() => setBookingSuccess(null)} className="text-emerald-700 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Tab 1: AI Crop Doctor */}
      {activeTab === 'doctor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Inputs & Image */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Crop Pathology Scanner</span>
              <h3 className="text-lg font-bold text-slate-900">Upload or Describe Symptoms</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Powered by Gemini AI model with agronomic plant disease models.
              </p>
            </div>

            {/* Image Preview and Upload */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
              <img
                src={previewImage}
                alt="Crop leaf sample"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs font-semibold">Change Leaf Photo</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded">
                Sample Leaf Specimen
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Name</label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Mustard, Wheat, Cotton"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Visual Symptoms Observed</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                placeholder="Describe leaf spots, curling, discoloration, pests, or fungal powder..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
              />
            </div>

            <button
              onClick={handleRunDiagnosis}
              disabled={isDiagnosing}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{isDiagnosing ? 'Analyzing Plant Tissue & Spores...' : t('analyze_now')}</span>
            </button>
          </div>

          {/* Right Area: Results Card */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Diagnostic Findings</h3>
                <p className="text-xs text-slate-500">Comprehensive plant disease pathology report</p>
              </div>
              {diagnosisResult && <VoiceReaderButton textToRead={diagnosisSpoken} />}
            </div>

            {diagnosisResult ? (
              <div className="space-y-4 text-xs">
                {/* Header score strip */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Identified Condition</span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{diagnosisResult.diagnosis}</h4>
                    <span className="text-slate-500 text-[11px]">Classification: {diagnosisResult.pathogenType}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Confidence</span>
                    <span className="text-xl font-bold font-mono text-emerald-700">{diagnosisResult.confidenceScore}%</span>
                    <span className="block text-[10px] text-rose-700 font-bold uppercase">{diagnosisResult.severity} Severity</span>
                  </div>
                </div>

                {/* Root Cause & Immediate Action */}
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg">
                    <span className="font-semibold text-amber-950 block mb-0.5">⚠️ Immediate Action Needed Today:</span>
                    <p className="text-slate-800 leading-relaxed">{diagnosisResult.immediateAction}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-900 block mb-0.5">Trigger Condition & Root Cause:</span>
                    <p className="text-slate-700 leading-relaxed">{diagnosisResult.rootCause}</p>
                  </div>
                </div>

                {/* Organic vs Chemical Remedies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg space-y-1">
                    <span className="font-bold text-emerald-950 block">🌿 Bio / Organic Remedy</span>
                    <p className="text-slate-700 leading-relaxed">{diagnosisResult.organicRemedy}</p>
                  </div>

                  <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-lg space-y-1">
                    <span className="font-bold text-indigo-950 block">🧪 Chemical Recommendation</span>
                    <p className="text-slate-700 leading-relaxed">{diagnosisResult.chemicalRemedy}</p>
                  </div>
                </div>

                {/* Preventive Advice */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-0.5">Long-Term Preventive Agronomy:</span>
                  <p className="text-slate-600 leading-relaxed">{diagnosisResult.preventiveAdvice}</p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs space-y-2">
                <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Click "Diagnose Plant Health" to run AI inspection on the leaf specimen.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Agronomist Consultations */}
      {activeTab === 'consult' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {experts.map((exp) => (
              <div key={exp.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{exp.name}</h3>
                      <p className="text-xs text-emerald-700 font-medium">{exp.designation}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{exp.organization}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ★ {exp.rating}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
                    <div>
                      <strong className="text-slate-900">Specialization:</strong> {exp.specialization}
                    </div>
                    <div>
                      <strong className="text-slate-900">Experience:</strong> {exp.experienceYears} Years
                    </div>
                    <div>
                      <strong className="text-slate-900">Languages:</strong> {exp.languages.join(', ')}
                    </div>
                    <div>
                      <strong className="text-slate-900">Next Slot:</strong> {exp.availableSlot}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">{exp.fee}</span>
                  <button
                    onClick={() => setSelectedExpert(exp)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Modal */}
          {selectedExpert && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Book Agronomist Session</h3>
                    <p className="text-xs text-emerald-700">{selectedExpert.name}</p>
                  </div>
                  <button onClick={() => setSelectedExpert(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleBookConsultation} className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Consultation Topic</label>
                    <select
                      value={consultTopic}
                      onChange={(e) => setConsultTopic(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="Crop Disease & Pest Management">Crop Disease & Pest Management</option>
                      <option value="Soil Health & Fertilizer Prescription">Soil Health & Fertilizer Prescription</option>
                      <option value="Micro-irrigation & Drip Scheduling">Micro-irrigation & Drip Scheduling</option>
                      <option value="Organic Certification Guidance">Organic Certification Guidance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Available Appointment Window</label>
                    <select
                      value={consultSlot}
                      onChange={(e) => setConsultSlot(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="Today, 4:00 PM - 4:30 PM">Today, 4:00 PM - 4:30 PM</option>
                      <option value="Tomorrow, 10:00 AM - 10:30 AM">Tomorrow, 10:00 AM - 10:30 AM</option>
                      <option value="Tomorrow, 2:30 PM - 3:00 PM">Tomorrow, 2:30 PM - 3:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Key Concern or Symptoms</label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedExpert(null)}
                      className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isBooking}
                      className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                    >
                      {isBooking ? 'Confirming...' : 'Confirm Consultation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Farmer Community Q&A Forum */}
      {activeTab === 'forum' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('ask_community')}</h3>
              <p className="text-xs text-slate-500">Ask fellow farmers and certified researchers</p>
            </div>

            <button
              onClick={() => setShowPostModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t('post_question')}</span>
            </button>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{post.authorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.authorLocation}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium ml-1">
                        {post.cropTag}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mt-1">{post.title}</h4>
                  </div>

                  <button
                    onClick={() => handleUpvote(post.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono font-bold">{post.upvotes}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  {post.content}
                </p>

                {/* Replies Feed */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-slate-500 block">
                    Replies ({post.replies.length})
                  </span>

                  {post.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        reply.isVerifiedExpert
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{reply.authorName}</span>
                          {reply.isVerifiedExpert && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              {t('verified_expert')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={replyInput[post.id] || ''}
                    onChange={(e) => setReplyInput({ ...replyInput, [post.id]: e.target.value })}
                    placeholder="Provide advice or experience to fellow farmer..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddReply(post.id);
                    }}
                  />
                  <button
                    onClick={() => handleAddReply(post.id)}
                    className="p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New Question Modal */}
          {showPostModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">{t('post_question')}</h3>
                  <button onClick={() => setShowPostModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreatePost} className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Crop / Category Tag</label>
                    <input
                      type="text"
                      required
                      value={newCropTag}
                      onChange={(e) => setNewCropTag(e.target.value)}
                      placeholder="e.g. Wheat, Mustard, Soil Fertility, Drip"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Question Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. What is the best remedy for early blight in potatoes?"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Detailed Situation</label>
                    <textarea
                      required
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={4}
                      placeholder="Include details on soil moisture, weather conditions, days since sowing..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                    >
                      Publish Question
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

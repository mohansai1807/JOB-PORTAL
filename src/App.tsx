import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  LogOut, 
  Plus, 
  FileText, 
  CheckCircle, 
  XCircle, 
  LayoutDashboard, 
  Building2, 
  ChevronRight,
  Filter,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react';
import { api, User as UserType, Job, Application } from './lib/api';

// --- Shared Components ---

const Navbar = ({ user, onLogout }: { user: UserType | null; onLogout: () => void }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              CareerLink
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Find Jobs</Link>
            {user?.role === 'employee' && (
              <Link to="/employee/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Dashboard</Link>
            )}
            {user?.role === 'fresher' && (
              <Link to="/fresher/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">My Applications</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Admin Panel</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <User className="w-4 h-4 text-indigo-500" />
                  <span>{user.name}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-100 transition-all active:scale-95"
                >
                  Post a Job
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- View Components ---

const Home = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.jobs.list({ search, location });
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [search, location]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative bg-indigo-600 pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight"
            >
              Your Dream Career <br className="hidden md:block" />
              Starts <span className="text-indigo-200">Right Here</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-indigo-100 max-w-2xl mx-auto"
            >
              Join thousands of job seekers and employers in the most efficient job market. 
              Find opportunities tailored match your skills and experience.
            </motion.p>
          </div>

          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-indigo-900/10 flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 flex items-center px-4 gap-3 bg-gray-50 rounded-xl border border-transparent focus-within:border-indigo-200 transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or company" 
                className="w-full py-4 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                defaultValue={search}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchParams({ search: e.currentTarget.value, location });
                  }
                }}
              />
            </div>
            <div className="flex-1 flex items-center px-4 gap-3 bg-gray-50 rounded-xl border border-transparent focus-within:border-indigo-200 transition-colors">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="City or state" 
                className="w-full py-4 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                defaultValue={location}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchParams({ search, location: e.currentTarget.value });
                  }
                }}
              />
            </div>
            <button 
              onClick={() => {
                const inputs = document.querySelectorAll('input');
                setSearchParams({ search: inputs[0].value, location: inputs[1].value });
              }}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-600/30 active:scale-95"
            >
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Jobs Posted', value: '12K+', icon: Briefcase },
            { label: 'Companies', value: '450+', icon: Building2 },
            { label: 'Candidates', value: '80K+', icon: Users },
            { label: 'Placements', value: '5K+', icon: CheckCircle },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                <stat.icon size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Job Listings */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-gray-500">Based on your searching history</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 border border-gray-200 rounded-lg hover:bg-white transition-all">
            <Filter size={16} /> Filters
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search filters or browse other categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link 
                  to={`/jobs/${job.id}`}
                  className="group block bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <Building2 className="w-6 h-6 text-indigo-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-100">
                      Full Time
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                    {job.title}
                  </h3>
                  <div className="text-sm text-gray-500 font-medium mb-4">{job.employer_name}</div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mb-6">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-indigo-400" /> {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-indigo-400" /> Just posted
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="text-lg font-bold text-gray-900">
                      {job.salary} <span className="text-sm font-normal text-gray-400">/ mo</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      const data = await api.jobs.get(Number(id));
      setJob(data);
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return alert('Please upload a resume');
    setSubmitting(true);
    const formData = new FormData();
    formData.append('job_id', id!);
    formData.append('resume', resume);

    try {
      const resp = await api.applications.apply(formData);
      if (resp.error) throw new Error(resp.error);
      alert('Application successful!');
      setShowApplyModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return <div className="p-20 text-center">Loading job details...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8">
          <ChevronRight size={18} className="rotate-180" /> Back to listings
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-indigo-600 p-8 pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-white mb-2">{job.title}</h1>
                  <p className="text-indigo-100 font-medium">{job.employer_name} • {job.location}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowApplyModal(true)}
                className="w-full md:w-auto px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-white/20 transition-all active:scale-95"
              >
                Apply for this job
              </button>
            </div>
          </div>

          <div className="p-8 -mt-8 relative bg-white rounded-t-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Salary</div>
                <div className="text-lg font-bold text-gray-900">{job.salary}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Experience</div>
                <div className="text-lg font-bold text-gray-900">{job.experience}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Location</div>
                <div className="text-lg font-bold text-gray-900">{job.location}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Posted</div>
                <div className="text-lg font-bold text-gray-900">New</div>
              </div>
            </div>

            <div className="prose prose-indigo max-w-none">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApplyModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for {job.title}</h2>
                <p className="text-gray-500 mb-8">Tell {job.employer_name} why you're a great fit!</p>

                <form onSubmit={handleApply} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Upload Resume (PDF/DOC)</label>
                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 transition-colors hover:border-indigo-300 group">
                      <input 
                        type="file" 
                        required
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setResume(e.target.files?.[0] || null)}
                      />
                      <div className="text-center">
                        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2 group-hover:text-indigo-400" />
                        <p className="text-sm text-gray-500">
                          {resume ? resume.name : "Click to select or drag and drop"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Send Application'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmployeeDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchJobs = async () => {
      const data = await api.jobs.list({ employer_id: user?.id });
      setJobs(data.filter((j: any) => j.employer_id === user?.id));
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const handleDeleteJob = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    await api.jobs.delete(id);
    setJobs(jobs.filter(j => j.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Employer Dashboard</h1>
            <p className="text-gray-500 font-medium">Manage your job listings and applicants</p>
          </div>
          <Link 
            to="/employee/jobs/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} /> Post New Job
          </Link>
        </div>

        {loading ? (
          <div>Loading dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-200">
                <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">No jobs posted yet</h2>
                <p className="text-gray-500 mb-6">Start by posting your first job opening to find great talent.</p>
                <Link to="/employee/jobs/new" className="text-indigo-600 font-bold hover:underline">Post a job now &rarr;</Link>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5"><MapPin size={16} /> {job.location}</span>
                        <span className="flex items-center gap-1.5"><Clock size={16} /> Created on {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link 
                        to={`/employee/jobs/${job.id}/applicants`}
                        className="px-6 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        View Applicants
                      </Link>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <LogOut size={20} className="rotate-90" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', location: '', experience: '', salary: ''
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const backLink = user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.jobs.create(formData);
    navigate(backLink);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link to={backLink} className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8">
          <ChevronRight size={18} className="rotate-180" /> Back to dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Post a Job Opening</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Job Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Senior Product Designer"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Category</label>
                <select 
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Location</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Remote or San Francisco, CA"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Expected Salary</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. $80k - $120k"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Experience Level</label>
              <input 
                type="text" 
                required
                placeholder="e.g. 3+ years, Mid-level"
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Job Description</label>
              <textarea 
                required
                rows={6}
                placeholder="Describe the role, responsibilities, and requirements..."
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Post Job Listing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ViewApplicants = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const jobData = await api.jobs.get(Number(id));
      const applicantsData = await api.applications.getByJob(Number(id));
      setJob(jobData);
      setApplicants(applicantsData);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleStatusUpdate = async (appId: number, status: string) => {
    await api.applications.updateStatus(appId, status);
    setApplicants(applicants.map(a => a.id === appId ? { ...a, status: status as any } : a));
  };

  if (loading) return <div className="p-20 text-center">Loading applicants...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link to="/employee/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8">
          <ChevronRight size={18} className="rotate-180" /> Back to dashboard
        </Link>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Applications</h1>
            <p className="text-gray-500 font-medium">For {job.title} at {job.location}</p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-100">
            {applicants.length} Total Applicants
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {applicants.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-200">
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800">No applicants yet</h2>
              <p className="text-gray-500">Applications will appear here once candidates apply.</p>
            </div>
          ) : (
            applicants.map((app) => (
              <div key={app.id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {app.applicant_name?.[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-0.5">{app.applicant_name}</h3>
                      <p className="text-gray-500 font-medium">{app.applicant_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                    <a 
                      href={`/api${app.resume_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 border border-gray-100 text-center flex items-center justify-center gap-2"
                    >
                      <FileText size={18} /> View Resume
                    </a>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                        disabled={app.status === 'shortlisted'}
                        className={`flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          app.status === 'shortlisted' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                        }`}
                      >
                        <CheckCircle size={18} /> Shortlist
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'rejected')}
                        disabled={app.status === 'rejected'}
                        className={`flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          app.status === 'rejected' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                        }`}
                      >
                        <XCircle size={18} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const FresherDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const data = await api.applications.getMy();
      setApplications(data);
      setLoading(false);
    };
    fetchApps();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">My Applications</h1>
        <p className="text-gray-500 font-medium mb-12">Track the status of all your job applications</p>

        {loading ? (
          <div>Loading your applications...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.length === 0 ? (
              <div className="col-span-full bg-white p-20 text-center rounded-3xl border border-dashed border-gray-200">
                <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">You haven't applied yet</h2>
                <p className="text-gray-500 mb-8">Ready to take the next step in your career?</p>
                <Link to="/" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                    <Building2 className="text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{app.job_title}</h3>
                  <p className="text-gray-500 font-medium mb-4">{app.employer_name}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      app.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-indigo-50 text-indigo-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          api.admin.getStats(),
          api.admin.getUsers()
        ]);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateRole = async (id: number, role: string) => {
    await api.admin.updateUserRole(id, role);
    setUsers(users.map(u => u.id === id ? { ...u, role: role as any } : u));
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const resp = await api.admin.deleteUser(id);
    if (resp.error) return alert(resp.error);
    setUsers(users.filter(u => u.id !== id));
  };

  if (loading || !stats) return <div className="p-20 text-center text-indigo-600 font-bold">Initializing Admin Workspace...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">System Administration</h1>
            <p className="text-gray-500 font-medium">Control panel for platform-wide management and monitoring</p>
          </div>
          <Link 
            to="/employee/jobs/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} /> Post New Job
          </Link>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { label: 'Registered Users', value: stats.users, icon: User, color: 'bg-indigo-600', shadow: 'shadow-indigo-100' },
            { label: 'Active Job Postings', value: stats.jobs, icon: Briefcase, color: 'bg-emerald-600', shadow: 'shadow-emerald-100' },
            { label: 'Total Applications', value: stats.applications, icon: FileText, color: 'bg-violet-600', shadow: 'shadow-violet-100' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6"
            >
              <div className={`w-16 h-16 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-xl ${stat.shadow}`}>
                <stat.icon size={32} />
              </div>
              <div>
                <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">{stat.label}</div>
                <div className="text-3xl font-black text-gray-900">{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-500 font-medium">Manage user accounts and roles across the platform</p>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-bold text-gray-600">
              {users.length} Users Found
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">User info</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Access Level</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 border-b border-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                          {u.name[0]}
                        </div>
                        <span className="font-bold text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 border-b border-gray-50">
                      <span className="text-sm text-gray-500 font-medium">{u.email}</span>
                    </td>
                    <td className="px-8 py-5 border-b border-gray-50">
                      <select 
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 outline-none focus:border-indigo-500 transition-all"
                      >
                        <option value="fresher">Fresher</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 border-b border-gray-50 text-right">
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete User"
                      >
                        <XCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs Placeholder */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" /> Platform Growth
            </h3>
            <div className="h-40 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400 font-medium">
              Analytics graph will be rendered here
            </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LayoutDashboard size={20} className="text-emerald-500" /> Recent Actions
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-gray-500 font-medium">New job posited by Tech Corp</span>
                  <span className="text-gray-300 ml-auto">2h ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Auth = ({ mode }: { mode: 'login' | 'register' }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'fresher' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        const { token, user } = await api.auth.login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/';
      } else {
        await api.auth.register(formData);
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-50"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Briefcase size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-gray-500">
            {mode === 'login' ? 'Continue your career journey' : 'Join CareerLink to find your next goal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Register As</label>
              <div className="grid grid-cols-2 gap-4">
                {['fresher', 'employee'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({...formData, role: role as any})}
                    className={`py-3 rounded-xl font-bold border-2 transition-all ${
                      formData.role === role 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link 
              to={mode === 'login' ? '/register' : '/login'}
              className="text-indigo-600 font-bold hover:underline"
            >
              {mode === 'login' ? 'Register here' : 'Login here'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            
            {/* Role Protected Routes */}
            <Route path="/fresher/dashboard" element={<FresherDashboard />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/jobs/new" element={<CreateJob />} />
            <Route path="/employee/jobs/:id/applicants" element={<ViewApplicants />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>

        <footer className="bg-gray-900 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CareerLink</span>
            </div>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Connecting talented professionals with world-class companies. 
              The future of hiring is here.
            </p>
            <div className="text-gray-500 text-sm border-t border-gray-800 pt-8">
              &copy; {new Date().getFullYear()} CareerLink Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

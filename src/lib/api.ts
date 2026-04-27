const API_BASE = '/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'fresher' | 'employee' | 'admin';
}

export interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  experience: string;
  salary: string;
  employer_id: number;
  employer_name: string;
  created_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  user_id: number;
  resume_url: string;
  status: 'applied' | 'shortlisted' | 'rejected';
  applied_at: string;
  job_title?: string;
  employer_name?: string;
  applicant_name?: string;
  applicant_email?: string;
}

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    login: async (credentials: any) => {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!resp.ok) throw new Error(await resp.text());
      return resp.json();
    },
    register: async (data: any) => {
      const resp = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!resp.ok) throw new Error(await resp.text());
      return resp.json();
    },
  },
  jobs: {
    list: async (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      const resp = await fetch(`${API_BASE}/jobs?${query}`);
      return resp.json();
    },
    get: async (id: number) => {
      const resp = await fetch(`${API_BASE}/jobs/${id}`);
      return resp.json();
    },
    create: async (data: any) => {
      const resp = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return resp.json();
    },
    update: async (id: number, data: any) => {
      const resp = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return resp.json();
    },
    delete: async (id: number) => {
      const resp = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return resp.json();
    },
  },
  applications: {
    apply: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      return resp.json();
    },
    getMy: async () => {
      const resp = await fetch(`${API_BASE}/applications/my`, {
        headers: getHeaders(),
      });
      return resp.json();
    },
    getByJob: async (jobId: number) => {
      const resp = await fetch(`${API_BASE}/applications/job/${jobId}`, {
        headers: getHeaders(),
      });
      return resp.json();
    },
    updateStatus: async (id: number, status: string) => {
      const resp = await fetch(`${API_BASE}/applications/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return resp.json();
    },
  },
  admin: {
    getStats: async () => {
      const resp = await fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders(),
      });
      return resp.json();
    },
    getUsers: async () => {
      const resp = await fetch(`${API_BASE}/admin/users`, {
        headers: getHeaders(),
      });
      return resp.json();
    },
    updateUserRole: async (id: number, role: string) => {
      const resp = await fetch(`${API_BASE}/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ role }),
      });
      return resp.json();
    },
    deleteUser: async (id: number) => {
      const resp = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return resp.json();
    },
  },
};

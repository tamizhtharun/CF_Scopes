import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_company: '',
    project_name: '',
    project_description: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Get or Create Company
      let { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) {
        // Auto-create company
        const { data: newCompany, error: createCompanyError } = await supabase
          .from('companies')
          .insert({
            owner_id: user.id,
            name: `${formData.client_company || 'My'} Workspace`
          })
          .select('id')
          .single();
          
        if (createCompanyError) throw createCompanyError;
        company = newCompany;
      }

      // 2. Create Project
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          company_id: company.id,
          ...formData
        });

      if (projectError) throw projectError;
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Project</h1>
        <p className="text-muted-foreground mt-2">Enter the client details to start scoping.</p>
      </div>

      <div className="bg-card text-card-foreground shadow-sm rounded-xl border border-border p-6">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Client Name
              </label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Client Email
              </label>
              <input
                type="email"
                name="client_email"
                value={formData.client_email}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Client Company
            </label>
            <input
              type="text"
              name="client_company"
              value={formData.client_company}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="h-px bg-border my-6"></div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project Name
            </label>
            <input
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project Description
            </label>
            <textarea
              name="project_description"
              value={formData.project_description}
              onChange={handleChange}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 w-full md:w-auto min-w-[140px] gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                    <Save className="w-4 h-4" />
                    Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

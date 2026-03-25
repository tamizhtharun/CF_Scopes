import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, LogOut, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || 'User');
      } else {
        navigate('/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shadow-sm z-10 text-sidebar-foreground">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 font-bold text-xl text-sidebar-primary">
            <div className="bg-sidebar-primary p-1.5 rounded-lg">
                <FileText className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span>ScopeAI</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">Menu</div>
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all ${
              isActive('/') 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${isActive('/') ? 'text-sidebar-primary' : 'text-muted-foreground'}`} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/new-project"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all ${
              isActive('/new-project') 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <Plus className={`w-5 h-5 ${isActive('/new-project') ? 'text-sidebar-primary' : 'text-muted-foreground'}`} />
            <span>New Project</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-sidebar-border bg-sidebar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                    {userEmail?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm truncate max-w-[120px] text-foreground font-medium" title={userEmail || ''}>
                {userEmail}
                </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="container py-8 max-w-7xl mx-auto px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

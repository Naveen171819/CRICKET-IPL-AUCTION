import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      navigate('/lobby');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container flex items-center justify-center flex-col" style={{ minHeight: '100vh', padding: '20px' }}>
      <h1 className="mb-4" style={{ fontSize: '32px' }}>IPL Mega Auction</h1>
      <div className="glass-panel w-full" style={{ maxWidth: '400px' }}>
        <h2 className="mb-6" style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center', padding: '10px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '14px', fontSize: '1.1rem' }}>
            {isLogin ? 'Login to Auction' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', marginLeft: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

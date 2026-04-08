import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Lobby() {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const [showOngoingPrompt, setShowOngoingPrompt] = useState(false);
  const [pendingMode, setPendingMode] = useState('');

  const checkOngoing = (mode: string) => {
    if (localStorage.getItem('auctionRoomId')) {
       setPendingMode(mode);
       setShowOngoingPrompt(true);
    } else {
       createRoom(mode);
    }
  };

  const createRoom = async (mode: string) => {
    try {
      localStorage.removeItem('auctionRoomId');
      localStorage.removeItem('auctionRole');
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, mode })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('auctionRoomId', data.roomId);
        localStorage.setItem('auctionMode', mode);
        navigate('/teams');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };


  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!roomId) return;
    
    try {
      const res = await fetch(`/api/room/${roomId.toUpperCase()}`);
      const data = await res.json();
      
      if (data.exists) {
        localStorage.setItem('auctionRoomId', roomId.toUpperCase());
        localStorage.setItem('auctionMode', 'GROUP');
        navigate('/teams');
      } else {
        setError('Room not found! Check the room ID and try again.');
      }
    } catch (err: any) {
      setError('Could not connect to server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('auctionRoomId');
    localStorage.removeItem('auctionRole');
    localStorage.removeItem('auctionMode');
    navigate('/');
  };

  return (
    <>
    {showOngoingPrompt && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '16px' }}>Ongoing Auction Found!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {localStorage.getItem('auctionMode') === pendingMode 
              ? `You already have an active ${pendingMode} auction in progress. Do you want to jump back in or discard it to start a new one?`
              : `You currently have an active ${localStorage.getItem('auctionMode') || 'auction'} in progress. If you start a new ${pendingMode} match, your existing match will be permanently discarded.`}
          </p>
          <div className="flex flex-col gap-3">
             {localStorage.getItem('auctionMode') === pendingMode && (
                <button className="btn btn-success" onClick={() => navigate(localStorage.getItem('auctionRole') ? '/dashboard' : '/teams')}>
                  Resume {pendingMode} Auction
                </button>
             )}
             
             {localStorage.getItem('auctionMode') !== pendingMode && (
                <button className="btn btn-success" onClick={() => { setShowOngoingPrompt(false); navigate(localStorage.getItem('auctionRole') ? '/dashboard' : '/teams'); }}>
                  Return to Active {localStorage.getItem('auctionMode')}
                </button>
             )}
             
             <button className="btn btn-danger" onClick={() => { setShowOngoingPrompt(false); createRoom(pendingMode); }}>
               Discard Old & Start New {pendingMode}
             </button>
             
             <button className="btn" onClick={() => setShowOngoingPrompt(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}
    
    <div className="container flex items-center justify-center flex-col" style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Logged in as <b style={{color: 'var(--text-primary)'}}>{username}</b></span>
        <button className="btn" style={{ background: 'rgba(255,0,0,0.2)', border: '1px solid var(--danger)' }} onClick={handleLogout}>Logout</button>
      </div>

      <h1 className="mb-4" style={{ fontSize: '40px' }}>Auction Lobby</h1>
      <p className="mb-10 text-center" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px' }}>
        Create a new auction room to play with friends, or enter a Room ID to join an existing auction. Unclaimed teams will be played by AI!
      </p>

      {error && <div style={{ width: '100%', maxWidth: '800px', color: 'var(--danger)', marginBottom: '16px', textAlign: 'center', padding: '12px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '100%', maxWidth: '1000px' }}>
        
        {/* Play Solo */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Play Solo</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', flexGrow: 1 }}>
            Jump right in against 9 AI franchises. Fast-paced, no waiting!
          </p>
          <button className="btn" style={{ width: '100%', padding: '16px', fontSize: '1.2rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => checkOngoing('SOLO')}>
            Start Solo Match
          </button>
        </div>
        
        {/* Create Room */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ color: 'var(--accent)' }}>Host an Auction</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', flexGrow: 1 }}>
            Start a fresh IPL Mega Auction. You will get a Room ID that you can share with your friends so they can grab the other teams!
          </p>
          <button className="btn btn-primary animate-pulse-slow" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }} onClick={() => checkOngoing('GROUP')}>
            Create New Room
          </button>
        </div>

        {/* Join Room */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ color: 'var(--success)' }}>Join an Auction</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Enter a Room ID shared by your friend to join their auction and compete for players!
          </p>
          <form onSubmit={handleJoinRoom} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, justifyContent: 'flex-end' }}>
            <input 
              type="text" 
              placeholder="Enter Room ID (e.g. A3X91B)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'bold' }}
            />
            <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
              Join Room
            </button>
          </form>
        </div>

      </div>
    </div>
    </>
  );
}

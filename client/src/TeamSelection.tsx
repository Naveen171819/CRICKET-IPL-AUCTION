import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from './socket';

export default function TeamSelection() {
  const [teams, setTeams] = useState<any[]>([]);
  const [connectedHumans, setConnectedHumans] = useState<string[]>([]);
  const [auctionStatus, setAuctionStatus] = useState<string>('WAITING');
  const navigate = useNavigate();
  const roomId = localStorage.getItem('auctionRoomId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!roomId || !username) {
      navigate('/');
      return;
    }

    // Join the specific auction room
    socket.emit('join-room', roomId);

    const handleAuctionState = (state: any) => {
      setTeams(state.teams);
      setAuctionStatus(state.auctionState.status);
      setConnectedHumans(state.connectedHumans || []);
    };

    socket.on('auction-state', handleAuctionState);
    
    return () => {
      socket.off('auction-state', handleAuctionState);
    };
  }, [roomId, username, navigate]);

  const handleSelectTeam = (teamId: string) => {
    const currentRole = localStorage.getItem('auctionRole');
    
    // If they already have a team, ONLY let them click their existing team
    if (currentRole && currentRole !== teamId) return;
    
    // If it's claimed by someone else
    if (connectedHumans.includes(teamId) && currentRole !== teamId) return;

    socket.emit('join-team', { roomId, teamId });
    localStorage.setItem('auctionRole', teamId);
    navigate('/dashboard');
  };

  const handleCopyRoomId = () => {
    if(roomId) {
      navigator.clipboard.writeText(roomId);
      alert('Room ID copied to clipboard!');
    }
  };

  return (
    <div className="container flex items-center justify-center flex-col" style={{ minHeight: '100vh', padding: '20px' }}>
      
      <div style={{ position: 'absolute', top: 20, right: 20, textAlign: 'right' }}>
        <div style={{ color: 'var(--text-muted)' }}>Logged in as <b style={{color: 'var(--text-primary)'}}>{username}</b></div>
        <button 
           className="btn" 
           style={{ background: 'none', border: '1px solid #555', marginTop: '8px', fontSize: '0.9rem', padding: '4px 12px' }} 
           onClick={() => { localStorage.removeItem('auctionRoomId'); navigate('/lobby'); }}
        >
          Leave Room
        </button>
      </div>

      <div className="mb-6" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>IPL Mega Auction</h1>
        <div 
          onClick={handleCopyRoomId}
          style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '8px 24px', borderRadius: '100px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Room ID:</span>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '2px' }}>{roomId}</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: '12px', fontSize: '0.8rem' }}>(🔗 Click to Copy)</span>
        </div>
      </div>
      
      <div className="glass-panel w-full" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <h2 style={{ color: 'var(--text-primary)' }}>Select Your Franchise</h2>
           {auctionStatus !== 'WAITING' && auctionStatus !== 'AUCTION_FINISHED' && (
             <div style={{ color: 'var(--accent)', fontWeight: 'bold', background: 'rgba(255, 130, 42, 0.2)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--accent)' }}>
               Auction is currently IN PROGRESS!
             </div>
           )}
        </div>
        
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
          Grab your team before someone else does! Unclaimed teams will actively bid against you as AI bots once the host starts the auction.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px' }}>
          {teams.map(team => {
            const myCurrentRole = localStorage.getItem('auctionRole');
            const isMine = myCurrentRole === team.id;
            const isClaimedByOther = connectedHumans.includes(team.id) && !isMine;
            
            return (
              <div 
                key={team.id}
                onClick={() => handleSelectTeam(team.id)}
                style={{
                  background: isClaimedByOther ? 'rgba(0,0,0,0.6)' : (isMine ? 'rgba(0,100,0,0.3)' : 'rgba(0,0,0,0.3)'),
                  border: `2px solid ${isClaimedByOther ? '#555' : team.color}`,
                  borderRadius: '12px',
                  padding: '16px 8px',
                  textAlign: 'center',
                  cursor: isClaimedByOther ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  opacity: isClaimedByOther ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if(!isClaimedByOther) e.currentTarget.style.transform = 'scale(1.05)' }}
                onMouseLeave={(e) => { if(!isClaimedByOther) e.currentTarget.style.transform = 'scale(1)' }}
              >
                {team.logo && (
                  <img src={team.logo} alt={team.name} style={{ width: '64px', height: '64px', borderRadius: '50%', filter: isClaimedByOther ? 'grayscale(100%)' : 'none' }} />
                )}
                
                <div style={{ color: isClaimedByOther ? '#888' : team.color, fontWeight: 'bold', fontSize: '20px' }}>
                   {team.shortName}
                </div>
                
                <div style={{ fontSize: '12px', color: isClaimedByOther ? '#888' : '#fff' }}>{team.name}</div>
                
                {isClaimedByOther && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', background: 'var(--danger)', color: '#fff', padding: '4px 12px', fontWeight: 'bold', borderRadius: '4px', border: '2px solid #000', zIndex: 10 }}>
                    CLAIMED
                  </div>
                )}
                
                {isMine && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-10deg)', background: 'var(--success)', color: '#fff', padding: '4px 12px', fontWeight: 'bold', borderRadius: '4px', border: '2px solid #000', zIndex: 10 }}>
                    YOUR TEAM
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

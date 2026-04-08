import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from './socket';

export default function Dashboard() {
  const [state, setState] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const toggleRow = (id: string) => {
      setExpandedRow(prev => prev === id ? null : id);
  };
  const roomId = localStorage.getItem('auctionRoomId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const savedRole = localStorage.getItem('auctionRole');
    if (!savedRole || !roomId || !username) {
      navigate('/');
      return;
    }
    setRole(savedRole);
    
    // Ensure the backend knows we represent this room and team
    socket.emit('join-room', roomId);
    socket.emit('join-team', { roomId, teamId: savedRole });

    socket.on('auction-state', (data) => {
      setState(data);
    });

    socket.emit('request-state', roomId);

    return () => {
      socket.emit('leave-team', { roomId, teamId: savedRole });
      socket.off('auction-state');
    };
  }, [navigate, roomId, username]);

  if (!state) return <div className="container">Loading auction data...</div>;

  const { teams, auctionState, activeList, activePlayer, mode } = state;
  const myTeam = teams.find((t: any) => t.id === role);

  const highestBidderName = auctionState.highestBidderId 
    ? teams.find((t: any) => t.id === auctionState.highestBidderId)?.name 
    : 'None';

  return (
    <div className="container" style={{ padding: '20px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, textAlign: 'right' }}>
        <div style={{ color: 'var(--text-muted)' }}>Room: <b style={{color: 'var(--accent)'}}>{roomId}</b> ({mode} Mode) | User: <b style={{color: 'var(--text-primary)'}}>{username}</b></div>
      </div>

      {/* Modal for Current List Viewer */}
      {showPlayerList && activeList && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
             <div className="flex justify-between items-center mb-6">
                <h2 style={{ color: 'var(--accent)' }}>Current Set: {activeList.name}</h2>
                <button className="btn" style={{ background: 'var(--danger)', padding: '8px 16px' }} onClick={() => setShowPlayerList(false)}>Close</button>
             </div>
             
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                   <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Player Name</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Base Price</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Bought By</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Runner Up</th>
                   </tr>
                </thead>
                <tbody>
                   {activeList.players.map((p: any) => {
                      const buyerTeam = p.soldTo ? teams.find((t:any) => t.id === p.soldTo) : null;
                      const runnerUpTeam = p.runnerUpTeamId ? teams.find((t:any) => t.id === p.runnerUpTeamId) : null;
                      const hasHistory = p.biddingHistory && p.biddingHistory.length > 0;
                      
                      let statusEl = <span style={{ color: 'var(--text-muted)' }}>Pending</span>;
                      if (p.isSold) {
                          statusEl = <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Sold for ₹{p.soldPrice}L</span>;
                      } else if (p.soldPrice === null && auctionState.activePlayerIndex > activeList.players.findIndex((x:any)=>x.id===p.id)) {
                          // Already passed this index and not sold -> unsold
                          statusEl = <span style={{ color: 'var(--danger)' }}>Unsold</span>;
                      } else if (p.soldPrice === null && auctionState.activePlayerIndex === -1 && auctionState.status === 'LIST_FINISHED') {
                          statusEl = <span style={{ color: 'var(--danger)' }}>Unsold</span>;
                      }

                      return (
                        <div key={p.id} style={{ display: 'contents' }}>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: hasHistory ? 'pointer' : 'default', background: expandedRow === p.id ? 'rgba(255,255,255,0.05)' : 'transparent' }} onClick={() => hasHistory && toggleRow(p.id)}>
                             <td style={{ padding: '12px', fontWeight: 'bold' }}>
                               {p.name} {p.isForeign ? '✈️' : ''} 
                               <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--accent)' }}>{p.role}</span>
                               {hasHistory && (
                                   <span style={{ fontSize: '10px', marginLeft: '8px', opacity: 0.7 }}>
                                       {expandedRow === p.id ? '🔽' : '▶️'}
                                   </span>
                               )}
                             </td>
                             <td style={{ padding: '12px' }}>₹{p.basePrice}L</td>
                             <td style={{ padding: '12px' }}>{statusEl}</td>
                             <td style={{ padding: '12px' }}>
                                 {buyerTeam ? (
                                     <span style={{ color: buyerTeam.color, fontWeight: 'bold' }}>{buyerTeam.name}</span>
                                 ) : '-'}
                             </td>
                             <td style={{ padding: '12px' }}>
                                 {runnerUpTeam ? (
                                     <span style={{ color: runnerUpTeam.color }}>{runnerUpTeam.name}</span>
                                 ) : '-'}
                             </td>
                          </tr>
                          
                          {expandedRow === p.id && hasHistory && (
                             <tr>
                                 <td colSpan={5} style={{ padding: '8px 12px 16px 12px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                     <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                        <strong style={{ color: 'var(--accent)' }}>Bidding War:</strong>
                                        {p.biddingHistory.map((bid: any, i: number) => {
                                           const t = teams.find((tm:any) => tm.id === bid.teamId);
                                           return (
                                              <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                 {i > 0 && <span style={{opacity: 0.5, margin: '0 4px'}}>&rarr; </span>} 
                                                 <b style={{color: t?.color || 'white'}}>{t?.shortName || bid.teamId}</b> <span style={{ marginLeft: '4px' }}>₹{bid.amount}L</span>
                                              </span>
                                           );
                                        })}
                                     </div>
                                 </td>
                             </tr>
                          )}
                        </div>
                      )
                   })}
                </tbody>
             </table>
           </div>
        </div>
      )}

      <header className="mb-4">
        <h2>{myTeam?.name} Dashboard</h2>
      </header>

      <div className="flex" style={{ gap: '24px', flexWrap: 'wrap' }}>
        {/* Main Stage */}
        <main className="glass-panel" style={{ flex: '2', minWidth: '300px' }}>
          
          {/* Active List Header */}
          {activeList && auctionState.status !== 'WAITING' && auctionState.status !== 'AUCTION_FINISHED' && (
             <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px', marginBottom: '8px', color: 'var(--accent)' }}>
                <strong>Current Set:</strong> {activeList.name}
             </div>
          )}

          {/* Screens */}
          {auctionState.status === 'WAITING' && (
            <div className="flex flex-col items-center justify-center" style={{ height: '300px', textAlign: 'center' }}>
              <h1 className="mb-4">Mega Auction is ready!</h1>
              {mode === 'GROUP' ? (
                 <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Wait for friends to join the room, then hit Start.</p>
              ) : (
                 <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Solo mode active! Hit start to jump in.</p>
              )}
              <button className="btn btn-success mt-4 animate-pulse-slow" onClick={() => socket.emit('start-auction', roomId)}>
                START MEGA AUCTION
              </button>
            </div>
          )}

          {auctionState.status === 'AUCTION_FINISHED' && (
            <div className="flex flex-col items-center justify-center" style={{ height: '300px', textAlign: 'center' }}>
              <h1>Mega Auction Concluded!</h1>
              <p style={{ color: 'var(--text-muted)' }}>All sets have been processed.</p>
              <button className="btn btn-danger mt-4" onClick={() => socket.emit('start-auction', roomId)}>
                RESTART FULL AUCTION
              </button>
            </div>
          )}
          
          {auctionState.status === 'LIST_FINISHED' && (
            <div className="flex flex-col items-center justify-center" style={{ height: '300px', textAlign: 'center' }}>
              <h1 className="mb-4">Set Completed: {activeList.name}</h1>
              <p style={{ color: 'var(--text-muted)' }}>Take a breather and review team squads.</p>
              
              {mode === 'GROUP' ? (
                  <div style={{ marginTop: '24px', background: 'rgba(0,0,0,0.3)', padding: '16px 32px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                     <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Next round starting automatically in</p>
                     <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>00:{auctionState.nextListCountdown?.toString().padStart(2, '0')}</p>
                  </div>
              ) : (
                  <button className="btn btn-success mt-8 animate-pulse-slow" onClick={() => socket.emit('start-next-list', roomId)}>
                    PROCEED TO NEXT SET
                  </button>
              )}
            </div>
          )}

          {auctionState.status === 'PAUSED_RESULT' && activePlayer && (
            <div className="flex flex-col items-center justify-center animate-slide-in" style={{ height: '300px', textAlign: 'center' }}>
              <div 
                style={{ 
                  width: '120px', height: '120px', borderRadius: '50%', 
                  background: `url(${activePlayer.image}) center/cover`,
                  border: '4px solid var(--accent)',
                  marginBottom: '16px'
                }} 
              />
              {activePlayer.isSold ? (
                <>
                  <h1 style={{ color: 'var(--success)', marginBottom: '8px' }}>SOLD!</h1>
                  <p style={{ fontSize: '1.2rem' }}>
                    {activePlayer.name} {activePlayer.isForeign ? '✈️' : ''} sold to <strong>{teams.find((t:any) => t.id === activePlayer.soldTo)?.name}</strong> for ₹{activePlayer.soldPrice}L
                  </p>
                </>
              ) : (
                <>
                  <h1 style={{ color: 'var(--danger)', marginBottom: '8px' }}>UNSOLD!</h1>
                  <p style={{ fontSize: '1.2rem' }}>{activePlayer.name} {activePlayer.isForeign ? '✈️' : ''} goes unsold.</p>
                </>
              )}

              {/* Show final bidding history summary on screen */}
              {auctionState.biddingHistory && auctionState.biddingHistory.length > 0 && (
                  <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                      Ended after {auctionState.biddingHistory.length} bids
                  </div>
              )}
            </div>
          )}

          {auctionState.status === 'IN_PROGRESS' && activePlayer && (
            <div className="animate-slide-in flex" style={{ gap: '24px', alignItems: 'stretch' }}>
              
              {/* LEFT SIDE: Image, Name, Timer */}
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)', padding: '24px', borderRadius: '12px' }}>
                  <div 
                    style={{ 
                      width: '120px', height: '120px', borderRadius: '50%', 
                      background: `url(${activePlayer.image}) center/cover`,
                      border: `4px solid ${auctionState.timeLeft <= 3 ? 'var(--danger)' : 'var(--accent)'}`,
                      marginBottom: '16px',
                      transition: 'border-color 0.3s ease'
                    }} 
                  />
                  <h1 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>
                    {activePlayer.name} {activePlayer.isForeign ? '✈️' : ''}
                  </h1>
                  <div style={{ background: 'var(--accent)', color: 'black', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
                     {activePlayer.role === 'WK' ? '🧤 WICKET KEEPER' : activePlayer.role === 'BAT' ? '🏏 BATSMAN' : activePlayer.role === 'BOWL' ? '⚾ BOWLER' : '🌟 ALL-ROUNDER'}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TIME REMAINING</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: auctionState.timeLeft <= 3 ? 'var(--danger)' : 'white' }}>
                      00:{auctionState.timeLeft.toString().padStart(2, '0')}
                    </div>
                  </div>
              </div>

              {/* RIGHT SIDE: Bids, Timeline, Controls */}
              <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Prices */}
                  <div className="flex justify-between" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>BASE PRICE</div>
                      <div style={{ fontSize: '1.4rem' }}>₹{activePlayer.basePrice}L</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>CURRENT BID</div>
                      <div style={{ fontSize: '2rem', color: 'var(--success)', fontWeight: 'bold' }}>₹{auctionState.currentBid}L</div>
                      {auctionState.highestBidderId && (
                         <div style={{ fontSize: '14px', color: 'var(--accent)' }}>by {highestBidderName}</div>
                      )}
                    </div>
                  </div>

                  {/* LIVE BIDDING WAR TIMELINE */}
                  <div style={{ height: '180px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', textAlign: 'center', flexShrink: 0 }}>Live Bidding War</div>
                      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="flex flex-col gap-2 custom-scrollbar">
                         {auctionState.biddingHistory && auctionState.biddingHistory.length > 0 ? auctionState.biddingHistory.slice().reverse().map((bid: any, index: number) => {
                             const t = teams.find((tm:any) => tm.id === bid.teamId);
                             return (
                                 <div key={index} className="flex justify-between items-center" style={{ fontSize: '14px', opacity: index === 0 ? 1 : 0.5 }}>
                                     <span style={{ color: t?.color || 'white', fontWeight: 'bold' }}>{t?.shortName || bid.teamId}</span>
                                     <span style={{ color: index === 0 ? 'var(--success)' : 'white' }}>₹{bid.amount}L</span>
                                 </div>
                             );
                         }) : (
                             <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '20px 0', fontSize: '14px' }}>No bids placed yet</div>
                         )}
                      </div>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-4 items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}>
                     {myTeam && myTeam.players.length >= 25 ? (
                        <div style={{ padding: '8px', color: 'var(--danger)', fontWeight: 'bold' }}>
                          Squad full! Check out next year.
                        </div>
                     ) : (
                        <>
                          {myTeam && auctionState.highestBidderId !== myTeam.id && myTeam.purse >= auctionState.currentBid + 5 && (
                            <button 
                              className="btn btn-success flex-1" 
                              style={{ fontSize: '1rem', padding: '12px', fontWeight: 'bold' }}
                              onClick={() => socket.emit('place-bid', { roomId, teamId: myTeam.id })}
                            >
                              PLACE BID (₹{auctionState.highestBidderId ? auctionState.currentBid + (auctionState.currentBid >= 100 ? (auctionState.currentBid >= 200 ? 20 : 10) : 5) : activePlayer.basePrice}L)
                            </button>
                          )}
                          
                          {auctionState.highestBidderId === myTeam?.id && (
                            <div style={{ padding: '12px', color: 'var(--success)', fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
                              You hold the highest bid!
                            </div>
                          )}
                        </>
                     )}
                     
                     {mode === 'SOLO' && (
                       <button 
                         className="btn btn-danger" 
                         style={{ fontSize: '0.9rem', padding: '12px 20px', background: 'transparent', border: '1px solid var(--danger)' }}
                         onClick={() => socket.emit('skip-timer', roomId)}
                       >
                         Skip Timer & Resolve
                       </button>
                     )}
                  </div>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar - Teams Summary */}
        <aside style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
          <div className="glass-panel h-full" style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <h3 className="mb-4">All Franchises</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
              {teams.map((t: any) => (
                <div key={t.id} 
                  onClick={() => setSelectedTeam(t)}
                  style={{ 
                    padding: '8px', borderLeft: `6px solid ${t.color}`, background: 'rgba(0,0,0,0.3)', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                  <div className="flex justify-between items-center">
                    <strong style={{ fontSize: '14px', letterSpacing: '1px' }}>{t.shortName}</strong>
                    <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 'bold' }}>₹{t.purse}L</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Squad: {t.players.length}/25
                  </div>
                  <div style={{ fontSize: '9px', opacity: 0.6, display: 'flex', gap: '4px' }}>
                     <span>W:{t.players.filter((x:any)=>x.role==='WK').length}</span>
                     <span>B:{t.players.filter((x:any)=>x.role==='BAT').length}</span>
                     <span>O:{t.players.filter((x:any)=>x.role==='BOWL').length}</span>
                  </div>
                </div>
              ))}
            </div>

            {activeList && (
              <div className="mt-auto" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className="btn" 
                  style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', width: '100%', padding: '12px' }} 
                  onClick={() => setShowPlayerList(true)}
                >
                  View Present List
                </button>
                <button 
                  className="btn btn-danger" 
                  style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', width: '100%', padding: '12px', fontSize: '0.9rem' }} 
                  onClick={() => { window.location.href = '/lobby'; }}
                >
                  Quit / Leave Auction
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Team Squad Modal */}
      {selectedTeam && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', borderTop: `6px solid ${selectedTeam.color}` }}>
             <div className="flex justify-between items-center mb-6">
                <h2>{selectedTeam.name} Squad</h2>
                <button className="btn" style={{ background: 'var(--danger)', padding: '8px 16px' }} onClick={() => setSelectedTeam(null)}>Close</button>
             </div>
             
             <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                 <div>
                     <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>REMAINING PURSE</div>
                     <div style={{ fontSize: '1.2rem', color: 'var(--success)', fontWeight: 'bold' }}>₹{selectedTeam.purse}L</div>
                 </div>
                 <div>
                     <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SQUAD SIZE</div>
                     <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedTeam.players.length} / 25</div>
                 </div>
                 <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                     <div style={{ textAlign: 'center' }}><div style={{fontSize:'10px',color:'var(--text-muted)'}}>WK</div><div style={{fontWeight:'bold', color: selectedTeam.players.filter((x:any)=>x.role==='WK').length >= 2 ? 'var(--success)' : 'white'}}>{selectedTeam.players.filter((x:any)=>x.role==='WK').length}</div></div>
                     <div style={{ textAlign: 'center' }}><div style={{fontSize:'10px',color:'var(--text-muted)'}}>BAT</div><div style={{fontWeight:'bold', color: selectedTeam.players.filter((x:any)=>x.role==='BAT').length >= 6 ? 'var(--success)' : 'white'}}>{selectedTeam.players.filter((x:any)=>x.role==='BAT').length}</div></div>
                     <div style={{ textAlign: 'center' }}><div style={{fontSize:'10px',color:'var(--text-muted)'}}>BOWL</div><div style={{fontWeight:'bold', color: selectedTeam.players.filter((x:any)=>x.role==='BOWL').length >= 6 ? 'var(--success)' : 'white'}}>{selectedTeam.players.filter((x:any)=>x.role==='BOWL').length}</div></div>
                     <div style={{ textAlign: 'center' }}><div style={{fontSize:'10px',color:'var(--text-muted)'}}>AR</div><div style={{fontWeight:'bold'}}>{selectedTeam.players.filter((x:any)=>x.role==='AR').length}</div></div>
                 </div>
             </div>
             
             {selectedTeam.players.length === 0 ? (
                 <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No players bought yet.</p>
             ) : (
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                       <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Player Name</th>
                          <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Sold Price</th>
                       </tr>
                    </thead>
                    <tbody>
                       {selectedTeam.players.map((p: any) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.name} {p.isForeign ? '✈️' : ''}</td>
                             <td style={{ padding: '12px', color: 'var(--success)' }}>₹{p.soldPrice}L</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
             )}
           </div>
        </div>
      )}
    </div>
  );
}

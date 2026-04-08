const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('./db');
let { teams: baseTeams, lists: baseLists } = require('./data');

const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret';

// Serve React App
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

sequelize.sync().then(() => console.log('SQLite Database synced'));

// --- AUTH ENDPOINTS ---
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Username already taken' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUCTION ROOMS STATE ---
const rooms = {};

const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createRoom = (hostUsername, mode = 'GROUP') => {
    const roomId = generateRoomId();
    rooms[roomId] = {
        id: roomId,
        host: hostUsername,
        mode: mode,
        teams: JSON.parse(JSON.stringify(baseTeams)),
        lists: JSON.parse(JSON.stringify(baseLists)),
        state: {
            status: 'WAITING',
            currentListIndex: 0,
            activePlayerIndex: -1,
            currentBid: 0,
            highestBidderId: null,
            timeLeft: 0,
            biddingHistory: []
        },
        connectedHumans: new Set(),
        currentInterestedTeams: [],
        maxCeilings: {},
        mainInterval: null
    };
    return roomId;
};

// Rooms endpoints
app.post('/api/create-room', (req, res) => {
   const { username, mode } = req.body;
   if (!username) return res.status(400).json({ error: 'Username required' });
   const roomId = createRoom(username, mode || 'GROUP');
   res.json({ roomId });
});

app.get('/api/room/:id', (req, res) => {
   const { id } = req.params;
   if (rooms[id]) {
       res.json({ exists: true });
   } else {
       res.status(404).json({ exists: false, error: 'Room not found' });
   }
});

// --- HELPER FUNCTIONS ---
const getActiveList = (room) => {
    if (room.state.currentListIndex >= 0 && room.state.currentListIndex < room.lists.length) {
        return room.lists[room.state.currentListIndex];
    }
    return null;
}

const getActivePlayer = (room) => {
    const list = getActiveList(room);
    if (list && room.state.activePlayerIndex >= 0 && room.state.activePlayerIndex < list.players.length) {
        return list.players[room.state.activePlayerIndex];
    }
    return null;
}

const assignInterest = (room) => {
    const eligibleTeams = room.teams.filter(t => t.players.length < 25);
    if (eligibleTeams.length === 0) return;
    const shuffled = eligibleTeams.sort(() => 0.5 - Math.random());
    const count = Math.min(Math.floor(Math.random() * 4) + 2, eligibleTeams.length); 
    room.currentInterestedTeams = shuffled.slice(0, count).map(t => t.id);
    
    room.maxCeilings = {};
    const player = getActivePlayer(room);
    if (!player) return;
    
    room.currentInterestedTeams.forEach(teamId => {
         const team = room.teams.find(t => t.id === teamId);
         const randomBudget = player.basePrice + Math.floor(Math.random() * 1000);
         room.maxCeilings[teamId] = Math.min(randomBudget, team.purse);
    });
};

const broadcastState = (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    // Broadcast to users in the room
    io.to(roomId).emit('auction-state', {
        teams: room.teams,
        auctionState: room.state,
        activeList: getActiveList(room),
        activePlayer: getActivePlayer(room),
        connectedHumans: Array.from(room.connectedHumans),
        mode: room.mode
    });
};

const getIncrement = (current) => {
    if (current >= 200) return 20;
    if (current >= 100) return 10;
    return 5;
};

const processAI = (room) => {
    if (room.state.status !== 'IN_PROGRESS') return;
    if (room.state.timeLeft > 7) return; 
    
    if (Math.random() > 0.5) {
        const aiTeams = room.teams.filter(t => 
            !room.connectedHumans.has(t.id) && 
            room.currentInterestedTeams.includes(t.id) && 
            t.players.length < 25
        );
        if (aiTeams.length === 0) return;
        
        const randomAITeam = aiTeams[Math.floor(Math.random() * aiTeams.length)];
        if (room.state.highestBidderId === randomAITeam.id) return;
        
        const player = getActivePlayer(room);
        if (!player) return;

        const increment = getIncrement(room.state.currentBid);
        const newBidAmount = room.state.highestBidderId === null ? player.basePrice : room.state.currentBid + increment;

        if (randomAITeam.purse >= newBidAmount && newBidAmount <= room.maxCeilings[randomAITeam.id]) {
            room.state.currentBid = newBidAmount;
            room.state.highestBidderId = randomAITeam.id;
            room.state.biddingHistory.push({ teamId: randomAITeam.id, amount: newBidAmount });
            room.state.timeLeft = 10; 
            broadcastState(room.id);
        }
    }
};

const setupNextPlayer = (room) => {
    const currentList = getActiveList(room);
    if (!currentList) return;

    if (room.state.activePlayerIndex < currentList.players.length - 1) {
        room.state.activePlayerIndex++;
        
        const nextPlayer = getActivePlayer(room);
        room.state.currentBid = nextPlayer.basePrice;
        room.state.highestBidderId = null;
        room.state.status = 'IN_PROGRESS';
        room.state.timeLeft = 25;
        room.state.biddingHistory = [];
        assignInterest(room);
        broadcastState(room.id);
    } else {
        room.state.status = 'LIST_FINISHED';
        room.state.timeLeft = 0;
        room.state.activePlayerIndex = -1;
        if(room.mainInterval) clearInterval(room.mainInterval);
        
        if (room.state.currentListIndex >= room.lists.length - 1) {
             room.state.status = 'AUCTION_FINISHED';
        } else if (room.mode === 'GROUP') {
             room.state.nextListCountdown = 40;
             if(room.nextListInterval) clearInterval(room.nextListInterval);
             room.nextListInterval = setInterval(() => {
                 room.state.nextListCountdown -= 1;
                 if (room.state.nextListCountdown <= 0) {
                     clearInterval(room.nextListInterval);
                     startNextListLogic(room);
                 } else {
                     broadcastState(room.id);
                 }
             }, 1000);
        }
        
        broadcastState(room.id);
    }
}

const startNextListLogic = (room) => {
    if (room.state.status === 'LIST_FINISHED') {
        room.state.currentListIndex++;
        room.state.activePlayerIndex = 0;
        room.state.status = 'IN_PROGRESS';
        
        const firstPlayer = getActivePlayer(room);
        room.state.currentBid = firstPlayer.basePrice;
        room.state.highestBidderId = null;
        room.state.timeLeft = 25;
        room.state.biddingHistory = [];
        delete room.state.nextListCountdown;
        assignInterest(room);
        startLoop(room);
        broadcastState(room.id);
    }
};

const processSale = (room) => {
    const player = getActivePlayer(room);
    if (!player) return;

    player.biddingHistory = [...room.state.biddingHistory];
    if (player.biddingHistory.length >= 2) {
        player.runnerUpTeamId = player.biddingHistory[player.biddingHistory.length - 2].teamId;
    } else {
        player.runnerUpTeamId = null;
    }

    if (room.state.highestBidderId) {
        const team = room.teams.find(t => t.id === room.state.highestBidderId);
        player.isSold = true;
        player.soldTo = team.id;
        player.soldPrice = room.state.currentBid;
        team.purse -= room.state.currentBid;
        team.players.push(player);
    } else {
        player.isSold = false;
    }
    
    room.state.status = 'PAUSED_RESULT';
    broadcastState(room.id);
    
    setTimeout(() => {
        setupNextPlayer(room);
    }, 3000);
}

const startLoop = (room) => {
    if(room.mainInterval) clearInterval(room.mainInterval);
    room.mainInterval = setInterval(() => {
        if (room.state.status === 'IN_PROGRESS') {
            if (room.state.timeLeft > 0) {
                room.state.timeLeft -= 1;
                processAI(room);
                broadcastState(room.id);
            } else {
                processSale(room);
            }
        }
    }, 1000);
};

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        const room = rooms[roomId];
        if (room) {
            socket.emit('auction-state', { 
                teams: room.teams, 
                auctionState: room.state, 
                activeList: getActiveList(room), 
                activePlayer: getActivePlayer(room),
                connectedHumans: Array.from(room.connectedHumans),
                mode: room.mode
            });
        }
    });

    socket.on('join-team', ({ roomId, teamId }) => {
        const room = rooms[roomId];
        if (!room) return;
        socket.auctionData = { roomId, teamId };
        socket.join(`team_${teamId}`); 
        room.connectedHumans.add(teamId);
        
        if (room.mode === 'SOLO' && room.state.status === 'PAUSED') {
             room.state.status = 'IN_PROGRESS';
        }
        
        broadcastState(roomId);
    });

    socket.on('leave-team', ({ roomId, teamId }) => {
        const room = rooms[roomId];
        if (!room) return;
        delete socket.auctionData;
        socket.leave(`team_${teamId}`);
        room.connectedHumans.delete(teamId);
        
        if (room.mode === 'SOLO' && room.connectedHumans.size === 0 && room.state.status === 'IN_PROGRESS') {
             room.state.status = 'PAUSED';
        }
        
        broadcastState(roomId);
    });

    socket.on('disconnect', () => {
        if (socket.auctionData) {
            const { roomId, teamId } = socket.auctionData;
            const room = rooms[roomId];
            if (room) {
                 room.connectedHumans.delete(teamId);
                 if (room.mode === 'SOLO' && room.connectedHumans.size === 0 && room.state.status === 'IN_PROGRESS') {
                      room.state.status = 'PAUSED';
                 }
                 broadcastState(roomId);
            }
        }
    });

    socket.on('request-state', (roomId) => {
        const room = rooms[roomId];
        if (room) {
             socket.emit('auction-state', { 
                 teams: room.teams, 
                 auctionState: room.state, 
                 activeList: getActiveList(room), 
                 activePlayer: getActivePlayer(room),
                 connectedHumans: Array.from(room.connectedHumans),
                 mode: room.mode
             });
        }
    });

    socket.on('start-auction', (roomId) => {
        const room = rooms[roomId];
        if (!room) return;
        if (room.state.status === 'WAITING' || room.state.status === 'AUCTION_FINISHED') {
            room.state.status = 'IN_PROGRESS';
            room.state.currentListIndex = 0;
            room.state.activePlayerIndex = 0;
            
            const firstPlayer = getActivePlayer(room);
            room.state.currentBid = firstPlayer.basePrice;
            room.state.highestBidderId = null;
            room.state.timeLeft = 25;
            room.state.biddingHistory = [];
            assignInterest(room);
            startLoop(room);
            broadcastState(roomId);
        }
    });

    socket.on('start-next-list', (roomId) => {
        const room = rooms[roomId];
        if (!room) return;
        startNextListLogic(room);
    });

    socket.on('place-bid', ({ roomId, teamId }) => {
        const room = rooms[roomId];
        if (!room) return;
        if (room.state.status !== 'IN_PROGRESS') return;

        const player = getActivePlayer(room);
        if (!player) return;

        const team = room.teams.find(t => t.id === teamId);
        if (!team) return;
        if (team.players.length >= 25) return;

        const increment = getIncrement(room.state.currentBid);
        const newBidAmount = room.state.highestBidderId === null ? player.basePrice : room.state.currentBid + increment;

        if (team.purse >= newBidAmount) {
            room.state.currentBid = newBidAmount;
            room.state.highestBidderId = teamId;
            room.state.biddingHistory.push({ teamId: teamId, amount: newBidAmount });
            room.state.timeLeft = 10; 
            broadcastState(roomId);
        }
    });

    socket.on('skip-timer', (roomId) => {
        const room = rooms[roomId];
        if (!room) return;
        if (room.state.status === 'IN_PROGRESS') {
            let stateChanged = true;
            while (stateChanged) {
                stateChanged = false;
                
                const aiTeams = room.teams.filter(t => 
                    !room.connectedHumans.has(t.id) && 
                    room.currentInterestedTeams.includes(t.id) && 
                    t.players.length < 25
                );
                
                if (aiTeams.length === 0) break;
                
                let highestCeilingTeam = null;
                let highestCeiling = -1;
                
                aiTeams.forEach(t => {
                    if (t.id !== room.state.highestBidderId) {
                        if (room.maxCeilings[t.id] > highestCeiling) {
                            highestCeiling = room.maxCeilings[t.id];
                            highestCeilingTeam = t;
                        }
                    }
                });
                
                if (highestCeilingTeam) {
                    const increment = getIncrement(room.state.currentBid);
                    const player = getActivePlayer(room);
                    const newBidAmount = room.state.highestBidderId === null ? player.basePrice : room.state.currentBid + increment;
                    
                    if (highestCeilingTeam.purse >= newBidAmount && newBidAmount <= room.maxCeilings[highestCeilingTeam.id]) {
                        room.state.currentBid = newBidAmount;
                        room.state.highestBidderId = highestCeilingTeam.id;
                        room.state.biddingHistory.push({ teamId: highestCeilingTeam.id, amount: newBidAmount });
                        stateChanged = true;
                    }
                }
            }
            processSale(room);
        }
    });
});

app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

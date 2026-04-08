const teams = [
  { id: 'csk', name: 'Chennai Super Kings', shortName: 'CSK', color: '#ffcb05', logo: 'https://ui-avatars.com/api/?name=CSK&background=ffcb05&color=000&size=150', purse: 2000, players: [] },
  { id: 'rcb', name: 'Royal Challengers Bengaluru', shortName: 'RCB', color: '#D32F2F', logo: 'https://ui-avatars.com/api/?name=RCB&background=D32F2F&color=fff&size=150', purse: 2000, players: [] },
  { id: 'mi', name: 'Mumbai Indians', shortName: 'MI', color: '#007AFF', logo: 'https://ui-avatars.com/api/?name=MI&background=007AFF&color=fff&size=150', purse: 2000, players: [] },
  { id: 'kkr', name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#8B5CF6', logo: 'https://ui-avatars.com/api/?name=KKR&background=8B5CF6&color=fff&size=150', purse: 2000, players: [] },
  { id: 'srh', name: 'Sunrisers Hyderabad', shortName: 'SRH', color: '#FF822A', logo: 'https://ui-avatars.com/api/?name=SRH&background=FF822A&color=fff&size=150', purse: 2000, players: [] },
  { id: 'rr', name: 'Rajasthan Royals', shortName: 'RR', color: '#EA1A85', logo: 'https://ui-avatars.com/api/?name=RR&background=EA1A85&color=fff&size=150', purse: 2000, players: [] },
  { id: 'dc', name: 'Delhi Capitals', shortName: 'DC', color: '#1E90FF', logo: 'https://ui-avatars.com/api/?name=DC&background=1E90FF&color=fff&size=150', purse: 2000, players: [] },
  { id: 'pbks', name: 'Punjab Kings', shortName: 'PBKS', color: '#DD1F2D', logo: 'https://ui-avatars.com/api/?name=PBKS&background=DD1F2D&color=fff&size=150', purse: 2000, players: [] },
  { id: 'gt', name: 'Gujarat Titans', shortName: 'GT', color: '#6BA4FF', logo: 'https://ui-avatars.com/api/?name=GT&background=6BA4FF&color=fff&size=150', purse: 2000, players: [] },
  { id: 'lsg', name: 'Lucknow Super Giants', shortName: 'LSG', color: '#00C1FF', logo: 'https://ui-avatars.com/api/?name=LSG&background=00C1FF&color=000&size=150', purse: 2000, players: [] },
];

let globalPlayerId = 1;

const createPlayer = (name, basePrice, isForeign) => {
  const pId = globalPlayerId++;
  return {
    id: pId,
    name,
    basePrice,
    isForeign,
    isSold: false,
    soldTo: null,
    soldPrice: null,
    image: `/players/player${(pId - 1) % 10}.jpeg`
  };
};

const lists = [
  {
    id: 1, name: 'Top Players (Marquee)', 
    players: [
      createPlayer('Travis Head', 200, true),
      createPlayer('Virat Kohli', 200, false),
      createPlayer('Pat Cummins', 200, true),
    ]
  },
  {
    id: 2, name: 'Capped Batsmen',
    players: [
      createPlayer('Rohit Sharma', 200, false),
      createPlayer('David Warner', 200, true),
      createPlayer('Kane Williamson', 200, true),
    ]
  },
  {
    id: 3, name: 'Capped Wicket Keepers',
    players: [
      createPlayer('KL Rahul', 200, false),
      createPlayer('Quinton de Kock', 200, true),
    ]
  },
  {
    id: 4, name: 'Capped Bowlers',
    players: [
      createPlayer('Jasprit Bumrah', 200, false),
      createPlayer('Mitchell Starc', 200, true),
      createPlayer('Rashid Khan', 200, true),
    ]
  },
  {
    id: 5, name: 'Capped All-rounders',
    players: [
      createPlayer('Ravindra Jadeja', 200, false),
      createPlayer('Glenn Maxwell', 200, true),
    ]
  },
  {
    id: 6, name: 'Uncapped Batsmen',
    players: [
      createPlayer('Rajat Patidar', 20, false),
      createPlayer('Angkrish Raghuvanshi', 20, false),
    ]
  },
  {
    id: 7, name: 'Uncapped Wicket Keepers',
    players: [
      createPlayer('Dhruv Jurel', 20, false),
      createPlayer('Jitesh Sharma', 20, false),
    ]
  },
  {
    id: 8, name: 'Uncapped Bowlers',
    players: [
      createPlayer('Mayank Yadav', 20, false),
      createPlayer('Yash Thakur', 20, false),
    ]
  },
  {
    id: 9, name: 'Uncapped All-rounds',
    players: [
      createPlayer('Ramandeep Singh', 20, false),
    ]
  }
];

module.exports = { teams, lists };

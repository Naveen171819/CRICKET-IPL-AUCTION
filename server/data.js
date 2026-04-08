const teams = [
  { id: 'csk', name: 'Chennai Super Kings', shortName: 'CSK', color: '#ffcb05', logo: 'https://ui-avatars.com/api/?name=CSK&background=ffcb05&color=000&size=150', purse: 9000, players: [] },
  { id: 'rcb', name: 'Royal Challengers Bengaluru', shortName: 'RCB', color: '#D32F2F', logo: 'https://ui-avatars.com/api/?name=RCB&background=D32F2F&color=fff&size=150', purse: 9000, players: [] },
  { id: 'mi', name: 'Mumbai Indians', shortName: 'MI', color: '#007AFF', logo: 'https://ui-avatars.com/api/?name=MI&background=007AFF&color=fff&size=150', purse: 9000, players: [] },
  { id: 'kkr', name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#8B5CF6', logo: 'https://ui-avatars.com/api/?name=KKR&background=8B5CF6&color=fff&size=150', purse: 9000, players: [] },
  { id: 'srh', name: 'Sunrisers Hyderabad', shortName: 'SRH', color: '#FF822A', logo: 'https://ui-avatars.com/api/?name=SRH&background=FF822A&color=fff&size=150', purse: 9000, players: [] },
  { id: 'rr', name: 'Rajasthan Royals', shortName: 'RR', color: '#EA1A85', logo: 'https://ui-avatars.com/api/?name=RR&background=EA1A85&color=fff&size=150', purse: 9000, players: [] },
  { id: 'dc', name: 'Delhi Capitals', shortName: 'DC', color: '#1E90FF', logo: 'https://ui-avatars.com/api/?name=DC&background=1E90FF&color=fff&size=150', purse: 9000, players: [] },
  { id: 'pbks', name: 'Punjab Kings', shortName: 'PBKS', color: '#DD1F2D', logo: 'https://ui-avatars.com/api/?name=PBKS&background=DD1F2D&color=fff&size=150', purse: 9000, players: [] },
  { id: 'gt', name: 'Gujarat Titans', shortName: 'GT', color: '#6BA4FF', logo: 'https://ui-avatars.com/api/?name=GT&background=6BA4FF&color=fff&size=150', purse: 9000, players: [] },
  { id: 'lsg', name: 'Lucknow Super Giants', shortName: 'LSG', color: '#00C1FF', logo: 'https://ui-avatars.com/api/?name=LSG&background=00C1FF&color=000&size=150', purse: 9000, players: [] },
];

let globalPlayerId = 1;

const createPlayer = (name, basePrice, isForeign, role) => {
  const pId = globalPlayerId++;
  return {
    id: pId,
    name,
    basePrice,
    isForeign,
    role, // BAT, BOWL, WK, AR
    isSold: false,
    soldTo: null,
    soldPrice: null,
    image: `/players/player${(pId - 1) % 30}.jpeg`
  };
};

const lists = [
  {
    id: 1, name: 'Marquee Players - Set 1', 
    players: [
      createPlayer('MS Dhoni', 200, false, 'WK'),
      createPlayer('Virat Kohli', 200, false, 'BAT'),
      createPlayer('Rohit Sharma', 200, false, 'BAT'),
      createPlayer('Jasprit Bumrah', 200, false, 'BOWL'),
      createPlayer('Rishabh Pant', 200, false, 'WK'),
      createPlayer('Shreyas Iyer', 200, false, 'BAT'),
      createPlayer('Mohammed Shami', 200, false, 'BOWL'),
      createPlayer('Travis Head', 200, true, 'BAT'),
      createPlayer('Pat Cummins', 200, true, 'BOWL'),
      createPlayer('Mitchell Starc', 200, true, 'BOWL'),
    ]
  },
  {
    id: 2, name: 'Marquee Players - Set 2', 
    players: [
      createPlayer('KL Rahul', 200, false, 'WK'),
      createPlayer('Jos Buttler', 200, true, 'WK'),
      createPlayer('Liam Livingstone', 200, true, 'AR'),
      createPlayer('Arshdeep Singh', 200, false, 'BOWL'),
      createPlayer('Yuzvendra Chahal', 200, false, 'BOWL'),
      createPlayer('David Miller', 200, true, 'BAT'),
      createPlayer('Heinrich Klaasen', 200, true, 'WK'),
      createPlayer('Sunil Narine', 200, true, 'AR'),
      createPlayer('Hardik Pandya', 200, false, 'AR'),
      createPlayer('Rashid Khan', 200, true, 'BOWL'),
    ]
  },
  {
    id: 3, name: 'Capped Batsmen - Set 1',
    players: [
      createPlayer('Rohit Sharma', 200, false, 'BAT'),
      createPlayer('Devdutt Padikkal', 200, false, 'BAT'),
      createPlayer('David Warner', 200, true, 'BAT'),
      createPlayer('Kane Williamson', 200, true, 'BAT'),
      createPlayer('Faf du Plessis', 200, true, 'BAT'),
      createPlayer('Ajinkya Rahane', 100, false, 'BAT'),
      createPlayer('Mayank Agarwal', 100, false, 'BAT'),
      createPlayer('Prithvi Shaw', 75, false, 'BAT'),
      createPlayer('Harry Brook', 200, true, 'BAT'),
      createPlayer('Shimron Hetmyer', 200, true, 'BAT'),
      createPlayer('Rovman Powell', 100, true, 'BAT'),
      createPlayer('Glenn Phillips', 100, true, 'BAT'),
      createPlayer('Finn Allen', 75, true, 'BAT'),
      createPlayer('Rilee Rossouw', 150, true, 'BAT'),
      createPlayer('Karun Nair', 50, false, 'BAT'),
    ]
  },
  {
    id: 4, name: 'Capped Wicket Keepers - Set 1',
    players: [
      createPlayer('Ishan Kishan', 200, false, 'WK'),
      createPlayer('Quinton de Kock', 200, true, 'WK'),
      createPlayer('Sanju Samson', 200, false, 'WK'),
      createPlayer('Nicholas Pooran', 200, true, 'WK'),
      createPlayer('Phil Salt', 150, true, 'WK'),
      createPlayer('Jonny Bairstow', 150, true, 'WK'),
      createPlayer('Dinesh Karthik', 100, false, 'WK'),
      createPlayer('Wriddhiman Saha', 50, false, 'WK'),
      createPlayer('KS Bharat', 50, false, 'WK'),
      createPlayer('Rahmanullah Gurbaz', 50, true, 'WK'),
      createPlayer('Josh Inglis', 75, true, 'WK'),
      createPlayer('Shai Hope', 75, true, 'WK'),
      createPlayer('Tom Latham', 50, true, 'WK'),
      createPlayer('Sam Billings', 100, true, 'WK'),
      createPlayer('Matthew Wade', 100, true, 'WK'),
    ]
  },
  {
    id: 5, name: 'Capped Bowlers - Set 1',
    players: [
      createPlayer('Trent Boult', 200, true, 'BOWL'),
      createPlayer('Kagiso Rabada', 200, true, 'BOWL'),
      createPlayer('Anrich Nortje', 200, true, 'BOWL'),
      createPlayer('Josh Hazlewood', 200, true, 'BOWL'),
      createPlayer('Mohammed Siraj', 200, false, 'BOWL'),
      createPlayer('Kuldeep Yadav', 200, false, 'BOWL'),
      createPlayer('Ravi Bishnoi', 200, false, 'BOWL'),
      createPlayer('Sandeeep Sharma', 100, false, 'BOWL'),
      createPlayer('Mohit Sharma', 50, false, 'BOWL'),
      createPlayer('Khaleel Ahmed', 100, false, 'BOWL'),
      createPlayer('Mukesh Kumar', 100, false, 'BOWL'),
      createPlayer('Avesh Khan', 100, false, 'BOWL'),
      createPlayer('T Natarajan', 100, false, 'BOWL'),
      createPlayer('Varun Chakaravarthy', 100, false, 'BOWL'),
      createPlayer('Adam Zampa', 150, true, 'BOWL'),
      createPlayer('Tabraiz Shamsi', 100, true, 'BOWL'),
      createPlayer('Maheesh Theekshana', 100, true, 'BOWL'),
      createPlayer('Wanindu Hasaranga', 150, true, 'BOWL'),
      createPlayer('Noor Ahmad', 100, true, 'BOWL'),
      createPlayer('Dilshan Madushanka', 50, true, 'BOWL'),
    ]
  },
  {
    id: 6, name: 'Capped All-rounders - Set 1',
    players: [
      createPlayer('Aksar Patel', 200, false, 'AR'),
      createPlayer('Washington Sundar', 200, false, 'AR'),
      createPlayer('Krunal Pandya', 200, false, 'AR'),
      createPlayer('Glenn Maxwell', 200, true, 'AR'),
      createPlayer('Marcus Stoinis', 200, true, 'AR'),
      createPlayer('Sam Curran', 200, true, 'AR'),
      createPlayer('Cameron Green', 200, true, 'AR'),
      createPlayer('Mitchell Marsh', 200, true, 'AR'),
      createPlayer('Ben Stokes', 200, true, 'AR'),
      createPlayer('Chris Woakes', 200, true, 'AR'),
      createPlayer('Daryl Mitchell', 200, true, 'AR'),
      createPlayer('Rachin Ravindra', 100, true, 'AR'),
      createPlayer('Azmatullah Omarzai', 50, true, 'AR'),
      createPlayer('Marco Jansen', 150, true, 'AR'),
      createPlayer('Shivam Dube', 100, false, 'AR'),
    ]
  },
  {
    id: 7, name: 'Uncapped Batsmen - Set 1',
    players: [
      createPlayer('Abhishek Sharma', 20, false, 'BAT'),
      createPlayer('Rinku Singh', 20, false, 'BAT'),
      createPlayer('Rajat Patidar', 20, false, 'BAT'),
      createPlayer('Sai Sudharsan', 20, false, 'BAT'),
      createPlayer('Ayush Badoni', 20, false, 'BAT'),
      createPlayer('Nehal Wadhera', 20, false, 'BAT'),
      createPlayer('Angkrish Raghuvanshi', 20, false, 'BAT'),
      createPlayer('Ashutosh Sharma', 20, false, 'BAT'),
      createPlayer('Sameer Rizvi', 20, false, 'BAT'),
      createPlayer('Swastik Chhikara', 20, false, 'BAT'),
    ]
  },
  {
    id: 8, name: 'Uncapped Wicket Keepers - Set 1',
    players: [
      createPlayer('Dhruv Jurel', 20, false, 'WK'),
      createPlayer('Jitesh Sharma', 20, false, 'WK'),
      createPlayer('Prabhsimran Singh', 20, false, 'WK'),
      createPlayer('Kumar Kushagra', 20, false, 'WK'),
      createPlayer('Robin Minz', 20, false, 'WK'),
      createPlayer('Abhishek Porel', 20, false, 'WK'),
      createPlayer('Anuj Rawat', 20, false, 'WK'),
      createPlayer('Upendra Yadav', 20, false, 'WK'),
      createPlayer('Vishnu Vinod', 20, false, 'WK'),
      createPlayer('Sumit Kumar', 20, false, 'WK'),
    ]
  },
  {
    id: 9, name: 'Uncapped Bowlers - Set 1',
    players: [
      createPlayer('Mayank Yadav', 20, false, 'BOWL'),
      createPlayer('Harshit Rana', 20, false, 'BOWL'),
      createPlayer('Yash Thakur', 20, false, 'BOWL'),
      createPlayer('Vaibhav Arora', 20, false, 'BOWL'),
      createPlayer('Tushar Deshpande', 20, false, 'BOWL'),
      createPlayer('Kartik Tyagi', 20, false, 'BOWL'),
      createPlayer('Chetan Sakariya', 20, false, 'BOWL'),
      createPlayer('Vidwath Kaverappa', 20, false, 'BOWL'),
      createPlayer('Vyshak Vijaykumar', 20, false, 'BOWL'),
      createPlayer('Manav Suthar', 20, false, 'BOWL'),
    ]
  },
  {
    id: 10, name: 'Uncapped All-rounders - Set 1',
    players: [
      createPlayer('Ramandeep Singh', 20, false, 'AR'),
      createPlayer('Riyan Parag', 20, false, 'AR'),
      createPlayer('Nitish Kumar Reddy', 20, false, 'AR'),
      createPlayer('Shahrukh Khan', 20, false, 'AR'),
      createPlayer('Rahul Tewatia', 20, false, 'AR'),
      createPlayer('Lalit Yadav', 20, false, 'AR'),
      createPlayer('Mahipal Lomror', 20, false, 'AR'),
      createPlayer('Deepak Hooda', 20, false, 'AR'),
      createPlayer('Krunal Pandya', 20, false, 'AR'),
      createPlayer('Abdul Samad', 20, false, 'AR'),
    ]
  },
  // Adding ~250 more players generically to reach 350+ total
  ...Array.from({ length: 250 }, (_, i) => {
    const roles = ['BAT', 'BOWL', 'WK', 'AR'];
    const role = roles[i % 4];
    const isForeign = i % 5 === 0;
    const basePrice = i % 10 === 0 ? 50 : 20;
    return createPlayer(`IPL Talent ${i + 1}`, basePrice, isForeign, role);
  }).reduce((acc, player, i) => {
    const listIdx = Math.floor(i / 25);
    if (!acc[listIdx]) {
      acc[listIdx] = { id: 11 + listIdx, name: `General Pool - Set ${listIdx + 1}`, players: [] };
    }
    acc[listIdx].players.push(player);
    return acc;
  }, [])
];

module.exports = { teams, lists };


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
      createPlayer('Arshdeep Singh', 200, false, 'BOWL'),
      createPlayer('Yuzvendra Chahal', 200, false, 'BOWL'),
      createPlayer('David Miller', 200, true, 'BAT'),
      createPlayer('Heinrich Klaasen', 200, true, 'WK'),
      createPlayer('Sunil Narine', 200, true, 'AR'),
      createPlayer('Hardik Pandya', 200, false, 'AR'),
      createPlayer('Rashid Khan', 200, true, 'BOWL'),
      createPlayer('Andre Russell', 200, true, 'AR'),
    ]
  },
  // 180 CAPPED PLAYERS (Unique Names)
  ...[
    { name: 'Capped Batsmen', count: 45, names: ['Abhishek Sharma', 'Rinku Singh', 'Warner', 'Williamson', 'du Plessis', 'Agarwal', 'Padikkal', 'Rahane', 'Shaw', 'Brook', 'Hetmyer', 'Mitchell', 'Rachin', 'Phillips', 'Allen', 'Gurbaz', 'Hope', 'Q de Kock', 'Ishan Kishan', 'Steve Smith', 'Joe Root', 'Markram', 'Quinton', 'Vince', 'Munro', 'Livingstone', 'Malan', 'Latham', 'Carey', 'Hales', 'Banton', 'Salt', 'Bairstow', 'Guptill', 'Rossouw', 'Conway', 'Handscomb', 'Nair', 'Dhawan', 'Vijay', 'Rayudu', 'Uthappa', 'Pandey', 'Tiwarra', 'Karthik', 'Saha', 'Bharat'] },
    { name: 'Capped Wicket Keepers', count: 45, names: ['Sanju Samson', 'Nicholas Pooran', 'J Bairstow', 'Phil Salt', 'S Billings', 'M Wade', 'J Inglis', 'S Hope', 'T Latham', 'KS Bharat', 'D Karthik', 'W Saha', 'D Jurel', 'J Sharma', 'Ramkrishna', 'Jagadeesan', 'Goswami', 'Dhillon', 'Harvik', 'Lokesh', 'Evin Lewis', 'Tom Blundell', 'Tim Seifert', 'Glenn Phillips', 'Heinrich Klaasen', 'Josh Philippe', 'Jordan Silk', 'Ben Duckett', 'Ollie Pope', 'Alex Carey', 'Sam Harper', 'Josh Da Silva', 'Azam Khan', 'Mohammad Rizwan', 'Litton Das', 'Mushfiqur', 'Kusal Mendis', 'Sadeera', 'Nicholas', 'Tristan Stubbs', 'Harry Brook', 'R Powell', 'Sherfane', 'A Gurbaz', 'Rizwan'] },
    { name: 'Capped Bowlers', count: 45, names: ['Mayank Yadav', 'Harshit Rana', 'Boult', 'Rabada', 'Nortje', 'Siraj', 'Kuldeep', 'Bishnoi', 'Zampa', 'Chakaravarthy', 'Mukesh', 'Avesh', 'Khaleel', 'Natarajan', 'Mohit', 'Sandeep', 'Shami', 'Bumrah', 'Starc', 'Hazlewood', 'Cummins', 'Josh', 'Mujeeb', 'Naveen-ul-Haq', 'Fazalhaq', 'Madushanka', 'Theekshana', 'Hasaranga', 'Noor', 'Taskin', 'Mustafizur', 'Shoriful', 'Ebadot', 'Mark Wood', 'Jofra Archer', 'Chris Jordan', 'Reece Topley', 'Adil Rashid', 'Ollie Robinson', 'Pat Cummins', 'Jhye Richardson', 'Kane Richardson', 'Riley Meredith', 'Adam Zampa', 'Nathan Lyon', 'Ish Sodhi', 'Lockie Ferguson'] },
    { name: 'Capped All-rounders', count: 45, names: ['Riyan Parag', 'Nitish Kumar Reddy', 'Maxwell', 'Stoinis', 'Curran', 'Green', 'Axar', 'Washington', 'Krunal', 'Livingstone', 'Ali', 'Stokes', 'Woakes', 'M Jansen', 'Shankara', 'Venkatesh', 'Shivam', 'Hardik', 'Jadeja', 'Narine', 'Russell', 'Rashid', 'Omarzai', 'Neesham', 'Santner', 'Bracewell', 'Sodhi', 'Henry', 'Jamieson', 'Southee', 'Milne', 'Boult', 'Rabada', 'Shamsi', 'Pretorius', 'Parnell', 'Ngidi', 'Coetzee', 'Burger', 'Maphaka', 'Keshav', 'Maharaj', 'Rishad', 'Siddarth', 'Harpreet', 'Rahul T', 'Vijay Shankar'] }
  ].map((cat, i) => ({
    id: 3 + i, name: `Set: ${cat.name}`,
    players: cat.names.slice(0, cat.count).map((name, j) => {
        const isForeign = j % 3 === 0;
        const basePrice = j % 10 === 0 ? 200 : (j % 5 === 0 ? 100 : 50);
        const roles = ['BAT', 'WK', 'BOWL', 'AR'];
        const role = cat.name.includes('Batsmen') ? 'BAT' : (cat.name.includes('Keepers') ? 'WK' : (cat.name.includes('Bowlers') ? 'BOWL' : 'AR'));
        return createPlayer(name, basePrice, isForeign, role);
    })
  })),
  // 200 UNCAPPED PLAYERS (Unique Labels)
  ...[
    { name: 'Uncapped Batsmen', names: ['Rajat Patidar', 'Sai Sudharsan', 'Ayush Badoni', 'Nehal Wadhera', 'Ashutosh Sharma', 'Sameer Rizvi', 'Swastik Chhikara', 'Angkrish Raghuvanshi', 'Manish Pandey', 'Prithvi Shaw', 'Devdutt Padikkal', 'Karun Nair', 'Abdul Samad', 'Shahrukh Khan', 'Rahul Tripathi', 'Priyam Garg', 'Yash Dhull', 'Nishant Sindhu'] },
    { name: 'Uncapped Wicket Keepers', names: ['Dhruv Jurel', 'Jitesh Sharma', 'Prabhsimran Singh', 'Abhishek Porel', 'Anuj Rawat', 'Upendra Yadav', 'Kumar Kushagra', 'Robin Minz', 'Vishnu Vinod', 'Sumit Kumar', 'Dinesh Karthik', 'KS Bharat', 'Naman Dhir', 'Harvik Desai', 'Luvnith Sisodia', 'Arjun Tendulkar', 'Aryan Juyal', 'B Indrajith', 'Sheldon Jackson', 'Sreevats Goswami'] },
    { name: 'Uncapped Bowlers', names: ['Vaibhav Arora', 'Tushar Deshpande', 'Kartik Tyagi', 'Chetan Sakariya', 'Yash Thakur', 'Vidwath Kaverappa', 'Vyshak Vijaykumar', 'Manav Suthar', 'Mohit Sharma', 'Sandeep Sharma', 'Ishant Sharma', 'Umesh Yadav', 'Jaydev Unadkat', 'Navdeep Saini', 'Kamlesh Nagarkoti', 'Shivam Mavi', 'Arshdeep Singh', 'Umran Malik'] },
    { name: 'Uncapped All-rounders', names: ['Ramandeep Singh', 'Shahrukh Khan', 'Rahul Tewatia', 'Lalit Yadav', 'Mahipal Lomror', 'Deepak Hooda', 'Krunal Pandya', 'Abdul Samad', 'Vivrant Sharma', 'Sanvir Singh', 'Swapnil Singh', 'Raj Angad Bawa', 'Hangargekar', 'Hrithik Shokeen', 'Shams Mulani', 'Atit Sheth', 'Shahbaz Ahmed', 'Mansi Singh'] }
  ].map((cat, i) => ({
    id: 7 + i, name: `Set: ${cat.name}`,
    players: [
        ...cat.names.map(name => createPlayer(name, 20, false, cat.name.includes('Batsmen') ? 'BAT' : (cat.name.includes('Keepers') ? 'WK' : (cat.name.includes('Bowlers') ? 'BOWL' : 'AR')))),
        ...Array.from({ length: 30 }, (_, j) => createPlayer(`Dom. Talent ${cat.name.charAt(0)}${j + 1}`, 20, false, cat.name.includes('Batsmen') ? 'BAT' : (cat.name.includes('Keepers') ? 'WK' : (cat.name.includes('Bowlers') ? 'BOWL' : 'AR'))))
    ]
  }))
];

module.exports = { teams, lists };


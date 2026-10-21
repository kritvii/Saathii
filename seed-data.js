// Starter data inserted into MongoDB on first start (and topped up on later starts).
// Each item has a stable `seed_key`, so restarting the server never creates duplicates.
// Set SEED_SAMPLE_DATA=false in .env to skip the sample opportunities.

const opportunities = [
  {
    seed_key: 'community-garden',
    title: 'Weekend Community Garden',
    organization_name: 'Neighbourhood Green Group',
    organization_type: 'ngo',
    description: 'Help local residents grow fresh produce and build a greener neighbourhood. Tasks include planting, watering, composting and showing new volunteers around.',
    category: 'Environment',
    opportunity_type: 'Volunteer',
    location: 'Mumbai, Maharashtra',
    commitment: 'Saturdays, 7–10 am',
    requirements: 'Comfortable shoes and a willingness to learn.'
  },
  {
    seed_key: 'digital-skills',
    title: 'Digital Skills for Everyone',
    organization_name: 'Community Learning Circle',
    organization_type: 'ngo',
    description: 'Support a small-group workshop teaching digital basics and online safety: using UPI safely, spotting scam messages and video-calling family.',
    category: 'Education',
    opportunity_type: 'Volunteer',
    location: 'Hybrid',
    is_remote: true,
    commitment: '2 hours a week',
    requirements: 'Patience and basic digital skills.'
  },
  {
    seed_key: 'food-drive',
    title: 'Community Food Drive',
    organization_name: 'Neighbourhood Food Bank',
    organization_type: 'ngo',
    description: 'Help sort donations, prepare food kits and coordinate distribution to families in the area.',
    category: 'Community Support',
    opportunity_type: 'Event',
    location: 'Mumbai, Maharashtra',
    commitment: 'One 3-hour shift',
    requirements: 'Available for a 3-hour shift.'
  },
  {
    seed_key: 'beach-cleanup',
    title: 'Sunday Beach Clean-up',
    organization_name: 'Coastal Care Volunteers',
    organization_type: 'ngo',
    description: 'Join a morning clean-up along the shoreline. Gloves and bags are provided; we finish with a short sorting session to record what was collected.',
    category: 'Environment',
    opportunity_type: 'Event',
    location: 'Juhu, Mumbai',
    commitment: 'Sunday, 6:30–9 am',
    requirements: 'Bring a water bottle and a cap.'
  },
  {
    seed_key: 'reading-buddy',
    title: 'After-school Reading Buddy',
    organization_name: 'Community Learning Circle',
    organization_type: 'ngo',
    description: 'Read with children aged 7–11 in Hindi, Marathi or English and help them build confidence with stories and simple comprehension games.',
    category: 'Education',
    opportunity_type: 'Volunteer',
    location: 'Andheri, Mumbai',
    commitment: '2 afternoons a week',
    requirements: 'Comfortable reading aloud; a background check is required.'
  },
  {
    seed_key: 'elder-calls',
    title: 'Friendly Phone Calls for Seniors',
    organization_name: 'Elder Connect Network',
    organization_type: 'ngo',
    description: 'Call older adults who live alone for a weekly chat, check how they are doing and flag anything they need help with.',
    category: 'Health & Wellbeing',
    opportunity_type: 'Volunteer',
    location: 'Remote',
    is_remote: true,
    commitment: '1 hour a week',
    requirements: 'Kind, patient listener. Training session provided.'
  },
  {
    seed_key: 'cafe-weekend-staff',
    title: 'Weekend Café Assistant (Part-time)',
    organization_name: 'Neighbourhood Bakery & Café',
    organization_type: 'business',
    description: 'Serve customers, manage the counter and keep the café tidy on busy weekends. Good first job for students.',
    category: 'Food & Drink',
    opportunity_type: 'Part-time Job',
    location: 'Bandra, Mumbai',
    commitment: 'Sat & Sun, 9 am–3 pm',
    requirements: 'Friendly, punctual; 18+.'
  },
  {
    seed_key: 'social-media-intern',
    title: 'Social Media Intern for Local Shops',
    organization_name: 'Local Shops Collective',
    organization_type: 'business',
    description: 'Create simple posts and reels for a group of neighbourhood shops and help them reach more customers online.',
    category: 'Marketing',
    opportunity_type: 'Internship',
    location: 'Hybrid',
    is_remote: true,
    commitment: '3 months, 10 hours a week',
    requirements: 'Basic Canva or video editing; a portfolio is a plus.'
  },
  {
    seed_key: 'repair-apprentice',
    title: 'Electronics Repair Apprentice',
    organization_name: 'Repair & Tailoring Studio',
    organization_type: 'business',
    description: 'Learn to diagnose and repair phones, fans and small appliances alongside an experienced technician.',
    category: 'Skills & Trades',
    opportunity_type: 'Internship',
    location: 'Dadar, Mumbai',
    commitment: '6 weeks, weekday mornings',
    requirements: 'Curious and careful with your hands. No experience needed.'
  },
  {
    seed_key: 'blood-donation-camp',
    title: 'Blood Donation Camp Volunteers',
    organization_name: 'Neighbourhood Health Volunteers',
    organization_type: 'ngo',
    description: 'Welcome donors, manage registrations and serve refreshments at a one-day blood donation camp run with a local hospital.',
    category: 'Health & Wellbeing',
    opportunity_type: 'Event',
    location: 'Thane, Maharashtra',
    commitment: 'One day, 9 am–4 pm',
    requirements: 'Good with people; registration desk training on the day.'
  },
  {
    seed_key: 'tree-plantation',
    title: 'Monsoon Tree Plantation Drive',
    organization_name: 'Neighbourhood Green Group',
    organization_type: 'ngo',
    description: 'Plant native saplings in a community open space and sign up to water and care for them over the following months.',
    category: 'Environment',
    opportunity_type: 'Event',
    location: 'Navi Mumbai, Maharashtra',
    commitment: 'Half day',
    requirements: 'Clothes you do not mind getting muddy.'
  },
  {
    seed_key: 'math-tutor-online',
    title: 'Online Maths Tutor (Class 8–10)',
    organization_name: 'Community Learning Circle',
    organization_type: 'ngo',
    description: 'Tutor students preparing for board exams over video calls. Lesson plans and practice sheets are shared in advance.',
    category: 'Education',
    opportunity_type: 'Volunteer',
    location: 'Remote',
    is_remote: true,
    commitment: '2 sessions a week, 1 hour each',
    requirements: 'Strong school-level maths and a stable internet connection.'
  }
];

// Established NGOs shown on the NGOs page. Links go to their own websites.
const listedNgos = [
  { seed_key: 'akshaya-patra', name: 'The Akshaya Patra Foundation', category: 'Food & nutrition', website: 'https://www.akshayapatra.org', description: 'Works with government and state partners to serve school mid-day meals so hunger does not keep children out of class.', location: 'Bengaluru' },
  { seed_key: 'magic-bus', name: 'Magic Bus India Foundation', category: 'Education & livelihood', website: 'https://magicbus.org', description: 'Founded in Mumbai in 1999. Uses life-skills and sport-based programmes to help young people finish school and move into work.', location: 'Mumbai' },
  { seed_key: 'goonj', name: 'Goonj', category: 'Disaster relief & dignity', website: 'https://goonj.org', description: 'Turns urban surplus such as clothing and household material into resources for rural development and disaster relief.', location: 'New Delhi' },
  { seed_key: 'smile-foundation', name: 'Smile Foundation', category: 'Education & health', website: 'https://www.smilefoundationindia.org', description: 'Runs education, healthcare, livelihood and women empowerment programmes for children and families.', location: 'New Delhi' },
  { seed_key: 'pratham', name: 'Pratham', category: 'Education', website: 'https://www.pratham.org', description: 'Works on foundational learning, reading and maths for children, and on youth skilling.', location: 'Mumbai & across India' },
  { seed_key: 'cry', name: 'CRY – Child Rights and You', category: 'Child rights', website: 'https://www.cry.org', description: "Works with communities to protect children's rights to education, health and protection.", location: 'Mumbai & across India' },
  { seed_key: 'helpage', name: 'HelpAge India', category: 'Elder care', website: 'https://www.helpageindia.org', description: 'Supports older people with healthcare, livelihood help and advocacy for their rights.', location: 'New Delhi & across India' },
  { seed_key: 'teach-for-india', name: 'Teach For India', category: 'Education', website: 'https://www.teachforindia.org', description: 'Places fellows in under-resourced classrooms and builds a network working toward equal educational opportunity.', location: 'Mumbai & across India' }
];

module.exports = { opportunities, listedNgos };

/**
 * AthletesBridge — Database Seeder
 * Run: node seed.js
 * 
 * Seeds 15 realistic athletes, 50+ performances, and 8 opportunities.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Athlete = require('./models/Athlete');
const Performance = require('./models/Performance');
const Opportunity = require('./models/Opportunity');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/athletes-platform';

const athletes = [
  { name: 'Arjun Mehta', email: 'arjun.mehta@example.com', phone: '+91 98765 43210', age: 19, state: 'Rajasthan', city: 'Jodhpur', sports: ['Athletics', 'Kabaddi'], isRural: true, bio: 'A passionate sprinter from rural Rajasthan who dreams of representing India at the national level. Started training at age 14 with no coach — just sheer determination.' },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 87654 32109', age: 17, state: 'Madhya Pradesh', city: 'Hoshangabad', sports: ['Athletics', 'Basketball'], isRural: true, bio: 'One of the fastest female sprinters in her district. Won 3 district-level gold medals in 100m and 200m sprint events.' },
  { name: 'Ravi Kumar', email: 'ravi.kumar@example.com', phone: '+91 76543 21098', age: 21, state: 'Haryana', city: 'Sonipat', sports: ['Wrestling', 'Athletics'], isRural: true, bio: 'A former state-level wrestler transitioning to track & field. Known for explosive power and exceptional standing long jump performance.' },
  { name: 'Ananya Patel', email: 'ananya.patel@example.com', phone: '+91 65432 10987', age: 16, state: 'Gujarat', city: 'Ahmedabad', sports: ['Badminton', 'Athletics'], isRural: false, bio: 'Youngest athlete on the platform. Has been training under a professional coach for 2 years with a focus on agility and speed.' },
  { name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 54321 09876', age: 22, state: 'Punjab', city: 'Amritsar', sports: ['Athletics', 'Football'], isRural: false, bio: 'Former university champion in high jump. Currently training for national-level athletics competitions while working part-time.' },
  { name: 'Deepika Nair', email: 'deepika.nair@example.com', phone: '+91 43210 98765', age: 18, state: 'Kerala', city: 'Kozhikode', sports: ['Swimming', 'Athletics'], isRural: true, bio: 'State-level swimmer turned track athlete. Specializes in middle-distance running with exceptional endurance.' },
  { name: 'Rohit Yadav', email: 'rohit.yadav@example.com', phone: '+91 32109 87654', age: 20, state: 'Uttar Pradesh', city: 'Meerut', sports: ['Athletics', 'Cricket'], isRural: true, bio: 'From a small village near Meerut, Rohit discovered his talent during school sports day. Now he is among the top 5 sprinters in his district.' },
  { name: 'Kavita Devi', email: 'kavita.devi@example.com', phone: '+91 21098 76543', age: 19, state: 'Bihar', city: 'Patna', sports: ['Athletics', 'Volleyball'], isRural: true, bio: 'Breaking barriers as a female athlete from rural Bihar. Specializes in long jump and triple jump with impressive consistency.' },
  { name: 'Mohammed Farhan', email: 'mohammed.farhan@example.com', phone: '+91 10987 65432', age: 23, state: 'Karnataka', city: 'Mysore', sports: ['Athletics', 'Boxing'], isRural: false, bio: 'A disciplined boxer with incredible footwork. Recently shifted focus to sprints and explosive exercises for boxing conditioning.' },
  { name: 'Sita Kumari', email: 'sita.kumari@example.com', phone: '+91 98712 34567', age: 15, state: 'Jharkhand', city: 'Ranchi', sports: ['Athletics', 'Kabaddi'], isRural: true, bio: 'Discovered through a village sports talent hunt. Despite limited resources, she has shown remarkable natural talent in jumping events.' },
  { name: 'Aditya Choudhary', email: 'aditya.choudhary@example.com', phone: '+91 87612 34567', age: 24, state: 'Maharashtra', city: 'Nashik', sports: ['Athletics', 'Wrestling'], isRural: false, bio: 'A seasoned athlete with 6 years of competitive experience. Has represented Maharashtra at the national level in decathlon events.' },
  { name: 'Lakshmi Reddy', email: 'lakshmi.reddy@example.com', phone: '+91 76512 34567', age: 17, state: 'Telangana', city: 'Warangal', sports: ['Athletics', 'Badminton'], isRural: true, bio: 'A rising star from Telangana known for blazing speed in 100m dash. Dreams of getting a sports scholarship to continue her education.' },
  { name: 'Suresh Babu', email: 'suresh.babu@example.com', phone: '+91 65412 34567', age: 20, state: 'Tamil Nadu', city: 'Coimbatore', sports: ['Athletics', 'Football'], isRural: false, bio: 'A versatile athlete excelling in both sprints and football. His goal is to become a full-time professional athlete.' },
  { name: 'Meera Joshi', email: 'meera.joshi@example.com', phone: '+91 54312 34567', age: 18, state: 'Uttarakhand', city: 'Dehradun', sports: ['Athletics', 'Swimming'], isRural: true, bio: 'Trains in the mountain terrain of Uttarakhand which has given her incredible stamina. Specializes in endurance events.' },
  { name: 'Karan Thakur', email: 'karan.thakur@example.com', phone: '+91 43212 34567', age: 21, state: 'Himachal Pradesh', city: 'Shimla', sports: ['Athletics', 'Boxing'], isRural: true, bio: 'High-altitude training has made Karan one of the fittest athletes on the platform. Excels in both explosive and endurance events.' },
];

// Generate realistic performances over time
function generatePerformances(athleteId, athleteIndex) {
  const perfs = [];
  const baseDate = new Date('2025-06-01');
  const numRecords = 4 + Math.floor(Math.random() * 5); // 4-8 records

  
  const bases = [
    { jh: 55, jl: 4.2, rs: 25 }, // Arjun — good sprinter
    { jh: 48, jl: 3.8, rs: 27 }, // Priya — fast runner
    { jh: 62, jl: 5.5, rs: 22 }, // Ravi — power athlete
    { jh: 42, jl: 3.5, rs: 24 }, // Ananya — young, developing
    { jh: 78, jl: 5.0, rs: 26 }, // Vikram — elite jumper
    { jh: 45, jl: 3.8, rs: 28 }, // Deepika — fast endurance
    { jh: 50, jl: 4.0, rs: 29 }, // Rohit — good sprinter
    { jh: 40, jl: 5.2, rs: 21 }, // Kavita — jump specialist
    { jh: 52, jl: 4.3, rs: 30 }, // Farhan — explosive boxer
    { jh: 38, jl: 4.8, rs: 20 }, // Sita — young talent
    { jh: 72, jl: 5.8, rs: 31 }, // Aditya — seasoned elite
    { jh: 46, jl: 3.6, rs: 32 }, // Lakshmi — speedster
    { jh: 55, jl: 4.5, rs: 27 }, // Suresh — versatile
    { jh: 43, jl: 3.9, rs: 24 }, // Meera — endurance
    { jh: 60, jl: 5.0, rs: 26 }, // Karan — fit all-rounder
  ];

  const base = bases[athleteIndex] || { jh: 50, jl: 4.0, rs: 25 };

  for (let i = 0; i < numRecords; i++) {
    const recordDate = new Date(baseDate);
    recordDate.setDate(recordDate.getDate() + (i * 18) + Math.floor(Math.random() * 10));

    // Progressive improvement with some variance
    const improvement = i * 1.5;
    const variance = () => (Math.random() - 0.3) * 4;

    const jh = Number((base.jh + improvement + variance()).toFixed(1));
    const jl = Number((base.jl + i * 0.12 + (Math.random() - 0.3) * 0.4).toFixed(2));
    const rd = [50, 100, 200][Math.floor(Math.random() * 3)];
    const rt = Number((rd / (base.rs * 1000 / 3600 + i * 0.1 + (Math.random() - 0.3) * 0.5)).toFixed(2));
    const rs = Number((base.rs + i * 0.5 + variance() * 0.5).toFixed(1));

    const sports = ['Athletics', 'Athletics', 'Athletics', athletes[athleteIndex]?.sports?.[1] || 'Athletics'];
    
    perfs.push({
      athlete: athleteId,
      jumpHeight: jh > 0 ? jh : null,
      jumpLength: jl > 0 ? jl : null,
      runningDistance: rd,
      runningTime: rt > 0 ? rt : null,
      runningSpeed: rs > 0 ? rs : null,
      sport: sports[Math.floor(Math.random() * sports.length)],
      notes: [
        'Morning training session, felt strong.',
        'Evening session, slightly fatigued but good form.',
        'Competition day — personal best attempt.',
        'Recovery session, focused on technique.',
        'District-level trial, performed under pressure.',
        'Training with new coach, saw immediate improvements.',
        'Post-rain session, track was slightly wet.',
        'Peak performance day, all metrics looking up.',
      ][Math.floor(Math.random() * 8)],
      recordedAt: recordDate,
    });
  }

  return perfs;
}

const opportunities = [
  {
    title: 'SAI National Sports Scholarship 2026',
    description: 'The Sports Authority of India (SAI) is offering national-level scholarships for promising athletes from underprivileged backgrounds. Covers training expenses, equipment, and monthly stipend for 2 years. Priority given to rural athletes showing consistent performance improvement.',
    organization: 'Sports Authority of India',
    location: 'New Delhi',
    sport: 'Athletics',
    requirements: 'Age 14-25, Indian citizen, at least 1 year of documented training, district-level participation certificate',
    deadline: new Date('2026-06-30'),
    stipend: '₹15,000/month + Equipment',
    applicationLink: 'https://sai.gov.in/scholarships',
    isActive: true,
  },
  {
    title: 'Khelo India Youth Games Selection Trials',
    description: 'Open selection trials for the upcoming Khelo India Youth Games. Athletes selected will receive government-sponsored training at national camps with world-class facilities and coaching staff.',
    organization: 'Ministry of Youth Affairs & Sports',
    location: 'Multiple Cities',
    sport: 'Athletics',
    requirements: 'Age 14-21, state-level participation preferred, valid Aadhaar ID',
    deadline: new Date('2026-05-15'),
    stipend: 'Full Training Sponsorship',
    applicationLink: 'https://kheloindia.gov.in',
    isActive: true,
  },
  {
    title: 'Tata Sports Excellence Program',
    description: 'A corporate CSR initiative by Tata Group providing holistic athlete development including professional coaching, sports science support, nutrition, mental conditioning, and competition funding for rural athletes.',
    organization: 'Tata Trusts',
    location: 'Mumbai, Maharashtra',
    sport: 'Any',
    requirements: 'Rural background, age 15-24, demonstrated sports talent, coach recommendation letter',
    deadline: new Date('2026-08-31'),
    stipend: '₹25,000/month + Full Support',
    applicationLink: 'https://tatatrusts.org/sports',
    isActive: true,
  },
  {
    title: 'JSW Sports Inspire Institute Fellowship',
    description: 'Residential fellowship at the state-of-the-art Inspire Institute of Sport in Bellary. Includes access to Olympic-standard facilities, international coaches, and sports medicine support.',
    organization: 'JSW Sports Foundation',
    location: 'Bellary, Karnataka',
    sport: 'Athletics',
    requirements: 'Age 16-22, minimum state-level ranking, medical fitness certificate',
    deadline: new Date('2026-07-15'),
    stipend: 'Full Residential Fellowship',
    applicationLink: 'https://jsw.in/sports/inspire',
    isActive: true,
  },
  {
    title: 'KIIT University Sports Scholarship',
    description: 'Full academic scholarship along with sports training for outstanding athletes. Covers tuition, hostel, and provides access to university sports infrastructure and coaches.',
    organization: 'KIIT University',
    location: 'Bhubaneswar, Odisha',
    sport: 'Any',
    requirements: 'Passed 12th standard, age 17-23, state/national level sports certificate',
    deadline: new Date('2026-04-30'),
    stipend: 'Full Tuition + Hostel',
    applicationLink: 'https://kiit.ac.in/sports-scholarship',
    isActive: true,
  },
  {
    title: 'Olympic Gold Quest Athlete Support',
    description: 'OGQ identifies and supports potential Olympic medal prospects with world-class training, international exposure, equipment, and financial assistance. Focus on athletes from non-traditional sporting backgrounds.',
    organization: 'Olympic Gold Quest',
    location: 'Pan India',
    sport: 'Athletics',
    requirements: 'National-level results, age 16-28, coach recommendation, performance videos',
    deadline: new Date('2026-09-30'),
    stipend: '₹50,000/month',
    applicationLink: 'https://ogq.org/athletes',
    isActive: true,
  },
  {
    title: 'Reliance Foundation Youth Sports Development',
    description: 'A grassroots sports development program targeting talent from Tier 2 and Tier 3 cities. Provides training camps, talent identification clinics, and sponsor-athlete matching.',
    organization: 'Reliance Foundation',
    location: 'Multiple Locations',
    sport: 'Football',
    requirements: 'Age 12-20, passion for sport, basic fitness level',
    deadline: new Date('2026-12-31'),
    stipend: 'Training + Equipment',
    applicationLink: 'https://reliancefoundation.org/sports',
    isActive: true,
  },
  {
    title: 'Adidas Rural Athlete Sponsorship',
    description: 'Adidas India is sponsoring 50 rural athletes with full equipment kits, branded sportswear, and performance tracking technology. Selected athletes will be featured in the Adidas Grassroots Campaign.',
    organization: 'Adidas India',
    location: 'Pan India',
    sport: 'Any',
    requirements: 'Rural background, active on AthletesBridge platform, minimum 3 performance recordings',
    deadline: new Date('2026-10-15'),
    stipend: 'Equipment Kit + ₹10,000',
    applicationLink: 'https://adidas.co.in/grassroots',
    isActive: true,
  },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Athlete.deleteMany({}),
      Performance.deleteMany({}),
      Opportunity.deleteMany({}),
    ]);
    console.log('✅ Cleared.\n');

    // Create demo user
    console.log('👤 Creating demo user...');
    const demoUser = await User.create({
      name: 'Demo Admin',
      email: 'admin@athletesbridge.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`   ✅ User: admin@athletesbridge.com / admin123\n`);

    // Create athletes
    console.log('🏃 Creating 15 athletes...');
    const createdAthletes = [];
    for (const a of athletes) {
      const athlete = await Athlete.create({ ...a, user: demoUser._id });
      createdAthletes.push(athlete);
      console.log(`   ✅ ${athlete.name} (${athlete.city}, ${athlete.state})`);
    }
    console.log('');

    // Create performances
    console.log('📊 Generating performance data...');
    let totalPerfs = 0;
    for (let i = 0; i < createdAthletes.length; i++) {
      const perfs = generatePerformances(createdAthletes[i]._id, i);
      await Performance.insertMany(perfs);
      totalPerfs += perfs.length;
      console.log(`   ✅ ${createdAthletes[i].name}: ${perfs.length} sessions`);
    }
    console.log(`   📈 Total: ${totalPerfs} performance records\n`);

    // Create opportunities
    console.log('🎯 Creating 8 opportunities...');
    for (const opp of opportunities) {
      const created = await Opportunity.create({ ...opp, postedBy: demoUser._id });
      console.log(`   ✅ ${created.title}`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('═'.repeat(60));
    console.log(`   👤 1 demo user (admin@athletesbridge.com / admin123)`);
    console.log(`   🏃 ${createdAthletes.length} athletes`);
    console.log(`   📊 ${totalPerfs} performance records`);
    console.log(`   🎯 ${opportunities.length} opportunities`);
    console.log('═'.repeat(60));
    console.log('\nStart the server with: npm run dev\n');

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();

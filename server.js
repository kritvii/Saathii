require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const seed = require('./seed-data');

const PORT = Number(process.env.PORT || 3004);
const { MONGODB_URI, JWT_SECRET } = process.env;
const SEED_SAMPLE_DATA = String(process.env.SEED_SAMPLE_DATA || 'true').toLowerCase() !== 'false';

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('Missing MONGODB_URI or JWT_SECRET. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/* ------------------------------------------------------------------ */
/* Models                                                              */
/* ------------------------------------------------------------------ */
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const profileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  role: { type: String, enum: ['individual', 'business', 'ngo'], required: true },
  full_name: { type: String, required: true, maxlength: 120 },
  email: String,
  bio: { type: String, default: '', maxlength: 2000 },
  location: { type: String, default: '', maxlength: 160 },
  phone: { type: String, default: '', maxlength: 50 },
  organization_name: { type: String, default: '' },
  category: { type: String, default: '' },
  website: { type: String, default: '' }
}, { timestamps: true });

const opportunitySchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  organization_type: { type: String, enum: ['business', 'ngo'], default: 'ngo' },
  organization_name: { type: String, default: '', maxlength: 160 },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, default: '', maxlength: 4000 },
  category: { type: String, default: 'Community Support' },
  opportunity_type: { type: String, default: 'Volunteer' },
  location: { type: String, default: '' },
  is_remote: { type: Boolean, default: false },
  commitment: { type: String, default: '', maxlength: 160 },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
  requirements: { type: String, default: '' },
  is_sample: { type: Boolean, default: false },
  seed_key: { type: String, default: undefined }
}, { timestamps: true });
opportunitySchema.index({ seed_key: 1 }, { unique: true, sparse: true });

const applicationSchema = new Schema({
  opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });
applicationSchema.index({ opportunityId: 1, applicantId: 1 }, { unique: true });

const savedSchema = new Schema({
  opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
savedSchema.index({ opportunityId: 1, userId: 1 }, { unique: true });

const listedNgoSchema = new Schema({
  seed_key: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  category: String,
  website: String,
  description: String,
  location: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Opportunity = mongoose.model('Opportunity', opportunitySchema);
const Application = mongoose.model('Application', applicationSchema);
const Saved = mongoose.model('SavedOpportunity', savedSchema);
const ListedNgo = mongoose.model('ListedNgo', listedNgoSchema);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const isId = id => mongoose.isValidObjectId(id);
const dbReady = () => mongoose.connection.readyState === 1;
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function tokenFor(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

async function userFromToken(req) {
  const t = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!t) return null;
  const d = jwt.verify(t, JWT_SECRET);
  return User.findById(d.sub);
}

async function auth(req, res, next) {
  try {
    const u = await userFromToken(req);
    if (!u) return res.status(401).json({ error: 'Please log in first.' });
    req.user = u;
    next();
  } catch {
    return res.status(401).json({ error: 'Your session expired. Please log in again.' });
  }
}

// Same as auth, but lets anonymous visitors through.
async function optionalAuth(req, _res, next) {
  try { req.user = await userFromToken(req); } catch { req.user = null; }
  next();
}

function shapeOpportunity(o, extra = {}) {
  if (!o) return null;
  return {
    ...o,
    id: o._id.toString(),
    created_at: o.createdAt,
    ...extra
  };
}

async function findPublishedOpportunity(id) {
  if (!isId(id)) return null;
  return Opportunity.findOne({ _id: id, status: 'published' });
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.get('/api/health', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: dbReady() ? 'ok' : 'degraded',
    database: states[mongoose.connection.readyState] || 'unknown',
    databaseName: mongoose.connection.name || null
  });
});

// Everything below needs the database. Return a clear error instead of hanging.
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || dbReady()) return next();
  res.status(503).json({ error: 'The database is not connected yet. Check that MongoDB is running and MONGODB_URI in .env is correct.' });
});

app.post('/api/auth/register', wrap(async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 120);
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return res.status(400).json({ error: 'Name, valid email, and password of at least 8 characters are required.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(400).json({ error: e.code === 11000 ? 'An account with this email already exists.' : e.message });
  }
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
}));

app.get('/api/me', auth, (req, res) => res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } }));

app.get('/api/profile', auth, wrap(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id }).lean();
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email }, profile });
}));

app.post('/api/profile', auth, wrap(async (req, res) => {
  const b = req.body || {};
  const role = String(b.role || '').toLowerCase();
  if (!['individual', 'business', 'ngo'].includes(role)) return res.status(400).json({ error: 'Choose Individual, Business, or NGO.' });
  const full_name = String(b.full_name || req.user.name).trim().slice(0, 120);
  if (!full_name) return res.status(400).json({ error: 'Name is required.' });
  const p = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: {
      userId: req.user._id, role, full_name, email: req.user.email,
      bio: String(b.bio || '').slice(0, 2000),
      location: String(b.location || '').slice(0, 160),
      phone: String(b.phone || '').slice(0, 50),
      organization_name: String(b.organization_name || '').slice(0, 160),
      category: String(b.category || b.cause || '').slice(0, 120),
      website: String(b.website || '').slice(0, 240)
    } },
    { upsert: true, new: true, runValidators: true }
  );
  res.status(201).json({ ok: true, profile: p });
}));

// Real numbers for the home screen, counted straight from the database.
app.get('/api/stats', wrap(async (_req, res) => {
  const [opportunities, categories, registeredOrgs, listedNgos, members, applications] = await Promise.all([
    Opportunity.countDocuments({ status: 'published' }),
    Opportunity.distinct('category', { status: 'published' }),
    Profile.countDocuments({ role: { $in: ['business', 'ngo'] }, organization_name: { $nin: ['', null] } }),
    ListedNgo.countDocuments(),
    User.countDocuments(),
    Application.countDocuments()
  ]);
  res.json({
    opportunities,
    categories: categories.filter(Boolean).length,
    organizations: registeredOrgs + listedNgos,
    registeredOrganizations: registeredOrgs,
    listedNgos,
    members,
    applications
  });
}));

// Public list. If the visitor is logged in, each item says whether they applied / saved it.
app.get('/api/opportunities', optionalAuth, wrap(async (req, res) => {
  const opportunities = await Opportunity.find({ status: 'published' }).sort({ is_sample: 1, createdAt: -1 }).lean();
  let applied = new Map(), saved = new Set();
  if (req.user) {
    const [apps, sv] = await Promise.all([
      Application.find({ applicantId: req.user._id }).select('opportunityId status').lean(),
      Saved.find({ userId: req.user._id }).select('opportunityId').lean()
    ]);
    applied = new Map(apps.map(a => [a.opportunityId.toString(), a.status]));
    saved = new Set(sv.map(s => s.opportunityId.toString()));
  }
  res.json({
    opportunities: opportunities.map(o => {
      const id = o._id.toString();
      return shapeOpportunity(o, { applied: applied.has(id), application_status: applied.get(id) || null, saved: saved.has(id) });
    })
  });
}));

app.get('/api/organizations', wrap(async (_req, res) => {
  const organizations = await Profile.find({ role: { $in: ['business', 'ngo'] }, organization_name: { $nin: ['', null] } })
    .select('role full_name organization_name bio location category website')
    .sort({ organization_name: 1 })
    .lean();
  res.json({ organizations });
}));

app.get('/api/ngos', wrap(async (_req, res) => {
  const ngos = await ListedNgo.find().sort({ createdAt: 1 }).lean();
  res.json({ ngos });
}));

app.post('/api/opportunities', auth, wrap(async (req, res) => {
  const b = req.body || {};
  const p = await Profile.findOne({ userId: req.user._id });
  if (!p || !['business', 'ngo'].includes(p.role)) return res.status(403).json({ error: 'Complete a Business or NGO profile first.' });
  if (!String(b.title || '').trim()) return res.status(400).json({ error: 'Opportunity title is required.' });
  const opportunity = await Opportunity.create({
    ownerId: req.user._id,
    organization_type: p.role,
    organization_name: p.organization_name || p.full_name,
    title: String(b.title).trim().slice(0, 180),
    description: String(b.description || '').slice(0, 4000),
    category: String(b.category || 'Community Support').slice(0, 120),
    opportunity_type: String(b.opportunity_type || 'Volunteer').slice(0, 60),
    location: String(b.location || '').slice(0, 160),
    is_remote: b.is_remote === true || b.is_remote === 'on' || b.is_remote === 'true',
    commitment: String(b.commitment || '').slice(0, 160),
    status: 'published',
    requirements: String(b.requirements || '').slice(0, 2000)
  });
  res.status(201).json({ opportunity: shapeOpportunity(opportunity.toObject()) });
}));

app.post('/api/opportunities/:id/apply', auth, wrap(async (req, res) => {
  const opp = await findPublishedOpportunity(req.params.id);
  if (!opp) return res.status(404).json({ error: 'This opportunity is no longer available.' });
  if (opp.ownerId && opp.ownerId.equals(req.user._id)) return res.status(400).json({ error: 'You cannot apply to your own opportunity.' });
  const application = await Application.findOneAndUpdate(
    { opportunityId: opp._id, applicantId: req.user._id },
    { $setOnInsert: { message: String(req.body?.message || '').slice(0, 2000), status: 'pending' } },
    { upsert: true, new: true, runValidators: true }
  );
  res.status(201).json({ ok: true, application });
}));

app.delete('/api/opportunities/:id/apply', auth, wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid opportunity.' });
  await Application.deleteOne({ opportunityId: req.params.id, applicantId: req.user._id, status: 'pending' });
  res.json({ ok: true });
}));

app.post('/api/opportunities/:id/save', auth, wrap(async (req, res) => {
  const opp = await findPublishedOpportunity(req.params.id);
  if (!opp) return res.status(404).json({ error: 'This opportunity is no longer available.' });
  await Saved.updateOne(
    { opportunityId: opp._id, userId: req.user._id },
    { $setOnInsert: { opportunityId: opp._id, userId: req.user._id } },
    { upsert: true }
  );
  res.status(201).json({ ok: true });
}));

app.delete('/api/opportunities/:id/save', auth, wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid opportunity.' });
  await Saved.deleteOne({ opportunityId: req.params.id, userId: req.user._id });
  res.json({ ok: true });
}));

// Everything the dashboard needs, with the full opportunity attached to each item.
app.get('/api/dashboard', auth, wrap(async (req, res) => {
  const [applications, saved, posted] = await Promise.all([
    Application.find({ applicantId: req.user._id }).sort({ createdAt: -1 }).populate('opportunityId').lean(),
    Saved.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate('opportunityId').lean(),
    Opportunity.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).lean()
  ]);

  const appliedIds = new Set(applications.filter(a => a.opportunityId).map(a => a.opportunityId._id.toString()));
  const applicantCounts = posted.length
    ? await Application.aggregate([
      { $match: { opportunityId: { $in: posted.map(o => o._id) } } },
      { $group: { _id: '$opportunityId', count: { $sum: 1 } } }
    ])
    : [];
  const countMap = new Map(applicantCounts.map(c => [c._id.toString(), c.count]));

  res.json({
    applications: applications.filter(a => a.opportunityId).map(a => ({
      id: a._id.toString(),
      status: a.status,
      message: a.message,
      applied_at: a.createdAt,
      opportunity: shapeOpportunity(a.opportunityId)
    })),
    saved: saved.filter(s => s.opportunityId).map(s => ({
      id: s._id.toString(),
      saved_at: s.createdAt,
      opportunity: shapeOpportunity(s.opportunityId, { applied: appliedIds.has(s.opportunityId._id.toString()) })
    })),
    opportunities: posted.map(o => shapeOpportunity(o, { applicants: countMap.get(o._id.toString()) || 0 }))
  });
}));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'), err => { if (err) next(err); });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

/* ------------------------------------------------------------------ */
/* Database connection + seeding                                       */
/* ------------------------------------------------------------------ */
async function seedDatabase() {
  // Listed NGOs (always kept in sync so the NGO page and counts come from the database).
  await ListedNgo.bulkWrite(seed.listedNgos.map(n => ({
    updateOne: { filter: { seed_key: n.seed_key }, update: { $set: n }, upsert: true }
  })));

  if (!SEED_SAMPLE_DATA) return;
  let added = 0;
  for (const o of seed.opportunities) {
    const { seed_key, ...fields } = o;
    // Also matches the 3 starter opportunities created by the previous version (no seed_key).
    const r = await Opportunity.updateOne(
      { $or: [{ seed_key }, { title: fields.title, ownerId: null }] },
      {
        $set: { seed_key, is_sample: true, organization_name: fields.organization_name, commitment: fields.commitment || '' },
        $setOnInsert: { ...Object.fromEntries(Object.entries(fields).filter(([k]) => !['organization_name', 'commitment'].includes(k))), ownerId: null, status: 'published' }
      },
      { upsert: true }
    );
    added += r.upsertedCount || 0;
  }
  if (added) console.log(`Added ${added} sample opportunities.`);
}

function describeUri(uri) {
  try {
    const u = new URL(uri);
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch {
    return '(invalid MONGODB_URI)';
  }
}

async function connectWithRetry(attempt = 1) {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log(`MongoDB connected → ${describeUri(MONGODB_URI)} (database "${mongoose.connection.name}")`);
    await Promise.all([Opportunity.syncIndexes(), ListedNgo.syncIndexes()]);
    await seedDatabase();
  } catch (e) {
    console.error(`MongoDB connection failed (attempt ${attempt}): ${e.message}`);
    if (attempt === 1) {
      console.error('  • Local MongoDB: make sure it is running (macOS: brew services start mongodb-community).');
      console.error('  • Atlas: check the username/password in the URI and add your IP under Network Access.');
    }
    const wait = Math.min(30, attempt * 5);
    console.error(`  Retrying in ${wait}s… (the site stays up and shows a database notice until then)`);
    setTimeout(() => connectWithRetry(attempt + 1), wait * 1000);
  }
}

mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected.'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected.'));

app.listen(PORT, () => console.log(`Saathi is running at http://localhost:${PORT}`));
connectWithRetry();

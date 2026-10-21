// Quick connectivity test: `npm run db:check`
require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI is missing from .env'); process.exit(1); }
const safe = uri.replace(/\/\/[^@/]*@/, '//<user>:<password>@');
console.log('Connecting to', safe, '…');
mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  .then(async () => {
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    console.log(`✓ Connected to database "${db.databaseName}"`);
    for (const c of cols.sort((a, b) => a.name.localeCompare(b.name))) {
      console.log(`  ${c.name.padEnd(22)} ${await db.collection(c.name).countDocuments()} documents`);
    }
    if (!cols.length) console.log('  (empty — start the server once with `npm start` to create and seed collections)');
    await mongoose.disconnect();
  })
  .catch(e => {
    console.error('✗ Could not connect:', e.message);
    console.error('  Local: is MongoDB running? (macOS: brew services start mongodb-community)');
    console.error('  Atlas: check user/password in the URI and allow your IP under Network Access.');
    process.exit(1);
  });

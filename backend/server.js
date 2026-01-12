import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from './config.js';

const app = express();
const PORT = config.port;

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.logging.enableRequestLogging) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// In-memory data store (replace with SQL Server in production)
let users = [
  {
    id: '1',
    username: 'staff1',
    name: 'Rajesh Kumar',
    role: 'staff',
    isActive: true,
    pin: '1234',
  },
  {
    id: '2',
    username: 'staff2',
    name: 'Priya Sharma',
    role: 'staff',
    isActive: true,
    pin: '5678',
  },
  {
    id: '3',
    username: 'supervisor1',
    name: 'Amit Patel',
    role: 'supervisor',
    isActive: true,
    pin: '1111',
    assignedScope: {
      floors: ['ground', 'first'],
    },
  },
  {
    id: '4',
    username: 'admin1',
    name: 'Manager',
    role: 'admin',
    isActive: true,
    pin: '0000',
  },
];

let sessions = [];
let entries = [];
let items = [
  {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra',
    itemCode: 'MOB-SAM-S24U-001',
    barcode: '8801234567890',
    serialBarcode: '5101234567890',
    category: 'Electronics',
    subCategory: 'Mobile Phones',
    brand: 'Samsung',
    mrp: 134999,
    salePrice: 129999,
    costPrice: 120000,
    systemStock: 15,
    uom: 'PCS',
    isSerialized: true,
    taxClassification: { gstPercent: 18, hsn: '8517' },
    variants: [
      { barcode: '8801234567891', systemStock: 8, uom: 'PCS' },
      { barcode: '8801234567892', systemStock: 5, uom: 'PCS' },
    ],
  },
  {
    id: '2',
    name: 'Apple iPhone 15 Pro Max',
    itemCode: 'MOB-APP-IP15PM-001',
    barcode: '1901234567890',
    serialBarcode: '5201234567890',
    category: 'Electronics',
    subCategory: 'Mobile Phones',
    brand: 'Apple',
    mrp: 159900,
    salePrice: 154900,
    costPrice: 145000,
    systemStock: 12,
    uom: 'PCS',
    isSerialized: true,
    taxClassification: { gstPercent: 18, hsn: '8517' },
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5 Headphones',
    itemCode: 'AUD-SON-WH1000XM5-001',
    barcode: '4901234567890',
    serialBarcode: '5301234567890',
    category: 'Electronics',
    subCategory: 'Audio',
    brand: 'Sony',
    mrp: 29990,
    salePrice: 26990,
    costPrice: 25000,
    systemStock: 25,
    uom: 'PCS',
    isSerialized: true,
    taxClassification: { gstPercent: 18, hsn: '8518' },
  },
  {
    id: '4',
    name: 'LG 55" OLED TV C3',
    itemCode: 'TV-LG-55OLED-C3-001',
    barcode: '8801234500001',
    category: 'Electronics',
    subCategory: 'Televisions',
    brand: 'LG',
    mrp: 139990,
    salePrice: 129990,
    costPrice: 120000,
    systemStock: 5,
    uom: 'PCS',
    isSerialized: true,
    isBundleEnabled: true,
    taxClassification: { gstPercent: 28, hsn: '8528' },
  },
  {
    id: '5',
    name: 'Duracell AA Batteries 4-Pack',
    itemCode: 'BAT-DUR-AA4PK-001',
    barcode: '5001234567890',
    category: 'Electronics',
    subCategory: 'Batteries',
    brand: 'Duracell',
    mrp: 299,
    salePrice: 249,
    costPrice: 200,
    systemStock: 150,
    uom: 'PKT',
    isSerialized: false,
    taxClassification: { gstPercent: 18, hsn: '8506' },
  },
  {
    id: '6',
    name: 'Philips LED Bulb 9W',
    itemCode: 'LGT-PHI-LED9W-001',
    barcode: '8901234567890',
    category: 'Lighting',
    subCategory: 'LED Bulbs',
    brand: 'Philips',
    mrp: 149,
    salePrice: 129,
    costPrice: 100,
    systemStock: 200,
    uom: 'PCS',
    isSerialized: false,
    taxClassification: { gstPercent: 18, hsn: '8539' },
  },
  {
    id: '7',
    name: 'Bosch Power Drill Kit',
    itemCode: 'TLS-BOS-DRILL-001',
    barcode: '4001234567890',
    category: 'Tools',
    subCategory: 'Power Tools',
    brand: 'Bosch',
    mrp: 8999,
    salePrice: 7999,
    costPrice: 7000,
    systemStock: 18,
    uom: 'SET',
    isSerialized: true,
    isBundleEnabled: true,
    taxClassification: { gstPercent: 18, hsn: '8467' },
  },
  {
    id: '8',
    name: 'Prestige Pressure Cooker 5L',
    itemCode: 'KIT-PRE-PC5L-001',
    barcode: '8901234500002',
    category: 'Kitchen',
    subCategory: 'Cookware',
    brand: 'Prestige',
    mrp: 2499,
    salePrice: 2199,
    costPrice: 1800,
    systemStock: 30,
    uom: 'PCS',
    isSerialized: false,
    taxClassification: { gstPercent: 18, hsn: '7323' },
  },
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stock Verify Backend API' });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password, pin } = req.body;
  
  let user = null;
  if (pin) {
    user = users.find((u) => u.pin === pin && u.isActive);
  } else if (username) {
    user = users.find((u) => u.username === username && u.isActive);
  }
  
  if (user) {
    res.json({ success: true, user: { ...user, pin: undefined } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Items endpoints
app.get('/api/items', (req, res) => {
  res.json(items);
});

app.get('/api/items/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 3) {
    return res.json([]);
  }
  
  const prefix = q.substring(0, 2);
  const isBarcodePrefix = prefix === '51' || prefix === '52' || prefix === '53';
  
  if (isBarcodePrefix) {
    const results = items.filter(
      (item) =>
        item.barcode.includes(q) ||
        item.serialBarcode?.includes(q) ||
        item.variants?.some((v) => v.barcode.includes(q))
    );
    res.json(results);
  } else {
    const lowerQuery = q.toLowerCase();
    const results = items.filter((item) => item.name.toLowerCase().includes(lowerQuery));
    res.json(results);
  }
});

app.get('/api/items/barcode/:barcode', (req, res) => {
  const { barcode } = req.params;
  const item =
    items.find((i) => i.barcode === barcode) ||
    items.find((i) => i.serialBarcode === barcode) ||
    items.find((i) => i.variants?.some((v) => v.barcode === barcode));
  
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

app.get('/api/items/:id', (req, res) => {
  const item = items.find((i) => i.id === req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

// Sessions endpoints
app.get('/api/sessions', (req, res) => {
  const { userId, status } = req.query;
  let filtered = sessions;
  
  if (userId) {
    filtered = filtered.filter((s) => s.userId === userId);
  }
  if (status) {
    filtered = filtered.filter((s) => s.status === status);
  }
  
  res.json(filtered);
});

app.post('/api/sessions', (req, res) => {
  const newSession = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    totalScanned: 0,
    totalVerified: 0,
    status: 'active',
  };
  sessions.push(newSession);
  res.json(newSession);
});

app.put('/api/sessions/:id', (req, res) => {
  const index = sessions.findIndex((s) => s.id === req.params.id);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...req.body };
    res.json(sessions[index]);
  } else {
    res.status(404).json({ message: 'Session not found' });
  }
});

app.post('/api/sessions/:id/submit', (req, res) => {
  const session = sessions.find((s) => s.id === req.params.id);
  if (session) {
    session.status = 'submitted';
    session.submittedAt = new Date().toISOString();
    res.json(session);
  } else {
    res.status(404).json({ message: 'Session not found' });
  }
});

// Entries endpoints
app.get('/api/entries', (req, res) => {
  const { sessionId, verificationStatus } = req.query;
  let filtered = entries;
  
  if (sessionId) {
    filtered = filtered.filter((e) => e.sessionId === sessionId);
  }
  if (verificationStatus) {
    filtered = filtered.filter((e) => e.verificationStatus === verificationStatus);
  }
  
  res.json(filtered);
});

app.post('/api/entries', (req, res) => {
  const newEntry = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    verificationStatus: 'pending',
  };
  entries.push(newEntry);
  res.json(newEntry);
});

app.put('/api/entries/:id', (req, res) => {
  const index = entries.findIndex((e) => e.id === req.params.id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...req.body };
    res.json(entries[index]);
  } else {
    res.status(404).json({ message: 'Entry not found' });
  }
});

app.post('/api/entries/:id/approve', (req, res) => {
  const { supervisorId, remarks } = req.body;
  const entry = entries.find((e) => e.id === req.params.id);
  if (entry) {
    entry.verificationStatus = 'approved';
    entry.verifiedBy = supervisorId;
    entry.verifiedAt = new Date().toISOString();
    entry.supervisorRemarks = remarks;
    res.json(entry);
  } else {
    res.status(404).json({ message: 'Entry not found' });
  }
});

app.post('/api/entries/:id/reject', (req, res) => {
  const { supervisorId, reason, remarks } = req.body;
  const entry = entries.find((e) => e.id === req.params.id);
  if (entry) {
    entry.verificationStatus = 'rejected';
    entry.verifiedBy = supervisorId;
    entry.verifiedAt = new Date().toISOString();
    entry.rejectionReason = reason;
    entry.supervisorRemarks = remarks;
    res.json(entry);
  } else {
    res.status(404).json({ message: 'Entry not found' });
  }
});

app.post('/api/entries/:id/recount', (req, res) => {
  const { supervisorId, reason, assignToUserId } = req.body;
  const originalEntry = entries.find((e) => e.id === req.params.id);
  if (originalEntry) {
    originalEntry.verificationStatus = 'recount';
    originalEntry.recountAssignedTo = assignToUserId;
    originalEntry.recountRequestedAt = new Date().toISOString();
    
    const recountEntry = {
      ...originalEntry,
      id: Date.now().toString(),
      isRecount: true,
      originalEntryId: req.params.id,
      createdAt: new Date().toISOString(),
      verificationStatus: 'pending',
    };
    entries.push(recountEntry);
    res.json({ original: originalEntry, recount: recountEntry });
  } else {
    res.status(404).json({ message: 'Entry not found' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const { userId, userRole } = req.query;
  
  const userSessions = userRole === 'admin' 
    ? sessions 
    : sessions.filter((s) => s.userId === userId);
  
  const userEntries = entries.filter((e) =>
    userSessions.some((s) => s.id === e.sessionId)
  );
  
  const stats = {
    totalScanned: userEntries.length,
    totalVerified: userEntries.filter((e) => e.verificationStatus === 'approved').length,
    totalRacksFinished: userSessions.filter((s) => s.status === 'completed').length,
    shortItems: userEntries.filter((e) => e.variance < 0).length,
    overItems: userEntries.filter((e) => e.variance > 0).length,
    matchedItems: userEntries.filter((e) => e.variance === 0).length,
  };
  
  if (userRole === 'supervisor' || userRole === 'admin') {
    stats.pendingVerifications = entries.filter((e) => e.verificationStatus === 'pending').length;
    stats.activeSessions = userSessions.filter((s) => s.status === 'active').length;
  }
  
  res.json(stats);
});

// Pending verifications
app.get('/api/verifications/pending', (req, res) => {
  const pendingEntries = entries.filter(
    (e) => e.verificationStatus === 'pending' || e.verificationStatus === 'recount'
  );
  
  const result = pendingEntries.map((entry) => {
    const session = sessions.find((s) => s.id === entry.sessionId);
    const item = items.find((i) => i.id === entry.itemId);
    const user = users.find((u) => u.id === session?.userId);
    return {
      entry,
      session,
      item,
      staffName: user?.name || 'Unknown',
    };
  });
  
  res.json(result);
});

// Users
app.get('/api/users', (req, res) => {
  res.json(users.map((u) => ({ ...u, pin: undefined })));
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (user) {
    res.json({ ...user, pin: undefined });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Stock Verify Backend API running on http://localhost:${PORT}`);
  console.log(`📡 Ready for ngrok tunnel`);
});

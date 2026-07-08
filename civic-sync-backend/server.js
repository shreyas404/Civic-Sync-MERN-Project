import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra'; // Use fs-extra

// --- CONFIGURATION ---
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// --- ENV VARIABLE CHECKS ---
const MONGO_URI = process.env.MONGODB_URI; // Updated to match your .env file
if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in your .env file.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in your .env file.");
  process.exit(1);
}

// --- FILE UPLOAD (Multer) CONFIG ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir); // Automatically create the 'uploads' directory

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadsDir));

// --- MONGODB CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    seedRewards(); // Run the seed function
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// --- MONGODB MODELS (Database Schemas) ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  points: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// ** UPDATED **: Added fields for resolution proof and rating
const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  imageUrl: { type: String, required: true }, // User's photo
  fileType: { type: String },
  status: { type: String, enum: ['open', 'pending', 'resolved', 'merged'], default: 'open' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // --- MERGE FIELDS ---
  isDuplicate: { type: Boolean, default: false },
  mergedInto: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
  linkedReporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // --- NEW FIELDS ---
  resolvedImageUrl: { type: String }, // Admin's photo
  resolvedNotes: { type: String }, // Admin's notes
  rating: { type: Number, min: 1, max: 5 } // User's rating
});
issueSchema.index({ location: "2dsphere" });
const Issue = mongoose.model('Issue', issueSchema);

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  cost: { type: Number, required: true },
  imageUrl: { type: String }
});
const Reward = mongoose.model('Reward', rewardSchema);

const redemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
  rewardName: { type: String },
  cost: { type: Number },
  redeemedAt: { type: Date, default: Date.now }
});
const Redemption = mongoose.model('Redemption', redemptionSchema);

// --- Seed Rewards Function ---
const seedRewards = async () => {
  try {
    const count = await Reward.countDocuments();
    if (count === 0) {
      console.log("No rewards found. Seeding database...");
      const rewards = [
        { name: 'City Park T-Shirt', description: 'Official merchandise', cost: 100, imageUrl: 'https://placehold.co/300x200/6d28d9/white?text=T-Shirt' },
        { name: 'Free Coffee Voucher', description: 'At local cafe', cost: 50, imageUrl: 'https://placehold.co/300x200/ca8a04/white?text=Coffee' },
        { name: 'Tree Planted in Your Name', description: 'A plaque with your name', cost: 500, imageUrl: 'https://placehold.co/300x200/16a34a/white?text=Tree' }
      ];
      await Reward.insertMany(rewards);
      console.log("Rewards seeded successfully.");
    }
  } catch (e) {
    console.error("Error seeding rewards:", e);
  }
};

// --- AUTHENTICATION MIDDLEWARE ---
const auth = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: "No auth token, access denied." });
    const decoded = jwt.verify(token, JWT_SECRET); 
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: "Token is not valid." });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); 
    if (!user) return res.status(404).json({ msg: "User not found." });
    if (!user.isAdmin) return res.status(403).json({ msg: "Access denied: Not an admin." });
    next();
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};

// --- API ROUTES ---

// 1. USER: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Please enter all fields." });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists." });
    let isAdmin = (await User.countDocuments()) === 0;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ email, password: hashedPassword, isAdmin });
    await user.save();
    res.status(201).json({ msg: "User registered! Please log in." });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. USER: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, isToken } = req.body;
    if (!email) return res.status(400).json({ msg: "Please enter all fields." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials. (User not found)" });

    if (!isToken) { 
      if (!password) return res.status(400).json({ msg: "Please enter all fields." });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. (Password incorrect)" });
    }
    
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin, email: user.email, points: user.points }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    ); 
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        points: user.points 
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. USER: Submit a new issue
app.post('/api/issues', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, address, location } = req.body;
    if (!req.file) return res.status(400).json({ msg: "File is required." });
    if (!description) return res.status(400).json({ msg: "Description is required." });

    let locationData;
    try {
      locationData = JSON.parse(location);
    } catch (err) {
      return res.status(400).json({ msg: "Invalid location format." });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    const newIssue = new Issue({
      title, description, address,
      location: locationData,
      imageUrl,
      fileType: req.file.mimetype,
      submittedBy: req.user.id
    });
    
    await newIssue.save();
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { $inc: { points: 10 } }, 
      { new: true }
    );

    const populatedIssue = await Issue.findById(newIssue._id).populate('submittedBy', 'email');
    
    res.status(201).json({ newIssue: populatedIssue, updatedUser });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 4. USER: Get only MY issues
app.get('/api/issues/myissues', auth, async (req, res) => {
  try {
    const issues = await Issue.find({ submittedBy: req.user.id })
      .populate('submittedBy', 'email')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 5. USER: Get ALL issues (Public Feed)
app.get('/api/issues/all', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const issues = await Issue.find()
      .populate('submittedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(issues);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 6. USER: Upvote an issue
app.put('/api/issues/:id/upvote', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: "Issue not found." });

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { upvotes: req.user.id } },
      { new: true }
    ).populate('submittedBy', 'email');

    res.json(updatedIssue);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 7. USER: Rate an admin's work (and re-open)
// *** NEW ROUTE ***
app.put('/api/issues/:id/rate', auth, async (req, res) => {
  try {
    const { rating, status } = req.body;
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) return res.status(404).json({ msg: "Issue not found." });
    
    // Check if this user is the one who submitted the issue
    if (issue.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only rate your own issues." });
    }

    issue.rating = rating;
    if (status) {
      // User is re-opening the issue
      issue.status = status;
      issue.resolvedImageUrl = undefined; // Clear the old proof
      issue.resolvedNotes = undefined;
    }
    
    await issue.save();
    // Return the updated issue, populated
    const populatedIssue = await Issue.findById(issue._id).populate('submittedBy', 'email');
    res.json(populatedIssue);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// ----------------------------

// 8. USER: Get all rewards
app.get('/api/rewards', auth, async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ cost: 1 });
    res.json(rewards);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 9. USER: Redeem a reward
app.post('/api/rewards/:id/redeem', auth, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!reward) return res.status(404).json({ msg: "Reward not found." });
    if (user.points < reward.cost) {
      return res.status(400).json({ msg: "You don't have enough points!" });
    }
    user.points -= reward.cost;
    await user.save();
    const redemption = new Redemption({
      userId: user._id,
      rewardId: reward._id,
      rewardName: reward.name,
      cost: reward.cost
    });
    await redemption.save();
    res.json(user); 
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 10. USER: Get Leaderboard
app.get('/api/users/leaderboard', auth, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .sort({ points: -1 })
      .limit(10)
      .select('email points');
    
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ADMIN ROUTES ---

// 11. ADMIN: Get all issues
app.get('/api/issues', [auth, adminAuth], async (req, res) => {
  // ** UPDATED **: Include new proof/rating fields
  try {
    const issues = await Issue.aggregate([
      { $addFields: { upvoteCount: { $size: { $ifNull: ["$upvotes", []] } } } },
      { $sort: { upvoteCount: -1, createdAt: -1 }  },
      { $lookup: { from: 'users', localField: 'submittedBy', foreignField: '_id', as: 'submittedBy' } },
      { $unwind: { path: '$submittedBy', preserveNullAndEmptyArrays: true } },
      { $project: {
          _id: 1, title: 1, description: 1, address: 1, location: 1,
          imageUrl: 1, fileType: 1, status: 1, createdAt: 1,
          upvotes: 1, upvoteCount: 1,
          'submittedBy._id': '$submittedBy._id',
          'submittedBy.email': '$submittedBy.email',
          // --- Add new fields ---
          resolvedImageUrl: 1,
          resolvedNotes: 1,
          rating: 1
          // ----------------------
      }}
    ]);
    res.json(issues);
  } catch (e) {
    console.error("Error fetching admin issues:", e);
    res.status(500).json({ error: e.message });
  }
});

// 12. ADMIN: Update an issue (simple)
app.put('/api/issues/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { status, title, description } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id, 
      { status, title, description }, 
      { new: true }
    );
    if (!issue) return res.status(404).json({ msg: "Issue not found." });
    res.json(issue);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 13. ADMIN: Resolve an issue (with proof)
app.post('/api/issues/:id/resolve', [auth, adminAuth, upload.single('proof')], async (req, res) => {
  let session;
  try {
    const { notes } = req.body;
    if (!req.file) return res.status(400).json({ msg: "Proof file is required." });
    
    session = await mongoose.startSession();
    session.startTransaction();

    const resolvedImageUrl = `/uploads/${req.file.filename}`;
    
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolvedImageUrl: resolvedImageUrl,
        resolvedNotes: notes,
        rating: null // Clear any old rating
      },
      { new: true, session }
    );

    if (!updatedIssue) {
      await session.abortTransaction();
      return res.status(404).json({ msg: "Issue not found." });
    }

    // GAMIFICATION: Award 50 points to the primary reporter and all linked reporters
    const usersToReward = [updatedIssue.submittedBy];
    if (updatedIssue.linkedReporters && updatedIssue.linkedReporters.length > 0) {
      usersToReward.push(...updatedIssue.linkedReporters);
    }

    await User.updateMany(
      { _id: { $in: usersToReward } },
      { $inc: { points: 50 } },
      { session }
    );

    await session.commitTransaction();
    res.json(updatedIssue);
  } catch(e) {
    if (session) await session.abortTransaction();
    res.status(500).json({ error: e.message });
  } finally {
    if (session) session.endSession();
  }
});

// 13b. ADMIN: Merge issues
app.post('/api/admin/issues/merge', [auth, adminAuth], async (req, res) => {
  const { masterIssueId, duplicateIssueIds } = req.body;
  
  if (!masterIssueId || !duplicateIssueIds || duplicateIssueIds.length === 0) {
    return res.status(400).json({ msg: "Master ID and duplicate IDs are required." });
  }

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Find duplicates to extract original reporters
    const duplicates = await Issue.find({ _id: { $in: duplicateIssueIds } }).session(session);
    if (duplicates.length !== duplicateIssueIds.length) {
      await session.abortTransaction();
      return res.status(400).json({ msg: "One or more duplicate issues not found." });
    }

    const duplicateReporterIds = duplicates.map(d => d.submittedBy).filter(id => id);

    // Update duplicates
    await Issue.updateMany(
      { _id: { $in: duplicateIssueIds } },
      { 
        $set: { 
          status: 'merged', 
          isDuplicate: true, 
          mergedInto: masterIssueId 
        } 
      },
      { session }
    );

    // Update master issue
    const updatedMaster = await Issue.findByIdAndUpdate(
      masterIssueId,
      {
        $addToSet: { linkedReporters: { $each: duplicateReporterIds } }
      },
      { new: true, session }
    );

    if (!updatedMaster) {
      await session.abortTransaction();
      return res.status(404).json({ msg: "Master issue not found." });
    }

    await session.commitTransaction();
    res.json({ msg: "Issues merged successfully", masterIssue: updatedMaster });
  } catch (e) {
    if (session) await session.abortTransaction();
    res.status(500).json({ error: e.message });
  } finally {
    if (session) session.endSession();
  }
});

// 14. ADMIN: Delete an issue
app.delete('/api/issues/:id', [auth, adminAuth], async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: "Issue not found." });
    if (issue.submittedBy) {
      await User.findByIdAndUpdate(issue.submittedBy, { $inc: { points: -10 } });
    }
    
    // TODO: Delete image from /uploads folder
    
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ msg: "Issue deleted." });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- START THE SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
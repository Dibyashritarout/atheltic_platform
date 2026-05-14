const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Athlete = require('../models/Athlete');
const Opportunity = require('../models/Opportunity');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Setup multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|mp4|mov|avi|webm/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only images, PDFs, and videos are allowed'));
  }
});

// POST /api/applications — submit an application (athlete)
router.post('/', auth, async (req, res) => {
  try {
    const { athleteId, opportunityId, message } = req.body;

    if (!athleteId || !opportunityId) {
      return res.status(400).json({ error: 'Athlete ID and Opportunity ID are required.' });
    }

    // Verify athlete exists
    const athlete = await Athlete.findById(athleteId);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });

    // Verify opportunity exists and is active
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found.' });
    if (!opportunity.isActive) return res.status(400).json({ error: 'This opportunity is no longer active.' });

    // Check for duplicate
    const existing = await Application.findOne({ athlete: athleteId, opportunity: opportunityId });
    if (existing) return res.status(400).json({ error: 'You have already applied to this opportunity.' });

    // Default verification steps for Blue Tick verification
    const defaultSteps = [
      { name: 'Aadhaar Identity Verification', status: 'pending' },
      { name: 'Panchayat / Rural Address Proof', status: 'pending' },
      { name: 'Sports Certificates Upload', status: 'pending' },
      { name: 'Performance Video Review', status: 'pending' },
      { name: 'Coach / Federation Endorsement', status: 'pending' },
    ];

    const application = await Application.create({
      athlete: athleteId,
      opportunity: opportunityId,
      applicant: req.user._id,
      message,
      verificationSteps: defaultSteps,
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/applications — list all applications (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('athlete', 'name email sports city state isRural profileImage')
      .populate('opportunity', 'title organization sport deadline')
      .populate('applicant', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/my — get current user's applications
router.get('/my', auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('opportunity', 'title organization sport deadline location stipend isActive')
      .populate('athlete', 'name')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/check/:opportunityId/:athleteId — check if already applied
router.get('/check/:opportunityId/:athleteId', auth, async (req, res) => {
  try {
    const application = await Application.findOne({
      opportunity: req.params.opportunityId,
      athlete: req.params.athleteId,
    });
    res.json({ applied: !!application, application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/stats — application stats for admin
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'approved' }),
      Application.countDocuments({ status: 'rejected' }),
    ]);
    res.json({ total, pending, approved, rejected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/applications/:id/review — approve or reject (admin only)
router.put('/:id/review', auth, adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected".' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('athlete', 'name email sports city state')
      .populate('opportunity', 'title organization')
      .populate('reviewedBy', 'name');

    if (!application) return res.status(404).json({ error: 'Application not found.' });

    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Verification Steps Routes ─────────────────────────────────────────────────

// GET /api/applications/:id/verify — Get all verification steps
router.get('/:id/verify', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found.' });

    res.json({ 
      applicationId: application._id,
      verificationSteps: application.verificationSteps || [] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/applications/:id/verify/upload — User uploads verification file
router.post('/:id/verify/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { stepName } = req.body;
    if (!stepName) return res.status(400).json({ error: 'Step name is required' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found.' });

    // Check if step already exists
    let step = application.verificationSteps.find(s => s.name === stepName);
    
    if (step) {
      // Update existing step
      step.fileUrl = `/uploads/${req.file.filename}`;
      step.status = 'pending';
      step.uploadedAt = new Date();
    } else {
      // Add new step
      application.verificationSteps.push({
        name: stepName,
        fileUrl: `/uploads/${req.file.filename}`,
        status: 'pending',
        uploadedAt: new Date(),
      });
    }

    await application.save();
    res.json({ 
      message: 'File uploaded successfully', 
      verificationStep: application.verificationSteps.find(s => s.name === stepName)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/applications/:id/verify/:stepName — Admin approve/reject verification step
router.put('/:id/verify/:stepName', auth, adminAuth, async (req, res) => {
  try {
    const { status, approvalNotes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected".' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found.' });

    const step = application.verificationSteps.find(s => s.name === req.params.stepName);
    if (!step) return res.status(404).json({ error: 'Verification step not found.' });

    step.status = status;
    step.approvedBy = req.user._id;
    step.approvalNotes = approvalNotes;
    step.approvedAt = new Date();

    await application.save();
    
    res.json({ 
      message: 'Verification step updated', 
      verificationStep: step 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

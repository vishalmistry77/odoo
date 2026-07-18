const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middlewares/authMiddleware');
const { getProfile, updateProfile, getCustomers, updatePassword, getAllUsers } = require('../controllers/userController');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfile);
router.put('/password', updatePassword);
router.get('/customers', protect, getCustomers);
// Admin route to list all users
router.get('/', protect, requireAdmin, getAllUsers);

module.exports = router;

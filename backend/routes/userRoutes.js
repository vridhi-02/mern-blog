const express = require('express');
const { getProfile, updateProfile, deleteUser } = require('../controllers/userController'); // ✅ Add deleteUser here
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.delete('/me', auth, deleteUser); // ✅ Now this works

module.exports = router;

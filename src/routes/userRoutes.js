const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const bannerController = require('../controllers/bannerController');
const serviceController = require('../controllers/serviceController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { uploadProfileImage } = require('../middlewares/uploadMiddleware');

router.get('/banner', bannerController.getBanners);
router.get('/services', verifyToken, serviceController.getServices);
router.get('/users', userController.getUsers);
router.get('/users/:email', userController.getUserByEmail);
router.post('/registration', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/profile', verifyToken, userController.getProfile);
router.get('/balance', verifyToken, userController.getBalance);
router.post('/topup', verifyToken, userController.topUpBalance);
router.post('/transaction', verifyToken, userController.createTransaction);
router.get('/transaction/history', verifyToken, userController.getTransactionHistory);
router.put('/profile/update', verifyToken, userController.updateProfile);
router.put('/profile/image', verifyToken, uploadProfileImage.single('file'), userController.updateProfileImage);

module.exports = router;

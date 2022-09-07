const express = require("express");
const router = express.Router();

const { verifyToken } = require("../config/jwtHelper")
const {signup, verifyOTP, resendOTP, login, authenticate, changePassword, ForgotPassword, NewPassword, getSites, updateCompanyDetails, getUser, getAllUsers, contactUs, getAllUnpaidScripts, getAllPaidScripts, getUsersData, getAllData, sendReminder, sendSmsReminder, sendWhatsAppMsgReminder, addNewUser, sendBulkMsgs, getAllPausedScripts} = require("../controllers/user.controller");
const { addNewSite, sendScript, isValidScript, activateScript, deActivateScript } = require("../controllers/script.controller")
const { plans, createSession } = require("../controllers/payment.controller");
const { addEvents, getEvents } = require("../controllers/events.controller");

// User Controller Client Side
router.post('/signup',signup);
router.post('/verifyOTP',verifyOTP);
router.post('/resendOTP',resendOTP);
router.post('/login',verifyToken,login);
router.post('/authenticate',authenticate);
router.post('/changePassword',verifyToken, changePassword);
router.post('/forgot-password', ForgotPassword);
router.post('/new-password', NewPassword);
router.get('/getUser/:email',verifyToken, getUser);
router.get('/getSites/:email', verifyToken, getSites);
router.post('/updateCompanyDetails',verifyToken, updateCompanyDetails);
router.get('/getAllUsers',verifyToken,getAllUsers);
router.post('/contactUs',contactUs);
router.post('/addNewUser',addNewUser);
router.post('/sendBulkMsgs',sendBulkMsgs);

// Script Controller Client Side
router.post('/addNewSite', verifyToken, addNewSite);
router.post('/getScript', verifyToken, sendScript);
router.post('/isValidScript',isValidScript);

// Payment Controller Client Side
//router.post('/checkout', checkout);
router.get('/getPlans', verifyToken, plans);
router.post('/createSession', verifyToken, createSession);
//router.get('/subscriptions',subscriptions);
//router.post('/createSessionWithTrial',createSessionWithTrial)
//router.get('/update',update)

// User Controller Admin Side
router.get('/getAllUnpaidScripts', verifyToken, getAllUnpaidScripts);
router.get('/getAllPaidScripts', verifyToken, getAllPaidScripts);
router.get('/getAllPausedScripts',verifyToken,getAllPausedScripts);
router.get('/getUsersData', verifyToken, getUsersData);
router.get('/getAllData', verifyToken, getAllData);
router.post('/sendReminder', verifyToken, sendReminder);
router.post('/sendSmsReminder', sendSmsReminder);
router.post('/sendWhatsAppMsgReminder', sendWhatsAppMsgReminder);

// Script Controller Admin Side
router.post('/activateScript', verifyToken, activateScript);
router.post('/deActivateScript', verifyToken, deActivateScript);

// Events Controller
router.post('/saveEvents', addEvents);
router.post('/getEvents', getEvents);

module.exports = router;
const router  = require('express').Router();
const ctrl    = require('../controllers/chatController');
const { authAdmin }       = require('../middleware/auth');
const { uploadChatImage } = require('../middleware/upload');

router.get('/sessions',              authAdmin, ctrl.getSessions);        // admin
router.get('/unread-count',          authAdmin, ctrl.getUnreadCount);     // admin
router.get('/:sessionId',            ctrl.getMessages);                   // publik (customer)
router.post('/',                     uploadChatImage, ctrl.sendMessage);  // publik (customer)
router.post('/:sessionId/reply',     authAdmin, uploadChatImage, ctrl.replyMessage); // admin
router.put('/:sessionId/read',       authAdmin, ctrl.markRead);           // admin
router.delete('/:sessionId',         authAdmin, ctrl.deleteSession);      // admin

module.exports = router;

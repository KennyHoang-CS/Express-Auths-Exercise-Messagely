const ExpressError = require('../expressError');
const Router = require('express').Router();
const router = new Router();
const User = require('../models/user');
const {ensureCorrectUser, ensureLoggedIn} = require('../middleware/auth');

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', ensureLoggedIn, async function(req, res, next){
    try{
        // Get the list of users.
        let users = await User.all();

        // Return list of users as json. 
        return res.json({users});
    }catch(e){
        return next(e);
    }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', ensureCorrectUser, async function (req, res, next){
    try{
        // Get the username from req.params. 
        let username = req.params.username;
        // Get the user detail. 
        let myUser = await User.get(username);
        // Return as json. 
        return res.json({myUser});
    }catch(e){
        return next(e);
    }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async function(req, res, next){
    try{
        let toMessages = await User.messagesTo(req.params.username);
        return res.json({toMessages});
    }catch(e){
        return next(e);
    }
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUser, async function(req, res, next){
    try{
        let fromMessages = await User.messagesFrom(req.params.username);
        return res.json({fromMessages});
    }catch(e){
        return next(e);
    }
});

module.exports = router; 
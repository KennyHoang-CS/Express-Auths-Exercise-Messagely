const ExpressError = require('../expressError');
const Router = require('express').Router;
const router = new Router();
const Message = require('../models/message');
const {ensureLoggedIn} = require('../middleware/auth');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function(req, res, next){
    try{
        // Get the username from the token payload. 
        let username = req.user.username;
        // Get the message with that id. 
        let message = await Message.get(req.params.id);

        // Make sure the currently-logged-in users is either to/from user. 
        if(message.from_user.username !== username && 
            message.to_user.username !== username){
                throw new ExpressError('Cannot read this message', 401);
            }

        // Return the message as json. 
        return res.json({message: message});

    }catch(e){
        return next(e);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function (req, res, next){
    try{
        // Create the new message.
        let newMessage = await Message({
            from_username: req.user.username,
            to_username: req.body.to_username,
            body: req.body.body
        });

        // Return the new message as json.
        return res.json({message: newMessage});

    }catch(e){
        return next(e); 
    }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function(req, res, next){
    try{
        // Get the current user. 
        let username = req.user.username;
        
        // Get the message of that id (req.params.id).
        let message = await Message.get(req.params.id);

        // Validate if it's the intended user. 
        if(message.to_user.username !== username){
            throw new ExpressError('Message cannot be set to read.', 401);
        }

        // Mark the message.
        let markRead = await Message.markRead(req.params.id);
        // Return the mark message.
        return res.json({markRead});
    }catch(e){
        return next(e);
    }
});

module.exports = router;
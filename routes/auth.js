const jwt = require('jsonwebtoken');
const Router =  require('express').Router;
const router = new Router();

const User = require('../models/user');
const {SECRET_KEY} = require('../config');
const ExpressError = require('../expressError');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async function (req, res, next){
    try{
        // Get the username and password from request body. 
        let {username, password} = req.body;
        // Authenticate the user using bcrypt. 
        if(await User.authenticate(username, password)){
            // Assign them a token. 
            let token = jwt.sign({username}, SECRET_KEY);
            // Log the user's new login time-stamp.
            User.updateLoginTimestamp(username);
            // Return the token. 
            return res.json({token});
        } else{
            throw new ExpressError('Username/password invalid', 400);
        }
    }catch(e){
        return next(e);
    }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async function(req, res, next){
    try{
        // Register the user. 
        let {username} = await User.register(req.body);
        // Assign them a token.  
        let token = jwt.sign({username}, SECRET_KEY);
        // Update user last-login.
        User.updateLoginTimestamp(username);
        // Return the token. 
        return res.json({token});
    }catch(e){
        return next(e);
    }
});

module.exports = router;
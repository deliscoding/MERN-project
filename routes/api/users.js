// script for registering/adding users
const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// @route  POST api/users
// @desc   Register User
// @access Public

router.post('/', 
[
  // validation for the inputs that user sends in a request
  check('name', 'Name is required')
    .not()
    .isEmpty(), 
  check('email', "Please include a valid email").isEmail(),
  check('password', "Please enter a password with 6 or more characters").isLength({min: 6})
],
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      // bad request
      return res.status(400).json({errors: errors.array()});
    }  
  
    // console.log(req.body);

    const { name, email, password,} = req.body;
    
    try{
      
    // See if the user exists
      let user =  await User.findOne({email});

      if(user){
        return res.status(400).json({errors: [{msg: 'User already exists'}] });
      }
    // If user doesn't exist, get user's gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        // default image for 'no pic' user
        d: 'mm' 
      })

      //only creates user doesn't save it
      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);

      // puts hash in user password
      user.password = await bcrypt.hash(password, salt);
      await user.save();

     // Return Json Web Token

      res.send('User registered');

    } catch(err){
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
); 

module.exports = router;
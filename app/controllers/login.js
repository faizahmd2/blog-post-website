const passport = require('passport'),
  bcrypt = require("bcryptjs");
const Login = require('../models/Login');
const { sign } = require('../../config/middlewares/jwt');
const { sendResponse, pageRender } = require('../../helper/util');
const config = require('../../config/config');

module.exports = {
  logout: function(req, res, next) {
    res.clearCookie('token');
    res.redirect('/');
  },
  registerUser: async (req, res) => {
    try {
        let { username, name, password, password2, email, phone, address, pincode, age, message } = req.body;
        if (
          !username || 
          !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(username) ||
          username.length > 30 ||
          !password ||
          !name ||
          password != password2 ||
          name.length > 40 ||
          password.length < 5 ||
          password.length > 50
          ) {
          return sendResponse(res, 400, 'Malformed Request');
        }
    
        //Check if user exists
        const resp = await helper.verifyUser({username, status: 1});
    
        if (resp && resp == 'Unknown User') {
          //Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          
          let loginObj = {
            name,
            initial: helper.generateInitials(name),
            username:username,
            password: hashedPassword,
            status: 1,
            created: new Date()
          };
          
          if(email) loginObj.email = email;
          if(phone) loginObj.phone = phone;
          if(address) loginObj.address = address;
          if(pincode) loginObj.pincode = +pincode;
          if(age) loginObj.age = age;
          if(message) loginObj.message = message;

          const loginResp = await Login.create(loginObj);
          if (loginResp) {
            return res.sendStatus(201);
          }
        } else if(resp.user) {
          return sendResponse(res, 400, 'User Already Registerd');
        }

        sendResponse(res, 400, 'Could Not Create User');
    } catch (error) {
        console.error(error);
        sendResponse(res, 500);
    }
  },
  loginUser: async (req, res) => {
    try {
        let {username, password} = req.body;
        if(!username || !password) return sendResponse(res, 400, 'Username or Password Missing');
        passport.authenticate('local', (err, user) => {
          if (user) {
            const token = sign({user_id: user._id, initial: user.initial});
            res.cookie('token', token, { maxAge: config.LOGIN_COOKIE_EXPIRY, httpOnly: true });
            return res.json({
                success: true
            });
          }
          sendResponse(res, 400, 'Invalid Username Or Password');
        })({ body: { username, password } });
    } catch (error) {
        console.error(error);
        sendResponse(res, 500);
    }
  },
  renderLogin: (req, res) => {
    let isSignup = req.query.register == "1";

    req.options['isSignup'] = isSignup;
    pageRender(req, res, "login");
  },
  createUsernameValidation: async function(req, res) {
    try {
      let username = req.body.key;
      if(!username) return sendResponse(res, 400, "Username Required");
      if(username.length < 4) return sendResponse(res, 400, "Atleast 4 character required");
      if(username.length > 30) return sendResponse(res, 400, "Username too long");
      if(!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(username)) return sendResponse(res, 400, "Only alphabets, number and underscore allowed");

      const resp = await helper.verifyUser({username, status: 1});
      if (resp && resp == 'Unknown User') {
        res.json({success: true});
      } else {
        return sendResponse(res, 400, "Already Exist!");
      }
    } catch (error) {
      console.log("ERROR: ",error);
      return { success: true };
    }
  }
};

var helper = {
  generateInitials: function(input) {
    const names = input.split(' ');
    let initials = names[0].charAt(0).toUpperCase();
    if (names.length > 1) {
        const secondInitial = names[1].charAt(0).toUpperCase();
        initials += (secondInitial !== '' ? secondInitial : names[0].charAt(1).toUpperCase());
    } else {
        initials += names[0].charAt(1).toUpperCase();
    }
    return initials;
  },
  verifyUser: async function(condition) {
    try{
      let user = await Login.findOne(condition);
      if (!user) {
        return 'Unknown User';
      }
      return {user:user};
    }
    catch(err){
        console.error(err)
        return JSON.stringify(err);
    }
  }
}
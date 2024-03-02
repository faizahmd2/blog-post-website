const passport = require('passport'),
  bcrypt = require("bcryptjs");
const Login = require('../models/Login');
const { sign } = require('../../config/middlewares/jwt');
const { sendResponse, pageRender } = require('../../helper/util');
const config = require('../../config/config');

module.exports = {
  logout: function(req, res, next) {
    res.clearCookie('token');
    req.user = null;
    pageRender(req, res, 'index');
  },
  registerUser: async (req, res) => {
    try {
        let { name, email, password, password2, phone, address, pincode, age, message } = req.body;
        if (
          !email || 
          !password || 
          !name ||
          !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email) ||
          password != password2 ||
          name.length > 40 ||
          email.length > 40 ||
          password.length < 5 ||
          password.length > 50
          ) {
          return sendResponse(res, 400, 'Malformed Request');
        }
    
        //Check if user exists
        const resp = await helper.verifyUser({email, status: 1});
    
        if (resp && resp == 'Unknown User') {
          //Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          
          let loginObj = {
            name,
            initial: helper.generateInitials(name),
            email:email,
            password: hashedPassword,
            status: 1,
            created: new Date()
          };
          
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
          return sendResponse(res, 400, 'Email Already Registerd');
        }

        sendResponse(res, 400, 'Could Not Create User');
    } catch (error) {
        console.error(error);
        sendResponse(res, 500);
    }
  },
  loginUser: async (req, res) => {
    try {
        let {email, password} = req.body;
        if(!email || !password) return sendResponse(res, 400, 'Email or Password Missing');
        passport.authenticate('local', (err, user) => {
          if (user) {
            const token = sign({user_id: user._id, initial: user.initial});
            res.cookie('token', token, { maxAge: config.LOGIN_COOKIE_EXPIRY, httpOnly: true });
            return res.json({
                success: true
            });
          }
          sendResponse(res, 400, 'Invalid Username Or Password');
        })({ body: { email, password } });
    } catch (error) {
        console.error(error);
        sendResponse(res, 500);
    }
  },
  renderLogin: (req, res) => {
    let isSignup = req.query.register == "1";

    req.options = { isSignup };
    pageRender(req, res, "login");
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
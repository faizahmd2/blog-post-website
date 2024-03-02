const passport = require('passport'),
  bcrypt = require("bcryptjs");
const Login = require('../models/Login');
const { sign } = require('../../config/middlewares/jwt');
const { sendResponse, pageRender } = require('../../helper/util');

module.exports = {
  session: function(req, res) {
    res.sendStatus(204);
  },
  signout: function(req, res, next) {
    req.logout(function(err) {
      req.session.destroy(function(err) {
        res.send({status: 1,'message': "Done!!"})
      })
    });
  },
  registerUser: async (req, res) => {
    try {
        let { name, email, password, phone, address, pincode, additionals={} } = req.body;
        if (!email || !password || !name) {
          return sendResponse(res, 400, 'Please provide all fields');
        }
    
        //Check if user exists
        const resp = await helper.verifyUser({email});
    
        if (resp && resp == 'Unknown User') {
          //Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          
          let loginObj = {
            name,
            initial: helper.generateInitials(name),
            email:email,
            password: hashedPassword,
            created: new Date()
          };
          
          if(phone) loginObj.phone = phone;
          if(address) loginObj.address = address;
          if(pincode) loginObj.pincode = pincode;
          if(Object.keys(additionals).length) loginObj.misc = JSON.stringify(additionals);

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
            return res.json({
                token: token
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
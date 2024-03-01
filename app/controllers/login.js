const passport = require('passport'),
  bcrypt = require("bcryptjs");
const Login = require('../models/Login');

module.exports = {
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
          return res.status(400).json({status:0,message:'Please provide all fields'});
        }
    
        //Check if user exists
        const resp = await _verifyUser({email});
    
        if (resp && resp == 'Unknown User') {
          //Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          
          let loginObj = {
            _id: 1,
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
            return res.status(201).json({
                status:1,
                id: loginResp.uuid,
                email: loginResp.email
            });
          }
        } else if(resp.user) {
            return res.status(400).json({status:0,message:'Email Already Registerd'});
        }

        res.status(400).json({status:0,message:'Could Not Create User'});
    } catch (error) {
        console.error(error);
        res.status(500).json({status:0,message:'Something Went Wrong'});
    }
  },
  loginUser: async (req, res) => {
    try {
        let {email, password} = req.body;
        if(!email || !password) return res.status(403).json({status:0, message: "Email or Password Missing"});
        passport.authenticate('local', (err, user) => {
          if(user) return res.json({
            status: 1,
            userDetalis: {id: user.id, email: user.email}
          });
          res.status(403).json({status:0, message: "Invalid Username Or Password"});
        })({ body: { email, password } });
    } catch (error) {
        console.error(error);
        res.status(500).json({status:0,message:'Something Went Wrong'});
    }
  },
  renderLogin: (req, res) => {
    let isSignup = req.query.register == "1";
    res.render("login", { isSignup });
  }
};

async function _verifyUser(condition) {
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
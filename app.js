const express = require('express');                                 // https://www.npmjs.com/package/express
const log4js = require('log4js');                                   // https://www.npmjs.com/package/log4js
const session = require('express-session');                            // https://www.npmjs.com/package/express-session
const passport = require('passport');                                // https://www.npmjs.com/package/passport
const WebAppStrategy = require('ibmcloud-appid').WebAppStrategy;    // https://www.npmjs.com/package/ibmcloud-appid

// logger
var logger = log4js.getLogger('testApp');

// setup express-session. default store is memory
const app = express(); app.use(session({
  secret: 'hogehoge',
  resave: false,
  saveUninitialized: false
}));

// setup passport
app.use(passport.initialize()); // initialization is mandatory
app.use(passport.session());  // use session
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));
passport.use(new WebAppStrategy({ // WebAppStragegy is passport Strategy 
  tenantId: "fa5ca1dd-eed7-4460-b4d4-750f7a624e01",
  clientId: "2d83374f-0d81-4c42-988f-bb4765e130e7",
  secret: "NmJjYWIxZmEtZDMyNS00YjU3LWI1YmItMTE2ZjU5ZTVkZTE2",
  oauthServerUrl: "https://jp-tok.appid.cloud.ibm.com/oauth/v4/fa5ca1dd-eed7-4460-b4d4-750f7a624e01",
  redirectUri: "http://localhost:3000/appid/callback"
}));

// Login
app.get('/appid/login', 
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	  successRedirect: '/',
	  forceLogin: true
}));

// Callback from appid
app.get('/appid/callback', 
  (req, res, next) => {
    logger.info('call back is called. authorized Code =' + req.query.code);
    next();
  },
  passport.authenticate(WebAppStrategy.STRATEGY_NAME)
);

// Logout
app.get('/appid/logout', (req, res) =>{
  WebAppStrategy.logout(req);
  res.redirect('/');
});

// get user info api
app.get("/api/user", 
  (req, res) => { 
    if (!req.user) { 
      res.status(401); 
      res.send(''); 
    } else {
      logger.info(req);
      res.json({
        user: {
          name: req.user.name,
          email: req.user.email,
          given_name: req.user.given_name,
          family_name: req.user.family_name
        }
      });
    }
  }
);

// Server static resources
app.use(express.static('./public'));

// Start server
app.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});



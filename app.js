   const express = require('express');
   const mongoose = require('mongoose');
   const bodyParser = require('body-parser');
   const session = require('express-session');
   const MongoStore = require('connect-mongo')(session);
   const User = require('./models/User');

   const app = express();

   mongoose.connect('mongodb+srv://22dce110:jay@12345@data1.sa4p1ax.mongodb.net/?retryWrites=true&w=majority&appName=data1', { useNewUrlParser: true, useUnifiedTopology: true });

   app.use(bodyParser.urlencoded({ extended: false }));
   app.use(express.static('public'));
   app.set('view engine', 'ejs');

   app.use(session({
     secret: 'your secret key',
     resave: false,
     saveUninitialized: true,
     store: new MongoStore({ mongooseConnection: mongoose.connection })
   }));

   app.get('/', (req, res) => {
     res.sendFile(__dirname + '/public/index.html');
   });

   app.get('/login', (req, res) => {
     res.sendFile(__dirname + '/public/login.html');
   });

   app.get('/register', (req, res) => {
     res.sendFile(__dirname + '/public/register.html');
   });

   app.post('/register', async (req, res) => {
     const { username, email, password } = req.body;
     try {
       const user = new User({ username, email, password });
       await user.save();
       req.session.userId = user._id;
       res.redirect('/home');
     } catch (error) {
       res.redirect('/register');
     }
   });

   app.post('/login', async (req, res) => {
     const { username, password } = req.body;
     const user = await User.findOne({ username });
     if (user && await bcrypt.compare(password, user.password)) {
       req.session.userId = user._id;
       res.redirect('/home');
     } else {
       res.redirect('/login');
     }
   });

   app.get('/home', async (req, res) => {
     if (!req.session.userId) {
       return res.redirect('/login');
     }
     const user = await User.findById(req.session.userId);
     res.render('home', { username: user.username });
   });

   app.get('/logout', (req, res) => {
     req.session.destroy(err => {
       if (err) {
         return res.redirect('/home');
       }
       res.redirect('/');
     });
   });

   app.listen(3000, () => {
     console.log('Server is running on http://localhost:3000');
   });
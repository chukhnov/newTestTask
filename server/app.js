import express from 'express'
import path from 'path'
import mongoose from 'mongoose'
import conig from './modules/application/config/index'
import {router as ApplicationRouter} from './modules/application/index'
import multer from 'multer'
import bodyParser from 'body-parser'
import passport from 'passport'
import User from './modules/user/documents/User.js'
const app = express();
mongoose.connect('mongodb://localhost/MyDatabase');

app.use(multer().fields());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, '../public')));
app.use((req, res, next) => {
    req.path.indexOf('api/1') != -1 ? next() : res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());


app.post('/api/1/login', passport.authenticate('local'),
    function (req, res) {
    console.log('Login successful!');
        res.json({message:"Success", username: req.user.username});
});

app.post('/api/1/register', (req, res, next) => {

    User.register(new User({username: req.body.username}), req.body.password, (err) => {
        if (err) {
            console.log('error while user register!', err);
            res.json({name:err.name, message: err.message});
            return
        }
        console.log('user registered!');
        res.json({name:'Register successful!', username: req.body.username});
    });


});




app.get('/api/1/logout', function(req, res){
    req.logout();
    res.json({message:"Success", ok: 'ok'});
    console.log('Logout Success!');


});

app.use(ApplicationRouter);
app.listen(conig.port);
console.log('Server running at port ' + conig.port);
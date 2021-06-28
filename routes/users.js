const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const pool = require("../config/db");

//User model
const User = require("../models/User");

//Login Page
router.get("/login", (req, res) => res.render('login'));

//Register Page
router.get("/register", (req, res) => res.render('register'));

//Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    //Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    //Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Passwords must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //Validation Passed
        bcrypt.hash(password, 10, (err, hash) => {
            if(err) res.status(err.status || 500).json(err);
            else {
                pool.query(
                    "INSERT INTO users(name,email,password) VALUES ($1,$2,$3)",
                    [name,email,hash],
                    (err, data) => {
                        if(err) {
                            if(err.code == "23505") errors.push({ msg: "Email is already registered!" });
                            else errors.push({ msg: "Somthing went wrong!" });
                            res.render('register', {
                                errors,
                                name,
                                email,
                                password,
                                password2
                            });
                        } else {
                            req.flash("success_msg", "You are now registered and can log in!");
                            res.redirect('/users/login');
                        }
                    }
                );
            }
        });
    }
});

// User.findOne({ email: email })
//             .then(user => {
//                 if (user) {
//                     //User exist
//                     errors.push({ msg: 'Email is already registered' });
//                     res.render('register', {
//                         errors,
//                         name,
//                         email,
//                         password,
//                         password2
//                     });
//                 } else {
//                     const newUser = new User({
//                         name,
//                         email,
//                         password
//                     });
//                     //hash password
//                     bcrypt.genSalt(10, (err, salt) =>
//                         bcrypt.hash(newUser.password, salt, (err, hash) => {
//                             if (err) throw err;
//                             //set password to hashed
//                             newUser.password = hash;
//                             //save user
//                             newUser.save()
//                                 .then(user => {
//                                     req.flash('success_msg', 'You are now registered and can log in');
//                                     res.redirect('/users/login');
//                                 })
//                                 .catch(err => console.log(err));
//                         }))
//                 }
//             });

//Login handle
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next);
});

//Logout Handle
router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
});


module.exports = router;
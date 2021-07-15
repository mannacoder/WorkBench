const LocalStrategy = require("passport-local").Strategy;
// const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Load User Model
// const User = require("../models/User");

// Using postgresql
const pool = require("./db");

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
            // Match User
            console.log(email, password);
            pool.query(
                "SELECT * FROM users WHERE email = $1"
                [email],
                (err, data) => {
                    if(err) {
                        console.log(err);
                        done(err);
                    }
                    else {
                        if(data.rowCount == 0) {
                            return done(null, false, { message: "That email is not registered" });
                        } else {
                            const user = data.rows[0];
                            bcrypt.compare(password, user.password, (err, isMatch) => {
                                if(err) throw err;
                                if(isMatch) {
                                    return done(null, user);
                                } else {
                                    return done(null, false, { message: "Password incorrect" });
                                }                                
                            })
                        }
                    }
                }
            );
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.user_id);
    });

    passport.deserializeUser(function (id, done) {
        // User.findById(id, function (err, user) {
        //     done(err, user);
        // });
        pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [parseInt(id,10)],
            (err, data) => {
                done(err, data.rows[0]);
            }
        )
    });

}

// User.findOne({ email: email })
//     .then(user => {
//         if (!user) {
//             return done(null, false, { message: "That email is not registered" });
//         }

//         //Match password
//         bcrypt.compare(password, user.password, (err, isMatch) => {
//             if (err) throw err;

//             if (isMatch) {
//                 return done(null, user);
//             } else {
//                 return done(null, false, { message: "Password incorrect" });
//             }
//         });
//     })
//     .catch(err => console.log(err));
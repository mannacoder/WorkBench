const express = require('express')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const app = express()
const MongoStore = require('connect-mongo').default

//Passport config
require('./config/passport')(passport)

//DB config
const db = process.env.MongoURI || require('./config/keys').MongoURI

//connsect to mongo
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err))

// EJS
app.set('view engine', 'ejs')
app.use(express.static('public'))

// Bodyparser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
)

//Passport
app.use(passport.initialize())
app.use(passport.session())

//connect flash
app.use(flash())

//Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, console.log(`Server started on port ${PORT}`));

app.listen(process.env.PORT || 3000, function () {
  console.log(
    'Express server listening on port %d in %s mode',
    this.address().port,
    app.settings.env
  )
})

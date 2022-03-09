const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3500
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const ejs = require('ejs')
app.set('view engine', 'ejs')

// mongoose
app.use(bodyParser.urlencoded({ extended: true }))
const URI = process.env.MONGOS_URI
mongoose.connect(URI, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("mongoose connected successfully");
    }
})

mongoose.Promise = global.Promise;
let userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String
})

let userModel = mongoose.model("user_tb", userSchema);


// router
app.use(express.static(__dirname + '/public'))
app.get('/', (req, res) => {
    res.render('pages/landing')
})

app.get('/login', (req, res) => {
    res.render('pages/signin')
})

app.get('/register', (req, res) => {
    res.render('pages/signup')
})

app.post('/login', (req, res) => {
    let regContent = req.body;
    let form = new userModel(regContent)
    console.log(regContent);
    form.save((err) => {
        if (err) {
            console.log(err);
            res.render('pages/signup')
        } else {
            console.log("successful");
            res.render('pages/signin')
        }
    })
})

app.post('/chat', (req, res) => {
    let loginCont = req.body
    userModel.find({}, (err, result) => {
        let users = result
        let found = users.find((element, i) => element.email == loginCont.email && element.password == loginCont.password && element.password == loginCont.confirm_password)
        if (found) {
            res.render('pages/chat', { found, users })
            console.log("Successful");
            console.log(users);
        } else {
            res.render('pages/signin')
            console.log("unsuccessful");
        }
    })
});
let connection = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

let io = require('socket.io')(connection);
io.on('connection', (socket) => {
    console.log("New User Connected");

    socket.on('newMessage', (data) => {
        socket.broadcast.emit('newMessage', data);
        socket.emit("newMessage", data);
        console.log("There is a new message");
    })
})
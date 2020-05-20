const router = require('express').Router();
const db = require('./db');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { isValid, restricted } = require('./services');
const secrets = require('./secrets');


router.post('/register', (req, res) => {
    const credentials = req.body;

    if (isValid(credentials)){
        const rounds = process.env.BCRYPT_ROUNDS || 8;
    const hash = bcryptjs.hashSync(credentials.password, rounds);

    credentials.password = hash;

    db("users").insert(credentials)
    .then(id => {
        console.log(id);

        db("users").where({id: id[0] })
        .then(post => {
            
            res.status(201).json(post);
        })
        .catch(err => {
            res.json(err);
        })
    })
    .catch(err => {
        res.json(err);
    })
    }
    else {
        res.status(400).json({msg: 'please provide username and password - must be string'})
    }
    
})     

router.post('/login', (req, res) => {
    const {username, password} = req.body;

    if (isValid(req.body)){
        db("users").where({ username }).first()
    .then(user => {
        console.log(user);
        if (user && bcryptjs.compareSync(password, user.password)) {
            const token = generateToken(user);
            

            res.status(200).json({ message: `Welcome ${user.username}!`, token });
          } else {
            res.status(401).json({ message: 'Invalid Credentials' });
          }
        })
        .catch(error => {
          res.status(500).json(error);
        });

    }
    else {
        res.status(400).json({msg: 'please provide username and password - must be string'})
    }

})

function generateToken(user) {
    const payload = {
        subject: user.id,
        username: user.username,
        department: user.department
    }
    const options = {
        expiresIn: '1d'
    }

    return jwt.sign(payload, secrets.jwtSecret, options);
}

router.get('/users', restricted, (req, res) => {
    db("users")
    .then(data => {
        res.json({data, jwt: req.jwt});
    })
    .catch(err => {
        res.status(500).json(err);
    })
})

module.exports = router;

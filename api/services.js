const jwt = require('jsonwebtoken');
const secret = require('./secrets');

module.exports = {
    isValid,
    restricted
}

function isValid(user) {
    return Boolean(user.username && user.password && typeof user.password === "string");
}

function restricted(req, res, next) {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, secret.jwtSecret, (error, decodedToken) => {
            if (error) {
                //token is invalid
                res.status(401).json({ msg: 'Invalid credentials'})
            } else {
                req.jwt = decodedToken;
                next();

            }
        });
    } else {
        res.status(400).json({msg: 'Please provide the auth info'});
    }
}
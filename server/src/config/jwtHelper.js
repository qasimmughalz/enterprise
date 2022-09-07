const jwt = require('jsonwebtoken');

module.exports.verifyToken = (req,res,next) => {
    try {
        console.log("In JWT Helper")
        if('authorization' in req.headers) {
            const bearerHeader = req.headers['authorization'];
            if(typeof bearerHeader !== 'undefined') {
                const token = bearerHeader.split(' ')[1];
                jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
                    if (err){
                        console.log(err)
                        return res.status(400).json({ error: 'Token verification failed.' });
                    }
                    else {
                        req._id = payload.id;
                        next();
                    }
                })
            } else {
                res.status(400).json({
                    error: "Token not found"
                })
            }
        } else {
            res.status(400).json({
                error: "Token header not found"
            })
        } 
    } catch(e) {
        res.status(400).send(e)
    }
}
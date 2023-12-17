import jwt from 'jsonwebtoken';

const checkJwt = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return res.status(401).json({
            message: 'Token non fornito'
        });
    }

    console.log(authorizationHeader);
    const token = authorizationHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        console.log(payload);
        next();

    } catch (error) { 
       return res.status(401).json({
            message: 'Unauthorizede',
            error: error.message,
        })
    }
}

export default checkJwt;

const checkUsers = (req, res, next) => {
    if(req.headers.authorization === process.env.WEBTOKEN) {
        next();
    } else {
        const error = new Error('Your token is not valid or you are not authorized');
        error.status = 401;
        console.log(error);
        next(error);
    }
};
    export default checkUsers;
import jwt from 'jsonwebtoken';
export const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Missing or malformed Authorization header' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET;
        const payload = jwt.verify(token, secret);
        req.user = {
            id: payload.userId,
            role: payload.role,
            restaurant: payload.restaurant,
        };
        next();
    }
    catch {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authUser = async (req, res, next) => {
    let token;

    if (req.cookies?.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};


export const isAdmin = (req, res, next) => {
    if (req.user?.type !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export function generateToken(userId) {
    return jwt.sign({ userId }, secret, { expiresIn: '7d' })
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, secret)
    } catch (error) {
        return null
    }
}

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' })
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

        const decoded = verifyToken(token)
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' })
        }

        req.userId = decoded.userId
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' })
    }
}

import express from 'express'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { handelClick, handelUrl, getAllUrls, deleteUrl, getUrlStats } from '../controllers/urlController.js'
import { register, login } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const routes = express.Router()
const upload = multer()
const shortenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many URLs shortened from this client. Please try again later.' },
})

// Public routes
routes.get('/', (req, res) => {
    res.send('API is running')
})

// Auth routes (public)
routes.post('/auth/register', register)
routes.post('/auth/login', login)

// Protected routes (require authentication)
routes.post('/shorten', authMiddleware, shortenLimiter, upload.none(), handelUrl)
routes.get('/urls', authMiddleware, getAllUrls)
routes.get('/stats/:shortId', authMiddleware, getUrlStats)
routes.delete('/urls/:shortId', authMiddleware, deleteUrl)

export default routes

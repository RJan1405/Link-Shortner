import express from 'express'
import multer from 'multer'
import { handelClick, handelUrl, getAllUrls, deleteUrl, getUrlStats } from '../controllers/urlController.js'
import { register, login } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const routes = express.Router()
const upload = multer()

// Public routes
routes.get('/', (req, res) => {
    res.send('API is running')
})

// Auth routes (public)
routes.post('/auth/register', register)
routes.post('/auth/login', login)

// Protected routes (require authentication)
routes.post('/shorten', authMiddleware, upload.none(), handelUrl)
routes.get('/urls', authMiddleware, getAllUrls)
routes.get('/stats/:shortId', authMiddleware, getUrlStats)
routes.delete('/urls/:shortId', authMiddleware, deleteUrl)

// Public redirect route (no auth needed to redirect)
routes.get('/:shortId', handelClick)

export default routes

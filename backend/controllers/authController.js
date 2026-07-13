import User from '../models/userSchema.js'
import { generateToken } from '../middleware/auth.js'

export async function register(req, res) {
    try {
        const { name, email, password } = req.body

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' })
        }

        // Create new user
        const user = new User({ name, email, password })
        await user.save()

        // Generate token
        const token = generateToken(user._id)

        return res.status(201).json({
            token,
            user: user.toJSON(),
        })
    } catch (error) {
        console.error('Register error:', error)
        return res.status(500).json({ error: 'Registration failed' })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        // Find user
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        // Generate token
        const token = generateToken(user._id)

        return res.json({
            token,
            user: user.toJSON(),
        })
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ error: 'Login failed' })
    }
}

import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (passwordToMatch) {
    return await bcrypt.compare(passwordToMatch, this.password)
}

// Method to return user without password
userSchema.methods.toJSON = function () {
    const user = this.toObject()
    delete user.password
    return user
}

const User = mongoose.model('User', userSchema)

export default User

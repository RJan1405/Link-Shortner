import mongoose from 'mongoose'

const urlSchema = new mongoose.Schema({
    shortId: {
        type: String,
        unique: true,
    },
    originalUrl: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    clickCount: {
        type: Number,
        default: 0,
    },
})

urlSchema.index({ userId: 1, createdAt: -1 })

const Url = mongoose.model('Url', urlSchema)

export default Url
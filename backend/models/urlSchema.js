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
    visitHistory: [
        {
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
})

const Url = mongoose.model('Url', urlSchema)

export default Url
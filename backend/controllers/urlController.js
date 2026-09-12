import Url from '../models/urlSchema.js'

import shortid from 'shortid'

async function handelUrl(req, res) {
    try {
        const id = shortid.generate(8)
        const { urlCode, url: urlInput } = req.body ?? {}
        const originalUrl = (urlCode || urlInput || '').trim()
        const userId = req.userId

        if (!originalUrl) {
            return res.status(400).json({ error: 'URL is required' })
        }

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' })
        }

        await Url.create({ shortId: id, originalUrl, userId })
        return res.status(201).json({ shortId: id })
    } catch (error) {
        console.error('Error shortening URL:', error)
        return res.status(500).json({ error: 'Failed to shorten URL' })
    }
}

async function handelClick(req, res) {
    try {
        const { shortId } = req.params

        const urlData = await Url.findOneAndUpdate(
            { shortId },
            { $inc: { clickCount: 1 } },
            { new: true, projection: { originalUrl: 1 } }
        ).lean()

        if (!urlData) {
            return res.status(404).json({ error: 'URL not found' })
        }

        return res.redirect(urlData.originalUrl)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

async function getAllUrls(req, res) {
    try {
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' })
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50)
        const filter = { userId }
        const totalCount = await Url.countDocuments(filter)
        const totalPages = Math.max(Math.ceil(totalCount / limit), 1)
        const currentPage = Math.min(page, totalPages)
        const skip = (currentPage - 1) * limit

        const urls = await Url.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

        const urlsWithClicks = urls.map((url) => ({
            ...url,
            totalClicks: url.clickCount ?? url.visitHistory?.length ?? 0,
        }))

        return res.json({
            urls: urlsWithClicks,
            page: currentPage,
            limit,
            totalCount,
            totalPages,
        })
    } catch (error) {
        console.error('Error fetching URLs:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

async function deleteUrl(req, res) {
    try {
        const { shortId } = req.params
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' })
        }

        // Find URL and verify it belongs to the current user
        const url = await Url.findOne({ shortId, userId }).lean()
        if (!url) {
            return res.status(404).json({ error: 'URL not found or unauthorized' })
        }

        // Delete the URL
        await Url.deleteOne({ shortId, userId })
        return res.json({ message: 'URL deleted successfully' })
    } catch (error) {
        console.error('Error deleting URL:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

async function getUrlStats(req, res) {
    try {
        const { shortId } = req.params
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' })
        }

        // Find URL and verify it belongs to the current user
        const url = await Url.findOne({ shortId, userId }).lean()
        if (!url) {
            return res.status(404).json({ error: 'URL not found or unauthorized' })
        }

        return res.json({
            shortId: url.shortId,
            originalUrl: url.originalUrl,
            createdAt: url.createdAt,
            totalClicks: url.clickCount ?? url.visitHistory?.length ?? 0,
        })
    } catch (error) {
        console.error('Error fetching URL stats:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

export { handelUrl, handelClick, getAllUrls, deleteUrl, getUrlStats }
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const API_ROUTES = {
    shorten: '/api/shorten',
    urls: '/api/urls',
    redirect: (shortId) => `/api/${shortId}`,
    delete: (shortId) => `/api/urls/${shortId}`,
    stats: (shortId) => `/api/stats/${shortId}`,
}

function Home() {
    const [url, setUrl] = useState('')
    const [shortId, setShortId] = useState('')
    const [urls, setUrls] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [deleting, setDeleting] = useState(null)
    const navigate = useNavigate()

    const shortUrl = useMemo(() => {
        if (!shortId) {
            return ''
        }

        return `${API_BASE}${API_ROUTES.redirect(shortId)}`
    }, [shortId])

    async function loadUrls() {
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${API_BASE}${API_ROUTES.urls}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = response.data
            setUrls(data.urls || [])
        } catch (requestError) {
            if (requestError.response?.status === 401) {
                // Token expired, redirect to login
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/login')
            } else {
                setError(requestError?.response?.data?.error || requestError.message || 'Something went wrong')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUrls()
    }, [])

    async function handleSubmit(event) {
        event.preventDefault()
        setSaving(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${API_BASE}${API_ROUTES.shorten}`, { url }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = response.data

            setShortId(data.shortId)
            setUrl('')
            await loadUrls()
        } catch (requestError) {
            if (requestError.response?.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/login')
            } else {
                setError(requestError?.response?.data?.error || requestError.message || 'Something went wrong')
            }
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(shortId) {
        if (!window.confirm('Are you sure you want to delete this URL?')) {
            return
        }

        setDeleting(shortId)
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`${API_BASE}${API_ROUTES.delete(shortId)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            await loadUrls()
        } catch (requestError) {
            if (requestError.response?.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/login')
            } else {
                setError(requestError?.response?.data?.error || requestError.message || 'Failed to delete URL')
            }
        } finally {
            setDeleting(null)
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    return (
        <main className="app-shell">
            <section className="panel">
                <p className="eyebrow">URL shortener</p>
                <h1>Make a short link</h1>
                <p className="lede">
                    Paste a long URL, generate a short one, and see the saved links below.
                </p>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>Original URL</span>
                        <input
                            type="url"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            placeholder="https://example.com/very/long/link"
                            required
                        />
                    </label>

                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Shorten URL'}
                    </button>
                </form>

                {error ? <p className="message error">{error}</p> : null}

                {shortUrl ? (
                    <p className="message success">
                        Short URL: <a href={shortUrl}>{shortUrl}</a>
                    </p>
                ) : null}
            </section>

            <section className="panel list-panel">
                <div className="panel-header">
                    <h2>Your Shortened URLs</h2>
                    <button type="button" className="secondary" onClick={loadUrls} disabled={loading}>
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                <div className="list">
                    {urls.length === 0 ? (
                        <p className="empty">No URLs saved yet. Create one above!</p>
                    ) : (
                        urls.map((item) => {
                            const itemShortUrl = `${API_BASE}${API_ROUTES.redirect(item.shortId)}`

                            return (
                                <article className="list-item" key={item.shortId}>
                                    <div>
                                        <p className="item-label">Original URL</p>
                                        <a href={item.originalUrl} target="_blank" rel="noreferrer">
                                            {item.originalUrl}
                                        </a>
                                    </div>

                                    <div>
                                        <p className="item-label">Short URL</p>
                                        <div className="short-url-group">
                                            <a href={itemShortUrl} target="_blank" rel="noreferrer">
                                                {itemShortUrl}
                                            </a>
                                            <button
                                                type="button"
                                                className="copy-btn"
                                                onClick={() => copyToClipboard(itemShortUrl)}
                                                title="Copy to clipboard"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="item-label">Clicks</p>
                                        <span>{item.totalClicks || 0}</span>
                                    </div>

                                    <div className="item-actions">
                                        <button
                                            type="button"
                                            className="delete-btn"
                                            onClick={() => handleDelete(item.shortId)}
                                            disabled={deleting === item.shortId}
                                            title="Delete this URL"
                                        >
                                            {deleting === item.shortId ? 'Deleting...' : '🗑️'}
                                        </button>
                                    </div>
                                </article>
                            )
                        })
                    )}
                </div>
            </section>
        </main>
    )
}

export default Home

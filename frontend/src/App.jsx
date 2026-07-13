import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './Login'
import Register from './Register'
import Home from './Home'
import { AUTH_CHANGE_EVENT } from './authEvents'
import './App.css'

function App() {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        function syncUserFromStorage() {
            const userData = localStorage.getItem('user')
            setUser(userData ? JSON.parse(userData) : null)
        }

        syncUserFromStorage()

        window.addEventListener(AUTH_CHANGE_EVENT, syncUserFromStorage)

        return () => {
            window.removeEventListener(AUTH_CHANGE_EVENT, syncUserFromStorage)
        }
    }, [])

    function handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
        navigate('/login')
    }

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

    return (
        <>
            {!isAuthPage && (
                <header className="app-header">
                    <div className="header-content">
                        <Link to="/" className="logo">
                            URL Shortener
                        </Link>
                        {user ? (
                            <div className="user-section">
                                <span className="user-name">Welcome, {user.name}</span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        ) : null}
                    </div>
                </header>
            )}

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </>
    )
}

export default App
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing  from './pages/Landing.jsx'
import Login    from './pages/Login.jsx'
import Signup   from './pages/Signup.jsx'
import Discover    from './pages/Discover.jsx'
import Matches     from './pages/Matches.jsx'
import LikedMe     from './pages/LikedMe.jsx'
import Chat        from './pages/Chat.jsx'
import Profile     from './pages/Profile.jsx'
import EditProfile from './pages/EditProfile.jsx'
import UserProfile from './pages/UserProfile.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />
        <Route path="/discover"  element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path="/liked-me"  element={<ProtectedRoute><LikedMe /></ProtectedRoute>} />
        <Route path="/matches"   element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/chat"     element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/users/:id"    element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

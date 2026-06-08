
import { type ReactNode } from "react"
import { Navigate, Route, Routes } from "react-router-dom" 
import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import { useAuth } from "../hooks/useAuth"

const RequreAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={"/login"} replace />
  }

  return <>{children}</>
}

const Router = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequreAuth>
            <Home />
          </RequreAuth>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default Router
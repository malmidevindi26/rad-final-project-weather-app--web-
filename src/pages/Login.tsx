
import { useState } from "react"
import { getMyDetails, login } from "../service/auth"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { setUser } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      return alert("Please fill all fields")
    }

    try {
      const loginData = await login(email, password)
      const accessToken = loginData?.data?.accessToken
      const refreshToken = loginData?.data?.refreshToken
      
      if (accessToken && refreshToken) {
        localStorage.setItem("ACCESS_TOKEN", accessToken)
        localStorage.setItem("REFRESH_TOKEN", refreshToken)

        const myRes = await getMyDetails()
        setUser(myRes?.data)

        navigate("/")
      } else {
        alert("Login fail..!")
      }
    } catch (err) {
      console.error(err)
      alert("Login fail..!")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition hover:scale-[1.01]">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Login to check your weather dashboard</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              placeholder="malmi@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 transition"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition cursor-pointer"
          >
            Sign In
          </button>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-indigo-600 font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
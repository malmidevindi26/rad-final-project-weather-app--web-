
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register } from "../service/auth"

const Register = () => {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [conPassword, setConPassword] = useState("")

  const handleRegister = async () => {
    if (!name || !email || !password || !conPassword) {
      return alert("Please fill all fields")
    }
    if (password !== conPassword) {
      return alert("Password not match..!")
    }
    try {
      await register(name, email, password)
      alert("Registration Success..!")
      navigate("/login")
    } catch (err) {
      console.error(err)
      alert("Registration fail..!")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition hover:scale-[1.01]">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Create Account</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Join with WeatherApp today</p>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="John Doe"
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="malmi@example.com"
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Confirm Password</label>
            <input
              value={conPassword}
              onChange={(e) => setConPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 transition"
            />
          </div>

          <button
            onClick={handleRegister}
            className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition cursor-pointer"
          >
            Register
          </button>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-purple-600 font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
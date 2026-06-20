import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../redux/store"
import {
  setCurrentWeather,
  setFavorites,
  addFavoriteSuccess,
  removeFavoriteSuccess
} from "../redux/weatherSlice"
import { WeatherChart } from "../components/WeatherChart"
import {
  addCityFavorites,
  deleteCityFromFavorites,
  fetchMyFavorites,
  fetchWeatherByCity,
  fetchWeatherForecast,
  updateFavoriteNote
} from "../service/weather"
import api from "../service/api"
import { WeatherForecast } from "../components/WeatherForecast"
import { WeatherChatBot } from "../components/WeatherChatBot"
import { ProfileModal } from "../components/ProfileModal"
import { WeatherMap } from "../components/WeatherMap"

const Home = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const weather = useSelector((state: RootState) => state.weather.currentWeather)
  const favorites = useSelector((state: RootState) => state.weather.favorites)

  const [city, setCity] = useState("")
  const [weatherLogs, setWeatherLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isCelsius, setIsCelsius] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState("")
  const [forecast, setForecast] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    loadFavorites()
    if (user?.profilePicture) {
      setProfilePic(user.profilePicture)
    }
  }, [user])

  const loadFavorites = async () => {
    try {
      const res = await fetchMyFavorites()
      dispatch(setFavorites(res.data || []))
    } catch (error) {
      console.error("Failed to load favorites", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("REFRESH_TOKEN")
    setUser(null)
    navigate("/login")
  }

  const handleSearch = async (searchCity: string) => {
    const targetCity = searchCity || city
    if (!targetCity) return alert("Please enter a city name")

    setLoading(true)
    try {
      const res = await fetchWeatherByCity(targetCity)
      if (res?.data) {
        dispatch(setCurrentWeather(res.data))
        if (res.data.logs) {
          setWeatherLogs(res.data.logs)
        } else {
          setWeatherLogs([])
        }
        if (!searchCity) setCity("")
      }

      const forecastData = await fetchWeatherForecast(targetCity)
      if (forecastData && forecastData.data) {
        setForecast(forecastData.data)
      }

      if (showMap) {
        setShowMap(false)
        setTimeout(() => {
          document.getElementById("weather-results")?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data.message || "Failed to fetch weather details")
      dispatch(setCurrentWeather(null))
      setWeatherLogs([])
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFavorite = async () => {
    if (!weather) return
    try {
      const res = await addCityFavorites(weather.city, weather.country || "", "My Favorite Place")
      alert(`${weather.city} added to favorites!`)
      if (res?.data) {
        dispatch(addFavoriteSuccess(res.data))
      }
      loadFavorites()
    } catch (error) {
      console.error(error)
      alert("Failed to save city")
    }
  }

  const handleUpdateNote = async (id: string) => {
    try {
      await updateFavoriteNote(id, editingNote)
      setEditingId(null)
      alert("Note updated successfully!")
      loadFavorites()
    } catch (error) {
      console.error(error)
      alert("Failed to update note")
    }
  }

  const handleDeleteFavorite = async (id: string) => {
    if (!confirm("Are you sure you want to remove this city?")) return
    try {
      await deleteCityFromFavorites(id)
      dispatch(removeFavoriteSuccess(id))
    } catch (error) {
      console.error(error)
      alert("Failed to delete city")
    }
  }

  const convertTemp = (celsius: number) => {
    if (isCelsius) return `${Math.round(celsius)}°C`
    return `${Math.round((celsius * 9) / 5 + 32)}°F`
  }

  const handleToggleAlert = async (cityId: string) => {
    try {
      const response = await api.patch(`/favorites/${cityId}/toggle-alert`)
      alert(response.data?.message || `Email alert status changed!`)
      loadFavorites()
    } catch (err: any) {
      console.error("Error toggling alert", err)
      alert(err.response?.data?.message || "Failed to update email alert status")
    }
  }
  

  //  return theme color for weather condition
const getWeatherTheme = (description: string, temp: number) => {
  const desc = description?.toLowerCase() || ""

  //  Heavy Sun / Very Hot (temp > 35)
  if (temp > 35 || desc.includes("hot")) {
    return {
      bg: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)",
      cardBg: "linear-gradient(135deg, #dc2626, #b91c1c)",
      navBg: "rgba(127,29,29,0.6)",
      accent: "#fca5a5",
      accentDark: "#ef4444",
      text: "#fee2e2",
      badge: "rgba(255,255,255,0.15)",
      aiCard: "rgba(220,38,38,0.15)",
      aiBorder: "rgba(220,38,38,0.3)",
      aiLabel: "#fca5a5",
      aiText: "#fecaca",
      label: "🔥 Scorching Hot"
    }
  }

  //  Normal Sun / Warm (temp 25-35, clear/sunny)
  if ((desc.includes("clear") || desc.includes("sunny") || desc.includes("fair")) && temp >= 25) {
    return {
      bg: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #431407 100%)",
      cardBg: "linear-gradient(135deg, #ea580c, #c2410c)",
      navBg: "rgba(124,45,18,0.6)",
      accent: "#fed7aa",
      accentDark: "#f97316",
      text: "#fff7ed",
      badge: "rgba(255,255,255,0.15)",
      aiCard: "rgba(234,88,12,0.15)",
      aiBorder: "rgba(234,88,12,0.3)",
      aiLabel: "#fed7aa",
      aiText: "#ffedd5",
      label: "☀️ Sunny & Warm"
    }
  }

  //  Normal Day / Mild (clear, clouds, mild temp)
  if (desc.includes("clear") || desc.includes("few clouds") || desc.includes("scattered")) {
    return {
      bg: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #1e3a8a 100%)",
      cardBg: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      navBg: "rgba(30,58,95,0.6)",
      accent: "#bfdbfe",
      accentDark: "#3b82f6",
      text: "#eff6ff",
      badge: "rgba(255,255,255,0.15)",
      aiCard: "rgba(37,99,235,0.15)",
      aiBorder: "rgba(37,99,235,0.3)",
      aiLabel: "#bfdbfe",
      aiText: "#dbeafe",
      label: "🌤️ Pleasant Day"
    }
  }

  //  Normal Rain / Drizzle
  if (desc.includes("drizzle") || desc.includes("light rain")) {
    return {
      bg: "linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #172554 100%)",
      cardBg: "linear-gradient(135deg, #1e40af, #1e3a8a)",
      navBg: "rgba(15,23,42,0.6)",
      accent: "#93c5fd",
      accentDark: "#3b82f6",
      text: "#dbeafe",
      badge: "rgba(255,255,255,0.15)",
      aiCard: "rgba(30,64,175,0.2)",
      aiBorder: "rgba(30,64,175,0.4)",
      aiLabel: "#93c5fd",
      aiText: "#bfdbfe",
      label: "🌧️ Light Rain"
    }
  }

  //  Heavy Rain / Thunderstorm / Storm
  if (desc.includes("rain") || desc.includes("thunder") || desc.includes("storm")) {
    return {
      bg: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #0c1444 100%)",
      cardBg: "linear-gradient(135deg, #0f172a, #1e1b4b)",
      navBg: "rgba(2,6,23,0.8)",
      accent: "#818cf8",
      accentDark: "#6366f1",
      text: "#e0e7ff",
      badge: "rgba(255,255,255,0.1)",
      aiCard: "rgba(99,102,241,0.15)",
      aiBorder: "rgba(99,102,241,0.3)",
      aiLabel: "#818cf8",
      aiText: "#c7d2fe",
      label: "⛈️ Heavy Storm"
    }
  }

  //  Foggy / Mist / Haze
  if (desc.includes("fog") || desc.includes("mist") || desc.includes("haze")) {
    return {
      bg: "linear-gradient(135deg, #1c1917 0%, #44403c 50%, #292524 100%)",
      cardBg: "linear-gradient(135deg, #57534e, #44403c)",
      navBg: "rgba(28,25,23,0.6)",
      accent: "#d6d3d1",
      accentDark: "#a8a29e",
      text: "#f5f5f4",
      badge: "rgba(255,255,255,0.15)",
      aiCard: "rgba(87,83,78,0.2)",
      aiBorder: "rgba(87,83,78,0.4)",
      aiLabel: "#d6d3d1",
      aiText: "#e7e5e4",
      label: "🌫️ Foggy"
    }
  }

  //  Overcast / Cloudy
  if (desc.includes("cloud") || desc.includes("overcast") || desc.includes("broken")) {
    return {
      bg: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)",
      cardBg: "linear-gradient(135deg, #475569, #334155)",
      navBg: "rgba(30,41,59,0.6)",
      accent: "#cbd5e1",
      accentDark: "#94a3b8",
      text: "#f1f5f9",
      badge: "rgba(255,255,255,0.15)",
      aiCard: "rgba(71,85,105,0.2)",
      aiBorder: "rgba(71,85,105,0.4)",
      aiLabel: "#cbd5e1",
      aiText: "#e2e8f0",
      label: "☁️ Cloudy"
    }
  }

  //  Snow / Cold
  if (desc.includes("snow") || desc.includes("sleet") || temp < 5) {
    return {
      bg: "linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #082f49 100%)",
      cardBg: "linear-gradient(135deg, #0284c7, #0369a1)",
      navBg: "rgba(12,74,110,0.6)",
      accent: "#bae6fd",
      accentDark: "#38bdf8",
      text: "#f0f9ff",
      badge: "rgba(255,255,255,0.15)",
      aiCard: "rgba(2,132,199,0.15)",
      aiBorder: "rgba(2,132,199,0.3)",
      aiLabel: "#bae6fd",
      aiText: "#e0f2fe",
      label: "❄️ Snowy & Cold"
    }
  }
  
  // Default — Normal Blue
  return {
    bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    cardBg: "linear-gradient(135deg, #4f46e5, #3730a3)",
    navBg: "rgba(15,12,41,0.6)",
    accent: "#c7d2fe",
    accentDark: "#6366f1",
    text: "#eef2ff",
    badge: "rgba(255,255,255,0.15)",
    aiCard: "rgba(79,70,229,0.15)",
    aiBorder: "rgba(79,70,229,0.3)",
    aiLabel: "#c7d2fe",
    aiText: "#e0e7ff",
    label: "🌙 Default"
  }
}

// set default theme color
  const theme = weather
    ? getWeatherTheme(weather.description, weather.temp)
    : getWeatherTheme("", 20)
  
  return (
    <div className="min-h-screen font-sans transition-all duration-700"
     style={{ background: theme.bg }}>

      {/* Navbar */}
      <nav style={{ backdropFilter: "blur(20px)", background: theme.navBg }}
          className="sticky top-0 z-40 border-b border-white/10 px-6 py-3 flex justify-between items-center">

        <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span className="text-2xl">☁️</span>
          <span style={{ color: theme.accent }}>SkyAI Weather</span>
        </h1>

        <div className="flex items-center gap-3">
          {/* Weather condition label */}
          {weather && (
            <span style={{ color: theme.accent }} className="text-xs font-bold hidden md:block">
              {theme.label}
            </span>
          )}

          <button
            onClick={() => setIsCelsius(!isCelsius)}
            style={{ color: theme.accent, borderColor: "rgba(255,255,255,0.2)" }}
            className="px-3 py-1.5 text-xs font-bold bg-white/10 border rounded-full hover:bg-white/20 transition cursor-pointer backdrop-blur-sm"
          >
            🔄 {isCelsius ? "°F" : "°C"}
          </button>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 pl-2 pr-4 py-1.5 rounded-full shadow-sm transition active:scale-95 cursor-pointer backdrop-blur-sm"
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-7 h-7 rounded-full object-cover border-2 border-white/30" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: theme.accentDark }}>
                {user?.email?.[0]?.toUpperCase() || "👤"}
              </div>
            )}
            <span className="text-xs font-bold tracking-tight" style={{ color: theme.accent }}>
              {user?.email?.split("@")[0]}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs bg-rose-500/80 text-white font-bold rounded-full hover:bg-rose-500 border border-rose-400/30 shadow-lg active:scale-95 transition cursor-pointer backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Hero Search Section */}
      <div className="w-full px-6 pt-10 pb-6 flex flex-col items-center">
        <p className="text-sm mb-4 tracking-widest uppercase font-semibold" style={{ color: `${theme.accent}99` }}>
          Real-time weather · AI insights · Global map
        </p>
        <div className="flex w-full max-w-3xl backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl items-center gap-2 p-2"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          <input
            type="text"
            placeholder="Search any city in the world..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch("")}
            className="w-full bg-transparent px-4 py-2.5 text-white focus:outline-none text-base font-medium"
            style={{ caretColor: theme.accent }}
          />
          <button
            onClick={() => handleSearch("")}
            disabled={loading}
            className="px-6 py-2.5 text-white font-bold rounded-xl shadow-lg active:scale-95 transition cursor-pointer disabled:opacity-50 whitespace-nowrap text-sm"
            style={{ background: theme.cardBg }}
          >
            {loading ? "⏳ Searching..." : "🔍 Search"}
          </button>
          <button
            onClick={() => setShowMap((prev) => !prev)}
            className="px-4 py-2.5 font-bold rounded-xl active:scale-95 transition cursor-pointer whitespace-nowrap text-sm border backdrop-blur-sm"
            style={showMap
              ? { background: theme.accentDark, color: "#fff", borderColor: theme.accentDark }
              : { background: "rgba(255,255,255,0.08)", color: theme.accent, borderColor: "rgba(255,255,255,0.2)" }
            }
          >
            🌍 {showMap ? "Hide" : "Map"}
          </button>
        </div>

        {/* Loading bar */}
        {loading && (
          <div className="w-full max-w-3xl mt-3 bg-white/10 rounded-full h-1 overflow-hidden">
            <div className="h-1 rounded-full animate-pulse w-3/4"
              style={{ background: theme.accentDark }} />
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="w-full px-6 pb-16 grid grid-cols-1 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">

        {/* Left: Map + Weather (3 cols) */}
        <div className="xl:col-span-3 space-y-6">

          {/* Map */}
          {showMap && (
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <WeatherMap
                onCitySelect={(selectedCity) => {
                  setCity(selectedCity)
                  handleSearch(selectedCity)
                }}
                currentWeather={weather}
                isCelsius={isCelsius}
              />
            </div>
          )}

          {/* Weather Results */}
          <div id="weather-results">
            {weather ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Main Weather Card */}
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/10 p-7 flex flex-col justify-between min-h-[280px]"
                    style={{ background: theme.cardBg }}>

                    {/* Orb effects */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl"
                      style={{ background: `${theme.accentDark}33` }} />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl"
                      style={{ background: `${theme.accent}22` }} />

                    <div className="relative flex justify-between items-start">
                      <div>
                        <h2 className="text-4xl font-black text-white tracking-tight">{weather.city}</h2>
                        <p className="text-sm mt-1 font-medium" style={{ color: theme.accent }}>{weather.country}</p>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-1 border border-white/20 backdrop-blur-sm">
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                          alt={weather.description}
                          className="w-16 h-16"
                        />
                      </div>
                    </div>

                    <div className="relative flex justify-between items-end mt-6">
                      <div>
                        <h1 className="text-6xl font-black text-white tracking-tighter">
                          {convertTemp(weather.temp)}
                        </h1>
                        <p className="font-semibold text-sm mt-2 capitalize" style={{ color: theme.accent }}>
                          {weather.description}
                        </p>
                      </div>
                      <div className="text-right space-y-1.5">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5">
                          <p className="text-xs font-bold" style={{ color: theme.text }}>
                            💧 {weather.humidity}% humidity
                          </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5">
                          <p className="text-xs font-bold" style={{ color: theme.text }}>
                            🌬️ Feels {convertTemp(weather.feels_like)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveFavorite}
                      className="relative mt-5 w-full py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition border border-white/20 backdrop-blur-sm active:scale-95 cursor-pointer"
                    >
                      ⭐ Add to Favorites
                    </button>
                  </div>

                  {/* AI Insights Card */}
                  <div className="backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col justify-between"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-lg"
                          style={{ background: theme.accentDark }}>
                          🧠
                        </div>
                        <h3 className="font-black text-white text-lg">AI Insights</h3>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="p-3.5 rounded-2xl backdrop-blur-sm"
                          style={{ background: theme.aiCard, border: `1px solid ${theme.aiBorder}` }}>
                          <p className="font-black mb-1.5" style={{ color: theme.aiLabel }}>
                            💡 Lifestyle Tip
                          </p>
                          <p className="leading-relaxed" style={{ color: theme.aiText }}>
                            {weather.ai?.lifestyle || "No tip available"}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl backdrop-blur-sm"
                          style={{ background: theme.aiCard, border: `1px solid ${theme.aiBorder}` }}>
                          <p className="font-black mb-1.5" style={{ color: theme.aiLabel }}>
                            👕 Outfit Suggestion
                          </p>
                          <p className="leading-relaxed" style={{ color: theme.aiText }}>
                            {weather.ai?.outfit || "No suggestion available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forecast */}
                <div className="backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  <WeatherForecast forecastData={forecast} />
                </div>

                {/* Chart */}
                <div className="backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  <WeatherChart logs={weatherLogs} />
                </div>
              </div>
            ) : (
              !showMap && (
                <div className="text-center py-24 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  <span className="text-7xl block mb-4">🌤️</span>
                  <h3 className="text-white font-black text-xl mb-2">Ready to explore weather?</h3>
                  <p className="text-sm" style={{ color: `${theme.accent}80` }}>
                    Search a city or open the map to get started.
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right: Saved Locations */}
        <div className="xl:col-span-1">
          <div className="backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-5 sticky top-20"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
                style={{ background: `${theme.accentDark}33`, border: `1px solid ${theme.accentDark}55` }}>
                ⭐
              </span>
              Saved Locations
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border border-white/10"
                style={{ background: "rgba(255,255,255,0.1)", color: theme.accent }}>
                {favorites.length}
              </span>
            </h3>

            {favorites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📍</p>
                <p className="text-xs" style={{ color: `${theme.accent}50` }}>No favorite cities yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
                {favorites.map((fav) => (
                  <div key={fav._id} className="p-3 rounded-2xl border border-white/10 space-y-2 transition hover:bg-white/10"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleSearch(fav.cityName)}
                        className="font-bold hover:text-white transition text-left text-sm cursor-pointer"
                        style={{ color: theme.accent }}
                      >
                        📍 {fav.cityName}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleAlert(fav._id)}
                          className={`text-xs p-1.5 rounded-lg transition-all cursor-pointer active:scale-90 ${
                            fav.isAlertEnabled
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                              : "bg-white/5 text-white/30 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {fav.isAlertEnabled ? "🔔" : "🔕"}
                        </button>
                        <button
                          onClick={() => handleDeleteFavorite(fav._id)}
                          className="text-white/20 hover:text-rose-400 transition text-xs cursor-pointer p-1.5 rounded-lg hover:bg-rose-400/10"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {editingId === fav._id ? (
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={editingNote}
                          onChange={(e) => setEditingNote(e.target.value)}
                          className="w-full bg-white/10 px-2 py-1 border border-white/20 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none"
                          style={{ borderColor: theme.accentDark }}
                        />
                        <button
                          onClick={() => handleUpdateNote(fav._id)}
                          className="px-2 py-1 bg-emerald-500/80 text-white font-bold rounded-lg text-[10px] cursor-pointer hover:bg-emerald-500"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-white/10 text-white/60 rounded-lg text-[10px] cursor-pointer hover:bg-white/20"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-xs bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5">
                        <span className="italic truncate" style={{ color: `${theme.accent}50` }}>
                          {fav.note || "No note"}
                        </span>
                        <button
                          onClick={() => { setEditingId(fav._id); setEditingNote(fav.note || "") }}
                          className="font-semibold ml-2 shrink-0 cursor-pointer hover:opacity-100 opacity-60"
                          style={{ color: theme.accentDark }}
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <WeatherChatBot currentCity={weather?.city} />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        setUser={(updatedUser) => {
          setUser(updatedUser)
          if (updatedUser?.profilePicture) setProfilePic(updatedUser.profilePicture)
        }}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default Home
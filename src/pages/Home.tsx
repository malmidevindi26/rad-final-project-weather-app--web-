import React, { useEffect, useState } from "react"
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

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 uppercase tracking-wider">
          ☁️ SkyAI Weather
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCelsius(!isCelsius)}
            className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-100 transition cursor-pointer"
          >
            🔄 Switch to {isCelsius ? "Fahrenheit (°F)" : "Celsius (°C)"}
          </button>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 pl-2 pr-4 py-1 rounded-full shadow-sm transition active:scale-95 cursor-pointer focus:outline-none"
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover border border-indigo-100"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs">
                👤
              </div>
            )}
            <span className="text-xs font-bold text-gray-700 tracking-tight">
              {user?.email?.split("@")[0]}
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-md active:scale-95 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">

          {/* Search Bar */}
          <div className="flex bg-white p-2 rounded-2xl shadow-md items-center border border-gray-100 gap-2">
            <input
              type="text"
              placeholder="Search city (e.g. Colombo, Galle, London)..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch("")}
              className="w-full bg-transparent px-4 py-2 text-gray-700 focus:outline-none text-lg"
            />
            <button
              onClick={() => handleSearch("")}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition cursor-pointer disabled:bg-gray-400 whitespace-nowrap"
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              onClick={() => setShowMap((prev) => !prev)}
              className={`px-4 py-3 font-bold rounded-xl shadow-md active:scale-95 transition cursor-pointer whitespace-nowrap text-sm border ${
                showMap
                  ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                  : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              🌍 {showMap ? "Hide Map" : "Map"}
            </button>
          </div>

          {/* Loading bar */}
          {loading && (
            <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse w-3/4" />
            </div>
          )}

          {/* Map */}
          {showMap && (
            <WeatherMap
              onCitySelect={(selectedCity) => {
                setCity(selectedCity)
                handleSearch(selectedCity)
              }}
              currentWeather={weather}
              isCelsius={isCelsius} 
            />
          )}

          {/* Weather Results */}
          <div id="weather-results">
            {weather ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Weather Card */}
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between min-h-[260px]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-3xl font-extrabold">{weather.city}</h2>
                        <p className="text-blue-100 text-sm mt-1">{weather.country}</p>
                      </div>
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                        alt={weather.description}
                        className="w-16 h-16 bg-white/10 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <h1 className="text-5xl font-black tracking-tighter">
                          {convertTemp(weather.temp)}
                        </h1>
                        <p className="text-blue-100 font-medium text-sm mt-1 capitalize">
                          {weather.description}
                        </p>
                      </div>
                      <div className="text-right text-xs text-blue-100 space-y-1">
                        <p>💧 Humidity: {weather.humidity}%</p>
                        <p>🌬️ Feels Like: {convertTemp(weather.feels_like)}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveFavorite}
                      className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition backdrop-blur-sm active:scale-95 cursor-pointer"
                    >
                      ⭐ Add to Favorites
                    </button>
                  </div>

                  {/* AI Insights */}
                  <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🧠</span>
                        <h3 className="font-extrabold text-gray-800 text-lg">AI Insights</h3>
                      </div>
                      <div className="space-y-3 text-xs text-gray-600">
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded-r-xl">
                          <p className="font-bold text-amber-800 mb-0.5">💡 Lifestyle Tip</p>
                          {weather.ai?.lifestyle || "No tip available"}
                        </div>
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-2.5 rounded-r-xl">
                          <p className="font-bold text-indigo-800 mb-0.5">👕 Outfit Suggestion</p>
                          {weather.ai?.outfit || "No suggestion available"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <WeatherForecast forecastData={forecast} />
                <WeatherChart logs={weatherLogs} />
              </div>
            ) : (
              !showMap && (
                <div className="text-center py-12 text-gray-400 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <span className="text-5xl block mb-2">🔍</span>
                  Enter a city name above or click on the map to view real-time weather, AI insights, and forecast.
                </div>
              )
            )}
          </div>
        </div>

        {/* Saved Locations */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-fit">
          <h3 className="font-extrabold text-gray-800 text-lg mb-4 flex items-center gap-2">
            ⭐ Saved Locations ({favorites.length})
          </h3>
          {favorites.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No favorite cities saved yet.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
              {favorites.map((fav) => (
                <div key={fav._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleSearch(fav.cityName)}
                      className="font-bold text-gray-800 hover:text-indigo-600 transition text-left text-sm cursor-pointer"
                    >
                      📍 {fav.cityName}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAlert(fav._id)}
                        className={`text-sm p-1.5 rounded-xl transition-all cursor-pointer active:scale-90 ${
                          fav.isAlertEnabled
                            ? "bg-amber-50 text-amber-500 border border-amber-200"
                            : "bg-gray-100 text-gray-400 border border-transparent hover:bg-gray-200"
                        }`}
                        title={fav.isAlertEnabled ? "Mute Morning Email Alerts" : "Enable Morning Email Alerts"}
                      >
                        {fav.isAlertEnabled ? "🔔 Active" : "🔕 Off"}
                      </button>
                      <button
                        onClick={() => handleDeleteFavorite(fav._id)}
                        className="text-gray-400 hover:text-rose-500 transition text-xs cursor-pointer ml-1"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                  {editingId === fav._id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        className="w-full bg-white px-2 py-1 border rounded-lg text-xs focus:outline-none"
                      />
                      <button
                        onClick={() => handleUpdateNote(fav._id)}
                        className="px-2 py-1 bg-green-500 text-white font-bold rounded-lg text-[10px] cursor-pointer hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded-lg text-[10px] cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-xs bg-white px-2 py-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-500 italic">
                        {fav.note || "No notes added"}
                      </span>
                      <button
                        onClick={() => { setEditingId(fav._id); setEditingNote(fav.note || "") }}
                        className="text-[11px] text-indigo-500 font-semibold hover:underline cursor-pointer"
                      >
                        ✏️ Edit Note
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
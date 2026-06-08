import React, { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface CityWeather {
  name: string
  lat: number
  lon: number
  temp: number
  description: string
  humidity: number
  feels_like: number
  icon: string
  country: string
}

interface WeatherMapProps {
  onCitySelect: (city: string) => void
  currentWeather?: any
  isCelsius?: boolean
}

const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Create custom temperature label marker
const createTempIcon = (temp: number, isCelsius: boolean, isSelected: boolean) => {
  const displayTemp = isCelsius ? `${Math.round(temp)}°C` : `${Math.round((temp * 9) / 5 + 32)}°F`

  const bgColor = isSelected
    ? "#4f46e5"
    : temp >= 35 ? "#ef4444"
    : temp >= 28 ? "#f97316"
    : temp >= 20 ? "#eab308"
    : temp >= 10 ? "#22c55e"
    : "#3b82f6"

  return L.divIcon({
    className: "",
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        border: 2px solid white;
        font-family: sans-serif;
      ">
        ${displayTemp}
      </div>
    `,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
    popupAnchor: [0, -16],
  })
}

export const WeatherMap: React.FC<WeatherMapProps> = ({ onCitySelect, currentWeather, isCelsius = true }) => {
  const [clickedMarker, setClickedMarker] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cityWeathers, setCityWeathers] = useState<CityWeather[]>([])

  const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

  // Popular world cities to show temp markers on map
  const DEFAULT_CITIES = [
    "Colombo", "London", "New York", "Tokyo", "Paris",
    "Dubai", "Sydney", "Singapore", "Mumbai", "Bangkok",
    "Berlin", "Toronto", "Cairo", "Lagos", "Beijing"
  ]

  // Fetch weather for default cities on mount
  useEffect(() => {
    const fetchCityWeathers = async () => {
      const results: CityWeather[] = []
      for (const cityName of DEFAULT_CITIES) {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OWM_KEY}&units=metric`
          )
          const data = await res.json()
          if (data.cod === 200) {
            results.push({
              name: data.name,
              lat: data.coord.lat,
              lon: data.coord.lon,
              temp: data.main.temp,
              description: data.weather[0].description,
              humidity: data.main.humidity,
              feels_like: data.main.feels_like,
              icon: data.weather[0].icon,
              country: data.sys.country,
            })
          }
        } catch (e) {
          console.error(`Failed to fetch weather for ${cityName}`, e)
        }
      }
      setCityWeathers(results)
    }

    fetchCityWeathers()
  }, [])

  // When currentWeather changes, add/update it in cityWeathers
  useEffect(() => {
    if (!currentWeather || !clickedMarker) return

    setCityWeathers((prev) => {
      const exists = prev.find((c) => c.name === currentWeather.city)
      const updated: CityWeather = {
        name: currentWeather.city,
        lat: clickedMarker.lat,
        lon: clickedMarker.lng,
        temp: currentWeather.temp,
        description: currentWeather.description,
        humidity: currentWeather.humidity,
        feels_like: currentWeather.feels_like,
        icon: currentWeather.icon,
        country: currentWeather.country,
      }
      if (exists) {
        return prev.map((c) => (c.name === currentWeather.city ? updated : c))
      }
      return [...prev, updated]
    })
  }, [currentWeather])

  const handleMapClick = async (lat: number, lng: number) => {
    setIsLoading(true)
    setClickedMarker({ lat, lng })

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      const data = await res.json()

      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.address?.state

      if (city) {
        onCitySelect(city)
      } else {
        alert("Could not detect a city at this location. Try clicking closer to a city.")
        setClickedMarker(null)
      }
    } catch (error) {
      console.error("Reverse geocode failed:", error)
      alert("Failed to detect location. Please try again.")
      setClickedMarker(null)
    } finally {
      setIsLoading(false)
    }
  }

  const convertTemp = (celsius: number) => {
    if (isCelsius) return `${Math.round(celsius)}°C`
    return `${Math.round((celsius * 9) / 5 + 32)}°F`
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-extrabold text-base flex items-center gap-2">
            🌍 Global Weather Map
          </h3>
          <p className="text-blue-100 text-xs mt-0.5">
            Click anywhere on the map to get weather • Temperature markers shown in {isCelsius ? "°C" : "°F"}
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-xs font-bold">Detecting...</span>
          </div>
        )}
      </div>

      {/* Temperature color legend */}
      <div className="flex items-center gap-3 px-5 py-2 bg-slate-50 border-b border-gray-100 flex-wrap">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Temp Scale:</span>
        {[
          { color: "#3b82f6", label: "< 10°C" },
          { color: "#22c55e", label: "10–20°C" },
          { color: "#eab308", label: "20–28°C" },
          { color: "#f97316", label: "28–35°C" },
          { color: "#ef4444", label: "> 35°C" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
            <span className="text-[10px] text-gray-600 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="relative" style={{ height: "420px" }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* OWM Temperature overlay */}
          <TileLayer
            url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`}
            attribution='&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
            opacity={0.5}
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {/* City temperature markers */}
          {cityWeathers.map((city) => (
            <Marker
              key={city.name}
              position={[city.lat, city.lon]}
              icon={createTempIcon(
                city.temp,
                isCelsius,
                currentWeather?.city === city.name
              )}
            >
              <Popup>
                <div className="text-center p-1 min-w-[140px]">
                  <p className="font-bold text-gray-800 text-sm">
                    📍 {city.name}, {city.country}
                  </p>
                  <p className="text-2xl font-black text-indigo-600 my-1">
                    {convertTemp(city.temp)}
                  </p>
                  <p className="text-gray-500 text-xs capitalize">{city.description}</p>
                  <div className="flex gap-3 justify-center mt-1 text-xs text-gray-500">
                    <span>💧 {city.humidity}%</span>
                    <span>🌡️ Feels {convertTemp(city.feels_like)}</span>
                  </div>
                  <button
                    onClick={() => onCitySelect(city.name)}
                    className="mt-2 w-full py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    View Full Weather
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {!clickedMarker && cityWeathers.length === 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <span className="text-lg">👆</span>
              <span className="text-xs font-bold text-gray-700">Click any location to get weather</span>
            </div>
          </div>
        )}
      </div>

      {/* Current weather info bar */}
      {currentWeather && clickedMarker && (
        <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-t border-indigo-100 flex items-center gap-4">
          <img
            src={`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`}
            alt={currentWeather.description}
            className="w-12 h-12"
          />
          <div className="flex-1">
            <p className="font-extrabold text-gray-800 text-sm">
              📍 {currentWeather.city}, {currentWeather.country}
            </p>
            <p className="text-xs text-gray-500 capitalize">{currentWeather.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-indigo-600">{convertTemp(currentWeather.temp)}</p>
            <p className="text-xs text-gray-400">💧 {currentWeather.humidity}% humidity</p>
          </div>
        </div>
      )}
    </div>
  )
}
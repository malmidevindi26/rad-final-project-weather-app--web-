import api from "./api"

export const fetchWeatherByCity = async (city: string) => {
  const res = await api.get(`/weather?city=${city}`)
  return res.data
}

export const addCityFavorites = async (cityName: string, country: string, note?: string) => {
  const res = await api.post("/favorites", { cityName, country, note })
  return res.data
}

export const fetchMyFavorites = async () => {
  const res = await api.get("/favorites")
  return res.data
}

export const updateFavoriteNote = async (id: string, note: string) => {
  const res = await api.put(`/favorites/${id}`, { note })
  return res.data
}

export const deleteCityFromFavorites = async (id: string) => {
  const res = await api.delete(`/favorites/${id}`)
  return res.data
}

export const fetchWeatherForecast = async (city: string) => {
  const res = await api.get(`/weather/forecast?city=${city}`)
  return res.data
}

export const askChatBot = async (message: string, currentCity?: string) => {
  const res = await api.post("/weather/chat", { message, currentCity })
  return res.data
}
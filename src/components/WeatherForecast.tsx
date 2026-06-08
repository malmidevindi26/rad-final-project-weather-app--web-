import React from "react";
interface ForecastProps{
    forecastData: any;
}

export const WeatherForecast: React.FC<ForecastProps> = ({forecastData}) => {
    if(!forecastData || !forecastData.list) return null

    // shoe first 8 data withing 24 hours
    const items = forecastData.list.slice(0, 8)

    // time formating
    const formatTime = (txtDate: string) =>{
        const date = new Date(txtDate)
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    }

    const formatDate = (txtDate: string) => {
        const date = new Date(txtDate);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mt-6">
      <h3 className="font-extrabold text-gray-800 text-lg mb-4 flex items-center gap-2">
        📅 Hourly Forecast (Next 24 Hours)
      </h3>
      
      {/* Scrollable Row */}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-indigo-200">
        {items.map((item: any, index: number) => (
          <div 
            key={index} 
            className="flex flex-col items-center bg-slate-50 border border-slate-100 rounded-2xl p-4 min-w-[100px] text-center shadow-sm hover:scale-105 transition"
          >
            <p className="text-xs font-semibold text-gray-400">{formatDate(item.dt_txt)}</p>
            <p className="text-xs font-bold text-gray-700 mt-0.5">{formatTime(item.dt_txt)}</p>
            
            <img 
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
              alt={item.weather[0].description}
              className="w-12 h-12 my-1 bg-indigo-50 rounded-full"
            />
            
            <p className="text-base font-black text-gray-800">{Math.round(item.main.temp)}°C</p>
            <p className="text-[10px] text-gray-500 capitalize font-medium truncate w-20">{item.weather[0].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
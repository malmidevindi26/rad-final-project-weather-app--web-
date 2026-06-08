import { createContext, useEffect, useState, type ReactNode } from "react";
import { getMyDetails } from "../service/auth";

export const AuthContex = createContext<any>(null)

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN")

    if(token) {
        setLoading(true)
        getMyDetails()
         .then((res) => {
            if(res?.data) setUser(res.data)
            else setUser(null)
         })
         .catch((err) => {
            console.error(err)
            setUser(null)
         })
         .finally(() => setLoading(false))
    } else {
        setUser(null)
        loading && setLoading(false)
    }
  }, [])

  return (
    <AuthContex.Provider value={{user, setUser, loading}}>
        {children}
    </AuthContex.Provider>
  )
} 
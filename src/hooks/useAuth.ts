import { useContext } from "react"
import { AuthContex } from "../context/AuthContext"

export const useAuth = () => {
   const context = useContext(AuthContex)
   if(!context) throw new Error("useAuth must be used within an AuthProvider");
   return context
   
} 
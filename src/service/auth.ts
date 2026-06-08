import api from "./api"

export const register = async(name:string, email:string,password: string) =>{
    const res = await api.post("/auth/register", {name,email,password})
    return res.data
}

export const login = async (email:string, password:string) => {
    const res = await api.post("/auth/login", {email,password})
    return res.data
}

export const getMyDetails = async() => {
    const res = await api.get("/auth/me")
    return res.data
}

// profile crud operations
export const updateMyProfilePic = async (file:File) => {
    const formData = new FormData()
    formData.append("image", file)

    const res = await api.put("/auth/profile-pic", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data
}

export const changeMyPassword = async (oldPassword : string, newPassword: string) => {
    const res = await api.put("/auth/change-password", {oldPassword, newPassword})
    return res.data
}

export const deleteMyAccount = async () =>{
    const res = await api.delete("/auth/delete-account")
    return res.data
}
import React, { useState } from "react";
import { changeMyPassword, deleteMyAccount, updateMyProfilePic } from "../service/auth";

interface ProfileModelProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;                         
    setUser: (user: any) => void;
    onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModelProps> = ({ isOpen, onClose, user, setUser, onLogout }) => {
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

 const handleUpdatePic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select an image file first");
    setLoading(true);

    try {
      const response = await updateMyProfilePic(selectedFile);
      alert("Profile picture updated successfully!");

      const localImageUrl = URL.createObjectURL(selectedFile);
      
      setUser({
        ...user,
        profilePicture: localImageUrl 
      });

      setSelectedFile(null);
      onClose(); 
    } catch (error) {
      console.error(error);
      alert("Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) return alert("Please fill all password fields");
        setLoading(true);

        try {
            await changeMyPassword(oldPassword, newPassword);
            alert("Password change successfully!");
            setOldPassword("");
            setNewPassword("");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("⚠️ WARNING: Are you absolutely sure you want to delete your account? This action cannot be undone!")) return;
        try {
            await deleteMyAccount();
            alert("Your account is deleted.");
            onLogout();
        } catch (err) {
            alert("Failed to delete account");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⚙️</span>
                        <h3 className="font-extrabold text-base tracking-wide">Account Settings</h3>
                    </div>
                    <button onClick={onClose} className="text-white text-lg font-bold hover:text-gray-200 cursor-pointer">✕</button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-1 text-xs">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <p className="text-gray-400 font-medium">Logged in as</p>
                      
                        <p className="font-bold text-gray-800 text-sm mt-0.5">👤 {user?.email || "No Email"}</p>
                    </div>

                    {/* 1. Profile Picture CRUD */}
                    <form onSubmit={handleUpdatePic} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                        <h4 className="font-extrabold text-gray-700 text-sm">📸 Upload Profile Picture</h4>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setSelectedFile(e.target.files[0]);
                                }
                            }}
                            className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition cursor-pointer disabled:bg-gray-400"
                        >
                            {loading ? "Uploading to Cloudinary..." : "Upload & Save Avatar"}
                        </button>
                    </form>

                    {/* 2. Change Password */}
                    <form onSubmit={handleChangePassword} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                        <h4 className="font-extrabold text-gray-700 text-sm">🔒 Change Password</h4>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button type="submit" disabled={loading} className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer">
                            Update Password
                        </button>
                    </form>

                    {/* 3. Delete Account Danger Zone */}
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl space-y-2">
                        <h4 className="font-extrabold text-rose-800 text-sm">⚠️ Danger Zone</h4>
                        <p className="text-rose-600 text-[11px]">Once you delete your account, there is no going back. Please be certain.</p>
                        <button onClick={handleDeleteAccount} className="w-full py-2 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition shadow-md active:scale-95 cursor-pointer">
                            Delete My Account Permanently
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
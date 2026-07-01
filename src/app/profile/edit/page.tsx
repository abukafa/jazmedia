"use client";
import { X, Loader2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "@/lib/actions/user";
import { useSession } from "next-auth/react";

interface Skill {
  name: string;
  icon: string;
  percentage: number;
}

export default function EditProfile() {
  const router = useRouter();
  const { data: session, update } = useSession();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("member");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session) {
      getUserProfile().then((data) => {
        if (data) {
          setName(data.name || "");
          setBio(data.bio || "");
          setRole(data.role || "member");
          setSkills(data.skills || []);
        }
        setIsLoading(false);
      });
    }
  }, [session]);

  const handleAddSkill = () => {
    setSkills([...skills, { name: "", icon: "", percentage: 50 }]);
  };

  const handleUpdateSkill = (index: number, field: keyof Skill, value: string | number) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("role", role);
    formData.append("skills", JSON.stringify(skills));
    
    const res = await updateUserProfile(formData);
    if (res.success) {
      // Refresh session if name/role changes
      await update({ name, role });
      router.push("/profile");
    } else {
      alert("Gagal menyimpan profil: " + res.error);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium text-slate-500">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-10 px-4 flex flex-col z-[100] relative bg-white min-h-full">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50" disabled={isSaving}>
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Edit Profile</h1>
        <Button 
          variant="ghost" 
          onClick={handleSave} 
          disabled={isSaving}
          className="text-blue-600 font-bold hover:bg-blue-50 hover:text-blue-700 -mr-2 px-3"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan"}
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">Nama Lengkap</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
            placeholder="Masukkan nama lengkap" 
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">Role Anda</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isSaving}
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm disabled:opacity-50"
          >
            <option value="member">Member</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">Bio</label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isSaving}
            placeholder="Ceritakan tentang diri Anda, keahlian, atau portofolio..." 
            className="w-full bg-white border border-slate-200 rounded-3xl p-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-28 shadow-sm disabled:opacity-50"
          ></textarea>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 px-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Skills</label>
            <button 
              onClick={handleAddSkill} 
              disabled={isSaving}
              className="text-xs font-bold text-blue-600 flex items-center hover:text-blue-700 transition-colors"
            >
              <Plus className="w-3 h-3 mr-1" /> Tambah
            </button>
          </div>
          
          <div className="space-y-3">
            {skills.length === 0 ? (
              <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-2xl border-dashed">
                <p className="text-xs font-medium text-slate-500">Belum ada skill ditambahkan.</p>
              </div>
            ) : (
              skills.map((skill, index) => (
                <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex-1 space-y-2">
                    <input 
                      placeholder="Nama Skill (mis. React)" 
                      value={skill.name} 
                      onChange={(e) => handleUpdateSkill(index, "name", e.target.value)}
                      disabled={isSaving}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <div className="flex gap-2">
                      <input 
                        placeholder="Emoji/Inisial (mis. ⚛️)" 
                        value={skill.icon} 
                        onChange={(e) => handleUpdateSkill(index, "icon", e.target.value)}
                        disabled={isSaving}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                      <div className="relative w-20">
                        <input 
                          type="number" 
                          placeholder="%" 
                          value={skill.percentage} 
                          onChange={(e) => handleUpdateSkill(index, "percentage", Number(e.target.value))}
                          disabled={isSaving}
                          min="0" max="100"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-6 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" 
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveSkill(index)} 
                    disabled={isSaving}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

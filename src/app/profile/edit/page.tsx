"use client";
import { X, Loader2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/providers/AlertProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "@/lib/actions/user";
import { useSession } from "next-auth/react";
import { SKILL_ICONS, SkillIconName } from "@/components/ui/skill-icons";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/utils/cropImage";
import { uploadProfilePicture } from "@/lib/actions/upload";
import { unlinkInstagramAccount } from "@/lib/actions/auth-custom";
import { getDirectMediaUrl } from "@/lib/utils/media";

interface Education {
  school: string;
  major: string;
  degree: string;
  year: string;
}

interface Skill {
  name: string;
  icon: SkillIconName;
  percentage: number;
}

export default function EditProfile() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { showAlert, showConfirm } = useAlert();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("member");
  const [ setHeadline] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [education, setEducation] = useState<Education[]>([]);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [instagramId, setInstagramId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (session) {
      getUserProfile().then((data) => {
        if (data) {
          setName(data.name || "");
          setEmail(data.email || "");
          setUsername(data.username || "");
          setImage(data.image || "");
          setBio(data.bio || "");
          setHeadline(data.headline || "");
          setAddressDetail(data.address_detail || "");
          setBannerImage(data.banner_image || "");
          let loadedEdu: Education[] = [];
          if (Array.isArray(data.education)) {
             loadedEdu = data.education;
          } else if (typeof data.education === "string") {
             try { loadedEdu = JSON.parse(data.education); } catch {}
          }
          setEducation(loadedEdu);
          setRole(data.role || "member");
          let loadedSkills: Skill[] = [];
          const rawSkills = data.skills;
          if (Array.isArray(rawSkills)) {
            loadedSkills = rawSkills.map((s: any) =>
              typeof s === "string"
                ? { name: s, icon: "Code", percentage: 100 }
                : {
                    name: s?.name || "",
                    icon: s?.icon || "Code",
                    percentage: typeof s?.percentage === "number" ? s.percentage : 100,
                  }
            );
          } else if (typeof rawSkills === "string") {
            try {
              const parsed = JSON.parse(rawSkills);
              if (Array.isArray(parsed)) {
                loadedSkills = parsed.map((s: any) =>
                  typeof s === "string"
                    ? { name: s, icon: "Code", percentage: 100 }
                    : {
                        name: s?.name || "",
                        icon: s?.icon || "Code",
                        percentage: typeof s?.percentage === "number" ? s.percentage : 100,
                      }
                );
              } else {
                loadedSkills = rawSkills
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
                  .map((s: string) => ({ name: s, icon: "Code", percentage: 100 }));
              }
            } catch {
              loadedSkills = rawSkills
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
                .map((s: string) => ({ name: s, icon: "Code", percentage: 100 }));
            }
          }
          setSkills(loadedSkills);
          setInstagramId(data.instagramId || null);
          setPhone(data.phone || "");
          setLinkedin(data.linkedin || "");
          setGithub(data.github || "");
          setWebsite(data.website || "");
          if (data.instagramId) {
            localStorage.setItem("jazmedia_linked_instagram", "true");
          } else {
            localStorage.removeItem("jazmedia_linked_instagram");
          }
        }
        setIsLoading(false);
      });
    }
  }, [session]);

  const handleAddSkill = () => {
    setSkills([...skills, { name: "", icon: "Code", percentage: 50 }]);
  };

  const handleUpdateSkill = (
    index: number,
    field: keyof Skill,
    value: string | number,
  ) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = URL.createObjectURL(file);
      setImageSrc(imageDataUrl);
      setIsCropping(true);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showAlert({ message: "Ukuran banner max 5MB", type: "error" });
        return;
      }
      setIsUploadingBanner(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await uploadProfilePicture(formData);
        if (res.success && res.url) {
          setBannerImage(res.url);
        } else {
          showAlert({ message: "Gagal upload banner", type: "error" });
        }
      } catch {
        showAlert({ message: "Error upload banner", type: "error" });
      }
      setIsUploadingBanner(false);
    }
  };

  const handleAddEducation = () => {
    setEducation([...education, { school: "", major: "", degree: "", year: "" }]);
  };
  const handleUpdateEducation = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setEducation(newEdu);
  };
  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploadingImage(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedFile) {
        const formData = new FormData();
        formData.append("image", croppedFile);

        const res = await uploadProfilePicture(formData);
        if (res.success && res.url) {
          setImage(res.url);
          setIsCropping(false);
          setImageSrc(null);
        } else {
          showAlert({
            message: "Gagal mengunggah foto: " + res.error,
            type: "error",
          });
        }
      }
    } catch (e) {
      console.error(e);
      showAlert({ message: "Gagal memproses foto", type: "error" });
    }
    setIsUploadingImage(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      name,
      email,
      username,
      image,
      bio,
      role,
      skills,
      
      
        
      };

    const res = await updateUserProfile(payload);
    if (res.success) {
      // Refresh session if profile fields change
      await update({ name, role, email, username, image });
      router.push("/profile");
    } else {
      showAlert({
        message: "Gagal menyimpan profil: " + res.error,
        type: "error",
      });
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
    <div className="pt-4 pb-10 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 max-w-5xl mx-auto flex flex-col z-[100] relative bg-white min-h-full w-full">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
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
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Nama Lengkap
          </label>
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
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSaving}
              placeholder="username_anda"
              className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
            />
          </div>
        </div>

        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Headline (Peran & Spesialisasi)
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            disabled={isSaving}
            placeholder="Contoh: Frontend Developer | UI/UX Enthusiast"
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
          />
        </div>


        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Lokasi / Alamat
          </label>
          <input
            type="text"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            disabled={isSaving}
            placeholder="Contoh: Jakarta, Indonesia"
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
          />
        </div>

<div>
            <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
              Nomor HP (WhatsApp)
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSaving}
              placeholder="Contoh: 081234567890"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="linkedin" className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
              LinkedIn Profile
            </label>
            <input
              id="linkedin"
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              disabled={isSaving}
              placeholder="Contoh: linkedin.com/in/username"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="github" className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
              GitHub Profile
            </label>
            <input
              id="github"
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              disabled={isSaving}
              placeholder="Contoh: github.com/username"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
              Website / Portfolio URL
            </label>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={isSaving}
              placeholder="Contoh: username.com"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
            />
          </div>

<div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Instagram
          </label>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-pink-600"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {instagramId ? "Terhubung" : "Belum Terhubung"}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  {instagramId
                    ? "Akun Instagram sudah terhubung"
                    : "Hubungkan akun untuk sinkronisasi post"}
                </p>
              </div>
            </div>
            {instagramId ? (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  showConfirm({
                    title: "Putus Tautan Instagram",
                    message: "Apakah Anda yakin ingin memutuskan tautan Instagram?",
                    type: "warning",
                    onConfirm: async () => {
                      setIsSaving(true);
                      const res = await unlinkInstagramAccount();
                      if (res.success) {
                        setInstagramId(null);
                        localStorage.removeItem("jazmedia_linked_instagram");
                        showAlert({
                          title: "Berhasil",
                          message: "Tautan Instagram berhasil diputus",
                          type: "success",
                        });
                      } else {
                        showAlert({
                          title: "Gagal",
                          message: "Gagal: " + res.error,
                          type: "error",
                        });
                      }
                      setIsSaving(false);
                    },
                  });
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
              >
                Putus Tautan
              </button>
            ) : (
              <a
                href="/api/auth/instagram-login"
                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 inline-block"
              >
                Hubungkan
              </a>
            )}
          </div>
        </div>


        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Banner / Header
          </label>
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            {bannerImage && (
              <img src={getDirectMediaUrl(bannerImage)} alt="Banner" className="w-24 h-12 object-cover rounded-md" />
            )}
            <label className="cursor-pointer inline-flex items-center justify-center bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              {isUploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pilih Banner"}
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={isUploadingBanner || isSaving} />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Foto Profil
          </label>
          <div className="flex gap-4 items-center">
            {image ? (
              <img
                src={getDirectMediaUrl(image, "image")}
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover border-4 border-slate-100 flex-shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center flex-shrink-0">
                <span className="text-slate-400 text-xs font-bold">Kosong</span>
              </div>
            )}
            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center justify-center bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                Pilih Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                  disabled={isSaving || isUploadingImage}
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                JPG/PNG maks. 5MB. Rasio 1:1.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Bio
          </label>
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
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Riwayat Pendidikan
            </label>
            <button
              onClick={handleAddEducation}
              disabled={isSaving}
              className="text-blue-600 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative group">
                <button
                  onClick={() => handleRemoveEducation(idx)}
                  disabled={isSaving}
                  className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleUpdateEducation(idx, "school", e.target.value)}
                    placeholder="Nama Sekolah / Universitas"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={edu.major}
                    onChange={(e) => handleUpdateEducation(idx, "major", e.target.value)}
                    placeholder="Jurusan"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
                    placeholder="Gelar (Opsional)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleUpdateEducation(idx, "year", e.target.value)}
                    placeholder="Tahun Lulus"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
            {education.length === 0 && (
              <div className="text-center py-6 bg-slate-50 border border-slate-200 rounded-2xl border-dashed">
                <p className="text-sm font-medium text-slate-500 mb-2">Belum ada data pendidikan</p>
                <button onClick={handleAddEducation} className="text-blue-600 text-sm font-bold hover:underline">
                  Tambah Pendidikan
                </button>
              </div>
            )}
          </div>
        </div>

<div>
          <div className="flex justify-between items-center mb-2 px-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Skills
            </label>
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
                <p className="text-xs font-medium text-slate-500">
                  Belum ada skill ditambahkan.
                </p>
              </div>
            ) : (
              skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <div className="flex-1 space-y-2">
                    <input
                      placeholder="Nama Skill (mis. React)"
                      value={skill.name}
                      onChange={(e) =>
                        handleUpdateSkill(index, "name", e.target.value)
                      }
                      disabled={isSaving}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <select
                        value={skill.icon}
                        onChange={(e) =>
                          handleUpdateSkill(
                            index,
                            "icon",
                            e.target.value as SkillIconName,
                          )
                        }
                        disabled={isSaving}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="" disabled>
                          -- Pilih ikon skill --
                        </option>
                        {Object.keys(SKILL_ICONS).map((iconName) => (
                          <option key={iconName} value={iconName}>
                            {iconName}
                          </option>
                        ))}
                      </select>
                      <div className="relative w-20">
                        <input
                          type="number"
                          placeholder="%"
                          value={skill.percentage}
                          onChange={(e) =>
                            handleUpdateSkill(
                              index,
                              "percentage",
                              Number(e.target.value),
                            )
                          }
                          disabled={isSaving}
                          min="0"
                          max="100"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-6 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          %
                        </span>
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

      {/* Cropper Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center">
          <div className="relative w-full h-[60vh] max-w-md mx-auto">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="mt-8 flex gap-4">
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => {
                setIsCropping(false);
                setImageSrc(null);
              }}
              disabled={isUploadingImage}
            >
              Batal
            </Button>
            <Button
              onClick={uploadCroppedImage}
              disabled={isUploadingImage}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {isUploadingImage ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Terapkan & Unggah
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

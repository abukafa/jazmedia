import sys
import re

with open('src/app/profile/edit/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    'interface Skill {',
    '''interface Education {
  school: string;
  major: string;
  degree: string;
  year: string;
}

interface Skill {'''
)

code = code.replace(
    'const [role, setRole] = useState("member");',
    '''const [role, setRole] = useState("member");
  const [headline, setHeadline] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [education, setEducation] = useState<Education[]>([]);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);'''
)

code = code.replace(
    'setBio(data.bio || "");',
    '''setBio(data.bio || "");
          setHeadline(data.headline || "");
          setAddressDetail(data.address_detail || "");
          setBannerImage(data.banner_image || "");
          let loadedEdu: Education[] = [];
          if (Array.isArray(data.education)) {
             loadedEdu = data.education;
          } else if (typeof data.education === "string") {
             try { loadedEdu = JSON.parse(data.education); } catch {}
          }
          setEducation(loadedEdu);'''
)

code = code.replace(
    '      skills,\n    };',
    '''      skills,
      headline,
      address_detail: addressDetail,
      banner_image: bannerImage,
      education,
    };'''
)

code = code.replace(
    '  const uploadCroppedImage = async () => {',
    '''  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const uploadCroppedImage = async () => {'''
)

with open('src/app/profile/edit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

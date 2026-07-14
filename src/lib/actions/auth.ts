"use server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function exchangeInstagramCode(code: string) {
  try {
    const formData = new URLSearchParams();
    formData.append("client_id", process.env.INSTAGRAM_CLIENT_ID || "2014212106127979");
    formData.append("client_secret", process.env.INSTAGRAM_CLIENT_SECRET || "");
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", "https://jazmedia-02.vercel.app/auth/instagram/callback");
    
    // Hilangkan karakter #_ yang sering ditambahkan Instagram di akhir code
    const cleanCode = code.replace(/#_$/, "");
    formData.append("code", cleanCode);

    const res = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!data.access_token) {
      return { error: data.error_message || "Gagal menukarkan kode akses dari Instagram." };
    }

    // [JALUR CEPAT / FAST PATH] 
    // Jika Instagram langsung memberikan user_id dan user sudah ada di database kita,
    // Bypas proses penarikan data Graph API (menghindari error scope & mempercepat login).
    if (data.user_id) {
      await dbConnect();
      const existingUser = await User.findOne({ instagramId: data.user_id.toString() }).lean();
      if (existingUser) {
        return {
          success: true,
          instagramId: existingUser.instagramId,
          name: existingUser.name,
          username: existingUser.username || "",
          image: existingUser.image || "",
          bio: existingUser.bio || "",
          isReturningUser: true,
        };
      }
    }

    // [PENGGUNA BARU]
    // Panggil Graph API untuk mengambil data profil.
    let userData: any = { id: data.user_id };
    let apiErrorDetail = "";
    
    try {
      const targetNode = data.user_id ? data.user_id : 'me';
      const userRes = await fetch(`https://graph.instagram.com/v21.0/${targetNode}?fields=id,username,name,profile_picture_url&access_token=${data.access_token}`);
      const graphData = await userRes.json();

      if (!graphData.error && graphData.id && graphData.username) {
        userData = graphData;
      } else {
        console.warn("Instagram Graph API v21.0 gagal:", graphData.error);
        apiErrorDetail = graphData.error?.message || "Unsupported request";
        
        // Coba unversioned sebagai langkah terakhir
        const fallbackRes = await fetch(`https://graph.instagram.com/${targetNode}?fields=id,username,name&access_token=${data.access_token}`);
        const fallbackData = await fallbackRes.json();
        if (!fallbackData.error && fallbackData.id && fallbackData.username) {
          userData = fallbackData;
        } else {
          console.warn("Instagram Graph API unversioned juga gagal:", fallbackData.error);
          apiErrorDetail = fallbackData.error?.message || apiErrorDetail;
        }
      }
    } catch (e: any) {
      console.error("Error saat fetch Graph API:", e);
      apiErrorDetail = e.message;
    }

    if (!userData.username) {
      return { 
        error: `Login Ditolak: Gagal menarik data profil.\n\nSyarat & Ketentuan API Meta:\n1. Pastikan akun Instagram Anda sudah diubah menjadi akun KREATOR atau BISNIS (bukan Personal).\n2. Jika aplikasi berstatus Live, fitur ini memerlukan persetujuan App Review dari Meta.\n\n(Pesan API: ${apiErrorDetail})` 
      };
    }

    return {
      success: true,
      instagramId: userData.id.toString(),
      name: userData.name || userData.username,
      username: userData.username,
      // Gunakan foto asli Instagram. Jika dari API masih kosong, baru pakai ui-avatars
      image: userData.profile_picture_url || `https://ui-avatars.com/api/?name=${userData.username}&background=e2e8f0&color=475569`,
      bio: userData.biography || ""
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

"use server";

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

    // Panggil Graph API untuk mengambil data selengkap-lengkapnya (jika diizinkan oleh scope)
    const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username,name,profile_picture_url,biography&access_token=${data.access_token}`);
    const userData = await userRes.json();

    if (!userData.id) {
      return { error: "Gagal menarik data profil dari Instagram API." };
    }

    return {
      success: true,
      instagramId: userData.id,
      name: userData.name || userData.username || "Instagram User",
      username: userData.username || "",
      // Gunakan foto asli Instagram. Jika dari API masih kosong, baru pakai ui-avatars berdasarkan inisial (bukan gambar random).
      image: userData.profile_picture_url || `https://ui-avatars.com/api/?name=${userData.username || 'User'}&background=e2e8f0&color=475569`,
      bio: userData.biography || ""
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

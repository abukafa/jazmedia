export const getPreviewUrl = (url: string) => {
  if (!url) return url;
  if (url.includes('drive.google.com')) {
    let id = '';
    const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) id = matchD[1];
    else {
      const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) id = matchId[1];
    }
    
    if (id) {
      return `https://drive.google.com/file/d/${id}/preview`;
    }
  }
  return url;
};

export const getDirectMediaUrl = (url: string, mediaType: "image" | "video") => {
  if (!url) return url;
  if (url.includes('drive.google.com') || url.includes('lh3.googleusercontent.com')) {
    let id = '';
    const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) {
      id = matchD[1];
    } else {
      const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) {
        id = matchId[1];
      }
    }
    
    if (id) {
      if (mediaType === 'image') {
        return `https://lh3.googleusercontent.com/d/${id}`;
      }
      return `https://drive.google.com/uc?export=view&id=${id}`;
    }
  }
  return url;
};

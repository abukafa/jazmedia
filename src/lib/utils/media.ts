export const extractDriveId = (url: string) => {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('drive.google.com') && !url.includes('lh3.googleusercontent.com') && !url.includes('googleusercontent.com')) {
    return null;
  }
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
  return id || null;
};

export const getPreviewUrl = (url: string) => {
  if (!url) return url;
  const id = extractDriveId(url);
  if (id) {
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  return url;
};

export const getDirectMediaUrl = (url: string, mediaType: "image" | "video" | "document" = "image") => {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const id = extractDriveId(url);
  if (id) {
    // Route image and video through internal stream endpoint with byte-range and caching support
    if (mediaType === 'image' || mediaType === 'video') {
      return `/api/drive/stream/${id}`;
    }
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }
  return url;
};

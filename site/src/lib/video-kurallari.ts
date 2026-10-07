export const VIDEO_EN_BUYUK_BOYUT = 75 * 1024 * 1024;
export const VIDEO_EN_UZUN_SURE = 180;
export const VIDEO_POSTER_EN_UZUN_KENAR = 1280;
export const VIDEO_POSTER_EN_BUYUK_BOYUT = 2 * 1024 * 1024;
export const VIDEO_KABUL_TURLERI = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

export const videoBoyutMetni = () => `${Math.round(VIDEO_EN_BUYUK_BOYUT / 1024 / 1024)} MB`;
export const videoSureMetni = () => `${Math.floor(VIDEO_EN_UZUN_SURE / 60)} dakika`;

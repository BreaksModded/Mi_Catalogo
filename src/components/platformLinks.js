// Diccionario de patrones de enlaces directos a plataformas de streaming
// Si no hay patrón, devuelve null y se usará el fallback de TMDb
// Devuelve el enlace directo a la plataforma si es posible, si no, a la búsqueda del título, y si no, a TMDb
export function getPlatformLink(provider, externalIds, mediaType) {
  // Si el objeto provider trae un link directo, úsalo como prioridad
  if (provider.link && typeof provider.link === 'string' && provider.link.startsWith('http')) {
    return provider.link;
  }
  const netflix = externalIds?.netflix_id;
  const amazon = externalIds?.amazon_prime_video_id;
  // const originalTitle = externalIds?.original_title || '';
  // const titleForSearch = encodeURIComponent(originalTitle);
  if (!provider || !provider.provider_name) return null;
  // Normalizar nombre para manejar variantes
  const providerName = provider.provider_name.trim().toLowerCase();

  // Netflix (incluye variantes)
  if (providerName.includes('netflix')) {
    if (netflix) {
      return `https://www.netflix.com/title/${netflix}`;
    } else {
      return `https://www.netflix.com/`;
    }
  }
  // Prime Video (incluye variantes)
  if (providerName.includes('prime video') || providerName.includes('amazon video') || providerName.includes('amazon prime')) {
    if (amazon) {
      return `https://www.primevideo.com/detail/${amazon}`;
    } else {
      return `https://www.primevideo.com/`;
    }
  }
  // Disney+ (incluye variantes)
  if (providerName.includes('disney+')) {
    return `https://www.disneyplus.com/`;
  }
  if (providerName.includes('disney')) {
    return `https://www.disneyplus.com/`;
  }
  // Apple TV (incluye variantes)
  if (providerName.includes('apple tv')) {
    return `https://tv.apple.com/`;
  }
  // HBO Max (incluye variantes)
  if (providerName.includes('hbo max') || providerName.includes('hbo')) {
    return `https://play.hbomax.com/`;
  }
  // Filmin
  if (providerName === 'Filmin') {
    return `https://www.filmin.es/`;
  }
  // Movistar Plus (incluye variantes)
  if (providerName.includes('movistar')) {
    return `https://ver.movistarplus.es/`;
  }
  // Rakuten TV
  if (providerName === 'Rakuten TV') {
    return `https://rakuten.tv/es/`;
  }
  // Google Play Movies
  if (providerName === 'Google Play Movies') {
    return `https://play.google.com/store/movies`;
  }
  // Microsoft Store
  if (providerName === 'Microsoft Store') {
    return `https://www.microsoft.com/es-es/store/movies-and-tv`;
  }
  // Atresplayer
  if (providerName === 'Atres Player' || providerName === 'Atresplayer') {
    return `https://www.atresplayer.com/`;
  }
  // RTVE Play
  if (providerName === 'RTVE Play') {
    return `https://www.rtve.es/play/`;
  }
  // FlixOlé
  if (providerName === 'FlixOlé' || providerName === 'FlixOle') {
    return `https://flixole.com/`;
  }
  // Vodafone TV
  if (providerName === 'Vodafone TV') {
    return `https://vodafone.tv/`;
  }
  // Orange TV
  if (providerName === 'Orange TV') {
    return `https://orangetv.orange.es/`;
  }
  // SkyShowtime
  if (providerName === 'SkyShowtime') {
    return `https://www.skyshowtime.com/es/`;
  }
  // YouTube (Movies)
  if (providerName === 'YouTube' || providerName === 'YouTube Movies') {
    return `https://www.youtube.com/movies`;
  }
  // Tivify
  if (providerName === 'Tivify') {
    return `https://www.tivify.tv/`;
  }
  // Pluto TV
  if (providerName === 'Pluto TV') {
    return `https://pluto.tv/`;
  }
  // Si no reconocemos la plataforma, no devolvemos nada
  return null;
}

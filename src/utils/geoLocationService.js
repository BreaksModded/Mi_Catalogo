// Servicio para detectar la ubicación geográfica del usuario y mapear a idiomas

// Mapeo de códigos de país a idiomas disponibles en la aplicación
const COUNTRY_TO_LANGUAGE = {
  // Países de habla española
  'ES': 'es', // España
  'AR': 'es', // Argentina
  'MX': 'es', // México
  'CO': 'es', // Colombia
  'PE': 'es', // Perú
  'VE': 'es', // Venezuela
  'CL': 'es', // Chile
  'EC': 'es', // Ecuador
  'GT': 'es', // Guatemala
  'CU': 'es', // Cuba
  'BO': 'es', // Bolivia
  'DO': 'es', // República Dominicana
  'HN': 'es', // Honduras
  'PY': 'es', // Paraguay
  'SV': 'es', // El Salvador
  'NI': 'es', // Nicaragua
  'CR': 'es', // Costa Rica
  'PA': 'es', // Panamá
  'UY': 'es', // Uruguay
  'GQ': 'es', // Guinea Ecuatorial
  // Territorios españoles
  'IC': 'es', // Islas Canarias
  'EA': 'es', // Ceuta y Melilla
  // Territorios con población hispanohablante significativa
  'PR': 'es', // Puerto Rico
  'AD': 'es', // Andorra (español es uno de los idiomas hablados)

  // Países de habla portuguesa
  'PT': 'pt', // Portugal
  'BR': 'pt', // Brasil
  'AO': 'pt', // Angola
  'MZ': 'pt', // Mozambique
  'CV': 'pt', // Cabo Verde
  'GW': 'pt', // Guinea-Bissau
  'ST': 'pt', // Santo Tomé y Príncipe
  'TL': 'pt', // Timor Oriental
  'MO': 'pt', // Macao

  // Países de habla francesa
  'FR': 'fr', // Francia
  'BE': 'fr', // Bélgica (francés es idioma oficial)
  'CH': 'fr', // Suiza (francés es uno de los idiomas oficiales)
  'LU': 'fr', // Luxemburgo (francés es idioma oficial)
  'MC': 'fr', // Mónaco
  'SN': 'fr', // Senegal
  'CI': 'fr', // Costa de Marfil
  'ML': 'fr', // Mali
  'BF': 'fr', // Burkina Faso
  'NE': 'fr', // Níger
  'TD': 'fr', // Chad
  'MG': 'fr', // Madagascar
  'CM': 'fr', // Camerún
  'CG': 'fr', // República del Congo
  'CD': 'fr', // República Democrática del Congo
  'CF': 'fr', // República Centroafricana
  'GA': 'fr', // Gabón
  'DJ': 'fr', // Yibuti
  'KM': 'fr', // Comoras
  'VU': 'fr', // Vanuatu
  'NC': 'fr', // Nueva Caledonia
  'PF': 'fr', // Polinesia Francesa
  'WF': 'fr', // Wallis y Futuna
  'PM': 'fr', // San Pedro y Miquelón
  'RE': 'fr', // Reunión
  'YT': 'fr', // Mayotte
  'GP': 'fr', // Guadalupe
  'MQ': 'fr', // Martinica
  'GF': 'fr', // Guayana Francesa
  'TF': 'fr', // Territorios Australes Franceses

  // Países de habla alemana
  'DE': 'de', // Alemania
  'AT': 'de', // Austria
  'LI': 'de', // Liechtenstein

  // Países de habla inglesa
  'US': 'en', // Estados Unidos
  'GB': 'en', // Reino Unido
  'IE': 'en', // Irlanda
  'AU': 'en', // Australia
  'NZ': 'en', // Nueva Zelanda
  'ZA': 'en', // Sudáfrica
  'CA': 'en', // Canadá (inglés mayoritario)
  'IN': 'en', // India
  'PK': 'en', // Pakistán
  'NG': 'en', // Nigeria
  'KE': 'en', // Kenia
  'UG': 'en', // Uganda
  'TZ': 'en', // Tanzania
  'GH': 'en', // Ghana
  'ZW': 'en', // Zimbabue
  'BW': 'en', // Botsuana
  'MW': 'en', // Malaui
  'ZM': 'en', // Zambia
  'MT': 'en', // Malta
  'CY': 'en', // Chipre
  'JM': 'en', // Jamaica
  'TT': 'en', // Trinidad y Tobago
  'BB': 'en', // Barbados
  'BS': 'en', // Bahamas
  'BZ': 'en', // Belice
  'GY': 'en', // Guyana
  'SR': 'en', // Surinam
  'FJ': 'en', // Fiyi
  'PG': 'en', // Papúa Nueva Guinea
  'SB': 'en', // Islas Salomón
  'WS': 'en', // Samoa
  'TO': 'en', // Tonga
  'TV': 'en', // Tuvalu
  'KI': 'en', // Kiribati
  'NR': 'en', // Nauru
  'PW': 'en', // Palaos
  'MH': 'en', // Islas Marshall
  'FM': 'en', // Micronesia
  'AG': 'en', // Antigua y Barbuda
  'DM': 'en', // Dominica
  'GD': 'en', // Granada
  'KN': 'en', // San Cristóbal y Nieves
  'LC': 'en', // Santa Lucía
  'VC': 'en', // San Vicente y las Granadinas
  // Territorios británicos y de otros países anglófonos
  'VG': 'en', // Islas Vírgenes Británicas
  'VI': 'en', // Islas Vírgenes de EE.UU.
  'AI': 'en', // Anguila
  'BM': 'en', // Bermudas
  'KY': 'en', // Islas Caimán
  'MS': 'en', // Montserrat
  'TC': 'en', // Islas Turcas y Caicos
  'FK': 'en', // Islas Malvinas
  'GI': 'en', // Gibraltar
  'SH': 'en', // Santa Elena
  'GS': 'en', // Georgia del Sur y las Islas Sandwich del Sur
  'IO': 'en', // Territorio Británico del Océano Índico
};

// Lista de servicios de geolocalización gratuitos (sin API key)
const GEO_SERVICES = [
  {
    name: 'ipapi.co',
    url: 'https://ipapi.co/json/',
    extractCountry: (data) => data.country_code
  },
  {
    name: 'ip-api.com',
    url: 'http://ip-api.com/json/',
    extractCountry: (data) => data.countryCode
  },
  {
    name: 'ipinfo.io',
    url: 'https://ipinfo.io/json',
    extractCountry: (data) => data.country
  }
];

/**
 * Detecta el país del usuario usando servicios de geolocalización
 * @returns {Promise<string|null>} Código de país de 2 letras o null si falla
 */
const detectUserCountry = async () => {
  for (const service of GEO_SERVICES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

      const response = await fetch(service.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const countryCode = service.extractCountry(data);
        
        if (countryCode && typeof countryCode === 'string' && countryCode.length === 2) {
          // ...
          return countryCode.toUpperCase();
        }
      }
    } catch (error) {
  // ...
      // Continuar con el siguiente servicio
    }
  }

  // ...
  return null;
};

/**
 * Mapea un código de país a un idioma disponible en la aplicación
 * @param {string} countryCode - Código de país de 2 letras
 * @returns {string|null} Código de idioma disponible o null si no hay mapeo
 */
const mapCountryToLanguage = (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string') {
    return null;
  }

  const upperCountryCode = countryCode.toUpperCase();
  return COUNTRY_TO_LANGUAGE[upperCountryCode] || null;
};

/**
 * Detecta el idioma preferido basado en la ubicación geográfica del usuario
 * @returns {Promise<string|null>} Código de idioma o null si no se puede detectar
 */
export const detectLanguageByLocation = async () => {
  try {
    const countryCode = await detectUserCountry();
    
    if (countryCode) {
      const language = mapCountryToLanguage(countryCode);
      
      if (language) {
  // ...
        return language;
      } else {
  // ...
        return 'en'; // Fallback a inglés para países no mapeados
      }
    }
    
    return null;
  } catch (error) {
  // ...
    return null;
  }
};

/**
 * Verifica si un país específico habla español
 * @param {string} countryCode - Código de país de 2 letras
 * @returns {boolean}
 */
export const isSpanishSpeakingCountry = (countryCode) => {
  if (!countryCode) return false;
  return mapCountryToLanguage(countryCode.toUpperCase()) === 'es';
};

const geoLocationService = {
  detectLanguageByLocation,
  isSpanishSpeakingCountry,
  mapCountryToLanguage
};

export default geoLocationService;

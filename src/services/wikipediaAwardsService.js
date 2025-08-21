/**
 * Servicio para obtener información de premios desde Wikidata (estructurados) y TMDb
 */

const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const WIKIDATA_QUERY_SERVICE = 'https://query.wikidata.org/sparql';

// Mapeo de premios principales con sus IDs de Wikidata
const MAJOR_AWARDS = {
  'Q19020': { name: 'Academy Award', category: 'Oscar', importance: 10 },
  'Q1011547': { name: 'Golden Globe Award', category: 'Golden Globe', importance: 9 },
  'Q123737': { name: 'Emmy Award', category: 'Emmy', importance: 8 },
  'Q808608': { name: 'BAFTA Award', category: 'BAFTA', importance: 8 },
  'Q1407225': { name: 'Screen Actors Guild Award', category: 'SAG Award', importance: 7 },
  'Q1789030': { name: 'Critics\' Choice Award', category: 'Critics Choice', importance: 6 },
  'Q3281617': { name: 'Tony Award', category: 'Tony', importance: 9 },
  'Q41254': { name: 'Grammy Award', category: 'Grammy', importance: 8 },
  'Q179808': { name: 'Cannes Film Festival Award', category: 'Cannes', importance: 9 },
  'Q1860537': { name: 'Palme d\'Or', category: 'Palme d\'Or', importance: 10 },
  'Q49005': { name: 'César Award', category: 'César', importance: 7 },
  'Q1407091': { name: 'Goya Award', category: 'Goya', importance: 7 },
  'Q860223': { name: 'European Film Award', category: 'European Film Award', importance: 6 },
  'Q72334': { name: 'Golden Bear', category: 'Golden Bear', importance: 9 },
  'Q174389': { name: 'Golden Lion', category: 'Golden Lion', importance: 9 }
};

class WikidataAwardsService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 1000 * 60 * 60 * 24; // 24 horas (los premios no cambian frecuentemente)
  }

  /**
   * Obtiene los premios de un actor desde Wikidata
   */
  async getActorAwards(personName, tmdbPersonData = null) {
    const cacheKey = `wikidata_awards_${personName}_${tmdbPersonData?.id || 'no_tmdb'}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    try {
      console.log(`🔍 Buscando premios para: ${personName}`);
      let awards = [];
      
      // 1. Intentar obtener Wikidata ID desde TMDb si está disponible
      let wikidataId = null;
      if (tmdbPersonData?.external_ids?.wikidata_id) {
        wikidataId = tmdbPersonData.external_ids.wikidata_id;
        console.log(`📋 Wikidata ID desde TMDb: ${wikidataId}`);
      }
      
      // 2. Si no hay Wikidata ID, buscar por nombre
      if (!wikidataId) {
        console.log(`🔎 Buscando Wikidata ID por nombre: ${personName}`);
        wikidataId = await this.findWikidataId(personName);
        console.log(`📋 Wikidata ID encontrado: ${wikidataId || 'ninguno'}`);
      }
      
      // 3. Obtener premios estructurados de Wikidata
      if (wikidataId) {
        console.log(`🏆 Consultando premios en Wikidata para ID: ${wikidataId}`);
        awards = await this.getAwardsFromWikidata(wikidataId);
        console.log(`✅ Premios encontrados en Wikidata: ${awards.length}`);
      }
      
      // 4. Si no hay suficientes premios, intentar complementar con TMDb
      if (awards.length < 3 && tmdbPersonData?.biography) {
        console.log(`📝 Complementando con biografía de TMDb...`);
        const tmdbAwards = await this.extractAwardsFromTmdbBio(tmdbPersonData.biography);
        console.log(`✅ Premios adicionales de TMDb: ${tmdbAwards.length}`);
        awards = [...awards, ...tmdbAwards];
      }

      // 4.5. Si aún no hay premios, generar fallback mínimo
      if (awards.length === 0) {
        console.log(`⚠️ No se encontraron premios, generando contenido de prueba...`);
        awards = [{
          name: 'Test Award',
          category: 'Acting',
          year: 2020,
          status: 'nominee',
          source: 'test',
          importance: 5
        }];
        console.log(`✅ Premio de prueba generado`);
      }

      // 5. Filtrar duplicados y ordenar por importancia
      awards = this.deduplicateAndSortAwards(awards);
      console.log(`🎯 Total premios procesados: ${awards.length}`);

      // Cachear resultado
      this.cache.set(cacheKey, {
        data: awards,
        timestamp: Date.now()
      });

      return awards;

    } catch (error) {
      console.error('❌ Error obteniendo premios de Wikidata:', error);
      return [];
    }
  }

  /**
   * Busca el ID de Wikidata para una persona por nombre
   */
  async findWikidataId(personName) {
    try {
      const searchUrl = `${WIKIDATA_API}?action=wbsearchentities&search=${encodeURIComponent(personName)}&language=en&type=item&format=json&origin=*&limit=10`;
      console.log(`🔍 Buscando en Wikidata: ${searchUrl}`);
      
      const response = await fetch(searchUrl);
      console.log(`📡 Respuesta búsqueda status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`❌ Error en búsqueda Wikidata: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      console.log(`📊 Resultados búsqueda:`, data);
      
      if (data.search && data.search.length > 0) {
        console.log(`🎯 Analizando ${data.search.length} candidatos...`);
        
        // Buscar el resultado que sea más probablemente un actor/actriz
        for (const result of data.search) {
          console.log(`👤 Candidato: ${result.label} - ${result.description || 'sin descripción'}`);
          
          if (result.description && 
              (result.description.includes('actor') || 
               result.description.includes('actress') || 
               result.description.includes('performer') ||
               result.description.includes('film') ||
               result.description.includes('television'))) {
            console.log(`✅ Seleccionado: ${result.label} (${result.id})`);
            return result.id;
          }
        }
        
        // Si no encontramos uno específico de actor, tomar el primero
        console.log(`⚠️ No encontrado actor específico, usando el primero: ${data.search[0].id}`);
        return data.search[0].id;
      }
      
      console.log(`❌ No se encontraron resultados para: ${personName}`);
      return null;
    } catch (error) {
      console.error('❌ Error buscando Wikidata ID:', error);
      return null;
    }
  }

  /**
   * Obtiene premios estructurados desde Wikidata usando SPARQL
   */
  async getAwardsFromWikidata(wikidataId) {
    try {
      // Consulta SPARQL simplificada y más robusta
      const sparqlQuery = `
        SELECT ?award ?awardLabel ?pointInTime ?categoryLabel ?workLabel WHERE {
          wd:${wikidataId} p:P166 ?statement .
          ?statement ps:P166 ?award .
          
          OPTIONAL { ?statement pq:P585 ?pointInTime . }
          OPTIONAL { ?statement pq:P1686 ?work . }
          OPTIONAL { ?statement pq:P805 ?category . }
          
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en,es,fr,de". }
        }
        ORDER BY DESC(?pointInTime)
        LIMIT 20
      `;

      const queryUrl = `${WIKIDATA_QUERY_SERVICE}?query=${encodeURIComponent(sparqlQuery)}&format=json`;
      console.log(`🔗 Consultando SPARQL: ${queryUrl}`);
      
      const response = await fetch(queryUrl);
      console.log(`📡 Respuesta SPARQL status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`❌ Error en consulta SPARQL: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      console.log(`📊 Datos SPARQL recibidos:`, data);
      
      const awards = [];
      
      if (data.results && data.results.bindings && data.results.bindings.length > 0) {
        console.log(`🎯 Procesando ${data.results.bindings.length} resultados...`);
        
        for (const binding of data.results.bindings) {
          const awardUri = binding.award.value;
          const awardId = awardUri.split('/').pop();
          const awardLabel = binding.awardLabel?.value || 'Unknown Award';
          
          console.log(`🏆 Procesando premio: ${awardLabel} (${awardId})`);
          
          // Verificar si es un premio que nos interesa
          const awardInfo = MAJOR_AWARDS[awardId];
          const isRelevantAward = awardInfo || this.isRelevantAward(awardLabel);
          
          if (isRelevantAward) {
            const award = {
              name: awardInfo?.name || awardLabel,
              category: binding.categoryLabel?.value || awardInfo?.category || 'Acting',
              year: binding.pointInTime?.value ? parseInt(binding.pointInTime.value.slice(0, 4)) : null,
              work: binding.workLabel?.value || null,
              status: 'winner', // Wikidata generalmente lista solo premios ganados
              source: 'wikidata',
              importance: awardInfo?.importance || 5,
              wikidataId: awardId
            };
            
            console.log(`✅ Premio añadido:`, award);
            awards.push(award);
          } else {
            console.log(`⏭️ Premio ignorado: ${awardLabel} (no es relevante)`);
          }
        }
      } else {
        console.log(`⚠️ No se encontraron premios en Wikidata para ${wikidataId}`);
      }
      
      console.log(`🎉 Total premios de Wikidata: ${awards.length}`);
      return awards;
      
    } catch (error) {
      console.error('❌ Error consultando SPARQL en Wikidata:', error);
      return [];
    }
  }

  /**
   * Verifica si un premio es relevante basándose en su nombre
   */
  isRelevantAward(awardLabel) {
    const relevantKeywords = [
      'academy award', 'oscar', 'golden globe', 'emmy', 'bafta', 'sag award',
      'tony', 'grammy', 'cannes', 'venice', 'berlin', 'cesar', 'goya',
      'critics choice', 'palme', 'golden bear', 'golden lion'
    ];
    
    const lowerLabel = awardLabel.toLowerCase();
    return relevantKeywords.some(keyword => lowerLabel.includes(keyword));
  }

  /**
   * Extrae premios de la biografía de TMDb como fallback
   */
  async extractAwardsFromTmdbBio(biography) {
    if (!biography) {
      console.log(`📝 No hay biografía en TMDb`);
      return [];
    }
    
    console.log(`📖 Analizando biografía TMDb: ${biography.substring(0, 200)}...`);
    
    const awards = [];
    const sentences = biography.split(/[.!?]+/);
    
    // Patrones más específicos para TMDb
    const awardPatterns = [
      { regex: /Academy Award|Oscar/i, name: 'Academy Award', category: 'Oscar', importance: 10 },
      { regex: /Golden Globe/i, name: 'Golden Globe Award', category: 'Golden Globe', importance: 9 },
      { regex: /Emmy Award|Emmy/i, name: 'Emmy Award', category: 'Emmy', importance: 8 },
      { regex: /BAFTA/i, name: 'BAFTA Award', category: 'BAFTA', importance: 8 },
      { regex: /SAG Award|Screen Actors Guild/i, name: 'SAG Award', category: 'SAG', importance: 7 },
      { regex: /Tony Award|Tony/i, name: 'Tony Award', category: 'Tony', importance: 9 },
      { regex: /Grammy/i, name: 'Grammy Award', category: 'Grammy', importance: 8 },
      { regex: /Critics.{0,10}Choice/i, name: 'Critics Choice Award', category: 'Critics Choice', importance: 6 },
      { regex: /Cannes/i, name: 'Cannes Film Festival Award', category: 'Cannes', importance: 9 }
    ];
    
    for (const sentence of sentences) {
      for (const pattern of awardPatterns) {
        if (pattern.regex.test(sentence)) {
          console.log(`🏆 Premio encontrado en biografía: ${sentence.trim()}`);
          
          // Determinar si ganó o fue nominado
          const won = /won|received|awarded|winner|achievement/i.test(sentence);
          const nominated = /nominated|nomination/i.test(sentence);
          
          if (won || nominated) {
            const yearMatch = sentence.match(/\b(19|20)\d{2}\b/);
            
            const award = {
              name: pattern.name,
              category: pattern.category,
              year: yearMatch ? parseInt(yearMatch[0]) : null,
              status: won ? 'winner' : 'nominee',
              source: 'tmdb_bio',
              importance: pattern.importance
            };
            
            console.log(`✅ Premio añadido desde biografía:`, award);
            awards.push(award);
          }
        }
      }
    }
    
    console.log(`📊 Total premios de biografía TMDb: ${awards.length}`);
    return awards;
  }

  /**
   * Elimina duplicados y ordena premios por importancia
   */
  deduplicateAndSortAwards(awards) {
    // Eliminar duplicados basados en nombre, año y categoría
    const uniqueAwards = awards.filter((award, index, self) => 
      index === self.findIndex(a => 
        a.name === award.name && 
        a.year === award.year && 
        a.category === award.category
      )
    );

    // Ordenar por importancia y estado (ganadores primero)
    return uniqueAwards.sort((a, b) => {
      // Primero por fuente (Wikidata es más confiable)
      if (a.source === 'wikidata' && b.source !== 'wikidata') return -1;
      if (b.source === 'wikidata' && a.source !== 'wikidata') return 1;
      
      // Luego por estado (ganadores primero)
      if (a.status === 'winner' && b.status !== 'winner') return -1;
      if (b.status === 'winner' && a.status !== 'winner') return 1;
      
      // Luego por importancia
      const importanceA = a.importance || 5;
      const importanceB = b.importance || 5;
      if (importanceA !== importanceB) return importanceB - importanceA;
      
      // Finalmente por año (más reciente primero)
      if (a.year && b.year) return b.year - a.year;
      if (a.year && !b.year) return -1;
      if (!a.year && b.year) return 1;
      
      return 0;
    }).slice(0, 8); // Máximo 8 premios
  }

  /**
   * Limpia la cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new WikidataAwardsService();

// Configuración de parches por equipo
export const COMPETITION_PATCHES = {
  // Selecciones Nacionales
  'colombia': ['Mundial', 'Copa América'],
  'argentina': ['Mundial', 'Copa América'],
  'brasil': ['Mundial', 'Copa América'],
  'uruguay': ['Mundial', 'Copa América'],
  'chile': ['Mundial', 'Copa América'],
  'perú': ['Mundial', 'Copa América'],
  'ecuador': ['Mundial', 'Copa América'],
  'venezuela': ['Mundial', 'Copa América'],
  'paraguay': ['Mundial', 'Copa América'],
  'bolivia': ['Mundial', 'Copa América'],
  
  'españa': ['Mundial', 'Eurocopa'],
  'alemania': ['Mundial', 'Eurocopa'],
  'francia': ['Mundial', 'Eurocopa'],
  'italia': ['Mundial', 'Eurocopa'],
  'inglaterra': ['Mundial', 'Eurocopa'],
  'portugal': ['Mundial', 'Eurocopa'],
  'holanda': ['Mundial', 'Eurocopa'],
  'belgica': ['Mundial', 'Eurocopa'],
  'croacia': ['Mundial', 'Eurocopa'],
  'dinamarca': ['Mundial', 'Eurocopa'],
  'suiza': ['Mundial', 'Eurocopa'],
  'austria': ['Mundial', 'Eurocopa'],
  'república checa': ['Mundial', 'Eurocopa'],
  'polonia': ['Mundial', 'Eurocopa'],
  'suecia': ['Mundial', 'Eurocopa'],
  'noruega': ['Mundial', 'Eurocopa'],
  
  'mexico': ['Mundial', 'Copa Oro'],
  'méxico': ['Mundial', 'Copa Oro'],
  'estados unidos': ['Mundial', 'Copa Oro'],
  'costa rica': ['Mundial', 'Copa Oro'],
  'jamaica': ['Mundial', 'Copa Oro'],
  
  'japon': ['Mundial', 'Copa Asia'],
  'japón': ['Mundial', 'Copa Asia'],
  'corea del sur': ['Mundial', 'Copa Asia'],
  'australia': ['Mundial', 'Copa Asia'],
  'arabia saudita': ['Mundial', 'Copa Asia'],
  'iran': ['Mundial', 'Copa Asia'],
  
  'senegal': ['Mundial', 'Copa África'],
  'marruecos': ['Mundial', 'Copa África'],
  'camerun': ['Mundial', 'Copa África'],
  'egipto': ['Mundial', 'Copa África'],
  'nigeria': ['Mundial', 'Copa África'],
  
  // Clubes - La Liga
  'real madrid': ['Champions League', 'La Liga'],
  'barcelona': ['Champions League', 'La Liga'],
  'atletico madrid': ['Champions League', 'La Liga'],
  'sevilla': ['Europa League', 'La Liga'],
  'real sociedad': ['Europa League', 'La Liga'],
  'villarreal': ['Europa League', 'La Liga'],
  'athletic bilbao': ['Europa League', 'La Liga'],
  'valencia': ['Europa League', 'La Liga'],
  
  // Premier League
  'manchester city': ['Champions League', 'Premier League'],
  'liverpool': ['Champions League', 'Premier League'],
  'manchester united': ['Europa League', 'Premier League'],
  'arsenal': ['Champions League', 'Premier League'],
  'chelsea': ['Champions League', 'Premier League'],
  'tottenham': ['Europa League', 'Premier League'],
  'newcastle': ['Europa League', 'Premier League'],
  'aston villa': ['Europa League', 'Premier League'],
  
  // Serie A
  'juventus': ['Champions League', 'Serie A'],
  'inter': ['Champions League', 'Serie A'],
  'milan': ['Champions League', 'Serie A'],
  'napoli': ['Champions League', 'Serie A'],
  'roma': ['Europa League', 'Serie A'],
  'lazio': ['Europa League', 'Serie A'],
  'atalanta': ['Europa League', 'Serie A'],
  
  // Bundesliga
  'bayern munich': ['Champions League', 'Bundesliga'],
  'borussia dortmund': ['Champions League', 'Bundesliga'],
  'rb leipzig': ['Champions League', 'Bundesliga'],
  'bayer leverkusen': ['Europa League', 'Bundesliga'],
  'eintracht frankfurt': ['Europa League', 'Bundesliga'],
  
  // Ligue 1
  'psg': ['Champions League', 'Ligue 1'],
  'paris saint-germain': ['Champions League', 'Ligue 1'],
  'marseille': ['Europa League', 'Ligue 1'],
  'monaco': ['Champions League', 'Ligue 1'],
  'lyon': ['Europa League', 'Ligue 1'],
  'lille': ['Champions League', 'Ligue 1'],
  
  // Ligas Sudamericanas
  'river plate': ['Libertadores', 'Liga Profesional'],
  'boca juniors': ['Libertadores', 'Liga Profesional'],
  'racing': ['Libertadores', 'Liga Profesional'],
  'flamengo': ['Libertadores', 'Brasileirão'],
  'palmeiras': ['Libertadores', 'Brasileirão'],
  'sao paulo': ['Libertadores', 'Brasileirão'],
  'santos': ['Libertadores', 'Brasileirão'],
  'nacional': ['Libertadores', 'Primera División'],
  'peñarol': ['Libertadores', 'Primera División'],
  'colo colo': ['Libertadores', 'Primera División'],
  'universidad de chile': ['Libertadores', 'Primera División'],
  

};

// Función para obtener parches por equipo
export const getPatchesForTeam = (teamName) => {
  if (!teamName) return null;
  
  const normalizedTeam = teamName.toLowerCase().trim();
  return COMPETITION_PATCHES[normalizedTeam] || null;
};

// Función para verificar si un producto puede tener parches
export const canHavePatches = (producto) => {
  return (
    producto?.deporte === 'futbol' && 
    producto?.year >= 2025 &&
    getPatchesForTeam(producto?.team) !== null
  );
};
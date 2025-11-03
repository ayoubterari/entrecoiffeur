// Structure hiérarchique : Régions → Départements → Villes
export const frenchRegions = [
  {
    id: 'ile-de-france',
    name: 'Île-de-France',
    departments: [
      {
        id: '75',
        name: 'Paris (75)',
        cities: ['Paris']
      },
      {
        id: '92',
        name: 'Hauts-de-Seine (92)',
        cities: ['Boulogne-Billancourt', 'Nanterre', 'Courbevoie', 'Levallois-Perret']
      },
      {
        id: '93',
        name: 'Seine-Saint-Denis (93)',
        cities: ['Saint-Denis', 'Montreuil', 'Aubervilliers']
      },
      {
        id: '94',
        name: 'Val-de-Marne (94)',
        cities: ['Créteil', 'Vitry-sur-Seine', 'Saint-Maur-des-Fossés']
      },
      {
        id: '78',
        name: 'Yvelines (78)',
        cities: ['Versailles', 'Sartrouville', 'Mantes-la-Jolie']
      },
      {
        id: '91',
        name: 'Essonne (91)',
        cities: ['Évry', 'Corbeil-Essonnes', 'Massy']
      }
    ]
  },
  {
    id: 'auvergne-rhone-alpes',
    name: 'Auvergne-Rhône-Alpes',
    departments: [
      {
        id: '69',
        name: 'Rhône (69)',
        cities: ['Lyon', 'Villeurbanne', 'Vénissieux']
      },
      {
        id: '38',
        name: 'Isère (38)',
        cities: ['Grenoble', 'Saint-Martin-d\'Hères', 'Échirolles']
      },
      {
        id: '42',
        name: 'Loire (42)',
        cities: ['Saint-Étienne', 'Roanne', 'Saint-Chamond']
      },
      {
        id: '63',
        name: 'Puy-de-Dôme (63)',
        cities: ['Clermont-Ferrand', 'Riom', 'Cournon-d\'Auvergne']
      },
      {
        id: '74',
        name: 'Haute-Savoie (74)',
        cities: ['Annecy', 'Annemasse', 'Thonon-les-Bains']
      },
      {
        id: '73',
        name: 'Savoie (73)',
        cities: ['Chambéry', 'Aix-les-Bains', 'Albertville']
      }
    ]
  },
  {
    id: 'provence-alpes-cote-azur',
    name: 'Provence-Alpes-Côte d\'Azur',
    departments: [
      {
        id: '13',
        name: 'Bouches-du-Rhône (13)',
        cities: ['Marseille', 'Aix-en-Provence', 'Arles', 'Martigues']
      },
      {
        id: '06',
        name: 'Alpes-Maritimes (06)',
        cities: ['Nice', 'Cannes', 'Antibes', 'Grasse']
      },
      {
        id: '83',
        name: 'Var (83)',
        cities: ['Toulon', 'La Seyne-sur-Mer', 'Hyères', 'Fréjus']
      },
      {
        id: '84',
        name: 'Vaucluse (84)',
        cities: ['Avignon', 'Orange', 'Carpentras']
      }
    ]
  },
  {
    id: 'occitanie',
    name: 'Occitanie',
    departments: [
      {
        id: '31',
        name: 'Haute-Garonne (31)',
        cities: ['Toulouse', 'Colomiers', 'Tournefeuille']
      },
      {
        id: '34',
        name: 'Hérault (34)',
        cities: ['Montpellier', 'Béziers', 'Sète', 'Narbonne']
      },
      {
        id: '30',
        name: 'Gard (30)',
        cities: ['Nîmes', 'Alès', 'Bagnols-sur-Cèze']
      },
      {
        id: '66',
        name: 'Pyrénées-Orientales (66)',
        cities: ['Perpignan', 'Canet-en-Roussillon']
      },
      {
        id: '11',
        name: 'Aude (11)',
        cities: ['Carcassonne', 'Narbonne']
      },
      {
        id: '81',
        name: 'Tarn (81)',
        cities: ['Albi', 'Castres']
      }
    ]
  },
  {
    id: 'nouvelle-aquitaine',
    name: 'Nouvelle-Aquitaine',
    departments: [
      {
        id: '33',
        name: 'Gironde (33)',
        cities: ['Bordeaux', 'Mérignac', 'Pessac', 'Talence']
      },
      {
        id: '87',
        name: 'Haute-Vienne (87)',
        cities: ['Limoges', 'Saint-Junien']
      },
      {
        id: '64',
        name: 'Pyrénées-Atlantiques (64)',
        cities: ['Pau', 'Bayonne', 'Anglet', 'Biarritz']
      },
      {
        id: '17',
        name: 'Charente-Maritime (17)',
        cities: ['La Rochelle', 'Rochefort', 'Saintes']
      },
      {
        id: '86',
        name: 'Vienne (86)',
        cities: ['Poitiers', 'Châtellerault']
      },
      {
        id: '16',
        name: 'Charente (16)',
        cities: ['Angoulême', 'Cognac']
      }
    ]
  },
  {
    id: 'grand-est',
    name: 'Grand Est',
    departments: [
      {
        id: '67',
        name: 'Bas-Rhin (67)',
        cities: ['Strasbourg', 'Haguenau', 'Schiltigheim']
      },
      {
        id: '51',
        name: 'Marne (51)',
        cities: ['Reims', 'Châlons-en-Champagne', 'Épernay']
      },
      {
        id: '57',
        name: 'Moselle (57)',
        cities: ['Metz', 'Thionville', 'Forbach']
      },
      {
        id: '54',
        name: 'Meurthe-et-Moselle (54)',
        cities: ['Nancy', 'Vandœuvre-lès-Nancy']
      },
      {
        id: '68',
        name: 'Haut-Rhin (68)',
        cities: ['Mulhouse', 'Colmar']
      },
      {
        id: '10',
        name: 'Aube (10)',
        cities: ['Troyes', 'Romilly-sur-Seine']
      }
    ]
  },
  {
    id: 'hauts-de-france',
    name: 'Hauts-de-France',
    departments: [
      {
        id: '59',
        name: 'Nord (59)',
        cities: ['Lille', 'Roubaix', 'Tourcoing', 'Dunkerque', 'Valenciennes']
      },
      {
        id: '80',
        name: 'Somme (80)',
        cities: ['Amiens', 'Abbeville']
      },
      {
        id: '62',
        name: 'Pas-de-Calais (62)',
        cities: ['Calais', 'Boulogne-sur-Mer', 'Arras', 'Lens']
      },
      {
        id: '60',
        name: 'Oise (60)',
        cities: ['Beauvais', 'Compiègne', 'Creil']
      }
    ]
  },
  {
    id: 'normandie',
    name: 'Normandie',
    departments: [
      {
        id: '76',
        name: 'Seine-Maritime (76)',
        cities: ['Rouen', 'Le Havre', 'Dieppe']
      },
      {
        id: '14',
        name: 'Calvados (14)',
        cities: ['Caen', 'Hérouville-Saint-Clair', 'Lisieux']
      },
      {
        id: '50',
        name: 'Manche (50)',
        cities: ['Cherbourg-en-Cotentin', 'Saint-Lô']
      },
      {
        id: '27',
        name: 'Eure (27)',
        cities: ['Évreux', 'Vernon']
      }
    ]
  },
  {
    id: 'pays-de-la-loire',
    name: 'Pays de la Loire',
    departments: [
      {
        id: '44',
        name: 'Loire-Atlantique (44)',
        cities: ['Nantes', 'Saint-Nazaire', 'Saint-Herblain']
      },
      {
        id: '49',
        name: 'Maine-et-Loire (49)',
        cities: ['Angers', 'Cholet', 'Saumur']
      },
      {
        id: '72',
        name: 'Sarthe (72)',
        cities: ['Le Mans', 'La Flèche']
      },
      {
        id: '53',
        name: 'Mayenne (53)',
        cities: ['Laval', 'Mayenne']
      },
      {
        id: '85',
        name: 'Vendée (85)',
        cities: ['La Roche-sur-Yon', 'Les Sables-d\'Olonne']
      }
    ]
  },
  {
    id: 'bretagne',
    name: 'Bretagne',
    departments: [
      {
        id: '35',
        name: 'Ille-et-Vilaine (35)',
        cities: ['Rennes', 'Saint-Malo', 'Fougères']
      },
      {
        id: '29',
        name: 'Finistère (29)',
        cities: ['Brest', 'Quimper', 'Concarneau']
      },
      {
        id: '56',
        name: 'Morbihan (56)',
        cities: ['Lorient', 'Vannes', 'Lanester']
      },
      {
        id: '22',
        name: 'Côtes-d\'Armor (22)',
        cities: ['Saint-Brieuc', 'Lannion', 'Dinan']
      }
    ]
  },
  {
    id: 'centre-val-de-loire',
    name: 'Centre-Val de Loire',
    departments: [
      {
        id: '37',
        name: 'Indre-et-Loire (37)',
        cities: ['Tours', 'Joué-lès-Tours', 'Saint-Pierre-des-Corps']
      },
      {
        id: '45',
        name: 'Loiret (45)',
        cities: ['Orléans', 'Olivet', 'Fleury-les-Aubrais']
      },
      {
        id: '18',
        name: 'Cher (18)',
        cities: ['Bourges', 'Vierzon']
      },
      {
        id: '41',
        name: 'Loir-et-Cher (41)',
        cities: ['Blois', 'Romorantin-Lanthenay']
      },
      {
        id: '36',
        name: 'Indre (36)',
        cities: ['Châteauroux', 'Issoudun']
      },
      {
        id: '28',
        name: 'Eure-et-Loir (28)',
        cities: ['Chartres', 'Dreux', 'Lucé']
      }
    ]
  },
  {
    id: 'bourgogne-franche-comte',
    name: 'Bourgogne-Franche-Comté',
    departments: [
      {
        id: '21',
        name: 'Côte-d\'Or (21)',
        cities: ['Dijon', 'Beaune', 'Chenôve']
      },
      {
        id: '25',
        name: 'Doubs (25)',
        cities: ['Besançon', 'Montbéliard', 'Pontarlier']
      },
      {
        id: '90',
        name: 'Territoire de Belfort (90)',
        cities: ['Belfort']
      },
      {
        id: '71',
        name: 'Saône-et-Loire (71)',
        cities: ['Chalon-sur-Saône', 'Mâcon', 'Le Creusot']
      },
      {
        id: '58',
        name: 'Nièvre (58)',
        cities: ['Nevers', 'Cosne-Cours-sur-Loire']
      },
      {
        id: '89',
        name: 'Yonne (89)',
        cities: ['Auxerre', 'Sens']
      }
    ]
  },
  {
    id: 'corse',
    name: 'Corse',
    departments: [
      {
        id: '2B',
        name: 'Haute-Corse (2B)',
        cities: ['Bastia', 'Calvi', 'Corte']
      },
      {
        id: '2A',
        name: 'Corse-du-Sud (2A)',
        cities: ['Ajaccio', 'Porto-Vecchio', 'Propriano']
      }
    ]
  }
]

// Fonction pour obtenir toutes les villes
export const getAllCities = () => {
  const cities = []
  frenchRegions.forEach(region => {
    region.departments.forEach(dept => {
      dept.cities.forEach(city => {
        cities.push({
          city,
          department: dept.name,
          departmentId: dept.id,
          region: region.name,
          regionId: region.id,
          fullLocation: `${city}, ${dept.name}, ${region.name}`
        })
      })
    })
  })
  return cities.sort((a, b) => a.city.localeCompare(b.city))
}

// Fonction pour rechercher une ville
export const searchCity = (query) => {
  const allCities = getAllCities()
  const lowerQuery = query.toLowerCase()
  return allCities.filter(item => 
    item.city.toLowerCase().includes(lowerQuery) ||
    item.department.toLowerCase().includes(lowerQuery) ||
    item.region.toLowerCase().includes(lowerQuery)
  )
}

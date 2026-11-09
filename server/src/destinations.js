// Les 14 destinations. En attendant l'API Google Places, ces données sont saisies ici.
// minDailyBudget : estimation du budget minimum par jour et par personne (MAD).
// image : adresse d'une photo (facultatif) ; sans photo, l'interface affiche un visuel coloré.

const DESTINATIONS = [
  {
    id: 'Marrakech', types: ['culture', 'gastronomy', 'adventure'], minDailyBudget: 450, color: '#c1272d', image: null,
    name: { fr: 'Marrakech', en: 'Marrakech', ar: 'مراكش' },
    tagline: {
      fr: 'Souks, palais et la place Jemaa el-Fna au pied de l’Atlas',
      en: 'Souks, palaces and Jemaa el-Fna square at the foot of the Atlas',
      ar: 'أسواق وقصور وساحة جامع الفنا عند سفح الأطلس',
    },
  },
  {
    id: 'Fes', types: ['culture', 'gastronomy'], minDailyBudget: 350, color: '#1d6fa5', image: null,
    name: { fr: 'Fès', en: 'Fez', ar: 'فاس' },
    tagline: {
      fr: 'La plus grande médina du monde et ses tanneries',
      en: 'The world’s largest medina and its tanneries',
      ar: 'أكبر مدينة عتيقة في العالم ودور الدباغة',
    },
  },
  {
    id: 'Casablanca', types: ['culture', 'gastronomy', 'beach'], minDailyBudget: 500, color: '#3d6b8c', image: null,
    name: { fr: 'Casablanca', en: 'Casablanca', ar: 'الدار البيضاء' },
    tagline: {
      fr: 'La mosquée Hassan II, l’Art déco et la corniche',
      en: 'Hassan II Mosque, Art Deco and the seafront corniche',
      ar: 'مسجد الحسن الثاني والمعمار الآرت ديكو والكورنيش',
    },
  },
  {
    id: 'Rabat', types: ['culture', 'beach'], minDailyBudget: 450, color: '#2f7d6b', image: null,
    name: { fr: 'Rabat', en: 'Rabat', ar: 'الرباط' },
    tagline: {
      fr: 'La capitale : kasbah des Oudayas et tour Hassan',
      en: 'The capital: Kasbah of the Udayas and Hassan Tower',
      ar: 'العاصمة: قصبة الأوداية وصومعة حسان',
    },
  },
  {
    id: 'Tangier', types: ['culture', 'beach'], minDailyBudget: 400, color: '#2a7fa8', image: null,
    name: { fr: 'Tanger', en: 'Tangier', ar: 'طنجة' },
    tagline: {
      fr: 'Entre Méditerranée et Atlantique, face à l’Espagne',
      en: 'Between the Mediterranean and the Atlantic, facing Spain',
      ar: 'بين المتوسط والأطلسي قبالة إسبانيا',
    },
  },
  {
    id: 'Chefchaouen', types: ['culture', 'adventure'], minDailyBudget: 300, color: '#3b82c4', image: null,
    name: { fr: 'Chefchaouen', en: 'Chefchaouen', ar: 'شفشاون' },
    tagline: {
      fr: 'La ville bleue nichée dans les montagnes du Rif',
      en: 'The blue city tucked into the Rif mountains',
      ar: 'المدينة الزرقاء وسط جبال الريف',
    },
  },
  {
    id: 'Agadir', types: ['beach', 'adventure'], minDailyBudget: 450, color: '#d98a00', image: null,
    name: { fr: 'Agadir', en: 'Agadir', ar: 'أكادير' },
    tagline: {
      fr: 'Grande plage, soleil toute l’année et surf à Taghazout',
      en: 'A long beach, year-round sun and surfing in Taghazout',
      ar: 'شاطئ واسع وشمس طوال السنة وركوب الأمواج في تغازوت',
    },
  },
  {
    id: 'Essaouira', types: ['beach', 'gastronomy', 'culture'], minDailyBudget: 350, color: '#4a8fa3', image: null,
    name: { fr: 'Essaouira', en: 'Essaouira', ar: 'الصويرة' },
    tagline: {
      fr: 'Remparts, port de pêche et poisson grillé face à l’océan',
      en: 'Ramparts, a fishing port and grilled fish by the ocean',
      ar: 'أسوار وميناء صيد وسمك مشوي قبالة المحيط',
    },
  },
  {
    id: 'Merzouga', types: ['desert', 'adventure'], minDailyBudget: 500, color: '#c96f2b', image: null,
    name: { fr: 'Merzouga', en: 'Merzouga', ar: 'مرزوكة' },
    tagline: {
      fr: 'Les dunes de l’erg Chebbi et les nuits en bivouac',
      en: 'The Erg Chebbi dunes and nights in a desert camp',
      ar: 'كثبان عرق الشبي وليالي المخيمات الصحراوية',
    },
  },
  {
    id: 'Ouarzazate', types: ['desert', 'culture', 'adventure'], minDailyBudget: 350, color: '#b5651d', image: null,
    name: { fr: 'Ouarzazate', en: 'Ouarzazate', ar: 'ورزازات' },
    tagline: {
      fr: 'Porte du désert, kasbahs et studios de cinéma',
      en: 'Gateway to the desert, kasbahs and film studios',
      ar: 'بوابة الصحراء والقصبات واستوديوهات السينما',
    },
  },
  {
    id: 'Meknes', types: ['culture', 'gastronomy'], minDailyBudget: 300, color: '#7a8b3a', image: null,
    name: { fr: 'Meknès', en: 'Meknes', ar: 'مكناس' },
    tagline: {
      fr: 'Ville impériale, Bab Mansour et les ruines de Volubilis',
      en: 'Imperial city, Bab Mansour and the ruins of Volubilis',
      ar: 'مدينة إمبراطورية وباب منصور وآثار وليلي',
    },
  },
  {
    id: 'Tetouan', types: ['culture', 'beach'], minDailyBudget: 300, color: '#5b8f7b', image: null,
    name: { fr: 'Tétouan', en: 'Tetouan', ar: 'تطوان' },
    tagline: {
      fr: 'Médina andalouse et plages de la Méditerranée',
      en: 'An Andalusian medina and Mediterranean beaches',
      ar: 'مدينة عتيقة أندلسية وشواطئ المتوسط',
    },
  },
  {
    id: 'Dakhla', types: ['beach', 'desert', 'adventure'], minDailyBudget: 600, color: '#1f9aa8', image: null,
    name: { fr: 'Dakhla', en: 'Dakhla', ar: 'الداخلة' },
    tagline: {
      fr: 'Lagune, kitesurf et désert qui rejoint l’océan',
      en: 'A lagoon, kitesurfing and desert meeting the ocean',
      ar: 'بحيرة شاطئية ورياضة الكايت سورف وصحراء تعانق المحيط',
    },
  },
  {
    id: 'Ifrane', types: ['adventure'], minDailyBudget: 400, color: '#3f7d4e', image: null,
    name: { fr: 'Ifrane', en: 'Ifrane', ar: 'إفران' },
    tagline: {
      fr: 'Forêts de cèdres, lacs et neige du Moyen Atlas',
      en: 'Cedar forests, lakes and snow in the Middle Atlas',
      ar: 'غابات الأرز والبحيرات وثلوج الأطلس المتوسط',
    },
  },
];

const byId = new Map(DESTINATIONS.map((d) => [d.id, d]));

module.exports = { DESTINATIONS, findDestination: (id) => byId.get(id) };

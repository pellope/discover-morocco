// Les 14 destinations. En attendant l'API Google Places, ces données sont saisies ici.
// minDailyBudget : estimation du budget minimum par jour et par personne (MAD).
// image : adresse d'une photo (facultatif) ; sans photo, l'interface affiche un visuel coloré.

const DESTINATIONS = [
  {
    id: 'Marrakech', types: ['culture', 'gastronomy', 'adventure'], minDailyBudget: 450, color: '#c1272d', image: '/images/Marrakech.jpg',
    name: { fr: 'Marrakech', en: 'Marrakech', ar: 'مراكش' },
    tagline: {
      fr: 'Souks, palais et la place Jemaa el-Fna au pied de l’Atlas',
      en: 'Souks, palaces and Jemaa el-Fna square at the foot of the Atlas',
      ar: 'أسواق وقصور وساحة جامع الفنا عند سفح الأطلس',
    },
  },
  {
    id: 'Fes', types: ['culture', 'gastronomy'], minDailyBudget: 350, color: '#1d6fa5', image: '/images/Fes.jpg',
    name: { fr: 'Fès', en: 'Fez', ar: 'فاس' },
    tagline: {
      fr: 'La plus grande médina du monde et ses tanneries',
      en: 'The world’s largest medina and its tanneries',
      ar: 'أكبر مدينة عتيقة في العالم ودور الدباغة',
    },
  },
  {
    id: 'Casablanca', types: ['culture', 'gastronomy', 'beach'], minDailyBudget: 500, color: '#3d6b8c', image: '/images/Casablanca.jpg',
    name: { fr: 'Casablanca', en: 'Casablanca', ar: 'الدار البيضاء' },
    tagline: {
      fr: 'La mosquée Hassan II, l’Art déco et la corniche',
      en: 'Hassan II Mosque, Art Deco and the seafront corniche',
      ar: 'مسجد الحسن الثاني والمعمار الآرت ديكو والكورنيش',
    },
  },
  {
    id: 'Rabat', types: ['culture', 'beach'], minDailyBudget: 450, color: '#2f7d6b', image: '/images/Rabat.jpg',
    name: { fr: 'Rabat', en: 'Rabat', ar: 'الرباط' },
    tagline: {
      fr: 'La capitale : kasbah des Oudayas et tour Hassan',
      en: 'The capital: Kasbah of the Udayas and Hassan Tower',
      ar: 'العاصمة: قصبة الأوداية وصومعة حسان',
    },
  },
  {
    id: 'Tangier', types: ['culture', 'beach'], minDailyBudget: 400, color: '#2a7fa8', image: '/images/Tangier.jpg',
    name: { fr: 'Tanger', en: 'Tangier', ar: 'طنجة' },
    tagline: {
      fr: 'Entre Méditerranée et Atlantique, face à l’Espagne',
      en: 'Between the Mediterranean and the Atlantic, facing Spain',
      ar: 'بين المتوسط والأطلسي قبالة إسبانيا',
    },
  },
  {
    id: 'Chefchaouen', types: ['culture', 'adventure'], minDailyBudget: 300, color: '#3b82c4', image: '/images/Chefchaouen.jpg',
    name: { fr: 'Chefchaouen', en: 'Chefchaouen', ar: 'شفشاون' },
    tagline: {
      fr: 'La ville bleue nichée dans les montagnes du Rif',
      en: 'The blue city tucked into the Rif mountains',
      ar: 'المدينة الزرقاء وسط جبال الريف',
    },
  },
  {
    id: 'Agadir', types: ['beach', 'adventure'], minDailyBudget: 450, color: '#d98a00', image: '/images/Agadir.jpg',
    name: { fr: 'Agadir', en: 'Agadir', ar: 'أكادير' },
    tagline: {
      fr: 'Grande plage, soleil toute l’année et surf à Taghazout',
      en: 'A long beach, year-round sun and surfing in Taghazout',
      ar: 'شاطئ واسع وشمس طوال السنة وركوب الأمواج في تغازوت',
    },
  },
  {
    id: 'Essaouira', types: ['beach', 'gastronomy', 'culture'], minDailyBudget: 350, color: '#4a8fa3', image: '/images/Essaouira.jpg',
    name: { fr: 'Essaouira', en: 'Essaouira', ar: 'الصويرة' },
    tagline: {
      fr: 'Remparts, port de pêche et poisson grillé face à l’océan',
      en: 'Ramparts, a fishing port and grilled fish by the ocean',
      ar: 'أسوار وميناء صيد وسمك مشوي قبالة المحيط',
    },
  },
  {
    id: 'Merzouga', types: ['desert', 'adventure'], minDailyBudget: 500, color: '#c96f2b', image: '/images/Merzouga.jpg',
    name: { fr: 'Merzouga', en: 'Merzouga', ar: 'مرزوكة' },
    tagline: {
      fr: 'Les dunes de l’erg Chebbi et les nuits en bivouac',
      en: 'The Erg Chebbi dunes and nights in a desert camp',
      ar: 'كثبان عرق الشبي وليالي المخيمات الصحراوية',
    },
  },
  {
    id: 'Ouarzazate', types: ['desert', 'culture', 'adventure'], minDailyBudget: 350, color: '#b5651d', image: '/images/Ouarzazate.jpg',
    name: { fr: 'Ouarzazate', en: 'Ouarzazate', ar: 'ورزازات' },
    tagline: {
      fr: 'Porte du désert, kasbahs et studios de cinéma',
      en: 'Gateway to the desert, kasbahs and film studios',
      ar: 'بوابة الصحراء والقصبات واستوديوهات السينما',
    },
  },
  {
    id: 'Meknes', types: ['culture', 'gastronomy'], minDailyBudget: 300, color: '#7a8b3a', image: '/images/Meknes.jpg',
    name: { fr: 'Meknès', en: 'Meknes', ar: 'مكناس' },
    tagline: {
      fr: 'Ville impériale, Bab Mansour et les ruines de Volubilis',
      en: 'Imperial city, Bab Mansour and the ruins of Volubilis',
      ar: 'مدينة إمبراطورية وباب منصور وآثار وليلي',
    },
  },
  {
    id: 'Tetouan', types: ['culture', 'beach'], minDailyBudget: 300, color: '#5b8f7b', image: '/images/Tetouan.jpg',
    name: { fr: 'Tétouan', en: 'Tetouan', ar: 'تطوان' },
    tagline: {
      fr: 'Médina andalouse et plages de la Méditerranée',
      en: 'An Andalusian medina and Mediterranean beaches',
      ar: 'مدينة عتيقة أندلسية وشواطئ المتوسط',
    },
  },
  {
    id: 'Dakhla', types: ['beach', 'desert', 'adventure'], minDailyBudget: 600, color: '#1f9aa8', image: '/images/Dakhla.jpg',
    name: { fr: 'Dakhla', en: 'Dakhla', ar: 'الداخلة' },
    tagline: {
      fr: 'Lagune, kitesurf et désert qui rejoint l’océan',
      en: 'A lagoon, kitesurfing and desert meeting the ocean',
      ar: 'بحيرة شاطئية ورياضة الكايت سورف وصحراء تعانق المحيط',
    },
  },
  {
    id: 'Ifrane', types: ['adventure'], minDailyBudget: 400, color: '#3f7d4e', image: '/images/Ifrane.jpg',
    name: { fr: 'Ifrane', en: 'Ifrane', ar: 'إفران' },
    tagline: {
      fr: 'Forêts de cèdres, lacs et neige du Moyen Atlas',
      en: 'Cedar forests, lakes and snow in the Middle Atlas',
      ar: 'غابات الأرز والبحيرات وثلوج الأطلس المتوسط',
    },
  },
];

// Notre conseil pour chaque ville, affiché sur sa page.
const TIPS = {
  Marrakech: {
    fr: 'Venez sur la place Jemaa el-Fna au coucher du soleil : les stands de grillades s’installent et la place s’anime. Dans les souks, le marchandage fait partie du plaisir, gardez le sourire.',
    en: 'Come to Jemaa el-Fna at sunset, when the food stalls set up and the square comes alive. In the souks, haggling is part of the fun: keep smiling.',
    ar: 'زُر ساحة جامع الفنا عند الغروب حين تُنصب أكشاك الشواء وتدبّ الحياة في الساحة. في الأسواق المساومة جزء من المتعة، فحافظ على ابتسامتك.',
  },
  Fes: {
    fr: 'La médina est un labyrinthe : prenez un guide officiel pour la première demi-journée, puis perdez-vous tranquillement. Les tanneries se visitent mieux le matin.',
    en: 'The medina is a maze: hire an official guide for your first half-day, then wander at your own pace. The tanneries are best visited in the morning.',
    ar: 'المدينة العتيقة متاهة حقيقية: استعن بمرشد معتمد في نصف يومك الأول ثم تجوّل على مهلك. دور الدباغة أجمل في الصباح.',
  },
  Casablanca: {
    fr: 'La mosquée Hassan II se visite avec un guide, à heures fixes : vérifiez les horaires la veille. Le tramway est le moyen le plus simple et le moins cher de traverser la ville.',
    en: 'Hassan II Mosque is visited with a guide at set times: check the schedule the day before. The tram is the easiest and cheapest way across town.',
    ar: 'زيارة مسجد الحسن الثاني تكون مع مرشد وفي أوقات محددة، فتحقق منها قبل يوم. الترامواي أسهل وأرخص وسيلة للتنقل في المدينة.',
  },
  Rabat: {
    fr: 'Prenez un thé à la menthe au café de la kasbah des Oudayas, face à l’embouchure du Bouregreg. La ville se parcourt très bien à pied et en tramway.',
    en: 'Have a mint tea at the café in the Kasbah of the Udayas, overlooking the mouth of the Bou Regreg. The city is easy to explore on foot and by tram.',
    ar: 'اشرب شايًا بالنعناع في مقهى قصبة الأوداية المطل على مصب أبي رقراق. المدينة سهلة الاكتشاف مشيًا وبالترامواي.',
  },
  Tangier: {
    fr: 'Montez à la kasbah en fin d’après-midi pour la vue sur le détroit, puis redescendez par la médina. Le cap Spartel et les grottes d’Hercule se font en une demi-journée en taxi.',
    en: 'Climb to the kasbah in the late afternoon for the view over the strait, then walk back down through the medina. Cape Spartel and the Caves of Hercules make a half-day trip by taxi.',
    ar: 'اصعد إلى القصبة آخر النهار لمشاهدة المضيق ثم انزل عبر المدينة العتيقة. رأس سبارطيل ومغارة هرقل رحلة نصف يوم بسيارة الأجرة.',
  },
  Chefchaouen: {
    fr: 'Levez-vous tôt : avant 9 h, les ruelles bleues sont presque vides et la lumière est douce. Pensez à demander avant de photographier les habitants et leurs portes.',
    en: 'Get up early: before 9 am the blue lanes are almost empty and the light is soft. Remember to ask before photographing residents and their doorways.',
    ar: 'استيقظ باكرًا: قبل التاسعة تكون الأزقة الزرقاء شبه خالية والضوء لطيفًا. استأذن دائمًا قبل تصوير السكان وأبواب بيوتهم.',
  },
  Agadir: {
    fr: 'Pour le surf, le village de Taghazout est à une demi-heure au nord. Le souk El Had est idéal pour goûter l’huile d’argan et l’amlou à bon prix.',
    en: 'For surfing, the village of Taghazout is half an hour north. Souk El Had is the place to taste argan oil and amlou at a fair price.',
    ar: 'لعشاق ركوب الأمواج، قرية تغازوت على بعد نصف ساعة شمالًا. سوق الأحد مكان مثالي لتذوق زيت الأركان وأملو بثمن مناسب.',
  },
  Essaouira: {
    fr: 'Achetez votre poisson au port et faites-le griller sur place : c’est simple, frais et bon marché. Emportez une veste, le vent souffle presque toute l’année.',
    en: 'Buy your fish at the harbour and have it grilled on the spot: simple, fresh and cheap. Bring a jacket, the wind blows almost all year round.',
    ar: 'اشترِ سمكك من الميناء واطلب شيّه في عين المكان: بسيط وطازج ورخيص. خذ معك سترة فالرياح تهب معظم أيام السنة.',
  },
  Merzouga: {
    fr: 'Passez au moins une nuit en bivouac pour voir le coucher et le lever du soleil sur les dunes. Les nuits sont froides en hiver et les journées brûlantes en été : visez le printemps ou l’automne.',
    en: 'Spend at least one night in a desert camp to watch sunset and sunrise over the dunes. Winter nights are cold and summer days scorching: aim for spring or autumn.',
    ar: 'اقضِ ليلة واحدة على الأقل في مخيم صحراوي لمشاهدة الغروب والشروق فوق الكثبان. ليالي الشتاء باردة وأيام الصيف حارقة، فاختر الربيع أو الخريف.',
  },
  Ouarzazate: {
    fr: 'Le ksar d’Aït Ben Haddou, à trente minutes, est plus beau tôt le matin, avant l’arrivée des cars. Gardez une journée pour la route des kasbahs vers la vallée du Dadès.',
    en: 'The ksar of Aït Benhaddou, thirty minutes away, is at its best early in the morning before the coaches arrive. Keep a day for the kasbah road towards the Dades valley.',
    ar: 'قصر آيت بن حدو على بعد ثلاثين دقيقة، وأجمل أوقاته الصباح الباكر قبل وصول الحافلات. خصّص يومًا لطريق القصبات نحو وادي دادس.',
  },
  Meknes: {
    fr: 'Combinez la ville avec Volubilis et Moulay Idriss en une journée, en grand taxi partagé. Meknès est plus calme que Fès : prenez le temps de flâner sur la place El Hedim.',
    en: 'Combine the city with Volubilis and Moulay Idriss in one day by shared grand taxi. Meknes is calmer than Fez: take time to stroll around El Hedim square.',
    ar: 'اجمع بين المدينة ووليلي ومولاي إدريس في يوم واحد بسيارة أجرة كبيرة مشتركة. مكناس أهدأ من فاس، فتمهّل في ساحة الهديم.',
  },
  Tetouan: {
    fr: 'La médina, classée à l’UNESCO, reste très authentique et peu touristique. Les plages de Martil et de Cabo Negro sont à vingt minutes pour finir la journée au bord de l’eau.',
    en: 'The UNESCO-listed medina is still authentic and little visited. The beaches of Martil and Cabo Negro are twenty minutes away to end the day by the water.',
    ar: 'المدينة العتيقة المصنفة لدى اليونسكو ما زالت أصيلة وقليلة السياح. شواطئ مرتيل وكابو نيغرو على بعد عشرين دقيقة لختام اليوم قرب البحر.',
  },
  Dakhla: {
    fr: 'On y vient surtout en avion : réservez tôt, les vols font l’essentiel du budget. Même sans faire de kitesurf, la lagune et la dune blanche valent le voyage.',
    en: 'Most people fly in: book early, as flights make up most of the budget. Even if you don’t kitesurf, the lagoon and the White Dune are worth the trip.',
    ar: 'يصلها أغلب الزوار بالطائرة: احجز مبكرًا لأن التذاكر تأخذ معظم الميزانية. حتى دون ممارسة الكايت سورف، البحيرة والكثيب الأبيض يستحقان الرحلة.',
  },
  Ifrane: {
    fr: 'Dans la forêt de cèdres d’Azrou, toute proche, on croise facilement des macaques de Barbarie : ne les nourrissez pas. En hiver, prévoyez de vrais vêtements chauds, il neige.',
    en: 'In the nearby Azrou cedar forest you can easily spot Barbary macaques: please don’t feed them. In winter bring proper warm clothes, it snows.',
    ar: 'في غابة الأرز بأزرو القريبة تصادف قردة المكاك البربري بسهولة، فلا تطعمها. في الشتاء أحضر ملابس دافئة حقيقية لأن الثلوج تتساقط.',
  },
};
DESTINATIONS.forEach((d) => { d.tip = TIPS[d.id]; });

const byId = new Map(DESTINATIONS.map((d) => [d.id, d]));

module.exports = { DESTINATIONS, findDestination: (id) => byId.get(id) };

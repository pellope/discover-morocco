// Les 14 destinations. En attendant l'API Google Places, ces données sont saisies ici.
// minDailyBudget : estimation du budget minimum par jour et par personne (MAD).
// image : adresse d'une photo (facultatif) ; sans photo, l'interface affiche un visuel coloré.

const DESTINATIONS = [
  {
    id: 'Marrakech', lat: 31.6295, lng: -7.9811, types: ['culture', 'gastronomy', 'adventure'], minDailyBudget: 450, color: '#c1272d', image: '/images/Marrakech.jpg',
    name: { fr: 'Marrakech', en: 'Marrakech', ar: 'مراكش' },
    tagline: {
      fr: 'Souks, palais et la place Jemaa el-Fna au pied de l’Atlas',
      en: 'Souks, palaces and Jemaa el-Fna square at the foot of the Atlas',
      ar: 'أسواق وقصور وساحة جامع الفنا عند سفح الأطلس',
    },
  },
  {
    id: 'Fes', lat: 34.0181, lng: -5.0078, types: ['culture', 'gastronomy'], minDailyBudget: 350, color: '#1d6fa5', image: '/images/Fes.jpg',
    name: { fr: 'Fès', en: 'Fez', ar: 'فاس' },
    tagline: {
      fr: 'La plus grande médina du monde et ses tanneries',
      en: 'The world’s largest medina and its tanneries',
      ar: 'أكبر مدينة عتيقة في العالم ودور الدباغة',
    },
  },
  {
    id: 'Casablanca', lat: 33.5731, lng: -7.5898, types: ['culture', 'gastronomy', 'beach'], minDailyBudget: 500, color: '#3d6b8c', image: '/images/Casablanca.jpg',
    name: { fr: 'Casablanca', en: 'Casablanca', ar: 'الدار البيضاء' },
    tagline: {
      fr: 'La mosquée Hassan II, l’Art déco et la corniche',
      en: 'Hassan II Mosque, Art Deco and the seafront corniche',
      ar: 'مسجد الحسن الثاني والمعمار الآرت ديكو والكورنيش',
    },
  },
  {
    id: 'Rabat', lat: 34.0209, lng: -6.8416, types: ['culture', 'beach'], minDailyBudget: 450, color: '#2f7d6b', image: '/images/Rabat.jpg',
    name: { fr: 'Rabat', en: 'Rabat', ar: 'الرباط' },
    tagline: {
      fr: 'La capitale : kasbah des Oudayas et tour Hassan',
      en: 'The capital: Kasbah of the Udayas and Hassan Tower',
      ar: 'العاصمة: قصبة الأوداية وصومعة حسان',
    },
  },
  {
    id: 'Tangier', lat: 35.7595, lng: -5.834, types: ['culture', 'beach'], minDailyBudget: 400, color: '#2a7fa8', image: '/images/Tangier.jpg',
    name: { fr: 'Tanger', en: 'Tangier', ar: 'طنجة' },
    tagline: {
      fr: 'Entre Méditerranée et Atlantique, face à l’Espagne',
      en: 'Between the Mediterranean and the Atlantic, facing Spain',
      ar: 'بين المتوسط والأطلسي قبالة إسبانيا',
    },
  },
  {
    id: 'Chefchaouen', lat: 35.1688, lng: -5.2636, types: ['culture', 'adventure'], minDailyBudget: 300, color: '#3b82c4', image: '/images/Chefchaouen.jpg',
    name: { fr: 'Chefchaouen', en: 'Chefchaouen', ar: 'شفشاون' },
    tagline: {
      fr: 'La ville bleue nichée dans les montagnes du Rif',
      en: 'The blue city tucked into the Rif mountains',
      ar: 'المدينة الزرقاء وسط جبال الريف',
    },
  },
  {
    id: 'Agadir', lat: 30.4278, lng: -9.5981, types: ['beach', 'adventure'], minDailyBudget: 450, color: '#d98a00', image: '/images/Agadir.jpg',
    name: { fr: 'Agadir', en: 'Agadir', ar: 'أكادير' },
    tagline: {
      fr: 'Grande plage, soleil toute l’année et surf à Taghazout',
      en: 'A long beach, year-round sun and surfing in Taghazout',
      ar: 'شاطئ واسع وشمس طوال السنة وركوب الأمواج في تغازوت',
    },
  },
  {
    id: 'Essaouira', lat: 31.5085, lng: -9.7595, types: ['beach', 'gastronomy', 'culture'], minDailyBudget: 350, color: '#4a8fa3', image: '/images/Essaouira.jpg',
    name: { fr: 'Essaouira', en: 'Essaouira', ar: 'الصويرة' },
    tagline: {
      fr: 'Remparts, port de pêche et poisson grillé face à l’océan',
      en: 'Ramparts, a fishing port and grilled fish by the ocean',
      ar: 'أسوار وميناء صيد وسمك مشوي قبالة المحيط',
    },
  },
  {
    id: 'Merzouga', lat: 31.0802, lng: -4.0134, types: ['desert', 'adventure'], minDailyBudget: 500, color: '#c96f2b', image: '/images/Merzouga.jpg',
    name: { fr: 'Merzouga', en: 'Merzouga', ar: 'مرزوكة' },
    tagline: {
      fr: 'Les dunes de l’erg Chebbi et les nuits en bivouac',
      en: 'The Erg Chebbi dunes and nights in a desert camp',
      ar: 'كثبان عرق الشبي وليالي المخيمات الصحراوية',
    },
  },
  {
    id: 'Ouarzazate', lat: 30.9189, lng: -6.8934, types: ['desert', 'culture', 'adventure'], minDailyBudget: 350, color: '#b5651d', image: '/images/Ouarzazate.jpg',
    name: { fr: 'Ouarzazate', en: 'Ouarzazate', ar: 'ورزازات' },
    tagline: {
      fr: 'Porte du désert, kasbahs et studios de cinéma',
      en: 'Gateway to the desert, kasbahs and film studios',
      ar: 'بوابة الصحراء والقصبات واستوديوهات السينما',
    },
  },
  {
    id: 'Meknes', lat: 33.8935, lng: -5.5473, types: ['culture', 'gastronomy'], minDailyBudget: 300, color: '#7a8b3a', image: '/images/Meknes.jpg',
    name: { fr: 'Meknès', en: 'Meknes', ar: 'مكناس' },
    tagline: {
      fr: 'Ville impériale, Bab Mansour et les ruines de Volubilis',
      en: 'Imperial city, Bab Mansour and the ruins of Volubilis',
      ar: 'مدينة إمبراطورية وباب منصور وآثار وليلي',
    },
  },
  {
    id: 'Tetouan', lat: 35.5889, lng: -5.3626, types: ['culture', 'beach'], minDailyBudget: 300, color: '#5b8f7b', image: '/images/Tetouan.jpg',
    name: { fr: 'Tétouan', en: 'Tetouan', ar: 'تطوان' },
    tagline: {
      fr: 'Médina andalouse et plages de la Méditerranée',
      en: 'An Andalusian medina and Mediterranean beaches',
      ar: 'مدينة عتيقة أندلسية وشواطئ المتوسط',
    },
  },
  {
    id: 'Dakhla', lat: 23.6848, lng: -15.958, types: ['beach', 'desert', 'adventure'], minDailyBudget: 600, color: '#1f9aa8', image: '/images/Dakhla.jpg',
    name: { fr: 'Dakhla', en: 'Dakhla', ar: 'الداخلة' },
    tagline: {
      fr: 'Lagune, kitesurf et désert qui rejoint l’océan',
      en: 'A lagoon, kitesurfing and desert meeting the ocean',
      ar: 'بحيرة شاطئية ورياضة الكايت سورف وصحراء تعانق المحيط',
    },
  },
  {
    id: 'Ifrane', lat: 33.5228, lng: -5.1106, types: ['adventure'], minDailyBudget: 400, color: '#3f7d4e', image: '/images/Ifrane.jpg',
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

// Climat (température maximale moyenne par mois, en °C, de janvier à décembre), meilleurs mois,
// mois de haute saison (budget minimum majoré) et accès. Valeurs approximatives.
const DETAILS = {
  Marrakech: { climate: [18, 20, 23, 25, 29, 33, 37, 37, 32, 28, 22, 19], bestMonths: [3, 4, 5, 10, 11], peakMonths: [3, 4, 10, 12], getThere: { fr: "Aéroport international de Marrakech-Ménara ; train depuis Casablanca (environ 2 h 40) et Rabat.", en: "Marrakech-Menara international airport; train from Casablanca (about 2 h 40) and Rabat.", ar: "مطار مراكش المنارة الدولي، والقطار من الدار البيضاء (حوالي ساعتين و40 دقيقة) والرباط." } },
  Fes: { climate: [15, 17, 20, 22, 26, 31, 35, 35, 30, 25, 19, 16], bestMonths: [4, 5, 9, 10], peakMonths: [4, 5, 10], getThere: { fr: "Aéroport de Fès-Saïss ; train depuis Rabat, Casablanca, Meknès et Tanger.", en: "Fes-Saïss airport; train from Rabat, Casablanca, Meknes and Tangier.", ar: "مطار فاس سايس، والقطار من الرباط والدار البيضاء ومكناس وطنجة." } },
  Casablanca: { climate: [17, 18, 19, 21, 22, 25, 26, 27, 26, 24, 21, 18], bestMonths: [5, 6, 9, 10], peakMonths: [7, 8], getThere: { fr: "Aéroport Mohammed V, le plus grand du pays, relié au centre en train ; TGV Al Boraq depuis Tanger.", en: "Mohammed V airport, the country’s largest, linked to the centre by train; Al Boraq high-speed train from Tangier.", ar: "مطار محمد الخامس، الأكبر في البلاد، مرتبط بالمركز بالقطار، وقطار البراق السريع من طنجة." } },
  Rabat: { climate: [17, 18, 20, 21, 23, 25, 27, 28, 27, 24, 21, 18], bestMonths: [5, 6, 9, 10], peakMonths: [7, 8], getThere: { fr: "Aéroport de Rabat-Salé ; train fréquent depuis Casablanca (environ 1 h) et TGV depuis Tanger.", en: "Rabat-Salé airport; frequent trains from Casablanca (about 1 h) and high-speed train from Tangier.", ar: "مطار الرباط سلا، وقطارات متكررة من الدار البيضاء (حوالي ساعة) والقطار السريع من طنجة." } },
  Tangier: { climate: [16, 17, 18, 20, 23, 26, 29, 29, 27, 23, 19, 17], bestMonths: [5, 6, 9], peakMonths: [7, 8], getThere: { fr: "Aéroport Ibn Battouta ; ferry depuis l’Espagne ; TGV Al Boraq depuis Casablanca (environ 2 h 10).", en: "Ibn Battouta airport; ferry from Spain; Al Boraq high-speed train from Casablanca (about 2 h 10).", ar: "مطار ابن بطوطة، والعبّارة من إسبانيا، وقطار البراق من الدار البيضاء (حوالي ساعتين و10 دقائق)." } },
  Chefchaouen: { climate: [14, 15, 18, 20, 24, 29, 33, 33, 28, 23, 18, 15], bestMonths: [4, 5, 9, 10], peakMonths: [4, 7, 8], getThere: { fr: "Pas de gare ni d’aéroport : bus ou grand taxi depuis Tanger, Tétouan ou Fès.", en: "No station or airport: bus or grand taxi from Tangier, Tetouan or Fez.", ar: "لا توجد محطة قطار ولا مطار: حافلة أو سيارة أجرة كبيرة من طنجة أو تطوان أو فاس." } },
  Agadir: { climate: [20, 21, 22, 22, 23, 25, 26, 26, 26, 25, 23, 21], bestMonths: [3, 4, 5, 10, 11], peakMonths: [7, 8, 12], getThere: { fr: "Aéroport d’Agadir-Al Massira ; bus depuis Marrakech (environ 3 h) par l’autoroute.", en: "Agadir-Al Massira airport; bus from Marrakech (about 3 h) by motorway.", ar: "مطار أكادير المسيرة، وحافلة من مراكش (حوالي 3 ساعات) عبر الطريق السيار." } },
  Essaouira: { climate: [18, 18, 19, 19, 20, 21, 22, 22, 22, 22, 20, 19], bestMonths: [5, 6, 9, 10], peakMonths: [7, 8], getThere: { fr: "Bus depuis Marrakech (environ 3 h) ou Agadir ; petit aéroport avec quelques vols.", en: "Bus from Marrakech (about 3 h) or Agadir; a small airport with a few flights.", ar: "حافلة من مراكش (حوالي 3 ساعات) أو أكادير، ومطار صغير برحلات قليلة." } },
  Merzouga: { climate: [18, 21, 25, 29, 34, 39, 43, 42, 36, 30, 23, 18], bestMonths: [3, 4, 10, 11], peakMonths: [3, 4, 10, 12], getThere: { fr: "Bus de nuit depuis Fès ou Marrakech, ou route par Errachidia et Rissani ; comptez une journée.", en: "Night bus from Fez or Marrakech, or by road via Errachidia and Rissani; allow a full day.", ar: "حافلة ليلية من فاس أو مراكش، أو الطريق عبر الرشيدية والريصاني، وتستغرق الرحلة يومًا كاملًا." } },
  Ouarzazate: { climate: [17, 20, 23, 27, 31, 36, 40, 39, 33, 27, 21, 17], bestMonths: [3, 4, 5, 10], peakMonths: [4, 10], getThere: { fr: "Bus depuis Marrakech par le col du Tizi n’Tichka (environ 4 h) ; petit aéroport.", en: "Bus from Marrakech over the Tizi n’Tichka pass (about 4 h); a small airport.", ar: "حافلة من مراكش عبر ممر تيزي نتيشكا (حوالي 4 ساعات)، ومطار صغير." } },
  Meknes: { climate: [15, 17, 19, 21, 25, 30, 34, 34, 30, 25, 19, 16], bestMonths: [4, 5, 10], peakMonths: [4, 5], getThere: { fr: "Train depuis Fès (environ 40 min), Rabat et Casablanca.", en: "Train from Fez (about 40 min), Rabat and Casablanca.", ar: "القطار من فاس (حوالي 40 دقيقة) والرباط والدار البيضاء." } },
  Tetouan: { climate: [16, 17, 18, 20, 23, 27, 30, 30, 27, 23, 19, 17], bestMonths: [5, 6, 9], peakMonths: [7, 8], getThere: { fr: "Bus ou grand taxi depuis Tanger (environ 1 h) ; petit aéroport de Tétouan-Sania Ramel.", en: "Bus or grand taxi from Tangier (about 1 h); small Tetouan-Sania Ramel airport.", ar: "حافلة أو سيارة أجرة كبيرة من طنجة (حوالي ساعة)، ومطار تطوان سانية الرمل الصغير." } },
  Dakhla: { climate: [22, 23, 24, 24, 25, 26, 27, 28, 28, 27, 25, 23], bestMonths: [4, 5, 9, 10], peakMonths: [7, 8], getThere: { fr: "En avion depuis Casablanca ou Agadir ; la route depuis Agadir dépasse 1 000 km.", en: "By plane from Casablanca or Agadir; the road from Agadir is over 1,000 km.", ar: "بالطائرة من الدار البيضاء أو أكادير، والطريق من أكادير تتجاوز 1000 كلم." } },
  Ifrane: { climate: [9, 11, 14, 16, 20, 26, 31, 31, 25, 19, 13, 10], bestMonths: [5, 6, 9], peakMonths: [1, 7, 8], getThere: { fr: "Bus ou grand taxi depuis Fès ou Meknès (environ 1 h).", en: "Bus or grand taxi from Fez or Meknes (about 1 h).", ar: "حافلة أو سيارة أجرة كبيرة من فاس أو مكناس (حوالي ساعة)." } },
};
const PEAK_FACTOR = 1.25;
const GALLERY = {
  'Marrakech': [
    '/images/Marrakech-2.jpg',
    '/images/Marrakech-3.jpg'
  ],
  'Fes': [
    '/images/Fes-2.jpg',
    '/images/Fes-3.jpg'
  ],
  'Casablanca': [
    '/images/Casablanca-2.jpg'
  ],
  'Rabat': [
    '/images/Rabat-2.jpg',
    '/images/Rabat-3.jpg'
  ],
  'Tangier': [
    '/images/Tangier-2.jpg'
  ],
  'Chefchaouen': [
    '/images/Chefchaouen-2.jpg',
    '/images/Chefchaouen-3.jpg'
  ],
  'Agadir': [
    '/images/Agadir-2.jpg',
    '/images/Agadir-3.jpg'
  ],
  'Essaouira': [
    '/images/Essaouira-2.jpg'
  ],
  'Merzouga': [
    '/images/Merzouga-2.jpg'
  ],
  'Ouarzazate': [
    '/images/Ouarzazate-2.jpg',
    '/images/Ouarzazate-3.jpg'
  ],
  'Meknes': [
    '/images/Meknes-2.jpg'
  ],
  'Tetouan': [
    '/images/Tetouan-2.jpg'
  ],
  'Dakhla': [
    '/images/Dakhla-2.jpg',
    '/images/Dakhla-3.jpg'
  ]
};
DESTINATIONS.forEach((d) => { Object.assign(d, DETAILS[d.id]); d.gallery = [d.image, ...(GALLERY[d.id] ?? [])].filter(Boolean); });

const byId = new Map(DESTINATIONS.map((d) => [d.id, d]));

// Budget minimum conseillé par jour et par personne, selon le confort et le mois du voyage.
function effectiveMinimum(destination, { comfort = 'budget', month = null } = {}) {
  const { COMFORT } = require('./budgetCoach');
  const peak = month !== null && destination.peakMonths.includes(month);
  return { amount: Math.round(destination.minDailyBudget * COMFORT[comfort].factor * (peak ? PEAK_FACTOR : 1)), peak };
}

module.exports = { DESTINATIONS, findDestination: (id) => byId.get(id), effectiveMinimum };

// Activités proposées par ville pour le plan jour par jour.
// Format : [type, coût estimé par personne en MAD, nom fr, nom en, nom ar]. 0 = gratuit.
const RAW = {
  Marrakech: [
    ['culture', 0, 'Flânerie dans les souks de la médina', 'Wander through the medina souks', 'جولة في أسواق المدينة العتيقة'],
    ['culture', 100, 'Visite du palais de la Bahia', 'Visit the Bahia Palace', 'زيارة قصر الباهية'],
    ['culture', 170, 'Jardin Majorelle', 'Majorelle Garden', 'حديقة ماجوريل'],
    ['gastronomy', 100, 'Dîner aux stands de la place Jemaa el-Fna', 'Dinner at the Jemaa el-Fna food stalls', 'عشاء في أكشاك ساحة جامع الفنا'],
    ['adventure', 250, 'Excursion dans la vallée de l’Ourika', 'Day trip to the Ourika valley', 'رحلة إلى وادي أوريكا'],
  ],
  Fes: [
    ['culture', 0, 'Balade dans la médina de Fès el-Bali', 'Walk through the Fes el-Bali medina', 'جولة في مدينة فاس البالي'],
    ['culture', 30, 'Médersa Bou Inania', 'Bou Inania Madrasa', 'المدرسة البوعنانية'],
    ['culture', 20, 'Tanneries Chouara vues des terrasses', 'Chouara tanneries from the terraces', 'دار الدباغة شوارة من الأسطح'],
    ['gastronomy', 400, 'Cours de cuisine marocaine', 'Moroccan cooking class', 'درس في الطبخ المغربي'],
    ['culture', 0, 'Coucher de soleil aux tombeaux mérinides', 'Sunset at the Marinid Tombs', 'الغروب عند قبور المرينيين'],
  ],
  Casablanca: [
    ['culture', 140, 'Visite guidée de la mosquée Hassan II', 'Guided tour of Hassan II Mosque', 'زيارة مسجد الحسن الثاني مع مرشد'],
    ['beach', 0, 'Promenade sur la corniche d’Aïn Diab', 'Stroll along the Aïn Diab corniche', 'نزهة على كورنيش عين الذئاب'],
    ['gastronomy', 150, 'Fruits de mer au marché central', 'Seafood at the central market', 'فواكه البحر في السوق المركزي'],
    ['culture', 0, 'Quartier des Habous et ses pâtisseries', 'Habous quarter and its pastry shops', 'حي الأحباس ومحلات الحلويات'],
  ],
  Rabat: [
    ['culture', 0, 'Kasbah des Oudayas et son jardin andalou', 'Kasbah of the Udayas and its Andalusian garden', 'قصبة الأوداية وحديقتها الأندلسية'],
    ['culture', 0, 'Tour Hassan et mausolée Mohammed V', 'Hassan Tower and Mohammed V Mausoleum', 'صومعة حسان وضريح محمد الخامس'],
    ['culture', 70, 'Site du Chellah', 'Chellah archaeological site', 'موقع شالة الأثري'],
    ['beach', 200, 'Initiation au surf sur la plage de Rabat', 'Beginner surf lesson on Rabat beach', 'حصة تعلم ركوب الأمواج في شاطئ الرباط'],
  ],
  Tangier: [
    ['culture', 30, 'Kasbah et musée de la Kasbah', 'The kasbah and its museum', 'القصبة ومتحفها'],
    ['beach', 150, 'Cap Spartel et grottes d’Hercule en taxi', 'Cape Spartel and the Caves of Hercules by taxi', 'رأس سبارطيل ومغارة هرقل بسيارة الأجرة'],
    ['culture', 20, 'Thé à la menthe face au détroit', 'Mint tea overlooking the strait', 'شاي بالنعناع قبالة المضيق'],
    ['beach', 0, 'Après-midi à la plage d’Achakar', 'Afternoon at Achakar beach', 'أمسية في شاطئ أشقار'],
  ],
  Chefchaouen: [
    ['culture', 0, 'Balade dans les ruelles bleues', 'Walk through the blue lanes', 'جولة في الأزقة الزرقاء'],
    ['culture', 60, 'Kasbah et son musée', 'The kasbah and its museum', 'القصبة ومتحفها'],
    ['adventure', 150, 'Randonnée aux cascades d’Akchour', 'Hike to the Akchour waterfalls', 'مشي إلى شلالات أقشور'],
    ['adventure', 0, 'Coucher de soleil à la mosquée espagnole', 'Sunset at the Spanish Mosque', 'الغروب عند المسجد الإسباني'],
  ],
  Agadir: [
    ['beach', 0, 'Journée sur la grande plage', 'A day on the main beach', 'يوم على الشاطئ الكبير'],
    ['adventure', 300, 'Cours de surf à Taghazout', 'Surf lesson in Taghazout', 'درس ركوب الأمواج في تغازوت'],
    ['culture', 0, 'Souk El Had', 'Souk El Had market', 'سوق الأحد'],
    ['adventure', 200, 'Excursion à la vallée du Paradis', 'Trip to Paradise Valley', 'رحلة إلى وادي الجنة'],
  ],
  Essaouira: [
    ['culture', 0, 'Remparts et Skala de la ville', 'The ramparts and the Skala', 'الأسوار وسقالة المدينة'],
    ['gastronomy', 120, 'Poisson grillé au port', 'Grilled fish at the harbour', 'سمك مشوي في الميناء'],
    ['beach', 300, 'Balade à cheval sur la plage', 'Horse ride on the beach', 'جولة على الخيل في الشاطئ'],
    ['culture', 0, 'Galeries et ateliers de la médina', 'Galleries and workshops in the medina', 'معارض وورشات المدينة العتيقة'],
  ],
  Merzouga: [
    ['desert', 300, 'Balade à dos de dromadaire au coucher du soleil', 'Sunset camel ride', 'جولة على الجمال عند الغروب'],
    ['desert', 600, 'Nuit en bivouac dans les dunes', 'Night in a desert camp', 'ليلة في مخيم وسط الكثبان'],
    ['adventure', 400, 'Tour en 4x4 autour de l’erg Chebbi', '4x4 tour around Erg Chebbi', 'جولة بسيارة الدفع الرباعي حول عرق الشبي'],
    ['culture', 50, 'Musique gnaoua au village de Khamlia', 'Gnawa music in Khamlia village', 'موسيقى كناوة في قرية الخملية'],
  ],
  Ouarzazate: [
    ['culture', 50, 'Ksar d’Aït Ben Haddou', 'Ksar of Aït Benhaddou', 'قصر آيت بن حدو'],
    ['culture', 80, 'Studios de cinéma Atlas', 'Atlas film studios', 'استوديوهات أطلس السينمائية'],
    ['culture', 40, 'Kasbah de Taourirt', 'Taourirt Kasbah', 'قصبة تاوريرت'],
    ['desert', 200, 'Oasis de Fint', 'Fint oasis', 'واحة فينت'],
  ],
  Meknes: [
    ['culture', 0, 'Bab Mansour et place El Hedim', 'Bab Mansour and El Hedim square', 'باب منصور وساحة الهديم'],
    ['culture', 150, 'Ruines romaines de Volubilis', 'Roman ruins of Volubilis', 'آثار وليلي الرومانية'],
    ['culture', 0, 'Mausolée de Moulay Ismaïl', 'Mausoleum of Moulay Ismail', 'ضريح المولى إسماعيل'],
    ['gastronomy', 80, 'Dégustation dans la médina', 'Street food tasting in the medina', 'تذوق أكلات المدينة العتيقة'],
  ],
  Tetouan: [
    ['culture', 0, 'Médina andalouse', 'The Andalusian medina', 'المدينة العتيقة الأندلسية'],
    ['culture', 30, 'Musée archéologique', 'Archaeological museum', 'المتحف الأثري'],
    ['beach', 30, 'Plage de Martil', 'Martil beach', 'شاطئ مرتيل'],
    ['beach', 50, 'Baie de Cabo Negro', 'Cabo Negro bay', 'خليج كابو نيغرو'],
  ],
  Dakhla: [
    ['adventure', 600, 'Cours de kitesurf sur la lagune', 'Kitesurfing lesson on the lagoon', 'درس كايت سورف في البحيرة'],
    ['desert', 300, 'Excursion à la dune blanche', 'Trip to the White Dune', 'رحلة إلى الكثيب الأبيض'],
    ['beach', 150, 'Dégustation d’huîtres au bord de la lagune', 'Oyster tasting by the lagoon', 'تذوق المحار على ضفة البحيرة'],
    ['beach', 0, 'Baignade et farniente sur la plage', 'Swimming and relaxing on the beach', 'سباحة واسترخاء على الشاطئ'],
  ],
  Ifrane: [
    ['adventure', 100, 'Forêt de cèdres d’Azrou et ses macaques', 'Azrou cedar forest and its macaques', 'غابة الأرز بأزرو وقردتها'],
    ['adventure', 50, 'Tour du lac Dayet Aoua', 'Walk around Dayet Aoua lake', 'جولة حول ضاية عوا'],
    ['culture', 0, 'Lion de pierre et centre-ville', 'The stone lion and the town centre', 'أسد إفران ووسط المدينة'],
    ['adventure', 0, 'Randonnée à la source Vittel', 'Hike to the Vittel spring', 'مشي إلى عين فيتال'],
  ],
};

const ACTIVITIES = Object.fromEntries(Object.entries(RAW).map(([city, list]) => [
  city,
  list.map(([type, cost, fr, en, ar]) => ({ type, cost, name: { fr, en, ar } })),
]));

module.exports = { ACTIVITIES };

import { ExerciseDocument, MuscleGroup, Equipment } from '../types/gym';

export const EXERCISES_DATA: ExerciseDocument[] = [
  // CHEST
  {
    id: 'ex_001',
    name: 'Barbell Bench Press',
    nameIndo: 'Bench Press Barbel Datar',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Barbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 120,
    instructions: [
      'Berbaring di atas bench datar dengan mata tepat di bawah barbel.',
      'Genggam barbel sedikit lebih lebar dari bahu, kunci tulang belikat ke bawah.',
      'Turunkan barbel terkontrol ke bagian dada bawah.',
      'Dorong barbel kembali ke atas dengan mengontraksikan otot dada.'
    ],
    tips: ['Jaga pergelangan tangan lurus dan siku di sudut 60-75 derajat.']
  },
  {
    id: 'ex_002',
    name: 'Incline Dumbbell Press',
    nameIndo: 'Dumbbell Bench Press Incline',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders', 'Triceps'],
    equipment: 'Dumbbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 90,
    instructions: [
      'Atur sandaran bangku pada sudut 30-45 derajat.',
      'Dorong dumbel ke atas sampai lengan hampir lurus.',
      'Turunkan perlahan sampai merasakan regangan di dada bagian atas.'
    ],
    tips: ['Fokus pada regangan dada bagian atas di posisi bawah.']
  },
  {
    id: 'ex_003',
    name: 'Cable Chest Fly',
    nameIndo: 'Fly Kabel Dada Berdiri',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Cable',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Atur katrol kabel setinggi dada dan ambil satu langkah ke depan.',
      'Buka lengan lebar dengan siku sedikit menekuk.',
      'Tarik kedua tangan bersamaan ke depan dada seperti memeluk pohon.'
    ],
    tips: ['Tahan kontraksi di puncak gerakan selama 1 detik.']
  },
  {
    id: 'ex_004',
    name: 'Chest Dips',
    nameIndo: 'Dips Paralel Dada',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Bodyweight',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 90,
    instructions: [
      'Pegang palang paralel, condongkan tubuh ke depan 30 derajat.',
      'Turunkan tubuh hingga lengan atas sejajar lantai.',
      'Dorong kembali ke atas menggunakan dada dan trisep.'
    ],
    tips: ['Condongkan tubuh ke depan untuk fokus serat otot dada.']
  },
  {
    id: 'ex_005',
    name: 'Push Up',
    nameIndo: 'Push Up Standar',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: 'Bodyweight',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Posisi plank tangan selebar bahu.',
      'Turunkan tubuh hingga dada hampir menyentuh lantai.',
      'Dorong lantai dengan kuat kembali ke posisi awal.'
    ]
  },
  {
    id: 'ex_006',
    name: 'Pec Deck Machine',
    nameIndo: 'Mesin Pec Deck Fly',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Machine',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Duduk tegak dengan punggung menempel erat pada sandaran.',
      'Rapatkan lengan ke depan dada dengan meremas otot dada.',
      'Kembali perlahan ke posisi awal dengan terkontrol.'
    ]
  },

  // BACK
  {
    id: 'ex_010',
    name: 'Barbell Deadlift',
    nameIndo: 'Deadlift Barbel Konvensional',
    muscleGroup: 'Back',
    secondaryMuscles: ['Legs', 'Core'],
    equipment: 'Barbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 180,
    instructions: [
      'Berdiri dengan kaki selebar pinggul, barbel tepat di atas pertengahan kaki.',
      'Engsel pinggul ke belakang, genggam barbel di luar lutut.',
      'Kencangkan lat, luruskan tulang punggung, dan dorong lantai dengan kaki.'
    ],
    tips: ['Jangan membungkukkan punggung bawah!', 'Barbel harus selalu dekat dengan tulang kering.']
  },
  {
    id: 'ex_011',
    name: 'Lat Pulldown',
    nameIndo: 'Tarik Kabel Lat Atas',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    equipment: 'Cable',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 90,
    instructions: [
      'Duduk di mesin lat pulldown dengan paha tertahan rapat.',
      'Pegang palang lebih lebar dari bahu.',
      'Tarik palang ke arah dada atas dengan mengarahkan siku ke bawah.'
    ],
    tips: ['Fokus menggerakkan siku ke bawah, bukan sekadar menarik dengan tangan.']
  },
  {
    id: 'ex_012',
    name: 'Barbell Bent-Over Row',
    nameIndo: 'Dayung Barbel Membungkuk',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    equipment: 'Barbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 90,
    instructions: [
      'Engsel pinggul ke belakang hingga tubuh hampir sejajar lantai.',
      'Tarik barbel ke arah pusar dengan menggerakkan siku ke belakang.',
      'Turunkan barbel terkontrol kembali ke posisi awal.'
    ]
  },
  {
    id: 'ex_013',
    name: 'Pull Up',
    nameIndo: 'Pull Up Palang Tunggal',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Core'],
    equipment: 'Bodyweight',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 120,
    instructions: [
      'Genggam palang pull-up overhand selebar bahu.',
      'Tarik tubuh ke atas hingga dagu melewati palang.',
      'Turunkan tubuh secara perlahan ke posisi lurus penuh.'
    ]
  },
  {
    id: 'ex_014',
    name: 'Seated Cable Row',
    nameIndo: 'Dayung Kabel Duduk V-Bar',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps'],
    equipment: 'Cable',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 90,
    instructions: [
      'Duduk dengan kaki pada pijakan, tekuk lutut sedikit.',
      'Tarik pegangan ke arah perut bawah sambil merapatkan belikat.',
      'Lepaskan kembali beban secara perlahan.'
    ]
  },

  // LEGS
  {
    id: 'ex_020',
    name: 'Barbell Back Squat',
    nameIndo: 'Squat Barbel Punggung',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    equipment: 'Barbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 150,
    instructions: [
      'Posisikan barbel di atas trapezius, kaki selebar bahu.',
      'Kunci perut dan turunkan pinggul seperti hendak duduk di kursi.',
      'Turun hingga paha minimal sejajar lantai, lalu dorong kembali melalui tumit.'
    ],
    tips: ['Pastikan lutut mengarah ke arah jari-jari kaki.']
  },
  {
    id: 'ex_021',
    name: 'Romanian Deadlift (RDL)',
    nameIndo: 'Deadlift Rumania Paha Belakang',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Back'],
    equipment: 'Barbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 120,
    instructions: [
      'Berdiri tegak memegang barbel, tekuk lutut sangat sedikit.',
      'Dorong pinggul jauh ke belakang sambil menurunkan barbel menyusuri kaki.',
      'Dorong pinggul ke depan saat merasakan regangan kuat di hamstring.'
    ]
  },
  {
    id: 'ex_022',
    name: 'Leg Press Machine',
    nameIndo: 'Mesin Dorong Kaki 45 Derajat',
    muscleGroup: 'Legs',
    secondaryMuscles: [],
    equipment: 'Machine',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 120,
    instructions: [
      'Duduk di mesin leg press, letakkan kaki di platform selebar bahu.',
      'Turunkan beban hingga lutut membentuk sudut 90 derajat.',
      'Dorong kembali ke atas tanpa mengunci sendi lutut.'
    ]
  },
  {
    id: 'ex_023',
    name: 'Bulgarian Split Squat',
    nameIndo: 'Split Squat Kaki Satu di Bangku',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    equipment: 'Dumbbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 90,
    instructions: [
      'Letakkan satu punggung kaki di bangku belakang.',
      'Turunkan tubuh hingga lutut kaki depan membentuk sudut 90 derajat.',
      'Dorong kembali ke atas melalui tumit kaki depan.'
    ]
  },
  {
    id: 'ex_024',
    name: 'Leg Curl Machine',
    nameIndo: 'Mesin Tekuk Kaki Belakang',
    muscleGroup: 'Legs',
    secondaryMuscles: [],
    equipment: 'Machine',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 75,
    instructions: [
      'Posisikan bantalan roller di atas tumit belakang.',
      'Tekuk kaki ke arah pantat sekuat tenaga, lalu kembali perlahan.'
    ]
  },
  {
    id: 'ex_025',
    name: 'Standing Calf Raise',
    nameIndo: 'Jinjit Betis Berdiri',
    muscleGroup: 'Legs',
    secondaryMuscles: [],
    equipment: 'Machine',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Turunkan tumit ke bawah untuk peregangan penuh betis.',
      'Dorong setinggi mungkin hingga berdiri berjinjit.',
      'Tahan kontraksi 1 detik sebelum turun.'
    ]
  },

  // SHOULDERS
  {
    id: 'ex_030',
    name: 'Overhead Barbell Press',
    nameIndo: 'Dorong Barbel Bahu Militer (OHP)',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: 'Barbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 120,
    instructions: [
      'Barbel diletakkan di tulang selangka depan.',
      'Kencangkan pantat dan perut.',
      'Dorong barbel lurus ke atas kepala hingga lengan lurus terkunci.'
    ]
  },
  {
    id: 'ex_031',
    name: 'Dumbbell Lateral Raise',
    nameIndo: 'Angkat Samping Dumbel Bahu',
    muscleGroup: 'Shoulders',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Berdiri dengan dumbel di samping paha, tekuk siku sedikit.',
      'Angkat dumbel ke samping tubuh hingga sejajar lantai.',
      'Turunkan perlahan dengan kendali penuh.'
    ]
  },
  {
    id: 'ex_032',
    name: 'Seated Dumbbell Shoulder Press',
    nameIndo: 'Press Bahu Dumbel Duduk',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Triceps'],
    equipment: 'Dumbbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 90,
    instructions: [
      'Duduk di bangku tegak dengan dumbel setinggi bahu.',
      'Dorong dumbel ke atas sampai hampir bersentuhan.',
      'Turunkan kembali terkontrol hingga setinggi telinga.'
    ]
  },
  {
    id: 'ex_033',
    name: 'Cable Face Pull',
    nameIndo: 'Tarik Tali Kabel Wajah (Bahu Belakang)',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Back'],
    equipment: 'Cable',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Pegang tali kabel setinggi mata dengan ibu jari menghadap belakang.',
      'Tarik tali ke arah wajah sambil membuka siku tinggi ke samping.',
      'Putar tangan ke belakang di akhir gerakan.'
    ]
  },

  // BICEPS & TRICEPS
  {
    id: 'ex_040',
    name: 'Barbell Bicep Curl',
    nameIndo: 'Curl Barbel Bisep Berdiri',
    muscleGroup: 'Biceps',
    secondaryMuscles: [],
    equipment: 'Barbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 75,
    instructions: [
      'Genggam barbel supinasi selebar bahu, siku rapat di pinggang.',
      'Angkat barbel ke arah dada dengan menekuk siku.',
      'Remas bisep di puncak, lalu turunkan perlahan.'
    ]
  },
  {
    id: 'ex_041',
    name: 'Incline Dumbbell Curl',
    nameIndo: 'Curl Dumbel Bangku Incline',
    muscleGroup: 'Biceps',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 75,
    instructions: [
      'Duduk di bangku incline 45-60 derajat, dumbel menggantung lurus.',
      'Tekuk siku untuk mengangkat beban sambil memutar telapak tangan ke atas.',
      'Turunkan kembali hingga regangan maksimal.'
    ]
  },
  {
    id: 'ex_042',
    name: 'Dumbbell Hammer Curl',
    nameIndo: 'Curl Palu Dumbel Netral',
    muscleGroup: 'Biceps',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Pegang dumbel dengan telapak tangan saling berhadapan.',
      'Tekuk siku mengangkat dumbel ke arah bahu.',
      'Turunkan perlahan tanpa mengubah sudut pegangan.'
    ]
  },
  {
    id: 'ex_043',
    name: 'Tricep Rope Pushdown',
    nameIndo: 'Dorong Tali Kabel Trisep',
    muscleGroup: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Cable',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Kunci siku di samping pinggang, pegang tali kabel.',
      'Dorong ke bawah hingga lengan lurus dan pisahkan ujung tali di bawah.'
    ]
  },
  {
    id: 'ex_044',
    name: 'Skull Crushers',
    nameIndo: 'Ekstensi Trisep Barbel Berbaring',
    muscleGroup: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Barbell',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 90,
    instructions: [
      'Berbaring di bench datar memegang barbel EZ di atas dada.',
      'Tekuk siku menurunkan barbel ke arah dahi/puncak kepala.',
      'Dorong kembali ke atas dengan mengontraksikan trisep.'
    ]
  },

  // CORE
  {
    id: 'ex_050',
    name: 'Hanging Leg Raise',
    nameIndo: 'Angkat Kaki Gantung Palang',
    muscleGroup: 'Core',
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Gantung di palang pull-up tanpa berayun.',
      'Angkat kaki/lutut ke arah dada dengan menggulung panggul ke atas.',
      'Turunkan kembali secara perlahan.'
    ]
  },
  {
    id: 'ex_051',
    name: 'Core Plank',
    nameIndo: 'Plank Lengan Bawah',
    muscleGroup: 'Core',
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    isCustom: false,
    createdBy: null,
    defaultRestSeconds: 60,
    instructions: [
      'Bertumpu pada siku dan ujung jari kaki.',
      'Kunci perut dan bokong hingga tubuh membentuk satu garis lurus sempurna.'
    ]
  }
];

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Core',
  'Full Body',
  'Cardio'
];

export const EQUIPMENTS: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Smith Machine',
  'Kettlebell',
  'Resistance Band'
];

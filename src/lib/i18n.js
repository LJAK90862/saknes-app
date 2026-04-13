// Bilingual translations — Latvian (lv) and English (en)
const translations = {
  // Topbar
  'topbar.back': { lv: '\u2190 Uz s\u0101kumu', en: '\u2190 Back to home' },
  'topbar.now': { lv: 'Tagad', en: 'Now' },
  'topbar.search': { lv: 'Mekl\u0113t \u012bpa\u0161umus\u2026', en: 'Search properties\u2026' },
  'topbar.searchEmpty': { lv: 'Nav atrasts', en: 'No properties found' },
  'topbar.allFamilies': { lv: 'Visas \u0123imenes', en: 'All families' },
  'topbar.myFamily': { lv: 'Mana \u0123imene', en: 'My family' },
  'topbar.add': { lv: '\uFF0B Pievienot', en: '\uFF0B Add Property' },
  'topbar.properties': { lv: '\u012bpa\u0161umi', en: 'properties' },
  'topbar.property': { lv: '\u012bpa\u0161ums', en: 'property' },

  // Header nav
  'nav.properties': { lv: 'Mani \u012bpa\u0161umi', en: 'My Properties' },
  'nav.friends': { lv: 'Draugi', en: 'Friends' },
  'nav.chat': { lv: 'Sarunas', en: 'Chat' },
  'nav.profile': { lv: 'Profils', en: 'Profile' },
  'nav.signin': { lv: 'Ielogoties / Re\u0123istr\u0113ties', en: 'Sign In / Register' },

  // Properties panel
  'props.title': { lv: 'Mani \u012bpa\u0161umi', en: 'My Properties' },
  'props.subtitle': { lv: '\u012apa\u0161umi, ko esat pievienojis kartei', en: 'Properties you have added to the map' },
  'props.empty': { lv: 'V\u0113l nav pievienotu \u012bpa\u0161umu.', en: 'No properties added yet.' },
  'props.addFirst': { lv: '\uFF0B Pievienot pirmo \u012bpa\u0161umu', en: '\uFF0B Add My First Property' },
  'props.edit': { lv: '\u270E Redi\u0123\u0113t', en: '\u270E Edit' },
  'props.delete': { lv: '\uD83D\uDDD1 Dz\u0113st', en: '\uD83D\uDDD1 Delete' },
  'props.view': { lv: '\uD83D\uDDFA Skat\u012bt', en: '\uD83D\uDDFA View' },

  // Profile panel
  'profile.title': { lv: 'Mans profils', en: 'My Profile' },
  'profile.subtitle': { lv: 'J\u016bsu mantojuma profils', en: 'Your heritage profile' },
  'profile.nameLabel': { lv: 'V\u0101rds', en: 'Display Name' },
  'profile.namePlaceholder': { lv: 'J\u016bsu v\u0101rds', en: 'Your name' },
  'profile.bioLabel': { lv: 'Par j\u016bsu saikni ar Latviju', en: 'About your connection to Latvia' },
  'profile.bioPlaceholder': { lv: 'No kura re\u0123iona n\u0101ca j\u016bsu \u0123imene? Kad vi\u0146i emigr\u0113ja?', en: 'Which region did your family come from? When did they emigrate?' },
  'profile.save': { lv: 'Saglab\u0101t profilu', en: 'Save Profile' },
  'profile.signout': { lv: 'Izrakst\u012bties', en: 'Sign Out' },

  // Friends panel
  'friends.title': { lv: 'Mani draugi', en: 'My Connections' },
  'friends.loading': { lv: 'Iel\u0101d\u0113\u2026', en: 'Loading\u2026' },
  'friends.pending': { lv: 'Gaido\u0161ie piepras\u012bjumi', en: 'Pending Requests' },
  'friends.accept': { lv: '\u2713 Pie\u0146emt', en: '\u2713 Accept' },
  'friends.decline': { lv: '\u2715 Noraid\u012bt', en: '\u2715 Decline' },
  'friends.remove': { lv: 'No\u0146emt', en: 'Remove' },
  'friends.empty': { lv: 'V\u0113l nav draugu. Pievienojiet draugu p\u0113c e-pasta, lai redz\u0113tu vi\u0146u \u0123imenes \u012bpa\u0161umus kart\u0113.', en: 'No connections yet. Add a friend by their email to see their family properties on the map.' },
  'friends.addBtn': { lv: '\uFF0B Pievienot draugu', en: '\uFF0B Add a Friend' },
  'friends.add': { lv: '\uFF0B Pievienot', en: '\uFF0B Add' },
  'friends.accepted': { lv: 'Drauga piepras\u012bjums pie\u0146emts', en: 'Friend request accepted' },
  'friends.declined': { lv: 'Piepras\u012bjums noraid\u012bts', en: 'Request declined' },
  'friends.removed': { lv: 'Draugs no\u0146emts', en: 'Friend removed' },

  // Add friend modal
  'addFriend.title': { lv: 'Pievienot draugu', en: 'Add a Friend' },
  'addFriend.subtitle': { lv: 'Mekl\u0113t p\u0113c e-pasta adreses', en: 'Search by email address' },
  'addFriend.label': { lv: 'Drauga e-pasts', en: "Friend's Email" },
  'addFriend.cancel': { lv: 'Atcelt', en: 'Cancel' },
  'addFriend.send': { lv: 'Nos\u016bt\u012bt piepras\u012bjumu', en: 'Send Request' },
  'addFriend.searching': { lv: 'Mekl\u0113\u2026', en: 'Searching\u2026' },
  'addFriend.noEmail': { lv: 'L\u016bdzu ievadiet e-pasta adresi', en: 'Please enter an email address' },
  'addFriend.self': { lv: 'Nevar pievienot sevi', en: "You can't add yourself" },
  'addFriend.notFound': { lv: 'Nav atrasts Saknes lietot\u0101js ar \u0161o e-pastu', en: 'No Saknes user found with that email' },
  'addFriend.already': { lv: 'Jau ir draugi', en: 'Already friends' },
  'addFriend.pending': { lv: 'Piepras\u012bjums jau nos\u016bt\u012bts', en: 'Request already sent' },
  'addFriend.failed': { lv: 'Neizdev\u0101s nos\u016bt\u012bt piepras\u012bjumu', en: 'Failed to send request' },
  'addFriend.sent': { lv: 'Piepras\u012bjums nos\u016bt\u012bts', en: 'Friend request sent' },

  // Chat panel
  'chat.title': { lv: 'Sarunas', en: 'Chat' },
  'chat.subtitle': { lv: 'Rakstiet saviem draugiem', en: 'Message your connections' },
  'chat.empty': { lv: 'V\u0113l nav sarunu. Pievienojiet draugu un s\u0101ciet sarun\u0101ties par kop\u012bgo mantojumu.', en: 'No conversations yet. Add a friend and start chatting about your shared heritage.' },
  'chat.noMessages': { lv: 'V\u0113l nav zi\u0146u. Sakiet sveiki!', en: 'No messages yet. Say hello!' },
  'chat.placeholder': { lv: 'Rakst\u012bt zi\u0146u\u2026', en: 'Type a message\u2026' },
  'chat.send': { lv: 'S\u016bt\u012bt', en: 'Send' },
  'chat.sendFailed': { lv: 'Neizdev\u0101s nos\u016bt\u012bt', en: 'Failed to send' },

  // Auth modal
  'auth.title': { lv: 'Laipni l\u016bgti Saknes', en: 'Welcome to Saknes' },
  'auth.subtitle': { lv: 'Ielogoties, lai pievienotu un p\u0101rvald\u012btu savus \u0123imenes \u012bpa\u0161umus', en: 'Sign in to add and manage your family properties' },
  'auth.tabSignin': { lv: 'Ielogoties', en: 'Sign In' },
  'auth.tabRegister': { lv: 'Re\u0123istr\u0113ties', en: 'Register' },
  'auth.email': { lv: 'E-pasta adrese', en: 'Email Address' },
  'auth.password': { lv: 'Parole', en: 'Password' },
  'auth.name': { lv: 'J\u016bsu v\u0101rds (neoblig\u0101ti)', en: 'Your Name (optional)' },
  'auth.namePlaceholder': { lv: 'K\u0101 v\u0113laties b\u016bt paz\u012bstams', en: "How you'd like to be known" },
  'auth.signinBtn': { lv: 'Ielogoties', en: 'Sign In' },
  'auth.registerBtn': { lv: 'Izveidot kontu', en: 'Create Account' },
  'auth.wait': { lv: 'L\u016bdzu gaidiet\u2026', en: 'Please wait\u2026' },
  'auth.required': { lv: 'L\u016bdzu ievadiet e-pastu un paroli.', en: 'Please enter your email and password.' },
  'auth.checkEmail': { lv: 'P\u0101rbaudiet e-pastu, lai apstiprin\u0101tu kontu, tad ielogoties.', en: 'Check your email to confirm your account, then sign in.' },
  'auth.signedIn': { lv: '\u2713 Ielogoj\u0101ties', en: '\u2713 Signed in' },

  // Toasts
  'toast.profileSaved': { lv: 'Profils saglab\u0101ts', en: 'Profile saved' },
  'toast.profileError': { lv: 'K\u013c\u016bda saglab\u0101jot', en: 'Error saving profile' },
  'toast.signedOut': { lv: 'Izrakst\u012bj\u0101ties', en: 'Signed out' },
  'toast.deleted': { lv: 'Dz\u0113sts', en: 'Deleted' },
  'toast.deleteError': { lv: 'Nevar\u0113ja dz\u0113st', en: 'Could not delete' },
  'toast.updated': { lv: '\u2713 Atjaunin\u0101ts', en: '\u2713 Updated' },
  'toast.added': { lv: '\u2713 \u012apa\u0161ums pievienots!', en: '\u2713 Property added!' },
  'toast.saveError': { lv: 'K\u013c\u016bda saglab\u0101jot', en: 'Error saving' },
  'toast.noAddress': { lv: 'L\u016bdzu ievadiet adresi', en: 'Please enter an address' },
  'toast.noLocation': { lv: 'L\u016bdzu nospiediet uz kartes', en: 'Please click the map to set a location' },
  'toast.signInFirst': { lv: 'L\u016bdzu ielogoties, lai pievienotu \u012bpa\u0161umu', en: 'Please sign in to add a property' },

  // Property modal
  'propModal.addTitle': { lv: 'Pievienot \u0123imenes \u012bpa\u0161umu', en: 'Add Your Family Property' },
  'propModal.editTitle': { lv: 'Redi\u0123\u0113t \u012bpa\u0161umu', en: 'Edit Property' },
  'propModal.subtitle': { lv: 'Pievienot \u0123imenes \u012bpa\u0161umu \xb7 Add a property to the heritage map', en: 'Add a property to the heritage map' },
  'propModal.photo': { lv: '\u012apa\u0161uma foto', en: 'Property Photo' },
  'propModal.photoUpload': { lv: 'Noklik\u0161\u0137iniet, lai aug\u0161upiel\u0101d\u0113tu foto', en: 'Click to upload a photo' },
  'propModal.photoSub': { lv: 'V\u0113sturiska vai jauna \u2014 jebkur\u0161 att\u0113ls', en: 'Historical or recent \u2014 any image of the property' },
  'propModal.details': { lv: '\u012apa\u0161uma deta\u013cas', en: 'Property Details' },
  'propModal.address': { lv: 'Adrese vai vietas nosaukums', en: 'Address or Place Name' },
  'propModal.addressPlaceholder': { lv: 'piem. R\u012bgas iela 12, C\u0113sis', en: 'e.g. R\u012bgas iela 12, C\u0113sis' },
  'propModal.parish': { lv: 'Pagasts / Re\u0123ions', en: 'Parish / Region' },
  'propModal.parishPlaceholder': { lv: 'piem. C\u0113su pagasts', en: 'e.g. C\u0113su pagasts' },
  'propModal.period': { lv: 'Periods (gadi)', en: 'Period (years)' },
  'propModal.periodPlaceholder': { lv: 'piem. 1890\u20131944', en: 'e.g. 1890\u20131944' },
  'propModal.families': { lv: '\u0122imenes uzv\u0101rdi', en: 'Family Names' },
  'propModal.familiesHint': { lv: 'Pievienojiet katru \u0123imeni (ar gadiem, ja zin\u0101ms)', en: 'Add each family that lived here (with years if known)' },
  'propModal.addFamily': { lv: '\uFF0B Pievienot citu \u0123imeni', en: '\uFF0B Add another family' },
  'propModal.occupation': { lv: 'Nodarbo\u0161an\u0101s / Amats', en: 'Occupation / Trade' },
  'propModal.occupationPlaceholder': { lv: 'piem. Zemnieks, Kal\u0113js', en: 'e.g. Farmer, Blacksmith' },
  'propModal.notes': { lv: 'Papildu piez\u012bmes', en: 'Additional Notes' },
  'propModal.notesPlaceholder': { lv: 'Jebk\u0101da papildu v\u0113sture vai konteksts\u2026', en: 'Any additional history, stories, or context\u2026' },
  'propModal.location': { lv: 'Atra\u0161an\u0101s vieta kart\u0113', en: 'Location on Map' },
  'propModal.locationHint': { lv: 'Noklik\u0161\u0137iniet uz kartes, lai atz\u012bm\u0113tu atra\u0161an\u0101s vietu', en: 'Click on the map below to pin the property location' },
  'propModal.noLocation': { lv: 'Nav izv\u0113l\u0113ta atra\u0161an\u0101s vieta', en: 'No location selected \u2014 click the map above' },
  'propModal.cancel': { lv: 'Atcelt', en: 'Cancel' },
  'propModal.submit': { lv: 'Iesniegt kartei', en: 'Submit to Map' },
  'propModal.save': { lv: 'Saglab\u0101t izmai\u0146as', en: 'Save Changes' },
  'propModal.saving': { lv: 'Saglab\u0101\u2026', en: 'Saving\u2026' },

  // Delete modal
  'delete.title': { lv: 'Dz\u0113st \u0161o \u012bpa\u0161umu?', en: 'Delete this property?' },
  'delete.subtitle': { lv: 'To nevar atsaukt', en: 'This cannot be undone' },
  'delete.body': { lv: '\u0160is neatgriezeniski no\u0146ems \u012bpa\u0161umu un visus saist\u012btos \u0123imenes ierakstus no kartes.', en: 'This will permanently remove the property and all associated family records from the map.' },
  'delete.cancel': { lv: 'Atcelt', en: 'Cancel' },
  'delete.confirm': { lv: 'Dz\u0113st', en: 'Delete' },
}

export function t(key, lang = 'lv') {
  const entry = translations[key]
  if (!entry) return key
  return entry[lang] || entry.en || key
}

export const LANGUAGES = [
  { code: 'lv', label: 'LV' },
  { code: 'en', label: 'EN' },
]

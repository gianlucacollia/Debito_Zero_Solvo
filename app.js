// ==================== CONFIGURAZIONE EMAIL ====================
// 🔧 ISTRUZIONI: Segui la guida in CONFIGURAZIONE-COMPLETA.txt per configurare EmailJS
const EMAIL_CONFIG = {
  serviceId: 'service_ok3g5iy',      // ← Service ID da EmailJS
  templateId: 'template_1p0r597',    // ← Template ID per richieste clienti → TEAM TATOSOLVI
  templateIdConfirmation: 'template_cp9rxvj',  // ← Template ID per email conferma CLIENTE
  templateIdAppointment: 'template_v4ixmnr',    // ← Template ID per prenotazioni (usa lo stesso o crea uno separato)
  templateIdReview: 'template_v4ixmnr', // ← Template per feedback verifica professionisti
  templateIdProAutoReply: 'template_v4ixmnr', // ← Template auto-reply candidature professionisti
  templateIdProApplication: 'template_v4ixmnr', // ← Template ID per candidature professionisti
  publicKey: 'wrPtIJWjgaySCJWjZ',      // ← Public Key da EmailJS
  recipientEmail: 'gianluca.collia@gmail.com'  // ← Email dove ricevere le richieste
};

// ==================== CONFIGURAZIONE ANALYTICS ====================
const ANALYTICS_CONFIG = {
  measurementId: 'G-XXXXXXXXXX' // ← sostituisci con il tuo Measurement ID reale
};

// ==================== CONFIGURAZIONE SUPABASE ====================
// 🔧 ISTRUZIONI: Segui la guida in CONFIGURAZIONE-COMPLETA.txt per configurare Supabase
let supabase = null;
if (window.supabase && window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.url !== 'https://xxxxx.supabase.co') {
  try {
    supabase = window.supabase.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey
    );
    console.log('✅ Supabase inizializzato');
  } catch (e) {
    console.error('❌ Errore inizializzazione Supabase:', e);
  }
} else {
  console.warn('⚠️ Supabase non configurato. I documenti verranno salvati in localStorage.');
}

const SupabaseService = {
  isReady: () => Boolean(supabase),
  
  saveClientRequest: async (request) => {
    if (!supabase) return { error: 'Supabase non disponibile' };
    try {
      const payload = {
        name: request.name || '',
        surname: request.surname || '',
        email: request.email || '',
        phone: request.phone || '',
        city: request.city || '',
        province: request.province || '',
        cap: request.cap || '',
        debt_types: request.debtTypes || '',
        debt_details: request.debtDetails || '',
        total_amount: request.totalAmountNumber || 0,
        monthly_income: request.monthlyIncome || null, // Reddito mensile netto
        submission_date: request.dateISO || new Date().toISOString()
      };
      return await supabase.from('client_requests').insert([payload]);
    } catch (error) {
      console.error('Errore salvataggio Supabase (client_requests):', error);
      return { error };
    }
  },
  
  fetchClientRequests: async () => {
    if (!supabase) return { data: null, error: 'Supabase non disponibile' };
    try {
      const { data, error } = await supabase
        .from('client_requests')
        .select('*')
        .order('submission_date', { ascending: false });
      return { data, error };
    } catch (error) {
      console.error('Errore lettura Supabase (client_requests):', error);
      return { data: null, error };
    }
  },
  
  saveProfessionalApplication: async (application) => {
    if (!supabase) return { error: 'Supabase non disponibile' };
    try {
      const payload = {
        name: application.name || '',
        surname: application.surname || '',
        email: application.email || '',
        phone: application.phone || '',
        city: application.city || '',
        province: application.province || '',
        cap: application.cap || '',
        specialty: application.specialty || '',
        experience: application.experience || null,
        notes: application.notes || '',
        attachment_links: application.attachmentLinks || '',
        status: application.status || 'in_review',
        review_feedback: application.reviewFeedback || '',
        reviewed_at: application.reviewedAt || null,
        submission_date: application.dateISO || new Date().toISOString()
      };
      return await supabase.from('professional_applications').insert([payload]);
    } catch (error) {
      console.error('Errore salvataggio Supabase (professional_applications):', error);
      return { error };
    }
  },
  
  fetchProfessionalApplications: async () => {
    if (!supabase) return { data: null, error: 'Supabase non disponibile' };
    try {
      const { data, error } = await supabase
        .from('professional_applications')
        .select('*')
        .order('submission_date', { ascending: false });
      return { data, error };
    } catch (error) {
      console.error('Errore lettura Supabase (professional_applications):', error);
      return { data: null, error };
    }
  },
  
  updateProfessionalApplication: async (id, updates) => {
    if (!supabase) return { error: 'Supabase non disponibile' };
    try {
      return await supabase
        .from('professional_applications')
        .update(updates)
        .eq('id', id);
    } catch (error) {
      console.error('Errore aggiornamento Supabase (professional_applications):', error);
      return { error };
    }
  }
};

// ==================== APP STATE ====================
const state = {
  currentStep: 1,
  selections: [],
  debtCreditors: {}, // { banche_finanziarie: [{ subCategory: '', creditor: '', amount: 0 }, ...], ... }
  formData: {}
};

// ==================== DEBT TYPE LABELS ====================
const DEBT_LABELS = {
  banche_finanziarie: 'Debiti bancari e finanziari',
  fiscali_tributari: 'Debiti fiscali e tributari',
  previdenziali: 'Debiti contributivi e previdenziali',
  utenze_servizi: 'Utenze e servizi ricorrenti',
  procedure_esecutive: 'Procedure esecutive e recupero crediti',
  altro: 'Altre situazioni particolari'
};

const DEBT_SUBCATEGORIES = {
  banche_finanziarie: [
    { value: 'mutuo_ipotecario', label: 'Mutuo ipotecario' },
    { value: 'prestito_personale', label: 'Prestito personale' },
    { value: 'carte_revolving', label: 'Carte di credito / revolving' },
    { value: 'leasing_finanziario', label: 'Leasing o noleggio finanziario' },
    { value: 'fidi_aziendali', label: 'Fidi e affidamenti aziendali' }
  ],
  fiscali_tributari: [
    { value: 'iva', label: 'IVA' },
    { value: 'irpef_ires', label: 'IRPEF / IRES' },
    { value: 'imu_tasi', label: 'IMU / TASI' },
    { value: 'cartelle_esattoriali', label: 'Cartelle esattoriali' },
    { value: 'avvisi_bonari', label: 'Avvisi bonari' }
  ],
  previdenziali: [
    { value: 'inps_dipendenti', label: 'INPS dipendenti' },
    { value: 'inps_gestione_separata', label: 'INPS gestione separata' },
    { value: 'inail', label: 'INAIL' },
    { value: 'casse_professionali', label: 'Casse professionali' },
    { value: 'fondi_pensione', label: 'Fondi pensione' }
  ],
  utenze_servizi: [
    { value: 'energia_gas', label: 'Energia e gas' },
    { value: 'acqua', label: 'Servizio idrico' },
    { value: 'telefonia_internet', label: 'Telefonia e internet' },
    { value: 'servizi_digitali', label: 'Servizi digitali / SaaS' },
    { value: 'altri_servizi', label: 'Altri servizi ricorrenti' }
  ],
  procedure_esecutive: [
    { value: 'pignoramento_conto', label: 'Pignoramento conto corrente' },
    { value: 'pignoramento_quinto', label: 'Pignoramento del quinto' },
    { value: 'ipoteca_giudiziale', label: 'Ipoteca giudiziale' },
    { value: 'decreto_ingiuntivo', label: 'Decreto ingiuntivo' },
    { value: 'crediti_servicer', label: 'Crediti gestiti da servicer' }
  ],
  altro: [
    { value: 'garanzie', label: 'Garanzie / fideiussioni' },
    { value: 'societa', label: 'Impegni societari / cooperative' },
    { value: 'estero', label: 'Debiti con enti esteri' },
    { value: 'informali', label: 'Prestiti informali / personali' }
  ]
};

const ITALIAN_PROVINCES = [
  { code: 'AG', name: 'Agrigento' },
  { code: 'AL', name: 'Alessandria' },
  { code: 'AN', name: 'Ancona' },
  { code: 'AO', name: 'Aosta' },
  { code: 'AQ', name: "L'Aquila" },
  { code: 'AR', name: 'Arezzo' },
  { code: 'AP', name: 'Ascoli Piceno' },
  { code: 'AT', name: 'Asti' },
  { code: 'AV', name: 'Avellino' },
  { code: 'BA', name: 'Bari' },
  { code: 'BT', name: 'Barletta-Andria-Trani' },
  { code: 'BL', name: 'Belluno' },
  { code: 'BN', name: 'Benevento' },
  { code: 'BG', name: 'Bergamo' },
  { code: 'BI', name: 'Biella' },
  { code: 'BO', name: 'Bologna' },
  { code: 'BZ', name: 'Bolzano' },
  { code: 'BS', name: 'Brescia' },
  { code: 'BR', name: 'Brindisi' },
  { code: 'CA', name: 'Cagliari' },
  { code: 'CL', name: 'Caltanissetta' },
  { code: 'CB', name: 'Campobasso' },
  { code: 'CE', name: 'Caserta' },
  { code: 'CT', name: 'Catania' },
  { code: 'CZ', name: 'Catanzaro' },
  { code: 'CH', name: 'Chieti' },
  { code: 'CO', name: 'Como' },
  { code: 'CS', name: 'Cosenza' },
  { code: 'CR', name: 'Cremona' },
  { code: 'KR', name: 'Crotone' },
  { code: 'CN', name: 'Cuneo' },
  { code: 'EN', name: 'Enna' },
  { code: 'FM', name: 'Fermo' },
  { code: 'FE', name: 'Ferrara' },
  { code: 'FI', name: 'Firenze' },
  { code: 'FG', name: 'Foggia' },
  { code: 'FC', name: 'Forlì-Cesena' },
  { code: 'FR', name: 'Frosinone' },
  { code: 'GE', name: 'Genova' },
  { code: 'GO', name: 'Gorizia' },
  { code: 'GR', name: 'Grosseto' },
  { code: 'IM', name: 'Imperia' },
  { code: 'IS', name: 'Isernia' },
  { code: 'SP', name: 'La Spezia' },
  { code: 'LT', name: 'Latina' },
  { code: 'LE', name: 'Lecce' },
  { code: 'LC', name: 'Lecco' },
  { code: 'LI', name: 'Livorno' },
  { code: 'LO', name: 'Lodi' },
  { code: 'LU', name: 'Lucca' },
  { code: 'MC', name: 'Macerata' },
  { code: 'MN', name: 'Mantova' },
  { code: 'MS', name: 'Massa-Carrara' },
  { code: 'MT', name: 'Matera' },
  { code: 'ME', name: 'Messina' },
  { code: 'MI', name: 'Milano' },
  { code: 'MB', name: 'Monza e Brianza' },
  { code: 'MO', name: 'Modena' },
  { code: 'NA', name: 'Napoli' },
  { code: 'NO', name: 'Novara' },
  { code: 'NU', name: 'Nuoro' },
  { code: 'OR', name: 'Oristano' },
  { code: 'PD', name: 'Padova' },
  { code: 'PA', name: 'Palermo' },
  { code: 'PR', name: 'Parma' },
  { code: 'PV', name: 'Pavia' },
  { code: 'PG', name: 'Perugia' },
  { code: 'PU', name: 'Pesaro e Urbino' },
  { code: 'PE', name: 'Pescara' },
  { code: 'PC', name: 'Piacenza' },
  { code: 'PI', name: 'Pisa' },
  { code: 'PT', name: 'Pistoia' },
  { code: 'PN', name: 'Pordenone' },
  { code: 'PZ', name: 'Potenza' },
  { code: 'PO', name: 'Prato' },
  { code: 'RG', name: 'Ragusa' },
  { code: 'RA', name: 'Ravenna' },
  { code: 'RC', name: 'Reggio Calabria' },
  { code: 'RE', name: 'Reggio Emilia' },
  { code: 'RI', name: 'Rieti' },
  { code: 'RN', name: 'Rimini' },
  { code: 'RM', name: 'Roma' },
  { code: 'RO', name: 'Rovigo' },
  { code: 'SA', name: 'Salerno' },
  { code: 'SS', name: 'Sassari' },
  { code: 'SV', name: 'Savona' },
  { code: 'SI', name: 'Siena' },
  { code: 'SR', name: 'Siracusa' },
  { code: 'SO', name: 'Sondrio' },
  { code: 'SU', name: 'Sud Sardegna' },
  { code: 'TA', name: 'Taranto' },
  { code: 'TE', name: 'Teramo' },
  { code: 'TR', name: 'Terni' },
  { code: 'TO', name: 'Torino' },
  { code: 'TP', name: 'Trapani' },
  { code: 'TN', name: 'Trento' },
  { code: 'TV', name: 'Treviso' },
  { code: 'TS', name: 'Trieste' },
  { code: 'UD', name: 'Udine' },
  { code: 'VA', name: 'Varese' },
  { code: 'VE', name: 'Venezia' },
  { code: 'VB', name: 'Verbano-Cusio-Ossola' },
  { code: 'VC', name: 'Vercelli' },
  { code: 'VR', name: 'Verona' },
  { code: 'VV', name: 'Vibo Valentia' },
  { code: 'VI', name: 'Vicenza' },
  { code: 'VT', name: 'Viterbo' }
];

const Geo = {
  getProvinceLabel: (code) => {
    if (!code) return '';
    const province = ITALIAN_PROVINCES.find(p => p.code === code);
    return province ? `${province.name} (${province.code})` : code;
  },
  
  getProvinceOptions: () => {
    const options = ['<option value="">Seleziona provincia</option>'];
    ITALIAN_PROVINCES.forEach(province => {
      options.push(`<option value="${province.code}">${province.name} (${province.code})</option>`);
    });
    return options.join('');
  },
  
  populateProvinceSelects: () => {
    const options = Geo.getProvinceOptions();
    document.querySelectorAll('[data-province-select]').forEach(select => {
      if (!select) return;
      const previousValue = select.value;
      select.innerHTML = options;
      if (previousValue) {
        select.value = previousValue;
      }
    });
  }
};

// ==================== UTILITY: Generate Availability ====================
const generateAvailability = (days = 30) => {
  const slots = [];
  const today = new Date();
  
  for (let day = 0; day < days; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    // Skip weekends (sabato = 6, domenica = 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: meno disponibilità
      if (Math.random() > 0.7) continue; // 30% chance di avere slot
    }
    
    // Genera 2-4 slot casuali per giorno (9:00-18:00)
    const numSlots = Math.floor(Math.random() * 3) + 2;
    const daySlots = [];
    
    for (let i = 0; i < numSlots; i++) {
      const hour = Math.floor(Math.random() * 9) + 9; // 9-17
      const minute = Math.random() > 0.5 ? 0 : 30;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      if (!daySlots.includes(time)) {
        daySlots.push(time);
      }
    }
    
    if (daySlots.length > 0) {
      daySlots.sort();
      
      slots.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('it-IT', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('it-IT', { month: 'short' }),
        times: daySlots
      });
    }
  }
  
  return slots;
};

// ==================== UTILITY: Generate Career & Strengths ====================
const generateCareerData = (name, specialty, desc, services) => {
  const careers = {
    "Avv.": {
      career: `Avvocato iscritto all'Albo, con consolidata esperienza in ${specialty.toLowerCase()}. Laureato in Giurisprudenza, ha maturato competenze approfondite nella ${desc.toLowerCase()}. Partecipa regolarmente a corsi di aggiornamento e convegni specialistici.`,
      strengths: [specialty, desc.split('.')[0], services.split(' • ')[0], "Approfondita esperienza"]
    },
    "Dott.": {
      career: `Commercialista iscritto all'Ordine, specializzato in ${specialty.toLowerCase()}. Con anni di esperienza nella ${desc.toLowerCase()}, supporta clienti privati e aziende nella gestione della crisi debitoria.`,
      strengths: [specialty, "Consulenza personalizzata", services.split(' • ')[0], "Esperienza consolidata"]
    },
    "Dott.ssa": {
      career: `Professionista certificata, esperta in ${specialty.toLowerCase()}. Con un approccio metodico e attento ai dettagli, si occupa di ${desc.toLowerCase()}. Forte di una solida formazione continua.`,
      strengths: [specialty, "Metodologia consolidata", services.split(' • ')[0], "Cura del dettaglio"]
    },
    "OCC": {
      career: `Gestore crisi certificato OCC, abilitato alla gestione delle procedure di sovraindebitamento. Con esperienza nella ${desc.toLowerCase()}, accompagna i clienti attraverso tutto il percorso.`,
      strengths: ["Certificazione OCC", specialty, "Procedure complete", "Supporto continuo"]
    }
  };
  
  const prefix = name.split(' ')[0];
  const data = careers[prefix] || {
    career: `Professionista esperto in ${specialty.toLowerCase()}, specializzato nella ${desc.toLowerCase()}.`,
    strengths: [specialty, services.split(' • ')[0], "Competenza specialistica"]
  };
  
  return data;
};

// Make PROFESSIONALS_DATA available globally for structured data
window.PROFESSIONALS_DATA = null;

// ==================== PROFESSIONALS DATA ====================
const PROFESSIONALS_DATA = [
  { 
    name: "Gianluca Collia",
    specialty: "Consulente Gestione Crisi Debitoria",
    services: "Analisi debito • Piani personalizzati • Mediazione crediti",
    price: 400,
    desc: "Consulente esperto in analisi situazioni debitorie e progettazione soluzioni personalizzate per famiglie e imprese.",
    career: "Consulente specializzato nella gestione delle crisi debitorie, con anni di esperienza nel supporto a famiglie e aziende. Approccio personalizzato per trovare soluzioni sostenibili.",
    strengths: ["Analisi situazione debitoria", "Piani personalizzati", "Mediazione crediti", "Supporto continuo"],
    tags: ["bancari", "fiscali", "privati", "aziende"],
    calendarLink: "https://calendar.google.com/calendar/u/0?cid=Z2lhbmx1Y2EuY29sbGlhQGdvYnJhdm8uaXQ",
    email: "gianluca.collia@gmail.com",
    loginUsername: "gianluca90",
    loginPassword: "gianluca90",
    city: "Milano",
    province: "MI",
    cap: "20124"
  },
  { 
    name: "Avv. Elena Rossi",
    specialty: "Avvocato Specializzato in Diritto Tributario e Fallimentare",
    services: "Contenzioso tributario • Procedure concorsuali • Saldo e stralcio",
    price: 550,
    desc: "Avvocato con consolidata esperienza in diritto tributario e procedure concorsuali. Supporta privati e imprese nella risoluzione di situazioni debitorie complesse attraverso percorsi legali strutturati.",
    career: "Laureata in Giurisprudenza con lode, iscritta all'Albo degli Avvocati. Specializzata in diritto tributario e fallimentare, ha maturato oltre 15 anni di esperienza nel contenzioso con Agenzia delle Entrate, Equitalia e procedure concorsuali. Ha assistito centinaia di clienti in procedure di saldo e stralcio, composizione delle crisi e rinegoziazione debiti.",
    strengths: ["Contenzioso tributario", "Procedure concorsuali", "Saldo e stralcio", "Mediazione crediti", "Esperienza consolidata"],
    tags: ["fiscali", "bancari", "privati", "aziende"],
    calendarLink: "https://calendar.google.com/calendar/u/0?cid=ZWxlbmEucm9zc2lAZXhhbXBsZS5jb20",
    email: "elena.rossi@studiolegale.it",
    loginUsername: "elenarossi",
    loginPassword: "elena2024",
    city: "Roma",
    province: "RM",
    cap: "00186"
  },
  { 
    name: "Avv. Marco Rossi", 
    specialty: "Diritto bancario", 
    services: "Opposizioni • Decreti ingiuntivi", 
    price: 450, 
    desc: "Specializzato in contenziosi bancari e tutela del debitore.",
    career: "Avvocato iscritto all'Albo dal 2010, con oltre 13 anni di esperienza nel diritto bancario. Ha gestito oltre 500 pratiche di opposizione a decreti ingiuntivi con tasso di successo del 85%. Laureato in Giurisprudenza all'Università di Milano con lode.",
    strengths: ["Opposizioni decreti ingiuntivi", "Tutela consumatori", "Contenzioso bancario", "Esperienza 13+ anni"],
    tags: ["bancari", "privati"],
    availability: generateAvailability()
  },
  { name: "Dott. Giuseppe Bianchi", specialty: "Commercialista", services: "Piani rientro • Transazioni fiscali", price: 500, desc: "Gestione crisi d'impresa e accordi con Agenzia Entrate.", tags: ["fiscali", "aziende"] },
  { name: "Avv. Laura Ferrari", specialty: "Diritto civile", services: "Saldo e stralcio • Negoziazioni", price: 400, desc: "Esperta in accordi bonari con istituti di credito.", tags: ["bancari", "privati"] },
  { name: "Dott.ssa Anna Romano", specialty: "OCC Certificato", services: "Legge 3/2012 • Piano consumatore", price: 600, desc: "Gestore crisi da sovraindebitamento certificato.", tags: ["fiscali", "privati"] },
  { name: "Avv. Francesco Costa", specialty: "Diritto fallimentare", services: "Procedure concorsuali", price: 750, desc: "Assistenza in procedure fallimentari e concordati.", tags: ["aziende", "fiscali"] },
  { name: "Dott. Matteo Greco", specialty: "Consulente finanziario", services: "Ristrutturazione debiti", price: 350, desc: "Analisi sostenibilità e piani di rientro personalizzati.", tags: ["bancari", "privati"] },
  { name: "Avv. Silvia Conti", specialty: "Diritto bancario", services: "Pignoramenti • Opposizioni", price: 480, desc: "Difesa da azioni esecutive e recupero crediti.", tags: ["bancari", "privati"] },
  { name: "Dott. Paolo Ricci", specialty: "Commercialista", services: "Accordi AE-R • INPS", price: 520, desc: "Specialista in rateizzazioni e transazioni fiscali.", tags: ["fiscali", "aziende"] },
  { name: "Avv. Elena Marino", specialty: "Mediatore creditizio", services: "Consolidamento • Surroga", price: 300, desc: "Mediazione con istituti per rifinanziamenti vantaggiosi.", tags: ["bancari", "privati", "aziende"] },
  { name: "Dott.ssa Chiara Gallo", specialty: "Esperta sovraindebitamento", services: "Esdebitazione • Piani accordo", price: 580, desc: "Procedure Legge 3/2012 per famiglie e partite IVA.", tags: ["fiscali", "privati"] },
  { name: "Avv. Roberto Bruno", specialty: "Diritto tributario", services: "Contenzioso fiscale", price: 650, desc: "Ricorsi contro cartelle esattoriali e avvisi bonari.", tags: ["fiscali", "aziende"] },
  { name: "Dott. Andrea Fontana", specialty: "Consulente debiti", services: "Negoziazioni con servicer", price: 250, desc: "Trattative dirette con società recupero crediti.", tags: ["bancari", "privati"] },
  { name: "Avv. Valentina Colombo", specialty: "Diritto civile e bancario", services: "Tutela consumatori", price: 420, desc: "Difesa da pratiche scorrette e usura bancaria.", tags: ["bancari", "privati"] },
  { name: "Dott.ssa Francesca Esposito", specialty: "Commercialista", services: "182-bis • Ristrutturazioni", price: 550, desc: "Piani ristrutturazione debiti tributari per PMI.", tags: ["fiscali", "aziende"] },
  { name: "Avv. Stefano Rizzo", specialty: "Diritto fallimentare", services: "Concordati preventivi", price: 800, desc: "Assistenza in concordati e accordi di ristrutturazione.", tags: ["aziende", "fiscali", "bancari"] },
  { name: "Dott. Luca Moretti", specialty: "Mediatore finanziario", services: "Consolidamento prestiti", price: 320, desc: "Unificazione debiti e riduzione rate mensili.", tags: ["bancari", "privati"] },
  { name: "Avv. Giulia Barbieri", specialty: "Diritto bancario", services: "Opposizioni esecutive", price: 460, desc: "Blocco pignoramenti su stipendi e conti correnti.", tags: ["bancari", "privati"] },
  { name: "Dott.ssa Maria Fabbri", specialty: "OCC Gestore crisi", services: "Composizione crisi", price: 620, desc: "Liquidazione controllata e accordo con creditori.", tags: ["fiscali", "privati", "aziende"] },
  { name: "Avv. Antonio De Luca", specialty: "Diritto civile", services: "Saldo e stralcio", price: 380, desc: "Definizioni agevolate con banche e finanziarie.", tags: ["bancari", "privati"] },
  { name: "Dott. Giorgio Santoro", specialty: "Commercialista", services: "Piani rateali AE", price: 490, desc: "Rateizzazioni fino a 72 mesi con Agenzia Entrate.", tags: ["fiscali", "privati", "aziende"] },
  { name: "Avv. Alessia Marini", specialty: "Diritto tributario", services: "Contenzioso • Ricorsi", price: 680, desc: "Impugnazioni cartelle e difesa in commissioni tributarie.", tags: ["fiscali", "aziende"] },
  { name: "Dott.ssa Serena Ferrara", specialty: "Consulente crisi", services: "Analisi debito • Soluzioni", price: 280, desc: "Valutazione completa situazione debitoria e strategie.", tags: ["bancari", "privati"] },
  { name: "Avv. Davide Lombardi", specialty: "Diritto fallimentare", services: "Accordi ristrutturazione", price: 720, desc: "Negoziazione con creditori per salvataggio impresa.", tags: ["aziende", "fiscali"] },
  { name: "Dott. Simone Caruso", specialty: "Mediatore creditizio", services: "Surroga • Cessione quinto", price: 340, desc: "Soluzioni alternative per dipendenti e pensionati.", tags: ["bancari", "privati"] },
  { name: "Avv. Monica Vitale", specialty: "Diritto bancario", services: "Anatocismo • Usura", price: 500, desc: "Verifiche su interessi illegittimi e rimborsi.", tags: ["bancari", "privati"] },
  { name: "Dott.ssa Paola Riva", specialty: "Commercialista", services: "Transazioni fiscali", price: 530, desc: "Accordi con fisco per riduzione debiti tributari.", tags: ["fiscali", "aziende"] },
  { name: "Avv. Massimo Gatti", specialty: "Diritto civile", services: "Opposizioni decreti", price: 440, desc: "Difesa da decreti ingiuntivi e precetti.", tags: ["bancari", "privati", "aziende"] },
  { name: "Dott. Claudio Mancini", specialty: "Esperto sovraindebitamento", services: "Piano del consumatore", price: 590, desc: "Liquidazione patrimonio e esdebitazione finale.", tags: ["fiscali", "privati"] },
  { name: "Avv. Federica Pellegrini", specialty: "Diritto tributario", services: "Difesa contribuente", price: 620, desc: "Tutela da accertamenti e riscossioni aggressive.", tags: ["fiscali", "aziende"] },
  { name: "Dott.ssa Lucia Monti", specialty: "Consulente finanziario", services: "Budget familiare • Piani", price: 200, desc: "Riorganizzazione finanze personali e familiari.", tags: ["privati"] },
  { name: "Avv. Nicola Ferretti", specialty: "Diritto fallimentare", services: "Crisi d'impresa", price: 850, desc: "Gestione completa procedure concorsuali PMI.", tags: ["aziende", "fiscali", "bancari"] },
  { name: "Dott. Emanuele Sala", specialty: "Commercialista", services: "Piani risanamento", price: 560, desc: "Recupero equilibrio economico-finanziario aziende.", tags: ["fiscali", "aziende"] },
  { name: "Avv. Sara Benedetti", specialty: "Diritto bancario", services: "Revocatorie • Surroghe", price: 470, desc: "Azioni di recupero e portabilità mutui/prestiti.", tags: ["bancari", "privati"] },
  { name: "Dott.ssa Veronica Martini", specialty: "OCC Certificato", services: "Accordo composizione", price: 640, desc: "Mediazione con creditori per accordo stragiudiziale.", tags: ["fiscali", "privati", "aziende"] },
  { name: "Avv. Alberto Rossini", specialty: "Diritto civile", services: "Estinzione debiti", price: 390, desc: "Trattative per chiusura posizioni debitorie.", tags: ["bancari", "privati"] },
  { name: "Dott. Pietro Serra", specialty: "Consulente debiti", services: "Negoziazioni servicer", price: 260, desc: "Accordi con Cerved, Italfondiario, Kruk e altri.", tags: ["bancari", "privati"] },
  { name: "Avv. Cristina Donati", specialty: "Diritto tributario", services: "Annullamenti cartelle", price: 600, desc: "Istanze autotutela e sgravi fiscali.", tags: ["fiscali", "aziende", "privati"] },
  { name: "Dott.ssa Elisa Marchi", specialty: "Commercialista", services: "Rateizzazioni INPS", price: 480, desc: "Piani pagamento contributi previdenziali arretrati.", tags: ["fiscali", "aziende"] },
  { name: "Avv. Riccardo Tosi", specialty: "Diritto fallimentare", services: "Concordati semplificati", price: 700, desc: "Procedure veloci per piccole imprese.", tags: ["aziende", "fiscali"] },
  { name: "Dott. Lorenzo Parisi", specialty: "Mediatore creditizio", services: "Prestiti consolidamento", price: 310, desc: "Accesso a finanziamenti per unificare debiti.", tags: ["bancari", "privati"] },
  { name: "Avv. Beatrice Castelli", specialty: "Diritto bancario", services: "Difesa consumatori", price: 430, desc: "Class action e azioni collettive contro banche.", tags: ["bancari", "privati"] },
  { name: "Dott.ssa Martina Leone", specialty: "Esperta crisi familiare", services: "Sovraindebitamento privati", price: 570, desc: "Supporto specializzato per nuclei familiari.", tags: ["fiscali", "privati"] },
  { name: "Avv. Fabio Bassi", specialty: "Diritto civile e commerciale", services: "Recupero crediti • Difesa", price: 520, desc: "Assistenza sia a creditori che debitori.", tags: ["bancari", "aziende", "privati"] },
  { name: "Dott. Daniele Villa", specialty: "Commercialista", services: "Consulenza fiscale integrata", price: 540, desc: "Ottimizzazione fiscale e gestione debiti erariali.", tags: ["fiscali", "aziende"] },
  { name: "Avv. Silvia Benedetti", specialty: "Diritto tributario", services: "Contenzioso tributario", price: 660, desc: "Rappresentanza in tutte le commissioni tributarie.", tags: ["fiscali", "aziende"] },
  { name: "Dott.ssa Giorgia Orlando", specialty: "OCC Gestore crisi", services: "Liquidazione patrimonio", price: 610, desc: "Vendita beni e distribuzione ricavato ai creditori.", tags: ["fiscali", "privati"] },
  { name: "Avv. Tommaso Bellini", specialty: "Diritto bancario", services: "Mutui • Prestiti", price: 410, desc: "Contestazioni clausole vessatorie e tassi usurari.", tags: ["bancari", "privati"] },
  { name: "Dott. Gabriele Neri", specialty: "Consulente finanziario", services: "Educazione finanziaria", price: 180, desc: "Corsi e consulenze per gestione consapevole denaro.", tags: ["privati"] },
  { name: "Avv. Michela Caputo", specialty: "Diritto fallimentare", services: "Procedure minori", price: 650, desc: "Liquidazione semplificata per piccoli debitori.", tags: ["aziende", "privati", "fiscali"] },
  { name: "Dott.ssa Roberta Piras", specialty: "Commercialista", services: "Rottamazione cartelle", price: 450, desc: "Definizioni agevolate debiti con Agenzia Riscossione.", tags: ["fiscali", "privati", "aziende"] }
];

const DEFAULT_LOCATIONS = [
  { city: "Milano", province: "MI", cap: "20100" },
  { city: "Roma", province: "RM", cap: "00100" },
  { city: "Napoli", province: "NA", cap: "80100" },
  { city: "Torino", province: "TO", cap: "10100" },
  { city: "Firenze", province: "FI", cap: "50100" },
  { city: "Bologna", province: "BO", cap: "40100" },
  { city: "Bari", province: "BA", cap: "70121" },
  { city: "Cagliari", province: "CA", cap: "09124" },
  { city: "Palermo", province: "PA", cap: "90100" },
  { city: "Verona", province: "VR", cap: "37100" }
];

PROFESSIONALS_DATA.forEach((pro, index) => {
  const fallback = DEFAULT_LOCATIONS[index % DEFAULT_LOCATIONS.length];
  if (!pro.city) pro.city = fallback.city;
  if (!pro.province) pro.province = fallback.province;
  if (!pro.cap) pro.cap = fallback.cap;
  // Initialize rating and reviews if not present
  if (!pro.rating) pro.rating = 0;
  if (!pro.reviews) pro.reviews = [];
  if (!pro.reviewCount) pro.reviewCount = 0;
});

// Make available globally for structured data
window.PROFESSIONALS_DATA = PROFESSIONALS_DATA;

// ==================== REVIEWS SYSTEM ====================
const ReviewsSystem = {
  /**
   * Load reviews from localStorage
   */
  loadReviews: () => {
    try {
      const saved = localStorage.getItem('professionalReviews');
      if (saved) {
        const reviews = JSON.parse(saved);
        // Update professionals with their reviews
        reviews.forEach(review => {
          const proIndex = PROFESSIONALS_DATA.findIndex(p => p.name === review.professionalName);
          if (proIndex !== -1) {
            if (!PROFESSIONALS_DATA[proIndex].reviews) {
              PROFESSIONALS_DATA[proIndex].reviews = [];
            }
            // Check if review already exists (by id or timestamp)
            const exists = PROFESSIONALS_DATA[proIndex].reviews.some(r => 
              r.id === review.id || (r.timestamp === review.timestamp && r.reviewerName === review.reviewerName)
            );
            if (!exists) {
              PROFESSIONALS_DATA[proIndex].reviews.push(review);
            }
          }
        });
        // Recalculate ratings
        ReviewsSystem.calculateRatings();
      }
    } catch (e) {
      console.error('Errore caricamento recensioni:', e);
    }
  },
  
  /**
   * Calculate average rating for each professional
   */
  calculateRatings: () => {
    PROFESSIONALS_DATA.forEach(pro => {
      if (pro.reviews && pro.reviews.length > 0) {
        const approvedReviews = pro.reviews.filter(r => r.status === 'approved');
        if (approvedReviews.length > 0) {
          const sum = approvedReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          pro.rating = Math.round((sum / approvedReviews.length) * 10) / 10; // Round to 1 decimal
          pro.reviewCount = approvedReviews.length;
        } else {
          pro.rating = 0;
          pro.reviewCount = 0;
        }
      } else {
        pro.rating = 0;
        pro.reviewCount = 0;
      }
    });
  },
  
  /**
   * Save review to localStorage
   */
  saveReview: (review) => {
    try {
      let allReviews = [];
      const saved = localStorage.getItem('professionalReviews');
      if (saved) {
        allReviews = JSON.parse(saved);
      }
      // Add new review
      review.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      review.timestamp = new Date().toISOString();
      review.status = 'pending'; // Admin must approve
      allReviews.push(review);
      localStorage.setItem('professionalReviews', JSON.stringify(allReviews));
      
      // Update professional's reviews
      const proIndex = PROFESSIONALS_DATA.findIndex(p => p.name === review.professionalName);
      if (proIndex !== -1) {
        if (!PROFESSIONALS_DATA[proIndex].reviews) {
          PROFESSIONALS_DATA[proIndex].reviews = [];
        }
        PROFESSIONALS_DATA[proIndex].reviews.push(review);
      }
      
      return review;
    } catch (e) {
      console.error('Errore salvataggio recensione:', e);
      return null;
    }
  },
  
  /**
   * Update review status (admin function)
   */
  updateReviewStatus: (reviewId, status) => {
    try {
      const saved = localStorage.getItem('professionalReviews');
      if (!saved) return false;
      
      const reviews = JSON.parse(saved);
      const reviewIndex = reviews.findIndex(r => r.id === reviewId);
      if (reviewIndex === -1) return false;
      
      reviews[reviewIndex].status = status;
      if (status === 'approved') {
        reviews[reviewIndex].approvedAt = new Date().toISOString();
      }
      
      localStorage.setItem('professionalReviews', JSON.stringify(reviews));
      
      // Update in PROFESSIONALS_DATA
      const review = reviews[reviewIndex];
      const proIndex = PROFESSIONALS_DATA.findIndex(p => p.name === review.professionalName);
      if (proIndex !== -1) {
        const proReviewIndex = PROFESSIONALS_DATA[proIndex].reviews.findIndex(r => r.id === reviewId);
        if (proReviewIndex !== -1) {
          PROFESSIONALS_DATA[proIndex].reviews[proReviewIndex].status = status;
        }
      }
      
      // Recalculate ratings
      ReviewsSystem.calculateRatings();
      
      return true;
    } catch (e) {
      console.error('Errore aggiornamento recensione:', e);
      return false;
    }
  },
  
  /**
   * Get all pending reviews (admin function)
   */
  getPendingReviews: () => {
    try {
      const saved = localStorage.getItem('professionalReviews');
      if (!saved) return [];
      const reviews = JSON.parse(saved);
      return reviews.filter(r => r.status === 'pending');
    } catch (e) {
      console.error('Errore lettura recensioni in attesa:', e);
      return [];
    }
  },
  
  /**
   * Get all reviews (admin function)
   */
  getAllReviews: () => {
    try {
      const saved = localStorage.getItem('professionalReviews');
      if (!saved) return [];
      return JSON.parse(saved);
    } catch (e) {
      console.error('Errore lettura recensioni:', e);
      return [];
    }
  },
  
  /**
   * Render stars HTML
   */
  renderStars: (rating, size = 'normal') => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const starSize = size === 'small' ? '14px' : '18px';
    let html = '<div class="stars-container" style="display:inline-flex;align-items:center;gap:2px;">';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      html += `<span style="color:#ffc107;font-size:${starSize};">★</span>`;
    }
    
    // Half star
    if (hasHalfStar) {
      html += `<span style="color:#ffc107;font-size:${starSize};">☆</span>`;
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      html += `<span style="color:#e0e0e0;font-size:${starSize};">★</span>`;
    }
    
    html += '</div>';
    return html;
  },
  
  /**
   * Show review form modal
   */
  showReviewForm: (proIndex) => {
    const pro = PROFESSIONALS_DATA[proIndex];
    
    // Create or get review modal
    let reviewModal = document.getElementById('reviewModal');
    if (!reviewModal) {
      reviewModal = document.createElement('div');
      reviewModal.id = 'reviewModal';
      reviewModal.className = 'modal-backdrop';
      document.body.appendChild(reviewModal);
    }
    
    let selectedRating = 0;
    let hoverRating = 0;
    
    const updateStars = (rating) => {
      const starsContainer = reviewModal.querySelector('.review-stars-input');
      if (!starsContainer) return;
      starsContainer.innerHTML = '';
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.style.cssText = 'font-size:32px;cursor:pointer;color:' + (i <= rating ? '#ffc107' : '#e0e0e0') + ';transition:color 0.2s;';
        star.textContent = '★';
        star.onmouseenter = () => {
          hoverRating = i;
          updateStars(i);
        };
        star.onmouseleave = () => {
          hoverRating = 0;
          updateStars(selectedRating);
        };
        star.onclick = () => {
          selectedRating = i;
          updateStars(i);
        };
        starsContainer.appendChild(star);
      }
    };
    
    reviewModal.innerHTML = `
      <div class="appointment-modal" style="max-width: 600px; padding: var(--spacing-xl); background: var(--card-bg); border-radius: var(--radius-xl); box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
        <button class="modal-close" onclick="ReviewsSystem.closeReviewForm()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-muted);">&times;</button>
        <h2 style="margin-top: 0; margin-bottom: var(--spacing-lg); color: var(--text-primary);">Lascia una Recensione</h2>
        <div style="margin-bottom: var(--spacing-lg);">
          <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: var(--spacing-sm);">${pro.name}</div>
          <div style="color: var(--text-muted);">${pro.specialty}</div>
        </div>
        
        <form id="reviewForm" onsubmit="ReviewsSystem.submitReview(event, ${proIndex})">
          <div style="margin-bottom: var(--spacing-xl);">
            <label style="display: block; font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary);">
              Valutazione (1-5 stelle) *
            </label>
            <div class="review-stars-input" style="display: flex; gap: 8px; margin-bottom: var(--spacing-sm);"></div>
            <div id="ratingText" style="color: var(--text-muted); font-size: 0.9rem; min-height: 20px;"></div>
          </div>
          
          <div style="margin-bottom: var(--spacing-lg);">
            <label for="reviewerName" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
              Il tuo nome *
            </label>
            <input type="text" id="reviewerName" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;" placeholder="Nome e cognome">
          </div>
          
          <div style="margin-bottom: var(--spacing-lg);">
            <label for="reviewerEmail" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
              La tua email *
            </label>
            <input type="email" id="reviewerEmail" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;" placeholder="email@esempio.it">
          </div>
          
          <div style="margin-bottom: var(--spacing-xl);">
            <label for="reviewText" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
              La tua recensione *
            </label>
            <textarea id="reviewText" required rows="5" style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem; font-family: inherit; resize: vertical;" placeholder="Racconta la tua esperienza con questo professionista..."></textarea>
          </div>
          
          <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end;">
            <button type="button" onclick="ReviewsSystem.closeReviewForm()" class="btn ghost" style="width: auto;">Annulla</button>
            <button type="submit" class="btn" style="width: auto;">Invia Recensione</button>
          </div>
        </form>
      </div>
    `;
    
    reviewModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Initialize stars
    setTimeout(() => {
      updateStars(0);
      
      // Update rating text on change
      const stars = reviewModal.querySelectorAll('.review-stars-input span');
      stars.forEach((star, index) => {
        star.addEventListener('click', () => {
          const ratingTexts = ['', 'Pessimo', 'Scarso', 'Discreto', 'Buono', 'Eccellente'];
          const textEl = reviewModal.querySelector('#ratingText');
          if (textEl) {
            textEl.textContent = ratingTexts[selectedRating] || '';
          }
        });
      });
    }, 100);
    
    // Close on backdrop click
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) {
        ReviewsSystem.closeReviewForm();
      }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        ReviewsSystem.closeReviewForm();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  },
  
  /**
   * Close review form
   */
  closeReviewForm: () => {
    const reviewModal = document.getElementById('reviewModal');
    if (reviewModal) {
      reviewModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },
  
  /**
   * Submit review
   */
  submitReview: (event, proIndex) => {
    event.preventDefault();
    const pro = PROFESSIONALS_DATA[proIndex];
    
    const reviewerName = document.getElementById('reviewerName').value.trim();
    const reviewerEmail = document.getElementById('reviewerEmail').value.trim();
    const reviewText = document.getElementById('reviewText').value.trim();
    
    // Get selected rating from stars
    const stars = document.querySelectorAll('.review-stars-input span');
    let rating = 0;
    stars.forEach((star, index) => {
      if (star.style.color === 'rgb(255, 193, 7)' || star.style.color === '#ffc107') {
        rating = index + 1;
      }
    });
    
    if (rating === 0) {
      alert('Per favore, seleziona una valutazione da 1 a 5 stelle.');
      return;
    }
    
    const review = {
      professionalName: pro.name,
      professionalIndex: proIndex,
      rating: rating,
      reviewerName: reviewerName,
      reviewerEmail: reviewerEmail,
      reviewText: reviewText
    };
    
    const saved = ReviewsSystem.saveReview(review);
    if (saved) {
      alert('✅ Recensione inviata con successo! La recensione sarà pubblicata dopo l\'approvazione dell\'amministratore.');
      ReviewsSystem.closeReviewForm();
      // Refresh professional details if modal is open
      const detailsModal = document.getElementById('proDetailsModal');
      if (detailsModal && detailsModal.classList.contains('show')) {
        Professionals.openDetails(proIndex);
      }
      // Refresh professionals list
      Professionals.render();
    } else {
      alert('❌ Errore durante l\'invio della recensione. Riprova più tardi.');
    }
  }
};

// Load reviews on initialization
ReviewsSystem.loadReviews();


// ==================== DOM REFERENCES ====================
const DOM = {
  // Pages
  pageWizard: document.getElementById('page-wizard'),
  pagePro: document.getElementById('page-pro'),
  pageJoin: document.getElementById('page-join-pro'),
  navMenu: document.getElementById('navMenu'),
  navToggle: document.getElementById('navToggle'),
  
  // Progress
  progressFill: document.getElementById('progress-fill'),
  progressPercent: document.getElementById('progress-percentage'),
  stepIndicators: document.querySelectorAll('.step'),
  
  // Steps
  step1: document.getElementById('step1'),
  step2: document.getElementById('step2'),
  step3: document.getElementById('step3'),
  stepAnalysis: document.getElementById('step-analysis'),
  
  // Step 1
  optionButtons: document.querySelectorAll('.opt'),
  toStep2Btn: document.getElementById('to2'),
  processOverview: document.getElementById('process-overview'),
  
  // Step 2
  form: document.getElementById('form'),
  chipsSpan: document.getElementById('chips'),
  back1Btn: document.getElementById('back1'),
  toStep3Btn: document.getElementById('to3'),
  
  // Step Analysis
  stepAnalysis: document.getElementById('step-analysis'),
  
  // Step 3
  reviewDiv: document.getElementById('review'),
  back2Btn: document.getElementById('back2'),
  backPrivacyBtn: document.getElementById('back-privacy'),
  submitBtn: document.getElementById('submit'),
  successMsg: document.getElementById('ok'),
  sendingMsg: document.getElementById('sending'),
  emailErrorMsg: document.getElementById('email-error'),
  
  // Modal
  modal: document.getElementById('gdprModal'),
  consentServiceChk: document.getElementById('consentServiceChk'),
  consentMarketingChk: document.getElementById('consentMarketingChk'),
  consentProfilingChk: document.getElementById('consentProfilingChk'),
  closeModalBtn: document.getElementById('closeModal'),
  confirmSendBtn: document.getElementById('confirmSend'),

  // Cookie banner
  cookieBanner: document.getElementById('cookie-banner'),
  cookieAcceptBtn: document.getElementById('cookie-accept'),
  cookieDeclineBtn: document.getElementById('cookie-decline'),
  
  // Professionals
  searchInput: document.getElementById('search'),
  filterChips: document.querySelectorAll('.chip'),
  proGrid: document.getElementById('pro-grid'),
  sortSelect: document.getElementById('sortSelect'),
  sortHint: document.getElementById('sortHint'),
  
  // Professional review
  reviewSelect: document.getElementById('review-pro-select'),
  reviewDetails: document.getElementById('review-details'),
  reviewMessage: document.getElementById('review-message'),
  reviewTypeRadios: document.querySelectorAll('input[name="review-type"]'),
  reviewStatus: document.getElementById('review-status'),
  reviewSendBtn: document.getElementById('review-send')
};

// ==================== UTILITIES ====================
const Utils = {
  /**
   * Extract only digits from a string
   */
  extractDigits: (str) => (str || '').replace(/\D/g, ''),
  
  /**
   * Validate email format
   */
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  /**
   * Show/hide error message
   */
  toggleError: (fieldId, show) => {
    const errorEl = document.getElementById(`err-${fieldId}`);
    if (errorEl) {
      if (show) {
        errorEl.classList.add('show');
      } else {
        errorEl.classList.remove('show');
      }
    }
  },
  
  /**
   * Scroll to top smoothly
   */
  scrollToTop: () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ==================== NAVIGATION ====================
const Navigation = {
  initMenu: () => {
    const toggle = DOM.navToggle;
    const menu = DOM.navMenu;
    if (!toggle || !menu) return;
    
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      Navigation.toggleMenu();
    });
    
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        Navigation.closeMenu();
      }
    });
    
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        Navigation.closeMenu();
      }
    });
  },
  
  toggleMenu: (forceState = null) => {
    const menu = DOM.navMenu;
    const toggle = DOM.navToggle;
    if (!menu || !toggle) return;
    
    const shouldOpen = forceState === null ? !menu.classList.contains('open') : forceState;
    menu.classList.toggle('open', shouldOpen);
    toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    document.body.classList.toggle('nav-menu-open', shouldOpen);
  },
  
  closeMenu: () => {
    const menu = DOM.navMenu;
    if (menu && menu.classList.contains('open')) {
      Navigation.toggleMenu(false);
    }
  },
  
  /**
   * Show professionals page
   */
  showProfessionals: () => {
    Navigation.closeMenu();
    // Hide all pages first
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
      page.hidden = true;
    });
    // Show professionals page
    DOM.pagePro.hidden = false;
    DOM.pagePro.classList.add('active');
    Navigation.updateGlobalBackButton();
    Utils.scrollToTop();
  },
  
  /**
   * Go to home (wizard page)
   */
  goToHome: () => {
    Navigation.closeMenu();
    // Hide all pages first
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
      page.hidden = true;
    });
    // Show wizard page
    DOM.pageWizard.hidden = false;
    DOM.pageWizard.classList.add('active');
    Wizard.showStep(1);
    Navigation.updateGlobalBackButton();
    Utils.scrollToTop();
  },
  
  /**
   * Go back (previous step or home)
   */
  goBack: () => {
    const privacyPage = document.getElementById('privacy-policy');
    const cookiePage = document.getElementById('cookie-policy');
    const professionalPage = document.getElementById('page-professional');
    const adminPage = document.getElementById('page-admin');
    const joinPage = DOM.pageJoin;
    const professionalsListPage = document.getElementById('professionals-list-page');
    
    // Handle cookie policy
    if (cookiePage && cookiePage.classList.contains('active')) {
      cookiePage.classList.remove('active');
      cookiePage.hidden = true;
      Navigation.goToHome();
      return;
    }
    
    // Handle professionals list page
    if (professionalsListPage && professionalsListPage.classList.contains('active')) {
      professionalsListPage.classList.remove('active');
      professionalsListPage.hidden = true;
      Navigation.goToHome();
      return;
    }
    
    // Handle privacy policy
    if (privacyPage && privacyPage.classList.contains('active')) {
      privacyPage.classList.remove('active');
      privacyPage.hidden = true;
      Navigation.goToHome();
      return;
    }
    
    // Handle professional dashboard - go to home
    if (professionalPage && professionalPage.classList.contains('active')) {
      Navigation.goToHome();
      return;
    }
    
    // Handle admin dashboard - go to home
    if (adminPage && adminPage.classList.contains('active')) {
      Navigation.goToHome();
      return;
    }
    
    // Handle join professionals page
    if (joinPage && joinPage.classList.contains('active')) {
      Navigation.goToHome();
      return;
    }
    
    // Handle professionals page - go to home
    if (DOM.pagePro.classList.contains('active')) {
      Navigation.goToHome();
    } else if (state.currentStep > 1) {
      // Handle wizard steps
      Wizard.showStep(state.currentStep - 1);
      Navigation.updateGlobalBackButton();
    }
  },
  
  /**
   * Update global back button visibility
   */
  updateGlobalBackButton: (forceShow = false) => {
    const globalBackBtn = document.getElementById('global-back-btn');
    if (!globalBackBtn) return;
    
    if (forceShow) {
      globalBackBtn.style.display = 'flex';
      return;
    }
    
    // Show if not on step 1 of wizard or if on professionals page or privacy page
    const isProfessionalsPage = DOM.pagePro.classList.contains('active');
    const privacyPage = document.getElementById('privacy-policy');
    const isPrivacyPage = privacyPage && privacyPage.classList.contains('active');
    const isStep1 = state.currentStep === 1 && !isProfessionalsPage && !isPrivacyPage;
    
    globalBackBtn.style.display = isStep1 ? 'none' : 'flex';
  },
  
  /**
   * Scroll to client section (wizard step 1)
   */
  scrollToClient: () => {
    Navigation.closeMenu();
    Navigation.goToHome();
    setTimeout(() => {
      const step1Element = document.getElementById('step1');
      if (step1Element) {
        step1Element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add a small offset
        window.scrollBy(0, -80);
      }
    }, 300);
  },
  
  /**
   * Show join professionals page
   */
  showJoinProfessionals: () => {
    Navigation.closeMenu();
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
      page.hidden = true;
    });
    if (DOM.pageJoin) {
      DOM.pageJoin.hidden = false;
      DOM.pageJoin.classList.add('active');
      Navigation.updateGlobalBackButton(true);
      Utils.scrollToTop();
    }
  },
  
  /**
   * Show admin login modal
   */
  showAdminLogin: () => {
    Navigation.closeMenu();
    const modal = document.getElementById('professionalLoginModal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      const title = document.getElementById('loginTitle');
      if (title) title.textContent = '🔐 Accesso Dashboard Admin';
      document.getElementById('username')?.focus();
    }
  },
  
  /**
   * Show professional login modal
   */
  showProfessionalLogin: () => {
    Navigation.closeMenu();
    const modal = document.getElementById('professionalLoginModal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      const title = document.getElementById('loginTitle');
      if (title) title.textContent = 'Accesso Area Professionisti';
      document.getElementById('username')?.focus();
    }
  },
  
  /**
   * Hide professional login modal
   */
  hideProfessionalLogin: () => {
    const modal = document.getElementById('professionalLoginModal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      document.getElementById('loginForm')?.reset();
      const errorEl = document.getElementById('login-error');
      if (errorEl) errorEl.style.display = 'none';
    }
  },

  /**
   * Show privacy policy page
   */
  showPrivacyPolicy: () => {
    DOM.pageWizard.classList.remove('active');
    DOM.pagePro.classList.remove('active');
    const privacyPage = document.getElementById('privacy-policy');
    const cookiePage = document.getElementById('cookie-policy');
    const professionalPage = document.getElementById('page-professional');
    const adminPage = document.getElementById('page-admin');
    if (professionalPage) professionalPage.hidden = true;
    if (adminPage) adminPage.hidden = true;
    if (cookiePage) cookiePage.hidden = true;
    if (privacyPage) {
      privacyPage.hidden = false;
      privacyPage.classList.add('active');
      Navigation.updateGlobalBackButton(true);
      Utils.scrollToTop();
    }
  },
  
  showCookiePolicy: () => {
    DOM.pageWizard.classList.remove('active');
    DOM.pagePro.classList.remove('active');
    const cookiePage = document.getElementById('cookie-policy');
    const privacyPage = document.getElementById('privacy-policy');
    const professionalPage = document.getElementById('page-professional');
    const adminPage = document.getElementById('page-admin');
    if (professionalPage) professionalPage.hidden = true;
    if (adminPage) adminPage.hidden = true;
    if (privacyPage) privacyPage.hidden = true;
    if (cookiePage) {
      cookiePage.hidden = false;
      cookiePage.classList.add('active');
      Navigation.updateGlobalBackButton(true);
      Utils.scrollToTop();
    }
  }
};

// ==================== COOKIE CONSENT ====================
const CookieConsent = {
  init: () => {
    if (!DOM.cookieBanner) return;
    
    const saved = CookieConsent.getStoredPreference();
    if (saved) {
      if (saved.analytics) {
        CookieConsent.loadAnalytics();
      }
      return;
    }
    
    CookieConsent.showBanner();
    
    if (DOM.cookieAcceptBtn) {
      DOM.cookieAcceptBtn.addEventListener('click', CookieConsent.acceptAll);
    }
    if (DOM.cookieDeclineBtn) {
      DOM.cookieDeclineBtn.addEventListener('click', CookieConsent.declineAnalytics);
    }
  },
  
  getStoredPreference: () => {
    try {
      return JSON.parse(localStorage.getItem('cookieConsent'));
    } catch (e) {
      return null;
    }
  },
  
  storePreference: (data) => {
    try {
      localStorage.setItem('cookieConsent', JSON.stringify(data));
    } catch (e) {
      console.warn('Impossibile salvare preferenze cookie:', e);
    }
  },
  
  showBanner: () => {
    if (DOM.cookieBanner) {
      DOM.cookieBanner.hidden = false;
    }
  },
  
  hideBanner: () => {
    if (DOM.cookieBanner) {
      DOM.cookieBanner.hidden = true;
    }
  },
  
  acceptAll: () => {
    CookieConsent.storePreference({ analytics: true, timestamp: Date.now() });
    CookieConsent.hideBanner();
    CookieConsent.loadAnalytics();
  },
  
  declineAnalytics: () => {
    CookieConsent.storePreference({ analytics: false, timestamp: Date.now() });
    CookieConsent.hideBanner();
  },
  
  loadAnalytics: () => {
    if (!ANALYTICS_CONFIG.measurementId || ANALYTICS_CONFIG.measurementId === 'G-XXXXXXXXXX') {
      console.warn('Measurement ID non configurato. Aggiorna ANALYTICS_CONFIG.');
      return;
    }
    
    if (window.gtag) {
      return;
    }
    
    const existingScript = document.querySelector(`script[data-analytics="${ANALYTICS_CONFIG.measurementId}"]`);
    if (existingScript) return;
    
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.measurementId}`;
    gaScript.dataset.analytics = ANALYTICS_CONFIG.measurementId;
    gaScript.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ANALYTICS_CONFIG.measurementId);
    };
    document.head.appendChild(gaScript);
  }
};

// ==================== WIZARD ====================
const Wizard = {
  /**
   * Update progress bar and step indicators
   */
  updateProgress: (step) => {
    const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;
    
    if (DOM.progressFill) {
      DOM.progressFill.style.width = `${progressValue}%`;
      const progressContainer = DOM.progressFill.closest('.wizard-progress-pill');
      if (progressContainer) {
        progressContainer.setAttribute('aria-valuenow', progressValue);
      }
    }
    
    if (DOM.progressPercent) {
      DOM.progressPercent.textContent = `${progressValue}%`;
    }
    
    DOM.stepIndicators.forEach(indicator => {
      const indicatorStep = Number(indicator.dataset.step);
      indicator.classList.toggle('active', indicatorStep === step);
    });
  },
  
  /**
   * Show specific step with smooth animation
   */
  showStep: (step) => {
    // Save current state before switching
    Wizard.saveStateToStorage();

    if (DOM.processOverview) {
      DOM.processOverview.style.display = step === 1 ? 'block' : 'none';
    }
    
    // Map step numbers to actual DOM elements
    const stepMap = {
      1: DOM.step1,
      2: DOM.step2,
      2.5: DOM.stepAnalysis,
      3: DOM.step3
    };
    
    const currentStepElement = stepMap[state.currentStep];
    const nextStepElement = stepMap[step];
    
    if (!nextStepElement) {
      console.error(`Step ${step} non trovato!`);
      return;
    }
    
    // Animate out current step
    if (currentStepElement && !currentStepElement.hidden) {
      currentStepElement.classList.add('slide-out');
      setTimeout(() => {
        currentStepElement.hidden = true;
        currentStepElement.classList.remove('slide-out');
      }, 300);
    }
    
    // Animate in next step
    state.currentStep = step;
    setTimeout(() => {
      nextStepElement.hidden = false;
      Wizard.updateProgress(step);
      Navigation.updateGlobalBackButton();
      Utils.scrollToTop();
      
      // Restore saved data if available
      if (step === 2) {
        Wizard.loadStateFromStorage();
      }
      
      // Setup analysis step buttons if showing analysis
      if (step === 2.5 || (nextStepElement && nextStepElement.id === 'step-analysis')) {
        const backBtn = document.getElementById('back-analysis');
        const nextBtn = document.getElementById('to-privacy');
        if (backBtn) {
          backBtn.onclick = () => {
            Wizard.closeIncomeDataPopup();
            Wizard.showIncomeDataPopup();
          };
        }
        if (nextBtn) {
          nextBtn.onclick = () => {
            Wizard.goToPrivacy();
          };
        }
      }
    }, currentStepElement && !currentStepElement.hidden ? 300 : 0);
  },
  
  /**
   * Calculate and display total debt amount
   */
  updateTotalAmount: () => {
    let total = 0;
    Object.values(state.debtCreditors).forEach(creditors => {
      if (Array.isArray(creditors)) {
        creditors.forEach(item => {
          total += Number(item && typeof item.amount !== 'undefined' ? item.amount : 0) || 0;
        });
      }
    });
    
    const totalDisplay = document.getElementById('total-display');
    const totalSection = document.getElementById('total-amount');
    
    if (total > 0) {
      // Animate count-up effect
      const targetAmount = total;
      const currentText = totalDisplay ? totalDisplay.textContent.replace(/[^\d,]/g, '').replace(',', '.') : '0';
      const currentAmount = parseFloat(currentText) || 0;
      
      if (Math.abs(currentAmount - targetAmount) > 0.01 && totalDisplay) {
        let startAmount = currentAmount;
        const duration = 500;
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = startAmount + (targetAmount - startAmount) * easeOut;
          
          totalDisplay.textContent = `€ ${current.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            totalDisplay.textContent = `€ ${targetAmount.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
          }
        };
        
        requestAnimationFrame(animate);
      } else if (totalDisplay) {
      totalDisplay.textContent = `€ ${total.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      }
      
      if (totalSection) {
      totalSection.style.display = 'block';
      }
    } else {
      if (totalSection) {
      totalSection.style.display = 'none';
      }
    }
  },
  
  /**
   * Populate subcategory select with proper options
   */
  populateSubcategoryOptions: (select, debtType) => {
    if (!select) return;
    const options = DEBT_SUBCATEGORIES[debtType] || [];
    select.innerHTML = '';
    
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Scegli la tipologia';
    select.appendChild(placeholder);
    
    options.forEach(opt => {
      const optionEl = document.createElement('option');
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      select.appendChild(optionEl);
    });
  },
  
  /**
   * Ensure there is at least one entry for the given debt type
   */
  ensureDebtArray: (debtType) => {
    if (!state.debtCreditors[debtType]) {
      state.debtCreditors[debtType] = [];
    }
    if (state.debtCreditors[debtType].length === 0) {
      state.debtCreditors[debtType].push({
        subCategory: '',
        creditor: '',
        amount: 0
      });
    }
  },
  
  /**
   * Get label for a subcategory
   */
  getSubcategoryLabel: (debtType, value) => {
    if (!value) return '';
    const options = DEBT_SUBCATEGORIES[debtType] || [];
    const match = options.find(opt => opt.value === value);
    return match ? match.label : '';
  },
  
  /**
   * Render debt details list for a category
   */
  renderDebtDetails: (debtType) => {
    const container = document.getElementById(`details-${debtType}`);
    if (!container) return;
    const itemsContainer = container.querySelector('.debt-items') || container;
    
    Wizard.ensureDebtArray(debtType);
    
    itemsContainer.querySelectorAll('.debt-item').forEach(item => item.remove());
    
    state.debtCreditors[debtType].forEach((entry, index) => {
      const debtItem = Wizard.createDebtItem(debtType, index, entry);
      itemsContainer.appendChild(debtItem);
    });
    
    Wizard.updateTotalAmount();
  },
  
  /**
   * Create a single debt entry row
   */
  createDebtItem: (debtType, index, entry = {}) => {
    const debtItem = document.createElement('div');
    debtItem.className = 'debt-item';
    debtItem.innerHTML = `
      <div class="debt-row">
        <select class="subcategory-select" aria-label="Tipologia specifica del debito"></select>
        <input type="text" class="creditor-input" placeholder="Nome creditore (facoltativo)" aria-label="Nome creditore">
        <input type="number" min="0" step="0.01" class="amount-input-field" placeholder="Importo in €" aria-label="Importo">
        <button type="button" class="btn-remove-creditor" aria-label="Rimuovi voce">×</button>
      </div>
    `;
    
    const select = debtItem.querySelector('.subcategory-select');
    const creditorInput = debtItem.querySelector('.creditor-input');
    const amountInput = debtItem.querySelector('.amount-input-field');
    const removeBtn = debtItem.querySelector('.btn-remove-creditor');
    
    if (select) {
      select.dataset.debtType = debtType;
    }
    
    Wizard.populateSubcategoryOptions(select, debtType);
    if (entry.subCategory) {
      select.value = entry.subCategory;
    }
    creditorInput.value = entry.creditor || '';
    amountInput.value = (typeof entry.amount !== 'undefined' && entry.amount !== null && entry.amount !== '') ? entry.amount : '';
    
    const updateEntry = () => {
      if (!state.debtCreditors[debtType]) {
        state.debtCreditors[debtType] = [];
      }
      state.debtCreditors[debtType][index] = {
        subCategory: select.value,
        creditor: creditorInput.value.trim(),
        amount: Number(amountInput.value) || 0
      };
      Wizard.updateTotalAmount();
      Wizard.saveStateToStorage();
    };
    
    select.addEventListener('change', updateEntry);
    creditorInput.addEventListener('input', updateEntry);
    amountInput.addEventListener('input', updateEntry);
    
    removeBtn.addEventListener('click', () => Wizard.removeCreditor(debtType, index));
    
    return debtItem;
  },
  
  /**
   * Add another creditor for a debt type
   */
  addCreditor: (debtType) => {
    Wizard.ensureDebtArray(debtType);
    state.debtCreditors[debtType].push({
      subCategory: '',
      creditor: '',
      amount: 0
    });
    Wizard.renderDebtDetails(debtType);
    
    const detailsContainer = document.getElementById(`details-${debtType}`);
    const newSelect = detailsContainer?.querySelector('.debt-item:last-of-type .subcategory-select');
    if (newSelect) {
      newSelect.focus();
    }
    Wizard.saveStateToStorage();
  },
  
  /**
   * Remove a creditor
   */
  removeCreditor: (debtType, index) => {
    if (!state.debtCreditors[debtType]) return;
    state.debtCreditors[debtType].splice(index, 1);
    
    if (state.debtCreditors[debtType].length === 0) {
      state.debtCreditors[debtType].push({
        subCategory: '',
        creditor: '',
        amount: 0
      });
    }
    
    Wizard.renderDebtDetails(debtType);
    Wizard.saveStateToStorage();
  },
  
  /**
   * Handle option selection in Step 1
   */
  handleOptionClick: (button) => {
    const value = button.dataset.value;
    const isSelected = button.classList.contains('selected');
    const detailsContainer = document.getElementById(`details-${value}`);
    
    if (isSelected) {
      button.classList.remove('selected');
      button.setAttribute('aria-pressed', 'false');
      state.selections = state.selections.filter(s => s !== value);
      if (detailsContainer) {
        detailsContainer.style.display = 'none';
        const itemsContainer = detailsContainer.querySelector('.debt-items');
        if (itemsContainer) {
          itemsContainer.innerHTML = '';
        }
        delete state.debtCreditors[value];
        Wizard.saveStateToStorage();
      }
    } else {
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      state.selections.push(value);
      if (detailsContainer) {
        detailsContainer.style.display = 'block';
        Wizard.ensureDebtArray(value);
        Wizard.renderDebtDetails(value);
        Wizard.saveStateToStorage();
      }
    }
    
    DOM.toStep2Btn.disabled = state.selections.length === 0;
    Wizard.updateTotalAmount();
    Wizard.saveStateToStorage();
  },
  
  /**
   * Move to Step 2 - Show income and data popup after debt selection
   */
  goToStep2: () => {
    // Check if user has selected at least one debt type
    if (state.selections.length === 0) {
      alert('Seleziona almeno un tipo di debito per procedere.');
      return;
    }
    // Show popup with income and personal data
    Wizard.showIncomeDataPopup();
  },
  
  /**
   * Show popup for income and personal data
   */
  showIncomeDataPopup: () => {
    // Create or get popup modal
    let incomeModal = document.getElementById('incomeDataModal');
    if (!incomeModal) {
      incomeModal = document.createElement('div');
      incomeModal.id = 'incomeDataModal';
      incomeModal.className = 'modal-backdrop';
      document.body.appendChild(incomeModal);
    }
    
    incomeModal.innerHTML = `
      <div class="appointment-modal" style="max-width: 700px; padding: var(--spacing-xl); background: var(--card-bg); border-radius: var(--radius-xl); box-shadow: 0 20px 60px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto;">
        <button class="modal-close" onclick="Wizard.closeIncomeDataPopup()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-muted); z-index: 10;">&times;</button>
        <h2 style="margin-top: 0; margin-bottom: var(--spacing-md); color: var(--text-primary); display: flex; align-items: center; gap: var(--spacing-sm);">
          <span>💡</span>
          <span>Un'ultima cosa</span>
        </h2>
        <p style="color: var(--text-muted); margin-bottom: var(--spacing-xl); font-size: 1.05rem;">
          Dicci qual è il tuo reddito mensile netto, così potremo farti una prima analisi preliminare della tua situazione.
        </p>
        
        <form id="incomeDataForm" onsubmit="Wizard.submitIncomeData(event)">
          <div style="margin-bottom: var(--spacing-lg);">
            <label for="redditoMensile" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
              Reddito mensile netto (€) *
            </label>
            <input type="number" id="redditoMensile" min="0" step="0.01" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;" placeholder="Es. 2000">
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: var(--spacing-xs);">Inserisci il tuo reddito mensile netto dopo le trattenute</div>
          </div>
          
          <div style="border-top: 2px solid var(--border); padding-top: var(--spacing-xl); margin-top: var(--spacing-xl);">
            <h3 style="margin-bottom: var(--spacing-lg); color: var(--text-primary);">I tuoi dati di contatto</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
              <div>
                <label for="popup-nome" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
                  Nome *
                </label>
                <input type="text" id="popup-nome" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;" placeholder="Il tuo nome">
              </div>
              <div>
                <label for="popup-cognome" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
                  Cognome *
                </label>
                <input type="text" id="popup-cognome" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;" placeholder="Il tuo cognome">
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
              <div>
                <label for="popup-telefono" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
                  Numero di cellulare *
                </label>
                <input type="tel" id="popup-telefono" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;" placeholder="+39 333 1234567">
              </div>
              <div>
                <label for="popup-email" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
                  Email *
                </label>
                <input type="email" id="popup-email" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;" placeholder="nome@esempio.it">
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
              <div>
                <label for="popup-citta" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
                  Città *
                </label>
                <input type="text" id="popup-citta" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;" placeholder="Es. Milano">
              </div>
              <div>
                <label for="popup-provincia" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
                  Provincia *
                </label>
                <select id="popup-provincia" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;">
                  <option value="">Seleziona provincia</option>
                </select>
              </div>
              <div>
                <label for="popup-cap" style="display: block; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary);">
                  CAP *
                </label>
                <input type="text" id="popup-cap" maxlength="5" required style="width: 100%; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem;" placeholder="Es. 20100">
              </div>
            </div>
          </div>
          
          <div style="margin-top: var(--spacing-xl); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0; line-height: 1.6;">
              <strong>Disclaimer:</strong> L'analisi effettuata è puramente a titolo esemplificativo, non consiste in una soluzione pratica né tantomeno in un consiglio da seguire.
            </p>
          </div>
          
          <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-xl);">
            <button type="button" onclick="Wizard.closeIncomeDataPopup()" class="btn ghost" style="width: auto;">Annulla</button>
            <button type="submit" class="btn" style="width: auto;">Procedi all'analisi</button>
          </div>
        </form>
      </div>
    `;
    
    incomeModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Populate province select - use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      const populateProvinceSelect = () => {
        const provinceSelect = document.getElementById('popup-provincia');
        if (provinceSelect) {
          // Clear existing options
          provinceSelect.innerHTML = '<option value="">Seleziona provincia</option>';
          
          // Add all provinces
          if (typeof ITALIAN_PROVINCES !== 'undefined' && ITALIAN_PROVINCES && Array.isArray(ITALIAN_PROVINCES) && ITALIAN_PROVINCES.length > 0) {
            ITALIAN_PROVINCES.forEach(prov => {
              const option = document.createElement('option');
              option.value = prov.code;
              option.textContent = `${prov.name} (${prov.code})`;
              provinceSelect.appendChild(option);
            });
            console.log(`✅ Popolate ${ITALIAN_PROVINCES.length} province nel select`);
          } else {
            console.error('❌ ITALIAN_PROVINCES non definito, vuoto o non è un array');
          }
        } else {
          console.error('❌ Select provincia non trovato nel DOM');
        }
      };
      
      // Try multiple times to ensure it works
      populateProvinceSelect();
      setTimeout(populateProvinceSelect, 10);
      setTimeout(populateProvinceSelect, 100);
    });
    
    // Close on backdrop click
    incomeModal.addEventListener('click', (e) => {
      if (e.target === incomeModal) {
        Wizard.closeIncomeDataPopup();
      }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        Wizard.closeIncomeDataPopup();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  },
  
  /**
   * Close income data popup
   */
  closeIncomeDataPopup: () => {
    const incomeModal = document.getElementById('incomeDataModal');
    if (incomeModal) {
      incomeModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },
  
  /**
   * Submit income data and show analysis
   */
  submitIncomeData: (event) => {
    event.preventDefault();
    
    // Validate fields
    const reddito = parseFloat(document.getElementById('redditoMensile').value) || 0;
    const nome = document.getElementById('popup-nome').value.trim();
    const cognome = document.getElementById('popup-cognome').value.trim();
    const telefono = document.getElementById('popup-telefono').value.trim();
    const email = document.getElementById('popup-email').value.trim();
    const citta = document.getElementById('popup-citta').value.trim();
    const provincia = document.getElementById('popup-provincia').value.trim();
    const cap = document.getElementById('popup-cap').value.trim();
    
    if (!reddito || reddito <= 0) {
      alert('Inserisci un reddito mensile valido.');
      return;
    }
    
    if (!nome || nome.length < 3) {
      alert('Inserisci un nome valido (almeno 3 caratteri).');
      return;
    }
    
    if (!cognome || cognome.length < 3) {
      alert('Inserisci un cognome valido (almeno 3 caratteri).');
      return;
    }
    
    if (!Utils.isValidEmail(email)) {
      alert('Inserisci un\'email valida.');
      return;
    }
    
    if (Utils.extractDigits(telefono).length < 9) {
      alert('Inserisci un numero di telefono valido.');
      return;
    }
    
    if (!citta || citta.length < 2) {
      alert('Inserisci una città valida.');
      return;
    }
    
    if (!provincia || provincia.length !== 2) {
      alert('Seleziona una provincia.');
      return;
    }
    
    if (Utils.extractDigits(cap).length !== 5) {
      alert('Inserisci un CAP valido (5 cifre).');
      return;
    }
    
    // Save form data
    state.formData = {
      nome: nome,
      cognome: cognome,
      telefono: telefono,
      email: email,
      citta: citta,
      provincia: provincia,
      cap: cap,
      redditoMensile: reddito
    };
    
    // Calculate total debt
    let totalAmount = 0;
    Object.values(state.debtCreditors).forEach(creditors => {
      if (Array.isArray(creditors)) {
        creditors.forEach(item => {
          totalAmount += Number(item.amount) || 0;
        });
      }
    });
    state.formData.totalAmount = totalAmount;
    
    // Close popup
    Wizard.closeIncomeDataPopup();
    
    // Show analysis page
    Wizard.showAnalysis();
  },
  
  /**
   * Validate individual field
   */
  validateField: (fieldId, value, showFeedback = true) => {
    let isValid = true;
    
    switch (fieldId) {
      case 'nome':
      case 'cognome':
        isValid = value.trim().length >= 3;
        break;
      
      case 'telefono':
        isValid = Utils.extractDigits(value).length >= 9;
        break;
      
      case 'email':
        isValid = Utils.isValidEmail(value);
        break;
      
      case 'citta':
        isValid = value.trim().length >= 2;
        break;
      
      case 'provincia':
        isValid = value.trim().length === 2;
        break;
      
      case 'cap':
        isValid = Utils.extractDigits(value).length === 5;
        break;
    }
    
    if (showFeedback) {
      Wizard.updateFieldState(fieldId, isValid, value.trim().length > 0);
    }
    
    Utils.toggleError(fieldId, !isValid);
    return isValid;
  },
  
  /**
   * Update field visual state (icon and styling)
   */
  updateFieldState: (fieldId, isValid, hasValue) => {
    const input = document.getElementById(fieldId);
    const icon = document.getElementById(`icon-${fieldId}`);
    
    if (!input || !icon) return;
    
    // Remove previous states
    input.classList.remove('valid', 'invalid');
    icon.classList.remove('valid', 'invalid');
    
    // Only show state if user has typed something
    if (hasValue) {
      if (isValid) {
        input.classList.add('valid');
        icon.classList.add('valid');
      } else {
        input.classList.add('invalid');
        icon.classList.add('invalid');
      }
    }
  },
  
  /**
   * Validate all form fields
   */
  validateAllFields: () => {
    const fields = ['nome', 'cognome', 'telefono', 'email', 'citta', 'provincia', 'cap'];
    let allValid = true;
    
    fields.forEach(fieldId => {
      const input = document.getElementById(fieldId);
      const isValid = Wizard.validateField(fieldId, input.value);
      if (!isValid) allValid = false;
    });
    
    // creditore is optional now
    return allValid;
  },
  
  /**
   * Show analysis page
   */
  showAnalysis: () => {
    const totalDebt = state.formData.totalAmount || 0;
    const monthlyIncome = state.formData.redditoMensile || 0;
    
    // --- Pesi statistici per tipologia di debito ---
    const CATEGORY_WEIGHTS = {
      banche_finanziarie: 1.15,
      fiscali_tributari: 1.25,
      previdenziali: 1.10,
      utenze_servizi: 0.95,
      procedure_esecutive: 1.40,
      altro: 1.00
    };

    // Pesi per sottocategoria (se disponibili)
    const SUBCATEGORY_WEIGHTS = {
      // banche_finanziarie
      mutuo_ipotecario: 1.25,
      prestito_personale: 1.10,
      carte_revolving: 1.20,
      leasing_finanziario: 1.05,
      fidi_aziendali: 1.15,
      // fiscali_tributari
      iva: 1.10,
      irpef_ires: 1.20,
      imu_tasi: 1.10,
      cartelle_esattoriali: 1.30,
      avvisi_bonari: 1.00,
      // previdenziali
      inps_dipendenti: 1.05,
      inps_gestione_separata: 1.05,
      inail: 1.05,
      casse_professionali: 1.10,
      fondi_pensione: 1.05,
      // utenze_servizi
      energia_gas: 0.90,
      acqua: 0.90,
      telefonia_internet: 0.85,
      servizi_digitali: 0.80,
      altri_servizi: 0.90,
      // procedure_esecutive
      pignoramento_conto: 1.30,
      pignoramento_quinto: 1.25,
      ipoteca_giudiziale: 1.35,
      decreto_ingiuntivo: 1.15,
      crediti_servicer: 1.30,
      // altro
      garanzie: 1.10,
      societa: 1.10,
      estero: 1.15,
      informali: 1.00
    };

    // --- Pesi per fascia di importo complessivo ---
    const getAmountWeight = (amount) => {
      if (amount < 20000) return 0.90;
      if (amount < 50000) return 1.00;
      if (amount < 100000) return 1.10;
      if (amount < 250000) return 1.20;
      return 1.30;
    };

    // Calcola la distribuzione per categoria (somma importi inseriti)
    const categoryTotals = {};
    state.selections.forEach(debtType => {
      const entries = state.debtCreditors[debtType] || [];
      const sum = entries.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
      categoryTotals[debtType] = sum;
    });

    // Se non ci sono dettagli, ripartisci equamente
    const totalFromDetails = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    if (totalFromDetails === 0 && totalDebt > 0 && state.selections.length > 0) {
      const equalShare = totalDebt / state.selections.length;
      state.selections.forEach(debtType => {
        categoryTotals[debtType] = equalShare;
      });
    }

    const sumCategoryAmounts = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    // Totali per sottocategoria (se disponibile subCategory)
    const subcategoryTotals = {};
    state.selections.forEach(debtType => {
      const entries = state.debtCreditors[debtType] || [];
      entries.forEach(item => {
        const sub = item.subCategory || '';
        if (!sub) return;
        const amount = Number(item.amount) || 0;
        if (!subcategoryTotals[sub]) subcategoryTotals[sub] = 0;
        subcategoryTotals[sub] += amount;
      });
    });
    const sumSubcategoryAmounts = Object.values(subcategoryTotals).reduce((a, b) => a + b, 0);

    // Peso medio (categoria + sottocategoria) pesato sugli importi
    let weightedCategoryFactor = 1;
    if (sumSubcategoryAmounts > 0) {
      const weightedSum = Object.entries(subcategoryTotals).reduce((acc, [sub, amt]) => {
        // trova categoria di appartenenza per il sub
        const parentCat = Object.keys(DEBT_SUBCATEGORIES).find(cat =>
          (DEBT_SUBCATEGORIES[cat] || []).some(sc => sc.value === sub)
        );
        const catWeight = CATEGORY_WEIGHTS[parentCat] || 1;
        const subWeight = SUBCATEGORY_WEIGHTS[sub] || 1;
        return acc + amt * catWeight * subWeight;
      }, 0);
      weightedCategoryFactor = weightedSum / sumSubcategoryAmounts;
    } else if (sumCategoryAmounts > 0) {
      const weightedSum = state.selections.reduce((acc, debtType) => {
        const share = categoryTotals[debtType] || 0;
        const weight = CATEGORY_WEIGHTS[debtType] || 1;
        return acc + share * weight;
      }, 0);
      weightedCategoryFactor = weightedSum / sumCategoryAmounts;
    }

    // Mix factor: penalizza se molta quota è fiscale/esecutiva, premia se concentrato
    let mixFactor = 0;
    if (sumCategoryAmounts > 0) {
      const fiscExecShare =
        ((categoryTotals['fiscali_tributari'] || 0) +
          (categoryTotals['procedure_esecutive'] || 0)) / sumCategoryAmounts;
      if (fiscExecShare >= 0.5) mixFactor += 0.10;
    }
    if (state.selections.length > 4) mixFactor += 0.05;
    if (state.selections.length === 1 && !state.selections.includes('procedure_esecutive')) mixFactor -= 0.05;

    // Peso per fascia di importo
    const amountWeight = getAmountWeight(totalDebt);

    // Durate medie (mesi) per tipologia (stima statistica)
    const CATEGORY_MONTHS = {
      banche_finanziarie: 84,      // finanziamenti/credito al consumo
      fiscali_tributari: 60,       // piani AE/ADER tipici
      previdenziali: 48,
      utenze_servizi: 24,
      procedure_esecutive: 72,     // accordi/stralci esecutivi
      altro: 60
    };

    // Durate medie (mesi) per sottocategoria (stima statistica)
    const SUBCATEGORY_MONTHS = {
      // banche_finanziarie
      mutuo_ipotecario: 300,          // 25 anni
      prestito_personale: 72,
      carte_revolving: 48,
      leasing_finanziario: 72,
      fidi_aziendali: 60,
      // fiscali_tributari
      iva: 36,
      irpef_ires: 48,
      imu_tasi: 48,
      cartelle_esattoriali: 72,
      avvisi_bonari: 36,
      // previdenziali
      inps_dipendenti: 48,
      inps_gestione_separata: 48,
      inail: 48,
      casse_professionali: 60,
      fondi_pensione: 60,
      // utenze_servizi
      energia_gas: 24,
      acqua: 24,
      telefonia_internet: 18,
      servizi_digitali: 12,
      altri_servizi: 24,
      // procedure_esecutive
      pignoramento_conto: 60,
      pignoramento_quinto: 84,
      ipoteca_giudiziale: 120,
      decreto_ingiuntivo: 48,
      crediti_servicer: 84,
      // altro
      garanzie: 60,
      societa: 72,
      estero: 72,
      informali: 36
    };

    // Durata media ponderata sui debiti dichiarati (preferisce sottocategorie se presenti)
    let weightedMonths = 72;
    if (sumSubcategoryAmounts > 0) {
      const monthsWeightedSum = Object.entries(subcategoryTotals).reduce((acc, [sub, amt]) => {
        const parentCat = Object.keys(DEBT_SUBCATEGORIES).find(cat =>
          (DEBT_SUBCATEGORIES[cat] || []).some(sc => sc.value === sub)
        );
        const m = SUBCATEGORY_MONTHS[sub] || CATEGORY_MONTHS[parentCat] || 72;
        return acc + amt * m;
      }, 0);
      weightedMonths = monthsWeightedSum / sumSubcategoryAmounts;
    } else if (sumCategoryAmounts > 0) {
      const monthsWeightedSum = state.selections.reduce((acc, debtType) => {
        const share = categoryTotals[debtType] || 0;
        const m = CATEGORY_MONTHS[debtType] || 72;
        return acc + share * m;
      }, 0);
      weightedMonths = monthsWeightedSum / sumCategoryAmounts;
    }

    // Rata media ponderata (uso durata media ponderata invece di 72 fisso)
    const averageMonthlyDebtBase = weightedMonths > 0 ? totalDebt / weightedMonths : totalDebt / 72;
    const weightedMonthlyDebt =
      averageMonthlyDebtBase * weightedCategoryFactor * amountWeight * (1 + mixFactor);

    // Indice di indebitamento (rata ponderata / reddito mensile)
    const debtBurdenPercent = monthlyIncome > 0 ? (weightedMonthlyDebt / monthlyIncome) * 100 : 0;
    
    // Define timeline segments
    const timelineSegments = [
      { min: 0, max: 10, label: '0-10%', color: '#48bb78', name: 'Basso Indebitamento', description: 'Situazione finanziaria solida' },
      { min: 10, max: 20, label: '10-20%', color: '#68d391', name: 'Indebitamento Controllato', description: 'Gestione debiti sostenibile' },
      { min: 20, max: 30, label: '20-30%', color: '#f6ad55', name: 'Indebitamento Moderato', description: 'Richiede attenzione' },
      { min: 30, max: 40, label: '30-40%', color: '#ed8936', name: 'Indebitamento Elevato', description: 'Situazione critica' },
      { min: 40, max: 50, label: '40-50%', color: '#fc8181', name: 'Indebitamento Molto Elevato', description: 'Richiede intervento urgente' },
      { min: 50, max: 1000, label: '50%+', color: '#f56565', name: 'Sovraindebitamento', description: 'Situazione insostenibile' }
    ];
    
    // Find user's segment
    let userSegment = timelineSegments.find(seg => debtBurdenPercent >= seg.min && debtBurdenPercent < seg.max);
    if (!userSegment) {
      // If over 100%, use the last segment
      userSegment = timelineSegments[timelineSegments.length - 1];
    }
    
    // Determine risk level and color based on user segment
    const riskLevel = userSegment.name;
    const riskColor = userSegment.color;
    const riskDescription = userSegment.description;
    
    // Calculate sustainability score (0-100) based on debt burden
    let sustainabilityScore = 100;
    if (debtBurdenPercent > 0) {
      sustainabilityScore = Math.max(0, 100 - (debtBurdenPercent * 1.2));
    }
    
    // Determine recommended action based on debt burden
    let recommendedAction = '';
    if (debtBurdenPercent >= 50) {
      recommendedAction = 'Consulenza urgente con professionisti specializzati in procedure di sovraindebitamento e composizione delle crisi.';
    } else if (debtBurdenPercent >= 40) {
      recommendedAction = 'Valutazione approfondita con consulenti esperti per definire un piano di rientro strutturato.';
    } else if (debtBurdenPercent >= 30) {
      recommendedAction = 'Consulenza preventiva per ottimizzare la gestione dei debiti e prevenire situazioni critiche.';
    } else if (debtBurdenPercent >= 20) {
      recommendedAction = 'Monitoraggio della situazione e consulenza per ottimizzare la gestione finanziaria.';
    } else {
      recommendedAction = 'La tua situazione è gestibile. Una consulenza può aiutarti a ottimizzare ulteriormente.';
    }
    
    // Calculate months to pay off (assuming 30% of income can go to debt)
    const monthlyDebtPayment = monthlyIncome * 0.30;
    const monthsToPayOff = monthlyDebtPayment > 0 ? Math.ceil(totalDebt / monthlyDebtPayment) : 0;
    
    // Generate timeline HTML
    const timelineHTML = timelineSegments.map(seg => {
      const isUserSegment = seg === userSegment;
      const opacity = isUserSegment ? 1 : 0.3;
      const scale = isUserSegment ? 1.05 : 1;
      const borderWidth = isUserSegment ? '3px' : '1px';
      const fontWeight = isUserSegment ? '700' : '500';
      
      return `
        <div style="
          flex: 1;
          padding: var(--spacing-md) var(--spacing-sm);
          background: ${isUserSegment ? seg.color + '20' : seg.color + '0a'};
          border: ${borderWidth} solid ${seg.color};
          border-radius: var(--radius-md);
          text-align: center;
          opacity: ${opacity};
          transform: scale(${scale});
          transition: all 0.3s ease;
          position: relative;
          ${isUserSegment ? 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10;' : ''}
        ">
          <div style="font-size: 0.75rem; font-weight: ${fontWeight}; color: ${isUserSegment ? seg.color : '#999'}; margin-bottom: var(--spacing-xs);">
            ${seg.label}
          </div>
          <div style="font-size: 0.7rem; color: ${isUserSegment ? '#333' : '#999'}; line-height: 1.3;">
            ${seg.name}
          </div>
          ${isUserSegment ? `
            <div style="
              position: absolute;
              top: -10px;
              right: -10px;
              width: 28px;
              height: 28px;
              background: ${seg.color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 3px solid white;
            ">📍</div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    const analysisHTML = `
      <div style="margin-bottom: var(--spacing-xl);">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
          <div style="padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--radius-lg); text-align: center;">
            <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-xs);">Debito Totale</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--accent);">€ ${totalDebt.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
          <div style="padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--radius-lg); text-align: center;">
            <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-xs);">Reddito Mensile</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--brand);">€ ${monthlyIncome.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
          <div style="padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--radius-lg); text-align: center;">
            <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-xs);">Rata Totale Potenziale</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--accent);">€ ${weightedMonthlyDebt.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
          <div style="padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--radius-lg); text-align: center;">
            <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-xs);">% Indebitamento</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: ${riskColor};">${debtBurdenPercent.toFixed(1)}%</div>
          </div>
        </div>
        
        <div style="margin-bottom: var(--spacing-xl);">
          <h3 style="margin-bottom: var(--spacing-md); color: var(--text-primary);">Timeline Indebitamento</h3>
          <div style="display: flex; gap: var(--spacing-xs); margin-bottom: var(--spacing-md);">
            ${timelineHTML}
          </div>
          <div style="padding: var(--spacing-lg); background: linear-gradient(135deg, ${riskColor}15 0%, ${riskColor}05 100%); border-left: 4px solid ${riskColor}; border-radius: var(--radius-lg);">
            <h4 style="margin: 0 0 var(--spacing-sm) 0; color: var(--text-primary); display: flex; align-items: center; gap: var(--spacing-sm);">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${riskColor};"></span>
              La tua situazione: <span style="color: ${riskColor};">${riskLevel}</span>
            </h4>
            <p style="margin: 0; color: var(--text-primary); line-height: 1.6;">${riskDescription}</p>
            <p style="margin: var(--spacing-sm) 0 0 0; font-size: 0.9rem; color: var(--text-muted);">
              Il tuo livello di indebitamento è del <strong>${debtBurdenPercent.toFixed(1)}%</strong>, calcolato dividendo la rata mensile ponderata (€ ${weightedMonthlyDebt.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}) per il tuo reddito mensile netto.
            </p>
          </div>
        </div>
        
        <div style="margin-bottom: var(--spacing-xl);">
          <h3 style="margin-bottom: var(--spacing-md); color: var(--text-primary);">Indicatori di Sostenibilità</h3>
          <div style="display: grid; gap: var(--spacing-md);">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                <span style="color: var(--text-primary); font-weight: 600;">Punteggio Sostenibilità</span>
                <span style="color: var(--text-muted);">${sustainabilityScore.toFixed(0)}/100</span>
              </div>
              <div style="height: 12px; background: var(--bg-secondary); border-radius: var(--radius-full); overflow: hidden;">
                <div style="height: 100%; width: ${sustainabilityScore}%; background: ${sustainabilityScore >= 70 ? '#48bb78' : sustainabilityScore >= 50 ? '#f6ad55' : '#f56565'}; transition: width 0.5s ease;"></div>
              </div>
            </div>
            <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
              <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-xs);">Tempo stimato per estinzione debiti</div>
              <div style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">
                ${monthsToPayOff > 0 ? `${monthsToPayOff} mesi` : 'Non calcolabile'}
                ${monthsToPayOff > 0 ? `(${Math.floor(monthsToPayOff / 12)} anni e ${monthsToPayOff % 12} mesi)` : ''}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--spacing-xs);">
                Calcolo basato su un impegno mensile del 30% del reddito netto
              </div>
            </div>
          </div>
        </div>
        
        <div style="padding: var(--spacing-lg); background: var(--brand); color: #fff; border-radius: var(--radius-lg); margin-bottom: var(--spacing-xl);">
          <h3 style="margin: 0 0 var(--spacing-md) 0; color: #fff;">Raccomandazione</h3>
          <p style="margin: 0; line-height: 1.6; color: rgba(255,255,255,0.95);">${recommendedAction}</p>
        </div>
        
        <div style="padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--radius-lg);">
          <h4 style="margin: 0 0 var(--spacing-md) 0; color: var(--text-primary);">Prossimi Passi Suggeriti</h4>
          <ul style="margin: 0; padding-left: var(--spacing-lg); color: var(--text-primary); line-height: 1.8;">
            <li>Consulta un professionista qualificato per un'analisi approfondita della tua situazione</li>
            <li>Valuta le opzioni disponibili per la gestione e la ristrutturazione dei debiti</li>
            <li>Considera la possibilità di procedure strutturate come saldo e stralcio o composizione delle crisi</li>
            <li>Mantieni un monitoraggio costante della tua situazione finanziaria</li>
          </ul>
        </div>
    `;
    
    const analysisContent = document.getElementById('analysis-content');
    if (analysisContent) {
      analysisContent.innerHTML = analysisHTML;
    }
    
    // Show analysis step
    const analysisStep = document.getElementById('step-analysis');
    if (analysisStep) {
      // Hide other steps
      [DOM.step1, DOM.step2, DOM.step3].forEach(step => {
        if (step) {
          step.hidden = true;
          step.classList.remove('active');
        }
      });
      
      analysisStep.hidden = false;
      state.currentStep = 2.5;
      Wizard.updateProgress(2.5); // Between step 2 and 3
      Utils.scrollToTop();
      
      // Setup buttons for analysis step - attach directly to ensure it works
      setTimeout(() => {
        const backBtn = document.getElementById('back-analysis');
        const nextBtn = document.getElementById('to-privacy');
        
        if (backBtn) {
          backBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            Wizard.closeIncomeDataPopup();
            Wizard.showIncomeDataPopup();
          };
        }
        
        if (nextBtn) {
          nextBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Avanti cliccato - andando a privacy');
            Wizard.goToPrivacy();
          };
        } else {
          console.error('Bottone to-privacy non trovato!');
        }
      }, 200);
    }
  },
  
  /**
   * Move to Privacy step (Step 3) and save target filter for professionals
   */
  goToPrivacy: () => {
    // Determine appropriate filter based on selections for professionals page
    let targetFilter = 'all';
    if (state.selections.includes('banche_finanziarie')) {
      targetFilter = 'bancari';
    } else if (state.selections.includes('fiscali_tributari') || state.selections.includes('previdenziali')) {
      targetFilter = 'fiscali';
    } else if (state.selections.includes('utenze_servizi')) {
      targetFilter = 'privati';
    } else if (state.selections.includes('procedure_esecutive')) {
      targetFilter = 'aziende';
    }
    // Save target filter for later use
    state.targetFilter = targetFilter;
    // Generate review HTML for privacy step
    const chipsHTML = state.selections
      .map(sel => `<span class="pill">${DEBT_LABELS[sel] || sel}</span>`)
      .join(' ');
    
    // Calculate total
    let totalAmount = state.formData.totalAmount || 0;
    
    // Generate debts detail
    let debtsDetail = '';
    state.selections.forEach(debtType => {
      const creditors = state.debtCreditors[debtType] || [];
      const typeLabel = DEBT_LABELS[debtType] || debtType;
      
      if (creditors.length === 0) {
        debtsDetail += `<li><b>${typeLabel}:</b> Nessun dettaglio specificato</li>`;
      } else {
        creditors.forEach((item, index) => {
          const hasContent = item.subCategory || item.creditor || (Number(item.amount) || 0) > 0;
          if (hasContent) {
            const subLabel = Wizard.getSubcategoryLabel(debtType, item.subCategory) || 'Voce non specificata';
            const creditorName = item.creditor ? ` • ${item.creditor}` : '';
            const amountText = `€ ${Number(item.amount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            debtsDetail += `<li><b>${typeLabel}${creditors.length > 1 ? ` (${index + 1})` : ''}:</b> ${subLabel}${creditorName} - ${amountText}</li>`;
          }
        });
      }
    });
    
    const reviewHTML = `
      <div style="margin-bottom: var(--spacing-xl); padding: var(--spacing-md);">
        <p style="margin: 0 0 var(--spacing-sm); font-size: 0.875rem; color: var(--text-muted); font-weight: 600;">Tipologie di debiti selezionate:</p>
        <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm); align-items: center;">
          ${chipsHTML || '<span style="color: var(--text-muted); font-size: 0.875rem;">Nessuna tipologia selezionata</span>'}
        </div>
      </div>
      <ul>
        <li><b>Nome:</b> ${state.formData.nome} ${state.formData.cognome}</li>
        <li><b>Cellulare:</b> ${state.formData.telefono}</li>
        <li><b>Email:</b> ${state.formData.email}</li>
        <li><b>Località:</b> ${state.formData.citta || 'N/D'} ${state.formData.provincia ? `- ${Geo.getProvinceLabel(state.formData.provincia)}` : ''} ${state.formData.cap ? `(CAP ${state.formData.cap})` : ''}</li>
        <li><b>Reddito mensile netto:</b> € ${(state.formData.redditoMensile || 0).toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</li>
      </ul>
      <h3 style="margin-top:24px; margin-bottom:12px;">Dettaglio Debiti:</h3>
      <ul>
        ${debtsDetail}
      </ul>
      <div style="margin-top:20px; padding:16px; background:#e6f4ff; border-radius:12px;">
        <div style="font-size:0.875rem; color:var(--text-muted);">Totale complessivo:</div>
        <div style="font-size:1.75rem; font-weight:800; color:var(--accent);">€ ${totalAmount.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
    `;
    DOM.reviewDiv.innerHTML = reviewHTML;
    
    // Show step 3 (privacy) using showStep
    console.log('Chiamando showStep(3)');
    Wizard.showStep(3);
  },
  
  /**
   * Move to Step 3 (Review) - OLD, now redirects to privacy
   */
  goToStep3: () => {
    DOM.successMsg.style.display = 'none';
    
    if (!Wizard.validateAllFields()) {
      return;
    }
    
    // Recalculate all creditors from inputs
    state.selections.forEach(debtType => {
      const detailsContainer = document.getElementById(`details-${debtType}`);
      if (detailsContainer) {
        state.debtCreditors[debtType] = [];
        const items = detailsContainer.querySelectorAll('.debt-item');
        items.forEach(item => {
          const select = item.querySelector('.subcategory-select');
          const creditorInput = item.querySelector('.creditor-input');
          const amountInput = item.querySelector('.amount-input-field');
          if (creditorInput && amountInput) {
            state.debtCreditors[debtType].push({
              subCategory: select ? select.value : '',
              creditor: creditorInput.value.trim(),
              amount: Number(amountInput.value) || 0
            });
          }
        });
      }
    });
    
    // Calculate total
    let totalAmount = 0;
    Object.values(state.debtCreditors).forEach(creditors => {
      if (Array.isArray(creditors)) {
        creditors.forEach(item => {
          totalAmount += Number(item.amount) || 0;
        });
      }
    });
    
    // Collect form data
    state.formData = {
      nome: document.getElementById('nome').value.trim(),
      cognome: document.getElementById('cognome').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      email: document.getElementById('email').value.trim(),
      citta: document.getElementById('citta').value.trim(),
      provincia: document.getElementById('provincia').value.trim(),
      cap: document.getElementById('cap').value.trim(),
      totalAmount: totalAmount
    };
    
    // Generate debts detail with all creditors
    let debtsDetail = '';
    state.selections.forEach(debtType => {
      const creditors = state.debtCreditors[debtType] || [];
      const typeLabel = DEBT_LABELS[debtType] || debtType;
      
      if (creditors.length === 0) {
        debtsDetail += `<li><b>${typeLabel}:</b> Nessun dettaglio specificato</li>`;
      } else {
        creditors.forEach((item, index) => {
          const hasContent = item.subCategory || item.creditor || (Number(item.amount) || 0) > 0;
          if (hasContent) {
            const subLabel = Wizard.getSubcategoryLabel(debtType, item.subCategory) || 'Voce non specificata';
            const creditorName = item.creditor ? ` • ${item.creditor}` : '';
            const amountText = `€ ${Number(item.amount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            debtsDetail += `<li><b>${typeLabel}${creditors.length > 1 ? ` (${index + 1})` : ''}:</b> ${subLabel}${creditorName} - ${amountText}</li>`;
          }
        });
      }
    });
    
    // Generate debt tags for review
    const debtTagsHTML = state.selections
      .map(sel => `<span class="pill">${DEBT_LABELS[sel] || sel}</span>`)
      .join(' ');
    
    // Generate review HTML
    const reviewHTML = `
      <div style="margin-bottom: var(--spacing-xl); padding: var(--spacing-md);">
        <p style="margin: 0 0 var(--spacing-sm); font-size: 0.875rem; color: var(--text-muted); font-weight: 600;">Tipologie di debiti selezionate:</p>
        <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm); align-items: center;">
          ${debtTagsHTML || '<span style="color: var(--text-muted); font-size: 0.875rem;">Nessuna tipologia selezionata</span>'}
        </div>
      </div>
      <ul>
        <li><b>Nome:</b> ${state.formData.nome} ${state.formData.cognome}</li>
        <li><b>Cellulare:</b> ${state.formData.telefono}</li>
        <li><b>Email:</b> ${state.formData.email}</li>
        <li><b>Località:</b> ${state.formData.citta || 'N/D'} ${state.formData.provincia ? `- ${Geo.getProvinceLabel(state.formData.provincia)}` : ''} ${state.formData.cap ? `(CAP ${state.formData.cap})` : ''}</li>
      </ul>
      <h3 style="margin-top:24px; margin-bottom:12px;">Dettaglio Debiti:</h3>
      <ul>
        ${debtsDetail}
      </ul>
      <div style="margin-top:20px; padding:16px; background:#e6f4ff; border-radius:12px;">
        <div style="font-size:0.875rem; color:var(--text-muted);">Totale complessivo:</div>
        <div style="font-size:1.75rem; font-weight:800; color:var(--accent);">€ ${totalAmount.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
    `;
    DOM.reviewDiv.innerHTML = reviewHTML;
    
    Wizard.showStep(3);
  },
  
  /**
   * Initialize Step 1 event listeners
   */
  initStep1: () => {
    DOM.optionButtons.forEach(btn => {
      btn.addEventListener('click', () => Wizard.handleOptionClick(btn));
    });
    
    DOM.toStep2Btn.addEventListener('click', Wizard.goToStep2);
  },
  
  /**
   * Initialize Step 2 event listeners
   */
  initStep2: () => {
    // Real-time validation on input (debounced)
    ['nome', 'cognome', 'telefono', 'email', 'citta', 'provincia', 'cap'].forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (input) {
        let timeout;
        
        // Real-time validation while typing (debounced)
        input.addEventListener('input', () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            Wizard.validateField(fieldId, input.value, true);
          }, 300);
          
          state.formData[fieldId] = input.value.trim();
          Wizard.saveStateToStorage();
        });
        
        // Immediate validation on blur
      input.addEventListener('blur', () => {
          clearTimeout(timeout);
          Wizard.validateField(fieldId, input.value, true);
        });
        
        // Ensure selects trigger validation on change
        input.addEventListener('change', () => {
          Wizard.validateField(fieldId, input.value, true);
          state.formData[fieldId] = input.value.trim();
          Wizard.saveStateToStorage();
        });
        
        // Save on change already handled above
      }
    });
    
    DOM.back1Btn.addEventListener('click', () => {
      Wizard.showStep(1);
    });
    DOM.toStep3Btn.addEventListener('click', Wizard.goToStep3);
  },
  
  /**
   * Save current state to LocalStorage
   */
  saveStateToStorage: () => {
    try {
      const saveData = {
        currentStep: state.currentStep,
        selections: state.selections,
        debtCreditors: state.debtCreditors,
        formData: state.formData,
        timestamp: Date.now()
      };
      localStorage.setItem('debitoZeroWizard', JSON.stringify(saveData));
    } catch (e) {
      console.warn('LocalStorage non disponibile:', e);
    }
  },
  
  /**
   * Load state from LocalStorage
   */
  loadStateFromStorage: () => {
    try {
      const saved = localStorage.getItem('debitoZeroWizard');
      if (!saved) return;
      
      const saveData = JSON.parse(saved);
      
      // Only restore if saved less than 24 hours ago
      const hoursSinceSave = (Date.now() - saveData.timestamp) / (1000 * 60 * 60);
      if (hoursSinceSave > 24) {
        localStorage.removeItem('debitoZeroWizard');
        return;
      }
      
      // Restore form fields
      if (saveData.formData) {
        const fields = ['nome', 'cognome', 'telefono', 'email', 'citta', 'provincia', 'cap'];
        fields.forEach(fieldId => {
          const input = document.getElementById(fieldId);
          if (input && saveData.formData[fieldId]) {
            input.value = saveData.formData[fieldId];
            // Validate restored field
            setTimeout(() => {
              Wizard.validateField(fieldId, input.value, true);
            }, 100);
          }
        });
      }
      
      // Restore selections and creditors (will be shown on init)
      if (saveData.selections && saveData.currentStep > 1) {
        state.selections = saveData.selections;
        state.debtCreditors = saveData.debtCreditors || {};
      }
      
      // Restore form data
      return saveData;
    } catch (e) {
      console.warn('Errore nel caricamento da LocalStorage:', e);
    }
  },
  
  /**
   * Clear saved state
   */
  clearSavedState: () => {
    try {
      localStorage.removeItem('debitoZeroWizard');
    } catch (e) {
      console.warn('Errore nel cancellare LocalStorage:', e);
    }
  },
  
  /**
   * Initialize Step 3 event listeners
   */
  initStep3: () => {
    // Back button from privacy goes to analysis
    if (DOM.backPrivacyBtn) {
      DOM.backPrivacyBtn.addEventListener('click', () => {
        Wizard.showAnalysis();
      });
    }
    // Legacy back button (if exists)
    if (DOM.back2Btn) {
      DOM.back2Btn.addEventListener('click', () => {
        Wizard.showAnalysis();
      });
    }
    DOM.submitBtn.addEventListener('click', Modal.open);
  },
  
  /**
   * Initialize wizard
   */
  init: () => {
    Wizard.initStep1();
    Wizard.initStep2();
    Wizard.initStep3();
    
    
    // Check for saved state on load
    const savedData = Wizard.loadStateFromStorage();
    
    if (savedData && savedData.currentStep > 1) {
      // Show restore prompt only if there's significant progress
      const shouldRestore = confirm('Hai una richiesta in sospeso. Vuoi continuare da dove hai lasciato?');
      
      if (shouldRestore) {
        // Restore selections first
        if (savedData.selections) {
          state.selections = savedData.selections.filter(sel => DEBT_LABELS[sel]);
          state.debtCreditors = savedData.debtCreditors || {};
          Object.keys(state.debtCreditors).forEach(key => {
            if (!DEBT_LABELS[key]) {
              delete state.debtCreditors[key];
            }
          });
          
          // Restore UI for selections
          savedData.selections.forEach(sel => {
            const button = document.querySelector(`[data-value="${sel}"]`);
            if (button) {
              button.classList.add('selected');
              button.setAttribute('aria-pressed', 'true');
              const detailsContainer = document.getElementById(`details-${sel}`);
              if (detailsContainer) {
                detailsContainer.style.display = 'block';
                Wizard.renderDebtDetails(sel);
              }
            }
          });
          
          Wizard.updateTotalAmount();
          Wizard.goToStep2();
        }
        Wizard.showStep(savedData.currentStep);
      } else {
        localStorage.removeItem('debitoZeroWizard');
    Wizard.showStep(1);
      }
    } else {
      Wizard.showStep(1);
    }
    
    // Update global back button on init
    Navigation.updateGlobalBackButton();
  }
};

// ==================== EMAIL SERVICE ====================
const EmailService = {
  /**
   * Initialize EmailJS
   */
  init: () => {
    console.log('🔧 Inizializzazione EmailJS...');
    console.log('EmailJS disponibile:', typeof emailjs !== 'undefined');
    console.log('Public Key configurata:', EMAIL_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY');
    console.log('Public Key:', EMAIL_CONFIG.publicKey);
    console.log('Service ID:', EMAIL_CONFIG.serviceId);
    console.log('Template ID:', EMAIL_CONFIG.templateId);
    
    if (typeof emailjs !== 'undefined' && EMAIL_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
      try {
      emailjs.init(EMAIL_CONFIG.publicKey);
        console.log('✅ EmailJS initialized con successo');
      } catch (initError) {
        console.error('❌ Errore inizializzazione EmailJS:', initError);
      }
    } else {
      console.warn('⚠️ EmailJS non configurato. Leggi CONFIG-EMAIL.txt');
      if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS SDK non caricato. Verifica che lo script sia incluso in index.html');
      }
      if (EMAIL_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        console.error('❌ Public Key non configurata in EMAIL_CONFIG');
      }
    }
  },
  
  /**
   * Send email with form data
   */
  sendEmail: async () => {
    // Hide previous messages
    DOM.successMsg.style.display = 'none';
    DOM.emailErrorMsg.style.display = 'none';
    DOM.sendingMsg.style.display = 'block';
    
    // Check if EmailJS is configured
    if (EMAIL_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || typeof emailjs === 'undefined') {
      console.warn('⚠️ EmailJS non configurato - simulazione invio');
      DOM.sendingMsg.style.display = 'none';
      DOM.successMsg.style.display = 'block';
      return true;
    }
    
    try {
      // Prepare debts detail with all creditors
      let debtsDetail = '';
      state.selections.forEach(debtType => {
        const creditors = state.debtCreditors[debtType] || [];
        const typeLabel = DEBT_LABELS[debtType] || debtType;
        
        if (creditors.length === 0) {
          debtsDetail += `${typeLabel}: Nessun creditore specificato\n`;
        } else {
          creditors.forEach((item, index) => {
            if (item.creditor || item.amount > 0) {
              const creditorName = item.creditor || 'Creditore non specificato';
              debtsDetail += `${typeLabel}${creditors.length > 1 ? ` (${index + 1})` : ''}: ${creditorName} - € ${item.amount.toLocaleString('it-IT', {minimumFractionDigits: 2})}\n`;
            }
          });
        }
      });
      
      const consentData = state.formData.privacyConsents || { service: false, marketing: false, profiling: false };
      const consentSummaryText = `Servizio richiesto: ${consentData.service ? 'SI' : 'NO'} | Marketing: ${consentData.marketing ? 'SI' : 'NO'} | Profilazione: ${consentData.profiling ? 'SI' : 'NO'}`;
      const storageDebtDetails = `${debtsDetail.trim()}\n\nConsensi privacy:\n- Servizio richiesto: ${consentData.service ? 'SI' : 'NO'}\n- Marketing: ${consentData.marketing ? 'SI' : 'NO'}\n- Profilazione: ${consentData.profiling ? 'SI' : 'NO'}`;
      
      // Prepare email data
      const emailData = {
        to_email: EMAIL_CONFIG.recipientEmail,
        from_name: `${state.formData.nome} ${state.formData.cognome}`,
        from_email: state.formData.email,
        email: state.formData.email,  // ← Per Reply To
        nome: state.formData.nome,    // ← Per From Name nel template
        phone: state.formData.telefono,
        client_city: state.formData.citta || '',
        client_province: state.formData.provincia || '',
        client_cap: state.formData.cap || '',
        debt_types: state.selections.map(s => DEBT_LABELS[s] || s).join(', '),
        debt_details: debtsDetail.trim(),
        debt_amount: `€ ${state.formData.totalAmount.toLocaleString('it-IT', {minimumFractionDigits: 2})}`,
        submission_date: new Date().toLocaleString('it-IT'),
        consent_summary: consentSummaryText
      };
      
      // Send via EmailJS
      console.log('📧 Invio email richiesta cliente...');
      console.log('Service ID:', EMAIL_CONFIG.serviceId);
      console.log('Template ID:', EMAIL_CONFIG.templateId);
      console.log('Email data:', emailData);
      
      const response = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        emailData
      );
      
      console.log('✅ Email inviata con successo:', response);
      console.log('Response status:', response.status);
      console.log('Response text:', response.text);
      DOM.sendingMsg.style.display = 'none';
      DOM.successMsg.style.display = 'block';
      
      // Save request to admin dashboard
      try {
        const requestDate = new Date();
        const requestData = {
          name: state.formData.nome,
          surname: state.formData.cognome,
          email: state.formData.email,
          phone: state.formData.telefono,
          city: state.formData.citta,
          province: state.formData.provincia,
          cap: state.formData.cap,
          debtTypes: state.selections.map(s => DEBT_LABELS[s] || s).join(', '),
          totalAmount: `€ ${state.formData.totalAmount.toLocaleString('it-IT', {minimumFractionDigits: 2})}`,
          totalAmountNumber: state.formData.totalAmount,
          monthlyIncome: state.formData.redditoMensile || null, // Reddito mensile netto
          debtDetails: storageDebtDetails,
          consentSummary: consentSummaryText,
          date: requestDate.toLocaleString('it-IT'),
          dateISO: requestDate.toISOString()
        };
        
        const existingRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
        existingRequests.push(requestData);
        localStorage.setItem('clientRequests', JSON.stringify(existingRequests));
        
        if (SupabaseService.isReady()) {
          SupabaseService.saveClientRequest(requestData);
        }
      } catch (e) {
        console.error('Errore salvataggio richiesta:', e);
      }
      
      // Send confirmation email to client
      if (state.formData.email && EMAIL_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
        try {
          const confirmationEmailData = {
            to_email: state.formData.email,
            from_name: 'Tatosolvi',
            subject: '✅ Richiesta ricevuta - Tatosolvi',
            client_name: `${state.formData.nome} ${state.formData.cognome}`,
            client_city: state.formData.citta || '',
            client_province: state.formData.provincia || '',
            client_cap: state.formData.cap || '',
            debt_types: state.selections.map(s => DEBT_LABELS[s] || s).join(', '),
            debt_amount: `€ ${state.formData.totalAmount.toLocaleString('it-IT', {minimumFractionDigits: 2})}`,
            submission_date: new Date().toLocaleString('it-IT'),
            message: `Gentile ${state.formData.nome},

La tua richiesta è stata ricevuta con successo.

Un nostro operatore ti contatterà a breve per valutare la tua situazione e metterti in contatto con i professionisti più adatti.

Nel frattempo, puoi esplorare i professionisti disponibili sulla piattaforma.

Dettagli della richiesta:
- Tipologie debiti: ${state.selections.map(s => DEBT_LABELS[s] || s).join(', ')}
- Importo totale: € ${state.formData.totalAmount.toLocaleString('it-IT', {minimumFractionDigits: 2})}
- Località: ${state.formData.citta || 'N/D'} ${state.formData.provincia ? `(${state.formData.provincia})` : ''} ${state.formData.cap ? `- CAP ${state.formData.cap}` : ''}
- Data richiesta: ${new Date().toLocaleString('it-IT')}

Cordiali saluti,
Il team di Tatosolvi`
          };
          
          // Use separate template for client confirmation
          console.log('📧 Invio email conferma cliente...');
          console.log('Template ID:', EMAIL_CONFIG.templateIdConfirmation);
          console.log('Confirmation email data:', confirmationEmailData);
          
          emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templateIdConfirmation, // Template dedicato per conferma cliente
            confirmationEmailData
          ).then(() => {
            console.log('✅ Email di conferma inviata al cliente');
          }).catch(err => {
            console.error('⚠️ Errore invio email conferma (non critico):', err);
            console.error('Dettagli errore conferma:', {
              status: err.status,
              text: err.text,
              message: err.message
            });
            // Don't fail the whole process if confirmation email fails
          });
        } catch (e) {
          console.error('⚠️ Errore preparazione email conferma (non critico):', e);
        }
      }
      
      // Clear saved state after successful submission
      Wizard.clearSavedState();
      
      return true;
      
    } catch (error) {
      console.error('❌ Errore invio email:', error);
      console.error('Dettagli errore:', {
        status: error.status,
        text: error.text,
        message: error.message,
        stack: error.stack
      });
      DOM.sendingMsg.style.display = 'none';
      DOM.emailErrorMsg.style.display = 'block';
      
      // Still show success to user but log error
      setTimeout(() => {
        DOM.emailErrorMsg.style.display = 'none';
        DOM.successMsg.style.display = 'block';
      }, 3000);
      
      return false;
    }
  }
};

// Make Wizard available globally
window.Wizard = Wizard;

// ==================== MODAL ====================
const Modal = {
  /**
   * Open GDPR modal
   */
  open: () => {
    if (DOM.consentServiceChk) DOM.consentServiceChk.checked = false;
    if (DOM.consentMarketingChk) DOM.consentMarketingChk.checked = false;
    if (DOM.consentProfilingChk) DOM.consentProfilingChk.checked = false;
    state.formData.privacyConsents = { service: false, marketing: false, profiling: false };
    DOM.confirmSendBtn.disabled = true;
    DOM.modal.classList.add('show');
  },
  
  /**
   * Close modal
   */
  close: () => {
    DOM.modal.classList.remove('show');
  },
  
  /**
   * Handle form submission
   */
  handleSubmit: async () => {
    const consentData = {
      service: DOM.consentServiceChk?.checked || false,
      marketing: DOM.consentMarketingChk?.checked || false,
      profiling: DOM.consentProfilingChk?.checked || false
    };
    state.formData.privacyConsents = consentData;
    
    Modal.close();
    
    // Send email
    await EmailService.sendEmail();
    
    // Use saved target filter from goToPrivacy, or determine from selections
    const targetFilter = state.targetFilter || (() => {
      let filter = 'all';
      if (state.selections.includes('banche_finanziarie')) {
        filter = 'bancari';
      } else if (state.selections.includes('fiscali_tributari') || state.selections.includes('previdenziali')) {
        filter = 'fiscali';
      } else if (state.selections.includes('utenze_servizi')) {
        filter = 'privati';
      } else if (state.selections.includes('procedure_esecutive')) {
        filter = 'aziende';
      }
      return filter;
    })();
    
    // Navigate to professionals page with correct filter
    setTimeout(() => {
      Navigation.showProfessionals();
      Professionals.applyFilter(targetFilter);
    }, 2000);
  },
  
  /**
   * Initialize modal event listeners
   */
  init: () => {
    const checkboxes = [DOM.consentServiceChk, DOM.consentMarketingChk, DOM.consentProfilingChk];
    checkboxes.forEach(chk => {
      if (chk) {
        chk.addEventListener('change', () => {
          DOM.confirmSendBtn.disabled = !(DOM.consentServiceChk && DOM.consentServiceChk.checked);
        });
      }
    });
    
    DOM.closeModalBtn.addEventListener('click', Modal.close);
    DOM.confirmSendBtn.addEventListener('click', Modal.handleSubmit);
    
    // Close modal on backdrop click
    DOM.modal.addEventListener('click', (e) => {
      if (e.target === DOM.modal) {
        Modal.close();
      }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.modal.classList.contains('show')) {
        Modal.close();
      }
    });
  }
};

// ==================== PROFESSIONALS ====================
const Professionals = {
  currentFilter: 'all',
  currentSearch: '',
  currentSort: 'default',
  
  /**
   * Generate HTML for a professional card
   */
  createCard: (pro, index) => {
    // Ensure professional has all required data
    if (!pro.availability) pro.availability = generateAvailability();
    if (!pro.career || !pro.strengths) {
      const careerData = generateCareerData(pro.name, pro.specialty, pro.desc, pro.services);
      pro.career = careerData.career;
      pro.strengths = careerData.strengths;
    }
    
    const tagsHTML = pro.tags.map(tag => {
      const tagLabels = { bancari: 'Bancari', fiscali: 'Fiscali/Tributari', aziende: 'Aziende', privati: 'Privati' };
      return `<span class="tag">${tagLabels[tag] || tag}</span>`;
    }).join('');
    const locationText = pro.city
      ? `${pro.city}${pro.province ? ` (${pro.province})` : ''}${pro.cap ? ` • CAP ${pro.cap}` : ''}`
      : 'Località non specificata';
    const locationSearch = `${(pro.city || '').toLowerCase()} ${(pro.province || '').toLowerCase()} ${(pro.cap || '')}`;
    
    // Generate availability preview (next 3 days)
    const availabilityPreview = pro.availability.slice(0, 3).map(day => {
      const timeSlots = day.times.slice(0, 2).join(', '); // Mostra max 2 orari
      const moreSlots = day.times.length > 2 ? ` +${day.times.length - 2}` : '';
      return `
        <div class="avail-day">
          <span class="avail-date">${day.dayName} ${day.dayNumber} ${day.month}</span>
          <span class="avail-times">${timeSlots}${moreSlots}</span>
        </div>
      `;
    }).join('');
    
    // Calculate rating display
    const rating = pro.rating || 0;
    const reviewCount = pro.reviewCount || 0;
    const starsHTML = ReviewsSystem.renderStars(rating, 'small');
    
    return `
      <article class="pro-card" data-tags="${pro.tags.join(' ')}" data-searchtext="${pro.name.toLowerCase()} ${pro.specialty.toLowerCase()} ${pro.services.toLowerCase()} ${pro.desc.toLowerCase()} ${locationSearch}" data-pro-index="${index}" data-rating="${rating}">
        <h3 class="pro-title">${pro.name}</h3>
        <div class="pro-rating" style="margin-top:8px;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
          ${starsHTML}
          ${rating > 0 ? `<span style="color:var(--text-muted);font-size:0.9rem;">${rating.toFixed(1)}</span>` : ''}
          ${reviewCount > 0 ? `<span style="color:var(--text-muted);font-size:0.85rem;">(${reviewCount} ${reviewCount === 1 ? 'recensione' : 'recensioni'})</span>` : '<span style="color:var(--text-muted);font-size:0.85rem;">Nessuna recensione</span>'}
        </div>
        <div class="pro-sub">${pro.specialty}</div>
        <div class="pro-sub" style="margin-top:4px; font-size:0.85rem;">${pro.services}</div>
        <div class="pro-price">da € ${pro.price}</div>
        <div class="pro-location">📍 ${locationText}</div>
        <p class="pro-desc">${pro.desc}</p>
        
        <div class="availability-preview">
          <div class="avail-header">📅 Prossimi appuntamenti disponibili:</div>
          ${availabilityPreview}
        </div>
        
        <div class="tags">${tagsHTML}</div>
        <button type="button" class="pro-cta" onclick="Professionals.openDetails(${index})">Vedi dettagli e prenota</button>
      </article>
    `;
  },
  
  /**
   * Render all professionals
   */
  render: () => {
    const html = Professionals.getSortedData().map(({ pro, index }) => Professionals.createCard(pro, index)).join('');
    DOM.proGrid.innerHTML = html;
    Professionals.applyFilters();
  },
  
  /**
   * Open professional details modal
   */
  openDetails: (index) => {
    const pro = PROFESSIONALS_DATA[index];
    
    // Ensure data is generated
    if (!pro.availability) pro.availability = generateAvailability();
    if (!pro.career || !pro.strengths) {
      const careerData = generateCareerData(pro.name, pro.specialty, pro.desc, pro.services);
      pro.career = careerData.career;
      pro.strengths = careerData.strengths;
    }
    
    // Generate calendar HTML (next 30 days)
    const calendarDays = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Find availability for this date
      const dateStr = date.toISOString().split('T')[0];
      const dayAvailability = pro.availability.find(av => av.date === dateStr);
      
      if (dayAvailability && dayAvailability.times.length > 0) {
        calendarDays.push({
          date: dateStr,
          dayName: date.toLocaleDateString('it-IT', { weekday: 'short' }),
          dayNumber: date.getDate(),
          month: date.toLocaleDateString('it-IT', { month: 'short' }),
          times: dayAvailability.times
        });
      }
    }
    
    const strengthsHTML = pro.strengths.map(s => `<li>✓ ${s}</li>`).join('');
    const calendarHTML = calendarDays.map(day => `
      <div class="calendar-day">
        <div class="cal-date-header">
          <strong>${day.dayName} ${day.dayNumber} ${day.month}</strong>
        </div>
        <div class="cal-times">
          ${day.times.map(time => `
            <button type="button" class="time-slot" onclick="Professionals.bookAppointment(${index}, '${day.date}', '${time}')">
              ${time}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
    
    // Create or update modal
    let modal = document.getElementById('proDetailsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'proDetailsModal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="pro-modal">
          <button class="modal-close" onclick="Professionals.closeDetails()">&times;</button>
          <div class="pro-modal-content"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    const content = modal.querySelector('.pro-modal-content');
    const locationText = pro.city
      ? `${pro.city}${pro.province ? ` (${Geo.getProvinceLabel(pro.province)})` : ''}${pro.cap ? ` • CAP ${pro.cap}` : ''}`
      : 'Località non disponibile';
    content.innerHTML = `
      <div class="pro-modal-header">
        <h2>${pro.name}</h2>
        <div class="pro-modal-specialty">${pro.specialty}</div>
        <div class="pro-modal-price">da € ${pro.price}</div>
        <div class="pro-modal-location">📍 ${locationText}</div>
      </div>
      
      <div class="pro-modal-section">
        <h3>📋 Carriera e Esperienza</h3>
        <p>${pro.career}</p>
      </div>
      
      <div class="pro-modal-section">
        <h3>⭐ Punti di Forza</h3>
        <ul class="strengths-list">${strengthsHTML}</ul>
      </div>
      
      <div class="pro-modal-section">
        <h3>🕐 Servizi Offerti</h3>
        <p>${pro.services}</p>
      </div>
      
      <div class="pro-modal-section">
        <h3>📅 Agenda Disponibile - Seleziona un orario</h3>
        <div class="calendar-container">
          ${calendarHTML || '<p style="color:#718096;">Nessun appuntamento disponibile nei prossimi 30 giorni.</p>'}
        </div>
      </div>
      
      <div class="pro-modal-section" style="border-top:2px solid var(--border);padding-top:var(--spacing-xl);margin-top:var(--spacing-xl);">
        <h3>⭐ Recensioni</h3>
        ${pro.rating > 0 ? `
          <div style="margin-bottom:var(--spacing-lg);">
            <div style="display:flex;align-items:center;gap:var(--spacing-md);margin-bottom:var(--spacing-sm);">
              ${ReviewsSystem.renderStars(pro.rating)}
              <span style="font-size:1.2rem;font-weight:600;color:var(--text-primary);">${pro.rating.toFixed(1)}</span>
              <span style="color:var(--text-muted);">(${pro.reviewCount} ${pro.reviewCount === 1 ? 'recensione' : 'recensioni'})</span>
            </div>
          </div>
        ` : '<p style="color:var(--text-muted);margin-bottom:var(--spacing-lg);">Nessuna recensione ancora.</p>'}
        
        <div style="margin-top:var(--spacing-xl);padding:var(--spacing-lg);background:var(--bg-secondary);border-radius:var(--radius-lg);">
          <p style="font-weight:600;margin-bottom:var(--spacing-md);color:var(--text-primary);">
            Hai avuto un rapporto con questo professionista?
          </p>
          <button type="button" class="btn" onclick="ReviewsSystem.showReviewForm(${index})" style="width:100%;">
            Lascia una recensione
          </button>
        </div>
      </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        Professionals.closeDetails();
      }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        Professionals.closeDetails();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  },
  
  getUserCap: () => {
    const capField = document.getElementById('cap');
    const rawValue = (capField?.value || state.formData.cap || '').trim();
    return Utils.extractDigits(rawValue);
  },
  
  getSortedData: () => {
    const data = PROFESSIONALS_DATA.map((pro, index) => ({ pro, index }));
    switch (Professionals.currentSort) {
      case 'price-asc':
        return data.sort((a, b) => (a.pro.price || 0) - (b.pro.price || 0));
      case 'price-desc':
        return data.sort((a, b) => (b.pro.price || 0) - (a.pro.price || 0));
      case 'rating-desc':
        return data.sort((a, b) => {
          const ratingA = a.pro.rating || 0;
          const ratingB = b.pro.rating || 0;
          if (ratingB !== ratingA) return ratingB - ratingA;
          // If same rating, sort by review count
          return (b.pro.reviewCount || 0) - (a.pro.reviewCount || 0);
        });
      case 'distance': {
        const userCapDigits = Professionals.getUserCap();
        if (userCapDigits.length !== 5) return data;
        const userCapNum = Number(userCapDigits);
        return data.sort((a, b) => {
          const capA = Number(Utils.extractDigits(a.pro.cap || ''));
          const capB = Number(Utils.extractDigits(b.pro.cap || ''));
          const distanceA = Number.isFinite(capA) ? Math.abs(userCapNum - capA) : Number.MAX_SAFE_INTEGER;
          const distanceB = Number.isFinite(capB) ? Math.abs(userCapNum - capB) : Number.MAX_SAFE_INTEGER;
          return distanceA - distanceB;
        });
      }
      default:
        return data;
    }
  },
  
  handleSortChange: () => {
    if (!DOM.sortSelect) return;
    const newSort = DOM.sortSelect.value;
    if (newSort === 'distance') {
      const userCapDigits = Professionals.getUserCap();
      if (userCapDigits.length !== 5) {
        alert('Per ordinare per vicinanza, completa il campo CAP nella pagina dei tuoi dati.');
        DOM.sortSelect.value = Professionals.currentSort;
        return;
      }
    }
    Professionals.currentSort = newSort;
    Professionals.render();
  },
  
  updateSortHint: () => {
    if (!DOM.sortHint) return;
    const userCapDigits = Professionals.getUserCap();
    if (userCapDigits.length === 5) {
      DOM.sortHint.textContent = `CAP impostato: ${userCapDigits}. Ora puoi ordinare per vicinanza.`;
    } else {
      DOM.sortHint.textContent = 'Inserisci il tuo CAP nel modulo dati per ordinare i professionisti per vicinanza.';
    }
  },
  
  /**
   * Close professional details modal
   */
  closeDetails: () => {
    const modal = document.getElementById('proDetailsModal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },
  
  /**
   * Book appointment
   */
  bookAppointment: (proIndex, date, time) => {
    const pro = PROFESSIONALS_DATA[proIndex];
    
    // Show appointment confirmation modal with meeting type selection
    Professionals.showAppointmentModal(proIndex, date, time, pro);
  },
  
  /**
   * Show appointment confirmation modal with meeting type selection
   */
  showAppointmentModal: (proIndex, date, time, pro) => {
    // Create or get appointment modal
    let appointmentModal = document.getElementById('appointmentModal');
    if (!appointmentModal) {
      appointmentModal = document.createElement('div');
      appointmentModal.id = 'appointmentModal';
      appointmentModal.className = 'modal-backdrop';
      document.body.appendChild(appointmentModal);
    }
    
    appointmentModal.innerHTML = `
      <div class="appointment-modal" style="max-width: 500px; padding: var(--spacing-xl); background: var(--card-bg); border-radius: var(--radius-xl); box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
        <button class="modal-close" onclick="Professionals.closeAppointmentModal()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-muted);">&times;</button>
        <h2 style="margin-top: 0; margin-bottom: var(--spacing-lg); color: var(--text-primary);">Conferma Appuntamento</h2>
        <div style="margin-bottom: var(--spacing-lg);">
          <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: var(--spacing-sm);">${pro.name}</div>
          <div style="color: var(--text-muted); margin-bottom: var(--spacing-xs);">📅 ${date}</div>
          <div style="color: var(--text-muted);">🕐 ${time}</div>
        </div>
        
        <div style="margin-bottom: var(--spacing-xl);">
          <label style="display: block; font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary);">Modalità di incontro:</label>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <label style="display: flex; align-items: center; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-normal);">
              <input type="radio" name="meetingType" value="presenza" checked style="margin-right: var(--spacing-md); width: 20px; height: 20px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">🏢 In Presenza</div>
                <div style="font-size: 0.875rem; color: var(--text-muted);">Incontro presso lo studio del professionista</div>
              </div>
            </label>
            <label style="display: flex; align-items: center; padding: var(--spacing-md); border: 2px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-normal);">
              <input type="radio" name="meetingType" value="remoto" style="margin-right: var(--spacing-md); width: 20px; height: 20px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">💻 Da Remoto (Webcam/Meet)</div>
                <div style="font-size: 0.875rem; color: var(--text-muted);">Videochiamata via Google Meet o Zoom</div>
              </div>
            </label>
          </div>
        </div>
        
        <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end;">
          <button type="button" onclick="Professionals.closeAppointmentModal()" class="btn ghost" style="width: auto;">Annulla</button>
          <button type="button" onclick="Professionals.confirmAppointment(${proIndex}, '${date}', '${time}')" class="btn" style="width: auto;">Conferma Prenotazione</button>
        </div>
      </div>
    `;
    
    // Add hover effects
    const labels = appointmentModal.querySelectorAll('label[style*="border"]');
    labels.forEach(label => {
      label.addEventListener('mouseenter', () => {
        if (label.querySelector('input[type="radio"]:checked')) {
          label.style.borderColor = 'var(--accent)';
          label.style.backgroundColor = 'rgba(93, 173, 226, 0.05)';
        } else {
          label.style.borderColor = 'var(--border-hover)';
        }
      });
      label.addEventListener('mouseleave', () => {
        if (label.querySelector('input[type="radio"]:checked')) {
          label.style.borderColor = 'var(--accent)';
          label.style.backgroundColor = 'rgba(93, 173, 226, 0.05)';
        } else {
          label.style.borderColor = 'var(--border)';
          label.style.backgroundColor = 'transparent';
        }
      });
      label.addEventListener('click', () => {
        labels.forEach(l => {
          if (!l.querySelector('input[type="radio"]:checked')) {
            l.style.borderColor = 'var(--border)';
            l.style.backgroundColor = 'transparent';
          }
        });
        label.style.borderColor = 'var(--accent)';
        label.style.backgroundColor = 'rgba(93, 173, 226, 0.05)';
      });
    });
    
    // Set initial checked state
    labels[0].style.borderColor = 'var(--accent)';
    labels[0].style.backgroundColor = 'rgba(93, 173, 226, 0.05)';
    
    appointmentModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Close on backdrop click
    appointmentModal.addEventListener('click', (e) => {
      if (e.target === appointmentModal) {
        Professionals.closeAppointmentModal();
      }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        Professionals.closeAppointmentModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  },
  
  /**
   * Close appointment modal
   */
  closeAppointmentModal: () => {
    const appointmentModal = document.getElementById('appointmentModal');
    if (appointmentModal) {
      appointmentModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },
  
  /**
   * Confirm appointment with selected meeting type
   */
  confirmAppointment: (proIndex, date, time) => {
    const pro = PROFESSIONALS_DATA[proIndex];
    
    // Get selected meeting type
    const meetingTypeRadio = document.querySelector('#appointmentModal input[name="meetingType"]:checked');
    const meetingType = meetingTypeRadio ? meetingTypeRadio.value : 'presenza';
    const meetingTypeLabel = meetingType === 'presenza' ? 'In Presenza' : 'Da Remoto (Webcam/Meet)';
    
    // Close modal
    Professionals.closeAppointmentModal();
    
    // Collect client data if not available
    let clientName = '';
    let clientSurname = '';
    let clientPhone = '';
    let clientEmail = '';
    
    if (state.formData.nome && state.formData.cognome) {
      clientName = state.formData.nome;
      clientSurname = state.formData.cognome;
      clientPhone = state.formData.telefono || '';
      clientEmail = state.formData.email || '';
    } else {
      // Prompt for client data if not in form
      clientName = prompt('Nome del cliente:') || '';
      clientSurname = prompt('Cognome del cliente:') || '';
      clientPhone = prompt('Telefono del cliente (opzionale):') || '';
      clientEmail = prompt('Email del cliente (opzionale):') || '';
    }
    
    const startDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1); // 1 hour appointment
    
    const formatDate = (d) => {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const minutes = String(d.getUTCMinutes()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}00Z`;
    };
    
    const title = encodeURIComponent(`Consulenza con ${pro.name} - Tatosolvi`);
    const details = encodeURIComponent(`Appuntamento di consulenza per gestione debiti`);
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    // Format dates for email
    const eventDate = startDate.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const eventTime = startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const eventEndTime = endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    
    // Send email to professional with complete appointment details
    if (pro.email && EMAIL_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
      const clientFullName = clientName && clientSurname 
        ? `${clientName} ${clientSurname}`.trim()
        : clientName || clientSurname || 'Cliente non specificato';
      
      const appointmentEmailData = {
        to_email: pro.email,
        from_name: 'Tatosolvi',
        subject: `📅 Nuova prenotazione: ${eventDate} alle ${eventTime} - ${meetingTypeLabel}`,
        appointment_professional: pro.name,
        appointment_date: eventDate,
        appointment_time: `${eventTime} - ${eventEndTime}`,
        appointment_duration: '1 ora',
        appointment_type: meetingTypeLabel,
        client_name: clientFullName,
        client_phone: clientPhone || 'Non fornito',
        client_email: clientEmail || 'Non fornita',
        appointment_details: `Consulenza per gestione debiti - Tatosolvi\n\nModalità: ${meetingTypeLabel}`,
        calendar_link: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`,
        booking_date: new Date().toLocaleString('it-IT')
      };
      
      // Send appointment notification email
      emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        appointmentEmailData
      ).then(() => {
        console.log('✅ Email prenotazione inviata a', pro.email);
      }).catch(err => {
        console.error('❌ Errore invio email prenotazione:', err);
      });
    }
    
    // Check if professional has custom calendar link (Cal.com, Calendly, etc.)
    if (pro.calendarLink && pro.calendarLink !== 'TUO_CALENDAR_LINK' && pro.calendarLink.includes('http') && !pro.calendarLink.includes('calendar.google.com')) {
      // Custom link (like Cal.com or Calendly) - open directly
      window.open(pro.calendarLink, '_blank');
      alert(`✅ Prenotazione confermata!\n\n${pro.name} riceverà una notifica email con i dettagli.\n\nData: ${date} alle ${time}\nModalità: ${meetingTypeLabel}`);
    } else {
      // Google Calendar link
      const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
      window.open(googleCalendarLink, '_blank');
      
      alert(`✅ Prenotazione confermata!\n\n${pro.name} riceverà una notifica email con i dettagli.\n\nData: ${date} alle ${time}\nModalità: ${meetingTypeLabel}\n\nAggiungi l'evento al tuo calendario Google.`);
    }
    
    Professionals.closeDetails();
  },
  
  /**
   * Apply filters and search
   */
  applyFilters: () => {
    const cards = DOM.proGrid.querySelectorAll('.pro-card');
    const query = Professionals.currentSearch.toLowerCase();
    const filter = Professionals.currentFilter;
    
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').split(' ');
      const searchText = card.dataset.searchtext || '';
      
      // Check filter
      const matchesFilter = filter === 'all' || tags.includes(filter);
      
      // Check search
      const matchesSearch = !query || searchText.includes(query);
      
      // Show only if both match
      card.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
    });
  },
  
  /**
   * Apply search filter
   */
  applySearch: () => {
    Professionals.currentSearch = DOM.searchInput.value || '';
    Professionals.applyFilters();
  },
  
  /**
   * Apply category filter
   */
  applyFilter: (filterTag) => {
    Professionals.currentFilter = filterTag;
    
    // Update active chip
    DOM.filterChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.filter === filterTag);
    });
    
    Professionals.applyFilters();
  },
  
  /**
   * Load and apply saved professional data to PROFESSIONALS_DATA
   */
  loadSavedProfessionalData: () => {
    try {
      // Load saved data for all professionals with login credentials
      PROFESSIONALS_DATA.forEach(pro => {
        if (pro.loginUsername) {
          const savedData = localStorage.getItem(`professionalData_${pro.loginUsername}`);
          if (savedData) {
            const data = JSON.parse(savedData);
            const proIndex = PROFESSIONALS_DATA.findIndex(p => p.name === pro.name);
            if (proIndex !== -1 && data) {
              // Update professional data with saved values, preserving defaults for missing fields
              PROFESSIONALS_DATA[proIndex] = {
                ...PROFESSIONALS_DATA[proIndex],
                specialty: data.specialty || PROFESSIONALS_DATA[proIndex].specialty,
                services: data.services || PROFESSIONALS_DATA[proIndex].services,
                price: data.price || PROFESSIONALS_DATA[proIndex].price,
                desc: data.desc || PROFESSIONALS_DATA[proIndex].desc,
                career: data.career || PROFESSIONALS_DATA[proIndex].career,
                email: data.email || PROFESSIONALS_DATA[proIndex].email,
                phone: data.phone || PROFESSIONALS_DATA[proIndex].phone,
                address: data.address || PROFESSIONALS_DATA[proIndex].address,
                cf: data.cf || PROFESSIONALS_DATA[proIndex].cf,
                piva: data.piva || PROFESSIONALS_DATA[proIndex].piva
              };
            }
          }
        }
      });
      
      // Also load legacy data for backward compatibility
      const saved = localStorage.getItem('professionalData');
      if (saved) {
        const data = JSON.parse(saved);
        const gianlucaIndex = PROFESSIONALS_DATA.findIndex(pro => pro.name === 'Gianluca Collia');
        if (gianlucaIndex !== -1 && data) {
          // Update Gianluca's data with saved values, preserving defaults for missing fields
          PROFESSIONALS_DATA[gianlucaIndex] = {
            ...PROFESSIONALS_DATA[gianlucaIndex],
            specialty: data.specialty || PROFESSIONALS_DATA[gianlucaIndex].specialty,
            services: data.services || PROFESSIONALS_DATA[gianlucaIndex].services,
            price: data.price || PROFESSIONALS_DATA[gianlucaIndex].price,
            desc: data.desc || PROFESSIONALS_DATA[gianlucaIndex].desc,
            career: data.career || PROFESSIONALS_DATA[gianlucaIndex].career,
            email: data.email || PROFESSIONALS_DATA[gianlucaIndex].email,
            phone: data.phone || PROFESSIONALS_DATA[gianlucaIndex].phone,
            address: data.address || PROFESSIONALS_DATA[gianlucaIndex].address,
            cf: data.cf || PROFESSIONALS_DATA[gianlucaIndex].cf,
            piva: data.piva || PROFESSIONALS_DATA[gianlucaIndex].piva
          };
        }
      }
    } catch (e) {
      console.error('Errore caricamento dati professionista salvati:', e);
    }
  },
  
  /**
   * Initialize professionals section
   */
  init: () => {
    // Load saved professional data first
    Professionals.loadSavedProfessionalData();
    
    // Render professionals
    Professionals.render();
    
    // Search input
    DOM.searchInput.addEventListener('input', Professionals.applySearch);
    
    if (DOM.sortSelect) {
      DOM.sortSelect.addEventListener('change', Professionals.handleSortChange);
    }
    
    // Filter chips
    DOM.filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        Professionals.applyFilter(chip.dataset.filter);
      });
    });
    
    // Initialize with 'all' filter
    Professionals.applyFilter('all');
    Professionals.updateSortHint();
  }
};

// ==================== PROFESSIONAL REVIEW ====================
const ProfessionalReview = {
  applications: [],
  currentApplication: null,
  
  init: () => {
    if (!DOM.reviewSelect) return;
    ProfessionalReview.loadApplications();
    
    DOM.reviewSelect.addEventListener('change', ProfessionalReview.handleSelection);
    if (DOM.reviewTypeRadios) {
      DOM.reviewTypeRadios.forEach(radio => {
        radio.addEventListener('change', ProfessionalReview.setDefaultMessage);
      });
    }
    if (DOM.reviewSendBtn) {
      DOM.reviewSendBtn.addEventListener('click', ProfessionalReview.sendFeedback);
    }
    if (DOM.reviewMessage) {
      DOM.reviewMessage.addEventListener('input', () => {
        DOM.reviewMessage.dataset.autofill = 'false';
      });
    }
  },
  
  loadApplications: async () => {
    let applications = [];
    if (SupabaseService.isReady()) {
      const { data } = await SupabaseService.fetchProfessionalApplications();
      if (Array.isArray(data)) {
        applications = data.map(item => ({
          key: item.id,
          id: item.id,
          name: item.name || '',
          surname: item.surname || '',
          email: item.email || '',
          phone: item.phone || '',
          city: item.city || '',
          province: item.province || '',
          cap: item.cap || '',
          specialty: item.specialty || '',
          experience: item.experience,
          notes: item.notes || '',
          attachmentLinks: item.attachment_links || '',
          status: item.status || 'in_review',
          reviewFeedback: item.review_feedback || '',
          reviewedAt: item.reviewed_at,
          submissionDate: item.submission_date
        }));
      }
    }
    
    if (applications.length === 0) {
      const stored = JSON.parse(localStorage.getItem('professionalApplications') || '[]');
      applications = stored.map(item => ({
        key: item.localId || item.id || `${item.name}-${item.dateISO || Date.now()}`,
        id: item.id || null,
        localId: item.localId || item.key || `${item.name}-${item.dateISO || Date.now()}`,
        name: item.name || '',
        surname: item.surname || '',
        email: item.email || '',
        phone: item.phone || '',
        city: item.city || '',
        province: item.province || '',
        cap: item.cap || '',
        specialty: item.specialty || '',
        experience: item.experience,
        notes: item.notes || '',
        attachmentLinks: item.attachmentLinks || '',
        status: item.status || 'in_review',
        reviewFeedback: item.reviewFeedback || '',
        reviewedAt: item.reviewedAt || null,
        submissionDate: item.dateISO || new Date().toISOString()
      }));
    }
    
    ProfessionalReview.applications = applications;
    ProfessionalReview.populateSelect();
    ProfessionalReview.renderList();
  },
  
  populateSelect: () => {
    if (!DOM.reviewSelect) return;
    const options = ['<option value="">Seleziona un professionista</option>'];
    ProfessionalReview.applications.forEach(app => {
      options.push(`<option value="${app.key}">${app.name} ${app.surname ? `- ${app.surname}` : ''}</option>`);
    });
    DOM.reviewSelect.innerHTML = options.join('');
    ProfessionalReview.currentApplication = null;
    if (DOM.reviewDetails) {
      DOM.reviewDetails.innerHTML = '<p style="color: var(--text-muted);">Seleziona un professionista per visualizzare i dettagli.</p>';
    }
    if (DOM.reviewMessage) {
      DOM.reviewMessage.value = '';
      DOM.reviewMessage.dataset.autofill = 'false';
    }
    if (DOM.reviewStatus) DOM.reviewStatus.className = 'review-status';
  },
  
  handleSelection: () => {
    const key = DOM.reviewSelect?.value;
    const application = ProfessionalReview.applications.find(app => app.key === key);
    ProfessionalReview.currentApplication = application || null;
    if (!application) {
      if (DOM.reviewDetails) {
        DOM.reviewDetails.innerHTML = '<p style="color: var(--text-muted);">Seleziona un professionista per visualizzare i dettagli.</p>';
      }
      return;
    }
    ProfessionalReview.renderDetails(application);
    ProfessionalReview.setDefaultMessage();
  },
  
  renderDetails: (app) => {
    if (!DOM.reviewDetails || !app) return;
    DOM.reviewDetails.innerHTML = `
      <div class="review-detail-grid">
        <p><strong>Nome:</strong> ${app.name || '-'} ${app.surname || ''}</p>
        <p><strong>Email:</strong> ${app.email || 'N/A'}</p>
        <p><strong>Telefono:</strong> ${app.phone || 'N/A'}</p>
        <p><strong>Specializzazione:</strong> ${app.specialty || 'N/A'}</p>
        <p><strong>Città:</strong> ${app.city || 'N/D'} ${app.province ? `(${app.province})` : ''}</p>
        <p><strong>CAP:</strong> ${app.cap || 'N/D'}</p>
      </div>
      ${app.notes ? `<p><strong>Note candidato:</strong> ${app.notes}</p>` : ''}
      ${app.attachmentLinks ? `<p><strong>Allegati:</strong><br>${app.attachmentLinks.replace(/\n/g, '<br>')}</p>` : ''}
      <p><strong>Stato:</strong> <span class="status-pill ${app.status || 'in_review'}">${ProfessionalReview.getStatusLabel(app.status)}</span></p>
      ${app.reviewFeedback ? `<p><strong>Feedback inviato:</strong> ${app.reviewFeedback}</p>` : ''}
    `;
  },
  
  renderList: () => {
    const list = document.getElementById('review-list');
    if (!list) return;
    if (ProfessionalReview.applications.length === 0) {
      list.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Ancora nessuna candidatura.</p>';
      return;
    }
    list.innerHTML = ProfessionalReview.applications.map(app => `
      <div class="review-list-item">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:var(--spacing-md); flex-wrap:wrap;">
          <strong>${app.name || ''} ${app.surname || ''}</strong>
          <span class="status-pill ${app.status || 'in_review'}">${ProfessionalReview.getStatusLabel(app.status)}</span>
        </div>
        <p><strong>Email:</strong> ${app.email || 'N/A'} • <strong>Telefono:</strong> ${app.phone || 'N/A'}</p>
        <p><strong>Specialità:</strong> ${app.specialty || 'N/A'}</p>
        <p><strong>Inviata il:</strong> ${app.submissionDate ? new Date(app.submissionDate).toLocaleString('it-IT') : 'N/A'}</p>
        ${app.reviewFeedback ? `<p><strong>Ultimo feedback:</strong> ${app.reviewFeedback}</p>` : ''}
      </div>
    `).join('');
  },
  
  getStatusLabel: (status) => {
    switch (status) {
      case 'approved':
        return 'Verificato';
      case 'needs_info':
        return 'Richiede integrazioni';
      case 'rejected':
        return 'Respinta';
      default:
        return 'In verifica';
    }
  },
  
  setDefaultMessage: () => {
    if (!DOM.reviewMessage || !ProfessionalReview.currentApplication) return;
    const type = document.querySelector('input[name="review-type"]:checked')?.value || 'positive';
    const app = ProfessionalReview.currentApplication;
    if (DOM.reviewMessage.value.trim().length === 0 || DOM.reviewMessage.dataset.autofill === 'true') {
      if (type === 'positive') {
        DOM.reviewMessage.value = `Ciao ${app.name},\n\nabbiamo verificato i tuoi documenti e la tua candidatura è stata approvata. Da ora puoi operare sulla piattaforma.\n\nGrazie per la collaborazione!\nTeam Tatosolvi`;
      } else {
        DOM.reviewMessage.value = `Ciao ${app.name},\n\nabbiamo analizzato la tua candidatura ma sono necessarie alcune integrazioni. Ti invitiamo a inviarci documenti aggiuntivi o chiarimenti per completare la valutazione.\n\nTi faremo sapere al più presto l'esito della tua richiesta.\nTeam Tatosolvi`;
      }
      DOM.reviewMessage.dataset.autofill = 'true';
    }
  },
  
  updateLocalStore: () => {
    const serialized = ProfessionalReview.applications
      .filter(app => app.localId && !app.id)
      .map(app => ({
        localId: app.localId,
        name: app.name,
        surname: app.surname,
        email: app.email,
        phone: app.phone,
        city: app.city,
        province: app.province,
        cap: app.cap,
        specialty: app.specialty,
        experience: app.experience,
        notes: app.notes,
        attachmentLinks: app.attachmentLinks,
        dateISO: app.submissionDate,
        status: app.status,
        reviewFeedback: app.reviewFeedback || '',
        reviewedAt: app.reviewedAt
      }));
    localStorage.setItem('professionalApplications', JSON.stringify(serialized));
  },
  
  sendFeedback: async () => {
    if (EMAIL_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || typeof emailjs === 'undefined') {
      if (DOM.reviewStatus) {
        DOM.reviewStatus.className = 'review-status error';
        DOM.reviewStatus.textContent = 'Configura EmailJS per inviare i feedback.';
      }
      return;
    }
    
    const app = ProfessionalReview.currentApplication;
    if (!app) {
      if (DOM.reviewStatus) {
        DOM.reviewStatus.className = 'review-status error';
        DOM.reviewStatus.textContent = 'Seleziona un professionista prima di inviare.';
      }
      return;
    }
    
    const type = document.querySelector('input[name="review-type"]:checked')?.value || 'positive';
    const message = DOM.reviewMessage?.value.trim();
    if (!message) {
      if (DOM.reviewStatus) {
        DOM.reviewStatus.className = 'review-status error';
        DOM.reviewStatus.textContent = 'Scrivi un messaggio da inviare.';
      }
      return;
    }
    
    if (!app.email) {
      if (DOM.reviewStatus) {
        DOM.reviewStatus.className = 'review-status error';
        DOM.reviewStatus.textContent = 'Il professionista non ha un indirizzo email valido.';
      }
      return;
    }
    
    if (DOM.reviewStatus) {
      DOM.reviewStatus.className = 'review-status loading';
      DOM.reviewStatus.textContent = 'Invio del feedback in corso...';
    }
    
    const statusValue = type === 'positive' ? 'approved' : 'needs_info';
    
    try {
      const feedbackEmailData = {
        to_email: app.email,
        professional_name: `${app.name} ${app.surname || ''}`.trim(),
        review_result: statusValue === 'approved' ? 'Positivo' : 'Da integrare',
        review_message: message,
        subject: statusValue === 'approved' ? 'Esito positivo verifica Tatosolvi' : 'Esito verifica: integrazioni richieste'
      };
      
      console.log('📧 Invio email feedback professionista...');
      console.log('Service ID:', EMAIL_CONFIG.serviceId);
      console.log('Template ID:', EMAIL_CONFIG.templateIdReview || EMAIL_CONFIG.templateId);
      console.log('Feedback email data:', feedbackEmailData);
      
      const feedbackResponse = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateIdReview || EMAIL_CONFIG.templateId,
        feedbackEmailData
      );
      
      console.log('✅ Email feedback inviata:', feedbackResponse);
      
      const reviewedAt = new Date().toISOString();
      app.status = statusValue;
      app.reviewFeedback = message;
      app.reviewedAt = reviewedAt;
      ProfessionalReview.renderDetails(app);
      ProfessionalReview.renderList();
      ProfessionalReview.updateLocalStore();
      if (app.id && SupabaseService.isReady()) {
        SupabaseService.updateProfessionalApplication(app.id, {
          status: statusValue,
          review_feedback: message,
          reviewed_at: reviewedAt
        });
      }
      if (DOM.reviewStatus) {
        DOM.reviewStatus.className = 'review-status success';
        DOM.reviewStatus.textContent = 'Feedback inviato correttamente.';
      }
      DOM.reviewMessage.dataset.autofill = 'false';
    } catch (error) {
      console.error('❌ Errore invio feedback professionista:', error);
      console.error('Dettagli errore:', {
        status: error.status,
        text: error.text,
        message: error.message,
        stack: error.stack
      });
      if (DOM.reviewStatus) {
        DOM.reviewStatus.className = 'review-status error';
        DOM.reviewStatus.textContent = `Errore durante l'invio del feedback: ${error.text || error.message || 'Errore sconosciuto'}. Riprova più tardi.`;
      }
    }
  }
};

// ==================== PROFESSIONAL APPLICATION FORM ====================
const ProfessionalApplication = {
  init: () => {
    const form = document.getElementById('proApplicationForm');
    if (!form) return;
    form.addEventListener('submit', ProfessionalApplication.handleSubmit);
  },
  
  setStatus: (type, message) => {
    const statusEl = document.getElementById('pro-application-status');
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.className = `form-status ${type || ''}`;
    statusEl.style.display = message ? 'block' : 'none';
  },
  
  uploadDocuments: async (files, folderId) => {
    const uploads = [];
    if (!files || files.length === 0) return uploads;
    
    for (const file of files) {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      
      if (file.size > maxSize) {
        uploads.push({ name: file.name, note: 'File troppo grande (max 5MB)' });
        continue;
      }
      
      if (!allowedTypes.includes(file.type)) {
        uploads.push({ name: file.name, note: 'Formato non supportato' });
        continue;
      }
      
      if (supabase) {
        try {
          const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
          const path = `applications/${folderId}/${safeName}`;
          const { error } = await supabase.storage
            .from('professional-documents')
            .upload(path, file, { cacheControl: '3600', upsert: false });
          
          if (error) {
            uploads.push({ name: file.name, note: 'Errore upload Supabase' });
            continue;
          }
          
          const { data } = supabase.storage
            .from('professional-documents')
            .getPublicUrl(path);
          
          uploads.push({ name: file.name, url: data?.publicUrl });
        } catch (e) {
          console.error('Errore upload candidatura:', e);
          uploads.push({ name: file.name, note: 'Upload non riuscito' });
        }
      } else {
        uploads.push({ name: file.name, note: 'Supabase non configurato - allegato non caricato' });
      }
    }
    
    return uploads;
  },
  
  handleSubmit: async (event) => {
    event.preventDefault();
    const form = event.target;
    
    const data = {
      nome: document.getElementById('pro-app-nome')?.value.trim(),
      cognome: document.getElementById('pro-app-cognome')?.value.trim(),
      email: document.getElementById('pro-app-email')?.value.trim(),
      telefono: document.getElementById('pro-app-telefono')?.value.trim(),
      citta: document.getElementById('pro-app-citta')?.value.trim(),
      provincia: document.getElementById('pro-app-provincia')?.value.trim(),
      cap: document.getElementById('pro-app-cap')?.value.trim(),
      specialty: document.getElementById('pro-app-specialty')?.value.trim(),
      experience: document.getElementById('pro-app-experience')?.value.trim(),
      note: document.getElementById('pro-app-notes')?.value.trim()
    };
    
    if (!data.nome || !data.cognome || !Utils.isValidEmail(data.email) || Utils.extractDigits(data.telefono).length < 9 || !data.citta || data.provincia.length !== 2 || Utils.extractDigits(data.cap).length !== 5 || !data.specialty) {
      ProfessionalApplication.setStatus('error', 'Compila tutti i campi obbligatori con valori validi.');
      return;
    }
    
    ProfessionalApplication.setStatus('loading', 'Invio candidatura in corso...');
    
    const folderId = `${Date.now()}-${(data.nome || 'pro').toLowerCase().replace(/\s+/g, '-')}`;
    const fileInput = document.getElementById('pro-app-docs');
    const uploads = await ProfessionalApplication.uploadDocuments(fileInput?.files, folderId);
    const attachmentsSummary = uploads.length > 0
      ? uploads.map(u => `${u.name} ${u.url ? `→ ${u.url}` : u.note ? `(${u.note})` : ''}`).join('\n')
      : 'Nessun allegato fornito';
    
    const applicationRecord = {
      name: data.nome,
      surname: data.cognome,
      email: data.email,
      phone: data.telefono,
      city: data.citta,
      province: data.provincia,
      cap: data.cap,
      specialty: data.specialty,
      experience: data.experience || null,
      notes: data.note,
      attachmentLinks: attachmentsSummary,
      dateISO: new Date().toISOString(),
      status: 'in_review',
      reviewFeedback: '',
      reviewedAt: null
    };
    applicationRecord.localId = `local-${Date.now()}`;
    
    if (EMAIL_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || typeof emailjs === 'undefined') {
      console.warn('EmailJS non configurato per candidatura professionisti.');
      ProfessionalApplication.setStatus('success', 'Candidatura ricevuta (modalità demo). Configura EmailJS per inviare le email.');
      const storedApplicationsLocal = JSON.parse(localStorage.getItem('professionalApplications') || '[]');
      storedApplicationsLocal.unshift({ ...applicationRecord });
      localStorage.setItem('professionalApplications', JSON.stringify(storedApplicationsLocal));
      if (SupabaseService.isReady()) {
        SupabaseService.saveProfessionalApplication(applicationRecord);
      }
      ProfessionalReview.loadApplications();
      form.reset();
      Professionals.updateSortHint();
      return;
    }
    
    try {
      const emailData = {
        to_email: EMAIL_CONFIG.recipientEmail,
        from_name: `${data.nome} ${data.cognome}`,
        from_email: data.email,
        phone: data.telefono,
        candidate_name: `${data.nome} ${data.cognome}`,
        candidate_email: data.email,
        candidate_phone: data.telefono,
        candidate_city: data.citta,
        candidate_province: data.provincia,
        candidate_cap: data.cap,
        candidate_specialty: data.specialty,
        candidate_experience: data.experience || 'Non indicata',
        candidate_notes: data.note || 'Non specificate',
        attachment_links: attachmentsSummary,
        submission_date: new Date().toLocaleString('it-IT'),
        subject: 'Nuova candidatura professionista'
      };
      
      console.log('📧 Invio email candidatura professionista...');
      console.log('Service ID:', EMAIL_CONFIG.serviceId);
      console.log('Template ID:', EMAIL_CONFIG.templateIdProApplication || EMAIL_CONFIG.templateId);
      console.log('Email data:', emailData);
      
      const emailResponse = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateIdProApplication || EMAIL_CONFIG.templateId,
        emailData
      );
      
      console.log('✅ Email candidatura inviata:', emailResponse);
      
      if (SupabaseService.isReady()) {
        SupabaseService.saveProfessionalApplication(applicationRecord);
      }
      const storedApplicationsLocal = JSON.parse(localStorage.getItem('professionalApplications') || '[]');
      storedApplicationsLocal.unshift({ ...applicationRecord });
      localStorage.setItem('professionalApplications', JSON.stringify(storedApplicationsLocal));
      ProfessionalReview.loadApplications();
      const storedApplications = JSON.parse(localStorage.getItem('professionalApplications') || '[]');
      storedApplications.unshift({ ...applicationRecord, status: 'in_review', reviewedAt: null, feedback: '' });
      localStorage.setItem('professionalApplications', JSON.stringify(storedApplications));
      
      const autoReplyPayload = {
        to_email: data.email,
        candidate_name: `${data.nome} ${data.cognome}`,
        auto_message: `Grazie per l'interesse dimostrato. Diventare un professionista dell'ecosistema Tatosolvi permette a tutti i nostri partner di raggiungere possibili clienti da supportare verso la loro libertà finanziaria.\nTi faremo sapere al più presto l'esito della tua richiesta.`
      };
      try {
        console.log('📧 Invio auto-reply al candidato...');
        console.log('Template ID:', EMAIL_CONFIG.templateIdProAutoReply || EMAIL_CONFIG.templateId);
        console.log('Auto-reply data:', autoReplyPayload);
        
        const autoReplyResponse = await emailjs.send(
          EMAIL_CONFIG.serviceId,
          EMAIL_CONFIG.templateIdProAutoReply || EMAIL_CONFIG.templateId,
          autoReplyPayload
        );
        
        console.log('✅ Auto-reply inviata:', autoReplyResponse);
      } catch (autoErr) {
        console.error('❌ Errore invio auto-reply candidatura:', autoErr);
        console.error('Dettagli errore:', {
          status: autoErr.status,
          text: autoErr.text,
          message: autoErr.message
        });
      }
      
      ProfessionalApplication.setStatus('success', '✅ Grazie! La tua candidatura è stata inviata con successo. Ti contatteremo a breve.');
      form.reset();
      Professionals.updateSortHint();
    } catch (e) {
      console.error('Errore invio candidatura:', e);
      ProfessionalApplication.setStatus('error', '❌ Errore durante l’invio. Riprova più tardi.');
    }
  }
};

// ==================== PROFESSIONAL DASHBOARD ====================
const ProfessionalDashboard = {
  /**
   * Show professional dashboard
   */
  show: () => {
    // Hide all pages first (including wizard and professionals)
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
      page.hidden = true;
    });
    const proPage = document.getElementById('page-professional');
    if (proPage) {
      proPage.hidden = false;
      proPage.classList.add('active');
      Navigation.updateGlobalBackButton(true);
      Utils.scrollToTop();
    }
  },
  
  /**
   * Save professional data
   */
  saveData: () => {
    const currentPro = JSON.parse(localStorage.getItem('currentProfessional') || '{}');
    const username = currentPro.username || 'gianluca90';
    
    const data = {
      name: document.getElementById('pro-name')?.value || '',
      email: document.getElementById('pro-email')?.value || '',
      phone: document.getElementById('pro-phone')?.value || '',
      address: document.getElementById('pro-address')?.value || '',
      city: document.getElementById('pro-city')?.value || '',
      province: document.getElementById('pro-province')?.value || '',
      cap: document.getElementById('pro-cap')?.value || '',
      cf: document.getElementById('pro-cf')?.value || '',
      piva: document.getElementById('pro-piva')?.value || '',
      specialty: document.getElementById('pro-specialty')?.value || '',
      services: document.getElementById('pro-services')?.value || '',
      price: parseInt(document.getElementById('pro-price')?.value || '400', 10),
      desc: document.getElementById('pro-desc')?.value || '',
      career: document.getElementById('pro-career')?.value || '',
      lastUpdate: new Date().toISOString()
    };
    
    try {
      // Save to localStorage with username key
      localStorage.setItem(`professionalData_${username}`, JSON.stringify(data));
      
      // Also save to legacy key for backward compatibility
      if (username === 'gianluca90') {
        localStorage.setItem('professionalData', JSON.stringify(data));
      }
      
      // Update PROFESSIONALS_DATA with new data
      const proIndex = PROFESSIONALS_DATA.findIndex(pro => pro.name === data.name);
      if (proIndex !== -1) {
        // Update existing professional data
        PROFESSIONALS_DATA[proIndex] = {
          ...PROFESSIONALS_DATA[proIndex],
          specialty: data.specialty || PROFESSIONALS_DATA[proIndex].specialty,
          services: data.services || PROFESSIONALS_DATA[proIndex].services,
          price: data.price || PROFESSIONALS_DATA[proIndex].price,
          desc: data.desc || PROFESSIONALS_DATA[proIndex].desc,
          career: data.career || PROFESSIONALS_DATA[proIndex].career,
          email: data.email || PROFESSIONALS_DATA[proIndex].email,
          phone: data.phone || PROFESSIONALS_DATA[proIndex].phone,
          address: data.address || PROFESSIONALS_DATA[proIndex].address,
          city: data.city || PROFESSIONALS_DATA[proIndex].city,
          province: data.province || PROFESSIONALS_DATA[proIndex].province,
          cap: data.cap || PROFESSIONALS_DATA[proIndex].cap
        };
        
        // Re-render professionals list to show updated data
        Professionals.render();
      }
      
      alert('✅ Dati salvati con successo! Le modifiche sono visibili anche nella lista professionisti.');
    } catch (e) {
      console.error('Errore salvataggio:', e);
      alert('❌ Errore nel salvataggio dei dati');
    }
  },
  
  /**
   * Handle file upload
   */
  handleFileUpload: async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    const maxSize = 5 * 1024 * 1024; // 5MB per file
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
    
    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        alert(`⚠️ Il file "${file.name}" è troppo grande (max 5MB).`);
        continue;
      }
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        alert(`⚠️ Il tipo di file "${file.name}" non è supportato. Usa PDF, DOC, DOCX, JPG o PNG.`);
        continue;
      }
      
      try {
        // Try to upload to Supabase first
        if (supabase) {
          const fileName = `professional-${Date.now()}-${file.name}`;
          const filePath = `gianluca-collia/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('professional-documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('professional-documents')
            .getPublicUrl(filePath);
          
          // Save document metadata
          const documentData = {
            name: file.name,
            type: file.type,
            size: file.size,
            path: filePath,
            url: urlData.publicUrl,
            uploadedAt: new Date().toISOString(),
            storage: 'supabase'
          };
          
          // Save to localStorage for quick access
          const documents = JSON.parse(localStorage.getItem('professionalDocuments') || '[]');
          const existingIndex = documents.findIndex(doc => doc.name === file.name && doc.storage === 'supabase');
          
          if (existingIndex !== -1) {
            documents[existingIndex] = documentData;
          } else {
            documents.push(documentData);
          }
          
          localStorage.setItem('professionalDocuments', JSON.stringify(documents));
          ProfessionalDashboard.renderDocuments();
          
          alert(`✅ Documento "${file.name}" caricato su Supabase con successo!`);
        } else {
          // Fallback to localStorage if Supabase not configured
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const documents = JSON.parse(localStorage.getItem('professionalDocuments') || '[]');
              const existingIndex = documents.findIndex(doc => doc.name === file.name);
              
              const documentData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result, // Base64 data
                uploadedAt: new Date().toISOString(),
                storage: 'localStorage'
              };
              
              if (existingIndex !== -1) {
                documents[existingIndex] = documentData;
              } else {
                documents.push(documentData);
              }
              
              localStorage.setItem('professionalDocuments', JSON.stringify(documents));
              ProfessionalDashboard.renderDocuments();
              
              alert(`✅ Documento "${file.name}" caricato con successo! (salvato localmente)`);
            } catch (err) {
              console.error('Errore caricamento documento:', err);
              alert(`❌ Errore nel caricamento del documento "${file.name}"`);
            }
          };
          
          reader.onerror = () => {
            alert(`❌ Errore nella lettura del file "${file.name}"`);
          };
          
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error('Errore upload Supabase:', err);
        alert(`❌ Errore nel caricamento del documento "${file.name}". Verifica la configurazione Supabase.`);
      }
    }
    
    // Reset input
    event.target.value = '';
  },
  
  /**
   * Render documents list
   */
  renderDocuments: () => {
    const container = document.getElementById('documents-list');
    if (!container) return;
    
    try {
      const documents = JSON.parse(localStorage.getItem('professionalDocuments') || '[]');
      
      if (documents.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-style: italic; text-align: center; padding: var(--spacing-xl);">Nessun documento caricato</p>';
        return;
      }
      
      container.innerHTML = documents.map((doc, index) => {
        const fileSize = (doc.size / 1024).toFixed(2); // KB
        const uploadDate = new Date(doc.uploadedAt).toLocaleDateString('it-IT');
        const fileIcon = doc.type.includes('pdf') ? '📄' : doc.type.includes('image') ? '🖼️' : '📝';
        
        return `
          <div class="document-item">
            <div class="document-info">
              <span class="document-icon">${fileIcon}</span>
              <div class="document-details">
                <div class="document-name">${doc.name}</div>
                <div class="document-meta">${fileSize} KB • ${uploadDate}</div>
              </div>
            </div>
            <div class="document-actions">
              <button type="button" class="btn-icon" onclick="ProfessionalDashboard.downloadDocument(${index})" title="Scarica">
                ⬇️
              </button>
              <button type="button" class="btn-icon btn-icon-danger" onclick="ProfessionalDashboard.deleteDocument(${index})" title="Elimina">
                🗑️
              </button>
            </div>
          </div>
        `;
      }).join('');
    } catch (e) {
      console.error('Errore rendering documenti:', e);
      container.innerHTML = '<p style="color: #f56565;">Errore nel caricamento dei documenti.</p>';
    }
  },
  
  /**
   * Download document
   */
  downloadDocument: async (index) => {
    try {
      const documents = JSON.parse(localStorage.getItem('professionalDocuments') || '[]');
      const doc = documents[index];
      
      if (!doc) {
        alert('Documento non trovato.');
        return;
      }
      
      // If stored in Supabase, download from URL
      if (doc.storage === 'supabase' && doc.url) {
        window.open(doc.url, '_blank');
        return;
      }
      
      // If stored in localStorage, convert base64 to blob
      if (doc.data) {
        const byteCharacters = atob(doc.data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: doc.type });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Errore download documento:', e);
      alert('❌ Errore nel download del documento');
    }
  },
  
  /**
   * Delete document
   */
  deleteDocument: async (index) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) {
      return;
    }
    
    try {
      const documents = JSON.parse(localStorage.getItem('professionalDocuments') || '[]');
      const doc = documents[index];
      
      if (!doc) {
        alert('Documento non trovato.');
        return;
      }
      
      // If stored in Supabase, delete from storage
      if (doc.storage === 'supabase' && doc.path && supabase) {
        const { error } = await supabase.storage
          .from('professional-documents')
          .remove([doc.path]);
        
        if (error) {
          throw error;
        }
      }
      
      // Remove from localStorage
      documents.splice(index, 1);
      localStorage.setItem('professionalDocuments', JSON.stringify(documents));
      ProfessionalDashboard.renderDocuments();
      alert('✅ Documento eliminato con successo!');
    } catch (e) {
      console.error('Errore eliminazione documento:', e);
      alert('❌ Errore nell\'eliminazione del documento');
    }
  },
  
  /**
   * Load professional data
   */
  loadData: (professional = null) => {
    try {
      // Get current professional from localStorage or use provided
      const currentPro = professional || JSON.parse(localStorage.getItem('currentProfessional') || '{}');
      
      // Find professional in PROFESSIONALS_DATA
      const proData = PROFESSIONALS_DATA.find(pro => pro.name === currentPro.name) || PROFESSIONALS_DATA[0];
      
      // Load saved data from localStorage (if exists)
      const saved = localStorage.getItem(`professionalData_${currentPro.username || 'gianluca90'}`);
      const savedData = saved ? JSON.parse(saved) : {};
      
      // Populate form fields with professional data or saved data
      if (document.getElementById('pro-name')) {
        document.getElementById('pro-name').value = savedData.name || proData.name || '';
        document.getElementById('pro-name').readOnly = true; // Name is readonly
      }
      if (document.getElementById('pro-email')) {
        document.getElementById('pro-email').value = savedData.email || proData.email || '';
        document.getElementById('pro-email').readOnly = true; // Email is readonly
      }
      if (document.getElementById('pro-phone')) document.getElementById('pro-phone').value = savedData.phone || '';
      if (document.getElementById('pro-address')) document.getElementById('pro-address').value = savedData.address || '';
      if (document.getElementById('pro-city')) document.getElementById('pro-city').value = savedData.city || proData.city || '';
      if (document.getElementById('pro-province')) document.getElementById('pro-province').value = savedData.province || proData.province || '';
      if (document.getElementById('pro-cap')) document.getElementById('pro-cap').value = savedData.cap || proData.cap || '';
      if (document.getElementById('pro-cf')) document.getElementById('pro-cf').value = savedData.cf || '';
      if (document.getElementById('pro-piva')) document.getElementById('pro-piva').value = savedData.piva || '';
      if (document.getElementById('pro-specialty')) document.getElementById('pro-specialty').value = savedData.specialty || proData.specialty || '';
      if (document.getElementById('pro-services')) document.getElementById('pro-services').value = savedData.services || proData.services || '';
      if (document.getElementById('pro-price')) document.getElementById('pro-price').value = savedData.price || proData.price || '';
      if (document.getElementById('pro-desc')) document.getElementById('pro-desc').value = savedData.desc || proData.desc || '';
      if (document.getElementById('pro-career')) document.getElementById('pro-career').value = savedData.career || proData.career || '';
      
      // Load and render documents
      ProfessionalDashboard.renderDocuments();
    } catch (e) {
      console.error('Errore caricamento dati:', e);
    }
  },
  
  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('professionalLoggedIn');
    Navigation.goToHome();
  }
};

// ==================== ADMIN DASHBOARD ====================
const AdminDashboard = {
  currentTab: 'requests',
  
  /**
   * Show admin dashboard
   */
  show: () => {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
      page.hidden = true;
    });
    const adminPage = document.getElementById('page-admin');
    if (adminPage) {
      adminPage.hidden = false;
      adminPage.classList.add('active');
      Navigation.updateGlobalBackButton();
      AdminDashboard.loadData();
      Utils.scrollToTop();
    }
  },
  
  /**
   * Show tab
   */
  showTab: (tab) => {
    AdminDashboard.currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[onclick="AdminDashboard.showTab('${tab}')"]`);
    const activeContent = document.getElementById(`admin-${tab}`);
    
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    
    AdminDashboard.loadData();
  },
  
  /**
   * Load and display data
   */
  loadData: async () => {
    if (AdminDashboard.currentTab === 'requests') {
      await AdminDashboard.loadRequests();
    } else if (AdminDashboard.currentTab === 'professionals') {
      AdminDashboard.loadProfessionals();
    } else if (AdminDashboard.currentTab === 'reviews') {
      AdminDashboard.loadReviews();
    } else if (AdminDashboard.currentTab === 'statistics') {
      AdminDashboard.loadStatistics();
    } else if (AdminDashboard.currentTab === 'review') {
      ProfessionalReview.loadApplications();
    }
  },
  
  /**
   * Load client requests
   */
  fetchRequestsData: async () => {
    if (SupabaseService.isReady()) {
      const { data, error } = await SupabaseService.fetchClientRequests();
      if (!error && Array.isArray(data)) {
        return data.map(item => ({
          name: item.name || '',
          surname: item.surname || '',
          email: item.email || '',
          phone: item.phone || '',
          city: item.city || '',
          province: item.province || '',
          cap: item.cap || '',
          debtTypes: item.debt_types || '',
          totalAmount: item.total_amount != null
            ? `€ ${Number(item.total_amount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '',
          debtDetails: item.debt_details || '',
          consentSummary: item.consent_summary || '',
          date: item.submission_date ? new Date(item.submission_date).toLocaleString('it-IT') : '',
          dateISO: item.submission_date || ''
        }));
      }
    }
    
    const localRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
    return localRequests;
  },

  loadRequests: async () => {
    const container = document.getElementById('requests-list');
    if (!container) return;
    
    container.innerHTML = '<p style="color: var(--text-muted); padding: var(--spacing-xl); text-align: center;">Caricamento in corso…</p>';
    
    try {
      const allRequests = await AdminDashboard.fetchRequestsData();
      
      if (!allRequests || allRequests.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); padding: var(--spacing-xl); text-align: center;">Nessuna richiesta ancora ricevuta.</p>';
        return;
      }
      
      container.innerHTML = allRequests.map((request, index) => `
        <div class="data-card">
          <div class="data-card-header">
            <h3>Richiesta #${allRequests.length - index}</h3>
            <span class="data-date">${request.date || 'Data non disponibile'}</span>
          </div>
          <div class="data-card-body">
            <div class="data-row">
              <strong>Cliente:</strong> ${request.name || 'N/A'} ${request.surname || ''}
            </div>
            <div class="data-row">
              <strong>Email:</strong> ${request.email || 'N/A'}
            </div>
            <div class="data-row">
              <strong>Telefono:</strong> ${request.phone || 'N/A'}
            </div>
            ${(request.city || request.province || request.cap) ? `<div class="data-row">
              <strong>Località:</strong> ${request.city || 'N/D'} ${request.province ? `(${request.province})` : ''} ${request.cap ? `- CAP ${request.cap}` : ''}
            </div>` : ''}
            <div class="data-row">
              <strong>Tipi di debito:</strong> ${request.debtTypes || 'N/A'}
            </div>
            <div class="data-row">
              <strong>Totale debiti:</strong> ${request.totalAmount || 'N/A'}
            </div>
            ${request.consentSummary ? `<div class="data-row">
              <strong>Consensi privacy:</strong> ${request.consentSummary}
            </div>` : ''}
            ${request.debtDetails ? `<div class="data-row"><strong>Dettagli:</strong><pre style="white-space: pre-wrap; margin-top: 8px;">${request.debtDetails}</pre></div>` : ''}
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error('Errore caricamento richieste:', e);
      container.innerHTML = '<p style="color: #f56565; padding: var(--spacing-xl); text-align: center;">Errore nel caricamento delle richieste.</p>';
    }
  },
  
  /**
   * Load professionals list
   */
  loadProfessionals: () => {
    const container = document.getElementById('professionals-list');
    if (!container) return;
    
    try {
      // Get all professionals with login credentials (real professionals)
      const realProfessionals = PROFESSIONALS_DATA.filter(pro => pro.loginUsername && pro.loginPassword);
      
      if (realProfessionals.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); padding: var(--spacing-xl); text-align: center;">Nessun professionista registrato.</p>';
        return;
      }
      
      container.innerHTML = realProfessionals.map(pro => {
        // Load saved data for this professional
        const savedData = localStorage.getItem(`professionalData_${pro.loginUsername}`);
        const saved = savedData ? JSON.parse(savedData) : {};
        
        // Merge with default data
        const finalPro = {
          name: saved.name || pro.name,
          email: saved.email || pro.email,
          phone: saved.phone || '',
          city: saved.city || pro.city || '',
          province: saved.province || pro.province || '',
          cap: saved.cap || pro.cap || '',
          specialty: saved.specialty || pro.specialty,
          services: saved.services || pro.services,
          price: saved.price || pro.price
        };
        
        return `
          <div class="data-card">
            <div class="data-card-header">
              <h3>${finalPro.name || 'N/A'}</h3>
            </div>
            <div class="data-card-body">
              <div class="data-row">
                <strong>Email:</strong> ${finalPro.email || 'N/A'}
              </div>
              <div class="data-row">
                <strong>Telefono:</strong> ${finalPro.phone || 'N/A'}
              </div>
              ${(finalPro.city || finalPro.province || finalPro.cap) ? `<div class="data-row">
                <strong>Località:</strong> ${finalPro.city || 'N/D'} ${finalPro.province ? `(${finalPro.province})` : ''} ${finalPro.cap ? `- CAP ${finalPro.cap}` : ''}
              </div>` : ''}
              <div class="data-row">
                <strong>Specialità:</strong> ${finalPro.specialty || 'N/A'}
              </div>
              <div class="data-row">
                <strong>Tariffa:</strong> € ${finalPro.price || 'N/A'}
              </div>
              ${finalPro.services ? `<div class="data-row"><strong>Servizi:</strong> ${finalPro.services}</div>` : ''}
            </div>
          </div>
        `;
      }).join('');
    } catch (e) {
      console.error('Errore caricamento professionisti:', e);
      container.innerHTML = '<p style="color: #f56565;">Errore nel caricamento dei professionisti.</p>';
    }
  },
  
  /**
   * Load reviews for admin
   */
  loadReviews: () => {
    const container = document.getElementById('reviews-list');
    if (!container) return;
    
    const allReviews = ReviewsSystem.getAllReviews();
    const filter = AdminDashboard.reviewsFilter || 'pending';
    const filteredReviews = filter === 'pending' 
      ? allReviews.filter(r => r.status === 'pending')
      : allReviews;
    
    if (filteredReviews.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); padding: var(--spacing-xl); text-align: center;">Nessuna recensione ${filter === 'pending' ? 'in attesa' : ''}.</p>`;
      return;
    }
    
    // Sort by date (newest first)
    filteredReviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = filteredReviews.map(review => {
      const pro = PROFESSIONALS_DATA.find(p => p.name === review.professionalName);
      const statusBadge = review.status === 'approved' 
        ? '<span style="background:#48bb78;color:#fff;padding:4px 12px;border-radius:12px;font-size:0.85rem;">✓ Approvata</span>'
        : review.status === 'rejected'
        ? '<span style="background:#f56565;color:#fff;padding:4px 12px;border-radius:12px;font-size:0.85rem;">✗ Rifiutata</span>'
        : '<span style="background:#ed8936;color:#fff;padding:4px 12px;border-radius:12px;font-size:0.85rem;">⏳ In Attesa</span>';
      
      const date = new Date(review.timestamp).toLocaleString('it-IT');
      
      return `
        <div class="data-card" style="margin-bottom: var(--spacing-lg);">
          <div class="data-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-sm);">
            <div>
              <h3>${review.reviewerName || 'Anonimo'}</h3>
              <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">${date}</div>
            </div>
            ${statusBadge}
          </div>
          <div class="data-card-body">
            <div class="data-row">
              <strong>Professionista:</strong> ${review.professionalName || 'N/A'}
            </div>
            <div class="data-row">
              <strong>Valutazione:</strong> ${ReviewsSystem.renderStars(review.rating || 0)} ${review.rating || 0}/5
            </div>
            <div class="data-row">
              <strong>Email recensore:</strong> ${review.reviewerEmail || 'N/A'}
            </div>
            <div class="data-row">
              <strong>Recensione:</strong>
              <p style="margin-top: 8px; padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md); white-space: pre-wrap;">${review.reviewText || 'Nessun testo'}</p>
            </div>
            ${review.status === 'pending' ? `
              <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-lg); padding-top: var(--spacing-lg); border-top: 2px solid var(--border);">
                <button class="btn" onclick="AdminDashboard.approveReview('${review.id}')" style="flex: 1; background: #48bb78;">
                  ✓ Approva
                </button>
                <button class="btn" onclick="AdminDashboard.rejectReview('${review.id}')" style="flex: 1; background: #f56565;">
                  ✗ Rifiuta
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },
  
  /**
   * Filter reviews
   */
  filterReviews: (filter) => {
    AdminDashboard.reviewsFilter = filter;
    AdminDashboard.loadReviews();
  },
  
  /**
   * Approve review
   */
  approveReview: (reviewId) => {
    if (confirm('Vuoi approvare questa recensione? Sarà visibile pubblicamente.')) {
      const success = ReviewsSystem.updateReviewStatus(reviewId, 'approved');
      if (success) {
        alert('✅ Recensione approvata!');
        AdminDashboard.loadReviews();
        // Refresh professionals list to update ratings
        Professionals.render();
      } else {
        alert('❌ Errore durante l\'approvazione della recensione.');
      }
    }
  },
  
  /**
   * Reject review
   */
  rejectReview: (reviewId) => {
    if (confirm('Vuoi rifiutare questa recensione? Non sarà visibile pubblicamente.')) {
      const success = ReviewsSystem.updateReviewStatus(reviewId, 'rejected');
      if (success) {
        alert('✅ Recensione rifiutata.');
        AdminDashboard.loadReviews();
        // Recalculate ratings
        ReviewsSystem.calculateRatings();
        Professionals.render();
      } else {
        alert('❌ Errore durante il rifiuto della recensione.');
      }
    }
  },
  
  /**
   * Export client requests to CSV
   */
  exportRequestsCSV: async () => {
    try {
      const requests = await AdminDashboard.fetchRequestsData();
      
      if (requests.length === 0) {
        alert('Nessuna richiesta da esportare.');
        return;
      }
      
      // CSV headers
      const headers = ['Nome', 'Cognome', 'Email', 'Telefono', 'Città', 'Provincia', 'CAP', 'Tipologie Debiti', 'Importo Totale', 'Dettagli Debiti', 'Consensi Privacy', 'Data Richiesta'];
      
      // CSV rows
      const rows = requests.map(req => [
        req.name || '',
        req.surname || '',
        req.email || '',
        req.phone || '',
        req.city || '',
        req.province || '',
        req.cap || '',
        req.debtTypes || '',
        req.totalAmount || '',
        (req.debtDetails || '').replace(/"/g, '""'), // Escape quotes
        req.consentSummary || '',
        req.date || ''
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Add BOM for Excel UTF-8 support
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `richieste-clienti_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ CSV esportato:', requests.length, 'richieste');
    } catch (e) {
      console.error('Errore esportazione CSV:', e);
      alert('Errore durante l\'esportazione. Riprova.');
    }
  },
  
  /**
   * Export professionals to CSV
   */
  exportProfessionalsCSV: () => {
    try {
      // Get all professionals with login credentials (real professionals)
      const realProfessionals = PROFESSIONALS_DATA.filter(pro => pro.loginUsername && pro.loginPassword);
      
      if (realProfessionals.length === 0) {
        alert('Nessun professionista da esportare.');
        return;
      }
      
      // Load saved data for each professional
      const professionals = realProfessionals.map(pro => {
        const savedData = localStorage.getItem(`professionalData_${pro.loginUsername}`);
        const saved = savedData ? JSON.parse(savedData) : {};
        
        return {
          name: saved.name || pro.name,
          email: saved.email || pro.email,
          phone: saved.phone || '',
          address: saved.address || '',
          city: saved.city || pro.city || '',
          province: saved.province || pro.province || '',
          cap: saved.cap || pro.cap || '',
          cf: saved.cf || '',
          piva: saved.piva || '',
          specialty: saved.specialty || pro.specialty,
          services: saved.services || pro.services,
          price: saved.price || pro.price,
          desc: saved.desc || pro.desc || '',
          career: saved.career || pro.career || ''
        };
      });
      
      // CSV headers
      const headers = ['Nome', 'Email', 'Telefono', 'Indirizzo', 'Città', 'Provincia', 'CAP', 'Codice Fiscale', 'Partita IVA', 'Specialità', 'Servizi', 'Tariffa (€)', 'Descrizione', 'Carriera'];
      
      // CSV rows
      const rows = professionals.map(pro => [
        pro.name || '',
        pro.email || '',
        pro.phone || '',
        pro.address || '',
        pro.city || '',
        pro.province || '',
        pro.cap || '',
        pro.cf || '',
        pro.piva || '',
        pro.specialty || '',
        (pro.services || '').replace(/"/g, '""'),
        pro.price || '',
        (pro.desc || '').replace(/"/g, '""'),
        (pro.career || '').replace(/"/g, '""')
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Add BOM for Excel UTF-8 support
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `professionisti_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ CSV esportato:', professionals.length, 'professionisti');
    } catch (e) {
      console.error('Errore esportazione CSV:', e);
      alert('Errore durante l\'esportazione. Riprova.');
    }
  },
  
  /**
   * Export client requests to Excel
   */
  exportRequestsExcel: async () => {
    try {
      if (typeof XLSX === 'undefined') {
        alert('Libreria Excel non caricata. Riprova a ricaricare la pagina.');
        return;
      }
      
      const requests = await AdminDashboard.fetchRequestsData();
      
      if (requests.length === 0) {
        alert('Nessuna richiesta da esportare.');
        return;
      }
      
      // Prepare data
      const data = requests.map(req => ({
        'Nome': req.name || '',
        'Cognome': req.surname || '',
        'Email': req.email || '',
        'Telefono': req.phone || '',
        'Città': req.city || '',
        'Provincia': req.province || '',
        'CAP': req.cap || '',
        'Tipologie Debiti': req.debtTypes || '',
        'Importo Totale': req.totalAmount || '',
        'Dettagli Debiti': req.debtDetails || '',
        'Consensi Privacy': req.consentSummary || '',
        'Data Richiesta': req.date || ''
      }));
      
      // Create workbook
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Richieste');
      
      // Export
      XLSX.writeFile(wb, `richieste-clienti_${new Date().toISOString().split('T')[0]}.xlsx`);
      console.log('✅ Excel esportato:', requests.length, 'richieste');
    } catch (e) {
      console.error('Errore esportazione Excel:', e);
      alert('Errore durante l\'esportazione Excel. Riprova.');
    }
  },
  
  /**
   * Export client requests to PDF
   */
  exportRequestsPDF: async () => {
    try {
      if (typeof window.jspdf === 'undefined') {
        alert('Libreria PDF non caricata. Riprova a ricaricare la pagina.');
        return;
      }
      
      const { jsPDF } = window.jspdf;
      const requests = await AdminDashboard.fetchRequestsData();
      
      if (requests.length === 0) {
        alert('Nessuna richiesta da esportare.');
        return;
      }
      
      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      
      // Header
      doc.setFontSize(18);
      doc.text('Richieste Clienti - Tatosolvi', margin, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.text(`Data export: ${new Date().toLocaleDateString('it-IT')}`, margin, yPosition);
      yPosition += 15;
      
      // Table data
      requests.forEach((req, index) => {
        // Check if new page needed
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Richiesta #${requests.length - index}`, margin, yPosition);
        yPosition += 7;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Data: ${req.date || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Cliente: ${req.name || ''} ${req.surname || ''}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Email: ${req.email || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Telefono: ${req.phone || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        if (req.city || req.province || req.cap) {
          doc.text(`Località: ${req.city || 'N/D'} ${req.province ? `(${req.province})` : ''} ${req.cap ? `- CAP ${req.cap}` : ''}`, margin, yPosition);
          yPosition += 5;
        }
        doc.text(`Tipi di debito: ${req.debtTypes || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        if (req.consentSummary) {
          const consentLines = doc.splitTextToSize(`Consensi privacy: ${req.consentSummary}`, 180);
          doc.text(consentLines, margin, yPosition);
          yPosition += consentLines.length * 5;
        }
        doc.text(`Importo totale: ${req.totalAmount || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        
        if (req.debtDetails) {
          const details = doc.splitTextToSize(`Dettagli: ${req.debtDetails}`, 180);
          doc.text(details, margin, yPosition);
          yPosition += details.length * 5;
        }
        
        yPosition += 10;
        
        // Draw line separator
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, 195, yPosition);
        yPosition += 5;
      });
      
      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Pagina ${i} di ${totalPages}`, 195, 285, { align: 'right' });
      }
      
      doc.save(`richieste-clienti_${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('✅ PDF esportato:', requests.length, 'richieste');
    } catch (e) {
      console.error('Errore esportazione PDF:', e);
      alert('Errore durante l\'esportazione PDF. Riprova.');
    }
  },
  
  /**
   * Export professionals to Excel
   */
  exportProfessionalsExcel: () => {
    try {
      if (typeof XLSX === 'undefined') {
        alert('Libreria Excel non caricata. Riprova a ricaricare la pagina.');
        return;
      }
      
      // Get all professionals with login credentials (real professionals)
      const realProfessionals = PROFESSIONALS_DATA.filter(pro => pro.loginUsername && pro.loginPassword);
      
      if (realProfessionals.length === 0) {
        alert('Nessun professionista da esportare.');
        return;
      }
      
      // Load saved data for each professional
      const professionals = realProfessionals.map(pro => {
        const savedData = localStorage.getItem(`professionalData_${pro.loginUsername}`);
        const saved = savedData ? JSON.parse(savedData) : {};
        
        return {
          name: saved.name || pro.name,
          email: saved.email || pro.email,
          phone: saved.phone || '',
          address: saved.address || '',
          city: saved.city || pro.city || '',
          province: saved.province || pro.province || '',
          cap: saved.cap || pro.cap || '',
          cf: saved.cf || '',
          piva: saved.piva || '',
          specialty: saved.specialty || pro.specialty,
          services: saved.services || pro.services,
          price: saved.price || pro.price,
          desc: saved.desc || pro.desc || '',
          career: saved.career || pro.career || ''
        };
      });
      
      // Prepare data
      const data = professionals.map(pro => ({
        'Nome': pro.name || '',
        'Email': pro.email || '',
        'Telefono': pro.phone || '',
        'Indirizzo': pro.address || '',
        'Città': pro.city || '',
        'Provincia': pro.province || '',
        'CAP': pro.cap || '',
        'Codice Fiscale': pro.cf || '',
        'Partita IVA': pro.piva || '',
        'Specialità': pro.specialty || '',
        'Servizi': pro.services || '',
        'Tariffa (€)': pro.price || '',
        'Descrizione': pro.desc || '',
        'Carriera': pro.career || ''
      }));
      
      // Create workbook
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Professionisti');
      
      // Export
      XLSX.writeFile(wb, `professionisti_${new Date().toISOString().split('T')[0]}.xlsx`);
      console.log('✅ Excel esportato:', professionals.length, 'professionisti');
    } catch (e) {
      console.error('Errore esportazione Excel:', e);
      alert('Errore durante l\'esportazione Excel. Riprova.');
    }
  },
  
  /**
   * Export professionals to PDF
   */
  exportProfessionalsPDF: () => {
    try {
      if (typeof window.jspdf === 'undefined') {
        alert('Libreria PDF non caricata. Riprova a ricaricare la pagina.');
        return;
      }
      
      const { jsPDF } = window.jspdf;
      
      // Get all professionals with login credentials (real professionals)
      const realProfessionals = PROFESSIONALS_DATA.filter(pro => pro.loginUsername && pro.loginPassword);
      
      if (realProfessionals.length === 0) {
        alert('Nessun professionista da esportare.');
        return;
      }
      
      // Load saved data for each professional
      const professionals = realProfessionals.map(pro => {
        const savedData = localStorage.getItem(`professionalData_${pro.loginUsername}`);
        const saved = savedData ? JSON.parse(savedData) : {};
        
        return {
          name: saved.name || pro.name,
          email: saved.email || pro.email,
          phone: saved.phone || '',
          address: saved.address || '',
          city: saved.city || pro.city || '',
          province: saved.province || pro.province || '',
          cap: saved.cap || pro.cap || '',
          cf: saved.cf || '',
          piva: saved.piva || '',
          specialty: saved.specialty || pro.specialty,
          services: saved.services || pro.services,
          price: saved.price || pro.price,
          desc: saved.desc || pro.desc || '',
          career: saved.career || pro.career || ''
        };
      });
      
      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      
      // Header
      doc.setFontSize(18);
      doc.text('Professionisti - Tatosolvi', margin, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.text(`Data export: ${new Date().toLocaleDateString('it-IT')}`, margin, yPosition);
      yPosition += 15;
      
      // Professional data
      professionals.forEach((pro, index) => {
        // Check if new page needed
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Professionista #${index + 1}`, margin, yPosition);
        yPosition += 7;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Nome: ${pro.name || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Email: ${pro.email || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Telefono: ${pro.phone || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Indirizzo: ${pro.address || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        if (pro.city || pro.province || pro.cap) {
          doc.text(`Località: ${pro.city || 'N/D'} ${pro.province ? `(${pro.province})` : ''} ${pro.cap ? `- CAP ${pro.cap}` : ''}`, margin, yPosition);
          yPosition += 5;
        }
        doc.text(`Codice Fiscale: ${pro.cf || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Partita IVA: ${pro.piva || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Specialità: ${pro.specialty || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Servizi: ${pro.services || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Tariffa: € ${pro.price || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        
        if (pro.desc) {
          const desc = doc.splitTextToSize(`Descrizione: ${pro.desc}`, 180);
          doc.text(desc, margin, yPosition);
          yPosition += desc.length * 5;
        }
        
        if (pro.career) {
          const career = doc.splitTextToSize(`Carriera: ${pro.career}`, 180);
          doc.text(career, margin, yPosition);
          yPosition += career.length * 5;
        }
        
        yPosition += 10;
        
        // Draw line separator
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, 195, yPosition);
        yPosition += 5;
      });
      
      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Pagina ${i} di ${totalPages}`, 195, 285, { align: 'right' });
      }
      
      doc.save(`professionisti_${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('✅ PDF esportato:', professionals.length, 'professionisti');
    } catch (e) {
      console.error('Errore esportazione PDF:', e);
      alert('Errore durante l\'esportazione PDF. Riprova.');
    }
  },
  
  /**
   * Load and display statistics
   */
  loadStatistics: () => {
    const container = document.getElementById('statistics-content');
    if (!container) return;
    
    try {
      const requests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
      
      // Calculate statistics
      const totalRequests = requests.length;
      const totalDebtAmount = requests.reduce((sum, req) => {
        const amount = parseFloat(req.totalAmount?.replace(/[€\s,]/g, '').replace('.', '') || '0');
        return sum + amount;
      }, 0);
      
      // Debt types distribution
      const debtTypesCount = {};
      requests.forEach(req => {
        const types = req.debtTypes?.split(', ') || [];
        types.forEach(type => {
          debtTypesCount[type] = (debtTypesCount[type] || 0) + 1;
        });
      });
      
      // Monthly trend (last 6 months)
      const monthlyData = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' });
        monthlyData[monthKey] = 0;
      }
      
      requests.forEach(req => {
        try {
          const reqDate = new Date(req.date);
          const monthKey = reqDate.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' });
          if (monthlyData.hasOwnProperty(monthKey)) {
            monthlyData[monthKey]++;
          }
        } catch (e) {
          // Ignore invalid dates
        }
      });
      
      // Calculate average debt amount
      const avgDebtAmount = totalRequests > 0 ? totalDebtAmount / totalRequests : 0;
      
      // Top debt types
      const sortedDebtTypes = Object.entries(debtTypesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      // Generate HTML
      const statsHTML = `
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">${totalRequests}</div>
          <div class="stat-label">Richieste Totali</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">€ ${totalDebtAmount.toLocaleString('it-IT', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
          <div class="stat-label">Debito Totale Gestito</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-value">€ ${avgDebtAmount.toLocaleString('it-IT', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
          <div class="stat-label">Debito Medio per Cliente</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">${Object.keys(debtTypesCount).length}</div>
          <div class="stat-label">Tipologie Debiti Diverse</div>
        </div>
        
        <div class="stat-card-wide">
          <h3 style="margin-top: 0; margin-bottom: var(--spacing-lg);">Distribuzione Tipologie Debiti</h3>
          ${sortedDebtTypes.length > 0 ? sortedDebtTypes.map(([type, count]) => {
            const percentage = totalRequests > 0 ? (count / totalRequests) * 100 : 0;
            return `
              <div class="stat-bar-item">
                <div class="stat-bar-label">
                  <span>${type}</span>
                  <span class="stat-bar-count">${count} (${percentage.toFixed(1)}%)</span>
                </div>
                <div class="stat-bar-container">
                  <div class="stat-bar-fill" style="width: ${percentage}%"></div>
                </div>
              </div>
            `;
          }).join('') : '<p style="color: var(--text-muted);">Nessun dato disponibile</p>'}
        </div>
        
        <div class="stat-card-wide">
          <h3 style="margin-top: 0; margin-bottom: var(--spacing-lg);">Andamento Mensile (Ultimi 6 Mesi)</h3>
          ${Object.keys(monthlyData).length > 0 ? Object.entries(monthlyData).map(([month, count]) => {
            const maxCount = Math.max(...Object.values(monthlyData), 1);
            const percentage = (count / maxCount) * 100;
            return `
              <div class="stat-bar-item">
                <div class="stat-bar-label">
                  <span>${month}</span>
                  <span class="stat-bar-count">${count} richieste</span>
                </div>
                <div class="stat-bar-container">
                  <div class="stat-bar-fill stat-bar-fill-secondary" style="width: ${percentage}%"></div>
                </div>
              </div>
            `;
          }).join('') : '<p style="color: var(--text-muted);">Nessun dato disponibile</p>'}
        </div>
      `;
      
      container.innerHTML = statsHTML;
    } catch (e) {
      console.error('Errore caricamento statistiche:', e);
      container.innerHTML = '<p style="color: #f56565;">Errore nel caricamento delle statistiche.</p>';
    }
  },
  
  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('adminLoggedIn');
    Navigation.goToHome();
  }
};

// ==================== LOGIN HANDLER ====================
const LoginHandler = {
  /**
   * Handle login form submission
   */
  handleLogin: () => {
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    const errorEl = document.getElementById('login-error');
    
    if (!username || !password) {
      if (errorEl) {
        errorEl.textContent = 'Inserisci username e password';
        errorEl.style.display = 'block';
      }
      return;
    }
    
    // Check credentials
    // Find professional by login credentials
    const professional = PROFESSIONALS_DATA.find(pro => 
      pro.loginUsername === username && pro.loginPassword === password
    );
    
    if (professional) {
      // Professional login
      localStorage.setItem('professionalLoggedIn', 'true');
      localStorage.setItem('currentProfessional', JSON.stringify({
        name: professional.name,
        email: professional.email,
        username: username
      }));
      Navigation.hideProfessionalLogin();
      ProfessionalDashboard.show();
      ProfessionalDashboard.loadData(professional);
    } else if (username === 'admin' && password === 'admin') {
      // Admin login (for owner)
      localStorage.setItem('adminLoggedIn', 'true');
      Navigation.hideProfessionalLogin();
      AdminDashboard.show();
    } else {
      if (errorEl) {
        errorEl.textContent = 'Username o password non corretti';
        errorEl.style.display = 'block';
      }
    }
  },
  
  /**
   * Initialize login handlers
   */
  init: () => {
    const submitBtn = document.getElementById('submitLogin');
    const closeBtn = document.getElementById('closeLoginModal');
    const modal = document.getElementById('professionalLoginModal');
    
    if (submitBtn) {
      submitBtn.addEventListener('click', LoginHandler.handleLogin);
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', Navigation.hideProfessionalLogin);
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          Navigation.hideProfessionalLogin();
        }
      });
      
      // Enter key to submit
      document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        LoginHandler.handleLogin();
      });
    }
  }
};

// ==================== FOOTER PROFESSIONALS LIST ====================
const FooterProfessionals = {
  /**
   * Extract name and surname from full name (handles titles like "Avv. Elena Rossi")
   */
  extractNameParts: (fullName) => {
    if (!fullName) return { firstName: '', surname: '' };
    
    const nameParts = fullName.trim().split(/\s+/);
    let firstName = '';
    let surname = '';
    
    if (nameParts.length === 1) {
      firstName = nameParts[0] || '';
    } else if (nameParts.length === 2) {
      firstName = nameParts[0] || '';
      surname = nameParts[1] || '';
    } else {
      // More than 2 parts: likely "Titolo Nome Cognome" or "Nome Cognome Cognome"
      // Check if first part is a title (Avv., Dott., etc.)
      const titles = ['Avv.', 'Dott.', 'Dott.ssa', 'Ing.', 'Arch.', 'Rag.', 'Geom.'];
      if (titles.includes(nameParts[0])) {
        firstName = nameParts[1] || '';
        surname = nameParts.slice(2).join(' ') || '';
      } else {
        firstName = nameParts[0] || '';
        surname = nameParts.slice(1).join(' ') || '';
      }
    }
    
    return { firstName, surname };
  },
  
  /**
   * Get all professionals with saved data merged
   */
  getAllProfessionals: () => {
    return PROFESSIONALS_DATA.map((pro, index) => {
      // Check if there's saved data for this professional
      const savedDataKey = `professionalData_${pro.loginUsername || index}`;
      const savedData = localStorage.getItem(savedDataKey);
      let finalPro = { ...pro };
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Merge saved data with original data
          finalPro = {
            ...pro,
            name: parsed.name || pro.name,
            email: parsed.email || pro.email,
            phone: parsed.phone || pro.phone || '',
            city: parsed.city || pro.city || '',
            province: parsed.province || pro.province || '',
            cap: parsed.cap || pro.cap || ''
          };
        } catch (e) {
          console.warn('Errore parsing dati professionista salvati:', e);
        }
      }
      
      return finalPro;
    });
  },
  
  /**
   * Render the professionals table
   */
  renderTable: () => {
    console.log('📊 Rendering tabella professionisti...');
    const tableBody = document.getElementById('professionals-table-body');
    if (!tableBody) {
      console.error('❌ Elemento professionals-table-body non trovato!');
      return;
    }
    
    const professionalsList = FooterProfessionals.getAllProfessionals();
    console.log('📋 Professionisti trovati:', professionalsList.length);
    
    if (professionalsList.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: var(--spacing-xl);">Nessun professionista disponibile al momento.</td></tr>';
      return;
    }
    
    // Render table rows
    const rowsHTML = professionalsList.map(pro => {
      const { firstName, surname } = FooterProfessionals.extractNameParts(pro.name);
      const city = pro.city || 'N/D';
      const phone = pro.phone || 'N/A';
      const email = pro.email || 'N/A';
      
      return `
        <tr>
          <td>${firstName || 'N/A'}</td>
          <td>${surname || 'N/A'}</td>
          <td>${city}</td>
          <td>${phone}</td>
          <td>${email}</td>
        </tr>
      `;
    }).join('');
    
    tableBody.innerHTML = rowsHTML;
    console.log('✅ Tabella renderizzata con', professionalsList.length, 'professionisti');
  },
  
  /**
   * Show the professionals list page
   */
  showList: () => {
    // Hide other pages
    DOM.pageWizard.classList.remove('active');
    DOM.pagePro.classList.remove('active');
    const privacyPage = document.getElementById('privacy-policy');
    const professionalPage = document.getElementById('page-professional');
    const adminPage = document.getElementById('page-admin');
    const joinPage = DOM.pageJoin;
    
    if (privacyPage) privacyPage.hidden = true;
    if (professionalPage) professionalPage.hidden = true;
    if (adminPage) adminPage.hidden = true;
    if (joinPage) joinPage.hidden = true;
    
    // Show professionals list page
    const listPage = document.getElementById('professionals-list-page');
    if (listPage) {
      listPage.hidden = false;
      listPage.classList.add('active');
      FooterProfessionals.renderTable();
      Navigation.closeMenu();
      Utils.scrollToTop();
    }
  },
  
  /**
   * Hide the professionals list page and return to home
   */
  hideList: () => {
    const listPage = document.getElementById('professionals-list-page');
    if (listPage) {
      listPage.classList.remove('active');
      listPage.hidden = true;
    }
    Navigation.goToHome();
  },
  
  /**
   * Initialize footer professionals functionality
   */
  init: () => {
    // Re-render table when professionals data changes
    // This will be called when a professional saves their data
    const originalSaveData = ProfessionalDashboard.saveData;
    if (originalSaveData) {
      ProfessionalDashboard.saveData = function(...args) {
        const result = originalSaveData.apply(this, args);
        // Re-render table if the page is visible
        const listPage = document.getElementById('professionals-list-page');
        if (listPage && !listPage.hidden) {
          FooterProfessionals.renderTable();
        }
        return result;
      };
    }
  }
};

// ==================== APP INITIALIZATION ====================
const App = {
  init: () => {
    EmailService.init();
    Wizard.init();
    Modal.init();
    Professionals.init();
    Geo.populateProvinceSelects();
    Navigation.initMenu();
    ProfessionalApplication.init();
    ProfessionalReview.init();
    CookieConsent.init();
    FooterProfessionals.init();
    const capField = document.getElementById('cap');
    if (capField) {
      capField.addEventListener('input', () => Professionals.updateSortHint());
    }
    Professionals.updateSortHint();
    LoginHandler.init();
    
    // Ensure the app always starts from the home wizard
    Navigation.goToHome();
    
    // Avoid automatic redirects to reserved areas on refresh
    localStorage.removeItem('professionalLoggedIn');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('currentProfessional');
    
    console.log('✅ Tatosolvi app initialized');
  }
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}


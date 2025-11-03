// ==================== CONFIGURAZIONE EMAIL ====================
// 🔧 ISTRUZIONI: Segui la guida in CONFIG-EMAIL.txt per configurare EmailJS
const EMAIL_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',      // ← Inserisci qui il tuo Service ID
  templateId: 'YOUR_TEMPLATE_ID',    // ← Inserisci qui il tuo Template ID
  publicKey: 'YOUR_PUBLIC_KEY',      // ← Inserisci qui la tua Public Key
  recipientEmail: 'tuaemail@example.com'  // ← Email dove ricevere le richieste
};

// ==================== APP STATE ====================
const state = {
  currentStep: 1,
  selections: [],
  debtCreditors: {}, // { banche_finanziarie: [{creditor: "Banca X", amount: 5000}, {...}], ... }
  formData: {}
};

// ==================== DEBT TYPE LABELS ====================
const DEBT_LABELS = {
  banche_finanziarie: 'Debiti con banche e/o finanziaria',
  tributari: 'Debiti tributari',
  erario: 'Debiti con erario'
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
    calendarLink: "https://calendar.google.com/calendar/u/0?cid=Z2lhbmx1Y2EuY29sbGlhQGdvYnJhdm8uaXQ", // ← Link calendario Google
    email: "gianluca.collia@gmail.com" // ← Email per ricevere notifiche prenotazioni
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

// ==================== DOM REFERENCES ====================
const DOM = {
  // Pages
  pageWizard: document.getElementById('page-wizard'),
  pagePro: document.getElementById('page-pro'),
  
  // Progress
  progressBar: document.getElementById('bar'),
  stepIndicators: document.querySelectorAll('.step'),
  
  // Steps
  step1: document.getElementById('step1'),
  step2: document.getElementById('step2'),
  step3: document.getElementById('step3'),
  
  // Step 1
  optionButtons: document.querySelectorAll('.opt'),
  toStep2Btn: document.getElementById('to2'),
  
  // Step 2
  form: document.getElementById('form'),
  chipsSpan: document.getElementById('chips'),
  back1Btn: document.getElementById('back1'),
  toStep3Btn: document.getElementById('to3'),
  
  // Step 3
  reviewDiv: document.getElementById('review'),
  back2Btn: document.getElementById('back2'),
  submitBtn: document.getElementById('submit'),
  successMsg: document.getElementById('ok'),
  sendingMsg: document.getElementById('sending'),
  emailErrorMsg: document.getElementById('email-error'),
  
  // Modal
  modal: document.getElementById('gdprModal'),
  consentChk: document.getElementById('consentChk'),
  closeModalBtn: document.getElementById('closeModal'),
  confirmSendBtn: document.getElementById('confirmSend'),
  
  // Professionals
  searchInput: document.getElementById('search'),
  filterChips: document.querySelectorAll('.chip'),
  proGrid: document.getElementById('pro-grid')
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
  /**
   * Show professionals page
   */
  showProfessionals: () => {
    DOM.pageWizard.classList.remove('active');
    DOM.pagePro.classList.add('active');
    Navigation.updateGlobalBackButton();
    Utils.scrollToTop();
  },
  
  /**
   * Go to home (wizard page)
   */
  goToHome: () => {
    DOM.pagePro.classList.remove('active');
    DOM.pageWizard.classList.add('active');
    Wizard.showStep(1);
    Navigation.updateGlobalBackButton();
    Utils.scrollToTop();
  },
  
  /**
   * Go back (previous step or home)
   */
  goBack: () => {
    if (DOM.pagePro.classList.contains('active')) {
      Navigation.goToHome();
    } else if (state.currentStep > 1) {
      Wizard.showStep(state.currentStep - 1);
      Navigation.updateGlobalBackButton();
    }
  },
  
  /**
   * Update global back button visibility
   */
  updateGlobalBackButton: () => {
    const globalBackBtn = document.getElementById('global-back-btn');
    if (!globalBackBtn) return;
    
    // Show if not on step 1 of wizard or if on professionals page
    const isProfessionalsPage = DOM.pagePro.classList.contains('active');
    const isStep1 = state.currentStep === 1 && !isProfessionalsPage;
    
    globalBackBtn.style.display = isStep1 ? 'none' : 'flex';
  },
  
  /**
   * Scroll to client section (wizard step 1)
   */
  scrollToClient: () => {
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
   * Show professional login modal
   */
  showProfessionalLogin: () => {
    const modal = document.getElementById('professionalLoginModal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
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
  }
};

// ==================== WIZARD ====================
const Wizard = {
  /**
   * Update progress bar and step indicators
   */
  updateProgress: (step) => {
    const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;
    DOM.progressBar.style.width = `${progressValue}%`;
    DOM.progressBar.parentElement.setAttribute('aria-valuenow', progressValue);
    
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
    
    const currentStepElement = [DOM.step1, DOM.step2, DOM.step3][state.currentStep - 1];
    const nextStepElement = [DOM.step1, DOM.step2, DOM.step3][step - 1];
    
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
          total += Number(item.amount) || 0;
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
   * Add another creditor for a debt type
   */
  addCreditor: (debtType) => {
    const detailsContainer = document.getElementById(`details-${debtType}`);
    if (!detailsContainer) return;
    
    const debtItem = document.createElement('div');
    debtItem.className = 'debt-item';
    debtItem.innerHTML = `
      <div class="debt-row">
        <input type="text" class="creditor-input" placeholder="Nome creditore" aria-label="Nome creditore">
        <input type="number" min="0" step="0.01" class="amount-input-field" placeholder="Importo in €" aria-label="Importo">
        <button type="button" class="btn-remove-creditor" onclick="Wizard.removeCreditor(this)" aria-label="Rimuovi">×</button>
      </div>
    `;
    
    // Insert before the "Aggiungi un altro" button
    const addButton = detailsContainer.querySelector('.btn-add-creditor');
    detailsContainer.insertBefore(debtItem, addButton);
    
    // Add listeners
    const creditorInput = debtItem.querySelector('.creditor-input');
    const amountInput = debtItem.querySelector('.amount-input-field');
    
    const updateDebt = () => {
      if (!state.debtCreditors[debtType]) {
        state.debtCreditors[debtType] = [];
      }
      const index = Array.from(detailsContainer.querySelectorAll('.debt-item')).indexOf(debtItem);
      if (index !== -1) {
        state.debtCreditors[debtType][index] = {
          creditor: creditorInput.value.trim(),
          amount: Number(amountInput.value) || 0
        };
        Wizard.updateTotalAmount();
      }
    };
    
    creditorInput.addEventListener('input', updateDebt);
    amountInput.addEventListener('input', updateDebt);
  },
  
  /**
   * Remove a creditor
   */
  removeCreditor: (button) => {
    const debtItem = button.closest('.debt-item');
    const detailsContainer = debtItem.closest('.debt-details');
    const debtType = detailsContainer.id.replace('details-', '');
    
    debtItem.remove();
    
    // Recalculate all creditors for this type
    if (state.debtCreditors[debtType]) {
      const items = detailsContainer.querySelectorAll('.debt-item');
      state.debtCreditors[debtType] = [];
      items.forEach(item => {
        const creditorInput = item.querySelector('.creditor-input');
        const amountInput = item.querySelector('.amount-input-field');
        if (creditorInput && amountInput) {
          state.debtCreditors[debtType].push({
            creditor: creditorInput.value.trim(),
            amount: Number(amountInput.value) || 0
          });
        }
      });
    }
    
    Wizard.updateTotalAmount();
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
        // Clear all inputs
        detailsContainer.querySelectorAll('.creditor-input, .amount-input-field').forEach(input => {
          input.value = '';
        });
        // Clear from state
        delete state.debtCreditors[value];
        // Reset to single item
        const items = detailsContainer.querySelectorAll('.debt-item');
        items.forEach((item, index) => {
          if (index > 0) item.remove();
        });
        delete state.debtCreditors[value];
        Wizard.saveStateToStorage();
      }
    } else {
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      state.selections.push(value);
      if (detailsContainer) {
        detailsContainer.style.display = 'block';
        Wizard.saveStateToStorage();
        if (!state.debtCreditors[value]) {
          state.debtCreditors[value] = [];
        }
        
        // Add listeners to first item
        const firstItem = detailsContainer.querySelector('.debt-item');
        if (firstItem) {
          const creditorInput = firstItem.querySelector('.creditor-input');
          const amountInput = firstItem.querySelector('.amount-input-field');
          
          const updateDebt = () => {
            if (state.debtCreditors[value].length === 0) {
              state.debtCreditors[value].push({ creditor: '', amount: 0 });
            }
            state.debtCreditors[value][0] = {
              creditor: creditorInput.value.trim(),
              amount: Number(amountInput.value) || 0
            };
            Wizard.updateTotalAmount();
          };
          
          creditorInput.addEventListener('input', updateDebt);
          amountInput.addEventListener('input', updateDebt);
        }
      }
    }
    
    DOM.toStep2Btn.disabled = state.selections.length === 0;
    Wizard.updateTotalAmount();
    Wizard.saveStateToStorage();
  },
  
  /**
   * Move to Step 2
   */
  goToStep2: () => {
    const chipsHTML = state.selections
      .map(sel => `<span class="pill">${DEBT_LABELS[sel] || sel}</span>`)
      .join(' ');
    DOM.chipsSpan.innerHTML = chipsHTML;
    Wizard.showStep(2);
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
    const fields = ['nome', 'cognome', 'telefono', 'email'];
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
   * Move to Step 3 (Review)
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
          const creditorInput = item.querySelector('.creditor-input');
          const amountInput = item.querySelector('.amount-input-field');
          if (creditorInput && amountInput) {
            state.debtCreditors[debtType].push({
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
      totalAmount: totalAmount
    };
    
    // Generate debts detail with all creditors
    let debtsDetail = '';
    state.selections.forEach(debtType => {
      const creditors = state.debtCreditors[debtType] || [];
      const typeLabel = DEBT_LABELS[debtType] || debtType;
      
      if (creditors.length === 0) {
        debtsDetail += `<li><b>${typeLabel}:</b> Nessun creditore specificato</li>`;
      } else {
        creditors.forEach((item, index) => {
          if (item.creditor || item.amount > 0) {
            const creditorName = item.creditor || 'Creditore non specificato';
            debtsDetail += `<li><b>${typeLabel}${creditors.length > 1 ? ` (${index + 1})` : ''}:</b> ${creditorName} - € ${item.amount.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</li>`;
          }
        });
      }
    });
    
    // Generate review HTML
    const reviewHTML = `
      <ul>
        <li><b>Nome:</b> ${state.formData.nome} ${state.formData.cognome}</li>
        <li><b>Cellulare:</b> ${state.formData.telefono}</li>
        <li><b>Email:</b> ${state.formData.email}</li>
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
    ['nome', 'cognome', 'telefono', 'email'].forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (input) {
        let timeout;
        
        // Real-time validation while typing (debounced)
        input.addEventListener('input', () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            Wizard.validateField(fieldId, input.value, true);
          }, 300);
        });
        
        // Immediate validation on blur
        input.addEventListener('blur', () => {
          clearTimeout(timeout);
          Wizard.validateField(fieldId, input.value, true);
        });
        
        // Save on change
        input.addEventListener('input', () => {
          Wizard.saveStateToStorage();
        });
      }
    });
    
    DOM.back1Btn.addEventListener('click', () => Wizard.showStep(1));
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
        const fields = ['nome', 'cognome', 'telefono', 'email'];
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
    DOM.back2Btn.addEventListener('click', () => Wizard.showStep(2));
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
          state.selections = savedData.selections;
          state.debtCreditors = savedData.debtCreditors || {};
          
          // Restore UI for selections
          savedData.selections.forEach(sel => {
            const button = document.querySelector(`[data-value="${sel}"]`);
            if (button) {
              button.classList.add('selected');
              button.setAttribute('aria-pressed', 'true');
              const detailsContainer = document.getElementById(`details-${sel}`);
              if (detailsContainer) {
                detailsContainer.style.display = 'block';
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
    if (typeof emailjs !== 'undefined' && EMAIL_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
      emailjs.init(EMAIL_CONFIG.publicKey);
      console.log('✅ EmailJS initialized');
    } else {
      console.warn('⚠️ EmailJS non configurato. Leggi CONFIG-EMAIL.txt');
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
      
      // Prepare email data
      const emailData = {
        to_email: EMAIL_CONFIG.recipientEmail,
        from_name: `${state.formData.nome} ${state.formData.cognome}`,
        from_email: state.formData.email,
        phone: state.formData.telefono,
        debt_types: state.selections.map(s => DEBT_LABELS[s] || s).join(', '),
        debt_details: debtsDetail.trim(),
        debt_amount: `€ ${state.formData.totalAmount.toLocaleString('it-IT', {minimumFractionDigits: 2})}`,
        submission_date: new Date().toLocaleString('it-IT')
      };
      
      // Send via EmailJS
      const response = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        emailData
      );
      
      console.log('✅ Email inviata con successo:', response);
      DOM.sendingMsg.style.display = 'none';
      DOM.successMsg.style.display = 'block';
      
      // Save request to admin dashboard
      try {
        const requestData = {
          name: state.formData.nome,
          surname: state.formData.cognome,
          email: state.formData.email,
          phone: state.formData.telefono,
          debtTypes: state.selections.map(s => DEBT_LABELS[s] || s).join(', '),
          totalAmount: `€ ${state.formData.totalAmount.toLocaleString('it-IT', {minimumFractionDigits: 2})}`,
          debtDetails: debtsDetail.trim(),
          date: new Date().toLocaleString('it-IT')
        };
        
        const existingRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
        existingRequests.push(requestData);
        localStorage.setItem('clientRequests', JSON.stringify(existingRequests));
      } catch (e) {
        console.error('Errore salvataggio richiesta:', e);
      }
      
      // Clear saved state after successful submission
      Wizard.clearSavedState();
      
      return true;
      
    } catch (error) {
      console.error('❌ Errore invio email:', error);
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

// ==================== MODAL ====================
const Modal = {
  /**
   * Open GDPR modal
   */
  open: () => {
    DOM.consentChk.checked = false;
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
    Modal.close();
    
    // Send email
    await EmailService.sendEmail();
    
    // Determine appropriate filter based on selections
    let targetFilter = 'all';
    if (state.selections.includes('banche_finanziarie')) {
      targetFilter = 'bancari';
    } else if (state.selections.includes('tributari') || state.selections.includes('erario')) {
      targetFilter = 'fiscali';
    }
    
    // Navigate to professionals page
    setTimeout(() => {
      Navigation.showProfessionals();
      Professionals.applyFilter(targetFilter);
    }, 2000);
  },
  
  /**
   * Initialize modal event listeners
   */
  init: () => {
    DOM.consentChk.addEventListener('change', () => {
      DOM.confirmSendBtn.disabled = !DOM.consentChk.checked;
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
      const tagLabels = { bancari: 'Bancari', fiscali: 'Fiscali', aziende: 'Aziende', privati: 'Privati' };
      return `<span class="tag">${tagLabels[tag] || tag}</span>`;
    }).join('');
    
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
    
    return `
      <article class="pro-card" data-tags="${pro.tags.join(' ')}" data-searchtext="${pro.name.toLowerCase()} ${pro.specialty.toLowerCase()} ${pro.services.toLowerCase()} ${pro.desc.toLowerCase()}" data-pro-index="${index}">
        <h3 class="pro-title">${pro.name}</h3>
        <div class="pro-sub">${pro.specialty}</div>
        <div class="pro-sub" style="margin-top:4px; font-size:0.85rem;">${pro.services}</div>
        <div class="pro-price">da € ${pro.price}</div>
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
    const html = PROFESSIONALS_DATA.map((pro, index) => Professionals.createCard(pro, index)).join('');
    DOM.proGrid.innerHTML = html;
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
    content.innerHTML = `
      <div class="pro-modal-header">
        <h2>${pro.name}</h2>
        <div class="pro-modal-specialty">${pro.specialty}</div>
        <div class="pro-modal-price">da € ${pro.price}</div>
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
    
    if (confirm(`Confermi la prenotazione?\n\n${pro.name}\n${date} alle ${time}`)) {
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
      
      const title = encodeURIComponent(`Consulenza con ${pro.name} - Debito Zero Solvo`);
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
          from_name: 'Debito Zero - Solvo',
          subject: `📅 Nuova prenotazione: ${eventDate} alle ${eventTime}`,
          appointment_professional: pro.name,
          appointment_date: eventDate,
          appointment_time: `${eventTime} - ${eventEndTime}`,
          appointment_duration: '1 ora',
          client_name: clientFullName,
          client_phone: clientPhone || 'Non fornito',
          client_email: clientEmail || 'Non fornita',
          appointment_details: `Consulenza per gestione debiti - Debito Zero Solvo`,
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
        alert(`✅ Prenotazione confermata!\n\n${pro.name} riceverà una notifica email con i dettagli.\n\nData: ${date} alle ${time}`);
      } else {
        // Google Calendar link
        const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
        window.open(googleCalendarLink, '_blank');
        
        alert(`✅ Prenotazione confermata!\n\n${pro.name} riceverà una notifica email con i dettagli.\n\nData: ${date} alle ${time}\n\nAggiungi l'evento al tuo calendario Google.`);
      }
      
      Professionals.closeDetails();
    }
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
   * Initialize professionals section
   */
  init: () => {
    // Render professionals
    Professionals.render();
    
    // Search input
    DOM.searchInput.addEventListener('input', Professionals.applySearch);
    
    // Filter chips
    DOM.filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        Professionals.applyFilter(chip.dataset.filter);
      });
    });
    
    // Initialize with 'all' filter
    Professionals.applyFilter('all');
  }
};

// ==================== PROFESSIONAL DASHBOARD ====================
const ProfessionalDashboard = {
  /**
   * Show professional dashboard
   */
  show: () => {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
      page.hidden = true;
    });
    const proPage = document.getElementById('page-professional');
    if (proPage) {
      proPage.hidden = false;
      proPage.classList.add('active');
      Navigation.updateGlobalBackButton();
      Utils.scrollToTop();
    }
  },
  
  /**
   * Save professional data
   */
  saveData: () => {
    const data = {
      name: document.getElementById('pro-name')?.value || '',
      email: document.getElementById('pro-email')?.value || '',
      phone: document.getElementById('pro-phone')?.value || '',
      address: document.getElementById('pro-address')?.value || '',
      cf: document.getElementById('pro-cf')?.value || '',
      piva: document.getElementById('pro-piva')?.value || '',
      specialty: document.getElementById('pro-specialty')?.value || '',
      services: document.getElementById('pro-services')?.value || '',
      price: document.getElementById('pro-price')?.value || '',
      desc: document.getElementById('pro-desc')?.value || '',
      career: document.getElementById('pro-career')?.value || '',
      lastUpdate: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('professionalData', JSON.stringify(data));
      alert('✅ Dati salvati con successo!');
    } catch (e) {
      console.error('Errore salvataggio:', e);
      alert('❌ Errore nel salvataggio dei dati');
    }
  },
  
  /**
   * Load professional data
   */
  loadData: () => {
    try {
      const saved = localStorage.getItem('professionalData');
      if (saved) {
        const data = JSON.parse(saved);
        if (document.getElementById('pro-phone')) document.getElementById('pro-phone').value = data.phone || '';
        if (document.getElementById('pro-address')) document.getElementById('pro-address').value = data.address || '';
        if (document.getElementById('pro-cf')) document.getElementById('pro-cf').value = data.cf || '';
        if (document.getElementById('pro-piva')) document.getElementById('pro-piva').value = data.piva || '';
        if (document.getElementById('pro-specialty')) document.getElementById('pro-specialty').value = data.specialty || '';
        if (document.getElementById('pro-services')) document.getElementById('pro-services').value = data.services || '';
        if (document.getElementById('pro-price')) document.getElementById('pro-price').value = data.price || '';
        if (document.getElementById('pro-desc')) document.getElementById('pro-desc').value = data.desc || '';
        if (document.getElementById('pro-career')) document.getElementById('pro-career').value = data.career || '';
      }
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
  loadData: () => {
    if (AdminDashboard.currentTab === 'requests') {
      AdminDashboard.loadRequests();
    } else {
      AdminDashboard.loadProfessionals();
    }
  },
  
  /**
   * Load client requests
   */
  loadRequests: () => {
    const container = document.getElementById('requests-list');
    if (!container) return;
    
    try {
      const allRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
      
      if (allRequests.length === 0) {
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
            <div class="data-row">
              <strong>Tipi di debito:</strong> ${request.debtTypes || 'N/A'}
            </div>
            <div class="data-row">
              <strong>Totale debiti:</strong> ${request.totalAmount || 'N/A'}
            </div>
            ${request.debtDetails ? `<div class="data-row"><strong>Dettagli:</strong><pre style="white-space: pre-wrap; margin-top: 8px;">${request.debtDetails}</pre></div>` : ''}
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error('Errore caricamento richieste:', e);
      container.innerHTML = '<p style="color: #f56565;">Errore nel caricamento delle richieste.</p>';
    }
  },
  
  /**
   * Load professionals list
   */
  loadProfessionals: () => {
    const container = document.getElementById('professionals-list');
    if (!container) return;
    
    try {
      const professionals = [];
      
      // Add Gianluca Collia (default)
      professionals.push({
        name: 'Gianluca Collia',
        email: 'gianluca.collia@gmail.com',
        specialty: 'Consulente Gestione Crisi Debitoria',
        price: 400
      });
      
      // Load saved professional data
      const saved = localStorage.getItem('professionalData');
      if (saved) {
        const data = JSON.parse(saved);
        professionals[0] = { ...professionals[0], ...data };
      }
      
      container.innerHTML = professionals.map(pro => `
        <div class="data-card">
          <div class="data-card-header">
            <h3>${pro.name || 'N/A'}</h3>
          </div>
          <div class="data-card-body">
            <div class="data-row">
              <strong>Email:</strong> ${pro.email || 'N/A'}
            </div>
            <div class="data-row">
              <strong>Telefono:</strong> ${pro.phone || 'N/A'}
            </div>
            <div class="data-row">
              <strong>Specialità:</strong> ${pro.specialty || 'N/A'}
            </div>
            <div class="data-row">
              <strong>Tariffa:</strong> € ${pro.price || 'N/A'}
            </div>
            ${pro.services ? `<div class="data-row"><strong>Servizi:</strong> ${pro.services}</div>` : ''}
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error('Errore caricamento professionisti:', e);
      container.innerHTML = '<p style="color: #f56565;">Errore nel caricamento dei professionisti.</p>';
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
    if (username === 'gianluca90' && password === 'gianluca90') {
      // Professional login
      localStorage.setItem('professionalLoggedIn', 'true');
      Navigation.hideProfessionalLogin();
      ProfessionalDashboard.show();
      ProfessionalDashboard.loadData();
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

// ==================== APP INITIALIZATION ====================
const App = {
  init: () => {
    EmailService.init();
    Wizard.init();
    Modal.init();
    Professionals.init();
    LoginHandler.init();
    
    // Check if already logged in
    if (localStorage.getItem('professionalLoggedIn') === 'true') {
      ProfessionalDashboard.show();
      ProfessionalDashboard.loadData();
    } else if (localStorage.getItem('adminLoggedIn') === 'true') {
      AdminDashboard.show();
    }
    
    console.log('✅ Debito Zero - Solvo app initialized');
  }
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}


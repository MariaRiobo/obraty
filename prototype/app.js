const EVENT_TYPES = Object.freeze({
    UPLOAD_CREATED: 'UPLOAD_CREATED',
    NOTIFICATION_SENT: 'NOTIFICATION_SENT',
    COMMENT_ADDED: 'COMMENT_ADDED',
    TECH_REPLY_ADDED: 'TECH_REPLY_ADDED',
    VERSION_EVENT_LOGGED: 'VERSION_EVENT_LOGGED'
});

const EVENT_LABELS = {
    UPLOAD_CREATED: 'Documento cargado',
    NOTIFICATION_SENT: 'Alerta enviada',
    COMMENT_ADDED: 'Comentario',
    TECH_REPLY_ADDED: 'Respuesta del equipo técnico',
    VERSION_EVENT_LOGGED: 'Cambio registrado'
};

const DOC_TYPES = [
    { id: 'plano', label: 'Plano', folder: 'Planos' },
    { id: 'remito', label: 'Remito', folder: 'Insumos' },
    { id: 'boleto', label: 'Boleto de compraventa', folder: 'Boletos' },
    { id: 'permiso-obra', label: 'Permiso de obra', folder: 'Legales' },
    { id: 'permiso-municipal', label: 'Permiso municipal', folder: 'Legales' },
    { id: 'habilitacion', label: 'Habilitación', folder: 'Legales' },
    { id: 'factura', label: 'Factura', folder: 'Facturas' },
    { id: 'comprobante', label: 'Comprobante de pago', folder: 'Comprobantes' },
    { id: 'certificado', label: 'Certificado', folder: 'Certificados' },
    { id: 'acta', label: 'Acta de obra', folder: 'Actas' },
    { id: 'foto-avance', label: 'Foto de avance', folder: 'Documentación de obra' },
    { id: 'parte-diario', label: 'Parte diario de obra', folder: 'Documentación de obra' },
    { id: 'registro-visita', label: 'Registro de visita de obra', folder: 'Documentación de obra' },
    { id: 'memoria', label: 'Memoria descriptiva', folder: 'Documentos técnicos' },
    { id: 'pliego', label: 'Pliego técnico', folder: 'Documentos técnicos' },
    { id: 'computo', label: 'Cómputo y presupuesto', folder: 'Presupuestos' },
    { id: 'contrato', label: 'Contrato', folder: 'Legales' },
    { id: 'seguro', label: 'Seguro / ART', folder: 'Legales' },
    { id: 'final-obra', label: 'Final de obra', folder: 'Cierre y entrega' },
    { id: 'acta-entrega', label: 'Acta de entrega', folder: 'Cierre y entrega' },
    { id: 'conforme-obra', label: 'Plano conforme a obra (as-built)', folder: 'Cierre y entrega' },
    { id: 'garantia', label: 'Garantía', folder: 'Cierre y entrega' },
    { id: 'manual-uso', label: 'Manual de uso y mantenimiento', folder: 'Cierre y entrega' },
    { id: 'otro', label: 'Otro', folder: 'Otros' }
];

function docTypeLabel(doc) {
    if (doc.typeId) {
        const found = DOC_TYPES.find(item => item.id === doc.typeId);
        if (found) return found.label;
    }
    return doc.folder || 'Documento';
}

// Sectores / niveles de obra para clasificar planos y documentación técnica
const DOC_SECTORS = [
    'General / Toda la obra',
    'Subsuelo / Cocheras',
    'Planta baja',
    'Niveles 1 a 3',
    'Niveles 4 a 6',
    'Niveles 7 o más',
    'Terraza / Azotea',
    'Áreas comunes',
    'Fachada / Exterior'
];

// Los planos, la documentación técnica y los planos conforme a obra se vinculan a un sector o nivel
function typeNeedsSector(typeId) {
    if (typeId === 'conforme-obra') return true;
    const type = DOC_TYPES.find(item => item.id === typeId);
    return Boolean(type && (type.folder === 'Planos' || type.folder === 'Documentos técnicos'));
}

// Mensaje que detalla qué campos faltan completar para habilitar la subida
function uploadMissingMessage() {
    const missing = [];
    if (!docsForm.typeId) missing.push('el tipo de documento');
    if (!docsForm.name) missing.push('el nombre');
    if (!docsForm.file) missing.push('el archivo');
    if (!missing.length) return '';
    let list;
    if (missing.length === 1) {
        list = missing[0];
    } else {
        list = missing.slice(0, -1).join(', ') + ' y ' + missing[missing.length - 1];
    }
    const verb = missing.length === 1 ? 'Falta' : 'Faltan';
    return `${verb} ${list} para poder subir.`;
}

const ROLES = {
    developer: {
        id: 'developer',
        label: 'Desarrolladora',
        homeTitle: 'Mis obras'
    },
    architect: {
        id: 'architect',
        label: 'Equipo técnico',
        homeTitle: 'Mis obras'
    },
    owner: {
        id: 'owner',
        label: 'Propietario',
        homeTitle: 'Mi unidad'
    }
};

const TAB_TITLES = {
    home: 'Inicio',
    docs: 'Mis archivos',
    library: 'Documentos del proyecto',
    notifications: 'Alertas',
    history: 'Historial',
    profile: 'Mi perfil'
};

function tabTitleFor(tabId) {
    if (tabId === 'library') return 'Documentos';
    if (tabId === 'notifications') return 'Comunicados';
    if (tabId === 'history') return 'Historial';
    if (tabId === 'profile') return 'Mi perfil';
    return TAB_TITLES[tabId] || '';
}

// ===== Remitos: lista inicial por obra =====
function seedRemitos() {
    const base = [
        { name: 'Hormigón H30 — losa nivel 4', vendor: 'Hormigonera Sur', need: 'Pedido por jefe de obra', urgent: true },
        { name: 'Acero — refuerzos columna C7', vendor: 'Acindar', need: 'Stock crítico en obra', urgent: true },
        { name: 'Ladrillos cerámicos — piso 5', vendor: 'Ctibor', need: 'Avanza mampostería piso 5', urgent: false },
        { name: 'Caños PVC — sanitarios piso 3', vendor: 'Tigre', need: 'Próxima etapa instalaciones', urgent: false },
        { name: 'Cables eléctricos — tableros piso 2', vendor: 'Prysmian', need: 'Próxima etapa instalaciones', urgent: false }
    ];
    const out = [];
    ['patria', 'loft'].forEach(projectId => {
        base.forEach((item, index) => {
            out.push({
                id: `rem-${projectId}-${index + 1}`,
                projectId,
                status: 'pendiente', // pendiente -> solicitado -> cargado
                documentId: null,
                ...item
            });
        });
    });
    return out;
}

// ===== Persistencia: sobrevive al refresh y se sincroniza entre pestañas =====
const STORAGE_DATA_KEY = 'obraty:data:v1';
const STORAGE_SESSION_KEY = 'obraty:session:v1';
const PERSIST_DATA_KEYS = [
    'documents', 'notifications', 'threads', 'versionHistory', 'remitos',
    'completedTaskIds', 'ownerCommentDone', 'mentionDone', 'techResponseDone', 'budgetRequested'
];
const PERSIST_SESSION_KEYS = ['currentRole', 'currentProject', 'activeTab'];
let lastDataRaw = null;

function persistData() {
    try {
        const data = {};
        PERSIST_DATA_KEYS.forEach(key => { data[key] = state[key]; });
        const raw = JSON.stringify(data);
        if (raw === lastDataRaw) return;
        localStorage.setItem(STORAGE_DATA_KEY, raw);
        lastDataRaw = raw;
    } catch (err) {
        // Cuota excedida: guardamos sin el contenido pesado de los archivos.
        try {
            const data = {};
            PERSIST_DATA_KEYS.forEach(key => { data[key] = state[key]; });
            data.documents = (state.documents || []).map(doc => {
                const copy = { ...doc };
                delete copy.fileData;
                return copy;
            });
            const raw = JSON.stringify(data);
            localStorage.setItem(STORAGE_DATA_KEY, raw);
            lastDataRaw = raw;
        } catch (err2) {
            /* sin almacenamiento disponible */
        }
    }
}

function persistSession() {
    try {
        const session = {};
        PERSIST_SESSION_KEYS.forEach(key => { session[key] = state[key]; });
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } catch (err) { /* noop */ }
}

function applyData(raw) {
    if (!raw) return false;
    let data;
    try { data = JSON.parse(raw); } catch (err) { return false; }
    if (!data || typeof data !== 'object') return false;
    PERSIST_DATA_KEYS.forEach(key => {
        if (data[key] !== undefined) state[key] = data[key];
    });
    lastDataRaw = raw;
    return true;
}

function loadPersistedData() {
    try { return applyData(localStorage.getItem(STORAGE_DATA_KEY)); }
    catch (err) { return false; }
}

function loadPersistedSession() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_SESSION_KEY); }
    catch (err) { return false; }
    if (!raw) return false;
    let session;
    try { session = JSON.parse(raw); } catch (err) { return false; }
    if (!session || typeof session !== 'object') return false;
    PERSIST_SESSION_KEYS.forEach(key => {
        if (session[key] !== undefined) state[key] = session[key];
    });
    return true;
}

const state = {
    currentRole: null,
    currentProject: null,
    projectSwitcherOpen: false,
    activeTab: 'home',
    libraryGrouping: 'type',
    libraryFilterOpen: false,
    libraryFolder: null,
    libraryFilter: 'all',
    librarySearch: '',
    libraryView: 'list',
    documentMenuOpen: null,
    historyFilter: 'all',
    tareasFilter: 'all',
    remitos: seedRemitos(),
    completedTaskIds: [],
    focusThreadId: null,
    ownerCommentDone: false,
    mentionDone: false,
    techResponseDone: false,
    budgetRequested: false,
    scanCompleted: false,
    currentProjectLegalStep: 0,
    currentProjectScanStep: 0,
    projects: [
        {
            id: 'patria',
            name: 'Edificio Patria',
            location: 'Palermo, CABA',
            etapa: 'Estructura',
            ownerUnit: 'Unidad 4A',
            pendingActions: 3,
            fieldTasks: 5,
            progress: 72,
            milestones: [
                { text: 'Mampostería 2do piso', status: 'done' },
                { text: 'Instalación eléctrica', status: 'in_progress' },
                { text: 'Carpinterías interiores', status: 'pending' }
            ]
        },
        {
            id: 'loft',
            name: 'Loft Palermo',
            location: 'Palermo, CABA',
            etapa: 'Instalaciones',
            ownerUnit: 'Unidad 9C',
            pendingActions: 1,
            fieldTasks: 2,
            progress: 41,
            milestones: [
                { text: 'Demolición y nivelación', status: 'done' },
                { text: 'Hormigonado de losa', status: 'in_progress' },
                { text: 'Definición de cocina', status: 'pending' }
            ]
        },
        {
            id: 'olivares',
            name: 'Torre Olivares',
            location: 'Villa Urquiza, CABA',
            etapa: 'Terminaciones',
            ownerUnit: 'Unidad 7B',
            pendingActions: 2,
            fieldTasks: 3,
            progress: 88,
            milestones: [
                { text: 'Pintura interior', status: 'in_progress' },
                { text: 'Colocación de pisos', status: 'in_progress' },
                { text: 'Final de obra', status: 'pending' }
            ]
        },
        {
            id: 'centro',
            name: 'Edificio Centro',
            location: 'Belgrano, CABA',
            etapa: 'Estructura',
            ownerUnit: 'Unidad 2C',
            pendingActions: 4,
            fieldTasks: 6,
            progress: 30,
            milestones: [
                { text: 'Hormigonado losa 3', status: 'in_progress' },
                { text: 'Mampostería 1er piso', status: 'pending' }
            ]
        },
        {
            id: 'norte',
            name: 'Residencias Norte',
            location: 'Vicente López',
            etapa: 'Planificación',
            ownerUnit: 'Unidad 5A',
            pendingActions: 0,
            fieldTasks: 0,
            progress: 10,
            milestones: [
                { text: 'Aprobación municipal', status: 'in_progress' },
                { text: 'Inicio de obra', status: 'pending' }
            ]
        }
    ],
    notifications: [
        {
            id: 'notif-seed-1',
            type: 'milestone',
            title: 'Avance completado',
            message: 'Se terminó la mampostería del 2do piso.',
            targets: ['developer', 'architect', 'owner'],
            readBy: [],
            createdAt: isoNow(),
            context: { tab: 'process' },
            projectId: 'patria'
        },
        {
            id: 'notif-seed-2',
            type: 'document',
            title: 'Plano nuevo',
            message: 'Se subió el plano eléctrico final.',
            targets: ['architect', 'owner'],
            readBy: [],
            createdAt: isoNow(),
            context: { tab: 'plan' },
            projectId: 'patria'
        },
        {
            id: 'notif-seed-3',
            type: 'mention',
            title: 'Te mencionaron',
            message: 'Tenés un comentario nuevo en el plano.',
            targets: ['developer'],
            readBy: [],
            createdAt: isoNow(),
            context: { tab: 'plan', threadId: 'thread-patria' },
            projectId: 'patria'
        }
    ],
    documents: [
        {
            id: 'doc-boleto-4a',
            projectId: 'patria',
            name: 'Boleto de Compraventa — Unidad 4A',
            typeId: 'boleto',
            folder: 'Boletos',
            observation: 'Versión firmada por ambas partes.',
            version: 1,
            readOnly: true,
            final: true,
            uploadedBy: 'developer',
            createdAt: isoNow()
        },
        {
            id: 'doc-plano-4a-v1',
            projectId: 'patria',
            name: 'Plano Unidad 4A',
            typeId: 'plano',
            folder: 'Planos',
            sector: 'Niveles 4 a 6',
            observation: 'Layout original entregado en obra.',
            version: 1,
            readOnly: true,
            final: false,
            uploadedBy: 'architect',
            createdAt: isoNow()
        },
        {
            id: 'doc-comprobante-4a',
            projectId: 'patria',
            name: 'Comprobante de anticipo',
            typeId: 'comprobante',
            folder: 'Comprobantes',
            observation: '',
            version: 1,
            readOnly: true,
            final: true,
            uploadedBy: 'developer',
            createdAt: isoNow()
        },
        {
            id: 'doc-plano-4a-cli',
            projectId: 'patria',
            name: 'Plano Unidad 4A — Modificaciones cliente',
            typeId: 'plano',
            folder: 'Planos',
            sector: 'Niveles 4 a 6',
            observation: 'Pedido del cliente: ampliar cocina.',
            version: 3,
            readOnly: false,
            final: false,
            uploadedBy: 'owner',
            createdAt: isoNow()
        },
        {
            id: 'doc-informe-arq',
            projectId: 'patria',
            name: 'Informe de avance de obra',
            typeId: 'memoria',
            folder: 'Documentos técnicos',
            sector: 'General / Toda la obra',
            observation: '',
            version: 1,
            readOnly: true,
            final: false,
            uploadedBy: 'architect',
            createdAt: isoNow()
        },
        {
            id: 'doc-fideicomiso',
            projectId: 'patria',
            name: 'Contrato de fideicomiso',
            typeId: 'contrato',
            folder: 'Legales',
            observation: '',
            version: 2,
            readOnly: true,
            final: true,
            uploadedBy: 'escribania',
            createdAt: isoNow()
        },
        {
            id: 'doc-loft-plano-v1',
            projectId: 'loft',
            name: 'Plano Loft Palermo',
            typeId: 'plano',
            folder: 'Planos',
            observation: '',
            version: 1,
            readOnly: true,
            final: false,
            uploadedBy: 'architect',
            createdAt: isoNow()
        },
        {
            id: 'doc-plano-estructura',
            projectId: 'patria',
            name: 'Plano de estructura',
            typeId: 'plano',
            folder: 'Planos',
            sector: 'General / Toda la obra',
            observation: 'Plano estructural general del edificio.',
            version: 1,
            readOnly: true,
            final: true,
            uploadedBy: 'architect',
            createdAt: isoNow()
        },
        {
            id: 'doc-poliza-seguro',
            projectId: 'patria',
            name: 'Póliza de seguro de obra',
            typeId: 'contrato',
            folder: 'Legales',
            observation: 'Cobertura todo riesgo durante la construcción.',
            version: 1,
            readOnly: true,
            final: true,
            uploadedBy: 'developer',
            createdAt: isoNow()
        },
        {
            id: 'doc-permiso-obra',
            projectId: 'patria',
            name: 'Permiso de obra',
            typeId: 'contrato',
            folder: 'Legales',
            observation: 'Aprobación municipal para la ejecución de la obra.',
            version: 1,
            readOnly: true,
            final: true,
            uploadedBy: 'developer',
            createdAt: isoNow()
        },
        {
            id: 'doc-contrato-constructora',
            projectId: 'patria',
            name: 'Contrato con constructora',
            typeId: 'contrato',
            folder: 'Legales',
            observation: 'Contrato firmado con la empresa constructora.',
            version: 1,
            readOnly: true,
            final: true,
            uploadedBy: 'developer',
            createdAt: isoNow()
        },
        {
            id: 'doc-final-obra',
            projectId: 'olivares',
            name: 'Certificado de final de obra',
            typeId: 'final-obra',
            folder: 'Cierre y entrega',
            observation: 'Final de obra otorgado por el municipio.',
            version: 1,
            readOnly: true,
            final: true,
            uploadedBy: 'developer',
            createdAt: isoNow()
        },
        {
            id: 'doc-manual-uso',
            projectId: 'olivares',
            name: 'Manual de uso y mantenimiento',
            typeId: 'manual-uso',
            folder: 'Cierre y entrega',
            observation: 'Guía de uso y mantenimiento para los propietarios.',
            version: 1,
            readOnly: true,
            final: true,
            uploadedBy: 'architect',
            createdAt: isoNow()
        }
    ],
    threads: [
        {
            id: 'thread-patria',
            projectId: 'patria',
            documentId: 'doc-plano-4a-v1',
            title: 'Cambio en cocina',
            pin: { x: 67, y: 60 },
            pinVisible: false,
            redlineVisible: false,
            comments: []
        },
        {
            id: 'thread-loft',
            projectId: 'loft',
            documentId: 'doc-loft-plano-v1',
            title: 'Consulta de terminaciones',
            pin: { x: 52, y: 45 },
            pinVisible: true,
            redlineVisible: false,
            comments: [
                {
                    id: 'c-loft-1',
                    authorRole: 'owner',
                    text: '¿Podemos usar porcelanato mate?',
                    type: 'comment',
                    createdAt: isoNow()
                }
            ]
        }
    ],
    versionHistory: [
        {
            id: 'vh-seed-1',
            type: EVENT_TYPES.VERSION_EVENT_LOGGED,
            actorRole: 'system',
            documentId: 'doc-plano-4a-v1',
            projectId: 'patria',
            version: 'v1',
            text: 'Obra iniciada. Todos los cambios quedarán registrados.',
            createdAt: isoNow()
        }
    ]
};

const roleOptions = Object.values(ROLES);

const screenLogin = document.getElementById('screen-login');
const screenProfiles = document.getElementById('screen-profiles');
const screenProjectPicker = document.getElementById('screen-project-picker');
const screenApp = document.getElementById('screen-app');
const screenSignup = document.getElementById('screen-signup');
const rolePill = document.getElementById('role-pill');
const tabTitle = document.getElementById('tab-title');
const roleSwitcher = document.getElementById('role-switcher');
const tabButtons = document.querySelectorAll('.tab-item');
const tabScreens = document.querySelectorAll('.tab-screen');
const chatBubble = document.getElementById('chat-bubble');
const chatPanel = document.getElementById('chat-panel');
const chatBackdrop = document.getElementById('chat-backdrop');
const chatCloseBtn = document.getElementById('chat-close');
const chatMessagesEl = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

const chatState = {
    open: false,
    history: [],
    seededRole: null
};

const planViewerEl = document.getElementById('plan-viewer');
const planViewerCloseBtn = document.getElementById('plan-viewer-close');
const planViewerTitle = document.getElementById('plan-viewer-title');
const planViewerKicker = document.getElementById('plan-viewer-kicker');
const planViewerBody = document.getElementById('plan-viewer-body');

const planViewer = {
    open: false,
    documentId: null,
    draft: null
};

const uploadPickerEl = document.getElementById('upload-picker');
const pickerCancelBtn = document.getElementById('picker-cancel');
const uploadScreenEl = document.getElementById('upload-screen');
const uploadScreenCloseBtn = document.getElementById('upload-close');
const uploadScreenBody = document.getElementById('upload-body');

const uploadScreen = { open: false };

const docsForm = {
    typeId: '',
    name: '',
    observation: '',
    sector: '',
    source: null,
    uploading: false,
    freshDocId: null,
    file: null,
    remitoId: null,
    versionOfDocId: null
};

function ensureThread(documentId) {
    let thread = state.threads.find(item => item.documentId === documentId);
    if (thread) return thread;
    const doc = state.documents.find(item => item.id === documentId);
    thread = {
        id: `thread-${documentId}`,
        projectId: doc?.projectId || state.currentProject,
        documentId,
        title: '',
        pin: { x: 50, y: 50 },
        pinVisible: false,
        redlineVisible: false,
        comments: []
    };
    state.threads.push(thread);
    return thread;
}

function downloadDocument(doc) {
    if (doc.fileData) {
        const link = document.createElement('a');
        link.href = doc.fileData;
        link.download = doc.fileName || doc.name || 'documento';
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('Archivo descargado.');
        return;
    }
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast('La descarga no está disponible.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const project = state.projects.find(item => item.id === doc.projectId);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(42, 36, 33);
    pdf.text('OBRATY', 20, 24);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(150, 145, 135);
    pdf.text('Documento de obra', 20, 30);

    pdf.setDrawColor(220, 215, 200);
    pdf.line(20, 36, 190, 36);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(42, 36, 33);
    pdf.text(doc.name, 20, 50, { maxWidth: 170 });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(122, 148, 48);
    pdf.text(docTypeLabel(doc), 20, 60);

    let y = 80;
    const row = (label, value) => {
        pdf.setFontSize(8);
        pdf.setTextColor(150, 145, 135);
        pdf.text(label.toUpperCase(), 20, y);
        pdf.setFontSize(11);
        pdf.setTextColor(42, 36, 33);
        pdf.text(value || '—', 20, y + 6, { maxWidth: 170 });
        y += 18;
    };

    row('Proyecto', project ? project.name : '—');
    row('Carpeta', doc.folder);
    row('Subido por', roleLabel(doc.uploadedBy));
    row('Fecha', prettyDate(doc.createdAt));
    if (doc.observation) row('Observación', doc.observation);

    pdf.setFontSize(8);
    pdf.setTextColor(180, 175, 165);
    pdf.text('Generado desde Obraty · Prototipo', 20, 285);

    const safe = doc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'documento';
    pdf.save(`${safe}.pdf`);
}

function isoNow() {
    return new Date().toISOString();
}

function prettyDate(iso) {
    const date = new Date(iso);
    return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function activeProject() {
    return state.projects.find(project => project.id === state.currentProject);
}

function activeThread() {
    return state.threads.find(thread => thread.projectId === state.currentProject);
}

function roleLabel(roleId) {
    if (roleId === 'developer') return 'Desarrolladora';
    if (roleId === 'architect') return 'Equipo técnico';
    if (roleId === 'escribania') return 'Escribanía';
    if (roleId === 'owner') return 'Propietario';
    return 'Sistema';
}

function showScreen(target) {
    [screenLogin, screenProfiles, screenProjectPicker, screenApp, screenSignup].forEach(screen => screen.classList.remove('active'));
    target.classList.add('active');
}

// Filtro activo en la pantalla de selección de obra
let pickerFilter = 'all';

function renderProjectPicker() {
    const list = document.getElementById('project-picker-list');
    if (!list) return;
    const cards = state.projects.map((p, i) => `
        <button type="button" class="obra-card" data-project-id="${p.id}" data-etapa="${escapeHtml(p.etapa)}" data-pending="${p.pendingActions}">
            <span class="obra-card__media obra-card__media--${i % 3}">
                <span class="obra-card__pct">${p.progress}%</span>
            </span>
            <span class="obra-card__body">
                <strong class="obra-card__name">${p.name}</strong>
                <span class="obra-card__loc"><i class="fas fa-location-dot"></i>${p.location}</span>
                <span class="progress-track"><span class="progress-fill" style="width:${p.progress}%"></span></span>
                <span class="obra-card__foot">
                    <span class="obra-card__pending ${p.pendingActions === 0 ? 'is-zero' : ''}">${p.pendingActions}</span>
                    <span class="obra-card__etapa">${p.etapa}</span>
                    <i class="fas fa-chevron-right obra-card__chev"></i>
                </span>
            </span>
        </button>
    `).join('');
    list.innerHTML = `
        ${cards}
        <button type="button" class="obra-card obra-card--add" data-action="add-obra">
            <span class="obra-card__add-icon"><i class="fas fa-plus"></i></span>
            <span class="obra-card__add-text">Agregar obra</span>
        </button>
    `;
    list.querySelectorAll('[data-project-id]').forEach(btn => {
        btn.addEventListener('click', () => selectProject(btn.dataset.projectId));
    });

    renderPickerFilterMenu();
    applyPickerFilters();
}

function renderPickerFilterMenu() {
    const menu = document.getElementById('picker-filter-menu');
    if (!menu) return;
    // Etapas presentes en las obras, en orden de avance de obra
    const etapaOrder = ['Planificación', 'Estructura', 'Instalaciones', 'Terminaciones', 'Cierre y entrega'];
    const present = [...new Set(state.projects.map(p => p.etapa))];
    const etapas = present.sort((a, b) => {
        const ia = etapaOrder.indexOf(a), ib = etapaOrder.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    const option = (value, label, icon) => `
        <button type="button" class="obra-picker__filter-opt ${pickerFilter === value ? 'is-active' : ''}" data-picker-filter="${escapeHtml(value)}" role="menuitemradio" aria-checked="${pickerFilter === value}">
            <i class="fas ${icon}"></i><span>${escapeHtml(label)}</span>
            ${pickerFilter === value ? '<i class="fas fa-check obra-picker__filter-check"></i>' : ''}
        </button>
    `;
    menu.innerHTML = `
        <p class="obra-picker__filter-group">Por etapa</p>
        ${option('all', 'Todas las obras', 'fa-layer-group')}
        ${etapas.map(e => option(e, e, 'fa-helmet-safety')).join('')}
        <p class="obra-picker__filter-group">Por estado</p>
        ${option('pendientes', 'Con pendientes', 'fa-circle-exclamation')}
    `;
    menu.querySelectorAll('[data-picker-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            pickerFilter = btn.dataset.pickerFilter;
            closePickerFilterMenu();
            renderPickerFilterMenu();
            applyPickerFilters();
        });
    });
}

function applyPickerFilters() {
    const searchEl = document.querySelector('#screen-project-picker .obra-picker__search input');
    const q = (searchEl?.value || '').trim().toLowerCase();
    const cards = document.querySelectorAll('#project-picker-list .obra-card[data-project-id]');
    let visibleCount = 0;
    cards.forEach(card => {
        const name = card.querySelector('.obra-card__name')?.textContent.toLowerCase() || '';
        const loc = card.querySelector('.obra-card__loc')?.textContent.toLowerCase() || '';
        const etapa = card.dataset.etapa || '';
        const pending = Number(card.dataset.pending || '0');
        const matchSearch = !q || name.includes(q) || loc.includes(q);
        let matchFilter = true;
        if (pickerFilter === 'pendientes') matchFilter = pending > 0;
        else if (pickerFilter !== 'all') matchFilter = etapa === pickerFilter;
        const show = matchSearch && matchFilter;
        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
    });
    const emptyEl = document.getElementById('picker-empty');
    if (emptyEl) emptyEl.hidden = visibleCount > 0;
    const labelEl = document.getElementById('picker-filter-label');
    const btn = document.getElementById('picker-filter-btn');
    const labelText = pickerFilter === 'all' ? 'Filtrar'
        : pickerFilter === 'pendientes' ? 'Con pendientes'
        : pickerFilter;
    if (labelEl) labelEl.textContent = labelText;
    if (btn) btn.classList.toggle('is-active', pickerFilter !== 'all');
}

function closePickerFilterMenu() {
    const menu = document.getElementById('picker-filter-menu');
    const btn = document.getElementById('picker-filter-btn');
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
}

function selectProject(projectId) {
    state.currentProject = projectId;
    state.activeTab = 'home';
    state.libraryFolder = null;
    state.projectSwitcherOpen = false;
    renderApp();
    showScreen(screenApp);
}

function renderProjectSwitcher() {
    const wrap = document.getElementById('project-switcher');
    if (wrap) wrap.hidden = !state.currentRole;
    const nameEl = document.getElementById('project-switcher-name');
    const menu = document.getElementById('project-switcher-menu');
    const btn = document.getElementById('project-switcher-btn');
    if (!nameEl || !menu || !btn) return;
    const current = activeProject();
    nameEl.textContent = current ? current.name : 'Elegí una obra';
    btn.setAttribute('aria-expanded', state.projectSwitcherOpen ? 'true' : 'false');
    menu.hidden = !state.projectSwitcherOpen;
    if (state.projectSwitcherOpen) {
        menu.innerHTML = state.projects.map(p => `
            <button type="button" class="project-switcher__option ${p.id === state.currentProject ? 'is-active' : ''}" data-switch-project="${p.id}">
                <span>${p.name}</span>
                ${p.id === state.currentProject ? '<i class="fas fa-check"></i>' : ''}
            </button>
        `).join('');
        menu.querySelectorAll('[data-switch-project]').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                state.currentProject = opt.dataset.switchProject;
                state.projectSwitcherOpen = false;
                renderApp();
            });
        });
    }
}

function toggleProjectSwitcher() {
    state.projectSwitcherOpen = !state.projectSwitcherOpen;
    renderProjectSwitcher();
}

function buildRoleSwitcher() {
    roleSwitcher.innerHTML = roleOptions
        .map(role => `<option value="${role.id}">${role.label}</option>`)
        .join('');
}

function selectRole(roleId) {
    state.currentRole = roleId;
    roleSwitcher.value = roleId;
    state.activeTab = 'home';
    state.libraryFolder = null;
    state.libraryFilterOpen = false;
    state.projectSwitcherOpen = false;
    if (roleId === 'owner') {
        state.currentProject = 'patria';
        renderApp();
        showScreen(screenApp);
        return;
    }
    state.currentProject = null;
    persistSession();
    renderProjectPicker();
    showScreen(screenProjectPicker);
}

function openProcessDetail() {
    const aside = document.getElementById('process-detail');
    const body = document.getElementById('process-detail-body');
    const title = document.getElementById('process-detail-title');
    const project = activeProject();
    if (!aside || !body || !project) return;

    if (title) title.textContent = project.name;

    const stage = project.ownerStage || 'Albañilería';
    const progress = project.progress;
    const milestones = (project.milestones || []).map(m => {
        const statusKey = m.status === 'done' ? 'done' : m.status === 'in_progress' ? 'in_progress' : 'pending';
        const iconClass = statusKey === 'done' ? 'fa-circle-check' : statusKey === 'in_progress' ? 'fa-circle-half-stroke' : 'fa-circle';
        const label = statusKey === 'done' ? 'Completado' : statusKey === 'in_progress' ? 'En curso' : 'Pendiente';
        return `
            <li class="process-milestone process-milestone--${statusKey}">
                <span class="process-milestone__icon"><i class="fas ${iconClass}"></i></span>
                <div class="process-milestone__body">
                    <h5>${escapeHtml(m.text)}</h5>
                    <small>${label}</small>
                </div>
            </li>
        `;
    }).join('');

    const history = state.versionHistory
        .filter(row => row.projectId === state.currentProject)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const timeline = history.length
        ? history.map(row => `
            <li class="process-event">
                <div class="process-event__dot"></div>
                <div class="process-event__body">
                    <h6>${EVENT_LABELS[row.type] || 'Movimiento'}</h6>
                    <p>${escapeHtml(row.text)}</p>
                    <small>${roleLabel(row.actorRole)} · ${prettyDate(row.createdAt)}</small>
                </div>
            </li>
        `).join('')
        : '<p class="process-empty">Todavía no hay eventos registrados.</p>';

    body.innerHTML = `
        <section class="process-section">
            <h4 class="process-section__kicker">Etapa actual</h4>
            <p class="process-section__stage">${escapeHtml(stage)}</p>
            <div class="process-section__pct">${progress}%</div>
            <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
            <p class="process-section__meta"><i class="far fa-calendar"></i> ${project.ownerLastUpdate || 'Actualizado hace 2 días'}</p>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Hitos de obra</h4>
            <ul class="process-milestones">${milestones || '<li class="process-empty">Sin hitos cargados.</li>'}</ul>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Historial de actividad</h4>
            <ul class="process-timeline">${timeline}</ul>
        </section>
    `;

    aside.hidden = false;
}

function closeProcessDetail() {
    const aside = document.getElementById('process-detail');
    if (aside) aside.hidden = true;
}

function eventKind(type) {
    if (type === EVENT_TYPES.UPLOAD_CREATED) return 'document';
    if (type === EVENT_TYPES.COMMENT_ADDED || type === EVENT_TYPES.TECH_REPLY_ADDED) return 'comment';
    if (type === EVENT_TYPES.NOTIFICATION_SENT) return 'notification';
    return 'milestone';
}

function eventIcon(kind) {
    if (kind === 'document') return 'fa-file-lines';
    if (kind === 'comment') return 'fa-message';
    if (kind === 'notification') return 'fa-bullhorn';
    if (kind === 'signature') return 'fa-pen-to-square';
    if (kind === 'remito') return 'fa-file-arrow-up';
    return 'fa-flag';
}

function eventKindLabel(kind) {
    if (kind === 'document') return 'Documento';
    if (kind === 'comment') return 'Comentario';
    if (kind === 'notification') return 'Comunicado';
    if (kind === 'signature') return 'Firma';
    if (kind === 'remito') return 'Remito';
    return 'Hito';
}

function timelineEventsForProject(projectId = state.currentProject) {
    const project = state.projects.find(item => item.id === projectId);
    const firstPlan = state.documents.find(item => item.projectId === projectId && item.folder === 'Planos');
    const legalDoc = state.documents.find(item => item.projectId === projectId && item.folder === 'Legales');

    const seeded = [
        {
            id: `seed-${projectId}-mamposteria`,
            kind: 'milestone',
            title: 'Mampostería completada',
            text: 'Se terminó la mampostería del 2do piso.',
            actorRole: 'developer',
            when: 'Hace 1 hora',
            action: 'open-process'
        },
        {
            id: `seed-${projectId}-plano`,
            kind: 'document',
            title: 'Plano actualizado',
            text: 'Se subió la última versión del plano eléctrico.',
            actorRole: 'architect',
            when: 'Hace 3 horas',
            documentId: firstPlan?.id || 'doc-plano-4a-v1'
        },
        {
            id: `seed-${projectId}-remito`,
            kind: 'remito',
            title: 'Remito cargado',
            text: 'Se registró un nuevo remito de hormigón.',
            actorRole: 'architect',
            when: 'Hace 5 horas',
            action: 'goto-docs'
        },
        {
            id: `seed-${projectId}-firma`,
            kind: 'signature',
            title: 'Documento firmado',
            text: 'Acta de inicio firmada por el cliente.',
            actorRole: 'owner',
            when: 'Ayer',
            documentId: legalDoc?.id,
            action: legalDoc ? null : 'goto-docs'
        },
        {
            id: `seed-${projectId}-instalaciones`,
            kind: 'milestone',
            title: 'Nueva etapa',
            text: `Comenzó la etapa de ${project?.etapa || 'obra'}.`,
            actorRole: 'architect',
            when: 'Hace 3 días',
            action: 'open-process'
        }
    ];

    const live = state.versionHistory
        .filter(row => row.projectId === projectId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(row => {
            const kind = eventKind(row.type);
            return {
                id: row.id,
                kind,
                title: EVENT_LABELS[row.type] || eventKindLabel(kind),
                text: row.text,
                actorRole: row.actorRole,
                when: prettyDate(row.createdAt),
                documentId: row.documentId,
                action: kind === 'notification' ? 'goto-notifications' : null
            };
        });

    return [...live, ...seeded];
}

function openHistoryDetail() {
    const aside = document.getElementById('history-detail');
    const body = document.getElementById('history-detail-body');
    const title = document.getElementById('history-detail-title');
    const project = activeProject();
    if (!aside || !body || !project) return;

    if (title) title.textContent = `${project.name} · Historial`;

    const events = timelineEventsForProject(project.id);

    body.innerHTML = `
        <section class="process-section">
            <h4 class="process-section__kicker">${project.name}</h4>
            <p class="process-section__stage">${events.length} eventos</p>
            <p class="process-section__meta">Cada cambio queda registrado con fecha y autor.</p>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Línea de tiempo</h4>
            <ul class="process-timeline">
                ${events.map(e => `
                    <li class="process-event">
                        <div class="process-event__dot"></div>
                        <div class="process-event__body">
                            <h6><i class="fas ${eventIcon(e.kind)}"></i> ${escapeHtml(e.title)}</h6>
                            <p>${escapeHtml(e.text)}</p>
                            <small>${roleLabel(e.actorRole)} · ${escapeHtml(e.when)}</small>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </section>
    `;

    aside.hidden = false;
    chatBubble.classList.add('hidden');
}

function closeHistoryDetail() {
    const aside = document.getElementById('history-detail');
    if (aside) aside.hidden = true;
    if (!planViewer.open && !uploadScreen.open && !chatState.open) chatBubble.classList.remove('hidden');
}

function openTareasDetail() {
    const aside = document.getElementById('tareas-detail');
    const body = document.getElementById('tareas-detail-body');
    const title = document.getElementById('tareas-detail-title');
    const project = activeProject();
    if (!aside || !body || !project) return;

    const role = state.currentRole;

    if (role === 'developer') {
        if (title) title.textContent = project.name;

        const remitos = state.remitos.filter(r => r.projectId === state.currentProject);
        const remitosPendientes = remitos.filter(r => r.status === 'pendiente').length;
        const docsToReview = [
            { name: 'Informe de avance — semana 18', from: 'Arquitecto', date: 'Hace 2 horas' },
            { name: 'Modificación de plano — Unidad 4A', from: 'Cliente', date: 'Hace 4 horas' },
            { name: 'Memo técnico — cambio de cañería', from: 'Arquitecto', date: 'Ayer' }
        ];
        const firmas = [
            { name: 'Acta de inicio de obra', date: 'Vence hoy' },
            { name: 'Adenda de plazos — Unidad 7B', date: 'Vence mañana' },
            { name: 'Certificado de obra — mes 4', date: 'Vence en 3 días' }
        ];
        const comunicados = [
            { name: 'Aviso de corte de luz programado', date: 'Hoy 09:00' },
            { name: 'Nueva normativa municipal de obra', date: 'Ayer' }
        ];

        const filter = state.tareasFilter || 'all';
        const show = (key) => filter === 'all' || filter === key;

        const chip = (id, label, dot) => `
            <button type="button" class="files-chip ${filter === id ? 'is-active' : ''}" data-tareas-filter="${id}">
                ${dot ? `<span class="dot dot--${dot}"></span>` : ''}
                ${label}
            </button>
        `;

        const remitosSection = show('remitos') ? `
            <section class="process-section">
                <h4 class="process-section__title">Remitos por solicitar</h4>
                <ul class="tareas-list">
                    ${remitos.length ? remitos.map(r => {
            let btn;
            let statusText;
            if (r.status === 'pendiente') {
                btn = `<button type="button" class="tarea-row__btn" data-action="notify-tech" data-remito-id="${r.id}">Notificar al equipo técnico</button>`;
                statusText = escapeHtml(r.need);
            } else if (r.status === 'solicitado') {
                btn = `<button type="button" class="tarea-row__btn" disabled>Notificado ✓</button>`;
                statusText = 'Esperando que el equipo técnico lo cargue';
            } else {
                btn = `<button type="button" class="tarea-row__btn" data-action="ver-remito" data-doc-id="${r.documentId}">Ver remito</button>`;
                statusText = 'Cargado por el equipo técnico';
            }
            return `
                        <li class="tarea-row ${r.urgent && r.status === 'pendiente' ? 'tarea-row--urgent' : ''}">
                            <span class="tarea-row__icon"><i class="fas fa-file-arrow-up"></i></span>
                            <div class="tarea-row__body">
                                <h5>${escapeHtml(r.name)}</h5>
                                <small>${escapeHtml(r.vendor)} · ${statusText}</small>
                            </div>
                            ${btn}
                        </li>
                        `;
        }).join('') : '<li class="tarea-empty">No hay remitos para esta obra.</li>'}
                </ul>
            </section>` : '';

        const docsSection = show('docs') ? `
            <section class="process-section">
                <h4 class="process-section__title">Documentos por revisar</h4>
                <ul class="tareas-list">
                    ${docsToReview.map(d => `
                        <li class="tarea-row">
                            <span class="tarea-row__icon tarea-row__icon--doc"><i class="far fa-file-lines"></i></span>
                            <div class="tarea-row__body">
                                <h5>${escapeHtml(d.name)}</h5>
                                <small>De ${escapeHtml(d.from)} · ${escapeHtml(d.date)}</small>
                            </div>
                            <button type="button" class="tarea-row__btn" data-action="goto-docs">Revisar</button>
                        </li>
                    `).join('')}
                </ul>
            </section>` : '';

        const firmasSection = show('firmas') ? `
            <section class="process-section">
                <h4 class="process-section__title">Firmas pendientes</h4>
                <ul class="tareas-list">
                    ${firmas.map(f => `
                        <li class="tarea-row">
                            <span class="tarea-row__icon tarea-row__icon--firma"><i class="fas fa-pen-to-square"></i></span>
                            <div class="tarea-row__body">
                                <h5>${escapeHtml(f.name)}</h5>
                                <small>${escapeHtml(f.date)}</small>
                            </div>
                            <button type="button" class="tarea-row__btn" data-action="goto-docs">Firmar</button>
                        </li>
                    `).join('')}
                </ul>
            </section>` : '';

        const comsSection = show('coms') ? `
            <section class="process-section">
                <h4 class="process-section__title">Comunicados sin leer</h4>
                <ul class="tareas-list">
                    ${comunicados.map(c => `
                        <li class="tarea-row">
                            <span class="tarea-row__icon tarea-row__icon--com"><i class="far fa-comment"></i></span>
                            <div class="tarea-row__body">
                                <h5>${escapeHtml(c.name)}</h5>
                                <small>${escapeHtml(c.date)}</small>
                            </div>
                            <button type="button" class="tarea-row__btn" data-action="goto-notifications">Leer</button>
                        </li>
                    `).join('')}
                </ul>
            </section>` : '';

        body.innerHTML = `
            <section class="process-section">
                <h4 class="process-section__kicker">Resumen</h4>
                <p class="process-section__meta">Tenés ${remitosPendientes} remito${remitosPendientes === 1 ? '' : 's'} para solicitar, ${docsToReview.length} documentos para revisar, ${firmas.length} firmas pendientes y ${comunicados.length} comunicados sin leer.</p>
            </section>

            <div class="files-chips tareas-chips">
                ${chip('all', 'Todos')}
                ${chip('remitos', 'Remitos', 'orange')}
                ${chip('docs', 'Documentos', 'blue')}
                ${chip('firmas', 'Firmas', 'orange')}
                ${chip('coms', 'Comunicados', 'gray')}
            </div>

            ${remitosSection}
            ${docsSection}
            ${firmasSection}
            ${comsSection}
        `;

        body.querySelectorAll('[data-tareas-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.tareasFilter = btn.dataset.tareasFilter;
                openTareasDetail();
            });
        });

        aside.hidden = false;
        return;
    }

    if (role === 'architect') {
        const header = aside.querySelector('.plan-viewer__header');
        if (header) header.classList.add('is-architect');
        if (title) title.textContent = 'Mis tareas';
        const kicker = aside.querySelector('.kicker');
        if (kicker) kicker.innerHTML = `<i class="fas fa-location-dot"></i> ${escapeHtml(project.name)} <i class="fas fa-chevron-down" style="font-size:10px;margin-left:4px;"></i>`;

        const projectRemitos = state.remitos.filter(r =>
            r.projectId === state.currentProject && (r.status === 'solicitado' || r.status === 'cargado'));
        const remitoRows = projectRemitos.length
            ? projectRemitos.map(r => {
                if (r.status === 'cargado') {
                    return `
                    <li class="tarea-row" style="cursor:pointer;" onclick="openPlanViewer('${r.documentId}'); closeTareasDetail();">
                        <span class="tarea-row__icon" style="color:#4f6f52;background:var(--assistant-olive-soft);"><i class="fas fa-circle-check"></i></span>
                        <div class="tarea-row__body">
                            <h5>${escapeHtml(r.name)}</h5>
                            <small>Remito cargado · ${escapeHtml(r.vendor)}</small>
                        </div>
                        <button type="button" class="tarea-row__btn" onclick="event.stopPropagation(); openPlanViewer('${r.documentId}'); closeTareasDetail();">Ver</button>
                    </li>`;
                }
                return `
                    <li class="tarea-row ${r.urgent ? 'tarea-row--urgent' : ''}">
                        <span class="tarea-row__icon tarea-row__icon--doc"><i class="far fa-file-lines"></i></span>
                        <div class="tarea-row__body">
                            <h5>Cargar remito: ${escapeHtml(r.name)}</h5>
                            <small>Solicitado por la desarrolladora · ${escapeHtml(r.vendor)}</small>
                        </div>
                        <button type="button" class="tarea-row__btn" onclick="openUploadForRemito('${r.id}')">Adjuntar PDF</button>
                    </li>`;
            }).join('')
            : '<li class="tarea-empty">No hay remitos solicitados para esta obra.</li>';

        const isDone = (taskId) => state.completedTaskIds.includes(taskId);

        body.innerHTML = `
            <section class="process-section">
                <h4 class="process-section__title">Remitos solicitados (${projectRemitos.filter(r => r.status === 'solicitado').length})</h4>
                <ul class="tareas-list">${remitoRows}</ul>
            </section>

            <section class="process-section">
                <h4 class="process-section__title">Otras tareas</h4>
                <ul class="tareas-list">
                    <li class="tarea-row">
                        <span class="tarea-row__icon" style="color: #cda869; background: #fdf5e6;"><i class="fas fa-camera"></i></span>
                        <div class="tarea-row__body">
                            <h5>Subir fotos de avance</h5>
                            <small>Alta prioridad · Sector: Piso 4 · Vence hoy</small>
                        </div>
                        <button type="button" class="tarea-row__btn" onclick="closeTareasDetail(); openUploadScreen();">Subir fotos</button>
                    </li>
                    <li class="tarea-row">
                        <span class="tarea-row__icon" style="color: #6a95c7; background: #eef3f9;"><i class="fas fa-wrench"></i></span>
                        <div class="tarea-row__body">
                            <h5>Revisar instalación eléctrica</h5>
                            <small>Media prioridad · Arq. Martín López · Vence en 2 días</small>
                        </div>
                        <button type="button" class="tarea-row__btn" ${isDone('task-electrica') ? 'disabled' : ''} onclick="markTaskDone('task-electrica')">${isDone('task-electrica') ? 'Listo ✓' : 'Marcar listo'}</button>
                    </li>
                    <li class="tarea-row">
                        <span class="tarea-row__icon tarea-row__icon--com"><i class="far fa-comment-dots"></i></span>
                        <div class="tarea-row__body">
                            <h5>Confirmar entrega de carpinterías</h5>
                            <small>Baja prioridad · Aberturas del Sur · Vence en 3 días</small>
                        </div>
                        <button type="button" class="tarea-row__btn" ${isDone('task-carpinterias') ? 'disabled' : ''} onclick="markTaskDone('task-carpinterias')">${isDone('task-carpinterias') ? 'Confirmado ✓' : 'Confirmar'}</button>
                    </li>
                </ul>
            </section>

            <section class="process-section">
                <h4 class="process-section__title">En revisión</h4>
                <ul class="tareas-list">
                    <li class="tarea-row" style="cursor: pointer;" onclick="openPlanViewer('doc-plano-4a-v1'); closeTareasDetail();">
                        <span class="tarea-row__icon" style="color: #8c8273; background: #f2efe9;"><i class="fas fa-clipboard-check"></i></span>
                        <div class="tarea-row__body">
                            <h5>Planos conforme a obra</h5>
                            <small>En revisión · Arq. Martina López · Enviado ayer</small>
                        </div>
                        <i class="fas fa-chevron-right" style="color:var(--text-soft); padding: 0 8px;"></i>
                    </li>
                </ul>
            </section>

            <button class="fab-btn" onclick="closeTareasDetail(); openUploadScreen();" style="position: absolute; bottom: 24px; right: 24px; background: var(--assistant-olive); color: var(--white); border: none; border-radius: 999px; padding: 12px 20px; font-size: 14px; font-weight: 700; box-shadow: 0 8px 16px rgba(79, 111, 82, 0.3); cursor: pointer; display: flex; align-items: center; gap: 8px; z-index: 10;">
                Cargar Archivos <i class="fas fa-plus"></i>
            </button>
        `;
    } else {
        const header = aside.querySelector('.plan-viewer__header');
        if (header) header.classList.remove('is-architect');
        const kicker = aside.querySelector('.kicker');
        if (kicker) kicker.textContent = 'Tareas pendientes';
        if (title) title.textContent = project.name;
    }

    aside.hidden = false;
}

function closeTareasDetail() {
    const aside = document.getElementById('tareas-detail');
    if (aside) aside.hidden = true;
}

function markTaskDone(taskId) {
    if (!state.completedTaskIds.includes(taskId)) {
        state.completedTaskIds.push(taskId);
    }
    persistData();
    openTareasDetail();
    showToast('Tarea actualizada.');
}

function openUploadForRemito(remitoId) {
    const remito = state.remitos.find(r => r.id === remitoId);
    if (!remito) return;
    closeTareasDetail();
    openUploadScreen({ typeId: 'remito', name: remito.name, remitoId });
}

function downloadPasaporte() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast('La descarga no está disponible.');
        return;
    }
    const project = activeProject();
    if (!project) return;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(42, 36, 33);
    pdf.text('OBRATY', 20, 24);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(150, 145, 135);
    pdf.text('Pasaporte Digital del Edificio', 20, 30);

    pdf.setDrawColor(220, 215, 200);
    pdf.line(20, 36, 190, 36);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(42, 36, 33);
    pdf.text(project.name, 20, 52);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(79, 111, 82);
    pdf.text(project.location, 20, 60);

    let y = 78;
    const section = (title) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(61, 88, 64);
        pdf.text(title, 20, y);
        y += 7;
    };
    const row = (label, value) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(120, 115, 108);
        pdf.text(label, 20, y);
        pdf.setTextColor(42, 36, 33);
        pdf.text(String(value), 75, y);
        y += 6;
    };

    section('Datos generales');
    row('Obra', project.name);
    row('Ubicación', project.location);
    row('Etapa actual', project.etapa || project.ownerStage || '—');
    row('Avance', `${project.progress}%`);
    row('Acciones pendientes', String(project.pendingActions || 0));
    y += 4;

    section('Hitos de obra');
    (project.milestones || []).forEach(m => {
        const status = m.status === 'done' ? 'Completado' : m.status === 'in_progress' ? 'En curso' : 'Pendiente';
        row(status, m.text);
    });
    y += 4;

    const projectDocs = state.documents.filter(d => d.projectId === project.id);
    if (projectDocs.length) {
        section('Documentación');
        projectDocs.forEach(d => row(d.folder || '—', d.name));
    }

    pdf.setFontSize(8);
    pdf.setTextColor(150, 145, 135);
    pdf.text(`Generado ${prettyDate(isoNow())} · obraty.app`, 20, 285);

    const safeName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    pdf.save(`pasaporte-${safeName}.pdf`);
    showToast('Pasaporte descargado.');
}

function openPassportDetail() {
    const aside = document.getElementById('passport-detail');
    const body = document.getElementById('passport-detail-body');
    const title = document.getElementById('passport-detail-title');
    const project = activeProject();
    if (!aside || !body || !project) return;

    const docs = state.documents.filter(doc => doc.projectId === project.id);
    const legalDocs = docs.filter(doc => ['Legales', 'Boletos', 'Comprobantes', 'Certificados'].includes(doc.folder));
    const techDocs = docs.filter(doc => ['Planos', 'Documentos técnicos', 'Actas', 'Presupuestos'].includes(doc.folder));
    const latestEvents = timelineEventsForProject(project.id).slice(0, 4);
    const docsByFolder = docs.reduce((acc, doc) => {
        acc[doc.folder] = (acc[doc.folder] || 0) + 1;
        return acc;
    }, {});

    const milestoneMarkup = (project.milestones || []).map(item => {
        const status = item.status === 'done' ? 'Completado' : item.status === 'in_progress' ? 'En curso' : 'Pendiente';
        const badgeClass = item.status === 'done' ? 'badge-success' : item.status === 'in_progress' ? 'badge-action' : 'badge-neutral';
        return `
            <li class="passport-milestone">
                <span class="passport-milestone__dot"></span>
                <span class="passport-milestone__body">
                    <strong>${escapeHtml(item.text)}</strong>
                    <small class="badge ${badgeClass}">${status}</small>
                </span>
            </li>
        `;
    }).join('');

    const docFolderMarkup = Object.keys(docsByFolder).length
        ? Object.entries(docsByFolder).map(([folder, count]) => `
            <button type="button" class="passport-folder" data-action="goto-docs">
                <span><i class="fas fa-folder"></i> ${escapeHtml(folder)}</span>
                <strong>${count}</strong>
            </button>
        `).join('')
        : '<p class="section-sub">Todavía no hay documentación cargada para esta obra.</p>';

    const docPreview = (items) => items.slice(0, 3).map(doc => `
        <button type="button" class="passport-doc" data-open-plan="${doc.id}">
            <span class="passport-doc__icon"><i class="fas ${doc.folder === 'Planos' ? 'fa-drafting-compass' : 'fa-file-lines'}"></i></span>
            <span class="passport-doc__body">
                <strong>${escapeHtml(doc.name)}</strong>
                <small>${escapeHtml(doc.folder)} · v${doc.version || 1}</small>
            </span>
            <i class="fas fa-chevron-right"></i>
        </button>
    `).join('');

    if (title) title.textContent = project.name;

    body.innerHTML = `
        <section class="passport-hero">
            <div class="passport-hero__media"></div>
            <div class="passport-hero__body">
                <p class="passport-hero__kicker">Pasaporte Digital</p>
                <h3>${escapeHtml(project.name)}</h3>
                <p>${escapeHtml(project.location)} · ${escapeHtml(project.ownerUnit || project.etapa)}</p>
                <div class="passport-progress">
                    <span>${project.progress}%</span>
                    <div class="progress-track"><div class="progress-fill" style="width:${project.progress}%"></div></div>
                </div>
            </div>
        </section>

        <section class="passport-stats">
            <div class="passport-stat">
                <strong>${docs.length}</strong>
                <small>documentos</small>
            </div>
            <div class="passport-stat">
                <strong>${project.pendingActions || 0}</strong>
                <small>pendientes</small>
            </div>
            <div class="passport-stat">
                <strong>${(project.milestones || []).length}</strong>
                <small>hitos</small>
            </div>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Documentación por carpeta</h4>
            <div class="passport-folder-grid">${docFolderMarkup}</div>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Documentos técnicos</h4>
            <div class="passport-doc-list">${docPreview(techDocs) || '<p class="section-sub">No hay documentos técnicos cargados.</p>'}</div>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Documentos legales</h4>
            <div class="passport-doc-list">${docPreview(legalDocs) || '<p class="section-sub">No hay documentos legales cargados.</p>'}</div>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Hitos de obra</h4>
            <ul class="passport-milestone-list">${milestoneMarkup || '<li class="process-empty">Sin hitos cargados.</li>'}</ul>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Actividad reciente</h4>
            <div class="passport-event-list">
                ${latestEvents.map(event => `
                    <button type="button" class="passport-event" ${event.documentId ? `data-open-plan="${event.documentId}"` : `data-action="${event.action || 'goto-history'}"`}>
                        <span class="passport-event__icon"><i class="fas ${eventIcon(event.kind)}"></i></span>
                        <span class="passport-event__body">
                            <strong>${escapeHtml(event.title)}</strong>
                            <small>${escapeHtml(event.text)}</small>
                        </span>
                        <span>${escapeHtml(event.when)}</span>
                    </button>
                `).join('')}
            </div>
        </section>

        <div class="passport-actions">
            <button type="button" class="btn btn-primary" data-action="download-pasaporte">
                <i class="fas fa-file-arrow-down"></i> Exportar PDF
            </button>
            <button type="button" class="btn btn-ghost" data-action="goto-history">
                <i class="fas fa-clock-rotate-left"></i> Ver historial
            </button>
        </div>
    `;

    aside.hidden = false;
    chatBubble.classList.add('hidden');
    attachEventsInActiveTab();
}

function closePassportDetail() {
    const aside = document.getElementById('passport-detail');
    if (aside) aside.hidden = true;
    if (!planViewer.open && !uploadScreen.open && !chatState.open) chatBubble.classList.remove('hidden');
}

function contactTargetsForRole(role) {
    // Propietarios de las distintas unidades de la obra.
    const owners = [
        { role: 'owner', title: 'Propietario · Unidad 4A', name: 'Liliana González', detail: 'Unidad 4A · Piso 4', icon: 'fa-key' },
        { role: 'owner', title: 'Propietario · Unidad 6B', name: 'Roberto Méndez', detail: 'Unidad 6B · Piso 6', icon: 'fa-key' },
        { role: 'owner', title: 'Propietario · Unidad 8C', name: 'Familia Torres', detail: 'Unidad 8C · Piso 8', icon: 'fa-key' }
    ];
    const developerContact = { role: 'developer', title: 'Desarrolladora', name: 'Citra Desarrollos', detail: 'Coordinación y aprobaciones', icon: 'fa-building' };
    const architectContact = { role: 'architect', title: 'Equipo técnico', name: 'Arq. Martina López', detail: 'Obra y documentación técnica', icon: 'fa-helmet-safety' };

    if (role === 'owner') {
        // El propietario contacta a la desarrolladora y al equipo técnico.
        return [developerContact, architectContact];
    }
    if (role === 'architect') {
        // El equipo técnico contacta a la desarrolladora y a los distintos propietarios.
        return [developerContact, ...owners];
    }
    // La desarrolladora contacta al equipo técnico y a los distintos propietarios.
    return [architectContact, ...owners];
}

function openContactDetail() {
    const aside = document.getElementById('contact-detail');
    const body = document.getElementById('contact-detail-body');
    const title = document.getElementById('contact-detail-title');
    const project = activeProject();
    if (!aside || !body || !project) return;

    if (title) title.textContent = project.name;
    const targets = contactTargetsForRole(state.currentRole);

    body.innerHTML = `
        <section class="contact-hero">
            <span class="contact-hero__icon"><i class="fas fa-headset"></i></span>
            <div>
                <h3>Canal humano</h3>
                <p>Contactá a una persona responsable de la obra sin pasar por ObraChat.</p>
            </div>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Contactos disponibles</h4>
            <div class="contact-list">
                ${targets.map(target => `
                    <article class="contact-row">
                        <span class="contact-row__icon"><i class="fas ${target.icon}"></i></span>
                        <span class="contact-row__body">
                            <strong>${escapeHtml(target.title)}</strong>
                            <small>${escapeHtml(target.name)} · ${escapeHtml(target.detail)}</small>
                        </span>
                        <span class="contact-row__actions">
                            <button type="button" aria-label="Enviar mensaje" data-action="send-contact" data-contact-role="${target.role}">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                            <button type="button" aria-label="Llamar" data-action="call-contact" data-contact-role="${target.role}">
                                <i class="fas fa-phone"></i>
                            </button>
                        </span>
                    </article>
                `).join('')}
            </div>
        </section>

        <section class="process-section">
            <h4 class="process-section__title">Mensaje rápido</h4>
            <div class="contact-composer">
                <textarea id="contact-message" placeholder="Escribí el motivo del contacto…"></textarea>
                <button type="button" class="btn-small action" data-action="send-contact" data-contact-role="${targets[0]?.role || 'developer'}">
                    <i class="fas fa-paper-plane"></i> Enviar mensaje
                </button>
            </div>
        </section>
    `;

    aside.hidden = false;
    chatBubble.classList.add('hidden');
}

function closeContactDetail() {
    const aside = document.getElementById('contact-detail');
    if (aside) aside.hidden = true;
    if (!planViewer.open && !uploadScreen.open && !chatState.open) chatBubble.classList.remove('hidden');
}

function openMilestoneDetail() {
    const aside = document.getElementById('milestone-detail');
    const body = document.getElementById('milestone-detail-body');
    const title = document.getElementById('milestone-detail-title');
    const project = activeProject();
    if (!aside || !body || !project) return;

    if (title) title.textContent = project.name;
    const options = (project.milestones || [])
        .map(m => {
            const tag = m.status === 'done' ? ' (completado)' : m.status === 'in_progress' ? ' (en curso)' : ' (próximo)';
            return `<option value="${escapeHtml(m.text)}">${escapeHtml(m.text)}${tag}</option>`;
        })
        .join('');

    body.innerHTML = `
        <section class="contact-hero">
            <span class="contact-hero__icon"><i class="fas fa-flag-checkered"></i></span>
            <div>
                <h3>Notificá un hito</h3>
                <p>Avisá a la desarrolladora cuando se complete una etapa o haya un avance relevante en la obra.</p>
            </div>
        </section>

        <section class="process-section">
            <div class="docs-form">
                <div class="docs-form__row">
                    <label for="milestone-select">Hito o avance</label>
                    <select id="milestone-select">
                        ${options}
                        <option value="__custom__">Otro avance…</option>
                    </select>
                </div>
                <div class="docs-form__row" id="milestone-custom-row" hidden>
                    <label for="milestone-custom">Describí el avance</label>
                    <input id="milestone-custom" type="text" placeholder="Ej. Finalización de losa nivel 5">
                </div>
                <div class="docs-form__row">
                    <label for="milestone-note">Nota para la desarrolladora (opcional)</label>
                    <textarea id="milestone-note" placeholder="Detalles, fecha, próximos pasos…"></textarea>
                </div>
                <button type="button" class="docs-upload-btn" id="milestone-send">
                    <i class="fas fa-paper-plane"></i> Notificar a la desarrolladora
                </button>
            </div>
        </section>
    `;

    aside.hidden = false;
    chatBubble.classList.add('hidden');

    const sel = document.getElementById('milestone-select');
    const customRow = document.getElementById('milestone-custom-row');
    if (sel && customRow) {
        sel.addEventListener('change', () => { customRow.hidden = sel.value !== '__custom__'; });
    }
    const sendBtn = document.getElementById('milestone-send');
    if (sendBtn) sendBtn.addEventListener('click', sendMilestoneNotification);
}

function sendMilestoneNotification() {
    const project = activeProject();
    if (!project) return;
    const sel = document.getElementById('milestone-select');
    const custom = document.getElementById('milestone-custom');
    const note = document.getElementById('milestone-note');
    let milestone = sel?.value || '';
    if (milestone === '__custom__') milestone = (custom?.value || '').trim();
    if (!milestone) { showToast('Elegí o describí el hito.'); return; }
    const extra = (note?.value || '').trim();

    addNotification({
        type: 'milestone',
        title: 'Hito de obra alcanzado',
        message: `${roleLabel(state.currentRole)} reportó un hito en ${project.name}: "${milestone}".${extra ? ' ' + extra : ''}`,
        targets: ['developer'],
        context: { tab: 'history' },
        projectId: project.id
    });
    pushVersionEvent(EVENT_TYPES.NOTIFICATION_SENT, {
        actorRole: state.currentRole,
        projectId: project.id,
        text: `${roleLabel(state.currentRole)} notificó el hito "${milestone}" a la desarrolladora.`
    });

    closeMilestoneDetail();
    renderApp();
    showToast('Hito notificado a la Desarrolladora.');
}

function closeMilestoneDetail() {
    const aside = document.getElementById('milestone-detail');
    if (aside) aside.hidden = true;
    if (!planViewer.open && !uploadScreen.open && !chatState.open) chatBubble.classList.remove('hidden');
}

function sendHumanContact(targetRole) {
    const project = activeProject();
    if (!project || !targetRole) return;
    const input = document.getElementById('contact-message');
    const text = (input?.value || '').trim() || `Solicitud de contacto humano sobre ${project.name}.`;
    addNotification({
        type: 'contact',
        title: 'Solicitud de contacto',
        message: `${roleLabel(state.currentRole)} pidió contacto humano: ${text}`,
        targets: [targetRole],
        context: { tab: 'notifications' },
        projectId: project.id
    });
    renderApp();
    openContactDetail();
    showToast('Mensaje enviado al contacto humano.');
}

function switchTab(tabId) {
    if (state.activeTab === 'library' && tabId !== 'library') {
        state.libraryFolder = null;
        state.libraryFilterOpen = false;
    }
    state.documentMenuOpen = null;
    state.activeTab = tabId;
    tabButtons.forEach(button => button.classList.toggle('active', button.dataset.tab === tabId));
    tabScreens.forEach(screen => screen.classList.toggle('active', screen.id === `tab-${tabId}`));
    renderApp();
}

function handleHeaderBack() {
    if (state.activeTab === 'library' && state.libraryFolder) {
        state.libraryFolder = null;
        renderApp();
    }
}

function pushVersionEvent(type, payload) {
    state.versionHistory.unshift({
        id: `vh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        actorRole: payload.actorRole || 'system',
        documentId: payload.documentId || 'doc-plano-4a-v1',
        projectId: payload.projectId || state.currentProject,
        version: 'v1',
        text: payload.text,
        createdAt: isoNow()
    });
}

function addNotification({ type, title, message, targets, context, projectId }) {
    const notification = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        title,
        message,
        targets,
        readBy: [],
        createdAt: isoNow(),
        context,
        projectId
    };

    state.notifications.unshift(notification);

    pushVersionEvent(EVENT_TYPES.NOTIFICATION_SENT, {
        actorRole: 'system',
        projectId,
        text: `Se envió la alerta: ${title}.`
    });
}

function markNotificationRead(notificationId) {
    const notification = state.notifications.find(item => item.id === notificationId);
    if (!notification) return;

    if (!notification.readBy.includes(state.currentRole)) {
        notification.readBy.push(state.currentRole);
    }
}

function openNotification(notificationId) {
    const notification = state.notifications.find(item => item.id === notificationId);
    if (!notification) return;

    markNotificationRead(notificationId);

    if (notification.projectId) {
        state.currentProject = notification.projectId;
    }

    state.focusThreadId = notification.context?.threadId || null;

    if (notification.context?.tab === 'tareas') {
        switchTab('home');
        openTareasDetail();
        return;
    }

    if (notification.context?.tab === 'process') {
        switchTab('home');
        openProcessDetail();
        return;
    }

    const ctxTab = notification.context?.tab;
    const opensDocument = ctxTab === 'plan'
        || (ctxTab === 'docs' && (notification.context?.documentId || notification.context?.threadId));
    if (opensDocument) {
        let docId = notification.context.documentId;
        if (!docId && notification.context.threadId) {
            const thread = state.threads.find(item => item.id === notification.context.threadId);
            docId = thread?.documentId;
        }
        if (!docId) {
            const planDoc = state.documents.find(item => item.projectId === state.currentProject && item.folder === 'Planos');
            docId = planDoc?.id;
        }
        if (docId) {
            switchTab('library');
            openPlanViewer(docId);
            return;
        }
    }

    const targetTab = notification.context?.tab || 'home';
    switchTab(targetTab === 'docs' ? 'library' : targetTab);
}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    screenApp.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2200);
}

function createDocument({ typeId, name, observation, sector, source, fileName, fileData, fileMime, silent }) {
    const docType = DOC_TYPES.find(item => item.id === typeId);
    if (!docType) return null;

    const newDoc = {
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId: state.currentProject,
        name: name || docType.label,
        typeId,
        folder: docType.folder,
        observation: observation || '',
        sector: typeNeedsSector(typeId) ? (sector || '') : '',
        version: 1,
        readOnly: false,
        final: false,
        uploadedBy: state.currentRole,
        source,
        fileName: fileName || null,
        fileData: fileData || null,
        fileMime: fileMime || null,
        createdAt: isoNow()
    };

    state.documents.unshift(newDoc);

    pushVersionEvent(EVENT_TYPES.UPLOAD_CREATED, {
        actorRole: state.currentRole,
        documentId: newDoc.id,
        text: `${roleLabel(state.currentRole)} cargó "${newDoc.name}" (${docType.label}).`
    });

    if (!silent) {
        const targets = ['developer', 'architect', 'owner'].filter(role => role !== state.currentRole);
        addNotification({
            type: 'document',
            title: 'Documento nuevo',
            message: `${roleLabel(state.currentRole)} subió "${newDoc.name}" (${docType.label}). Tocá para verlo.`,
            targets,
            context: { tab: 'plan', documentId: newDoc.id },
            projectId: state.currentProject
        });
    }

    return newDoc;
}

// Etiqueta legible de los participantes notificados (todos menos el rol actual)
function notifiedRolesLabel() {
    const labels = ['developer', 'architect', 'owner']
        .filter(role => role !== state.currentRole)
        .map(role => roleLabel(role));
    if (labels.length === 2) return `${labels[0]} y ${labels[1]}`;
    return labels.join(', ');
}

// Control de versiones real: sube una nueva versión de un documento existente
function uploadNewVersion(docId, { fileName, fileData, fileMime, observation, source }) {
    const doc = state.documents.find(item => item.id === docId);
    if (!doc) return null;

    const prevVersion = doc.version || 1;
    // Guarda un snapshot de la versión anterior si todavía no existe el registro
    if (!doc.versions || !doc.versions.length) {
        doc.versions = [{
            version: prevVersion,
            fileName: doc.fileName,
            observation: doc.observation,
            uploadedBy: doc.uploadedBy,
            createdAt: doc.createdAt
        }];
    }

    doc.version = prevVersion + 1;
    doc.fileName = fileName || doc.fileName;
    if (fileData) {
        doc.fileData = fileData;
        doc.fileMime = fileMime;
    }
    doc.source = source || doc.source;
    if (observation) doc.observation = observation;
    doc.uploadedBy = state.currentRole;
    doc.readOnly = false;
    doc.createdAt = isoNow();
    doc.versions.push({
        version: doc.version,
        fileName: doc.fileName,
        observation: doc.observation,
        uploadedBy: state.currentRole,
        createdAt: doc.createdAt
    });

    pushVersionEvent(EVENT_TYPES.VERSION_EVENT_LOGGED, {
        actorRole: state.currentRole,
        documentId: doc.id,
        projectId: doc.projectId,
        text: `${roleLabel(state.currentRole)} subió la versión v${doc.version} de "${doc.name}".`
    });

    const targets = ['developer', 'architect', 'owner'].filter(role => role !== state.currentRole);
    addNotification({
        type: 'document',
        title: 'Nueva versión de documento',
        message: `${roleLabel(state.currentRole)} actualizó "${doc.name}" a la versión v${doc.version}. Tocá para verla.`,
        targets,
        context: { tab: 'plan', documentId: doc.id },
        projectId: doc.projectId
    });

    return doc;
}

function openUploadPicker() {
    const typeId = document.getElementById('upload-form-type')?.value || '';
    const name = (document.getElementById('upload-form-name')?.value || '').trim();
    const observation = (document.getElementById('upload-form-obs')?.value || '').trim();

    if (!typeId || !name) {
        showToast('Completá tipo y nombre antes de subir.');
        return;
    }

    docsForm.typeId = typeId;
    docsForm.name = name;
    docsForm.observation = observation;
    uploadPickerEl.hidden = false;
}

function closeUploadPicker() {
    uploadPickerEl.hidden = true;
}

function startUploadSimulation(source) {
    closeUploadPicker();
    docsForm.source = source;
    docsForm.uploading = true;
    renderUploadScreen();

    const barEl = document.getElementById('upload-bar-fill');
    const pctEl = document.getElementById('upload-bar-pct');

    const duration = 1800;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
        if (barEl) barEl.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';

        if (pct < 100) {
            requestAnimationFrame(tick);
        } else {
            setTimeout(finishUpload, 220);
        }
    }

    requestAnimationFrame(tick);
}

function finishUpload() {
    const file = docsForm.file;
    const slug = (docsForm.name || 'documento').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'documento';
    const fileName = file ? file.name : (docsForm.source === 'camera' ? `foto-${slug}.jpg` : `${slug}.pdf`);
    const remitoId = docsForm.remitoId;
    const versionOfDocId = docsForm.versionOfDocId;

    let newDoc = null;
    const isVersion = Boolean(versionOfDocId);

    if (isVersion) {
        newDoc = uploadNewVersion(versionOfDocId, {
            fileName,
            fileData: file ? file.dataUrl : null,
            fileMime: file ? file.mime : null,
            observation: docsForm.observation,
            source: docsForm.source
        });
    } else {
        newDoc = createDocument({
            typeId: docsForm.typeId,
            name: docsForm.name,
            observation: docsForm.observation,
            sector: docsForm.sector,
            source: docsForm.source,
            fileName,
            fileData: file ? file.dataUrl : null,
            fileMime: file ? file.mime : null,
            silent: Boolean(remitoId)
        });

        if (newDoc && remitoId) {
            const remito = state.remitos.find(r => r.id === remitoId);
            if (remito) {
                remito.status = 'cargado';
                remito.documentId = newDoc.id;
                addNotification({
                    type: 'remito',
                    title: 'Remito cargado',
                    message: `El equipo técnico cargó el remito "${remito.name}". Tocá para verlo.`,
                    targets: ['developer'],
                    context: { tab: 'plan', documentId: newDoc.id },
                    projectId: remito.projectId
                });
            }
        }
    }

    docsForm.typeId = '';
    docsForm.name = '';
    docsForm.observation = '';
    docsForm.sector = '';
    docsForm.source = null;
    docsForm.uploading = false;
    docsForm.file = null;
    docsForm.remitoId = null;
    docsForm.versionOfDocId = null;
    docsForm.freshDocId = newDoc ? newDoc.id : null;

    closeUploadScreen();
    renderApp();
    if (remitoId) {
        showToast('Remito cargado y notificado a la Desarrolladora.');
    } else if (isVersion && newDoc) {
        showToast(`Versión v${newDoc.version} subida. Avisamos a ${notifiedRolesLabel()}.`);
    } else {
        showToast(`Documento subido. Avisamos a ${notifiedRolesLabel()}.`);
    }

    if (newDoc) {
        setTimeout(() => {
            if (docsForm.freshDocId === newDoc.id) {
                docsForm.freshDocId = null;
                renderApp();
            }
        }, 3000);
    }
}

function syncDocsFormButton() {
    const btn = document.getElementById('upload-form-cta');
    if (!btn) return;
    btn.disabled = !(docsForm.typeId && docsForm.name && docsForm.file);
    const missingEl = document.getElementById('upload-form-missing');
    const missingText = document.getElementById('upload-form-missing-text');
    const message = uploadMissingMessage();
    if (missingEl && missingText) {
        missingText.textContent = message;
        missingEl.hidden = !message;
    }
}

function formatFileSize(bytes) {
    if (typeof bytes !== 'number') return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function submitDocComment(text) {
    const docId = planViewer.documentId;
    if (!docId || !planViewer.draft) return;
    const thread = ensureThread(docId);
    const doc = state.documents.find(item => item.id === docId);
    const role = state.currentRole;

    thread.pin = { x: planViewer.draft.x, y: planViewer.draft.y };
    thread.pinVisible = true;
    thread.comments.push({
        id: `comment-${role}-${Date.now()}`,
        authorRole: role,
        text,
        type: 'comment',
        createdAt: isoNow()
    });

    if (role === 'owner') state.ownerCommentDone = true;
    planViewer.draft = null;

    pushVersionEvent(EVENT_TYPES.COMMENT_ADDED, {
        actorRole: role,
        documentId: thread.documentId,
        text: `${roleLabel(role)} comentó en "${doc?.name || 'documento'}": "${text}"`
    });

    const otherRoles = ['developer', 'architect', 'owner'].filter(item => item !== role);
    addNotification({
        type: 'comment',
        title: 'Comentario nuevo',
        message: `${roleLabel(role)} en "${doc?.name || 'documento'}": "${text}"`,
        targets: otherRoles,
        context: { tab: 'plan', threadId: thread.id, documentId: thread.documentId },
        projectId: state.currentProject
    });

    renderApp();
    renderPlanViewer();
    showToast('Comentario enviado.');
}

function mentionArchitect() {
    if (!state.ownerCommentDone) {
        showToast('Primero falta el comentario del propietario.');
        return;
    }

    if (state.mentionDone) {
        showToast('Ya consultaste al equipo técnico.');
        return;
    }

    const thread = activeThread();
    if (!thread) return;

    thread.comments.push({
        id: `comment-dev-${Date.now()}`,
        authorRole: 'developer',
        text: '@Equipo técnico, ¿podemos mover esa pared?',
        type: 'mention',
        createdAt: isoNow()
    });

    state.mentionDone = true;

    pushVersionEvent(EVENT_TYPES.COMMENT_ADDED, {
        actorRole: 'developer',
        documentId: thread.documentId,
        text: 'La desarrolladora consultó al equipo técnico.'
    });

    addNotification({
        type: 'mention',
        title: 'Te mencionaron',
        message: 'La desarrolladora te consultó en el plano.',
        targets: ['architect'],
        context: { tab: 'plan', threadId: thread.id },
        projectId: state.currentProject
    });

    renderApp();
    showToast('Equipo técnico notificado.');
}

function generateBudgetRequest() {
    if (state.budgetRequested) {
        showToast('Ya pediste el presupuesto.');
        return;
    }

    state.budgetRequested = true;

    pushVersionEvent(EVENT_TYPES.VERSION_EVENT_LOGGED, {
        actorRole: 'system',
        text: 'Se creó un pedido de presupuesto para el cambio solicitado.',
        projectId: state.currentProject
    });

    addNotification({
        type: 'milestone',
        title: 'Pedido de presupuesto',
        message: 'Se generó un presupuesto preliminar para el cambio.',
        targets: ['developer', 'architect'],
        context: { tab: 'history' },
        projectId: state.currentProject
    });

    renderApp();
    showToast('Pedido de presupuesto creado.');
}

function architectTechnicalReply() {
    if (!state.ownerCommentDone) {
        showToast('Todavía no hay consulta para responder.');
        return;
    }

    if (state.techResponseDone) {
        showToast('Ya respondiste esta consulta.');
        return;
    }

    const thread = activeThread();
    if (!thread) return;

    thread.redlineVisible = true;
    thread.comments.push({
        id: `comment-arch-${Date.now()}`,
        authorRole: 'architect',
        text: 'No se puede mover: hay una columna estructural. Te marco la línea en rojo.',
        type: 'tech',
        createdAt: isoNow()
    });

    state.techResponseDone = true;

    pushVersionEvent(EVENT_TYPES.TECH_REPLY_ADDED, {
        actorRole: 'architect',
        documentId: thread.documentId,
        text: 'El equipo técnico respondió y marcó la columna en el plano.'
    });

    addNotification({
        type: 'comment',
        title: 'Respuesta del equipo técnico',
        message: 'El cambio no es posible: hay una columna estructural.',
        targets: ['developer', 'owner'],
        context: { tab: 'plan', threadId: thread.id },
        projectId: state.currentProject
    });

    renderApp();
    showToast('Respuesta enviada.');
}

function projectCardMarkup(item) {
    const showUnit = state.currentRole === 'owner';
    return `
        <button class="project-card ${item.id === state.currentProject ? 'active' : ''}" data-project-id="${item.id}">
            <div class="project-card__head">
                <div>
                    <div class="list-main">${item.name}</div>
                    ${showUnit ? `<div class="list-sub">${item.ownerUnit}</div>` : ''}
                </div>
                <span class="badge badge-action">${item.pendingActions} pendientes</span>
            </div>
            <div class="progress-wrap">
                <div class="progress-track"><div class="progress-fill" style="width: ${item.progress}%"></div></div>
                <div class="progress-label">${item.progress}% completado</div>
            </div>
        </button>
    `;
}

function renderHome() {
    const role = state.currentRole;
    const project = activeProject();
    const home = document.getElementById('tab-home');

    if (!project) {
        home.innerHTML = '<div class="section-card"><p>No encontramos la obra.</p></div>';
        return;
    }

    const projectList = state.projects.map(projectCardMarkup).join('');

    const milestones = project.milestones.map(milestone => {
        const badgeClass = milestone.status === 'done' ? 'badge-success' : milestone.status === 'in_progress' ? 'badge-action' : 'badge-neutral';
        const badgeText = milestone.status === 'done' ? 'Listo' : milestone.status === 'in_progress' ? 'En curso' : 'Próximo';

        return `
            <div class="list-row">
                <div class="list-main">${milestone.text}</div>
                <span class="badge ${badgeClass}">${badgeText}</span>
            </div>
        `;
    }).join('');

    if (role === 'developer') {
        const remitoPend = state.remitos.filter(r => r.projectId === state.currentProject && r.status === 'pendiente').length;
        home.innerHTML = `
            <header class="owner-section-head">
                <h4>Tareas pendientes</h4>
                <a class="owner-section-link tech-link" data-action="open-tareas">Ver todas <i class="fas fa-chevron-right"></i></a>
            </header>
            <div class="dev-stats-grid">
                <div class="dev-stat">
                    <span class="dev-stat__icon dev-stat__icon--remito"><i class="fas fa-file-arrow-up"></i></span>
                    <span class="dev-stat__num">${remitoPend}</span>
                    <small>Remitos por solicitar</small>
                </div>
                <div class="dev-stat">
                    <span class="dev-stat__icon dev-stat__icon--doc"><i class="far fa-file-lines"></i></span>
                    <span class="dev-stat__num">7</span>
                    <small>Documentos por revisar</small>
                </div>
                <div class="dev-stat">
                    <span class="dev-stat__icon dev-stat__icon--firma"><i class="fas fa-pen-to-square"></i></span>
                    <span class="dev-stat__num">4</span>
                    <small>Firmas pendientes</small>
                </div>
                <div class="dev-stat">
                    <span class="dev-stat__icon dev-stat__icon--com"><i class="far fa-comment"></i></span>
                    <span class="dev-stat__num">2</span>
                    <small>Comunicados sin leer</small>
                </div>
            </div>

            <article class="passport-card">
                <span class="passport-card__icon"><i class="fas fa-passport"></i></span>
                <div class="passport-card__body">
                    <h5>Pasaporte Digital de la obra</h5>
                    <p>Consultá la ficha viva de ${escapeHtml(project.name)} con documentos, hitos y actividad.</p>
                </div>
                <button type="button" class="passport-card__btn" data-action="open-pasaporte">Abrir <i class="fas fa-chevron-right"></i></button>
            </article>

            <article class="contact-card">
                <span class="contact-card__icon"><i class="fas fa-headset"></i></span>
                <div class="contact-card__body">
                    <h5>Contacto directo</h5>
                    <p>Hablá con los propietarios o el equipo técnico de la obra.</p>
                </div>
                <button type="button" class="contact-card__btn" data-action="open-contact">Contactar</button>
            </article>

            <header class="owner-section-head">
                <h4>Actividad reciente</h4>
                <a class="owner-section-link tech-link" data-action="open-process">Ver toda la actividad <i class="fas fa-chevron-right"></i></a>
            </header>
            <div class="dev-activity">
                <div class="dev-activity__row">
                    <span class="dev-activity__icon dev-activity__icon--remito"><i class="fas fa-file-arrow-up"></i></span>
                    <span class="dev-activity__text">Se cargó un nuevo remito en <strong>Edificio Patria</strong></span>
                    <small>Hace 1 hora</small>
                </div>
                <div class="dev-activity__row">
                    <span class="dev-activity__icon dev-activity__icon--doc"><i class="far fa-file-lines"></i></span>
                    <span class="dev-activity__text">Documento actualizado en <strong>Loft Palermo</strong></span>
                    <small>Hace 3 horas</small>
                </div>
                <div class="dev-activity__row">
                    <span class="dev-activity__icon dev-activity__icon--check"><i class="fas fa-circle-check"></i></span>
                    <span class="dev-activity__text">Tarea completada en <strong>Torre Olivares</strong></span>
                    <small>Ayer</small>
                </div>
            </div>
        `;

        home.querySelectorAll('[data-switch-project]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentProject = btn.dataset.switchProject;
                renderApp();
            });
        });
    }

    if (role === 'architect') {
        const projectThumb = (p, idx) => `
            <button type="button" class="tech-project-card" data-project-id="${p.id}">
                <span class="tech-project-card__thumb tech-project-card__thumb--${idx}"></span>
                <span class="tech-project-card__body">
                    <span class="tech-project-card__head">
                        <h5>${p.name}</h5>
                        <span class="pill-soft">${p.pendingActions} pendiente${p.pendingActions === 1 ? '' : 's'}</span>
                    </span>
                    <span class="tech-project-card__bar">
                        <span class="progress-track"><span class="progress-fill" style="width:${p.progress}%"></span></span>
                        <small>${p.progress}% completado</small>
                    </span>
                </span>
                <i class="fas fa-chevron-right tech-project-card__chev"></i>
            </button>
        `;

        const projectsMarkup = state.projects.map((p, i) => projectThumb(p, i)).join('');

        home.innerHTML = `
            <header class="owner-section-head">
                <h4>Accesos rápidos</h4>
            </header>
            <div class="quick-access-grid">
                <button type="button" class="quick-access" data-action="goto-docs">
                    <span class="quick-access__icon"><i class="far fa-file-lines"></i></span>
                    <span class="quick-access__body">
                        <strong>Documentos</strong>
                        <small>Buscá y consultá toda la documentación de obra.</small>
                    </span>
                    <i class="fas fa-chevron-right quick-access__chev"></i>
                </button>
                <button type="button" class="quick-access" data-action="open-tareas">
                    <span class="quick-access__icon"><i class="fas fa-clipboard-check"></i></span>
                    <span class="quick-access__body">
                        <strong>Tareas</strong>
                        <small>Gestioná y actualizá las tareas asignadas.</small>
                    </span>
                    <i class="fas fa-chevron-right quick-access__chev"></i>
                </button>
                <button type="button" class="quick-access" data-action="goto-docs">
                    <span class="quick-access__icon"><i class="fas fa-cloud-arrow-up"></i></span>
                    <span class="quick-access__body">
                        <strong>Subir documentos</strong>
                        <small>Cargá planos, permisos, contratos y más.</small>
                    </span>
                    <i class="fas fa-chevron-right quick-access__chev"></i>
                </button>
                <button type="button" class="quick-access" data-action="goto-notifications">
                    <span class="quick-access__icon"><i class="fas fa-bullhorn"></i></span>
                    <span class="quick-access__body">
                        <strong>Comunicados</strong>
                        <small>Leé y publicá comunicaciones de la obra.</small>
                    </span>
                    <i class="fas fa-chevron-right quick-access__chev"></i>
                </button>
            </div>

            <article class="passport-card">
                <span class="passport-card__icon"><i class="fas fa-passport"></i></span>
                <div class="passport-card__body">
                    <h5>Pasaporte Digital del Edificio</h5>
                    <p>Accedé al pasaporte digital de cada obra para consultar toda su información técnica y legal.</p>
                </div>
                <button type="button" class="passport-card__btn" data-action="open-pasaporte">Abrir <i class="fas fa-chevron-right"></i></button>
            </article>

            <article class="milestone-card">
                <span class="milestone-card__icon"><i class="fas fa-flag"></i></span>
                <div class="milestone-card__body">
                    <h5>Notificar hito de obra</h5>
                    <p>Avisá a la desarrolladora cuando se complete una etapa o un avance importante.</p>
                </div>
                <button type="button" class="milestone-card__btn" data-action="open-milestone">Notificar</button>
            </article>

            <article class="contact-card">
                <span class="contact-card__icon"><i class="fas fa-headset"></i></span>
                <div class="contact-card__body">
                    <h5>Contacto directo</h5>
                    <p>Hablá con los propietarios o la desarrolladora de la obra.</p>
                </div>
                <button type="button" class="contact-card__btn" data-action="open-contact">Contactar</button>
            </article>
        `;
    }

    if (role === 'owner') {
        const stage = project.ownerStage || 'Albañilería';
        const stageProgress = project.progress;
        const lastUpdate = project.ownerLastUpdate || 'Actualizado hace 2 días';
        const news = project.ownerNews || {
            date: '12 de mayo, 2024',
            title: 'Se completaron muros en unidades del piso 6 al 8',
            description: 'Inicio de trabajos en mampostería de paliers.',
            photos: 8
        };
        const keyDocs = project.ownerKeyDocs || [
            { icon: 'fa-solid fa-compass-drafting', title: 'Plano de estructura', date: '10/05', docId: 'doc-plano-estructura' },
            { icon: 'fa-solid fa-shield-halved', title: 'Póliza de seguro de obra', date: '08/05', docId: 'doc-poliza-seguro' },
            { icon: 'fa-solid fa-stamp', title: 'Permiso de obra', date: '05/05', docId: 'doc-permiso-obra' },
            { icon: 'fa-solid fa-file-signature', title: 'Contrato con constructora', date: '01/05', docId: 'doc-contrato-constructora' }
        ];
        const upcoming = project.ownerUpcoming || [
            { icon: 'fa-trowel-bricks', title: 'Finalización de mampostería', date: '20 de mayo, 2024', status: 'in_progress' },
            { icon: 'fa-door-open', title: 'Colocación de aberturas', date: '05 de junio, 2024', status: 'pending' }
        ];

        const docsGrid = keyDocs.map(d => `
            <button type="button" class="quick-doc" data-open-plan="${d.docId}">
                <span class="quick-doc__icon"><i class="${d.icon}"></i></span>
                <span class="quick-doc__title">${d.title}</span>
                <small class="quick-doc__date">Actualizado ${d.date}</small>
            </button>
        `).join('');

        const upcomingMarkup = upcoming.map(m => {
            const badgeClass = m.status === 'in_progress' ? 'badge-action' : 'badge-neutral';
            const badgeText = m.status === 'in_progress' ? 'En curso' : 'Próximo';
            return `
                <div class="milestone-row">
                    <span class="milestone-row__icon"><i class="fas ${m.icon}"></i></span>
                    <div class="milestone-row__body">
                        <h5>${m.title}</h5>
                        <small><i class="far fa-calendar"></i> ${m.date}</small>
                    </div>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
            `;
        }).join('');

        home.innerHTML = `
            <article class="property-banner">
                <span class="property-banner__icon"><i class="fas fa-city"></i></span>
                <div class="property-banner__body">
                    <h3>${project.name}</h3>
                    <p>${project.ownerUnit} · Piso 7</p>
                </div>
                <span class="status-pill"><span class="status-pill__dot"></span>En construcción</span>
            </article>

            <article class="passport-card passport-card--owner">
                <span class="passport-card__icon"><i class="fas fa-passport"></i></span>
                <div class="passport-card__body">
                    <h5>Pasaporte Digital de tu propiedad</h5>
                    <p>Tu documentación, avances, hitos y actividad de obra en una vista navegable.</p>
                </div>
                <button type="button" class="passport-card__btn" data-action="open-pasaporte">Abrir <i class="fas fa-chevron-right"></i></button>
            </article>

            <article class="contact-card">
                <span class="contact-card__icon"><i class="fas fa-headset"></i></span>
                <div class="contact-card__body">
                    <h5>Contacto directo</h5>
                    <p>Hablá con la desarrolladora o el equipo técnico.</p>
                </div>
                <button type="button" class="contact-card__btn" data-action="open-contact">Contactar</button>
            </article>

            <article class="process-card">
                <div class="process-card__info">
                    <h4 class="process-card__title">Proceso de obra</h4>
                    <p class="process-card__kicker">Etapa actual</p>
                    <p class="process-card__stage">${stage}</p>
                    <div class="process-card__pct">${stageProgress}%</div>
                    <p class="process-card__pct-label">de avance general</p>
                    <div class="progress-track"><div class="progress-fill" style="width: ${stageProgress}%"></div></div>
                    <p class="process-card__meta"><i class="far fa-calendar"></i> ${lastUpdate}</p>
                    <button type="button" class="btn-pill-primary" data-action="open-process">Ver proceso completo <i class="fas fa-arrow-right"></i></button>
                </div>
                <div class="process-card__photo"><i class="fas fa-building"></i></div>
            </article>

            <header class="owner-section-head">
                <h4>Lo último en tu obra</h4>
                <a class="owner-section-link" data-action="goto-notifications">Ver todas las novedades <i class="fas fa-chevron-right"></i></a>
            </header>
            <article class="update-card" data-open-plan="doc-plano-4a-v1">
                <div class="update-card__photo"><i class="fas fa-image"></i></div>
                <div class="update-card__body">
                    <small class="update-card__date">${news.date}</small>
                    <h5>${news.title}</h5>
                    <p>${news.description}</p>
                </div>
                <span class="update-card__badge">${news.photos} fotos <i class="fas fa-chevron-right"></i></span>
            </article>

            <header class="owner-section-head">
                <h4>Documentos importantes</h4>
                <a class="owner-section-link" data-action="goto-docs">Ver todos <i class="fas fa-chevron-right"></i></a>
            </header>
            <div class="quick-doc-grid">${docsGrid}</div>

            <header class="owner-section-head">
                <h4>Hitos próximos</h4>
            </header>
            <div class="milestone-list">${upcomingMarkup}</div>
        `;
    }
}

function renderDocs() {
    const container = document.getElementById('tab-docs');
    const role = state.currentRole;
    const project = activeProject();
    if (!project) {
        container.innerHTML = '<div class="section-card"><p>No hay obra activa.</p></div>';
        return;
    }

    const projectDocs = state.documents.filter(doc => doc.projectId === state.currentProject);
    const visibleDocs = role === 'owner'
        ? projectDocs.filter(doc => ['Boletos', 'Planos', 'Comprobantes'].includes(doc.folder))
        : projectDocs.filter(doc => doc.uploadedBy === role);

    const docRow = (doc) => {
        const typeLabel = docTypeLabel(doc);
        const isPlan = doc.folder === 'Planos';
        const isFresh = doc.id === docsForm.freshDocId;
        return `
            <div class="doc-row ${isFresh ? 'fresh' : ''}">
                <div class="doc-row__icon"><i class="fas ${isPlan ? 'fa-drafting-compass' : 'fa-file-lines'}"></i></div>
                <div class="doc-row__body">
                    <div class="doc-row__title">
                        <h4>${escapeHtml(doc.name)}</h4>
                        <span class="badge badge-neutral">${escapeHtml(typeLabel)}</span>
                    </div>
                    ${doc.observation ? `<p class="doc-row__obs">${escapeHtml(doc.observation)}</p>` : ''}
                    ${doc.sector ? `<span class="file-card__sector"><i class="fas fa-layer-group"></i> ${escapeHtml(doc.sector)}</span>` : ''}
                    <div class="doc-row__meta">
                        <small>${prettyDate(doc.createdAt)}</small>
                        <div class="doc-row__actions">
                            <button data-doc-action="comentar" data-doc-id="${doc.id}"><i class="fas fa-message"></i> Comentar</button>
                            <button data-doc-action="descargar" data-doc-id="${doc.id}"><i class="fas fa-download"></i> Descargar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const uploadCtaMarkup = `
        <article class="section-card">
            <button type="button" class="docs-upload-btn" id="docs-open-upload">
                <i class="fas fa-cloud-arrow-up"></i> Subir documento
            </button>
        </article>
    `;

    const listMarkup = visibleDocs.length
        ? `<div class="doc-list">${visibleDocs.map(docRow).join('')}</div>`
        : '<p class="section-sub">Todavía no hay documentos cargados.</p>';

    const listTitle = role === 'owner' ? 'Mis documentos' : 'Mis archivos subidos';

    container.innerHTML = `
        ${uploadCtaMarkup}
        <article class="section-card">
            <h3 class="section-title">${listTitle}</h3>
            ${listMarkup}
        </article>
    `;
}

const UPLOADER_INFO = {
    developer: { label: 'Desarrolladora', dot: 'green' },
    architect: { label: 'Arquitecto', dot: 'orange' },
    owner: { label: 'Cliente', dot: 'blue' },
    escribania: { label: 'Escribanía', dot: 'gray' }
};

function uploaderInfo(roleId) {
    return UPLOADER_INFO[roleId] || { label: roleLabel(roleId), dot: 'gray' };
}

function relativeTime(iso) {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - then);
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'recién';
    if (hours < 24) return `hace ${hours} hora${hours === 1 ? '' : 's'}`;
    const days = Math.floor(hours / 24);
    return `hace ${days} día${days === 1 ? '' : 's'}`;
}

function shortDate(iso) {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

function commentsForDoc(docId) {
    let count = 0;
    state.threads.forEach(t => {
        if (t.documentId === docId) count += t.comments.length;
    });
    return count;
}

function renderLibrary() {
    const container = document.getElementById('tab-library');
    const project = activeProject();

    if (!project) {
        container.innerHTML = '';
        return;
    }

    const projectDocs = state.documents.filter(doc => doc.projectId === state.currentProject);
    const view = state.libraryView || 'list';
    const filter = state.libraryFilter || 'all';
    const query = (state.librarySearch || '').toLowerCase().trim();

    const iconForDoc = (doc) => {
        if (doc.folder === 'Planos') return { icon: 'fa-drafting-compass', tone: 'blue' };
        if (doc.folder === 'Legales') return { icon: 'fa-file-shield', tone: 'gray' };
        if (doc.folder === 'Documentos técnicos') return { icon: 'fa-file-lines', tone: 'orange' };
        if (doc.folder === 'Documentación de obra') return { icon: 'fa-camera', tone: 'green' };
        if (doc.folder === 'Cierre y entrega') return { icon: 'fa-flag-checkered', tone: 'orange' };
        if (doc.folder === 'Comprobantes') return { icon: 'fa-receipt', tone: 'green' };
        return { icon: 'fa-file-lines', tone: 'green' };
    };

    const docCard = (doc) => {
        const ui = uploaderInfo(doc.uploadedBy);
        const isFresh = doc.id === docsForm.freshDocId;
        const editable = !doc.readOnly;
        const iconInfo = iconForDoc(doc);
        const cmtCount = commentsForDoc(doc.id);
        return `
            <article class="file-card ${isFresh ? 'fresh' : ''}">
                <span class="file-card__icon file-card__icon--${iconInfo.tone}"><i class="fas ${iconInfo.icon}"></i></span>
                <div class="file-card__body">
                    <div class="file-card__top">
                        <h4>${escapeHtml(doc.name)}</h4>
                        <span class="file-card__badge file-card__badge--${editable ? 'editable' : 'readonly'}">
                            <i class="fas ${editable ? 'fa-pen' : 'fa-eye'}"></i>
                            ${editable ? 'Editable' : 'Solo lectura'}
                        </span>
                    </div>
                    <p class="file-card__uploader">
                        <span class="dot dot--${ui.dot}"></span> Subido por ${ui.label}
                    </p>
                    ${doc.sector ? `<span class="file-card__sector"><i class="fas fa-layer-group"></i> ${escapeHtml(doc.sector)}</span>` : ''}
                    <p class="file-card__meta">${shortDate(doc.createdAt)} · v${doc.version || 1} · ${relativeTime(doc.createdAt)}</p>
                </div>
                <div class="file-card__actions">
                    <button class="file-card__action" data-doc-action="comentar" data-doc-id="${doc.id}" aria-label="Comentarios">
                        <i class="far fa-comment"></i>
                        <span>${cmtCount}</span>
                    </button>
                    <button class="file-card__action" data-doc-action="descargar" data-doc-id="${doc.id}" aria-label="Descargar">
                        <i class="fas fa-download"></i>
                    </button>
                    <div class="file-card__more">
                        <button class="file-card__action" data-doc-action="more" data-doc-id="${doc.id}" aria-label="Más opciones" aria-expanded="${state.documentMenuOpen === doc.id ? 'true' : 'false'}">
                            <i class="fas fa-ellipsis-vertical"></i>
                        </button>
                        ${state.documentMenuOpen === doc.id ? `
                            <div class="file-card__menu" role="menu">
                                <button type="button" data-doc-option="new-version" data-doc-id="${doc.id}" role="menuitem">
                                    <i class="fas fa-cloud-arrow-up"></i> Subir nueva versión
                                </button>
                                <button type="button" data-doc-option="versions" data-doc-id="${doc.id}" role="menuitem">
                                    <i class="fas fa-code-branch"></i> Ver versiones
                                </button>
                                <button type="button" data-doc-option="rename" data-doc-id="${doc.id}" role="menuitem">
                                    <i class="fas fa-pen"></i> Renombrar
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </article>
        `;
    };

    const filtersBar = (extraLabel) => {
        const viewLabel = view === 'type' ? 'Por tipo' : view === 'date' ? 'Por fecha' : 'Lista';
        return `
            <header class="files-head">
                <h2 class="files-head__title">Mis archivos</h2>
            </header>

            <div class="files-search-row">
                <label class="files-search">
                    <i class="fas fa-magnifying-glass"></i>
                    <input type="search" id="library-search" placeholder="Buscar documentos…" value="${escapeHtml(query)}">
                </label>
                <div class="files-filter-wrap">
                    <button type="button" class="files-filter-btn" id="library-filter-btn" aria-haspopup="menu" aria-expanded="${state.libraryFilterOpen}">
                        <i class="fas fa-sliders"></i> ${viewLabel}
                        <i class="fas fa-chevron-down files-filter-btn__caret"></i>
                    </button>
                    ${state.libraryFilterOpen ? `
                        <div class="files-filter-menu" role="menu">
                            <button type="button" data-set-view="list" class="${view === 'list' ? 'is-active' : ''}" role="menuitem">
                                <i class="fas fa-list"></i><span>Ver como lista</span>${view === 'list' ? '<i class="fas fa-check files-filter-menu__check"></i>' : ''}
                            </button>
                            <button type="button" data-set-view="type" class="${view === 'type' ? 'is-active' : ''}" role="menuitem">
                                <i class="fas fa-folder"></i><span>Por tipo de archivo</span>${view === 'type' ? '<i class="fas fa-check files-filter-menu__check"></i>' : ''}
                            </button>
                            <button type="button" data-set-view="date" class="${view === 'date' ? 'is-active' : ''}" role="menuitem">
                                <i class="fas fa-calendar"></i><span>Por fecha de subida</span>${view === 'date' ? '<i class="fas fa-check files-filter-menu__check"></i>' : ''}
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    };

    // --- Folder views ---
    if (view === 'type' || view === 'date') {
        const buildFolders = () => {
            if (view === 'type') {
                const order = [];
                DOC_TYPES.forEach(t => { if (!order.includes(t.folder)) order.push(t.folder); });
                projectDocs.forEach(d => { if (!order.includes(d.folder)) order.push(d.folder); });
                return order
                    .map(folder => {
                        const docs = projectDocs.filter(d => d.folder === folder);
                        if (!docs.length) return null;
                        return { key: `type:${folder}`, label: folder, icon: 'fa-folder', docs };
                    })
                    .filter(Boolean);
            }
            const groups = new Map();
            projectDocs.forEach(d => {
                const key = new Date(d.createdAt).toISOString().slice(0, 10);
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(d);
            });
            return [...groups.keys()]
                .sort((a, b) => b.localeCompare(a))
                .map(dateKey => ({
                    key: `date:${dateKey}`,
                    label: formatDateFolderLabel(dateKey),
                    icon: 'fa-calendar-day',
                    docs: groups.get(dateKey)
                }));
        };

        const folders = buildFolders();
        const activeFolder = state.libraryFolder ? folders.find(f => f.key === state.libraryFolder) : null;

        if (activeFolder) {
            const sorted = [...activeFolder.docs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            container.innerHTML = `
                ${filtersBar()}
                <article class="folder-detail-card">
                    <button type="button" class="folder-detail-card__back" id="library-back">
                        <i class="fas fa-chevron-left"></i> Volver a las carpetas
                    </button>
                    <div class="folder-detail-card__head">
                        <span class="folder-detail-card__icon"><i class="fas ${activeFolder.icon}"></i></span>
                        <div>
                            <h3>${escapeHtml(activeFolder.label)}</h3>
                            <p>${sorted.length} ${sorted.length === 1 ? 'documento' : 'documentos'} · ordenados por fecha de subida</p>
                        </div>
                    </div>
                </article>
                <div class="file-list">${sorted.map(docCard).join('')}</div>
            `;
            return;
        }

        const foldersMarkup = folders.length
            ? `<div class="folder-grid">${folders.map(f => `
                    <button type="button" class="folder-row" data-open-folder="${escapeHtml(f.key)}">
                        <span class="folder-row__icon"><i class="fas ${f.icon}"></i></span>
                        <span class="folder-row__body">
                            <span class="folder-row__name">${escapeHtml(f.label)}</span>
                            <span class="folder-row__count">${f.docs.length} ${f.docs.length === 1 ? 'documento' : 'documentos'}</span>
                        </span>
                        <i class="fas fa-chevron-right folder-row__chevron"></i>
                    </button>
                `).join('')}</div>`
            : '<div class="section-card"><p class="section-sub">No hay documentos cargados todavía.</p></div>';

        container.innerHTML = `${filtersBar()}${foldersMarkup}`;
        return;
    }

    // --- List view (default) ---
    const filterMatches = (doc) => {
        if (filter === 'all') return true;
        if (filter === 'mine') return doc.uploadedBy === state.currentRole;
        return doc.uploadedBy === filter;
    };
    const visibleDocs = projectDocs.filter(doc =>
        filterMatches(doc) &&
        (!query || doc.name.toLowerCase().includes(query) || (doc.observation || '').toLowerCase().includes(query))
    );
    const chip = (id, label, dot) => `
        <button type="button" class="files-chip ${filter === id ? 'is-active' : ''}" data-filter="${id}">
            ${dot ? `<span class="dot dot--${dot}"></span>` : ''}
            ${label}
        </button>
    `;
    const listMarkup = visibleDocs.length
        ? `<div class="file-list">${visibleDocs.map(docCard).join('')}</div>`
        : '<div class="section-card"><p class="section-sub">No hay documentos que coincidan con el filtro.</p></div>';

    container.innerHTML = `
        ${filtersBar()}
        <div class="files-chips">
            ${chip('all', 'Todos')}
            ${chip('mine', 'Subidos por mí')}
            ${chip('owner', 'Cliente', 'blue')}
            ${chip('architect', 'Arquitecto', 'orange')}
            ${chip('escribania', 'Escribanía', 'gray')}
        </div>
        ${listMarkup}
    `;
}

function formatDateFolderLabel(isoDate) {
    const date = new Date(isoDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return 'Hoy';
    if (date.getTime() === yesterday.getTime()) return 'Ayer';
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderUploadScreen() {
    if (!uploadScreen.open) return;

    const file = docsForm.file;
    const fileZone = file
        ? `
            <div class="upload-file upload-file--ready">
                <span class="upload-file__icon"><i class="fas ${file.mime === 'application/pdf' ? 'fa-file-pdf' : 'fa-file-image'}"></i></span>
                <div class="upload-file__info">
                    <strong>${escapeHtml(file.name)}</strong>
                    <small>${formatFileSize(file.size)} · listo para subir</small>
                </div>
                <button type="button" class="upload-file__remove" id="upload-file-remove" aria-label="Quitar archivo"><i class="fas fa-xmark"></i></button>
            </div>
        `
        : `
            <div class="upload-file upload-file--empty">
                <span class="upload-file__icon"><i class="fas fa-paperclip"></i></span>
                <div class="upload-file__info">
                    <strong>Ningún archivo seleccionado</strong>
                    <small>Adjuntá un PDF o una imagen</small>
                </div>
            </div>
            <div class="upload-file__actions">
                <button type="button" class="upload-file__btn" id="upload-pick-file"><i class="fas fa-folder-open"></i> Elegir archivo</button>
                <button type="button" class="upload-file__btn" id="upload-pick-camera"><i class="fas fa-camera"></i> Tomar foto</button>
            </div>
        `;

    const formMarkup = docsForm.uploading
        ? `
            <div class="upload-progress">
                <div class="upload-progress__top">
                    <span><i class="fas ${docsForm.source === 'camera' ? 'fa-camera' : 'fa-cloud-arrow-up'}"></i> Subiendo "${escapeHtml(docsForm.name)}"…</span>
                    <span id="upload-bar-pct">0%</span>
                </div>
                <div class="upload-progress__track">
                    <div class="upload-progress__fill" id="upload-bar-fill"></div>
                </div>
            </div>
        `
        : `
            <div class="docs-form">
                <div class="docs-form__row">
                    <label for="upload-form-type">Tipo de documento</label>
                    <select id="upload-form-type">
                        <option value="">Elegí un tipo…</option>
                        ${DOC_TYPES.map(type => `<option value="${type.id}" ${type.id === docsForm.typeId ? 'selected' : ''}>${escapeHtml(type.label)}</option>`).join('')}
                    </select>
                </div>
                <div class="docs-form__row">
                    <label for="upload-form-name">Nombre del documento</label>
                    <input id="upload-form-name" type="text" placeholder="Ej. Permiso municipal junio" value="${escapeHtml(docsForm.name)}">
                </div>
                ${typeNeedsSector(docsForm.typeId) ? `
                <div class="docs-form__row">
                    <label for="upload-form-sector">Sector / nivel de obra</label>
                    <select id="upload-form-sector">
                        <option value="">Sin especificar</option>
                        ${DOC_SECTORS.map(sector => `<option value="${escapeHtml(sector)}" ${sector === docsForm.sector ? 'selected' : ''}>${escapeHtml(sector)}</option>`).join('')}
                    </select>
                    <small class="docs-form__hint-field">Ayudá a ubicar el plano o la documentación técnica dentro de la obra.</small>
                </div>
                ` : ''}
                <div class="docs-form__row">
                    <label for="upload-form-obs">Observación (opcional)</label>
                    <textarea id="upload-form-obs" placeholder="Notas, contexto, número de expediente…">${escapeHtml(docsForm.observation)}</textarea>
                </div>
                <div class="docs-form__row">
                    <label>Archivo</label>
                    ${fileZone}
                </div>
                <input type="file" id="upload-file-input" accept="application/pdf,image/*" hidden>
                <input type="file" id="upload-camera-input" accept="image/*" capture="environment" hidden>
                <button type="button" class="docs-upload-btn" id="upload-form-cta" ${docsForm.typeId && docsForm.name && docsForm.file ? '' : 'disabled'}>
                    <i class="fas fa-cloud-arrow-up"></i> ${docsForm.versionOfDocId ? 'Subir nueva versión' : 'Subir archivo'}
                </button>
                <p class="docs-form__missing" id="upload-form-missing" ${uploadMissingMessage() ? '' : 'hidden'}>
                    <i class="fas fa-circle-info"></i> <span id="upload-form-missing-text">${escapeHtml(uploadMissingMessage())}</span>
                </p>
            </div>
        `;

    const versionDoc = docsForm.versionOfDocId
        ? state.documents.find(item => item.id === docsForm.versionOfDocId)
        : null;
    const versionBanner = versionDoc
        ? `
            <div class="version-banner">
                <span class="version-banner__icon"><i class="fas fa-code-branch"></i></span>
                <div>
                    <strong>Nueva versión de "${escapeHtml(versionDoc.name)}"</strong>
                    <small>Se guardará como v${(versionDoc.version || 1) + 1}. La versión v${versionDoc.version || 1} queda en el historial.</small>
                </div>
            </div>
        `
        : '';

    uploadScreenBody.innerHTML = `
        <article class="section-card">
            <h3 class="section-title">${versionDoc ? 'Nueva versión del documento' : 'Datos del documento'}</h3>
            <p class="section-sub">${versionDoc ? 'Adjuntá el archivo actualizado. El nombre y el tipo se mantienen.' : 'Elegí el tipo, ponele un nombre y adjuntá el archivo (PDF o foto).'}</p>
            ${versionBanner}
            ${formMarkup}
        </article>
    `;

    bindUploadScreenEvents();
}

function handleFileChosen(file, source) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        docsForm.file = {
            name: file.name,
            mime: file.type || (source === 'camera' ? 'image/jpeg' : 'application/octet-stream'),
            size: file.size,
            dataUrl: reader.result
        };
        docsForm.source = source;
        if (!docsForm.name) {
            docsForm.name = file.name.replace(/\.[^.]+$/, '');
        }
        renderUploadScreen();
    };
    reader.onerror = () => showToast('No se pudo leer el archivo.');
    reader.readAsDataURL(file);
}

function runUpload() {
    if (!docsForm.typeId || !docsForm.name || !docsForm.file) {
        showToast('Elegí tipo, nombre y archivo antes de subir.');
        return;
    }
    docsForm.uploading = true;
    renderUploadScreen();

    let pct = 0;
    const step = () => {
        pct = Math.min(100, pct + 20);
        const barEl = document.getElementById('upload-bar-fill');
        const pctEl = document.getElementById('upload-bar-pct');
        if (barEl) barEl.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';
        if (pct < 100) {
            setTimeout(step, 170);
        } else {
            setTimeout(finishUpload, 220);
        }
    };
    setTimeout(step, 170);
}

function bindUploadScreenEvents() {
    const typeSelect = document.getElementById('upload-form-type');
    const nameInput = document.getElementById('upload-form-name');
    const obsInput = document.getElementById('upload-form-obs');
    const sectorSelect = document.getElementById('upload-form-sector');
    if (typeSelect) typeSelect.addEventListener('change', () => {
        docsForm.typeId = typeSelect.value;
        if (!typeNeedsSector(docsForm.typeId)) docsForm.sector = '';
        renderUploadScreen(); // re-render para mostrar/ocultar el campo de sector
    });
    if (nameInput) nameInput.addEventListener('input', () => { docsForm.name = nameInput.value.trim(); syncDocsFormButton(); });
    if (obsInput) obsInput.addEventListener('input', () => { docsForm.observation = obsInput.value.trim(); });
    if (sectorSelect) sectorSelect.addEventListener('change', () => { docsForm.sector = sectorSelect.value; });

    const fileInput = document.getElementById('upload-file-input');
    const cameraInput = document.getElementById('upload-camera-input');
    const pickFileBtn = document.getElementById('upload-pick-file');
    const pickCameraBtn = document.getElementById('upload-pick-camera');
    if (pickFileBtn && fileInput) pickFileBtn.addEventListener('click', () => fileInput.click());
    if (pickCameraBtn && cameraInput) pickCameraBtn.addEventListener('click', () => cameraInput.click());
    if (fileInput) fileInput.addEventListener('change', () => handleFileChosen(fileInput.files[0], 'file'));
    if (cameraInput) cameraInput.addEventListener('change', () => handleFileChosen(cameraInput.files[0], 'camera'));

    const removeBtn = document.getElementById('upload-file-remove');
    if (removeBtn) removeBtn.addEventListener('click', () => { docsForm.file = null; renderUploadScreen(); });

    const cta = document.getElementById('upload-form-cta');
    if (cta) cta.addEventListener('click', runUpload);
}

function openUploadScreen(prefill) {
    uploadScreen.open = true;
    docsForm.typeId = prefill?.typeId || '';
    docsForm.name = prefill?.name || '';
    docsForm.observation = '';
    docsForm.sector = prefill?.sector || '';
    docsForm.uploading = false;
    docsForm.file = null;
    docsForm.source = null;
    docsForm.remitoId = prefill?.remitoId || null;
    docsForm.versionOfDocId = prefill?.versionOfDocId || null;
    uploadScreenEl.hidden = false;
    chatBubble.classList.add('hidden');
    renderUploadScreen();
}

// Abre la pantalla de subida en modo "nueva versión" de un documento existente
function openNewVersionUpload(docId) {
    const doc = state.documents.find(item => item.id === docId);
    if (!doc) return;
    // Cierra el menú de la tarjeta (su z-index es mayor que el overlay de subida)
    state.documentMenuOpen = null;
    renderApp();
    // Cierra el panel de versiones si estaba abierto para no superponer overlays
    const historyAside = document.getElementById('history-detail');
    if (historyAside) historyAside.hidden = true;
    openUploadScreen({
        typeId: doc.typeId,
        name: doc.name,
        sector: doc.sector,
        versionOfDocId: doc.id
    });
}

function closeUploadScreen() {
    uploadScreen.open = false;
    uploadScreenEl.hidden = true;
    if (!planViewer.open && !chatState.open) chatBubble.classList.remove('hidden');
}

function renderPlanViewer() {
    if (!planViewer.open || !planViewer.documentId) return;

    const doc = state.documents.find(item => item.id === planViewer.documentId);
    if (!doc) {
        planViewerBody.innerHTML = '<div class="section-card"><p>No encontramos el documento.</p></div>';
        return;
    }

    const thread = ensureThread(doc.id);
    const role = state.currentRole;
    const hasPin = thread.pinVisible;
    const hasRedline = thread.redlineVisible;
    const draft = planViewer.draft;
    const isPlan = doc.folder === 'Planos' || doc.typeId === 'plano';
    const hasFile = Boolean(doc.fileData);

    planViewerKicker.textContent = docTypeLabel(doc);
    planViewerTitle.textContent = doc.name;

    const commentsMarkup = thread.comments.length
        ? thread.comments.map(comment => `
            <div class="comment-item ${comment.type === 'mention' ? 'mention' : comment.type === 'tech' ? 'tech' : ''}">
                <strong>${roleLabel(comment.authorRole)}</strong>
                <p>${escapeHtml(comment.text)}</p>
                <div class="comment-meta">${prettyDate(comment.createdAt)}</div>
            </div>
        `).join('')
        : '<div class="comment-item"><p>Todavía no hay comentarios.</p></div>';

    const helpTip = `<p class="press-tip"><i class="fas fa-hand-pointer"></i> ${draft ? 'Soltá para escribir tu comentario.' : 'Mantené el dedo sobre el documento donde quieras comentar.'}</p>`;

    const composer = draft ? `
        <div class="plan-composer">
            <div class="plan-composer__hint">
                <i class="fas fa-location-dot"></i> Comentario sobre el área seleccionada
            </div>
            <textarea id="plan-composer-input" placeholder="Escribí tu consulta, pedido u observación…"></textarea>
            <div class="plan-composer__row">
                <button class="btn-small" id="plan-composer-cancel">Cancelar</button>
                <button class="btn-small action" id="plan-composer-send">Enviar</button>
            </div>
        </div>
    ` : '';

    const devButtons = [
        (state.ownerCommentDone && !state.mentionDone)
            ? '<button class="btn-small action" id="developer-mention-cta">Consultar al equipo técnico</button>' : '',
        (state.mentionDone && !state.budgetRequested)
            ? '<button class="btn-small olive" id="developer-budget-cta">Pedir presupuesto</button>' : ''
    ].join('');
    const developerActions = (isPlan && role === 'developer' && devButtons)
        ? `<div class="inline-actions">${devButtons}</div>` : '';

    const architectActions = (isPlan && role === 'architect' && state.ownerCommentDone && !state.techResponseDone)
        ? '<div class="inline-actions"><button class="btn-small action" id="architect-reply-cta">Marcar observación en el plano</button></div>'
        : '';

    const planPreview = `
        <div id="blueprint-area" class="plan-shell">
            <span class="plan-label">${escapeHtml(doc.folder)}${doc.sector ? ` · ${escapeHtml(doc.sector)}` : ''}</span>
            ${hasPin ? `<span class="pin-dot" style="left:${thread.pin.x}%; top:${thread.pin.y}%;"></span>` : ''}
            ${draft ? `<span class="pin-dot draft" style="left:${draft.x}%; top:${draft.y}%;"></span>` : ''}
            ${hasRedline ? '<span class="annotation-line"></span>' : ''}
        </div>
    `;

    const docPreview = `
        <div id="blueprint-area" class="doc-shell">
            <span class="doc-shell__type">${escapeHtml(docTypeLabel(doc))}</span>
            <h4 class="doc-shell__name">${escapeHtml(doc.name)}</h4>
            <p class="doc-shell__meta">${escapeHtml(doc.folder)}${doc.sector ? ` · ${escapeHtml(doc.sector)}` : ''} · ${prettyDate(doc.createdAt)} · ${roleLabel(doc.uploadedBy)}</p>
            ${doc.observation ? `<p class="doc-shell__obs">${escapeHtml(doc.observation)}</p>` : ''}
            <div class="doc-shell__lines"></div>
            ${hasPin ? `<span class="pin-dot" style="left:${thread.pin.x}%; top:${thread.pin.y}%;"></span>` : ''}
            ${draft ? `<span class="pin-dot draft" style="left:${draft.x}%; top:${draft.y}%;"></span>` : ''}
        </div>
    `;

    // Caja de respuesta disponible para los tres roles (desarrolladora, equipo técnico y propietario).
    const replyComposer = `
        <div class="plan-simple-composer">
            <textarea id="plan-simple-input" placeholder="Escribí tu respuesta o comentario…"></textarea>
            <button type="button" class="btn-small action" id="plan-simple-send">
                <i class="fas fa-reply"></i> Responder
            </button>
        </div>
    `;

    if (hasFile) {
        planViewerBody.innerHTML = `
            <article class="section-card">
                ${fileViewerMarkup(doc)}
                <div class="file-viewer__actions">
                    <button type="button" class="btn-small action" id="plan-file-download"><i class="fas fa-download"></i> Descargar archivo</button>
                </div>
                ${doc.observation ? `<p class="doc-shell__obs">${escapeHtml(doc.observation)}</p>` : ''}
                ${developerActions}
                ${architectActions}
            </article>
            <article class="section-card">
                <h3 class="section-title">Conversación</h3>
                <div class="comment-thread">${commentsMarkup}</div>
                ${replyComposer}
            </article>
        `;
    } else {
        planViewerBody.innerHTML = `
            <article class="section-card">
                ${isPlan ? planPreview : docPreview}
                ${helpTip}
                ${composer}
                ${developerActions}
                ${architectActions}
            </article>
            <article class="section-card">
                <h3 class="section-title">Conversación</h3>
                <div class="comment-thread">${commentsMarkup}</div>
                ${replyComposer}
            </article>
        `;
    }

    bindPlanViewerEvents();
}

function fileViewerMarkup(doc) {
    const mime = doc.fileMime || '';
    if (mime.startsWith('image/')) {
        return `<div class="file-viewer"><img src="${doc.fileData}" alt="${escapeHtml(doc.name)}"></div>`;
    }
    if (mime === 'application/pdf') {
        return `<div class="file-viewer file-viewer--pdf"><embed src="${doc.fileData}" type="application/pdf"></div>`;
    }
    return `
        <div class="file-viewer file-viewer--generic">
            <i class="fas fa-file"></i>
            <p>${escapeHtml(doc.fileName || doc.name)}</p>
        </div>
    `;
}

function submitPlainComment(text) {
    const docId = planViewer.documentId;
    if (!docId || !text) return;
    const thread = ensureThread(docId);
    const doc = state.documents.find(item => item.id === docId);
    const role = state.currentRole;

    thread.comments.push({
        id: `comment-${role}-${Date.now()}`,
        authorRole: role,
        text,
        type: 'comment',
        createdAt: isoNow()
    });

    pushVersionEvent(EVENT_TYPES.COMMENT_ADDED, {
        actorRole: role,
        documentId: docId,
        text: `${roleLabel(role)} comentó en "${doc?.name || 'documento'}": "${text}"`
    });

    const otherRoles = ['developer', 'architect', 'owner'].filter(item => item !== role);
    addNotification({
        type: 'comment',
        title: 'Comentario nuevo',
        message: `${roleLabel(role)} comentó en "${doc?.name || 'documento'}".`,
        targets: otherRoles,
        context: { tab: 'plan', documentId: docId },
        projectId: doc?.projectId || state.currentProject
    });

    renderApp();
    renderPlanViewer();
    showToast('Comentario enviado.');
}

function bindPlanViewerEvents() {
    const area = document.getElementById('blueprint-area');
    if (area) {
        let timer = null;
        let pressCoords = null;

        const capture = (event) => {
            const rect = area.getBoundingClientRect();
            pressCoords = {
                x: ((event.clientX - rect.left) / rect.width) * 100,
                y: ((event.clientY - rect.top) / rect.height) * 100
            };
        };

        const start = (event) => {
            if (planViewer.draft) return;
            capture(event);
            timer = setTimeout(() => {
                planViewer.draft = pressCoords;
                renderPlanViewer();
                setTimeout(() => {
                    document.getElementById('plan-composer-input')?.focus();
                }, 30);
            }, 450);
        };

        const cancel = () => {
            if (timer) clearTimeout(timer);
            timer = null;
        };

        area.addEventListener('pointerdown', start);
        area.addEventListener('pointerup', cancel);
        area.addEventListener('pointerleave', cancel);
        area.addEventListener('pointercancel', cancel);
    }

    const sendBtn = document.getElementById('plan-composer-send');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const input = document.getElementById('plan-composer-input');
            const text = (input?.value || '').trim();
            if (!text) {
                input?.focus();
                return;
            }
            submitDocComment(text);
        });
    }

    const cancelBtn = document.getElementById('plan-composer-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            planViewer.draft = null;
            renderPlanViewer();
        });
    }

    const mentionCta = document.getElementById('developer-mention-cta');
    if (mentionCta) mentionCta.addEventListener('click', mentionArchitect);

    const budgetCta = document.getElementById('developer-budget-cta');
    if (budgetCta) budgetCta.addEventListener('click', generateBudgetRequest);

    const archReplyCta = document.getElementById('architect-reply-cta');
    if (archReplyCta) archReplyCta.addEventListener('click', architectTechnicalReply);

    const simpleSend = document.getElementById('plan-simple-send');
    if (simpleSend) {
        simpleSend.addEventListener('click', () => {
            const input = document.getElementById('plan-simple-input');
            const text = (input?.value || '').trim();
            if (!text) {
                input?.focus();
                return;
            }
            submitPlainComment(text);
        });
    }

    const fileDownload = document.getElementById('plan-file-download');
    if (fileDownload) {
        fileDownload.addEventListener('click', () => {
            const doc = state.documents.find(item => item.id === planViewer.documentId);
            if (doc) downloadDocument(doc);
        });
    }
}

function openPlanViewer(documentId) {
    const doc = state.documents.find(item => item.id === documentId);
    if (!doc) return;
    ensureThread(documentId);
    planViewer.open = true;
    planViewer.documentId = documentId;
    planViewer.draft = null;
    planViewerEl.hidden = false;
    chatBubble.classList.add('hidden');
    renderPlanViewer();
}

function closePlanViewer() {
    planViewer.open = false;
    planViewer.documentId = null;
    planViewer.draft = null;
    planViewerEl.hidden = true;
    if (!chatState.open && !uploadScreen.open) chatBubble.classList.remove('hidden');
}

function renameDocument(docId) {
    const doc = state.documents.find(item => item.id === docId);
    if (!doc) return;
    const nextName = window.prompt('Nuevo nombre del documento', doc.name);
    const cleanName = (nextName || '').trim();
    if (!cleanName || cleanName === doc.name) {
        state.documentMenuOpen = null;
        renderApp();
        return;
    }

    doc.name = cleanName;
    doc.version = (doc.version || 1) + 1;
    pushVersionEvent(EVENT_TYPES.VERSION_EVENT_LOGGED, {
        actorRole: state.currentRole,
        documentId: doc.id,
        projectId: doc.projectId,
        text: `${roleLabel(state.currentRole)} renombró el documento a "${doc.name}".`
    });
    state.documentMenuOpen = null;
    renderApp();
    showToast('Documento renombrado.');
}

function moveDocument(docId) {
    const doc = state.documents.find(item => item.id === docId);
    if (!doc) return;
    const folders = [...new Set(DOC_TYPES.map(item => item.folder))];
    const nextFolder = window.prompt(`Mover a carpeta:\n${folders.join(', ')}`, doc.folder);
    const cleanFolder = (nextFolder || '').trim();
    if (!cleanFolder || cleanFolder === doc.folder) {
        state.documentMenuOpen = null;
        renderApp();
        return;
    }

    const matchedFolder = folders.find(folder => folder.toLowerCase() === cleanFolder.toLowerCase()) || cleanFolder;
    doc.folder = matchedFolder;
    doc.version = (doc.version || 1) + 1;
    pushVersionEvent(EVENT_TYPES.VERSION_EVENT_LOGGED, {
        actorRole: state.currentRole,
        documentId: doc.id,
        projectId: doc.projectId,
        text: `${roleLabel(state.currentRole)} movió "${doc.name}" a ${doc.folder}.`
    });
    state.documentMenuOpen = null;
    state.libraryFolder = null;
    renderApp();
    showToast('Documento movido.');
}

function openDocumentVersions(docId) {
    const doc = state.documents.find(item => item.id === docId);
    const aside = document.getElementById('history-detail');
    const body = document.getElementById('history-detail-body');
    const title = document.getElementById('history-detail-title');
    if (!doc || !aside || !body) return;

    const rows = state.versionHistory
        .filter(row => row.documentId === docId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (title) title.textContent = 'Versiones';
    body.innerHTML = `
        <section class="process-section">
            <h4 class="process-section__kicker">${escapeHtml(doc.folder)}</h4>
            <p class="process-section__stage">${escapeHtml(doc.name)}</p>
            <p class="process-section__meta">Versión actual v${doc.version || 1} · ${roleLabel(doc.uploadedBy)} · ${prettyDate(doc.createdAt)}</p>
            <div class="inline-actions">
                <button type="button" class="btn-small action" data-doc-option="new-version" data-doc-id="${doc.id}">
                    <i class="fas fa-cloud-arrow-up"></i> Subir nueva versión
                </button>
                <button type="button" class="btn-small" data-open-plan="${doc.id}">
                    <i class="fas fa-eye"></i> Abrir documento
                </button>
                <button type="button" class="btn-small" data-action="download-doc-from-versions" data-doc-id="${doc.id}">
                    <i class="fas fa-download"></i> Descargar
                </button>
            </div>
        </section>

        ${(doc.versions && doc.versions.length > 1) ? `
        <section class="process-section">
            <h4 class="process-section__title">Versiones del archivo</h4>
            <div class="version-list">
                ${[...doc.versions].sort((a, b) => b.version - a.version).map(v => `
                    <div class="version-row ${v.version === doc.version ? 'is-current' : ''}">
                        <span class="version-row__tag">v${v.version}</span>
                        <div class="version-row__body">
                            <strong>${escapeHtml(v.fileName || doc.name)}</strong>
                            <small>${roleLabel(v.uploadedBy)} · ${prettyDate(v.createdAt)}</small>
                        </div>
                        ${v.version === doc.version ? '<span class="version-row__current">Actual</span>' : ''}
                    </div>
                `).join('')}
            </div>
        </section>
        ` : ''}

        <section class="process-section">
            <h4 class="process-section__title">Registro de versiones</h4>
            <ul class="process-timeline">
                <li class="process-event">
                    <div class="process-event__dot"></div>
                    <div class="process-event__body">
                        <h6>v${doc.version || 1} · Versión actual</h6>
                        <p>${escapeHtml(doc.observation || 'Documento disponible para consulta.')}</p>
                        <small>${roleLabel(doc.uploadedBy)} · ${prettyDate(doc.createdAt)}</small>
                    </div>
                </li>
                ${rows.map(row => `
                    <li class="process-event">
                        <div class="process-event__dot"></div>
                        <div class="process-event__body">
                            <h6>${escapeHtml(EVENT_LABELS[row.type] || 'Cambio registrado')}</h6>
                            <p>${escapeHtml(row.text)}</p>
                            <small>${roleLabel(row.actorRole)} · ${prettyDate(row.createdAt)}</small>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </section>
    `;

    state.documentMenuOpen = null;
    aside.hidden = false;
    chatBubble.classList.add('hidden');
    attachEventsInActiveTab();
}

function renderNotifications() {
    const container = document.getElementById('tab-notifications');
    const role = state.currentRole;

    const visible = state.notifications
        .filter(notification => notification.targets.includes(role))
        .filter(notification => notification.projectId === state.currentProject || notification.projectId === 'global')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!visible.length) {
        const project = activeProject();
        const projectName = project ? project.name : 'tu obra';
        const canPublish = role === 'developer' || role === 'architect';
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-state__icon"><i class="far fa-bell"></i></span>
                <h3>Todo al día en ${escapeHtml(projectName)}</h3>
                <p>Acá vas a ver los comunicados y avisos de la obra: documentos nuevos, comentarios del equipo, firmas pendientes y novedades importantes.</p>
                ${canPublish
                    ? '<p class="empty-state__hint"><i class="fas fa-circle-info"></i> Cuando publiques un comunicado o cargues un documento, el resto del equipo recibe el aviso al instante.</p>'
                    : '<p class="empty-state__hint"><i class="fas fa-circle-info"></i> Te avisamos apenas la desarrolladora o el equipo técnico publiquen una novedad.</p>'}
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <article class="section-card">
            <h3 class="section-title">Comunicados</h3>
            <p class="section-sub">Tocá un comunicado para abrir el detalle.</p>
            <div class="notif-list">
                ${visible.map(item => {
        const isUnread = !item.readBy.includes(role);
        return `
                        <div class="notif-item ${isUnread ? 'unread' : ''}">
                            <div class="notif-top">
                                <h4>${escapeHtml(item.title)}</h4>
                                <span class="badge ${isUnread ? 'badge-action' : 'badge-neutral'}">${isUnread ? 'Nueva' : 'Leída'}</span>
                            </div>
                            <p>${escapeHtml(item.message)}</p>
                            <div class="notif-meta">
                                <small>${prettyDate(item.createdAt)}</small>
                                <button class="link-btn" data-open-notif="${item.id}">Ver →</button>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </article>
    `;
}

function renderHistory() {
    const container = document.getElementById('tab-history');
    const project = activeProject();
    if (!container) return;

    if (!project) {
        container.innerHTML = '<div class="section-card"><p>No hay obra activa.</p></div>';
        return;
    }

    const filter = state.historyFilter || 'all';
    const allEvents = timelineEventsForProject(project.id);
    const filteredEvents = allEvents.filter(event => {
        if (filter === 'all') return true;
        if (filter === 'documents') return event.kind === 'document' || event.kind === 'remito' || event.kind === 'signature';
        if (filter === 'comments') return event.kind === 'comment';
        if (filter === 'milestones') return event.kind === 'milestone';
        if (filter === 'notifications') return event.kind === 'notification';
        return true;
    });

    const chip = (id, label, icon) => `
        <button type="button" class="files-chip ${filter === id ? 'is-active' : ''}" data-history-filter="${id}">
            <i class="fas ${icon}"></i> ${label}
        </button>
    `;

    container.innerHTML = `
        <header class="history-head">
            <p class="history-head__kicker">${escapeHtml(project.name)}</p>
            <h2>Historial</h2>
            <p>Cronología de documentos, comentarios, hitos y comunicaciones de la obra.</p>
        </header>

        <div class="history-summary">
            <div>
                <strong>${allEvents.length}</strong>
                <small>eventos</small>
            </div>
            <div>
                <strong>${state.documents.filter(doc => doc.projectId === project.id).length}</strong>
                <small>documentos</small>
            </div>
            <div>
                <strong>${project.progress}%</strong>
                <small>avance</small>
            </div>
        </div>

        <div class="files-chips history-chips">
            ${chip('all', 'Todo', 'fa-layer-group')}
            ${chip('documents', 'Documentos', 'fa-file-lines')}
            ${chip('comments', 'Comentarios', 'fa-message')}
            ${chip('milestones', 'Hitos', 'fa-flag')}
            ${chip('notifications', 'Comunicados', 'fa-bullhorn')}
        </div>

        <div class="history-timeline">
            ${filteredEvents.length ? filteredEvents.map(event => `
                <button type="button" class="history-event history-event--${event.kind}"
                    ${event.documentId ? `data-history-doc="${event.documentId}"` : ''}
                    ${event.action ? `data-history-action="${event.action}"` : ''}>
                    <span class="history-event__rail">
                        <span class="history-event__icon"><i class="fas ${eventIcon(event.kind)}"></i></span>
                    </span>
                    <span class="history-event__body">
                        <span class="history-event__top">
                            <strong>${escapeHtml(event.title)}</strong>
                            <small>${escapeHtml(event.when)}</small>
                        </span>
                        <span class="history-event__text">${escapeHtml(event.text)}</span>
                        <span class="history-event__meta">${eventKindLabel(event.kind)} · ${roleLabel(event.actorRole)}</span>
                    </span>
                    <i class="fas fa-chevron-right history-event__chev"></i>
                </button>
            `).join('') : '<div class="section-card"><p class="section-sub">No hay eventos para este filtro.</p></div>'}
        </div>
    `;
}

function renderProfile() {
    const container = document.getElementById('tab-profile');
    const project = activeProject() || state.projects[0];
    if (!container || !project) return;

    const roleLabelShort = state.currentRole === 'owner' ? 'Propietaria' : (state.currentRole === 'architect' ? 'Equipo técnico' : 'Desarrolladora');
    const subtitle = state.currentRole === 'owner'
        ? 'Gestioná tu identidad y tus propiedades'
        : 'Gestioná tu identidad y tus obras';
    const propertiesLabel = state.currentRole === 'owner' ? 'Mis propiedades' : 'Mis obras';
    const propertiesCtaLabel = state.currentRole === 'owner' ? 'Agregar propiedad' : 'Agregar obra';
    const exportTitle = state.currentRole === 'owner' ? 'Pasaporte Digital de tu propiedad' : 'Pasaporte Digital de la obra';
    const exportText = state.currentRole === 'owner'
        ? 'Visualizá o exportá el pasaporte digital de tu propiedad.'
        : 'Visualizá o exportá el pasaporte digital de la obra activa.';
    const propertyRows = state.projects.slice(0, 3).map((item, idx) => `
        <button type="button" class="property-row ${item.id === state.currentProject ? 'is-active' : ''}" data-project-id="${item.id}">
            <span class="property-row__thumb ${idx % 2 ? 'property-row__thumb--central' : 'property-row__thumb--olivares'}"></span>
            <span class="property-row__body">
                <h5>${escapeHtml(item.name)}</h5>
                <p>${state.currentRole === 'owner' ? escapeHtml(item.ownerUnit) : escapeHtml(item.location)} ${item.id === state.currentProject ? '<span class="pill-soft">Activa</span>' : ''}</p>
            </span>
            <i class="fas fa-chevron-right property-row__chev"></i>
        </button>
    `).join('');

    container.innerHTML = `
        <h2 class="profile-title">Mi perfil</h2>
        <p class="profile-subtitle">${subtitle}</p>

        <article class="profile-identity">
            <div class="profile-identity__avatar">
                <button class="profile-identity__edit" type="button" aria-label="Editar foto"><i class="fas fa-pen"></i></button>
            </div>
            <div class="profile-identity__body">
                <h3>Liliana González</h3>
                <p class="profile-identity__role">${roleLabelShort}</p>
                <p class="profile-identity__location"><i class="fas fa-location-dot"></i> ${escapeHtml(project.name)} · ${escapeHtml(project.ownerUnit || project.location)}</p>
                <span class="profile-verified"><i class="fas fa-circle-check"></i> Identidad verificada</span>
            </div>
        </article>

        <header class="owner-section-head">
            <h4>${propertiesLabel}</h4>
            <a class="owner-section-link" data-action="goto-picker">Ver todas <i class="fas fa-chevron-right"></i></a>
        </header>
        <div class="property-stack">
            ${propertyRows}
            <button type="button" class="add-property-btn" data-action="${state.currentRole === 'owner' ? 'add-property' : 'add-obra'}">
                <i class="fas fa-plus"></i> ${propertiesCtaLabel}
            </button>
        </div>

        <header class="owner-section-head">
            <h4>Actividad reciente</h4>
            <a class="owner-section-link" data-action="goto-history">Ver historial <i class="fas fa-chevron-right"></i></a>
        </header>
        <div class="activity-list">
            ${timelineEventsForProject(project.id).slice(0, 3).map(event => `
                <button type="button" class="activity-row activity-row--button" ${event.documentId ? `data-open-plan="${event.documentId}"` : `data-action="${event.action || 'goto-history'}"`}>
                    <span class="activity-row__icon activity-row__icon--doc"><i class="fas ${eventIcon(event.kind)}"></i></span>
                    <span class="activity-row__body">
                        <h5>${escapeHtml(event.title)}</h5>
                        <small>${escapeHtml(event.text)}</small>
                    </span>
                    <small class="activity-row__time">${escapeHtml(event.when)}</small>
                </button>
            `).join('')}
        </div>

        <header class="owner-section-head">
            <h4>Configuración</h4>
        </header>
        <div class="profile-list">
            <button class="profile-list__row" type="button">
                <span class="profile-list__icon"><i class="far fa-user"></i></span>
                <span class="profile-list__label">
                    Información personal
                    <small>Datos, contacto y verificación</small>
                </span>
                <i class="fas fa-chevron-right profile-list__chev"></i>
            </button>
            <button class="profile-list__row" type="button" data-action="open-contact">
                <span class="profile-list__icon"><i class="fas fa-headset"></i></span>
                <span class="profile-list__label">
                    Contacto humano
                    <small>Desarrolladora, equipo técnico y responsables</small>
                </span>
                <i class="fas fa-chevron-right profile-list__chev"></i>
            </button>
            <button class="profile-list__row" type="button">
                <span class="profile-list__icon"><i class="fas fa-shield-halved"></i></span>
                <span class="profile-list__label">
                    Seguridad
                    <small>Contraseña y autenticación</small>
                </span>
                <i class="fas fa-chevron-right profile-list__chev"></i>
            </button>
            <button class="profile-list__row" type="button">
                <span class="profile-list__icon"><i class="far fa-bell"></i></span>
                <span class="profile-list__label">
                    Notificaciones
                    <small>Preferencias y alertas</small>
                </span>
                <i class="fas fa-chevron-right profile-list__chev"></i>
            </button>
            <button class="profile-list__row profile-list__row--danger" type="button" data-action="logout">
                <span class="profile-list__icon profile-list__icon--danger"><i class="fas fa-arrow-right-from-bracket"></i></span>
                <span class="profile-list__label">
                    Cerrar sesión
                    <small>Salir de tu cuenta de Obraty</small>
                </span>
                <i class="fas fa-chevron-right profile-list__chev"></i>
            </button>
        </div>

        <article class="export-card">
            <span class="export-card__icon"><i class="fas fa-passport"></i></span>
            <div class="export-card__body">
                <h5>${exportTitle}</h5>
                <p>${exportText}</p>
            </div>
            <div class="export-card__actions">
                <button class="export-card__btn" type="button" data-action="open-pasaporte"><i class="fas fa-eye"></i> Ver</button>
                <button class="export-card__btn" type="button" data-action="download-pasaporte"><i class="fas fa-download"></i> Exportar</button>
            </div>
        </article>
    `;
}

function updateHeader() {
    const role = ROLES[state.currentRole];
    if (!role) return;

    rolePill.textContent = role.label;
    tabTitle.textContent = state.activeTab === 'home' ? role.homeTitle : tabTitleFor(state.activeTab);

    const header = document.querySelector('#screen-app .screen-header');
    const brandHeader = document.getElementById('brand-header');
    const useBrand = Boolean(state.currentRole);
    if (header) {
        header.classList.toggle('screen-header--brand', useBrand);
        header.classList.remove('screen-header--hidden');
    }
    if (brandHeader) brandHeader.hidden = !useBrand;

    const tabBar = document.querySelector('.tab-bar');
    if (tabBar) tabBar.dataset.tabs = '5';

    const docsTab = document.querySelector('.tab-item[data-tab="docs"]');
    if (docsTab) docsTab.hidden = true;
    const libraryTab = document.querySelector('.tab-item[data-tab="library"]');
    if (libraryTab) {
        libraryTab.hidden = false;
        const libSpan = libraryTab.querySelector('span');
        if (libSpan) libSpan.textContent = 'Documentos';
    }

    if (state.activeTab === 'docs') state.activeTab = 'library';

    const uploadBar = document.getElementById('library-upload-bar');
    if (uploadBar) uploadBar.hidden = state.activeTab !== 'library';
    const chatBubbleEl = document.getElementById('chat-bubble');
    if (chatBubbleEl) chatBubbleEl.style.bottom = state.activeTab === 'library' ? '154px' : '';

    const notifCount = state.notifications
        .filter(notification => notification.targets.includes(state.currentRole))
        .filter(notification => (notification.projectId === state.currentProject || notification.projectId === 'global'))
        .filter(notification => !notification.readBy.includes(state.currentRole)).length;

    const notifTabLabel = document.querySelector('[data-tab-label="notifications"]');
    const notifTabIcon = document.querySelector('[data-tab-icon="notifications"]');
    const historyTabLabel = document.querySelector('[data-tab-label="history"]');
    const historyTabIcon = document.querySelector('[data-tab-icon="history"]');
    const profileTabLabel = document.querySelector('[data-tab-label="profile"]');
    const profileTabIcon = document.querySelector('[data-tab-icon="profile"]');

    notifTabLabel.textContent = notifCount > 0 ? `Comunicados (${notifCount})` : 'Comunicados';
    notifTabIcon.className = 'far fa-comment-dots';
    notifTabIcon.dataset.tabIcon = 'notifications';
    historyTabLabel.textContent = 'Historial';
    historyTabIcon.className = 'fas fa-clock-rotate-left';
    historyTabIcon.dataset.tabIcon = 'history';
    if (profileTabLabel) profileTabLabel.textContent = 'Mi perfil';
    if (profileTabIcon) {
        profileTabIcon.className = 'far fa-user';
        profileTabIcon.dataset.tabIcon = 'profile';
    }

    const backBtn = document.getElementById('back-profiles');
    if (backBtn) {
        const hasBack = state.activeTab === 'library' && Boolean(state.libraryFolder);
        backBtn.disabled = !hasBack;
    }
}

function chatMessagesForRole() {
    const role = state.currentRole;
    const project = activeProject();
    const projectName = project ? project.name : 'la obra';
    const messages = [];

    if (role === 'developer') {
        messages.push({ from: 'bot', text: '¡Hola! ¿En qué te ayudo hoy?' });
        if (!state.ownerCommentDone) {
            messages.push({ from: 'bot', text: 'Por ahora no hay pedidos de cambio. Te aviso cuando aparezca alguno.' });
        } else if (state.ownerCommentDone && !state.mentionDone) {
            messages.push({ from: 'bot', text: 'El propietario pidió un cambio en la cocina. ¿Querés que consulte al equipo técnico?', action: { fn: 'mention', label: 'Consultar al equipo técnico' } });
        } else if (state.mentionDone && !state.techResponseDone) {
            messages.push({ from: 'bot', text: 'Ya consulté al equipo técnico. Te aviso apenas responda.' });
        } else if (state.techResponseDone && !state.budgetRequested) {
            messages.push({ from: 'bot', text: 'El equipo técnico respondió. ¿Querés que prepare un pedido de presupuesto?', action: { fn: 'budget', label: 'Pedir presupuesto' } });
        } else if (state.budgetRequested) {
            messages.push({ from: 'bot', text: 'Listo. El pedido de presupuesto quedó registrado en el Historial.' });
        }
    }

    if (role === 'architect') {
        messages.push({ from: 'bot', text: '¡Hola! ¿En qué te ayudo hoy?' });
        if (state.ownerCommentDone && !state.techResponseDone) {
            messages.push({ from: 'bot', text: 'El propietario consultó por la cocina. Cuando respondas, te conviene sumar una foto del lugar.' });
        }
        if (state.techResponseDone) {
            messages.push({ from: 'bot', text: 'Tu respuesta quedó registrada en el plano y en el historial.' });
        }
    }

    if (role === 'owner') {
        messages.push({ from: 'bot', text: '¡Hola! ¿En qué te ayudo hoy?' });
        if (state.ownerCommentDone && !state.techResponseDone) {
            messages.push({ from: 'bot', text: 'Tu consulta ya está en manos del equipo. Te aviso apenas respondan.' });
        }
        if (state.techResponseDone) {
            messages.push({ from: 'bot', text: 'El equipo técnico te respondió. Mirá en la pestaña Plano la marca en rojo.' });
        }
    }

    return messages;
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function renderChat() {
    if (!chatMessagesEl) return;
    const seed = chatMessagesForRole();
    const allMessages = [...seed, ...chatState.history];

    chatMessagesEl.innerHTML = allMessages.map(message => `
        <div class="chat-msg chat-msg--${message.from}">
            <p>${escapeHtml(message.text)}</p>
            ${message.action ? `<button class="btn-small action" data-chat-action="${message.action.fn}">${escapeHtml(message.action.label)}</button>` : ''}
        </div>
    `).join('');

    chatMessagesEl.querySelectorAll('[data-chat-action]').forEach(button => {
        button.addEventListener('click', () => {
            handleChatAction(button.dataset.chatAction);
        });
    });

    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function handleChatAction(action) {
    if (action === 'mention') {
        chatState.history.push({ from: 'user', text: 'Sí, consultalo' });
        chatState.history.push({ from: 'bot', text: 'Listo. Te aviso apenas el equipo técnico responda.' });
        mentionArchitect();
        return;
    }
    if (action === 'budget') {
        chatState.history.push({ from: 'user', text: 'Generá el presupuesto' });
        chatState.history.push({ from: 'bot', text: 'Listo. El pedido quedó registrado en el Historial.' });
        generateBudgetRequest();
        return;
    }
}

function generateBotReply(userText) {
    const text = userText.toLowerCase();
    const role = state.currentRole;

    if (/\b(hola|buenas|buen d[ií]a|holis)\b/.test(text)) {
        return { from: 'bot', text: '¡Hola! Decime en qué te puedo ayudar.' };
    }
    if (/\bgracias\b/.test(text)) {
        return { from: 'bot', text: 'De nada. Cualquier cosa, escribime.' };
    }

    if (/presupuesto/.test(text)) {
        if (role === 'developer') {
            if (state.budgetRequested) return { from: 'bot', text: 'Ya generamos un pedido de presupuesto. Lo ves en el Historial.' };
            if (state.mentionDone) return { from: 'bot', text: 'Puedo armarlo ahora mismo.', action: { fn: 'budget', label: 'Pedir presupuesto' } };
            return { from: 'bot', text: 'Conviene primero consultar al equipo técnico sobre el cambio pedido.' };
        }
        return { from: 'bot', text: 'Los presupuestos los maneja la desarrolladora.' };
    }

    if (/arquit/.test(text) && role === 'developer') {
        if (state.mentionDone) return { from: 'bot', text: 'Ya lo consulté. Te aviso cuando responda.' };
        if (state.ownerCommentDone) return { from: 'bot', text: 'Puedo consultarlo por vos.', action: { fn: 'mention', label: 'Consultar al equipo técnico' } };
        return { from: 'bot', text: 'Por ahora no hay pedidos que requieran consulta.' };
    }

    if (/(plano|comentar|cambio|cocina|isla)/.test(text)) {
        if (role === 'owner') return { from: 'bot', text: 'Andá a Documentos, tocá el plano y mantené el dedo donde quieras dejar tu consulta.' };
        return { from: 'bot', text: 'Los planos están en la pestaña Documentos.' };
    }

    if (/(subir|legal|boleto|permiso)/.test(text)) {
        if (role === 'developer') return { from: 'bot', text: 'Subí documentos desde la pestaña Documentos.' };
        return { from: 'bot', text: 'Los documentos legales los carga la desarrolladora.' };
    }

    if (/(escanear|remito|insumo|hierro|hormig)/.test(text)) {
        if (role === 'architect') return { from: 'bot', text: 'Escaneá los remitos desde la pestaña Documentos.' };
        return { from: 'bot', text: 'Los remitos los carga el equipo técnico desde Documentos.' };
    }

    if (/(alerta|notific)/.test(text)) {
        return { from: 'bot', text: 'Tus alertas están en la pestaña Alertas, ordenadas de más nueva a más vieja.' };
    }

    if (/(historial|registro|cambio|qued[oó])/.test(text)) {
        return { from: 'bot', text: 'Todo lo que pasa en la obra queda registrado en la pestaña Historial, con fecha y autor.' };
    }

    if (/(obra|proyecto|avance|hito)/.test(text)) {
        const project = activeProject();
        if (project) return { from: 'bot', text: `${project.name} va ${project.progress}% completado. El detalle está en Inicio.` };
    }

    if (/\?\s*$/.test(userText) || /^(qu[eé]|c[oó]mo|cu[aá]ndo|d[oó]nde|por qu[eé])/.test(text)) {
        return { from: 'bot', text: 'Buena pregunta. Probá tocar las pestañas Inicio o Documentos para encontrar lo que necesitás. Si querés, contame con más detalle.' };
    }

    return { from: 'bot', text: 'Anotado. Si querés que el equipo se entere, dejá un comentario en el plano desde Documentos.' };
}

function handleChatSubmit(event) {
    event.preventDefault();
    const text = (chatInput.value || '').trim();
    if (!text) return;
    chatInput.value = '';

    chatState.history.push({ from: 'user', text });
    renderChat();

    const reply = generateBotReply(text);
    if (reply) {
        setTimeout(() => {
            chatState.history.push(reply);
            renderChat();
        }, 420);
    }
}

function seedChatIfNeeded() {
    if (chatState.seededRole === state.currentRole) return;
    chatState.history = [];
    chatState.seededRole = state.currentRole;
}

function openChat() {
    if (!state.currentRole) return;
    seedChatIfNeeded();
    chatState.open = true;
    chatPanel.hidden = false;
    chatBackdrop.hidden = false;
    chatBubble.classList.add('hidden');
    renderChat();
    setTimeout(() => chatInput?.focus(), 60);
}

function closeChat() {
    chatState.open = false;
    chatPanel.hidden = true;
    chatBackdrop.hidden = true;
    if (!planViewer.open && !uploadScreen.open) chatBubble.classList.remove('hidden');
}

function attachEventsInActiveTab() {
    document.querySelectorAll('[data-project-id]').forEach(button => {
        button.addEventListener('click', () => {
            state.focusThreadId = null;
            selectProject(button.dataset.projectId);
        });
    });

    document.querySelectorAll('[data-open-notif]').forEach(button => {
        button.addEventListener('click', () => {
            openNotification(button.dataset.openNotif);
        });
    });

    document.querySelectorAll('[data-open-plan]').forEach(card => {
        card.addEventListener('click', (event) => {
            event.stopPropagation();
            openPlanViewer(card.dataset.openPlan);
        });
    });

    document.querySelectorAll('[data-doc-action]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const action = button.dataset.docAction;
            const docId = button.dataset.docId;
            const doc = state.documents.find(item => item.id === docId);
            if (!doc) return;
            if (action === 'descargar') downloadDocument(doc);
            if (action === 'comentar') openPlanViewer(docId);
            if (action === 'more') {
                state.documentMenuOpen = state.documentMenuOpen === docId ? null : docId;
                renderLibrary();
                attachEventsInActiveTab();
            }
        });
    });

    document.querySelectorAll('[data-doc-option]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const docId = button.dataset.docId;
            const option = button.dataset.docOption;
            if (option === 'rename') renameDocument(docId);
            if (option === 'new-version') openNewVersionUpload(docId);
            if (option === 'versions') openDocumentVersions(docId);
        });
    });

    const openUploadBtn = document.getElementById('docs-open-upload');
    if (openUploadBtn) openUploadBtn.addEventListener('click', openUploadScreen);

    document.querySelectorAll('[data-filter]').forEach(chip => {
        chip.addEventListener('click', () => {
            state.libraryFilter = chip.dataset.filter;
            renderLibrary();
            attachEventsInActiveTab();
        });
    });

    const libFilterBtn = document.getElementById('library-filter-btn');
    if (libFilterBtn) {
        libFilterBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            state.libraryFilterOpen = !state.libraryFilterOpen;
            renderLibrary();
            attachEventsInActiveTab();
            if (state.libraryFilterOpen) bindFilterMenuOutsideClick();
        });
    }

    document.querySelectorAll('[data-set-view]').forEach(item => {
        item.addEventListener('click', (event) => {
            event.stopPropagation();
            state.libraryView = item.dataset.setView;
            state.libraryFolder = null;
            state.documentMenuOpen = null;
            state.libraryFilterOpen = false;
            renderLibrary();
            attachEventsInActiveTab();
        });
    });

    document.querySelectorAll('[data-open-folder]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.libraryFolder = btn.dataset.openFolder;
            renderLibrary();
            attachEventsInActiveTab();
        });
    });

    const libBack = document.getElementById('library-back');
    if (libBack) {
        libBack.addEventListener('click', () => {
            state.libraryFolder = null;
            renderLibrary();
            attachEventsInActiveTab();
        });
    }

    const searchInput = document.getElementById('library-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            state.librarySearch = searchInput.value;
            state.documentMenuOpen = null;
            const focused = document.activeElement === searchInput;
            const pos = searchInput.selectionStart;
            renderLibrary();
            attachEventsInActiveTab();
            if (focused) {
                const reRendered = document.getElementById('library-search');
                if (reRendered) {
                    reRendered.focus();
                    if (pos !== null) reRendered.setSelectionRange(pos, pos);
                }
            }
        });
    }

    document.querySelectorAll('[data-history-filter]').forEach(chip => {
        chip.addEventListener('click', () => {
            state.historyFilter = chip.dataset.historyFilter;
            renderHistory();
            attachEventsInActiveTab();
        });
    });

    document.querySelectorAll('[data-history-doc]').forEach(button => {
        button.addEventListener('click', () => {
            openPlanViewer(button.dataset.historyDoc);
        });
    });

    document.querySelectorAll('[data-history-action]').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.historyAction;
            if (action === 'open-process') openProcessDetail();
            if (action === 'goto-docs') switchTab('library');
            if (action === 'goto-notifications') switchTab('notifications');
        });
    });
}

function bindFilterMenuOutsideClick() {
    const handler = (event) => {
        const menu = document.getElementById('library-filter-menu');
        const btn = document.getElementById('library-filter-btn');
        if (!menu) {
            document.removeEventListener('mousedown', handler);
            return;
        }
        if (menu.contains(event.target) || (btn && btn.contains(event.target))) return;
        state.libraryFilterOpen = false;
        renderLibrary();
        attachEventsInActiveTab();
        document.removeEventListener('mousedown', handler);
    };
    document.addEventListener('mousedown', handler);
}

function renderApp() {
    renderHome();
    renderDocs();
    renderLibrary();
    renderNotifications();
    renderHistory();
    renderProfile();

    tabButtons.forEach(button => button.classList.toggle('active', button.dataset.tab === state.activeTab));
    tabScreens.forEach(screen => screen.classList.toggle('active', screen.id === `tab-${state.activeTab}`));

    updateHeader();
    renderProjectSwitcher();
    attachEventsInActiveTab();

    if (planViewer.open) renderPlanViewer();
    if (uploadScreen.open) renderUploadScreen();
    if (chatState.open) renderChat();

    persistData();
    persistSession();

    window.obratyState = state;
}

function boot() {
    buildRoleSwitcher();

    loadPersistedData();
    loadPersistedSession();

    // Sincroniza cambios hechos en otras pestañas (mismo navegador).
    window.addEventListener('storage', (event) => {
        if (event.key !== STORAGE_DATA_KEY || event.newValue == null) return;
        if (applyData(event.newValue) && state.currentRole) {
            renderApp();
        }
    });

    document.getElementById('btn-enter').addEventListener('click', () => showScreen(screenProfiles));
    document.getElementById('back-login').addEventListener('click', () => showScreen(screenLogin));
    document.getElementById('back-profiles').addEventListener('click', handleHeaderBack);
    document.getElementById('back-to-profiles').addEventListener('click', () => showScreen(screenProfiles));

    const signupBtn = document.getElementById('btn-signup');
    if (signupBtn) signupBtn.addEventListener('click', () => showScreen(screenSignup));
    const signupBack = document.getElementById('back-signup');
    if (signupBack) signupBack.addEventListener('click', () => showScreen(screenLogin));
    const signupToLogin = document.getElementById('signup-to-login');
    if (signupToLogin) signupToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen(screenLogin);
    });
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = signupForm.role?.value;
            if (role) {
                selectRole(role);
            } else {
                showScreen(screenProfiles);
            }
        });
    }

    const libUploadBtn = document.getElementById('library-upload-btn');
    if (libUploadBtn) libUploadBtn.addEventListener('click', openUploadScreen);

    const switcherBtn = document.getElementById('project-switcher-btn');
    if (switcherBtn) {
        switcherBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProjectSwitcher();
        });
    }
    document.addEventListener('click', (e) => {
        if (!state.projectSwitcherOpen) return;
        const wrap = document.getElementById('project-switcher');
        if (wrap && !wrap.contains(e.target)) {
            state.projectSwitcherOpen = false;
            renderProjectSwitcher();
        }
    });

    document.querySelectorAll('.profile-card').forEach(card => {
        card.addEventListener('click', () => {
            selectRole(card.dataset.role);
        });
    });

    roleSwitcher.addEventListener('change', event => {
        selectRole(event.target.value);
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    chatBubble.addEventListener('click', openChat);
    chatCloseBtn.addEventListener('click', closeChat);
    chatBackdrop.addEventListener('click', closeChat);
    chatForm.addEventListener('submit', handleChatSubmit);

    planViewerCloseBtn.addEventListener('click', closePlanViewer);
    const processCloseBtn = document.getElementById('process-detail-close');
    if (processCloseBtn) processCloseBtn.addEventListener('click', closeProcessDetail);
    const tareasCloseBtn = document.getElementById('tareas-detail-close');
    if (tareasCloseBtn) tareasCloseBtn.addEventListener('click', closeTareasDetail);
    const historyCloseBtn = document.getElementById('history-detail-close');
    if (historyCloseBtn) historyCloseBtn.addEventListener('click', closeHistoryDetail);
    const passportCloseBtn = document.getElementById('passport-detail-close');
    if (passportCloseBtn) passportCloseBtn.addEventListener('click', closePassportDetail);
    const contactCloseBtn = document.getElementById('contact-detail-close');
    if (contactCloseBtn) contactCloseBtn.addEventListener('click', closeContactDetail);
    const milestoneCloseBtn = document.getElementById('milestone-detail-close');
    if (milestoneCloseBtn) milestoneCloseBtn.addEventListener('click', closeMilestoneDetail);
    uploadScreenCloseBtn.addEventListener('click', () => {
        docsForm.uploading = false;
        closeUploadScreen();
    });

    pickerCancelBtn.addEventListener('click', closeUploadPicker);
    uploadPickerEl.addEventListener('click', (event) => {
        if (event.target === uploadPickerEl) closeUploadPicker();
    });
    uploadPickerEl.querySelectorAll('[data-source]').forEach(button => {
        button.addEventListener('click', () => {
            startUploadSimulation(button.dataset.source);
        });
    });

    // Picker: búsqueda y filtro
    const pickerSearch = document.querySelector('#screen-project-picker .obra-picker__search input');
    if (pickerSearch) {
        pickerSearch.addEventListener('input', applyPickerFilters);
    }
    const pickerFilterBtn = document.getElementById('picker-filter-btn');
    const pickerFilterMenu = document.getElementById('picker-filter-menu');
    if (pickerFilterBtn && pickerFilterMenu) {
        pickerFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = pickerFilterMenu.hidden;
            pickerFilterMenu.hidden = !willOpen;
            pickerFilterBtn.setAttribute('aria-expanded', String(willOpen));
        });
        document.addEventListener('click', (e) => {
            if (!pickerFilterMenu.hidden && !e.target.closest('.obra-picker__filter-wrap')) {
                closePickerFilterMenu();
            }
        });
    }

    // Acciones globales (logout, add property/obra, profile rows)
    document.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        if (action === 'logout') {
            state.currentRole = null;
            state.currentProject = null;
            state.activeTab = 'home';
            state.projectSwitcherOpen = false;
            persistSession();
            showScreen(screenLogin);
        } else if (action === 'add-property' || action === 'add-obra') {
            alert(action === 'add-property'
                ? 'Agregar propiedad: el flujo se habilita cuando recibas la invitación del desarrollador.'
                : 'Agregar obra: completá los datos en el formulario (próximamente).');
        } else if (action === 'goto-history') {
            closeProcessDetail();
            closeTareasDetail();
            closeHistoryDetail();
            closePassportDetail();
            closeContactDetail();
            switchTab('history');
        } else if (action === 'goto-notifications') {
            closeProcessDetail();
            closeTareasDetail();
            closeHistoryDetail();
            closePassportDetail();
            closeContactDetail();
            switchTab('notifications');
        } else if (action === 'goto-docs') {
            closeProcessDetail();
            closeTareasDetail();
            closeHistoryDetail();
            closePassportDetail();
            closeContactDetail();
            switchTab('library');
        } else if (action === 'open-process') {
            openProcessDetail();
        } else if (action === 'goto-picker') {
            state.currentProject = null;
            state.projectSwitcherOpen = false;
            renderProjectPicker();
            showScreen(screenProjectPicker);
        } else if (action === 'open-tareas') {
            openTareasDetail();
        } else if (action === 'open-history') {
            openHistoryDetail();
        } else if (action === 'open-pasaporte') {
            openPassportDetail();
        } else if (action === 'download-pasaporte') {
            downloadPasaporte();
        } else if (action === 'open-contact') {
            openContactDetail();
        } else if (action === 'open-milestone') {
            openMilestoneDetail();
        } else if (action === 'send-contact') {
            sendHumanContact(actionEl.dataset.contactRole);
        } else if (action === 'call-contact') {
            showToast('Llamada solicitada. El contacto recibirá el aviso.');
        } else if (action === 'download-doc-from-versions') {
            const doc = state.documents.find(item => item.id === actionEl.dataset.docId);
            if (doc) downloadDocument(doc);
        } else if (action === 'notify-tech') {
            const remito = state.remitos.find(r => r.id === actionEl.dataset.remitoId);
            if (remito && remito.status === 'pendiente') {
                remito.status = 'solicitado';
                addNotification({
                    type: 'remito',
                    title: 'Remito por cargar',
                    message: `La desarrolladora necesita el remito "${remito.name}". Cargalo desde Tareas.`,
                    targets: ['architect'],
                    context: { tab: 'tareas' },
                    projectId: remito.projectId
                });
                renderApp();
                openTareasDetail();
                showToast('Equipo técnico notificado.');
            }
        } else if (action === 'ver-remito') {
            const docId = actionEl.dataset.docId;
            if (docId) {
                closeTareasDetail();
                openPlanViewer(docId);
            }
        }
    });

    // Restaura la sesión: si la página se refresca, seguís donde estabas.
    if (state.currentRole) {
        roleSwitcher.value = state.currentRole;
        if (state.currentRole === 'owner' && !state.currentProject) {
            state.currentProject = 'patria';
        }
        if (!state.currentProject) {
            renderProjectPicker();
            showScreen(screenProjectPicker);
        } else {
            renderApp();
            showScreen(screenApp);
        }
    } else {
        showScreen(screenLogin);
    }
}

document.addEventListener('DOMContentLoaded', boot);

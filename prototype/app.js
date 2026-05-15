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
    TECH_REPLY_ADDED: 'Respuesta del arquitecto',
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
    { id: 'memoria', label: 'Memoria descriptiva', folder: 'Documentos técnicos' },
    { id: 'pliego', label: 'Pliego técnico', folder: 'Documentos técnicos' },
    { id: 'computo', label: 'Cómputo y presupuesto', folder: 'Presupuestos' },
    { id: 'contrato', label: 'Contrato', folder: 'Legales' },
    { id: 'seguro', label: 'Seguro / ART', folder: 'Legales' },
    { id: 'otro', label: 'Otro', folder: 'Otros' }
];

function docTypeLabel(doc) {
    if (doc.typeId) {
        const found = DOC_TYPES.find(item => item.id === doc.typeId);
        if (found) return found.label;
    }
    return doc.folder || 'Documento';
}

const ROLES = {
    developer: {
        id: 'developer',
        label: 'Desarrolladora',
        homeTitle: 'Mis obras'
    },
    architect: {
        id: 'architect',
        label: 'Arquitecto',
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
    history: 'Historial'
};

function tabTitleFor(tabId) {
    if (tabId === 'docs' && state.currentRole === 'owner') return 'Mis documentos';
    return TAB_TITLES[tabId] || '';
}

const state = {
    currentRole: null,
    currentProject: 'patria',
    activeTab: 'home',
    libraryGrouping: 'type',
    libraryFilterOpen: false,
    libraryFolder: null,
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
            ownerUnit: 'Unidad 9C',
            pendingActions: 1,
            fieldTasks: 2,
            progress: 41,
            milestones: [
                { text: 'Demolición y nivelación', status: 'done' },
                { text: 'Hormigonado de losa', status: 'in_progress' },
                { text: 'Definición de cocina', status: 'pending' }
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
            context: { tab: 'history' },
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
const screenApp = document.getElementById('screen-app');
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
    source: null,
    uploading: false,
    freshDocId: null
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
    if (roleId === 'architect') return 'Arquitecto';
    if (roleId === 'owner') return 'Propietario';
    return 'Sistema';
}

function showScreen(target) {
    [screenLogin, screenProfiles, screenApp].forEach(screen => screen.classList.remove('active'));
    target.classList.add('active');
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
    renderApp();
    showScreen(screenApp);
}

function switchTab(tabId) {
    if (state.activeTab === 'library' && tabId !== 'library') {
        state.libraryFolder = null;
        state.libraryFilterOpen = false;
    }
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

    if (notification.context?.tab === 'plan') {
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
            switchTab('docs');
            openPlanViewer(docId);
            return;
        }
    }

    switchTab(notification.context?.tab || 'home');
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

function createDocument({ typeId, name, observation, source, fileName }) {
    const docType = DOC_TYPES.find(item => item.id === typeId);
    if (!docType) return null;

    const newDoc = {
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId: state.currentProject,
        name: name || docType.label,
        typeId,
        folder: docType.folder,
        observation: observation || '',
        version: 1,
        readOnly: false,
        final: false,
        uploadedBy: state.currentRole,
        source,
        fileName,
        createdAt: isoNow()
    };

    state.documents.unshift(newDoc);

    pushVersionEvent(EVENT_TYPES.UPLOAD_CREATED, {
        actorRole: state.currentRole,
        documentId: newDoc.id,
        text: `${roleLabel(state.currentRole)} cargó "${newDoc.name}" (${docType.label}).`
    });

    const targets = ['developer', 'architect', 'owner'].filter(role => role !== state.currentRole);
    addNotification({
        type: 'document',
        title: 'Documento nuevo',
        message: `${docType.label}: "${newDoc.name}".`,
        targets,
        context: { tab: 'docs' },
        projectId: state.currentProject
    });

    return newDoc;
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
    const slug = docsForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'documento';
    const fileName = docsForm.source === 'camera'
        ? `foto-${slug}-${Date.now()}.jpg`
        : `${slug}.pdf`;

    const newDoc = createDocument({
        typeId: docsForm.typeId,
        name: docsForm.name,
        observation: docsForm.observation,
        source: docsForm.source,
        fileName
    });

    docsForm.typeId = '';
    docsForm.name = '';
    docsForm.observation = '';
    docsForm.source = null;
    docsForm.uploading = false;
    docsForm.freshDocId = newDoc ? newDoc.id : null;

    closeUploadScreen();
    renderApp();
    showToast('Documento subido.');

    if (newDoc) {
        setTimeout(() => {
            if (docsForm.freshDocId === newDoc.id) {
                docsForm.freshDocId = null;
                renderDocs();
                attachEventsInActiveTab();
            }
        }, 3000);
    }
}

function syncDocsFormButton() {
    const btn = document.getElementById('upload-form-cta');
    if (!btn) return;
    const typeId = document.getElementById('upload-form-type')?.value || '';
    const name = (document.getElementById('upload-form-name')?.value || '').trim();
    btn.disabled = !typeId || !name;
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
        context: { tab: 'docs', threadId: thread.id, documentId: thread.documentId },
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
        showToast('Ya consultaste al arquitecto.');
        return;
    }

    const thread = activeThread();
    if (!thread) return;

    thread.comments.push({
        id: `comment-dev-${Date.now()}`,
        authorRole: 'developer',
        text: '@Arquitecto, ¿podemos mover esa pared?',
        type: 'mention',
        createdAt: isoNow()
    });

    state.mentionDone = true;

    pushVersionEvent(EVENT_TYPES.COMMENT_ADDED, {
        actorRole: 'developer',
        documentId: thread.documentId,
        text: 'La desarrolladora consultó al arquitecto.'
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
    showToast('Arquitecto notificado.');
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
        text: 'El arquitecto respondió y marcó la columna en el plano.'
    });

    addNotification({
        type: 'comment',
        title: 'Respuesta del arquitecto',
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
        home.innerHTML = `
            <article class="section-card">
                <h3 class="section-title">Mis obras</h3>
                <p class="section-sub">Tocá una obra para abrirla.</p>
                <div>${projectList}</div>
            </article>
            <article class="section-card">
                <h3 class="section-title">Avance de ${project.name}</h3>
                ${milestones}
            </article>
        `;
    }

    if (role === 'architect') {
        home.innerHTML = `
            <article class="section-card">
                <h3 class="section-title">Mis obras</h3>
                <p class="section-sub">Tocá una obra para ver tus tareas.</p>
                <div>${projectList}</div>
            </article>
            <article class="section-card">
                <h3 class="section-title">Mis tareas en ${project.name}</h3>
                <div class="list-row">
                    <div>
                        <div class="list-main">Remitos por cargar</div>
                        <div class="list-sub">Cargalos desde la pestaña Docs.</div>
                    </div>
                    <span class="badge badge-action">${project.fieldTasks}</span>
                </div>
            </article>
        `;
    }

    if (role === 'owner') {
        home.innerHTML = `
            <article class="section-card">
                <h3 class="section-title">${project.ownerUnit}</h3>
                <p class="section-sub">${project.name} · Entrega estimada en 3 meses.</p>
                <div class="progress-wrap">
                    <div class="progress-track"><div class="progress-fill" style="width: ${project.progress}%"></div></div>
                    <div class="progress-label">${project.progress}% completado</div>
                </div>
            </article>
            <article class="section-card">
                <h3 class="section-title">Próximos hitos</h3>
                ${milestones}
            </article>
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

    const uploadCtaMarkup = role !== 'owner' ? `
        <article class="section-card">
            <button type="button" class="docs-upload-btn" id="docs-open-upload">
                <i class="fas fa-cloud-arrow-up"></i> Subir documento
            </button>
        </article>
    ` : '';

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

function renderLibrary() {
    const container = document.getElementById('tab-library');
    const role = state.currentRole;
    const project = activeProject();

    if (role === 'owner' || !project) {
        container.innerHTML = '';
        return;
    }

    const projectDocs = state.documents
        .filter(doc => doc.projectId === state.currentProject);

    const grouping = state.libraryGrouping;

    const libraryDocRow = (doc) => {
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
                    <div class="doc-row__meta">
                        <small>${prettyDate(doc.createdAt)} · ${roleLabel(doc.uploadedBy)}</small>
                        <div class="doc-row__actions">
                            <button data-doc-action="comentar" data-doc-id="${doc.id}"><i class="fas fa-message"></i> Comentar</button>
                            <button data-doc-action="descargar" data-doc-id="${doc.id}"><i class="fas fa-download"></i> Descargar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const buildFolders = () => {
        if (grouping === 'type') {
            const folderOrder = [];
            DOC_TYPES.forEach(t => {
                if (!folderOrder.includes(t.folder)) folderOrder.push(t.folder);
            });
            projectDocs.forEach(doc => {
                if (!folderOrder.includes(doc.folder)) folderOrder.push(doc.folder);
            });
            return folderOrder
                .map(folder => {
                    const docs = projectDocs.filter(d => d.folder === folder);
                    if (!docs.length) return null;
                    return { key: `type:${folder}`, label: folder, icon: 'fa-folder', docs, sortAsc: false };
                })
                .filter(Boolean);
        }
        const groups = new Map();
        projectDocs.forEach(doc => {
            const key = new Date(doc.createdAt).toISOString().slice(0, 10);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(doc);
        });
        return [...groups.keys()]
            .sort((a, b) => b.localeCompare(a))
            .map(dateKey => ({
                key: `date:${dateKey}`,
                label: formatDateFolderLabel(dateKey),
                icon: 'fa-calendar-day',
                docs: groups.get(dateKey),
                sortAsc: true
            }));
    };

    const folders = buildFolders();
    const activeFolder = state.libraryFolder ? folders.find(f => f.key === state.libraryFolder) : null;

    if (activeFolder) {
        const sorted = [...activeFolder.docs].sort((a, b) => {
            const diff = new Date(a.createdAt) - new Date(b.createdAt);
            return activeFolder.sortAsc ? diff : -diff;
        });

        container.innerHTML = `
            <article class="section-card folder-detail">
                <button type="button" class="folder-detail__back" id="library-back">
                    <i class="fas fa-chevron-left"></i> Volver a las carpetas
                </button>
                <div class="folder-detail__head">
                    <div class="folder-detail__icon"><i class="fas ${activeFolder.icon}"></i></div>
                    <div class="folder-detail__head-text">
                        <h2>${escapeHtml(activeFolder.label)}</h2>
                        <p>${sorted.length} ${sorted.length === 1 ? 'documento' : 'documentos'}</p>
                    </div>
                </div>
            </article>
            <div class="doc-list">${sorted.map(libraryDocRow).join('')}</div>
        `;
        return;
    }

    const groupingLabel = grouping === 'type' ? 'Por tipo de archivo' : 'Por fecha de subida';

    const foldersMarkup = folders.length
        ? `<div class="folder-grid">${folders.map(folder => `
                <button type="button" class="folder-row" data-open-folder="${escapeHtml(folder.key)}">
                    <span class="folder-row__icon"><i class="fas ${folder.icon}"></i></span>
                    <span class="folder-row__body">
                        <span class="folder-row__name">${escapeHtml(folder.label)}</span>
                        <span class="folder-row__count">${folder.docs.length} ${folder.docs.length === 1 ? 'documento' : 'documentos'}</span>
                    </span>
                    <i class="fas fa-chevron-right folder-row__chevron"></i>
                </button>
            `).join('')}</div>`
        : '<div class="section-card"><p>Todavía no hay documentos en el proyecto.</p></div>';

    container.innerHTML = `
        <article class="section-card">
            <h3 class="section-title">Documentos del Proyecto</h3>
            <div class="filter-wrap">
                <button type="button" class="filter-btn" id="library-filter-btn" aria-haspopup="menu" aria-expanded="${state.libraryFilterOpen}">
                    <i class="fas fa-filter"></i>
                    <span>Filtrar · ${groupingLabel}</span>
                    <i class="fas fa-chevron-down filter-btn__caret"></i>
                </button>
                ${state.libraryFilterOpen ? `
                    <div class="filter-menu" id="library-filter-menu" role="menu">
                        <button type="button" data-group="type" class="${grouping === 'type' ? 'active' : ''}" role="menuitem">
                            <i class="fas fa-folder"></i>
                            <span>Por tipo de archivo</span>
                            ${grouping === 'type' ? '<i class="fas fa-check filter-menu__check"></i>' : ''}
                        </button>
                        <button type="button" data-group="date" class="${grouping === 'date' ? 'active' : ''}" role="menuitem">
                            <i class="fas fa-calendar"></i>
                            <span>Por fecha de subida</span>
                            ${grouping === 'date' ? '<i class="fas fa-check filter-menu__check"></i>' : ''}
                        </button>
                    </div>
                ` : ''}
            </div>
        </article>
        ${foldersMarkup}
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
                        ${DOC_TYPES.map(type => `<option value="${type.id}">${escapeHtml(type.label)}</option>`).join('')}
                    </select>
                </div>
                <div class="docs-form__row">
                    <label for="upload-form-name">Nombre del documento</label>
                    <input id="upload-form-name" type="text" placeholder="Ej. Permiso municipal junio">
                </div>
                <div class="docs-form__row">
                    <label for="upload-form-obs">Observación (opcional)</label>
                    <textarea id="upload-form-obs" placeholder="Notas, contexto, número de expediente…"></textarea>
                </div>
                <button type="button" class="docs-upload-btn" id="upload-form-cta" disabled>
                    <i class="fas fa-cloud-arrow-up"></i> Subir archivo
                </button>
            </div>
        `;

    uploadScreenBody.innerHTML = `
        <article class="section-card">
            <h3 class="section-title">Datos del documento</h3>
            <p class="section-sub">Elegí el tipo, ponele un nombre y después seleccioná la fuente (cámara o archivo).</p>
            ${formMarkup}
        </article>
    `;

    bindUploadScreenEvents();
}

function bindUploadScreenEvents() {
    const typeSelect = document.getElementById('upload-form-type');
    const nameInput = document.getElementById('upload-form-name');
    if (typeSelect) typeSelect.addEventListener('change', syncDocsFormButton);
    if (nameInput) nameInput.addEventListener('input', syncDocsFormButton);

    const cta = document.getElementById('upload-form-cta');
    if (cta) cta.addEventListener('click', openUploadPicker);
}

function openUploadScreen() {
    uploadScreen.open = true;
    docsForm.typeId = '';
    docsForm.name = '';
    docsForm.observation = '';
    docsForm.uploading = false;
    uploadScreenEl.hidden = false;
    chatBubble.classList.add('hidden');
    renderUploadScreen();
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

    const developerActions = (isPlan && role === 'developer') ? `
        <div class="inline-actions">
            <button class="btn-small action" id="developer-mention-cta" ${state.ownerCommentDone && !state.mentionDone ? '' : 'disabled'}>Consultar al arquitecto</button>
            <button class="btn-small olive" id="developer-budget-cta" ${state.mentionDone && !state.budgetRequested ? '' : 'disabled'}>Pedir presupuesto</button>
        </div>
    ` : '';

    const architectActions = (isPlan && role === 'architect') ? `
        <div class="inline-actions">
            <button class="btn-small action" id="architect-reply-cta" ${state.ownerCommentDone && !state.techResponseDone ? '' : 'disabled'}>Responder</button>
        </div>
    ` : '';

    const planPreview = `
        <div id="blueprint-area" class="plan-shell">
            <span class="plan-label">${escapeHtml(doc.folder)}</span>
            ${hasPin ? `<span class="pin-dot" style="left:${thread.pin.x}%; top:${thread.pin.y}%;"></span>` : ''}
            ${draft ? `<span class="pin-dot draft" style="left:${draft.x}%; top:${draft.y}%;"></span>` : ''}
            ${hasRedline ? '<span class="annotation-line"></span>' : ''}
        </div>
    `;

    const docPreview = `
        <div id="blueprint-area" class="doc-shell">
            <span class="doc-shell__type">${escapeHtml(docTypeLabel(doc))}</span>
            <h4 class="doc-shell__name">${escapeHtml(doc.name)}</h4>
            <p class="doc-shell__meta">${escapeHtml(doc.folder)} · ${prettyDate(doc.createdAt)} · ${roleLabel(doc.uploadedBy)}</p>
            ${doc.observation ? `<p class="doc-shell__obs">${escapeHtml(doc.observation)}</p>` : ''}
            <div class="doc-shell__lines"></div>
            ${hasPin ? `<span class="pin-dot" style="left:${thread.pin.x}%; top:${thread.pin.y}%;"></span>` : ''}
            ${draft ? `<span class="pin-dot draft" style="left:${draft.x}%; top:${draft.y}%;"></span>` : ''}
        </div>
    `;

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
        </article>
    `;

    bindPlanViewerEvents();
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

function renderNotifications() {
    const container = document.getElementById('tab-notifications');
    const role = state.currentRole;

    const visible = state.notifications
        .filter(notification => notification.targets.includes(role))
        .filter(notification => notification.projectId === state.currentProject || notification.projectId === 'global')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!visible.length) {
        container.innerHTML = '<div class="section-card"><p>No tenés alertas todavía.</p></div>';
        return;
    }

    container.innerHTML = `
        <article class="section-card">
            <h3 class="section-title">Tus alertas</h3>
            <p class="section-sub">Tocá una alerta para abrir el detalle.</p>
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
    const historyRows = state.versionHistory
        .filter(row => row.projectId === state.currentProject)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!historyRows.length) {
        container.innerHTML = '<div class="section-card"><p>Todavía no hay movimientos.</p></div>';
        return;
    }

    container.innerHTML = `
        <article class="section-card">
            <h3 class="section-title">Historial</h3>
            <p class="section-sub">Cada cambio queda guardado con su fecha y autor.</p>
            <div class="timeline">
                ${historyRows.map(row => `
                    <div class="timeline-item">
                        <h4>${EVENT_LABELS[row.type] || 'Movimiento'}</h4>
                        <p>${escapeHtml(row.text)}</p>
                        <div class="stamp">${roleLabel(row.actorRole)} · ${prettyDate(row.createdAt)}</div>
                    </div>
                `).join('')}
            </div>
        </article>
    `;
}

function updateHeader() {
    const role = ROLES[state.currentRole];
    if (!role) return;

    rolePill.textContent = role.label;
    tabTitle.textContent = state.activeTab === 'home' ? role.homeTitle : tabTitleFor(state.activeTab);

    const showLibrary = state.currentRole !== 'owner';
    const tabBar = document.querySelector('.tab-bar');
    if (tabBar) tabBar.dataset.tabs = showLibrary ? '5' : '4';

    const libraryTab = document.querySelector('.tab-item[data-tab="library"]');
    if (libraryTab) libraryTab.hidden = !showLibrary;

    const docsLabel = document.querySelector('[data-tab-label="docs"]');
    if (docsLabel) docsLabel.textContent = state.currentRole === 'owner' ? 'Documentos' : 'Mis archivos';

    if (!showLibrary && state.activeTab === 'library') {
        state.activeTab = 'home';
    }

    const notifCount = state.notifications
        .filter(notification => notification.targets.includes(state.currentRole))
        .filter(notification => (notification.projectId === state.currentProject || notification.projectId === 'global'))
        .filter(notification => !notification.readBy.includes(state.currentRole)).length;

    const notifTabLabel = document.querySelector('.tab-item[data-tab="notifications"] span');
    notifTabLabel.textContent = notifCount > 0 ? `Alertas (${notifCount})` : 'Alertas';

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
        messages.push({ from: 'bot', text: `Hola. Estoy acá para ayudarte con ${projectName}.` });
        if (!state.ownerCommentDone) {
            messages.push({ from: 'bot', text: 'Por ahora no hay pedidos de cambio. Te aviso cuando aparezca alguno.' });
        } else if (state.ownerCommentDone && !state.mentionDone) {
            messages.push({ from: 'bot', text: 'El propietario pidió un cambio en la cocina. ¿Querés que consulte al arquitecto?' , action: { fn: 'mention', label: 'Consultar al arquitecto' } });
        } else if (state.mentionDone && !state.techResponseDone) {
            messages.push({ from: 'bot', text: 'Ya consulté al arquitecto. Te aviso apenas responda.' });
        } else if (state.techResponseDone && !state.budgetRequested) {
            messages.push({ from: 'bot', text: 'El arquitecto respondió. ¿Querés que prepare un pedido de presupuesto?', action: { fn: 'budget', label: 'Pedir presupuesto' } });
        } else if (state.budgetRequested) {
            messages.push({ from: 'bot', text: 'Listo. El pedido de presupuesto quedó registrado en el Historial.' });
        }
    }

    if (role === 'architect') {
        messages.push({ from: 'bot', text: `Hola. ¿Te ayudo con algo de ${projectName}?` });
        if (state.ownerCommentDone && !state.techResponseDone) {
            messages.push({ from: 'bot', text: 'El propietario consultó por la cocina. Cuando respondas, te conviene sumar una foto del lugar.' });
        }
        if (state.techResponseDone) {
            messages.push({ from: 'bot', text: 'Tu respuesta quedó registrada en el plano y en el historial.' });
        }
    }

    if (role === 'owner') {
        messages.push({ from: 'bot', text: 'Hola. Si tenés alguna duda del plano, mantené el dedo donde quieras comentar.' });
        if (state.ownerCommentDone && !state.techResponseDone) {
            messages.push({ from: 'bot', text: 'Tu consulta ya está en manos del equipo. Te aviso apenas respondan.' });
        }
        if (state.techResponseDone) {
            messages.push({ from: 'bot', text: 'El arquitecto te respondió. Mirá en la pestaña Plano la marca en rojo.' });
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
        chatState.history.push({ from: 'bot', text: 'Listo. Te aviso apenas el arquitecto responda.' });
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
            return { from: 'bot', text: 'Conviene primero consultar al arquitecto sobre el cambio pedido.' };
        }
        return { from: 'bot', text: 'Los presupuestos los maneja la desarrolladora.' };
    }

    if (/arquit/.test(text) && role === 'developer') {
        if (state.mentionDone) return { from: 'bot', text: 'Ya lo consulté. Te aviso cuando responda.' };
        if (state.ownerCommentDone) return { from: 'bot', text: 'Puedo consultarlo por vos.', action: { fn: 'mention', label: 'Consultar al arquitecto' } };
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
        return { from: 'bot', text: 'Los remitos los carga el arquitecto desde Documentos.' };
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
            state.currentProject = button.dataset.projectId;
            state.focusThreadId = null;
            renderApp();
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
        });
    });

    const openUploadBtn = document.getElementById('docs-open-upload');
    if (openUploadBtn) openUploadBtn.addEventListener('click', openUploadScreen);

    document.querySelectorAll('[data-group]').forEach(button => {
        button.addEventListener('click', () => {
            const next = button.dataset.group;
            if (state.libraryGrouping !== next) {
                state.libraryGrouping = next;
                state.libraryFolder = null;
            }
            state.libraryFilterOpen = false;
            renderLibrary();
            attachEventsInActiveTab();
        });
    });

    const filterBtn = document.getElementById('library-filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            state.libraryFilterOpen = !state.libraryFilterOpen;
            renderLibrary();
            attachEventsInActiveTab();
            if (state.libraryFilterOpen) bindFilterMenuOutsideClick();
        });
    }

    document.querySelectorAll('[data-open-folder]').forEach(button => {
        button.addEventListener('click', () => {
            state.libraryFolder = button.dataset.openFolder;
            renderApp();
        });
    });

    const libraryBack = document.getElementById('library-back');
    if (libraryBack) {
        libraryBack.addEventListener('click', () => {
            state.libraryFolder = null;
            renderApp();
        });
    }
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

    tabButtons.forEach(button => button.classList.toggle('active', button.dataset.tab === state.activeTab));
    tabScreens.forEach(screen => screen.classList.toggle('active', screen.id === `tab-${state.activeTab}`));

    updateHeader();
    attachEventsInActiveTab();

    if (planViewer.open) renderPlanViewer();
    if (uploadScreen.open) renderUploadScreen();
    if (chatState.open) renderChat();

    window.obratyState = state;
}

function boot() {
    buildRoleSwitcher();

    document.getElementById('btn-enter').addEventListener('click', () => showScreen(screenProfiles));
    document.getElementById('back-login').addEventListener('click', () => showScreen(screenLogin));
    document.getElementById('back-profiles').addEventListener('click', handleHeaderBack);

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

    showScreen(screenLogin);
}

document.addEventListener('DOMContentLoaded', boot);

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
    history: 'Historial'
};

function tabTitleFor(tabId) {
    if (tabId === 'library') return 'Documentos';
    if (tabId === 'notifications') return 'Comunicados';
    if (tabId === 'history') return 'Mi perfil';
    return TAB_TITLES[tabId] || '';
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
            id: 'doc-plano-4a-cli',
            projectId: 'patria',
            name: 'Plano Unidad 4A — Modificaciones cliente',
            typeId: 'plano',
            folder: 'Planos',
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
    if (roleId === 'architect') return 'Equipo técnico';
    if (roleId === 'escribania') return 'Escribanía';
    if (roleId === 'owner') return 'Propietario';
    return 'Sistema';
}

function showScreen(target) {
    [screenLogin, screenProfiles, screenProjectPicker, screenApp].forEach(screen => screen.classList.remove('active'));
    target.classList.add('active');
}

function renderProjectPicker() {
    const list = document.getElementById('project-picker-list');
    if (!list) return;
    const rows = state.projects.map((p, i) => `
        <button type="button" class="dev-obra-row" data-project-id="${p.id}">
            <span class="dev-obra-row__thumb dev-obra-row__thumb--${i % 3}"></span>
            <span class="dev-obra-row__info">
                <strong>${p.name}</strong>
                <small>${p.location}</small>
            </span>
            <span class="dev-obra-row__etapa">${p.etapa}</span>
            <span class="dev-obra-row__avance">
                <span class="dev-obra-row__pct">${p.progress}%</span>
                <span class="progress-track"><span class="progress-fill" style="width:${p.progress}%"></span></span>
            </span>
            <span class="dev-obra-row__pendientes ${p.pendingActions === 0 ? 'is-zero' : ''}">${p.pendingActions}</span>
            <i class="fas fa-chevron-right dev-obra-row__chev"></i>
        </button>
    `).join('');
    list.innerHTML = `
        <div class="dev-obras-table">
            <div class="dev-obras-table__head">
                <span>Obra</span>
                <span>Etapa</span>
                <span>Avance</span>
                <span class="dev-obras-table__pend">Pend.</span>
                <span></span>
            </div>
            ${rows}
        </div>
    `;
    list.querySelectorAll('[data-project-id]').forEach(btn => {
        btn.addEventListener('click', () => selectProject(btn.dataset.projectId));
    });
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
    if (wrap) wrap.hidden = state.currentRole === 'owner';
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
    renderProjectPicker();
    showScreen(screenProjectPicker);
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
        home.innerHTML = `
            <div class="dev-welcome">
                <p class="dev-welcome__role">CONSTRUCTORA</p>
                <h2 class="dev-welcome__greet">Hola, Equipo</h2>
                <p class="dev-welcome__sub">Gestioná todas tus obras desde un solo lugar.</p>
            </div>

            <header class="owner-section-head">
                <h4>Tareas pendientes</h4>
                <a class="owner-section-link tech-link">Ver todas <i class="fas fa-chevron-right"></i></a>
            </header>
            <div class="dev-stats-grid">
                <div class="dev-stat">
                    <span class="dev-stat__icon dev-stat__icon--remito"><i class="fas fa-file-arrow-up"></i></span>
                    <span class="dev-stat__num">5</span>
                    <small>Remitos por cargar</small>
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

            <header class="owner-section-head">
                <h4>Actividad reciente</h4>
                <a class="owner-section-link tech-link">Ver toda la actividad <i class="fas fa-chevron-right"></i></a>
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
            <button type="button" class="tech-project-card" data-project="${p.id}">
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
                <h4>Tareas pendientes</h4>
                <a class="owner-section-link tech-link">Ver todas <i class="fas fa-chevron-right"></i></a>
            </header>
            <div class="tech-task-card">
                <span class="tech-task-card__icon"><i class="fas fa-file-arrow-up"></i></span>
                <div class="tech-task-card__body">
                    <h5>Remitos por cargar</h5>
                    <small>Cargalos desde la pestaña Docs.</small>
                </div>
                <span class="tech-task-card__count">${project.fieldTasks}</span>
            </div>

            <header class="owner-section-head">
                <h4>Accesos rápidos</h4>
            </header>
            <div class="quick-access-grid">
                <button type="button" class="quick-access" data-quick="docs">
                    <span class="quick-access__icon"><i class="far fa-file-lines"></i></span>
                    <span class="quick-access__body">
                        <strong>Documentos</strong>
                        <small>Buscá y consultá toda la documentación de obra.</small>
                    </span>
                    <i class="fas fa-chevron-right quick-access__chev"></i>
                </button>
                <button type="button" class="quick-access" data-quick="tasks">
                    <span class="quick-access__icon"><i class="fas fa-clipboard-check"></i></span>
                    <span class="quick-access__body">
                        <strong>Tareas</strong>
                        <small>Gestioná y actualizá las tareas asignadas.</small>
                    </span>
                    <i class="fas fa-chevron-right quick-access__chev"></i>
                </button>
                <button type="button" class="quick-access" data-quick="upload">
                    <span class="quick-access__icon"><i class="fas fa-cloud-arrow-up"></i></span>
                    <span class="quick-access__body">
                        <strong>Subir documentos</strong>
                        <small>Cargá planos, permisos, contratos y más.</small>
                    </span>
                    <i class="fas fa-chevron-right quick-access__chev"></i>
                </button>
                <button type="button" class="quick-access" data-quick="comms">
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
                <button type="button" class="passport-card__btn">Ver pasaporte <i class="fas fa-chevron-right"></i></button>
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
            { icon: 'fa-solid fa-compass-drafting', title: 'Plano de estructura', date: '10/05' },
            { icon: 'fa-solid fa-shield-halved', title: 'Póliza de seguro de obra', date: '08/05' },
            { icon: 'fa-solid fa-stamp', title: 'Permiso de obra', date: '05/05' },
            { icon: 'fa-solid fa-file-signature', title: 'Contrato con constructora', date: '01/05' }
        ];
        const upcoming = project.ownerUpcoming || [
            { icon: 'fa-trowel-bricks', title: 'Finalización de mampostería', date: '20 de mayo, 2024', status: 'in_progress' },
            { icon: 'fa-door-open', title: 'Colocación de aberturas', date: '05 de junio, 2024', status: 'pending' }
        ];

        const docsGrid = keyDocs.map(d => `
            <button type="button" class="quick-doc">
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

            <article class="process-card">
                <div class="process-card__info">
                    <h4 class="process-card__title">Proceso de obra</h4>
                    <p class="process-card__kicker">Etapa actual</p>
                    <p class="process-card__stage">${stage}</p>
                    <div class="process-card__pct">${stageProgress}%</div>
                    <p class="process-card__pct-label">de avance general</p>
                    <div class="progress-track"><div class="progress-fill" style="width: ${stageProgress}%"></div></div>
                    <p class="process-card__meta"><i class="far fa-calendar"></i> ${lastUpdate}</p>
                    <button type="button" class="btn-pill-primary">Ver proceso completo <i class="fas fa-arrow-right"></i></button>
                </div>
                <div class="process-card__photo"><i class="fas fa-building"></i></div>
            </article>

            <header class="owner-section-head">
                <h4>Lo último en tu obra</h4>
                <a class="owner-section-link">Ver todas las novedades <i class="fas fa-chevron-right"></i></a>
            </header>
            <article class="update-card">
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
                <a class="owner-section-link">Ver todos <i class="fas fa-chevron-right"></i></a>
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
                    <button class="file-card__action" data-doc-action="more" data-doc-id="${doc.id}" aria-label="Más opciones">
                        <i class="fas fa-ellipsis-vertical"></i>
                    </button>
                </div>
            </article>
        `;
    };

    const filtersBar = (extraLabel) => {
        const viewLabel = view === 'type' ? 'Por tipo' : view === 'date' ? 'Por fecha' : 'Lista';
        return `
            <header class="files-head">
                <h2 class="files-head__title">Mis archivos</h2>
                <span class="files-head__role">${ROLES[state.currentRole]?.label || ''} <i class="fas fa-chevron-down"></i></span>
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
            <button class="btn-small action" id="developer-mention-cta" ${state.ownerCommentDone && !state.mentionDone ? '' : 'disabled'}>Consultar al equipo técnico</button>
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

    if (state.currentRole) {
        const roleLabelShort = state.currentRole === 'owner' ? 'Propietaria' : (state.currentRole === 'architect' ? 'Equipo técnico' : 'Desarrolladora');
        const subtitle = state.currentRole === 'owner'
            ? 'Gestioná tu identidad y tus propiedades'
            : 'Gestioná tu identidad y tus obras';
        const propertiesLabel = state.currentRole === 'owner' ? 'Mis propiedades' : 'Mis obras';
        const propertiesCtaLabel = state.currentRole === 'owner' ? 'Agregar propiedad' : 'Agregar obra';
        const exportTitle = state.currentRole === 'owner' ? 'Exportar Pasaporte Digital' : 'Exportar pasaporte de obra';
        const exportText = state.currentRole === 'owner'
            ? 'Descargá el pasaporte digital de tu propiedad con toda su documentación oficial.'
            : 'Descargá el pasaporte digital de la obra con toda su documentación oficial.';
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
                    <p class="profile-identity__location"><i class="fas fa-location-dot"></i> Torre Olivares · Unidad 7B</p>
                    <span class="profile-verified"><i class="fas fa-circle-check"></i> Identidad verificada</span>
                </div>
            </article>

            <header class="owner-section-head">
                <h4>${propertiesLabel}</h4>
                <a class="owner-section-link">Ver todas <i class="fas fa-chevron-right"></i></a>
            </header>
            <div class="property-stack">
                <button type="button" class="property-row">
                    <span class="property-row__thumb property-row__thumb--olivares"></span>
                    <span class="property-row__body">
                        <h5>Torre Olivares</h5>
                        <p>Unidad 7B · Propietaria <span class="pill-soft">Principal</span></p>
                    </span>
                    <i class="fas fa-chevron-right property-row__chev"></i>
                </button>
                <button type="button" class="property-row">
                    <span class="property-row__thumb property-row__thumb--central"></span>
                    <span class="property-row__body">
                        <h5>Torre Central</h5>
                        <p>Unidad 3A · Inversora</p>
                    </span>
                    <i class="fas fa-chevron-right property-row__chev"></i>
                </button>
                <button type="button" class="add-property-btn">
                    <i class="fas fa-plus"></i> ${propertiesCtaLabel}
                </button>
            </div>

            <header class="owner-section-head">
                <h4>Actividad reciente</h4>
                <a class="owner-section-link">Ver todo <i class="fas fa-chevron-right"></i></a>
            </header>
            <div class="activity-list">
                <div class="activity-row">
                    <span class="activity-row__icon activity-row__icon--doc"><i class="fas fa-file-circle-check"></i></span>
                    <div class="activity-row__body">
                        <h5>Documento firmado</h5>
                        <small>Manual de uso · Ascensor</small>
                    </div>
                    <small class="activity-row__time">Hace 2 días</small>
                </div>
                <div class="activity-row">
                    <span class="activity-row__icon activity-row__icon--check"><i class="fas fa-shield-halved"></i></span>
                    <div class="activity-row__body">
                        <h5>Garantía consultada</h5>
                        <small>Bomba presurizadora</small>
                    </div>
                    <small class="activity-row__time">Ayer</small>
                </div>
                <div class="activity-row">
                    <span class="activity-row__icon activity-row__icon--bell"><i class="fas fa-bullhorn"></i></span>
                    <div class="activity-row__body">
                        <h5>Comunicado leído</h5>
                        <small>Citra · Avance semanal</small>
                    </div>
                    <small class="activity-row__time">3 días</small>
                </div>
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
                <button class="profile-list__row" type="button">
                    <span class="profile-list__icon"><i class="fas fa-user-group"></i></span>
                    <span class="profile-list__label">
                        Permisos y accesos
                        <small>Personas con acceso a tus propiedades</small>
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
                <button class="export-card__btn" type="button"><i class="fas fa-download"></i> Exportar</button>
            </article>
        `;
        return;
    }

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

    const header = document.querySelector('#screen-app .screen-header');
    const brandHeader = document.getElementById('brand-header');
    const useBrand = Boolean(state.currentRole);
    if (header) {
        header.classList.toggle('screen-header--brand', useBrand);
        header.classList.remove('screen-header--hidden');
    }
    if (brandHeader) brandHeader.hidden = !useBrand;

    const tabBar = document.querySelector('.tab-bar');
    if (tabBar) tabBar.dataset.tabs = '4';

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

    notifTabLabel.textContent = notifCount > 0 ? `Comunicados (${notifCount})` : 'Comunicados';
    notifTabIcon.className = 'far fa-comment-dots';
    notifTabIcon.dataset.tabIcon = 'notifications';
    historyTabLabel.textContent = 'Mi perfil';
    historyTabIcon.className = 'far fa-user';
    historyTabIcon.dataset.tabIcon = 'history';

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
            messages.push({ from: 'bot', text: 'El propietario pidió un cambio en la cocina. ¿Querés que consulte al equipo técnico?' , action: { fn: 'mention', label: 'Consultar al equipo técnico' } });
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
    renderProjectSwitcher();
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
    document.getElementById('back-to-profiles').addEventListener('click', () => showScreen(screenProfiles));

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

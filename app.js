// ===== ระบบจัดการแผนการสอน - โรงเรียนลำไพลศานติวิทย์ =====

// ===== Initial Data Setup =====
const INITIAL_USERS = [
    { id: 1, username: 'teacher1', password: '1234', name: 'นายสมชาย ใจดี', role: 'teacher', subject: 'คณิตศาสตร์', position: 'ครูชำนาญการ', department: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์', section: 'มัธยม', teachingLevel: 'มัธยมศึกษาตอนต้น (ม.1-3)', isActive: true },
    { id: 2, username: 'teacher2', password: '1234', name: 'นางสาวสมหญิง รักเรียน', role: 'teacher', subject: 'ภาษาไทย', position: 'ครู', department: 'กลุ่มสาระการเรียนรู้ภาษาไทย', section: 'ประถม', teachingLevel: 'ประถมศึกษาตอนปลาย (ป.4-6)', isActive: true },
    { id: 3, username: 'teacher3', password: '1234', name: 'นายวิชัย เก่งกาจ', role: 'teacher', subject: 'วิทยาศาสตร์', position: 'ครูชำนาญการพิเศษ', department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี', section: 'มัธยม', teachingLevel: 'มัธยมศึกษาตอนปลาย (ม.4-6)', isActive: true },
    { id: 4, username: 'teacher4', password: '1234', name: 'นางสาวน้องนุช อนุบาล', role: 'teacher', subject: 'ปฐมวัย', position: 'ครู', department: 'ปฐมวัย', section: 'อนุบาล', teachingLevel: 'อนุบาล', isActive: true },
    { id: 5, username: 'academic_anuban', password: '1234', name: 'นางมาลี ดูแลเด็ก', role: 'academic', subject: '', position: 'หัวหน้าแผนก', department: 'ฝ่ายวิชาการ', section: 'อนุบาล', isActive: true },
    { id: 6, username: 'academic_prathom', password: '1234', name: 'นายสมศักดิ์ ประถมศึกษา', role: 'academic', subject: '', position: 'หัวหน้าแผนก', department: 'ฝ่ายวิชาการ', section: 'ประถม', isActive: true },
    { id: 7, username: 'academic_matthayom', password: '1234', name: 'นางสาวพิมพ์ใจ วิชาการ', role: 'academic', subject: '', position: 'หัวหน้าแผนก', department: 'ฝ่ายวิชาการ', section: 'มัธยม', isActive: true },
    { id: 8, username: 'director', password: '1234', name: 'ดร.ประยุทธ์ ผู้นำดี', role: 'director', subject: '', position: 'ผู้อำนวยการ', department: '', section: 'ทั้งหมด', isActive: true }
];

const SECTIONS = ['อนุบาล', 'ประถม', 'มัธยม'];

const SUBJECTS = [
    'คณิตศาสตร์', 'ภาษาไทย', 'ภาษาอังกฤษ', 'วิทยาศาสตร์', 'สังคมศึกษา',
    'สุขศึกษาและพลศึกษา', 'ศิลปะ', 'การงานอาชีพ', 'เทคโนโลยี'
];

const GRADE_LEVELS = [
    'อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3',
    'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6',
    'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'
];

const STATUS_LABELS = {
    draft: 'ร่าง',
    pending: 'รอวิชาการตรวจ',
    academic_approved: 'วิชาการผ่าน - รอ ผอ.อนุมัติ',
    approved: 'อนุมัติแล้ว',
    revision_academic: 'ส่งแก้ไข (วิชาการ)',
    revision_director: 'ส่งแก้ไข (ผอ.)'
};

const ROLE_LABELS = {
    teacher: 'ครู',
    academic: 'ฝ่ายวิชาการ',
    director: 'ผู้อำนวยการ'
};

// ===== State Management =====
let currentUser = null;
let currentPage = 'dashboard';

// ===== LocalStorage Functions =====
function initializeData() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem('plans')) {
        localStorage.setItem('plans', JSON.stringify([]));
    }
    if (!localStorage.getItem('reflections')) {
        localStorage.setItem('reflections', JSON.stringify([]));
    }
    if (!localStorage.getItem('comments')) {
        localStorage.setItem('comments', JSON.stringify([]));
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function getPlans() {
    return JSON.parse(localStorage.getItem('plans') || '[]');
}

function savePlans(plans) {
    localStorage.setItem('plans', JSON.stringify(plans));
}

function getReflections() {
    return JSON.parse(localStorage.getItem('reflections') || '[]');
}

function saveReflections(reflections) {
    localStorage.setItem('reflections', JSON.stringify(reflections));
}

function getComments() {
    return JSON.parse(localStorage.getItem('comments') || '[]');
}

function saveComments(comments) {
    localStorage.setItem('comments', JSON.stringify(comments));
}

// ===== Authentication =====
function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('appContainer').classList.remove('active');
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        return true;
    }
    return false;
}

function fillDemo(username, password) {
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = password;
}

// ===== UI Functions =====
function showApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('appContainer').classList.add('active');
    
    // Update user info
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('currentUserRole').textContent = ROLE_LABELS[currentUser.role];
    
    // Show/hide menu based on role
    updateMenuVisibility();
    
    // Set current date
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('th-TH', options);
    
    // Load dashboard
    navigateTo('dashboard');
}

function updateMenuVisibility() {
    const teacherMenu = document.querySelector('.teacher-menu');
    const academicMenu = document.querySelector('.academic-menu');
    const directorMenu = document.querySelector('.director-menu');
    
    // All roles can see teacher menu (to see their own work)
    teacherMenu.style.display = 'block';
    
    // Academic menu
    if (currentUser.role === 'academic' || currentUser.role === 'director') {
        academicMenu.style.display = 'block';
    } else {
        academicMenu.style.display = 'none';
    }
    
    // Director menu
    if (currentUser.role === 'director') {
        directorMenu.style.display = 'block';
    } else {
        directorMenu.style.display = 'none';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function navigateTo(page) {
    currentPage = page;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        'dashboard': 'หน้าหลัก',
        'create-plan': 'สร้างแผนการสอน',
        'my-plans': 'แผนการสอนของฉัน',
        'create-reflection': 'บันทึกหลังสอน',
        'my-reflections': 'บันทึกของฉัน',
        'review-plans': 'ตรวจแผนการสอน',
        'review-reflections': 'ตรวจบันทึกหลังสอน',
        'approve-plans': 'อนุมัติแผนการสอน',
        'approve-reflections': 'อนุมัติบันทึกหลังสอน',
        'statistics': 'รายงานสถิติ',
        'my-statistics': 'สถิติของฉัน',
        'user-management': 'จัดการผู้ใช้งาน'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'หน้าหลัก';
    
    // Load page content
    loadPageContent(page);
    
    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// ===== Date Helpers =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getWeekRange(startDate) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 13); // 2 weeks
    return `${formatDate(start)} - ${formatDate(end)}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== Status Badge Helper =====
function getStatusBadge(status) {
    const statusClasses = {
        draft: 'status-draft',
        pending: 'status-pending',
        academic_approved: 'status-academic-approved',
        approved: 'status-approved',
        revision_academic: 'status-revision',
        revision_director: 'status-revision'
    };
    return `<span class="status-badge ${statusClasses[status] || 'status-draft'}">${STATUS_LABELS[status] || status}</span>`;
}

// ===== Page Content Loader =====
function loadPageContent(page) {
    const contentArea = document.getElementById('contentArea');
    
    switch(page) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'create-plan':
            renderCreatePlan();
            break;
        case 'my-plans':
            renderMyPlans();
            break;
        case 'create-reflection':
            renderCreateReflection();
            break;
        case 'my-reflections':
            renderMyReflections();
            break;
        case 'review-plans':
            renderReviewPlans();
            break;
        case 'review-reflections':
            renderReviewReflections();
            break;
        case 'approve-plans':
            renderApprovePlans();
            break;
        case 'approve-reflections':
            renderApproveReflections();
            break;
        case 'statistics':
            renderStatistics();
            break;
        case 'my-statistics':
            renderMyStatistics();
            break;
        case 'user-management':
            renderUserManagement();
            break;
        default:
            renderDashboard();
    }
}

// ===== Dashboard =====
function renderDashboard() {
    const plans = getPlans();
    const reflections = getReflections();
    
    let myPlans, myReflections, pendingPlans, pendingReflections;
    
    if (currentUser.role === 'teacher') {
        myPlans = plans.filter(p => p.teacherId === currentUser.id);
        myReflections = reflections.filter(r => r.teacherId === currentUser.id);
        pendingPlans = myPlans.filter(p => p.status.includes('revision'));
        pendingReflections = myReflections.filter(r => r.status.includes('revision'));
    } else if (currentUser.role === 'academic') {
        pendingPlans = plans.filter(p => p.status === 'pending');
        pendingReflections = reflections.filter(r => r.status === 'pending');
        myPlans = plans;
        myReflections = reflections;
    } else {
        pendingPlans = plans.filter(p => p.status === 'academic_approved');
        pendingReflections = reflections.filter(r => r.status === 'academic_approved');
        myPlans = plans;
        myReflections = reflections;
    }
    
    const approvedPlans = plans.filter(p => p.status === 'approved').length;
    const approvedReflections = reflections.filter(r => r.status === 'approved').length;
    
    let statsHtml = '';
    
    if (currentUser.role === 'teacher') {
        statsHtml = `
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fas fa-file-alt"></i></div>
                <div class="stat-content">
                    <h3>${myPlans.length}</h3>
                    <p>แผนการสอนทั้งหมด</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
                <div class="stat-content">
                    <h3>${myPlans.filter(p => p.status === 'approved').length}</h3>
                    <p>แผนที่อนุมัติแล้ว</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
                <div class="stat-content">
                    <h3>${myPlans.filter(p => p.status === 'pending' || p.status === 'academic_approved').length}</h3>
                    <p>รอการตรวจสอบ</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div>
                <div class="stat-content">
                    <h3>${pendingPlans.length}</h3>
                    <p>ต้องแก้ไข</p>
                </div>
            </div>
        `;
    } else if (currentUser.role === 'academic') {
        statsHtml = `
            <div class="stat-card">
                <div class="stat-icon orange"><i class="fas fa-clipboard-list"></i></div>
                <div class="stat-content">
                    <h3>${pendingPlans.length}</h3>
                    <p>แผนรอตรวจ</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fas fa-book"></i></div>
                <div class="stat-content">
                    <h3>${pendingReflections.length}</h3>
                    <p>บันทึกรอตรวจ</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fas fa-check-double"></i></div>
                <div class="stat-content">
                    <h3>${plans.filter(p => p.status === 'academic_approved').length}</h3>
                    <p>ส่ง ผอ. แล้ว</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fas fa-trophy"></i></div>
                <div class="stat-content">
                    <h3>${approvedPlans}</h3>
                    <p>อนุมัติทั้งหมด</p>
                </div>
            </div>
        `;
    } else {
        statsHtml = `
            <div class="stat-card">
                <div class="stat-icon orange"><i class="fas fa-clipboard-check"></i></div>
                <div class="stat-content">
                    <h3>${pendingPlans.length}</h3>
                    <p>แผนรออนุมัติ</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fas fa-tasks"></i></div>
                <div class="stat-content">
                    <h3>${pendingReflections.length}</h3>
                    <p>บันทึกรออนุมัติ</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fas fa-file-alt"></i></div>
                <div class="stat-content">
                    <h3>${approvedPlans}</h3>
                    <p>แผนอนุมัติแล้ว</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fas fa-book"></i></div>
                <div class="stat-content">
                    <h3>${approvedReflections}</h3>
                    <p>บันทึกอนุมัติแล้ว</p>
                </div>
            </div>
        `;
    }
    
    // Recent activities
    const recentPlans = [...plans].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
    const users = getUsers();
    
    let recentHtml = '';
    if (recentPlans.length > 0) {
        recentHtml = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">แผนการสอนล่าสุด</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ครูผู้สอน</th>
                                    <th>วิชา</th>
                                    <th>ระดับชั้น</th>
                                    <th>สัปดาห์</th>
                                    <th>สถานะ</th>
                                    <th>อัปเดต</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentPlans.map(plan => {
                                    const teacher = users.find(u => u.id === plan.teacherId);
                                    return `
                                        <tr>
                                            <td>${teacher ? teacher.name : 'ไม่ทราบ'}</td>
                                            <td>${plan.subject}</td>
                                            <td>${plan.gradeLevel}</td>
                                            <td>${getWeekRange(plan.weekStart)}</td>
                                            <td>${getStatusBadge(plan.status)}</td>
                                            <td>${formatDateTime(plan.updatedAt)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            <div class="stats-grid">
                ${statsHtml}
            </div>
            ${recentHtml}
            
            ${currentUser.role === 'teacher' ? `
                <div class="btn-group" style="margin-top: 24px;">
                    <button class="btn btn-primary btn-lg" onclick="navigateTo('create-plan')">
                        <i class="fas fa-plus"></i> สร้างแผนการสอนใหม่
                    </button>
                    <button class="btn btn-secondary btn-lg" onclick="navigateTo('create-reflection')">
                        <i class="fas fa-edit"></i> เขียนบันทึกหลังสอน
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

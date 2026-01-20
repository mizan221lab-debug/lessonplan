// ===== app-users.js - User Management System =====

// ===== User Management for Admin/Director =====

const SECTIONS_LIST = ['อนุบาล', 'ประถม', 'มัธยม'];

const POSITIONS = [
    'ครูผู้ช่วย',
    'ครู',
    'ครูชำนาญการ',
    'ครูชำนาญการพิเศษ',
    'ครูเชี่ยวชาญ',
    'หัวหน้ากลุ่มสาระ',
    'หัวหน้าแผนก',
    'หัวหน้าฝ่าย',
    'รองผู้อำนวยการ',
    'ผู้อำนวยการ'
];

const DEPARTMENTS = [
    'กลุ่มสาระการเรียนรู้ภาษาไทย',
    'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
    'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
    'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนาและวัฒนธรรม',
    'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ',
    'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา',
    'กลุ่มสาระการเรียนรู้ศิลปะ',
    'กลุ่มสาระการเรียนรู้การงานอาชีพ',
    'ฝ่ายวิชาการ',
    'ฝ่ายบริหารงานบุคคล',
    'ฝ่ายบริหารทั่วไป',
    'ฝ่ายงบประมาณ'
];

const TEACHING_LEVELS = [
    'อนุบาล',
    'ประถมศึกษาตอนต้น (ป.1-3)',
    'ประถมศึกษาตอนปลาย (ป.4-6)',
    'มัธยมศึกษาตอนต้น (ม.1-3)',
    'มัธยมศึกษาตอนปลาย (ม.4-6)',
    'ทุกระดับชั้น'
];

// ===== Render User Management Page =====
function renderUserManagement() {
    const users = getUsers();
    const teachers = users.filter(u => u.role === 'teacher');
    const academics = users.filter(u => u.role === 'academic');
    const directors = users.filter(u => u.role === 'director');
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="fas fa-chalkboard-teacher"></i></div>
                    <div class="stat-content"><h3>${teachers.length}</h3><p>ครูผู้สอน</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange"><i class="fas fa-user-tie"></i></div>
                    <div class="stat-content"><h3>${academics.length}</h3><p>ฝ่ายวิชาการ</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-user-shield"></i></div>
                    <div class="stat-content"><h3>${directors.length}</h3><p>ผู้บริหาร</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fas fa-users"></i></div>
                    <div class="stat-content"><h3>${users.length}</h3><p>ผู้ใช้ทั้งหมด</p></div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">จัดการผู้ใช้งาน</h3>
                    <button class="btn btn-primary btn-sm" onclick="showAddUserModal()">
                        <i class="fas fa-plus"></i> เพิ่มผู้ใช้ใหม่
                    </button>
                </div>
                <div class="card-body">
                    <div class="filter-bar">
                        <select class="form-select" id="filterRole" onchange="filterUsers()">
                            <option value="">-- ทุกบทบาท --</option>
                            <option value="teacher">ครู</option>
                            <option value="academic">ฝ่ายวิชาการ</option>
                            <option value="director">ผู้อำนวยการ</option>
                        </select>
                        <select class="form-select" id="filterSection" onchange="filterUsers()">
                            <option value="">-- ทุกแผนก --</option>
                            <option value="อนุบาล">อนุบาล</option>
                            <option value="ประถม">ประถม</option>
                            <option value="มัธยม">มัธยม</option>
                        </select>
                        <input type="text" class="form-input" id="filterSearch" placeholder="ค้นหาชื่อ..." oninput="filterUsers()">
                    </div>
                    
                    <div class="table-container">
                        <table class="data-table" id="usersTable">
                            <thead>
                                <tr>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>ชื่อผู้ใช้</th>
                                    <th>บทบาท</th>
                                    <th>แผนก</th>
                                    <th>ตำแหน่ง</th>
                                    <th>สังกัด</th>
                                    <th>สถานะ</th>
                                    <th>การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody id="usersTableBody">
                                ${renderUsersTable(users)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderUsersTable(users) {
    if (users.length === 0) {
        return '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-secondary);">ไม่พบข้อมูลผู้ใช้</td></tr>';
    }
    
    return users.map(user => `
        <tr data-role="${user.role}" data-dept="${user.department || ''}" data-section="${user.section || ''}" data-name="${user.name.toLowerCase()}">
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div class="user-avatar" style="width:36px;height:36px;font-size:14px;background:${getRoleColor(user.role)}">
                        <i class="fas ${getRoleIcon(user.role)}"></i>
                    </div>
                    <div>
                        <div style="font-weight:500;">${user.name}</div>
                        <div style="font-size:12px;color:var(--text-secondary);">${user.email || '-'}</div>
                    </div>
                </div>
            </td>
            <td><code style="background:var(--bg-light);padding:2px 8px;border-radius:4px;">${user.username}</code></td>
            <td>${getRoleBadge(user.role)}</td>
            <td><span class="status-badge ${getSectionBadgeClass(user.section)}">${user.section || '-'}</span></td>
            <td>${user.position || '-'}</td>
            <td><span style="font-size:13px;">${user.department || '-'}</span></td>
            <td>${user.isActive !== false ? '<span class="status-badge status-approved">ใช้งาน</span>' : '<span class="status-badge status-draft">ปิดใช้งาน</span>'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewUser(${user.id})" title="ดูข้อมูล">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="showEditUserModal(${user.id})" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${user.id !== currentUser.id ? `
                        <button class="action-btn ${user.isActive !== false ? 'delete' : 'print'}" onclick="toggleUserStatus(${user.id})" title="${user.isActive !== false ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}">
                            <i class="fas fa-${user.isActive !== false ? 'ban' : 'check'}"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function getSectionBadgeClass(section) {
    const classes = { 'อนุบาล': 'status-draft', 'ประถม': 'status-pending', 'มัธยม': 'status-academic-approved', 'ทั้งหมด': 'status-approved' };
    return classes[section] || '';
}

function getRoleColor(role) {
    const colors = {
        teacher: 'var(--accent-blue)',
        academic: 'var(--accent-orange)',
        director: 'var(--accent)'
    };
    return colors[role] || 'var(--text-secondary)';
}

function getRoleIcon(role) {
    const icons = {
        teacher: 'fa-chalkboard-teacher',
        academic: 'fa-user-tie',
        director: 'fa-user-shield'
    };
    return icons[role] || 'fa-user';
}

function getRoleBadge(role) {
    const labels = {
        teacher: '<span class="status-badge" style="background:rgba(59,130,246,0.15);color:var(--accent-blue);">ครู</span>',
        academic: '<span class="status-badge" style="background:rgba(245,158,11,0.15);color:var(--accent-orange);">วิชาการ</span>',
        director: '<span class="status-badge" style="background:rgba(16,185,129,0.15);color:var(--accent);">ผู้อำนวยการ</span>'
    };
    return labels[role] || role;
}

// ===== Filter Users =====
function filterUsers() {
    const role = document.getElementById('filterRole').value;
    const section = document.getElementById('filterSection').value;
    const search = document.getElementById('filterSearch').value.toLowerCase();
    
    const rows = document.querySelectorAll('#usersTableBody tr');
    rows.forEach(row => {
        const rowRole = row.dataset.role || '';
        const rowSection = row.dataset.section || '';
        const rowName = row.dataset.name || '';
        
        const matchRole = !role || rowRole === role;
        const matchSection = !section || rowSection === section;
        const matchSearch = !search || rowName.includes(search);
        
        row.style.display = (matchRole && matchSection && matchSearch) ? '' : 'none';
    });
}

// ===== Add User Modal =====
function showAddUserModal() {
    const subjectOptions = SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join('');
    const positionOptions = POSITIONS.map(p => `<option value="${p}">${p}</option>`).join('');
    const deptOptions = DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('');
    const levelOptions = TEACHING_LEVELS.map(l => `<option value="${l}">${l}</option>`).join('');
    const sectionOptions = SECTIONS_LIST.map(s => `<option value="${s}">${s}</option>`).join('');
    
    showModal('เพิ่มผู้ใช้ใหม่', `
        <form id="addUserForm">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">ชื่อ-นามสกุล</label>
                    <input type="text" class="form-input" name="name" required placeholder="เช่น นายสมชาย ใจดี">
                </div>
                <div class="form-group">
                    <label class="form-label required">ชื่อผู้ใช้ (Username)</label>
                    <input type="text" class="form-input" name="username" required placeholder="ใช้สำหรับเข้าสู่ระบบ" pattern="[a-zA-Z0-9_]+" title="ใช้ได้เฉพาะ a-z, 0-9 และ _">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">รหัสผ่าน</label>
                    <input type="password" class="form-input" name="password" required minlength="4">
                </div>
                <div class="form-group">
                    <label class="form-label">อีเมล</label>
                    <input type="email" class="form-input" name="email" placeholder="email@example.com">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">บทบาท</label>
                    <select class="form-select" name="role" required onchange="toggleTeacherFields(this.value)">
                        <option value="">-- เลือกบทบาท --</option>
                        <option value="teacher">ครู</option>
                        <option value="academic">ฝ่ายวิชาการ</option>
                        <option value="director">ผู้อำนวยการ</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label required">แผนก</label>
                    <select class="form-select" name="section" required>
                        <option value="">-- เลือกแผนก --</option>
                        ${sectionOptions}
                        <option value="ทั้งหมด">ทั้งหมด (สำหรับ ผอ.)</option>
                    </select>
                    <p class="form-hint">ครูและวิชาการต้องสังกัดแผนก</p>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">ตำแหน่ง</label>
                    <select class="form-select" name="position">
                        <option value="">-- เลือกตำแหน่ง --</option>
                        ${positionOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">สังกัด/กลุ่มสาระ</label>
                    <select class="form-select" name="department">
                        <option value="">-- เลือกสังกัด --</option>
                        ${deptOptions}
                    </select>
                </div>
            </div>
            
            <div id="teacherFields" style="display:none;">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">วิชาที่สอน</label>
                        <select class="form-select" name="subject">
                            <option value="">-- เลือกวิชา --</option>
                            ${subjectOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ระดับชั้นที่สอน</label>
                        <select class="form-select" name="teachingLevel">
                            <option value="">-- เลือกระดับ --</option>
                            ${levelOptions}
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">เบอร์โทรศัพท์</label>
                <input type="tel" class="form-input" name="phone" placeholder="0xx-xxx-xxxx">
            </div>
        </form>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        <button class="btn btn-primary" onclick="saveNewUser()">
            <i class="fas fa-save"></i> บันทึก
        </button>
    `);
}

function toggleTeacherFields(role) {
    const teacherFields = document.getElementById('teacherFields');
    if (teacherFields) {
        teacherFields.style.display = role === 'teacher' ? 'block' : 'none';
    }
}

function saveNewUser() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    
    // Validate required fields
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const users = getUsers();
    
    // Check duplicate username
    const username = formData.get('username');
    if (users.some(u => u.username === username)) {
        alert('ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น');
        return;
    }
    
    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        username: username,
        password: formData.get('password'),
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        section: formData.get('section'),
        position: formData.get('position'),
        department: formData.get('department'),
        subject: formData.get('subject'),
        teachingLevel: formData.get('teachingLevel'),
        phone: formData.get('phone'),
        isActive: true,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    closeModal();
    alert('เพิ่มผู้ใช้เรียบร้อยแล้ว');
    renderUserManagement();
}

// ===== Edit User Modal =====
function showEditUserModal(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const subjectOptions = SUBJECTS.map(s => `<option value="${s}" ${user.subject === s ? 'selected' : ''}>${s}</option>`).join('');
    const positionOptions = POSITIONS.map(p => `<option value="${p}" ${user.position === p ? 'selected' : ''}>${p}</option>`).join('');
    const deptOptions = DEPARTMENTS.map(d => `<option value="${d}" ${user.department === d ? 'selected' : ''}>${d}</option>`).join('');
    const levelOptions = TEACHING_LEVELS.map(l => `<option value="${l}" ${user.teachingLevel === l ? 'selected' : ''}>${l}</option>`).join('');
    const sectionOptions = [...SECTIONS_LIST, 'ทั้งหมด'].map(s => `<option value="${s}" ${user.section === s ? 'selected' : ''}>${s}</option>`).join('');
    
    showModal('แก้ไขข้อมูลผู้ใช้', `
        <form id="editUserForm">
            <input type="hidden" name="userId" value="${user.id}">
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">ชื่อ-นามสกุล</label>
                    <input type="text" class="form-input" name="name" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">ชื่อผู้ใช้</label>
                    <input type="text" class="form-input" value="${user.username}" disabled>
                    <p class="form-hint">ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้</p>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">รหัสผ่านใหม่</label>
                    <input type="password" class="form-input" name="password" placeholder="เว้นว่างถ้าไม่ต้องการเปลี่ยน">
                </div>
                <div class="form-group">
                    <label class="form-label">อีเมล</label>
                    <input type="email" class="form-input" name="email" value="${user.email || ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">บทบาท</label>
                    <select class="form-select" name="role" required onchange="toggleTeacherFields(this.value)" ${user.id === currentUser.id ? 'disabled' : ''}>
                        <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>ครู</option>
                        <option value="academic" ${user.role === 'academic' ? 'selected' : ''}>ฝ่ายวิชาการ</option>
                        <option value="director" ${user.role === 'director' ? 'selected' : ''}>ผู้อำนวยการ</option>
                    </select>
                    ${user.id === currentUser.id ? '<p class="form-hint">ไม่สามารถเปลี่ยนบทบาทตัวเองได้</p>' : ''}
                    ${user.id === currentUser.id ? `<input type="hidden" name="role" value="${user.role}">` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label required">แผนก</label>
                    <select class="form-select" name="section" required>
                        <option value="">-- เลือกแผนก --</option>
                        ${sectionOptions}
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">ตำแหน่ง</label>
                    <select class="form-select" name="position">
                        <option value="">-- เลือกตำแหน่ง --</option>
                        ${positionOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">สังกัด/กลุ่มสาระ</label>
                    <select class="form-select" name="department">
                        <option value="">-- เลือกสังกัด --</option>
                        ${deptOptions}
                    </select>
                </div>
            </div>
            
            <div id="teacherFields" style="display:${user.role === 'teacher' ? 'block' : 'none'};">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">วิชาที่สอน</label>
                        <select class="form-select" name="subject">
                            <option value="">-- เลือกวิชา --</option>
                            ${subjectOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ระดับชั้นที่สอน</label>
                        <select class="form-select" name="teachingLevel">
                            <option value="">-- เลือกระดับ --</option>
                            ${levelOptions}
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">เบอร์โทรศัพท์</label>
                <input type="tel" class="form-input" name="phone" value="${user.phone || ''}">
            </div>
        </form>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        <button class="btn btn-primary" onclick="updateUser()">
            <i class="fas fa-save"></i> บันทึก
        </button>
    `);
}

function updateUser() {
    const form = document.getElementById('editUserForm');
    const formData = new FormData(form);
    const userId = parseInt(formData.get('userId'));
    
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return;
    
    // Update fields
    users[index].name = formData.get('name');
    users[index].email = formData.get('email');
    users[index].role = formData.get('role');
    users[index].section = formData.get('section');
    users[index].position = formData.get('position');
    users[index].department = formData.get('department');
    users[index].subject = formData.get('subject');
    users[index].teachingLevel = formData.get('teachingLevel');
    users[index].phone = formData.get('phone');
    users[index].updatedAt = new Date().toISOString();
    
    // Update password if provided
    const newPassword = formData.get('password');
    if (newPassword && newPassword.trim()) {
        users[index].password = newPassword;
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user if editing self
    if (userId === currentUser.id) {
        currentUser = users[index];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('currentUserName').textContent = currentUser.name;
        document.getElementById('currentUserRole').textContent = ROLE_LABELS[currentUser.role] + (currentUser.section ? ' - ' + currentUser.section : '');
    }
    
    closeModal();
    alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    renderUserManagement();
}

// ===== View User Details =====
function viewUser(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const plans = getPlans().filter(p => p.teacherId === userId);
    const refs = getReflections().filter(r => r.teacherId === userId);
    
    showModal('ข้อมูลผู้ใช้', `
        <div style="text-align:center;margin-bottom:20px;">
            <div class="user-avatar" style="width:80px;height:80px;font-size:32px;margin:0 auto 12px;background:${getRoleColor(user.role)}">
                <i class="fas ${getRoleIcon(user.role)}"></i>
            </div>
            <h3 style="margin-bottom:4px;">${user.name}</h3>
            <div>${getRoleBadge(user.role)}</div>
        </div>
        
        <div style="background:var(--bg-light);padding:16px;border-radius:8px;margin-bottom:16px;">
            <div class="form-row" style="margin-bottom:8px;">
                <div><strong>ชื่อผู้ใช้:</strong> ${user.username}</div>
                <div><strong>อีเมล:</strong> ${user.email || '-'}</div>
            </div>
            <div class="form-row" style="margin-bottom:8px;">
                <div><strong>ตำแหน่ง:</strong> ${user.position || '-'}</div>
                <div><strong>โทรศัพท์:</strong> ${user.phone || '-'}</div>
            </div>
            <div style="margin-bottom:8px;"><strong>สังกัด:</strong> ${user.department || '-'}</div>
            ${user.role === 'teacher' ? `
                <div class="form-row">
                    <div><strong>วิชาที่สอน:</strong> ${user.subject || '-'}</div>
                    <div><strong>ระดับที่สอน:</strong> ${user.teachingLevel || '-'}</div>
                </div>
            ` : ''}
        </div>
        
        ${user.role === 'teacher' ? `
            <div style="background:var(--bg-light);padding:16px;border-radius:8px;">
                <h4 style="margin-bottom:12px;"><i class="fas fa-chart-bar"></i> สถิติการทำงาน</h4>
                <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
                    <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                        <div style="font-size:24px;font-weight:700;color:var(--accent-blue);">${plans.length}</div>
                        <div style="font-size:13px;color:var(--text-secondary);">แผนทั้งหมด</div>
                    </div>
                    <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                        <div style="font-size:24px;font-weight:700;color:var(--accent);">${plans.filter(p => p.status === 'approved').length}</div>
                        <div style="font-size:13px;color:var(--text-secondary);">แผนอนุมัติ</div>
                    </div>
                    <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                        <div style="font-size:24px;font-weight:700;color:var(--accent-blue);">${refs.length}</div>
                        <div style="font-size:13px;color:var(--text-secondary);">บันทึกทั้งหมด</div>
                    </div>
                    <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                        <div style="font-size:24px;font-weight:700;color:var(--accent);">${refs.filter(r => r.status === 'approved').length}</div>
                        <div style="font-size:13px;color:var(--text-secondary);">บันทึกอนุมัติ</div>
                    </div>
                </div>
            </div>
        ` : ''}
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">ปิด</button>
        <button class="btn btn-primary" onclick="closeModal(); showEditUserModal(${user.id});">
            <i class="fas fa-edit"></i> แก้ไข
        </button>
    `);
}

// ===== Toggle User Status =====
function toggleUserStatus(userId) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return;
    
    const user = users[index];
    const newStatus = user.isActive === false ? true : false;
    const action = newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
    
    if (confirm(`ต้องการ${action}ผู้ใช้ "${user.name}" หรือไม่?`)) {
        users[index].isActive = newStatus;
        users[index].updatedAt = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
        
        alert(`${action}เรียบร้อยแล้ว`);
        renderUserManagement();
    }
}

// ===== Delete User (Optional - commented out for safety) =====
function deleteUser(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (user.id === currentUser.id) {
        alert('ไม่สามารถลบบัญชีตัวเองได้');
        return;
    }
    
    // Check if user has plans or reflections
    const plans = getPlans().filter(p => p.teacherId === userId);
    const refs = getReflections().filter(r => r.teacherId === userId);
    
    if (plans.length > 0 || refs.length > 0) {
        alert(`ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากมีข้อมูลแผนการสอน ${plans.length} รายการ และบันทึก ${refs.length} รายการ\n\nแนะนำให้ "ปิดใช้งาน" แทน`);
        return;
    }
    
    if (confirm(`ต้องการลบผู้ใช้ "${user.name}" หรือไม่?\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้`)) {
        const newUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(newUsers));
        
        alert('ลบผู้ใช้เรียบร้อยแล้ว');
        renderUserManagement();
    }
}

// ===== Export Users to CSV =====
function exportUsersCSV() {
    const users = getUsers();
    
    const headers = ['ID', 'ชื่อผู้ใช้', 'ชื่อ-นามสกุล', 'อีเมล', 'บทบาท', 'ตำแหน่ง', 'สังกัด', 'วิชา', 'ระดับที่สอน', 'สถานะ'];
    const rows = users.map(u => [
        u.id,
        u.username,
        u.name,
        u.email || '',
        ROLE_LABELS[u.role],
        u.position || '',
        u.department || '',
        u.subject || '',
        u.teachingLevel || '',
        u.isActive !== false ? 'ใช้งาน' : 'ปิดใช้งาน'
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

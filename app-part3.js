// ===== app-part3.js - Review, Approve, Statistics, Print, Modal Functions =====

// ===== Review Plans (Academic) =====
function renderReviewPlans() {
    const allPlans = getPlans().filter(p => p.status === 'pending');
    const users = getUsers();
    
    // กรองตามแผนกของวิชาการ
    let plans = allPlans;
    if (currentUser.role === 'academic' && currentUser.section !== 'ทั้งหมด') {
        const teacherIds = users.filter(u => u.role === 'teacher' && u.section === currentUser.section).map(u => u.id);
        plans = allPlans.filter(p => teacherIds.includes(p.teacherId));
    }
    
    if (plans.length === 0) {
        document.getElementById('contentArea').innerHTML = `
            <div class="card"><div class="card-body">
                <div class="empty-state">
                    <i class="fas fa-clipboard-check"></i>
                    <h3>ไม่มีแผนรอตรวจ</h3>
                    <p>ยังไม่มีแผนการสอน${currentUser.section !== 'ทั้งหมด' ? 'ในแผนก' + currentUser.section : ''}ที่รอการตรวจสอบ</p>
                </div>
            </div></div>`;
        return;
    }
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            ${currentUser.section !== 'ทั้งหมด' ? `<div class="alert alert-info"><i class="fas fa-info-circle"></i> แสดงเฉพาะแผนการสอนของครูในแผนก<strong>${currentUser.section}</strong></div>` : ''}
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">แผนการสอนรอตรวจ (${plans.length} รายการ)</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>ครูผู้สอน</th><th>แผนก</th><th>วิชา</th><th>ระดับชั้น</th><th>หน่วย</th><th>สัปดาห์</th><th>ส่งเมื่อ</th><th>ดำเนินการ</th></tr></thead>
                            <tbody>
                                ${plans.map(plan => {
                                    const teacher = users.find(u => u.id === plan.teacherId);
                                    return `<tr>
                                        <td>${teacher ? teacher.name : 'ไม่ทราบ'}</td>
                                        <td><span class="status-badge ${getSectionClass(teacher?.section)}">${teacher?.section || '-'}</span></td>
                                        <td>${plan.subject}</td><td>${plan.gradeLevel}</td><td>${plan.unit}</td>
                                        <td>${getWeekRange(plan.weekStart)}</td><td>${formatDateTime(plan.updatedAt)}</td>
                                        <td><button class="action-btn view" onclick="reviewPlanAction('${plan.id}')" title="ตรวจสอบ"><i class="fas fa-search"></i></button></td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
}

function getSectionClass(section) {
    const classes = { 'อนุบาล': 'status-draft', 'ประถม': 'status-pending', 'มัธยม': 'status-academic-approved' };
    return classes[section] || '';
}

function reviewPlanAction(planId) {
    const plan = getPlans().find(p => p.id === planId);
    if (!plan) return;
    const teacher = getUsers().find(u => u.id === plan.teacherId);
    
    showModal('ตรวจสอบแผนการสอน', `
        <div style="margin-bottom:20px"><strong>ครู:</strong> ${teacher?.name || '-'} | <strong>วิชา:</strong> ${plan.subject} | <strong>ชั้น:</strong> ${plan.gradeLevel}<br><strong>หน่วย:</strong> ${plan.unit} | <strong>สัปดาห์:</strong> ${getWeekRange(plan.weekStart)}</div>
        <div style="max-height:250px;overflow-y:auto;padding:16px;background:var(--bg-light);border-radius:8px;margin-bottom:20px">
            <p><strong>สมรรถนะ:</strong> ${plan.competencies}</p>
            <p><strong>จุดประสงค์:</strong> ${plan.objectives}</p>
            <p><strong>กิจกรรม:</strong> ${plan.activities}</p>
            <p><strong>สื่อ:</strong> ${plan.materials}</p>
            <p><strong>การประเมิน:</strong> ${plan.assessment}</p>
        </div>
        <div class="form-group"><label class="form-label">ความคิดเห็น</label><textarea class="form-textarea" id="reviewComment" placeholder="กรอกความคิดเห็น (บังคับถ้าส่งแก้ไข)"></textarea></div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        <button class="btn btn-danger" onclick="academicReview('plan','${plan.id}','revision')"><i class="fas fa-times"></i> ส่งแก้ไข</button>
        <button class="btn btn-success" onclick="academicReview('plan','${plan.id}','approve')"><i class="fas fa-check"></i> ผ่าน</button>
    `);
}

function academicReview(type, id, action) {
    const comment = document.getElementById('reviewComment').value;
    if (action === 'revision' && !comment.trim()) { alert('กรุณาระบุเหตุผล'); return; }
    
    const items = type === 'plan' ? getPlans() : getReflections();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    
    items[idx].status = action === 'approve' ? 'academic_approved' : 'revision_academic';
    items[idx].updatedAt = new Date().toISOString();
    type === 'plan' ? savePlans(items) : saveReflections(items);
    
    if (comment.trim()) {
        const comments = getComments();
        comments.push({ id: generateId(), targetId: id, targetType: type, userId: currentUser.id, userRole: currentUser.role, text: comment, createdAt: new Date().toISOString() });
        saveComments(comments);
    }
    
    closeModal();
    alert(action === 'approve' ? 'ส่งให้ ผอ. แล้ว' : 'ส่งแก้ไขแล้ว');
    type === 'plan' ? renderReviewPlans() : renderReviewReflections();
}

// ===== Review Reflections (Academic) =====
function renderReviewReflections() {
    const allRefs = getReflections().filter(r => r.status === 'pending');
    const users = getUsers(), plans = getPlans();
    
    // กรองตามแผนกของวิชาการ
    let refs = allRefs;
    if (currentUser.role === 'academic' && currentUser.section !== 'ทั้งหมด') {
        const teacherIds = users.filter(u => u.role === 'teacher' && u.section === currentUser.section).map(u => u.id);
        refs = allRefs.filter(r => teacherIds.includes(r.teacherId));
    }
    
    if (refs.length === 0) {
        document.getElementById('contentArea').innerHTML = `<div class="card"><div class="card-body"><div class="empty-state"><i class="fas fa-tasks"></i><h3>ไม่มีบันทึกรอตรวจ</h3><p>ยังไม่มีบันทึกหลังสอน${currentUser.section !== 'ทั้งหมด' ? 'ในแผนก' + currentUser.section : ''}ที่รอการตรวจสอบ</p></div></div></div>`;
        return;
    }
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            ${currentUser.section !== 'ทั้งหมด' ? `<div class="alert alert-info"><i class="fas fa-info-circle"></i> แสดงเฉพาะบันทึกของครูในแผนก<strong>${currentUser.section}</strong></div>` : ''}
            <div class="card">
            <div class="card-header"><h3 class="card-title">บันทึกหลังสอนรอตรวจ (${refs.length})</h3></div>
            <div class="card-body"><div class="table-container"><table class="data-table">
                <thead><tr><th>ครู</th><th>แผนก</th><th>วิชา</th><th>ชั้น</th><th>หน่วย</th><th>ส่งเมื่อ</th><th>ดำเนินการ</th></tr></thead>
                <tbody>${refs.map(r => {
                    const t = users.find(u => u.id === r.teacherId), p = plans.find(x => x.id === r.planId);
                    return `<tr><td>${t?.name || '-'}</td><td><span class="status-badge ${getSectionClass(t?.section)}">${t?.section || '-'}</span></td><td>${p?.subject || '-'}</td><td>${p?.gradeLevel || '-'}</td><td>${p?.unit || '-'}</td><td>${formatDateTime(r.updatedAt)}</td>
                    <td><button class="action-btn view" onclick="reviewRefAction('${r.id}')"><i class="fas fa-search"></i></button></td></tr>`;
                }).join('')}</tbody>
            </table></div></div>
        </div></div>`;
}

function reviewRefAction(refId) {
    const ref = getReflections().find(r => r.id === refId);
    if (!ref) return;
    const teacher = getUsers().find(u => u.id === ref.teacherId), plan = getPlans().find(p => p.id === ref.planId);
    
    showModal('ตรวจบันทึกหลังสอน', `
        <div style="margin-bottom:20px"><strong>ครู:</strong> ${teacher?.name || '-'} | <strong>วิชา:</strong> ${plan?.subject || '-'}</div>
        <div style="max-height:250px;overflow-y:auto;padding:16px;background:var(--bg-light);border-radius:8px;margin-bottom:20px">
            <p><strong>ตามแผน:</strong> ${ref.asPlanned}</p>
            <p><strong>ปรับเปลี่ยน:</strong> ${ref.adjustments}</p>
            <p><strong>ผลการเรียนรู้:</strong> ${ref.learningOutcomes}</p>
            <p><strong>ครั้งหน้า:</strong> ${ref.improvements}</p>
        </div>
        <div class="form-group"><label class="form-label">ความคิดเห็น</label><textarea class="form-textarea" id="reviewComment"></textarea></div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        <button class="btn btn-danger" onclick="academicReview('reflection','${ref.id}','revision')"><i class="fas fa-times"></i> ส่งแก้ไข</button>
        <button class="btn btn-success" onclick="academicReview('reflection','${ref.id}','approve')"><i class="fas fa-check"></i> ผ่าน</button>
    `);
}

// ===== Approve Plans (Director) =====
function renderApprovePlans() {
    const plans = getPlans().filter(p => p.status === 'academic_approved');
    const users = getUsers();
    
    if (plans.length === 0) {
        document.getElementById('contentArea').innerHTML = `<div class="card"><div class="card-body"><div class="empty-state"><i class="fas fa-check-double"></i><h3>ไม่มีแผนรออนุมัติ</h3></div></div></div>`;
        return;
    }
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up"><div class="card">
            <div class="card-header"><h3 class="card-title">แผนรออนุมัติ (${plans.length})</h3></div>
            <div class="card-body"><div class="table-container"><table class="data-table">
                <thead><tr><th>ครู</th><th>วิชา</th><th>ชั้น</th><th>หน่วย</th><th>สัปดาห์</th><th>ดำเนินการ</th></tr></thead>
                <tbody>${plans.map(p => {
                    const t = users.find(u => u.id === p.teacherId);
                    return `<tr><td>${t?.name || '-'}</td><td>${p.subject}</td><td>${p.gradeLevel}</td><td>${p.unit}</td><td>${getWeekRange(p.weekStart)}</td>
                    <td><button class="action-btn view" onclick="approvePlanAction('${p.id}')"><i class="fas fa-gavel"></i></button></td></tr>`;
                }).join('')}</tbody>
            </table></div></div>
        </div></div>`;
}

function approvePlanAction(planId) {
    const plan = getPlans().find(p => p.id === planId);
    if (!plan) return;
    const teacher = getUsers().find(u => u.id === plan.teacherId);
    
    showModal('อนุมัติแผนการสอน', `
        <div style="margin-bottom:20px"><strong>ครู:</strong> ${teacher?.name || '-'} | <strong>วิชา:</strong> ${plan.subject} | <strong>ชั้น:</strong> ${plan.gradeLevel}</div>
        <div style="max-height:250px;overflow-y:auto;padding:16px;background:var(--bg-light);border-radius:8px;margin-bottom:20px">
            <p><strong>สมรรถนะ:</strong> ${plan.competencies}</p>
            <p><strong>จุดประสงค์:</strong> ${plan.objectives}</p>
            <p><strong>กิจกรรม:</strong> ${plan.activities}</p>
        </div>
        <div class="form-group"><label class="form-label">ความคิดเห็น</label><textarea class="form-textarea" id="approveComment"></textarea></div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        <button class="btn btn-danger" onclick="directorReview('plan','${plan.id}','revision')"><i class="fas fa-times"></i> ส่งแก้ไข</button>
        <button class="btn btn-success" onclick="directorReview('plan','${plan.id}','approve')"><i class="fas fa-check"></i> อนุมัติ</button>
    `);
}

function directorReview(type, id, action) {
    const comment = document.getElementById('approveComment').value;
    if (action === 'revision' && !comment.trim()) { alert('กรุณาระบุเหตุผล'); return; }
    
    const items = type === 'plan' ? getPlans() : getReflections();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    
    items[idx].status = action === 'approve' ? 'approved' : 'revision_director';
    items[idx].updatedAt = new Date().toISOString();
    type === 'plan' ? savePlans(items) : saveReflections(items);
    
    if (comment.trim()) {
        const comments = getComments();
        comments.push({ id: generateId(), targetId: id, targetType: type, userId: currentUser.id, userRole: currentUser.role, text: comment, createdAt: new Date().toISOString() });
        saveComments(comments);
    }
    
    closeModal();
    alert(action === 'approve' ? 'อนุมัติแล้ว' : 'ส่งแก้ไขแล้ว');
    type === 'plan' ? renderApprovePlans() : renderApproveReflections();
}

// ===== Approve Reflections (Director) =====
function renderApproveReflections() {
    const refs = getReflections().filter(r => r.status === 'academic_approved');
    const users = getUsers(), plans = getPlans();
    
    if (refs.length === 0) {
        document.getElementById('contentArea').innerHTML = `<div class="card"><div class="card-body"><div class="empty-state"><i class="fas fa-clipboard-list"></i><h3>ไม่มีบันทึกรออนุมัติ</h3></div></div></div>`;
        return;
    }
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up"><div class="card">
            <div class="card-header"><h3 class="card-title">บันทึกรออนุมัติ (${refs.length})</h3></div>
            <div class="card-body"><div class="table-container"><table class="data-table">
                <thead><tr><th>ครู</th><th>วิชา</th><th>ชั้น</th><th>หน่วย</th><th>ดำเนินการ</th></tr></thead>
                <tbody>${refs.map(r => {
                    const t = users.find(u => u.id === r.teacherId), p = plans.find(x => x.id === r.planId);
                    return `<tr><td>${t?.name || '-'}</td><td>${p?.subject || '-'}</td><td>${p?.gradeLevel || '-'}</td><td>${p?.unit || '-'}</td>
                    <td><button class="action-btn view" onclick="approveRefAction('${r.id}')"><i class="fas fa-gavel"></i></button></td></tr>`;
                }).join('')}</tbody>
            </table></div></div>
        </div></div>`;
}

function approveRefAction(refId) {
    const ref = getReflections().find(r => r.id === refId);
    if (!ref) return;
    const teacher = getUsers().find(u => u.id === ref.teacherId), plan = getPlans().find(p => p.id === ref.planId);
    
    showModal('อนุมัติบันทึกหลังสอน', `
        <div style="margin-bottom:20px"><strong>ครู:</strong> ${teacher?.name || '-'} | <strong>วิชา:</strong> ${plan?.subject || '-'}</div>
        <div style="max-height:250px;overflow-y:auto;padding:16px;background:var(--bg-light);border-radius:8px;margin-bottom:20px">
            <p><strong>ตามแผน:</strong> ${ref.asPlanned}</p>
            <p><strong>ปรับเปลี่ยน:</strong> ${ref.adjustments}</p>
            <p><strong>ผลการเรียนรู้:</strong> ${ref.learningOutcomes}</p>
        </div>
        <div class="form-group"><label class="form-label">ความคิดเห็น</label><textarea class="form-textarea" id="approveComment"></textarea></div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        <button class="btn btn-danger" onclick="directorReview('reflection','${ref.id}','revision')"><i class="fas fa-times"></i> ส่งแก้ไข</button>
        <button class="btn btn-success" onclick="directorReview('reflection','${ref.id}','approve')"><i class="fas fa-check"></i> รับทราบ</button>
    `);
}

// ===== Statistics (Director) =====
function renderStatistics() {
    const plans = getPlans(), refs = getReflections(), teachers = getUsers().filter(u => u.role === 'teacher');
    const approved = plans.filter(p => p.status === 'approved').length;
    const refApproved = refs.filter(r => r.status === 'approved').length;
    
    const teacherStats = teachers.map(t => ({
        name: t.name, subject: t.subject,
        plans: plans.filter(p => p.teacherId === t.id).length,
        plansOK: plans.filter(p => p.teacherId === t.id && p.status === 'approved').length,
        refs: refs.filter(r => r.teacherId === t.id).length,
        refsOK: refs.filter(r => r.teacherId === t.id && r.status === 'approved').length
    }));
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-file-alt"></i></div><div class="stat-content"><h3>${plans.length}</h3><p>แผนทั้งหมด</p></div></div>
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div class="stat-content"><h3>${approved}</h3><p>แผนอนุมัติ</p></div></div>
                <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-book"></i></div><div class="stat-content"><h3>${refs.length}</h3><p>บันทึกทั้งหมด</p></div></div>
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-double"></i></div><div class="stat-content"><h3>${refApproved}</h3><p>บันทึกอนุมัติ</p></div></div>
            </div>
            <div class="card" style="margin-bottom:20px"><div class="card-header"><h3 class="card-title">ความคืบหน้า</h3></div><div class="card-body">
                <div class="progress-bar-container"><div class="progress-label"><span>แผนอนุมัติ</span><span>${plans.length ? Math.round(approved/plans.length*100) : 0}%</span></div><div class="progress-bar"><div class="progress-fill green" style="width:${plans.length ? approved/plans.length*100 : 0}%"></div></div></div>
                <div class="progress-bar-container"><div class="progress-label"><span>บันทึกอนุมัติ</span><span>${refs.length ? Math.round(refApproved/refs.length*100) : 0}%</span></div><div class="progress-bar"><div class="progress-fill blue" style="width:${refs.length ? refApproved/refs.length*100 : 0}%"></div></div></div>
            </div></div>
            <div class="card"><div class="card-header"><h3 class="card-title">สถิติรายบุคคล</h3></div><div class="card-body"><div class="table-container"><table class="data-table">
                <thead><tr><th>ชื่อครู</th><th>กลุ่มสาระ</th><th>แผนทั้งหมด</th><th>แผนอนุมัติ</th><th>บันทึกทั้งหมด</th><th>บันทึกอนุมัติ</th></tr></thead>
                <tbody>${teacherStats.map(t => `<tr><td>${t.name}</td><td>${t.subject || '-'}</td><td>${t.plans}</td><td>${t.plansOK}</td><td>${t.refs}</td><td>${t.refsOK}</td></tr>`).join('')}</tbody>
            </table></div></div></div>
        </div>`;
}

// ===== My Statistics =====
function renderMyStatistics() {
    const plans = getPlans().filter(p => p.teacherId === currentUser.id);
    const refs = getReflections().filter(r => r.teacherId === currentUser.id);
    const approved = plans.filter(p => p.status === 'approved').length;
    const pending = plans.filter(p => ['pending','academic_approved'].includes(p.status)).length;
    const revision = plans.filter(p => p.status.includes('revision')).length;
    const refApproved = refs.filter(r => r.status === 'approved').length;
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-file-alt"></i></div><div class="stat-content"><h3>${plans.length}</h3><p>แผนทั้งหมด</p></div></div>
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div class="stat-content"><h3>${approved}</h3><p>อนุมัติแล้ว</p></div></div>
                <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-clock"></i></div><div class="stat-content"><h3>${pending}</h3><p>รอตรวจสอบ</p></div></div>
                <div class="stat-card"><div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div><div class="stat-content"><h3>${revision}</h3><p>ต้องแก้ไข</p></div></div>
            </div>
            <div class="card"><div class="card-header"><h3 class="card-title">ความคืบหน้าของฉัน</h3></div><div class="card-body">
                <div class="progress-bar-container"><div class="progress-label"><span>แผนอนุมัติ</span><span>${plans.length ? Math.round(approved/plans.length*100) : 0}%</span></div><div class="progress-bar"><div class="progress-fill green" style="width:${plans.length ? approved/plans.length*100 : 0}%"></div></div></div>
                <div class="progress-bar-container"><div class="progress-label"><span>บันทึกอนุมัติ</span><span>${refs.length ? Math.round(refApproved/refs.length*100) : 0}%</span></div><div class="progress-bar"><div class="progress-fill blue" style="width:${refs.length ? refApproved/refs.length*100 : 0}%"></div></div></div>
            </div></div>
        </div>`;
}

// ===== Modal Functions =====
function showModal(title, content, footer) {
    let modal = document.getElementById('modalOverlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalOverlay';
        modal.className = 'modal-overlay';
        modal.innerHTML = `<div class="modal"><div class="modal-header"><h3 class="modal-title"></h3><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div><div class="modal-body"></div><div class="modal-footer"></div></div>`;
        document.body.appendChild(modal);
    }
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = content;
    modal.querySelector('.modal-footer').innerHTML = footer;
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) modal.classList.remove('active');
}

// ===== Print Functions =====
function printPlan(planId) {
    const plan = getPlans().find(p => p.id === planId);
    if (!plan) return;
    const teacher = getUsers().find(u => u.id === plan.teacherId);
    
    const printContent = `
        <div class="print-header">
            <div class="print-title">แผนการสอน</div>
            <div class="print-subtitle">โรงเรียนลำไพลศานติวิทย์</div>
        </div>
        <div class="print-content">
            <div class="print-section"><div class="print-section-title">ข้อมูลทั่วไป</div>
                <p><strong>ครูผู้สอน:</strong> ${teacher?.name || '-'}</p>
                <p><strong>วิชา:</strong> ${plan.subject} &nbsp;&nbsp; <strong>ระดับชั้น:</strong> ${plan.gradeLevel}</p>
                <p><strong>หน่วยการเรียนรู้:</strong> ${plan.unit}</p>
                <p><strong>สัปดาห์:</strong> ${getWeekRange(plan.weekStart)} &nbsp;&nbsp; <strong>จำนวน:</strong> ${plan.hours} ชั่วโมง</p>
            </div>
            <div class="print-section"><div class="print-section-title">สมรรถนะที่ต้องการพัฒนา</div><p>${plan.competencies}</p></div>
            <div class="print-section"><div class="print-section-title">จุดประสงค์การเรียนรู้</div><p>${plan.objectives}</p></div>
            <div class="print-section"><div class="print-section-title">กิจกรรม Active Learning</div><p>${plan.activities}</p></div>
            <div class="print-section"><div class="print-section-title">สื่อและแหล่งเรียนรู้</div><p>${plan.materials}</p></div>
            <div class="print-section"><div class="print-section-title">การวัดและประเมินผล</div><p>${plan.assessment}</p></div>
        </div>
        <div class="print-footer">
            <div class="print-signature"><div class="print-signature-line">ครูผู้สอน</div></div>
            <div class="print-signature"><div class="print-signature-line">ฝ่ายวิชาการ</div></div>
            <div class="print-signature"><div class="print-signature-line">ผู้อำนวยการ</div></div>
        </div>`;
    
    document.getElementById('printArea').innerHTML = printContent;
    window.print();
}

function printReflection(refId) {
    const ref = getReflections().find(r => r.id === refId);
    if (!ref) return;
    const teacher = getUsers().find(u => u.id === ref.teacherId);
    const plan = getPlans().find(p => p.id === ref.planId);
    
    const printContent = `
        <div class="print-header">
            <div class="print-title">บันทึกหลังสอน</div>
            <div class="print-subtitle">โรงเรียนลำไพลศานติวิทย์</div>
        </div>
        <div class="print-content">
            <div class="print-section"><div class="print-section-title">ข้อมูลทั่วไป</div>
                <p><strong>ครูผู้สอน:</strong> ${teacher?.name || '-'}</p>
                <p><strong>วิชา:</strong> ${plan?.subject || '-'} &nbsp;&nbsp; <strong>ระดับชั้น:</strong> ${plan?.gradeLevel || '-'}</p>
                <p><strong>หน่วยการเรียนรู้:</strong> ${plan?.unit || '-'}</p>
                <p><strong>สัปดาห์:</strong> ${plan ? getWeekRange(plan.weekStart) : '-'}</p>
            </div>
            <div class="print-section"><div class="print-section-title">สิ่งที่เป็นไปตามแผน</div><p>${ref.asPlanned}</p></div>
            <div class="print-section"><div class="print-section-title">สิ่งที่ต้องปรับเปลี่ยน</div><p>${ref.adjustments}</p></div>
            <div class="print-section"><div class="print-section-title">ผลการเรียนรู้ของนักเรียน</div><p>${ref.learningOutcomes}</p></div>
            <div class="print-section"><div class="print-section-title">สิ่งที่จะทำต่างไปในครั้งหน้า</div><p>${ref.improvements}</p></div>
            ${ref.additionalNotes ? `<div class="print-section"><div class="print-section-title">บันทึกเพิ่มเติม</div><p>${ref.additionalNotes}</p></div>` : ''}
        </div>
        <div class="print-footer">
            <div class="print-signature"><div class="print-signature-line">ครูผู้สอน</div></div>
            <div class="print-signature"><div class="print-signature-line">ฝ่ายวิชาการ</div></div>
            <div class="print-signature"><div class="print-signature-line">ผู้อำนวยการ</div></div>
        </div>`;
    
    document.getElementById('printArea').innerHTML = printContent;
    window.print();
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    
    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if (login(username, password)) {
            showApp();
        } else {
            alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    });
    
    // Navigation handler
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) navigateTo(page);
        });
    });
    
    // Check if already logged in
    if (checkAuth()) {
        showApp();
    }
});

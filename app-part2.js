// ===== app-part2.js - Plans and Reflections Functions =====

// ===== Create Plan =====
function renderCreatePlan(editPlan = null) {
    const subjectOptions = SUBJECTS.map(s => `<option value="${s}" ${editPlan && editPlan.subject === s ? 'selected' : ''}>${s}</option>`).join('');
    const gradeOptions = GRADE_LEVELS.map(g => `<option value="${g}" ${editPlan && editPlan.gradeLevel === g ? 'selected' : ''}>${g}</option>`).join('');
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${editPlan ? 'แก้ไขแผนการสอน' : 'สร้างแผนการสอนใหม่'}</h3>
                </div>
                <div class="card-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>คำแนะนำ:</strong> แผนการสอนควรเน้นกระบวนการคิดและออกแบบกิจกรรม Active Learning 
                            ที่ให้นักเรียนได้ลงมือทำและพัฒนาสมรรถนะ ครูมีอิสระในการออกแบบรายละเอียด
                        </div>
                    </div>
                    
                    <form id="planForm" onsubmit="savePlan(event, ${editPlan ? `'${editPlan.id}'` : 'null'})">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">วิชา</label>
                                <select class="form-select" name="subject" required>
                                    <option value="">-- เลือกวิชา --</option>
                                    ${subjectOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">ระดับชั้น</label>
                                <select class="form-select" name="gradeLevel" required>
                                    <option value="">-- เลือกระดับชั้น --</option>
                                    ${gradeOptions}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">สัปดาห์เริ่มต้น</label>
                                <input type="date" class="form-input" name="weekStart" value="${editPlan ? editPlan.weekStart : ''}" required>
                                <p class="form-hint">แผนจะครอบคลุม 2 สัปดาห์นับจากวันที่เลือก</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">จำนวนชั่วโมง</label>
                                <input type="number" class="form-input" name="hours" min="1" max="20" value="${editPlan ? editPlan.hours : ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">หน่วยการเรียนรู้</label>
                            <input type="text" class="form-input" name="unit" value="${editPlan ? editPlan.unit : ''}" placeholder="ระบุหน่วยการเรียนรู้" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">สมรรถนะที่ต้องการพัฒนา</label>
                            <textarea class="form-textarea" name="competencies" placeholder="ระบุสมรรถนะที่นักเรียนจะได้พัฒนา" required>${editPlan ? editPlan.competencies : ''}</textarea>
                            <p class="form-hint">เช่น การคิดวิเคราะห์ การแก้ปัญหา การสื่อสาร การทำงานเป็นทีม</p>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">จุดประสงค์การเรียนรู้</label>
                            <textarea class="form-textarea" name="objectives" placeholder="ระบุสิ่งที่นักเรียนจะสามารถทำได้หลังเรียนจบ" required>${editPlan ? editPlan.objectives : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">กิจกรรม Active Learning</label>
                            <textarea class="form-textarea" name="activities" style="min-height: 180px;" placeholder="อธิบายกิจกรรมที่นักเรียนจะได้ลงมือทำ" required>${editPlan ? editPlan.activities : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">สื่อและแหล่งเรียนรู้</label>
                            <textarea class="form-textarea" name="materials" placeholder="ระบุสื่อการสอนและแหล่งเรียนรู้" required>${editPlan ? editPlan.materials : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">วิธีการวัดและประเมินผล</label>
                            <textarea class="form-textarea" name="assessment" placeholder="อธิบายวิธีการวัดว่านักเรียนบรรลุสมรรถนะ" required>${editPlan ? editPlan.assessment : ''}</textarea>
                        </div>
                        
                        <div class="btn-group">
                            <button type="submit" name="action" value="draft" class="btn btn-secondary">
                                <i class="fas fa-save"></i> บันทึกร่าง
                            </button>
                            <button type="submit" name="action" value="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> ส่งให้วิชาการตรวจ
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="navigateTo('my-plans')">
                                <i class="fas fa-times"></i> ยกเลิก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function savePlan(event, editId = null) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const action = event.submitter.value;
    
    const plan = {
        id: editId || generateId(),
        teacherId: currentUser.id,
        subject: formData.get('subject'),
        gradeLevel: formData.get('gradeLevel'),
        weekStart: formData.get('weekStart'),
        hours: formData.get('hours'),
        unit: formData.get('unit'),
        competencies: formData.get('competencies'),
        objectives: formData.get('objectives'),
        activities: formData.get('activities'),
        materials: formData.get('materials'),
        assessment: formData.get('assessment'),
        status: action === 'submit' ? 'pending' : 'draft',
        createdAt: editId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const plans = getPlans();
    
    if (editId) {
        const index = plans.findIndex(p => p.id === editId);
        if (index !== -1) {
            plan.createdAt = plans[index].createdAt;
            plans[index] = plan;
        }
    } else {
        plans.push(plan);
    }
    
    savePlans(plans);
    alert(action === 'submit' ? 'ส่งแผนการสอนเรียบร้อยแล้ว' : 'บันทึกร่างเรียบร้อยแล้ว');
    navigateTo('my-plans');
}

// ===== My Plans =====
function renderMyPlans() {
    const plans = getPlans().filter(p => p.teacherId === currentUser.id);
    
    if (plans.length === 0) {
        document.getElementById('contentArea').innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="empty-state">
                        <i class="fas fa-file-alt"></i>
                        <h3>ยังไม่มีแผนการสอน</h3>
                        <p>เริ่มสร้างแผนแรกของคุณเลย</p>
                        <button class="btn btn-primary" onclick="navigateTo('create-plan')">
                            <i class="fas fa-plus"></i> สร้างแผนการสอน
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const sortedPlans = [...plans].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">แผนการสอนของฉัน</h3>
                    <button class="btn btn-primary btn-sm" onclick="navigateTo('create-plan')">
                        <i class="fas fa-plus"></i> สร้างใหม่
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>วิชา</th>
                                    <th>ระดับชั้น</th>
                                    <th>หน่วย</th>
                                    <th>สัปดาห์</th>
                                    <th>สถานะ</th>
                                    <th>อัปเดต</th>
                                    <th>การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedPlans.map(plan => `
                                    <tr>
                                        <td>${plan.subject}</td>
                                        <td>${plan.gradeLevel}</td>
                                        <td>${plan.unit}</td>
                                        <td>${getWeekRange(plan.weekStart)}</td>
                                        <td>${getStatusBadge(plan.status)}</td>
                                        <td>${formatDateTime(plan.updatedAt)}</td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="action-btn view" onclick="viewPlan('${plan.id}')" title="ดู">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                ${plan.status === 'draft' || plan.status.includes('revision') ? `
                                                    <button class="action-btn edit" onclick="editPlan('${plan.id}')" title="แก้ไข">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                ` : ''}
                                                <button class="action-btn print" onclick="printPlan('${plan.id}')" title="พิมพ์">
                                                    <i class="fas fa-print"></i>
                                                </button>
                                                ${plan.status === 'draft' ? `
                                                    <button class="action-btn delete" onclick="deletePlan('${plan.id}')" title="ลบ">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function viewPlan(planId) {
    const plans = getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    const users = getUsers();
    const teacher = users.find(u => u.id === plan.teacherId);
    const comments = getComments().filter(c => c.targetId === planId && c.targetType === 'plan');
    
    let commentsHtml = '';
    if (comments.length > 0) {
        commentsHtml = `
            <div class="comments-section">
                <h4 style="margin-bottom: 16px;"><i class="fas fa-comments"></i> ความคิดเห็น</h4>
                ${comments.map(c => {
                    const commenter = users.find(u => u.id === c.userId);
                    return `
                        <div class="comment-item">
                            <div class="comment-avatar"><i class="fas fa-user"></i></div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="comment-author">${commenter ? commenter.name : 'ไม่ทราบ'} (${ROLE_LABELS[c.userRole]})</span>
                                    <span class="comment-date">${formatDateTime(c.createdAt)}</span>
                                </div>
                                <div class="comment-text">${c.text}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    showModal('รายละเอียดแผนการสอน', `
        <div class="approval-flow">
            <div class="flow-step ${plan.status !== 'draft' ? 'completed' : 'active'}">
                <i class="fas fa-user"></i> ครูสร้าง
            </div>
            <i class="fas fa-arrow-right flow-arrow"></i>
            <div class="flow-step ${plan.status === 'academic_approved' || plan.status === 'approved' ? 'completed' : (plan.status === 'pending' ? 'active' : '')}">
                <i class="fas fa-clipboard-check"></i> วิชาการตรวจ
            </div>
            <i class="fas fa-arrow-right flow-arrow"></i>
            <div class="flow-step ${plan.status === 'approved' ? 'completed' : (plan.status === 'academic_approved' ? 'active' : '')}">
                <i class="fas fa-check-double"></i> ผอ.อนุมัติ
            </div>
        </div>
        
        <div style="margin-bottom: 20px;"><strong>สถานะ:</strong> ${getStatusBadge(plan.status)}</div>
        <div class="form-row">
            <div><strong>ครูผู้สอน:</strong> ${teacher ? teacher.name : 'ไม่ทราบ'}</div>
            <div><strong>วิชา:</strong> ${plan.subject}</div>
        </div>
        <div class="form-row" style="margin-top: 12px;">
            <div><strong>ระดับชั้น:</strong> ${plan.gradeLevel}</div>
            <div><strong>จำนวนชั่วโมง:</strong> ${plan.hours} ชม.</div>
        </div>
        <div style="margin-top: 12px;"><strong>สัปดาห์:</strong> ${getWeekRange(plan.weekStart)}</div>
        <div style="margin-top: 12px;"><strong>หน่วยการเรียนรู้:</strong> ${plan.unit}</div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--border);">
        
        <div style="margin-bottom: 16px;">
            <strong>สมรรถนะที่ต้องการพัฒนา:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${plan.competencies}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong>จุดประสงค์การเรียนรู้:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${plan.objectives}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong>กิจกรรม Active Learning:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${plan.activities}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong>สื่อและแหล่งเรียนรู้:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${plan.materials}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong>วิธีการวัดและประเมินผล:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${plan.assessment}</p>
        </div>
        ${commentsHtml}
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">ปิด</button>
        <button class="btn btn-success" onclick="printPlan('${plan.id}'); closeModal();">
            <i class="fas fa-print"></i> พิมพ์
        </button>
    `);
}

function editPlan(planId) {
    const plans = getPlans();
    const plan = plans.find(p => p.id === planId);
    if (plan && (plan.status === 'draft' || plan.status.includes('revision'))) {
        document.getElementById('pageTitle').textContent = 'แก้ไขแผนการสอน';
        renderCreatePlan(plan);
    }
}

function deletePlan(planId) {
    if (confirm('คุณต้องการลบแผนการสอนนี้หรือไม่?')) {
        const plans = getPlans().filter(p => p.id !== planId);
        savePlans(plans);
        renderMyPlans();
    }
}

// ===== Create Reflection =====
function renderCreateReflection(editReflection = null) {
    const plans = getPlans().filter(p => p.teacherId === currentUser.id && p.status === 'approved');
    
    if (plans.length === 0 && !editReflection) {
        document.getElementById('contentArea').innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>ยังไม่มีแผนที่อนุมัติ</h3>
                        <p>คุณต้องมีแผนที่อนุมัติแล้วก่อนจึงจะเขียนบันทึกหลังสอนได้</p>
                        <button class="btn btn-primary" onclick="navigateTo('my-plans')">
                            <i class="fas fa-file-alt"></i> ดูแผนการสอนของฉัน
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const planOptions = plans.map(p => `
        <option value="${p.id}" ${editReflection && editReflection.planId === p.id ? 'selected' : ''}>
            ${p.subject} - ${p.gradeLevel} - ${p.unit} (${getWeekRange(p.weekStart)})
        </option>
    `).join('');
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${editReflection ? 'แก้ไขบันทึกหลังสอน' : 'เขียนบันทึกหลังสอน'}</h3>
                </div>
                <div class="card-body">
                    <div class="alert alert-info">
                        <i class="fas fa-lightbulb"></i>
                        <div>
                            <strong>หลักการสะท้อนคิด (Reflection):</strong> บันทึกหลังสอนช่วยให้ครูได้ทบทวนและพัฒนาการสอน
                        </div>
                    </div>
                    
                    <form id="reflectionForm" onsubmit="saveReflection(event, ${editReflection ? `'${editReflection.id}'` : 'null'})">
                        <div class="form-group">
                            <label class="form-label required">เลือกแผนการสอน</label>
                            <select class="form-select" name="planId" required ${editReflection ? 'disabled' : ''}>
                                <option value="">-- เลือกแผนการสอน --</option>
                                ${planOptions}
                            </select>
                            ${editReflection ? `<input type="hidden" name="planId" value="${editReflection.planId}">` : ''}
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">สิ่งที่เป็นไปตามแผน</label>
                            <textarea class="form-textarea" name="asPlanned" placeholder="อธิบายสิ่งที่ดำเนินไปตามแผน" required>${editReflection ? editReflection.asPlanned : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">สิ่งที่ต้องปรับเปลี่ยน</label>
                            <textarea class="form-textarea" name="adjustments" placeholder="อธิบายสิ่งที่ต้องปรับเปลี่ยน" required>${editReflection ? editReflection.adjustments : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">ผลการเรียนรู้ของนักเรียน</label>
                            <textarea class="form-textarea" name="learningOutcomes" placeholder="อธิบายสิ่งที่นักเรียนได้เรียนรู้" required>${editReflection ? editReflection.learningOutcomes : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">สิ่งที่จะทำต่างไปในครั้งหน้า</label>
                            <textarea class="form-textarea" name="improvements" placeholder="อธิบายสิ่งที่จะปรับปรุง" required>${editReflection ? editReflection.improvements : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">บันทึกเพิ่มเติม</label>
                            <textarea class="form-textarea" name="additionalNotes" placeholder="บันทึกอื่นๆ (ไม่บังคับ)">${editReflection ? editReflection.additionalNotes || '' : ''}</textarea>
                        </div>
                        
                        <div class="btn-group">
                            <button type="submit" name="action" value="draft" class="btn btn-secondary">
                                <i class="fas fa-save"></i> บันทึกร่าง
                            </button>
                            <button type="submit" name="action" value="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> ส่งให้วิชาการตรวจ
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="navigateTo('my-reflections')">
                                <i class="fas fa-times"></i> ยกเลิก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function saveReflection(event, editId = null) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const action = event.submitter.value;
    
    const reflection = {
        id: editId || generateId(),
        teacherId: currentUser.id,
        planId: formData.get('planId'),
        asPlanned: formData.get('asPlanned'),
        adjustments: formData.get('adjustments'),
        learningOutcomes: formData.get('learningOutcomes'),
        improvements: formData.get('improvements'),
        additionalNotes: formData.get('additionalNotes'),
        status: action === 'submit' ? 'pending' : 'draft',
        createdAt: editId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const reflections = getReflections();
    
    if (editId) {
        const index = reflections.findIndex(r => r.id === editId);
        if (index !== -1) {
            reflection.createdAt = reflections[index].createdAt;
            reflections[index] = reflection;
        }
    } else {
        reflections.push(reflection);
    }
    
    saveReflections(reflections);
    alert(action === 'submit' ? 'ส่งบันทึกหลังสอนเรียบร้อยแล้ว' : 'บันทึกร่างเรียบร้อยแล้ว');
    navigateTo('my-reflections');
}

// ===== My Reflections =====
function renderMyReflections() {
    const reflections = getReflections().filter(r => r.teacherId === currentUser.id);
    const plans = getPlans();
    
    if (reflections.length === 0) {
        document.getElementById('contentArea').innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="empty-state">
                        <i class="fas fa-book"></i>
                        <h3>ยังไม่มีบันทึกหลังสอน</h3>
                        <p>คุณยังไม่ได้เขียนบันทึกหลังสอน</p>
                        <button class="btn btn-primary" onclick="navigateTo('create-reflection')">
                            <i class="fas fa-edit"></i> เขียนบันทึกหลังสอน
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const sortedReflections = [...reflections].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    document.getElementById('contentArea').innerHTML = `
        <div class="slide-in-up">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">บันทึกหลังสอนของฉัน</h3>
                    <button class="btn btn-primary btn-sm" onclick="navigateTo('create-reflection')">
                        <i class="fas fa-plus"></i> เขียนใหม่
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>วิชา</th>
                                    <th>ระดับชั้น</th>
                                    <th>หน่วย</th>
                                    <th>สัปดาห์</th>
                                    <th>สถานะ</th>
                                    <th>อัปเดต</th>
                                    <th>การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedReflections.map(ref => {
                                    const plan = plans.find(p => p.id === ref.planId);
                                    return `
                                        <tr>
                                            <td>${plan ? plan.subject : '-'}</td>
                                            <td>${plan ? plan.gradeLevel : '-'}</td>
                                            <td>${plan ? plan.unit : '-'}</td>
                                            <td>${plan ? getWeekRange(plan.weekStart) : '-'}</td>
                                            <td>${getStatusBadge(ref.status)}</td>
                                            <td>${formatDateTime(ref.updatedAt)}</td>
                                            <td>
                                                <div class="action-buttons">
                                                    <button class="action-btn view" onclick="viewReflection('${ref.id}')" title="ดู">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    ${ref.status === 'draft' || ref.status.includes('revision') ? `
                                                        <button class="action-btn edit" onclick="editReflection('${ref.id}')" title="แก้ไข">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                    ` : ''}
                                                    <button class="action-btn print" onclick="printReflection('${ref.id}')" title="พิมพ์">
                                                        <i class="fas fa-print"></i>
                                                    </button>
                                                    ${ref.status === 'draft' ? `
                                                        <button class="action-btn delete" onclick="deleteReflection('${ref.id}')" title="ลบ">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function viewReflection(refId) {
    const reflections = getReflections();
    const ref = reflections.find(r => r.id === refId);
    if (!ref) return;
    
    const plans = getPlans();
    const plan = plans.find(p => p.id === ref.planId);
    const users = getUsers();
    const teacher = users.find(u => u.id === ref.teacherId);
    const comments = getComments().filter(c => c.targetId === refId && c.targetType === 'reflection');
    
    let commentsHtml = '';
    if (comments.length > 0) {
        commentsHtml = `
            <div class="comments-section">
                <h4 style="margin-bottom: 16px;"><i class="fas fa-comments"></i> ความคิดเห็น</h4>
                ${comments.map(c => {
                    const commenter = users.find(u => u.id === c.userId);
                    return `
                        <div class="comment-item">
                            <div class="comment-avatar"><i class="fas fa-user"></i></div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="comment-author">${commenter ? commenter.name : 'ไม่ทราบ'} (${ROLE_LABELS[c.userRole]})</span>
                                    <span class="comment-date">${formatDateTime(c.createdAt)}</span>
                                </div>
                                <div class="comment-text">${c.text}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    showModal('รายละเอียดบันทึกหลังสอน', `
        <div class="approval-flow">
            <div class="flow-step ${ref.status !== 'draft' ? 'completed' : 'active'}">
                <i class="fas fa-user"></i> ครูบันทึก
            </div>
            <i class="fas fa-arrow-right flow-arrow"></i>
            <div class="flow-step ${ref.status === 'academic_approved' || ref.status === 'approved' ? 'completed' : (ref.status === 'pending' ? 'active' : '')}">
                <i class="fas fa-clipboard-check"></i> วิชาการตรวจ
            </div>
            <i class="fas fa-arrow-right flow-arrow"></i>
            <div class="flow-step ${ref.status === 'approved' ? 'completed' : (ref.status === 'academic_approved' ? 'active' : '')}">
                <i class="fas fa-check-double"></i> ผอ.รับทราบ
            </div>
        </div>
        
        <div style="margin-bottom: 20px;"><strong>สถานะ:</strong> ${getStatusBadge(ref.status)}</div>
        <div style="margin-bottom: 12px;"><strong>ครูผู้สอน:</strong> ${teacher ? teacher.name : 'ไม่ทราบ'}</div>
        ${plan ? `
            <div class="form-row" style="margin-bottom: 12px;">
                <div><strong>วิชา:</strong> ${plan.subject}</div>
                <div><strong>ระดับชั้น:</strong> ${plan.gradeLevel}</div>
            </div>
            <div style="margin-bottom: 12px;"><strong>หน่วย:</strong> ${plan.unit}</div>
            <div style="margin-bottom: 12px;"><strong>สัปดาห์:</strong> ${getWeekRange(plan.weekStart)}</div>
        ` : ''}
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--border);">
        
        <div style="margin-bottom: 16px;">
            <strong>สิ่งที่เป็นไปตามแผน:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${ref.asPlanned}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong>สิ่งที่ต้องปรับเปลี่ยน:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${ref.adjustments}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong>ผลการเรียนรู้ของนักเรียน:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${ref.learningOutcomes}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong>สิ่งที่จะทำต่างไปในครั้งหน้า:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${ref.improvements}</p>
        </div>
        ${ref.additionalNotes ? `
            <div style="margin-bottom: 16px;">
                <strong>บันทึกเพิ่มเติม:</strong>
                <p style="margin-top: 8px; white-space: pre-wrap;">${ref.additionalNotes}</p>
            </div>
        ` : ''}
        ${commentsHtml}
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">ปิด</button>
        <button class="btn btn-success" onclick="printReflection('${ref.id}'); closeModal();">
            <i class="fas fa-print"></i> พิมพ์
        </button>
    `);
}

function editReflection(refId) {
    const reflections = getReflections();
    const ref = reflections.find(r => r.id === refId);
    if (ref && (ref.status === 'draft' || ref.status.includes('revision'))) {
        document.getElementById('pageTitle').textContent = 'แก้ไขบันทึกหลังสอน';
        renderCreateReflection(ref);
    }
}

function deleteReflection(refId) {
    if (confirm('คุณต้องการลบบันทึกหลังสอนนี้หรือไม่?')) {
        const reflections = getReflections().filter(r => r.id !== refId);
        saveReflections(reflections);
        renderMyReflections();
    }
}

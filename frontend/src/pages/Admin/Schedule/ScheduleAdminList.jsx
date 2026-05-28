import React, { useState, useEffect } from 'react';
import { 
  MdAdd, MdViewList, MdViewWeek, MdCalendarViewMonth, MdClose, 
  MdDashboard, MdPeople, MdEventNote, MdAssessment, MdSettings, MdLocalHospital,
  MdNavigateBefore, MdNavigateNext
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import './ScheduleAdminList.css';

const WEEK_DAYS = [
  { key: 1, label: 'Thứ 2' },
  { key: 2, label: 'Thứ 3' },
  { key: 3, label: 'Thứ 4' },
  { key: 4, label: 'Thứ 5' },
  { key: 5, label: 'Thứ 6' },
  { key: 6, label: 'Thứ 7' },
  { key: 0, label: 'Chủ Nhật' }
];

const ScheduleAdminList = () => {
  const [viewMode, setViewMode] = useState('week'); // month, week, list
  const [schedules, setSchedules] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('05'); // Mặc định tháng 5
  const [selectedWeek, setSelectedWeek] = useState('all'); // Bộ lọc tuần
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCellDetail, setSelectedCellDetail] = useState(null);
  const [formData, setFormData] = useState({ staffId: '', date: '', shift: 'Sáng', note: '' });
  const [currentMenu, setCurrentMenu] = useState('schedule');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Tải danh sách nhân viên
      const staffRes = await api.get('/staff');
      let currentStaffs = [];
      if (staffRes.data.success) {
        currentStaffs = staffRes.data.data;
        setStaffList(currentStaffs);
      }

      // 2. Tải danh sách lịch trực
      const scheduleRes = await api.get('/schedules');
      if (scheduleRes.data.success) {
        const mapped = scheduleRes.data.data.map(s => {
          const d = new Date(s.shiftDate);
          let shiftVal = 'Sáng';
          if (s.shiftType === 'AFTERNOON') shiftVal = 'Chiều';
          return {
            id: s.id,
            staffId: s.staffId,
            date: s.shiftDate.substring(0, 10), // định dạng YYYY-MM-DD
            dayNum: d.getDate(),
            shift: shiftVal,
            note: s.notes
          };
        });
        setSchedules(mapped);
      }
    } catch (error) {
      toast.error('Không thể kết nối cơ sở dữ liệu để tải ca trực');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getShiftColor = (shift) => {
    switch(shift) {
      case 'Sáng': return 'shift-morning';
      case 'Chiều': return 'shift-afternoon';
      default: return 'shift-off';
    }
  };

  const getStaffScheduleForDay = (staffId, dayNum) => {
    return schedules.find(s => s.staffId === staffId && s.dayNum === dayNum);
  };

  const calculateTotalShifts = (staffId) => {
    return schedules.filter(s => s.staffId === staffId).length;
  };

  const handleCellClick = (staffId, dayNum) => {
    const staffRaw = staffList.find(s => s.id === staffId);
    if (!staffRaw) return;
    
    const staff = {
      id: staffRaw.id,
      name: staffRaw.fullName,
      role: staffRaw.roleName || 'Nhân sự',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(staffRaw.fullName)}&background=1a3c5e&color=fff`
    };
    const shiftData = getStaffScheduleForDay(staffId, dayNum);
    setSelectedCellDetail({
      dayLabel: `Ngày ${dayNum}/${selectedMonth}/2026`,
      staff,
      schedule: shiftData
    });
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá ca trực này khỏi cơ sở dữ liệu?')) {
      try {
        const res = await api.delete(`/schedules/${id}`);
        if (res.data.success) {
          toast.success('Đã xoá ca trực thành công');
          setSelectedCellDetail(null);
          fetchData();
        } else {
          toast.error(res.data.message || 'Lỗi khi xoá ca trực');
        }
      } catch (error) {
        toast.error('Lỗi khi xoá ca trực');
      }
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if(!formData.staffId || !formData.date) {
      toast.warning('Vui lòng chọn nhân viên và ngày trực');
      return;
    }
    
    // Map từ Tiếng Việt sang DB ENUM
    const dbShiftType = formData.shift === 'Chiều' ? 'AFTERNOON' : 'MORNING';

    try {
      const res = await api.post('/schedules', {
        staffId: parseInt(formData.staffId),
        shiftDate: formData.date,
        shiftType: dbShiftType,
        notes: formData.note
      });

      if (res.data.success) {
        toast.success('Đã lưu phân công ca trực thành công!');
        setIsModalOpen(false);
        setFormData({ staffId: '', date: '', shift: 'Sáng', note: '' });
        fetchData();
      } else {
        toast.error(res.data.message || 'Lỗi khi lưu ca trực');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  // Tính toán thống kê từ dữ liệu thật
  const totalShifts = schedules.length;
  const todayDateNum = new Date().getDate();
  const todayDay = new Date().getDay();
  const staffWorkingToday = schedules.filter(s => s.dayNum === todayDateNum).length;
  
  const staffShiftCounts = staffList.map(staff => ({
    id: staff.id,
    name: staff.fullName,
    role: staff.roleName || 'Nhân sự',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.fullName)}&background=1a3c5e&color=fff`,
    count: calculateTotalShifts(staff.id)
  })).sort((a, b) => b.count - a.count);

  const topStaff = staffShiftCounts.slice(0, 3);
  const unassignedStaff = staffShiftCounts.filter(s => s.count === 0);

  // Lọc danh sách theo tuần/tháng được chọn
  const filteredSchedulesForList = schedules.filter(s => {
    // Lọc theo tháng
    const isMonthMatch = s.date.includes(`2026-${selectedMonth}`);
    if (!isMonthMatch) return false;

    // Lọc theo tuần
    if (selectedWeek !== 'all') {
      const day = s.dayNum;
      if (selectedWeek === '1' && (day < 1 || day > 7)) return false;
      if (selectedWeek === '2' && (day < 8 || day > 14)) return false;
      if (selectedWeek === '3' && (day < 15 || day > 21)) return false;
      if (selectedWeek === '4' && (day < 22 || day > 31)) return false;
    }
    return true;
  });

  return (
    <div className="clinic-main-content animate-fade-in">
      {/* HEADER BAR */}
        <header className="content-header">
          <div className="header-title-area">
            <h1>Phân công Lịch Trực</h1>
            <span className="header-subtitle">Hệ thống lập lịch và quản lý ca làm việc tự động</span>
          </div>
          
          {/* Bộ lọc tháng/tuần */}
          <div className="header-filters">
            <div className="filter-group">
              <label>Tháng</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="05">Tháng 05/2026</option>
                <option value="06">Tháng 06/2026</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Tuần</label>
              <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
                <option value="all">Cả tháng</option>
                <option value="1">Tuần 1 (Ngày 1 - 7)</option>
                <option value="2">Tuần 2 (Ngày 8 - 14)</option>
                <option value="3">Tuần 3 (Ngày 15 - 21)</option>
                <option value="4">Tuần 4 (Ngày 22 - 31)</option>
              </select>
            </div>
          </div>

          <div className="header-actions">
            <div className="view-switchers">
              <button className={`switch-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>
                <MdCalendarViewMonth /> Tháng
              </button>
              <button className={`switch-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>
                <MdViewWeek /> Tuần
              </button>
              <button className={`switch-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                <MdViewList /> Danh sách
              </button>
            </div>
            <button className="btn-add-shift" onClick={() => setIsModalOpen(true)}>
              <MdAdd /> + Thêm ca trực
            </button>
          </div>
        </header>

        {/* BẢNG CHÚ GIẢI MÀU SẮC CA TRỰC */}
        <div className="schedule-legend-bar">
          <span className="legend-title">Chú giải ca trực:</span>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-dot shift-morning"></span>
              <span className="legend-text">Ca Sáng (08:00 - 11:30)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot shift-afternoon"></span>
              <span className="legend-text">Ca Chiều (13:00 - 17:00)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot shift-off"></span>
              <span className="legend-text">Nghỉ / Không trực</span>
            </div>
          </div>
        </div>

        {/* CONTAINER CHÍNH */}
        <div className="dashboard-grid">
          {/* TRÁI: BẢNG LỊCH HOẶC DANH SÁCH */}
          <section className="grid-left-panel">
            {/* VIEW THÁNG (Ô LỊCH THÁNG) */}
            {viewMode === 'month' && (
              <div className="dashboard-card">
                <div className="month-calendar-header">
                  <button className="nav-month-btn"><MdNavigateBefore /> Tháng trước</button>
                  <h2>Tháng 05 năm 2026</h2>
                  <button className="nav-month-btn">Tháng sau <MdNavigateNext /></button>
                </div>
                <div className="month-grid">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <div key={d} className="month-grid-weekday">{d}</div>
                  ))}
                  {/* Generate 31 ngày cho tháng 5/2026 (ngày 1 tháng 5 là thứ 6 => có 4 ô trống đầu tháng) */}
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="month-grid-day empty"></div>
                  ))}
                  {Array.from({ length: 31 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = `2026-05-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                    const daySchedules = schedules.filter(s => s.date === dateStr);
                    
                    return (
                      <div 
                        key={dayNum} 
                        className={`month-grid-day ${dayNum === todayDateNum ? 'today' : ''}`}
                        onClick={() => {
                          if (daySchedules.length > 0) {
                            const mappedSchedules = daySchedules.map(sc => {
                              const st = staffList.find(s => s.id === sc.staffId);
                              return {
                                ...sc,
                                staffName: st?.fullName || 'Nhân sự',
                                staffRole: st?.roleName || 'Nhân viên',
                                staffAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(st?.fullName || 'N')}&background=1a3c5e&color=fff`
                              };
                            });
                            setSelectedCellDetail({
                              dayLabel: `Ngày ${dayNum}/05/2026`,
                              multipleSchedules: mappedSchedules
                            });
                          }
                        }}
                      >
                        <span className="day-number">{dayNum}</span>
                        <div className="day-shifts-container">
                          {daySchedules.slice(0, 2).map((sc, sIdx) => {
                            const staff = staffList.find(st => st.id === sc.staffId);
                            const nameToDisplay = staff ? (staff.fullName.includes('BS. ') ? staff.fullName.split('BS. ')[1] : staff.fullName) : 'Nhân sự';
                            return (
                              <div key={sIdx} className={`month-shift-badge ${getShiftColor(sc.shift)}`}>
                                {nameToDisplay}: {sc.shift}
                              </div>
                            );
                          })}
                          {daySchedules.length > 2 && (
                            <div className="more-shifts-indicator">+{daySchedules.length - 2} ca nữa</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW TUẦN (MATRIX LỊCH 7 NGÀY - MỖI CỘT 1 NGÀY, HÀNG LÀ NHÂN VIÊN) */}
            {viewMode === 'week' && (
              <div className="dashboard-card">
                {loading ? (
                  <div style={{ padding: '40px', textPlaying: 'center', textAlign: 'center', color: '#718096' }}>Đang tải dữ liệu ca trực...</div>
                ) : (
                  <div className="table-responsive">
                    <table className="matrix-table">
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Họ & Tên</th>
                          <th>Chức vụ</th>
                          {WEEK_DAYS.map(day => (
                            <th key={day.key} className={day.key === todayDay ? 'highlight-today' : ''}>
                              {day.label}
                            </th>
                          ))}
                          <th>Tổng ca</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map((staff, index) => {
                          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.fullName)}&background=1a3c5e&color=fff`;
                          return (
                            <tr key={staff.id} className="matrix-row">
                              <td className="text-center text-muted">{index + 1}</td>
                              <td>
                                <div className="staff-avatar-cell">
                                  <img src={avatarUrl} alt={staff.fullName} className="mini-avatar" />
                                  <span className="staff-name-text">{staff.fullName}</span>
                                </div>
                              </td>
                              <td><span className="staff-role-badge">{staff.roleName || 'Nhân sự'}</span></td>
                              
                              {WEEK_DAYS.map(day => {
                                // Map day.key vào dayNum của tuần hiện tại (giả định từ ngày 15 đến 21)
                                const dayNum = 17 + (day.key === 0 ? 6 : day.key - 1); 
                                const shiftData = getStaffScheduleForDay(staff.id, dayNum);
                                return (
                                  <td key={day.key} className="shift-cell" onClick={() => handleCellClick(staff.id, dayNum)}>
                                    {shiftData ? (
                                      <div className={`shift-badge ${getShiftColor(shiftData.shift)}`}>
                                        {shiftData.shift}
                                      </div>
                                    ) : (
                                      <div className="shift-badge shift-off">Nghỉ</div>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="text-center font-weight-bold text-primary">
                                {calculateTotalShifts(staff.id)} ca
                              </td>
                            </tr>
                          );
                        })}
                        {staffList.length === 0 && (
                          <tr>
                            <td colSpan="11" className="text-center text-muted" style={{ padding: '20px' }}>Không có nhân viên nào trong hệ thống.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* VIEW DANH SÁCH (BẢNG THÔNG TIN) */}
            {viewMode === 'list' && (
              <div className="dashboard-card">
                <div className="table-responsive">
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th>Ngày trực</th>
                        <th>Ca trực</th>
                        <th>Nhân viên</th>
                        <th>Chức vụ</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedulesForList.sort((a,b) => a.dayNum - b.dayNum).map((sc, i) => {
                        const staff = staffList.find(s => s.id === sc.staffId);
                        const avatarUrl = staff ? `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.fullName)}&background=1a3c5e&color=fff` : '';
                        return (
                          <tr key={i} className="matrix-row">
                            <td><strong>{sc.date}</strong></td>
                            <td><span className={`shift-badge ${getShiftColor(sc.shift)}`}>Ca {sc.shift}</span></td>
                            <td>
                              <div className="staff-avatar-cell">
                                <img src={avatarUrl} alt={staff?.fullName} className="mini-avatar" />
                                <span>{staff?.fullName || 'Nhân sự'}</span>
                              </div>
                            </td>
                            <td><span className="staff-role-badge">{staff?.roleName || 'Nhân sự'}</span></td>
                            <td className="text-muted">{sc.note || '-'}</td>
                          </tr>
                        )
                      })}
                      {filteredSchedulesForList.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">Không tìm thấy ca trực nào trong thời gian này.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* PHẢI: BẢNG THỐNG KÊ */}
          <section className="grid-right-panel">
            <div className="stat-card primary">
              <span className="stat-title">Tổng ca trực tháng này</span>
              <div className="stat-number">{totalShifts}</div>
              <span className="stat-trend">Phân bổ đều cho các ca</span>
            </div>
            
            <div className="stat-card secondary">
              <span className="stat-title">Đang trực hôm nay</span>
              <div className="stat-number">{staffWorkingToday}</div>
              <span className="stat-trend">Nhân viên đang tại phòng khám</span>
            </div>

            <div className="stat-card list-card">
              <h3 className="card-section-title">Top nhân viên trực nhiều</h3>
              <ul className="leaderboard-list">
                {topStaff.map((s, idx) => (
                  <li key={s.id}>
                    <div className="leader-rank">{idx + 1}</div>
                    <img src={s.avatar} alt={s.name} className="mini-avatar" />
                    <div className="leader-info">
                      <span className="leader-name">{s.name}</span>
                      <span className="leader-role">{s.role}</span>
                    </div>
                    <div className="leader-count">{s.count} ca</div>
                  </li>
                ))}
              </ul>
            </div>

            {unassignedStaff.length > 0 && (
              <div className="stat-card danger">
                <h3 className="card-section-title text-danger">Chưa được phân công</h3>
                <ul className="unassigned-list">
                  {unassignedStaff.map(s => (
                    <li key={s.id}>
                      <img src={s.avatar} alt={s.name} className="mini-avatar" />
                      <span>{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

      {/* DETAIL MODAL (KHI CLICK VÀO Ô) */}
      {selectedCellDetail && (
        <div className="sm-modal-overlay">
          <div className="sm-modal detail-modal animate-slide-down">
            <div className="sm-modal-header">
              <h2>Chi tiết ca trực ({selectedCellDetail.dayLabel})</h2>
              <button className="close-btn" onClick={() => setSelectedCellDetail(null)}><MdClose /></button>
            </div>
            <div className="sm-modal-body">
              {/* Trường hợp nhiều ca trực (View Tháng) */}
              {selectedCellDetail.multipleSchedules ? (
                <div className="multiple-schedules-list">
                  {selectedCellDetail.multipleSchedules.map((sc, sIdx) => {
                    return (
                      <div key={sIdx} className="detail-staff-info" style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px dashed #e2e8f0' }}>
                        <img src={sc.staffAvatar} alt={sc.staffName} className="detail-avatar" />
                        <div style={{ flexGrow: 1 }}>
                          <strong>{sc.staffName}</strong>
                          <p className="text-muted" style={{ fontSize: '12px' }}>{sc.staffRole}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`shift-badge ${getShiftColor(sc.shift)}`}>Ca {sc.shift}</span>
                          <button 
                            className="close-btn" 
                            style={{ color: '#e53e3e', fontSize: '18px', padding: '4px' }}
                            onClick={() => handleDeleteSchedule(sc.id)}
                            title="Xóa ca trực khỏi CSDL"
                          >
                            <MdClose />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Trường hợp 1 ca trực (View Tuần) */
                <>
                  <div className="detail-item">
                    <label>Nhân viên</label>
                    <div className="detail-staff-info">
                      <img src={selectedCellDetail.staff.avatar} alt={selectedCellDetail.staff.name} className="detail-avatar" />
                      <div>
                        <strong>{selectedCellDetail.staff.name}</strong>
                        <p className="text-muted">{selectedCellDetail.staff.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái / Ca trực</label>
                    <div className="detail-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {selectedCellDetail.schedule ? (
                        <>
                          <span className={`shift-badge ${getShiftColor(selectedCellDetail.schedule.shift)}`}>
                            Ca {selectedCellDetail.schedule.shift}
                          </span>
                          <button 
                            className="btn-save" 
                            style={{ backgroundColor: '#e53e3e', padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => handleDeleteSchedule(selectedCellDetail.schedule.id)}
                          >
                            Xóa ca trực
                          </button>
                        </>
                      ) : (
                        <span className="shift-badge shift-off">Nghỉ</span>
                      )}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Ghi chú</label>
                    <div className="detail-value">{selectedCellDetail.schedule?.note || 'Không có ghi chú'}</div>
                  </div>
                </>
              )}
              <div className="sm-modal-footer">
                <button className="btn-cancel" onClick={() => setSelectedCellDetail(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL THÊM CA TRỰC */}
      {isModalOpen && (
        <div className="sm-modal-overlay">
          <div className="sm-modal animate-slide-down">
            <div className="sm-modal-header">
              <h2>+ Thêm / Sửa Ca Trực</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><MdClose /></button>
            </div>
            <form className="sm-modal-body" onSubmit={handleSaveSchedule}>
              <div className="form-group">
                <label>Chọn Nhân viên</label>
                <select 
                  value={formData.staffId} 
                  onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.roleName || 'Nhân sự'})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Ngày trực</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Loại ca làm việc</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="shift" value="Sáng" checked={formData.shift === 'Sáng'} onChange={() => setFormData({...formData, shift: 'Sáng'})} />
                    <span className="shift-badge shift-morning">🟦 Ca Sáng (08:00 - 11:30)</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="shift" value="Chiều" checked={formData.shift === 'Chiều'} onChange={() => setFormData({...formData, shift: 'Chiều'})} />
                    <span className="shift-badge shift-afternoon">🟨 Ca Chiều (13:00 - 17:00)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea 
                  placeholder="Ghi chú thêm về ca trực..." 
                  value={formData.note} 
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  rows="3"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
                />
              </div>

              <div className="sm-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-save">Lưu ca trực</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAdminList;

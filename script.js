// متغيرات عامة
let currentUser = null;
let stations = [];
let users = [];
let bookings = [];

// تحديد البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    initializePage();
    setupEventListeners();
});

// تحميل البيانات من Local Storage
function loadDataFromStorage() {
    currentUser = JSON.parse(localStorage.getItem('trainScout_currentUser')) || null;
    stations = JSON.parse(localStorage.getItem('trainScout_stations')) || [];
    users = JSON.parse(localStorage.getItem('trainScout_users')) || [];
    bookings = JSON.parse(localStorage.getItem('trainScout_bookings')) || [];
    
    // إنشاء بيانات تجريبية إذا لم توجد
    if (stations.length === 0) {
        createSampleData();
    }
}

// حفظ البيانات في Local Storage
function saveDataToStorage() {
    localStorage.setItem('trainScout_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('trainScout_stations', JSON.stringify(stations));
    localStorage.setItem('trainScout_users', JSON.stringify(users));
    localStorage.setItem('trainScout_bookings', JSON.stringify(bookings));
}

// إنشاء بيانات تجريبية
function createSampleData() {
    stations = [

    ];
    
    // إنشاء بعض المستخدمين التجريبيين
    users = [

    ];
    
    saveDataToStorage();
}

// تهيئة الصفحة حسب اسم الملف
function initializePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            break;
        case 'profile.html':
            initializeProfilePage();
            break;
        case 'stations.html':
            initializeStationsPage();
            break;
        case 'attendance.html':
            initializeAttendancePage();
            break;
        case 'edit-profile.html':
            initializeEditProfilePage();
            break;
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // نموذج التسجيل
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        const profileImageInput = document.getElementById('profileImage');
        if (profileImageInput) {
            profileImageInput.addEventListener('change', handleImagePreview);
        }
    }
    
    // نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // نموذج تعديل الملف الشخصي
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleEditProfile);
        
        const editProfileImageInput = document.getElementById('editProfileImage');
        if (editProfileImageInput) {
            editProfileImageInput.addEventListener('change', handleEditImagePreview);
        }
    }
    
    // نموذج إضافة محطة
    const addStationForm = document.getElementById('addStationForm');
    if (addStationForm) {
        addStationForm.addEventListener('submit', handleAddStation);
    }
    
    // البحث في المحطات
    const searchStations = document.getElementById('searchStations');
    if (searchStations) {
        searchStations.addEventListener('input', handleSearchStations);
    }
    
    // البحث في المستخدمين
    const searchUsers = document.getElementById('searchUsers');
    if (searchUsers) {
        searchUsers.addEventListener('input', handleSearchUsers);
    }
}

// التعامل مع تسجيل الحساب
function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        id: Date.now(),
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        profileImage: null,
        attendanceCount: 0,
        bonusPoints: 0,
        totalBookings: 0,
        memberSince: new Date().getFullYear().toString(),
        createdAt: new Date().toISOString()
    };
    
    // التحقق من عدم وجود البريد الإلكتروني مسبقاً
    if (users.find(user => user.email === userData.email)) {
        showNotification('هذا البريد الإلكتروني مسجل مسبقاً', 'error');
        return;
    }
    
    // التعامل مع الصورة
    const profileImageInput = document.getElementById('profileImage');
    if (profileImageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            userData.profileImage = e.target.result;
            completeRegistration(userData);
        };
        reader.readAsDataURL(profileImageInput.files[0]);
    } else {
        completeRegistration(userData);
    }
}

function completeRegistration(userData) {
    users.push(userData);
    currentUser = userData;
    saveDataToStorage();
    
    showNotification('تم إنشاء الحساب بنجاح!', 'success');
    setTimeout(() => {
        showProfilePage();
    }, 1500);
}

// التعامل مع تسجيل الدخول
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        saveDataToStorage();
        showNotification('مرحباً بعودتك!', 'success');
        setTimeout(() => {
            showProfilePage();
        }, 1500);
    } else {
        showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    }
}

// التعامل مع تعديل الملف الشخصي
function handleEditProfile(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const formData = new FormData(e.target);
    
    currentUser.fullName = formData.get('editFullName');
    currentUser.email = formData.get('editEmail');
    currentUser.phone = formData.get('editPhone');
    
    // تحديث كلمة المرور إذا تم إدخالها
    const newPassword = formData.get('editPassword');
    if (newPassword && newPassword.trim() !== '') {
        currentUser.password = newPassword;
    }
    
    // التعامل مع الصورة الجديدة
    const profileImageInput = document.getElementById('editProfileImage');
    if (profileImageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentUser.profileImage = e.target.result;
            completeProfileEdit();
        };
        reader.readAsDataURL(profileImageInput.files[0]);
    } else {
        completeProfileEdit();
    }
}

function completeProfileEdit() {
    // تحديث المستخدم في قائمة المستخدمين
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    }
    
    saveDataToStorage();
    showNotification('تم تحديث البيانات بنجاح!', 'success');
    
    setTimeout(() => {
        showProfilePage();
    }, 1500);
}

// التعامل مع إضافة محطة
function handleAddStation(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const features = formData.getAll('features');
    
    const stationData = {
        id: Date.now(),
        title: formData.get('stationTitle'),
        date: formData.get('departureDate'),
        ticketCount: parseInt(formData.get('ticketCount')),
        originalTicketCount: parseInt(formData.get('ticketCount')),
        price: parseFloat(formData.get('ticketPrice')),
        description: formData.get('stationDescription'),
        features: features,
        createdAt: new Date().toISOString()
    };
    
    stations.push(stationData);
    saveDataToStorage();
    
    showNotification('تم إضافة المحطة بنجاح!', 'success');
    
    setTimeout(() => {
        showStationsPage();
    }, 1500);
}

// معاينة الصورة
function handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="معاينة الصورة" style="max-width: 150px; max-height: 150px; border-radius: 10px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

function handleEditImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('editImagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="معاينة الصورة" style="max-width: 150px; max-height: 150px; border-radius: 10px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// البحث في المحطات
function handleSearchStations(e) {
    const searchTerm = e.target.value.toLowerCase();
    displayStations(stations.filter(station => 
        station.title.toLowerCase().includes(searchTerm) ||
        station.description.toLowerCase().includes(searchTerm)
    ));
}

// البحث في المستخدمين
function handleSearchUsers(e) {
    const searchTerm = e.target.value.toLowerCase();
    const selectedStationId = document.getElementById('stationFilter').value;
    
    let filteredUsers = users;
    
    // تطبيق فلتر المحطة أولاً (المحطة مطلوبة الآن)
    if (selectedStationId) {
        const stationBookings = bookings.filter(booking => booking.stationId == selectedStationId);
        const userIds = stationBookings.map(booking => booking.userId);
        filteredUsers = users.filter(user => userIds.includes(user.id));
    } else {
        // إذا لم تكن هناك محطة محددة، لا تعرض أي مستخدمين
        filteredUsers = [];
    }
    
    // ثم تطبيق البحث بالاسم
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }
    
    displayAttendanceTable(filteredUsers, selectedStationId);
}

// تهيئة صفحة الملف الشخصي
function initializeProfilePage() {
    if (!currentUser) {
        showLoginPage();
        return;
    }
    
    document.getElementById('profileName').textContent = currentUser.fullName;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('attendanceCount').textContent = currentUser.attendanceCount || 0;
    document.getElementById('bonusPoints').textContent = currentUser.bonusPoints || 0;
    document.getElementById('totalBookings').textContent = currentUser.totalBookings || 0;
    document.getElementById('memberSince').textContent = currentUser.memberSince || '2025';
    
    if (currentUser.profileImage) {
        document.getElementById('profileImageDisplay').src = currentUser.profileImage;
    }
}

// تهيئة صفحة المحطات
function initializeStationsPage() {
    if (!currentUser) {
        showLoginPage();
        return;
    }
    
    displayStations(stations);
}

function displayStations(stationsToDisplay) {
    const stationsGrid = document.getElementById('stationsGrid');
    const noStations = document.getElementById('noStations');
    
    if (!stationsGrid) return;
    
    if (stationsToDisplay.length === 0) {
        stationsGrid.style.display = 'none';
        noStations.style.display = 'block';
        return;
    }
    
    stationsGrid.style.display = 'grid';
    noStations.style.display = 'none';
    
    stationsGrid.innerHTML = stationsToDisplay.map(station => `
        <div class="station-card">
            <div class="station-header">
                <div class="station-title">
                    <i class="fas fa-train"></i>
                    ${station.title}
                </div>
                <div class="station-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(station.date)}
                </div>
            </div>
            <div class="station-body">
                <div class="station-info">
                    <div class="station-tickets">
                        <i class="fas fa-ticket-alt"></i>
                        ${station.ticketCount} تذكرة متاحة من أصل ${station.originalTicketCount}
                    </div>
                    <div class="station-price">
                        <i class="fas fa-money-bill"></i>
                        ${station.price} جنيه
                    </div>
                </div>
                <div class="station-description">
                    ${station.description}
                </div>
                <div class="station-features">
                    ${station.features.map(feature => getFeatureTag(feature)).join('')}
                </div>
                <div class="station-actions">
                    <button class="btn btn-primary" onclick="bookStation(${station.id})" ${station.ticketCount <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-ticket-alt"></i>
                        ${station.ticketCount <= 0 ? 'نفدت التذاكر' : 'حجز الآن'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// الحصول على تاج المميزة
function getFeatureTag(feature) {
    const features = {
        wifi: '<span class="feature-tag"><i class="fas fa-wifi"></i> واي فاي</span>',
        food: '<span class="feature-tag"><i class="fas fa-utensils"></i> وجبات</span>',
        ac: '<span class="feature-tag"><i class="fas fa-snowflake"></i> تكييف</span>',
        comfort: '<span class="feature-tag"><i class="fas fa-couch"></i> مقاعد مريحة</span>'
    };
    return features[feature] || '';
}

// حجز محطة
function bookStation(stationId) {
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول أولاً', 'error');
        return;
    }
    
    const station = stations.find(s => s.id === stationId);
    if (!station) {
        showNotification('المحطة غير موجودة', 'error');
        return;
    }
    
    if (station.ticketCount <= 0) {
        showNotification('نفدت التذاكر لهذه المحطة', 'error');
        return;
    }
    
    // عرض modal التأكيد
    document.getElementById('modalStationTitle').textContent = station.title;
    document.getElementById('modalStationDate').textContent = formatDate(station.date);
    document.getElementById('modalAvailableTickets').textContent = station.ticketCount;
    
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'block';
    
    // حفظ معرف المحطة للاستخدام في التأكيد
    modal.dataset.stationId = stationId;
}

function confirmBooking() {
    const modal = document.getElementById('bookingModal');
    const stationId = parseInt(modal.dataset.stationId);
    
    const station = stations.find(s => s.id === stationId);
    if (!station) return;
    
    // تقليل عدد التذاكر
    station.ticketCount--;
    
    // إضافة الحجز
    const booking = {
        id: Date.now(),
        userId: currentUser.id,
        stationId: stationId,
        stationTitle: station.title,
        bookingDate: new Date().toISOString(),
        status: 'booked'
    };
    bookings.push(booking);
    
    // تحديث بيانات المستخدم
    currentUser.totalBookings = (currentUser.totalBookings || 0) + 1;
    currentUser.bonusPoints = (currentUser.bonusPoints || 0) + 10; // 10 نقاط لكل حجز
    
    // تحديث المستخدم في القائمة أو إضافته إذا لم يكن موجود
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    } else {
        // إضافة المستخدم إلى قائمة المستخدمين إذا لم يكن موجود
        users.push(currentUser);
    }
    
    saveDataToStorage();
    closeBookingModal();
    
    showNotification('تم الحجز بنجاح! تم إضافة 10 نقاط بونص', 'success');
    displayStations(stations); // تحديث العرض
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

// تهيئة صفحة الحضور
function initializeAttendancePage() {
    if (!currentUser) {
        showLoginPage();
        return;
    }
    
    // إضافة المستخدمين الذين لديهم حجوزات إلى قائمة المستخدمين للحضور
    addBookedUsersToAttendance();
    populateStationFilter();
    updateAttendanceStats();
    displayAttendanceTable(users);
}

// إضافة المستخدمين الذين لديهم حجوزات إلى قائمة الحضور
function addBookedUsersToAttendance() {
    // الحصول على جميع المستخدمين الذين لديهم حجوزات
    const bookedUserIds = [...new Set(bookings.map(booking => booking.userId))];
    
    bookedUserIds.forEach(userId => {
        // التحقق من وجود المستخدم في قائمة المستخدمين
        if (!users.find(user => user.id === userId)) {
            // البحث عن المستخدم في localStorage أو إضافته
            const storedUsers = JSON.parse(localStorage.getItem('trainScout_users')) || [];
            const foundUser = storedUsers.find(user => user.id === userId);
            
            if (foundUser && !users.find(u => u.id === foundUser.id)) {
                users.push(foundUser);
            }
        }
    });
    
    // إضافة المستخدم الحالي إذا لم يكن موجود في القائمة
    if (currentUser && !users.find(user => user.id === currentUser.id)) {
        users.push(currentUser);
    }
    
    saveDataToStorage();
}

// ملء قائمة تصفية المحطات
function populateStationFilter() {
    const stationFilter = document.getElementById('stationFilter');
    if (!stationFilter) return;
    
    // الحصول على جميع المحطات التي تم حجزها
    const bookedStations = [...new Set(bookings.map(booking => ({
        id: booking.stationId,
        title: booking.stationTitle
    })).filter(station => station.title))];
    
    // مسح المحتوى السابق
    stationFilter.innerHTML = '';
    
    // إضافة المحطات المحجوزة فقط (بدون خيار "جميع المحطات")
    bookedStations.forEach((station, index) => {
        const option = document.createElement('option');
        option.value = station.id;
        option.textContent = station.title;
        // تحديد المحطة الأولى كافتراضية
        if (index === 0) {
            option.selected = true;
        }
        stationFilter.appendChild(option);
    });
    
    // تطبيق الفلتر تلقائياً إذا كانت هناك محطات
    if (bookedStations.length > 0) {
        filterByStation();
    }
}

// تصفية حسب المحطة
function filterByStation() {
    const selectedStationId = document.getElementById('stationFilter').value;
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    
    let filteredUsers = users;
    
    // تطبيق فلتر المحطة (المحطة مطلوبة الآن)
    if (selectedStationId) {
        // الحصول على المستخدمين الذين حجزوا المحطة المحددة
        const stationBookings = bookings.filter(booking => booking.stationId == selectedStationId);
        const userIds = stationBookings.map(booking => booking.userId);
        filteredUsers = users.filter(user => userIds.includes(user.id));
    } else {
        // إذا لم تكن هناك محطة محددة، لا تعرض أي مستخدمين
        filteredUsers = [];
    }
    
    // تطبيق البحث بالاسم إذا وجد
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }
    
    displayAttendanceTable(filteredUsers, selectedStationId);
    updateAttendanceStatsForStation(selectedStationId);
}

function updateAttendanceStats() {
    // إضافة المستخدمين الذين لديهم حجوزات إلى القائمة للإحصائيات
    addBookedUsersToAttendance();
    
    const totalUsers = users.length;
    const presentUsers = users.filter(user => user.attendanceCount > 0).length;
    const absentUsers = totalUsers - presentUsers;
    const totalBonusPoints = users.reduce((sum, user) => sum + (user.bonusPoints || 0), 0);
    
    const totalUsersElement = document.getElementById('totalUsers');
    const presentUsersElement = document.getElementById('presentUsers');
    const absentUsersElement = document.getElementById('absentUsers');
    const totalBonusPointsElement = document.getElementById('totalBonusPoints');
    
    if (totalUsersElement) totalUsersElement.textContent = totalUsers;
    if (presentUsersElement) presentUsersElement.textContent = presentUsers;
    if (absentUsersElement) absentUsersElement.textContent = absentUsers;
    if (totalBonusPointsElement) totalBonusPointsElement.textContent = totalBonusPoints;
}

function displayAttendanceTable(usersToDisplay, selectedStationId = null) {
    const tableBody = document.getElementById('attendanceTableBody');
    if (!tableBody) return;
    
    // إضافة المستخدمين الذين لديهم حجوزات ولكن غير موجودين في القائمة
    const allBookedUserIds = [...new Set(bookings.map(booking => booking.userId))];
    allBookedUserIds.forEach(userId => {
        if (!usersToDisplay.find(user => user.id === userId)) {
            // البحث عن المستخدم في localStorage
            const allUsers = JSON.parse(localStorage.getItem('trainScout_users')) || [];
            const bookedUser = allUsers.find(user => user.id === userId);
            if (bookedUser) {
                usersToDisplay.push(bookedUser);
            }
        }
    });
    
    if (usersToDisplay.length === 0) {
        document.getElementById('noAttendanceData').style.display = 'block';
        document.querySelector('.attendance-table-container').style.display = 'none';
        return;
    }
    
    document.getElementById('noAttendanceData').style.display = 'none';
    document.querySelector('.attendance-table-container').style.display = 'block';
    
    tableBody.innerHTML = usersToDisplay.map(user => {
        // تحديد الحجوزات حسب المحطة المختارة
        let userBookings = bookings.filter(booking => booking.userId === user.id);
        
        if (selectedStationId) {
            userBookings = userBookings.filter(booking => booking.stationId == selectedStationId);
        }
        
        let bookingStatus = '';
        
        if (userBookings.length > 0) {
            // عرض جميع الحجوزات للمحطة المختارة أو الحجز الأخير إذا لم تكن هناك محطة محددة
            if (selectedStationId) {
                // عرض جميع حجوزات المحطة المحددة
                const stationBookings = userBookings.map(booking => {
                    const bookingDate = formatDate(booking.bookingDate);
                    return `<div class="booking-item">
                        <i class="fas fa-check-circle"></i>
                        ${booking.stationTitle}<br>
                        <small>${bookingDate}</small>
                    </div>`;
                }).join('');
                
                bookingStatus = `<span class="booking-status booked">${stationBookings}</span>`;
            } else {
                // عرض الحجز الأخير فقط
                const latestBooking = userBookings[userBookings.length - 1];
                const bookingDate = formatDate(latestBooking.bookingDate);
                const stationName = latestBooking.stationTitle || 'محطة غير محددة';
                bookingStatus = `<span class="booking-status booked">
                    <i class="fas fa-check-circle"></i>
                    حجز ${stationName}<br>
                    <small>${bookingDate}</small>
                </span>`;
            }
        } else {
            bookingStatus = `<span class="booking-status not-booked">
                <i class="fas fa-times-circle"></i>
                لم يحجز
            </span>`;
        }
        
        // تحديد حالة الحضور للمحطة المحددة
        let attendanceKey = selectedStationId ? `attendance_${selectedStationId}` : 'attendanceCount';
        let attendanceValue = selectedStationId ? (user[attendanceKey] || 0) : (user.attendanceCount || 0);
        
        return `
            <tr>
                <td>
                    <div class="user-info">
                        <img src="${user.profileImage || 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=👤'}" 
                             alt="${user.fullName}" class="user-avatar">
                        <div>
                            <div style="font-weight: 600;">${user.fullName}</div>
                            <div style="font-size: 0.8rem; color: #666;">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>${bookingStatus}</td>
                <td>
                    <select class="attendance-select ${attendanceValue > 0 ? 'present' : 'absent'}" 
                            onchange="updateAttendanceForStation(${user.id}, this.value, ${selectedStationId || 'null'})">
                        <option value="absent" ${attendanceValue === 0 ? 'selected' : ''}>غائب</option>
                        <option value="present" ${attendanceValue > 0 ? 'selected' : ''}>حاضر</option>
                    </select>
                </td>
                <td>
                    <input type="number" value="${user.bonusPoints || 0}" 
                           class="bonus-input" min="0" max="10000"
                           onchange="updateBonusPoints(${user.id}, this.value)">
                </td>
                <td>
                    <button class="action-btn edit" onclick="editUserBonus(${user.id})">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// تحديث الحضور
function updateAttendance(userId, status) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (status === 'present') {
        user.attendanceCount = (user.attendanceCount || 0) + 1;
    } else {
        user.attendanceCount = 0;
    }
    
    saveDataToStorage();
    updateAttendanceStats();
    showNotification('تم تحديث الحضور', 'success');
}

// تحديث الحضور لمحطة معينة
function updateAttendanceForStation(userId, status, stationId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (stationId) {
        // تحديث الحضور للمحطة المحددة
        const attendanceKey = `attendance_${stationId}`;
        if (status === 'present') {
            user[attendanceKey] = 1;
        } else {
            user[attendanceKey] = 0;
        }
    } else {
        // تحديث الحضور العام
        if (status === 'present') {
            user.attendanceCount = (user.attendanceCount || 0) + 1;
        } else {
            user.attendanceCount = 0;
        }
    }
    
    saveDataToStorage();
    updateAttendanceStatsForStation(stationId);
    showNotification('تم تحديث الحضور', 'success');
}

// تحديث إحصائيات الحضور للمحطة
function updateAttendanceStatsForStation(stationId) {
    let relevantUsers = users;
    
    if (stationId) {
        // الحصول على المستخدمين الذين حجزوا المحطة المحددة
        const stationBookings = bookings.filter(booking => booking.stationId == stationId);
        const userIds = stationBookings.map(booking => booking.userId);
        relevantUsers = users.filter(user => userIds.includes(user.id));
    }
    
    const totalUsers = relevantUsers.length;
    let presentUsers = 0;
    
    if (stationId) {
        // عد المستخدمين الحاضرين للمحطة المحددة
        const attendanceKey = `attendance_${stationId}`;
        presentUsers = relevantUsers.filter(user => user[attendanceKey] > 0).length;
    } else {
        // عد المستخدمين الحاضرين عموماً
        presentUsers = relevantUsers.filter(user => user.attendanceCount > 0).length;
    }
    
    const absentUsers = totalUsers - presentUsers;
    const totalBonusPoints = relevantUsers.reduce((sum, user) => sum + (user.bonusPoints || 0), 0);
    
    const totalUsersElement = document.getElementById('totalUsers');
    const presentUsersElement = document.getElementById('presentUsers');
    const absentUsersElement = document.getElementById('absentUsers');
    const totalBonusPointsElement = document.getElementById('totalBonusPoints');
    
    if (totalUsersElement) totalUsersElement.textContent = totalUsers;
    if (presentUsersElement) presentUsersElement.textContent = presentUsers;
    if (absentUsersElement) absentUsersElement.textContent = absentUsers;
    if (totalBonusPointsElement) totalBonusPointsElement.textContent = totalBonusPoints;
}

// تحديث نقاط البونص
function updateBonusPoints(userId, points) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    user.bonusPoints = parseInt(points) || 0;
    
    // تحديث المستخدم الحالي إذا كان هو نفسه
    if (currentUser && currentUser.id === userId) {
        currentUser.bonusPoints = user.bonusPoints;
    }
    
    saveDataToStorage();
    updateAttendanceStats();
    showNotification('تم تحديث نقاط البونص', 'success');
}

// تحديث بيانات الحضور
function refreshAttendanceData() {
    loadDataFromStorage();
    addBookedUsersToAttendance();
    populateStationFilter();
    
    // إعادة تطبيق الفلاتر الحالية
    const selectedStationId = document.getElementById('stationFilter').value;
    filterByStation();
    
    showNotification('تم تحديث البيانات', 'success');
}

// فتح modal تعديل البونص
function editUserBonus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('modalUserName').textContent = user.fullName;
    document.getElementById('modalCurrentBonus').textContent = user.bonusPoints || 0;
    document.getElementById('newBonusPoints').value = user.bonusPoints || 0;
    
    const modal = document.getElementById('bonusModal');
    if (modal) {
        modal.style.display = 'block';
        modal.dataset.userId = userId;
    }
}

// إغلاق modal البونص
function closeBonusModal() {
    const modal = document.getElementById('bonusModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// تحديث نقاط البونص من Modal
function updateBonusPointsFromModal() {
    const modal = document.getElementById('bonusModal');
    const userId = parseInt(modal.dataset.userId);
    const newPoints = parseInt(document.getElementById('newBonusPoints').value) || 0;
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    user.bonusPoints = newPoints;
    
    // تحديث المستخدم الحالي إذا كان هو نفسه
    if (currentUser && currentUser.id === userId) {
        currentUser.bonusPoints = newPoints;
    }
    
    saveDataToStorage();
    closeBonusModal();
    updateAttendanceStats();
    displayAttendanceTable(users);
    showNotification('تم تحديث نقاط البونص', 'success');
}

// تصدير بيانات الحضور
function exportAttendanceData() {
    const data = {
        users: users,
        bookings: bookings,
        stations: stations,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `train_scout_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('تم تصدير البيانات', 'success');
}

// تهيئة صفحة تعديل الملف الشخصي
function initializeEditProfilePage() {
    if (!currentUser) {
        showLoginPage();
        return;
    }
    
    document.getElementById('editFullName').value = currentUser.fullName;
    document.getElementById('editEmail').value = currentUser.email;
    document.getElementById('editPhone').value = currentUser.phone;
    
    if (currentUser.profileImage) {
        document.getElementById('currentProfileImage').src = currentUser.profileImage;
    }
}

// التنقل بين الصفحات
function showRegisterPage() {
    window.location.href = 'register.html';
}

function showLoginPage() {
    window.location.href = 'login.html';
}

function showProfilePage() {
    window.location.href = 'profile.html';
}

function showEditProfilePage() {
    window.location.href = 'edit-profile.html';
}

function showStationsPage() {
    window.location.href = 'stations.html';
}

function showAddStationPage() {
    window.location.href = 'add-station.html';
}

function showAttendancePage() {
    window.location.href = 'attendance.html';
}

// تسجيل خروج
function logout() {
    currentUser = null;
    localStorage.removeItem('trainScout_currentUser');
    showNotification('تم تسجيل الخروج بنجاح', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// عرض الإشعارات
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة CSS للإشعار إذا لم يكن موجوداً
    if (!document.querySelector('.notification-styles')) {
        const style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                z-index: 10001;
                min-width: 300px;
                animation: notificationShow 0.3s ease;
                border-left: 4px solid #4CAF50;
            }
            .notification-success { border-left-color: #4CAF50; }
            .notification-error { border-left-color: #ff6b6b; }
            .notification-warning { border-left-color: #ffa726; }
            .notification-info { border-left-color: #29b6f6; }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .notification-content i {
                font-size: 1.2rem;
                color: #4CAF50;
            }
            .notification-success .notification-content i { color: #4CAF50; }
            .notification-error .notification-content i { color: #ff6b6b; }
            .notification-warning .notification-content i { color: #ffa726; }
            .notification-info .notification-content i { color: #29b6f6; }
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #999;
                padding: 0.25rem;
            }
            .notification-close:hover { color: #333; }
            @keyframes notificationShow {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);
    
    // إزالة الإشعار تلقائياً بعد 5 ثواني
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Cairo'
    };
    return date.toLocaleDateString('ar-EG', options);
}

// عرض تاريخ الحجوزات
function viewBookingHistory() {
    if (!currentUser) return;
    
    const userBookings = bookings.filter(booking => booking.userId === currentUser.id);
    
    if (userBookings.length === 0) {
        showNotification('لا توجد حجوزات سابقة', 'info');
        return;
    }
    
    let historyHtml = '<div style="max-height: 300px; overflow-y: auto;">';
    userBookings.forEach(booking => {
        historyHtml += `
            <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 10px; margin-bottom: 1rem;">
                <h4 style="color: #4CAF50; margin-bottom: 0.5rem;">${booking.stationTitle}</h4>
                <p style="color: #666; margin: 0;">تاريخ الحجز: ${formatDate(booking.bookingDate)}</p>
            </div>
        `;
    });
    historyHtml += '</div>';
    
    // إنشاء modal مخصص لتاريخ الحجوزات
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>تاريخ الحجوزات</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                ${historyHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// إغلاق modal عند النقر خارجه
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

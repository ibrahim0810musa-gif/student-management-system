/* =====================================
   1. SIDEBAR MENU
===================================== */

const menuToggle = document.querySelector("#menu-toggle");
const sidebarMenu = document.querySelector("#sidebar-menu");
const menuClose = document.querySelector("#menu-close");
const menuOverlay = document.querySelector("#menu-overlay");

if (menuToggle && sidebarMenu && menuClose && menuOverlay) {
    function closeSidebar() {
        sidebarMenu.classList.remove("active");
        menuOverlay.classList.remove("active");
        sessionStorage.setItem("sidebarOpen", "false");
        menuToggle.setAttribute("aria-expanded", "false");
        menuOverlay.setAttribute("aria-hidden", "true");
    }

    function openSidebar() {
        sidebarMenu.classList.add("active");
        menuOverlay.classList.add("active");
        sessionStorage.setItem("sidebarOpen", "true");
        menuToggle.setAttribute("aria-expanded", "true");
        menuOverlay.setAttribute("aria-hidden", "false");
    }

    menuToggle.addEventListener("click", openSidebar);
    menuClose.addEventListener("click", closeSidebar);
    menuOverlay.addEventListener("click", closeSidebar);

    // Restore the menu after navigating to another page.
    if (sessionStorage.getItem("sidebarOpen") === "true") {
        openSidebar();
    }
}


/* =====================================
   2. SELECT HTML ELEMENTS
===================================== */

const studentForm = document.querySelector("#student-form");
const studentName = document.querySelector("#student-name");
const studentEmail = document.querySelector("#student-email");
const studentClass = document.querySelector("#student-class");
const studentStatus = document.querySelector("#student-status");

const studentsList = document.querySelector("#students-list");
const searchStudents = document.querySelector("#search-students");
const searchCount = document.querySelector("#search-count");

const deleteConfirmation = document.getElementById("delete-confirmation");
const cancelDelete = document.getElementById("cancel-delete");
const confirmDelete = document.getElementById("confirm-delete");

const totalStudentsElement = document.getElementById("total-students");
const activeStudentsElement = document.getElementById("active-students");
const inactiveStudentsElement = document.getElementById("inactive-students");
const totalClassesElement = document.getElementById("total-classes");
const classDistribution = document.getElementById("class-distribution");

const darkModeToggle = document.getElementById("dark-mode-toggle");
const saveSettingsButton = document.getElementById("save-settings");

const contactForm = document.getElementById("contact-form");
const contactFeedback = document.getElementById("contact-feedback");

const deleteOverlay = document.getElementById("delete-overlay");
/* =====================================
   3. LOAD SAVED STUDENTS
===================================== */

let students = [];
let studentToDelete = null;
let editingStudentId = null;

const savedStudents = localStorage.getItem("students");

if (savedStudents) {
    try {
        students = JSON.parse(savedStudents);

        if (!Array.isArray(students)) {
            students = [];
        }
    } catch (error) {
        students = [];
        console.error("The saved student data could not be read.", error);
    }
}


/* =====================================
   4. STUDENT COUNTER AND CLASS CAPACITIES
===================================== */

let studentCount = Number(localStorage.getItem("studentCount")) || 0;

students.forEach(function(student) {
    const idNumber = Number(String(student.id).replace("STU00", ""));

    if (idNumber > studentCount) {
        studentCount = idNumber;
    }
});

localStorage.setItem("studentCount", String(studentCount));

const classCapacities = {
    "Primary 1": 35,
    "Primary 2": 30,
    "Primary 3": 35,
    "JSS 1": 40,
    "JSS 2": 40,
    "SSS 1": 40
};

const dashboardClasses = [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "JSS 1",
    "JSS 2",
    "SSS 1"
];


/* =====================================
   5. CUSTOM NOTIFICATION MESSAGES
===================================== */

function showNotification(message, type) {
    const notificationContainer = document.getElementById("notification-container");

    // Avoid an error on pages that do not contain the notification container.
    if (!notificationContainer) {
        console.warn("Add #notification-container to this page to display notifications.");
        return;
    }

    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className = "notification " + type;

    notificationContainer.appendChild(notification);

    setTimeout(function() {
        notification.remove();
    }, 3000);
}


/* =====================================
   6. UPDATE DASHBOARD COUNTS
===================================== */

function updateDashboard() {
    if (totalStudentsElement) {
        totalStudentsElement.textContent = students.length;
    }

    if (activeStudentsElement) {
        activeStudentsElement.textContent = students.filter(function(student) {
            return student.status === "Active";
        }).length;
    }

    if (inactiveStudentsElement) {
        inactiveStudentsElement.textContent = students.filter(function(student) {
            return student.status === "Inactive";
        }).length;
    }

    if (totalClassesElement) {
        totalClassesElement.textContent = dashboardClasses.length;
    }

    if (classDistribution) {
        classDistribution.innerHTML = "";

        dashboardClasses.forEach(function(className) {
            const studentsInClass = students.filter(function(student) {
                return student.classes === className;
            });

            const listItem = document.createElement("li");
            listItem.textContent =
                className + ": " + studentsInClass.length + " students";

            classDistribution.appendChild(listItem);
        });
    }
}


/* =====================================
   7. UPDATE CLASS PAGE COUNTS AND WARNINGS
===================================== */

function updateClassCards() {
    const classNames = document.querySelectorAll(".class-name");

    classNames.forEach(function(classNameElement) {
        const classCard = classNameElement.closest(".class-card");

        if (!classCard) {
            return;
        }

        const registeredCount = classCard.querySelector(".registered-count");
        const capacityElement = classCard.querySelector(".student-capacity");
        const capacityWarning = classCard.querySelector(".capacity-warning");
        const currentClass = classNameElement.textContent.trim();

        const matchingStudents = students.filter(function(student) {
            return student.classes === currentClass;
        });

        if (registeredCount) {
            registeredCount.textContent = matchingStudents.length;
        }

        if (capacityElement && capacityWarning) {
            const capacity = Number(capacityElement.textContent);

            if (matchingStudents.length >= capacity) {
                capacityWarning.textContent = "WARNING: This class is full!";
            } else {
                capacityWarning.textContent = "";
            }
        }
    });
}


/* =====================================
   8. DISPLAY ONE STUDENT IN THE TABLE
===================================== */

function displayStudent(student) {
    if (!studentsList) {
        return;
    }

    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    const nameCell = document.createElement("td");
    const emailCell = document.createElement("td");
    const classCell = document.createElement("td");
    const statusCell = document.createElement("td");
    const actionsCell = document.createElement("td");

    idCell.textContent = student.id;
    nameCell.textContent = student.name;
    emailCell.textContent = student.email;
    classCell.textContent = student.classes;
    statusCell.textContent = student.status;

    /* Create Delete button */
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("red");

    actionsCell.appendChild(deleteButton);

    /* Open the confirmation dialog; do not delete yet. */
    deleteButton.addEventListener("click", function() {
        studentToDelete = student.id;

        if (deleteConfirmation) {
            deleteConfirmation.style.display = "block";

if(deleteOverlay) {
             deleteOverlay.classList.add("active");
        }else {
             showNotification("The deleteOverlay dialog is missing from students.html.", "error");
        }
        
        } else {
            showNotification("The delete confirmation dialog is missing from students.html.", "error");
        }
        
        
    });

    /* Create Edit button */
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.classList.add("green");

    actionsCell.appendChild(editButton);

    /* Load the selected student's details into the form. */
    editButton.addEventListener("click", function() {
        if (!studentName || !studentEmail || !studentClass || !studentStatus) {
            return;
        }

        studentName.value = student.name;
        studentEmail.value = student.email;
        studentClass.value = student.classes;
        studentStatus.value = student.status;

        editingStudentId = student.id;
    });

    /* Add cells to the table row. */
    row.appendChild(idCell);
    row.appendChild(nameCell);
    row.appendChild(emailCell);
    row.appendChild(classCell);
    row.appendChild(statusCell);
    row.appendChild(actionsCell);

    studentsList.appendChild(row);
}


/* =====================================
   9. RENDER THE STUDENT LIST AND SEARCH
===================================== */

function renderStudents() {
    if (!studentsList) {
        return;
    }

    const searchText = searchStudents
        ? searchStudents.value.trim().toLowerCase()
        : "";

    const visibleStudents = students.filter(function(student) {
        return student.name.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText);
    });

    studentsList.innerHTML = "";

    if (searchCount) {
        if (searchText) {
            searchCount.textContent = "Search results: " + visibleStudents.length + " found";
        } else {
            searchCount.textContent = "Total students: " + students.length;
        }
    }

    if (visibleStudents.length === 0) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");

        emptyCell.colSpan = 6;
        emptyCell.textContent = searchText
            ? "No students found. Try another name or email."
            : "No students registered yet.";

        emptyRow.appendChild(emptyCell);
        studentsList.appendChild(emptyRow);
        return;
    }

    visibleStudents.forEach(function(student) {
        displayStudent(student);
    });
}

if (searchStudents) {
    searchStudents.addEventListener("input", renderStudents);
}


/* =====================================
   10. CANCEL STUDENT DELETION
===================================== */

if (cancelDelete) {
    cancelDelete.addEventListener("click", function() {
        if (deleteConfirmation) {
            deleteConfirmation.style.display = "none";
        }

if(deleteOverlay) {
             deleteOverlay.classList.remove("active");
        }
        
        studentToDelete = null;
    });
}


/* =====================================
   11. CONFIRM STUDENT DELETION
===================================== */

if (confirmDelete) {
    confirmDelete.addEventListener("click", function() {
        if (studentToDelete === null) {
            showNotification("Please select a student to delete first.", "warning");
            return;
        }

        const studentExists = students.some(function(student) {
            return student.id === studentToDelete;
        });

        if (!studentExists) {
            showNotification("This student could not be found.", "error");

            if (deleteConfirmation) {
                deleteConfirmation.style.display = "none";
            }
if(deleteOverlay) {
             deleteOverlay.classList.remove("active");
        }
            studentToDelete = null;
            return;
        }

        students = students.filter(function(student) {
            return student.id !== studentToDelete;
        });

        localStorage.setItem("students", JSON.stringify(students));

        // Keep the saved counter in sync when the list becomes empty.
        if (students.length === 0) {
            localStorage.setItem("studentCount", "0");
            studentCount = 0;
        }

        if (deleteConfirmation) {
            deleteConfirmation.style.display = "none";
        }

if(deleteOverlay) {
             deleteOverlay.classList.remove("active");
        }
        
        studentToDelete = null;

        renderStudents();
        updateDashboard();
        updateClassCards();

    showNotification("Student deleted successfully.", "succes")
    });
}

/* =====================================
   12. EDIT AND SAVE STUDENT CHANGES
===================================== */

const saveChanges = document.querySelector("#save-changes");

if (saveChanges) {
    saveChanges.addEventListener("click", function() {
        if (!studentName || !studentEmail || !studentClass || !studentStatus) {
            return;
        }

        const updatedName = studentName.value.trim();

        if (updatedName === "") {
            showNotification("Please enter the student's name!", "warning");
            return;
        }

        const updateEmail = studentEmail.value.trim();

        if (updateEmail === "") {
            showNotification("Please enter the student's email!", "warning");
            return;
        }

        if (!updateEmail.includes("@") || !updateEmail.includes(".")) {
            showNotification("Enter a valid email.", "warning");
            return;
        }

        const emailExists = students.some(function(student) {
            return student.id !== editingStudentId &&
                student.email.toLowerCase() === updateEmail.toLowerCase();
        });

        if (emailExists) {
            showNotification("This email already exists!", "warning");
            return;
        }

        const updateClass = studentClass.value;
        const updateStatus = studentStatus.value;

        const studentToUpdate = students.find(function(student) {
            return student.id === editingStudentId;
        });

        if (!studentToUpdate) {
            showNotification("Select a student to edit first.", "warning");
            return;
        }

        // Check the capacity only when the student changes to another class.
        if (updateClass !== studentToUpdate.classes) {
            const studentsInTargetClass = students.filter(function(student) {
                return student.classes === updateClass &&
                    student.id !== editingStudentId;
            });

            const capacity = classCapacities[updateClass];

            if (capacity !== undefined && studentsInTargetClass.length >= capacity) {
                showNotification("This class is full!", "error");
                return;
            }
        }

        studentToUpdate.name = updatedName;
        studentToUpdate.email = updateEmail;
        studentToUpdate.classes = updateClass;
        studentToUpdate.status = updateStatus;

        localStorage.setItem("students", JSON.stringify(students));

        editingStudentId = null;

        renderStudents();
        updateDashboard();
        updateClassCards();

        showNotification("Student details updated successfully.", "success");
    });
}


/* =====================================
   13. REGISTER A NEW STUDENT
===================================== */

if (studentForm) {
    studentForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = studentName.value.trim();
        const email = studentEmail.value.trim();
        const classes = studentClass.value;
        const status = studentStatus.value;

        if (name === "") {
            showNotification("Please enter the student's name!", "error");
            return;
        }

        if (email === "") {
            showNotification("Please enter the student's email!", "error");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            showNotification("Enter a valid email.", "error");
            return;
        }

        if (classes === "") {
            showNotification("Please select the student's class!", "warning");
            return;
        }

        const studentsInClass = students.filter(function(student) {
            return student.classes === classes;
        });

        const capacity = classCapacities[classes];

        if (capacity !== undefined && studentsInClass.length >= capacity) {
            showNotification("This class is full! Please select another class.", "error");
            return;
        }

        if (status === "") {
            showNotification("Please select the student's status!", "error");
            return;
        }

        const emailExists = students.some(function(student) {
            return student.email.toLowerCase() === email.toLowerCase();
        });

        if (emailExists) {
            showNotification("This email is already registered!", "error");
            return;
        }

        studentCount += 1;

        const studentInfo = {
            id: "STU00" + studentCount,
            name: name,
            email: email,
            classes: classes,
            status: status
        };

        students.push(studentInfo);

        localStorage.setItem("students", JSON.stringify(students));
        localStorage.setItem("studentCount", String(studentCount));

        renderStudents();
        updateDashboard();
        updateClassCards();

        studentForm.reset();

        showNotification("Student registered successfully.", "success");
    });
}


/* =====================================
   14. DARK MODE SETTINGS
===================================== */

const savedDarkMode = localStorage.getItem("darkMode");

if (savedDarkMode === "enabled") {
    document.body.classList.add("dark-mode");
}

if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }
    });
}


/* =====================================
   15. CONTACT FORM FEATURE
===================================== */

if (contactForm) {
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("contact-name").value.trim();
        const reason = document.getElementById("contact-reason").value;
        const phone = document.getElementById("contact-phone").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        if (name === "") {
            showNotification("Please enter your full name.", "warning");
            return;
        }

        if (reason === "") {
            showNotification("Please select a reason for contacting the school.", "warning");
            return;
        }

        if (phone === "") {
            showNotification("Please enter your phone number.", "warning");
            return;
        }

        if (email === "") {
            showNotification("Please enter your email address.", "warning");
            return;
        }

        if (message === "") {
            showNotification("Please enter your message.", "warning");
            return;
        }

        const feedbackMessage =
            "Thank you, " + name + "! Your message has been prepared successfully.";

        if (contactFeedback) {
            contactFeedback.textContent = feedbackMessage;
            contactFeedback.style.color = "green";
        } else {
            showNotification(feedbackMessage, "success");
        }

        contactForm.reset();
    });
}


/* =====================================
   16. SAVE SETTINGS FEATURE
===================================== */

if (saveSettingsButton) {
    saveSettingsButton.addEventListener("click", function() {
        const darkModeEnabled = document.body.classList.contains("dark-mode");

        localStorage.setItem(
            "darkMode",
            darkModeEnabled ? "enabled" : "disabled"
        );

        showNotification("Your settings have been saved successfully!", "success");
    });
}


/* =====================================
   17. INITIAL PAGE UPDATES
===================================== */

updateDashboard();
updateClassCards();
renderStudents();


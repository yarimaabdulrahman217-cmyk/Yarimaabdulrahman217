/**
 * STUDENT ATTENDANCE SYSTEM - JAVASCRIPT MODULE
 * "Yarima" attendance with white font & alarm
 * 
 * This script manages student attendance state, renders the UI,
 * and controls the alarm system.
 */

(function() {
    "use strict";

    // ----- CONFIGURATION -----
    const STUDENT_NAMES = [
        "Aisha", "Bello", "Chioma", "David", "Emeka",
        "Fatima", "Gideon", "Halima", "Ifeanyi", "James",
        "Kemi", "Lami", "Musa", "Ngozi", "Obi",
        "Precious", "Qudus", "Ruth", "Suleiman", "Tunde",
        "Uche", "Victoria", "Wale", "Xavier", "Yakubu",
        "Zainab", "YARIMA"   // YARIMA explicitly included
    ];

    // ----- STATE -----
    let students = [];              // Array of { name, present }
    let alarmActive = false;       // Boolean flag
    let alarmInterval = null;      // Interval ID for repeating beeps
    let audioCtx = null;           // Web Audio context

    // ----- DOM REFERENCES -----
    const listEl = document.getElementById('studentList');
    const alarmText = document.getElementById('alarmText');
    const alarmBadge = document.getElementById('alarmBadge');
    const markAllPresentBtn = document.getElementById('markAllPresent');
    const markAllAbsentBtn = document.getElementById('markAllAbsent');
    const alarmArea = document.getElementById('alarmArea');

    // =============================================
    // 1. AUDIO / ALARM FUNCTIONS
    // =============================================

    /**
     * Play a single beep sound using Web Audio API
     */
    function playAlarmBeep() {
        try {
            // Initialize audio context on first use
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 880;  // A5 note
            oscillator.type = 'square';
            
            // Quick fade out to avoid click
            gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.25);
        } catch (e) {
            // Silently fail if audio not supported or blocked
            console.warn('Alarm beep unavailable:', e.message);
        }
    }

    /**
     * Start the repeating alarm
     */
    function startAlarm() {
        if (alarmActive) return;
        
        alarmActive = true;
        alarmBadge.classList.add('active');
        alarmText.textContent = '🔊 ALARM ACTIVE';
        
        // Beep immediately
        playAlarmBeep();
        
        // Set up repeating beeps every 2.2 seconds
        if (alarmInterval) clearInterval(alarmInterval);
        alarmInterval = setInterval(() => {
            if (alarmActive) {
                playAlarmBeep();
            }
        }, 2200);
    }

    /**
     * Stop the repeating alarm
     */
    function stopAlarm() {
        alarmActive = false;
        
        if (alarmInterval) {
            clearInterval(alarmInterval);
            alarmInterval = null;
        }
        
        alarmBadge.classList.remove('active');
        alarmText.textContent = 'alarm ready';
    }

    /**
     * Check attendance and trigger/stop alarm accordingly
     */
    function evaluateAlarm() {
        const anyAbsent = students.some(s => !s.present);
        
        if (anyAbsent) {
            startAlarm();
        } else {
            stopAlarm();
        }
    }

    // =============================================
    // 2. RENDER / UI FUNCTIONS
    // =============================================

    /**
     * Render the student list in the DOM
     */
    function render() {
        let html = '';
        
        students.forEach((student, index) => {
            const statusClass = student.present ? '' : 'absent';
            const statusLabel = student.present ? 'Present' : 'Absent';
            
            // Special marker for YARIMA
            const isYarima = student.name.toUpperCase() === 'YARIMA';
            const nameDisplay = isYarima ? `${student.name} ⭐` : student.name;
            
            html += `
                <li class="student-item" data-index="${index}">
                    <span class="student-name">${nameDisplay} <small>#${index + 1}</small></span>
                    <div class="status-badge">
                        <span class="status-indicator ${statusClass}"></span>
                        <button class="toggle-btn" data-index="${index}">${statusLabel}</button>
                    </div>
                </li>
            `;
        });
        
        listEl.innerHTML = html;
        
        // Attach click handlers to all toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.getAttribute('data-index'), 10);
                
                if (!isNaN(idx) && idx >= 0 && idx < students.length) {
                    // Toggle attendance status
                    students[idx].present = !students[idx].present;
                    
                    // Re-render and re-evaluate alarm
                    render();
                    evaluateAlarm();
                }
            });
        });
    }

    // =============================================
    // 3. DATA MANAGEMENT
    // =============================================

    /**
     * Initialize student data with default "present" status
     */
    function initStudents() {
        students = STUDENT_NAMES.map(name => ({
            name: name,
            present: true   // All present by default
        }));
    }

    /**
     * Mark all students as present
     */
    function markAllPresent() {
        students.forEach(s => s.present = true);
        render();
        evaluateAlarm();
    }

    /**
     * Mark all students as absent
     */
    function markAllAbsent() {
        students.forEach(s => s.present = false);
        render();
        evaluateAlarm();
    }

    // =============================================
    // 4. EVENT BINDING & INITIALIZATION
    // =============================================

    /**
     * Set up all event listeners
     */
    function bindEvents() {
        // Bulk action buttons
        markAllPresentBtn.addEventListener('click', markAllPresent);
        markAllAbsentBtn.addEventListener('click', markAllAbsent);
        
        // Double-click on alarm area to manually stop alarm
        alarmArea.addEventListener('dblclick', function() {
            if (alarmActive) {
                stopAlarm();
                alarmText.textContent = '⏸ alarm stopped (manual)';
                
                // Reset message after 2 seconds
                setTimeout(() => {
                    if (!alarmActive) {
                        alarmText.textContent = 'alarm ready';
                    }
                }, 2000);
            }
        });
        
        // Initialize audio context on first user interaction
        document.addEventListener('click', function initAudio() {
            if (!audioCtx) {
                try {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                } catch (_) {
                    // Ignore
                }
            }
        }, { once: true });
    }

    /**
     * Start the application
     */
    function init() {
        initStudents();
        render();
        evaluateAlarm();  // No alarm initially (all present)
        bindEvents();
        
        console.log('✅ Yarima attendance system ready');
    }

    // ----- START -----
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
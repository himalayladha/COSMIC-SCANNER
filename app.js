/* ==========================================================================
   GLOBAL APP STATE
   ========================================================================== */
const state = {
    currentLanguage: 'en', // 'en' or 'hi'
    activeTab: 'tab-dashboard',
    selectedModel: 'gemini', // 'gemini' or 'chatgpt'
    userData: {
        name: '',
        dob: '',
        time: '',
        place: '',
        leftPalmImg: null,
        rightPalmImg: null,
        zodiac: {},
        lifePath: 0,
        lifePathDesc: '',
        element: ''
    },
    oracleHistory: []
};

// Default static images for mock run if user doesn't upload photos
const MOCK_LEFT_PALM = 'palmistry_hand.png';
const MOCK_RIGHT_PALM = 'palmistry_hand.png';

// Ambient audio status
let isAudioPlaying = false;
const ambientAudio = document.getElementById('cosmic-ambient-audio');
const soundToggle = document.getElementById('sound-toggle');

/* ==========================================================================
   DICTIONARY (ENGLISH & HINDI TRANSLATIONS)
   ========================================================================== */
const i18n = {
    en: {
        zodiacs: {
            Aries: { name: 'Aries', element: 'Fire', hindi: 'मेष', elementHi: 'अग्नि' },
            Taurus: { name: 'Taurus', element: 'Earth', hindi: 'वृषभ', elementHi: 'पृथ्वी' },
            Gemini: { name: 'Gemini', element: 'Air', hindi: 'Gemini (मिथुन)', elementHi: 'Air (वायु)' },
            Cancer: { name: 'Cancer', element: 'Water', hindi: 'कर्क', elementHi: 'जल' },
            Leo: { name: 'Leo', element: 'Fire', hindi: 'सिंह', elementHi: 'अग्नि' },
            Virgo: { name: 'Virgo', element: 'Earth', hindi: 'कन्या', elementHi: 'पृथ्वी' },
            Libra: { name: 'Libra', element: 'Air', hindi: 'तुला', elementHi: 'वायु' },
            Scorpio: { name: 'Scorpio', element: 'Water', hindi: 'वृश्चिक', elementHi: 'जल' },
            Sagittarius: { name: 'Sagittarius', element: 'Fire', hindi: 'धनु', elementHi: 'अग्नि' },
            Capricorn: { name: 'Capricorn', element: 'Earth', hindi: 'मकर', elementHi: 'पृथ्वी' },
            Aquarius: { name: 'Aquarius', element: 'Air', hindi: 'कुंभ', elementHi: 'वायु' },
            Pisces: { name: 'Pisces', element: 'Water', hindi: 'मीन', elementHi: 'जल' }
        },
        lifePaths: {
            1: { title: 'The Pioneer', desc: 'Independent, leader, innovative', hindiTitle: 'अग्रणी', hindiDesc: 'स्वतंत्र, नेता, नवोन्मेषी' },
            2: { title: 'The Diplomat', desc: 'Harmonious, sensitive, supportive', hindiTitle: 'राजनयिक', hindiDesc: 'सामंजस्यपूर्ण, संवेदनशील, सहायक' },
            3: { title: 'The Creative', desc: 'Expressive, artistic, social', hindiTitle: 'रचनात्मक', hindiDesc: 'अभिव्यक्तिशील, कलात्मक, सामाजिक' },
            4: { title: 'The Builder', desc: 'Practical, disciplined, stable', hindiTitle: 'निर्माता', hindiDesc: 'व्यावहारिक, अनुशासित, स्थिर' },
            5: { title: 'The Adventurer / अन्वेषक', desc: 'Freedom-loving, dynamic, versatile', hindiTitle: 'अन्वेषक', hindiDesc: 'स्वतंत्रता-प्रेमी, गतिशील, बहुमुखी' },
            6: { title: 'The Nurturer', desc: 'Responsible, loving, protective', hindiTitle: 'पोषक', hindiDesc: 'जिम्मेदार, स्नेही, सुरक्षात्मक' },
            7: { title: 'The Seeker', desc: 'Analytical, spiritual, intuitive', hindiTitle: 'खोजकर्ता', hindiDesc: 'विश्लेषणात्मक, आध्यात्मिक, अंतर्ज्ञानी' },
            8: { title: 'The Achiever', desc: 'Ambitious, powerful, realistic', hindiTitle: 'सफल व्यक्ति', hindiDesc: 'महत्वाकांक्षी, शक्तिशाली, यथार्थवादी' },
            9: { title: 'The Philanthropist', desc: 'Compassionate, wise, selfless', hindiTitle: 'परोपकारी', hindiDesc: 'दयालु, बुद्धिमान, निःस्वार्थ' },
            11: { title: 'The Intuitive Messenger', desc: 'Highly spiritual, visionary, inspired', hindiTitle: 'अंतर्ज्ञानी दूत', hindiDesc: 'अत्यधिक आध्यात्मिक, दूरदर्शी, प्रेरित' },
            22: { title: 'The Master Builder', desc: 'Practical visionary, powerful creator', hindiTitle: 'महा-निर्माता', hindiDesc: 'व्यावहारिक दूरदर्शी, शक्तिशाली निर्माता' }
        },
        ui: {
            langToggle: 'हिन्दी में देखें',
            resetBtn: 'Scan Another',
            pdfBtn: 'Download PDF',
            zodiacLabel: 'Zodiac Alignment',
            lifePathLabel: 'Life Path Number'
        }
    },
    hi: {
        ui: {
            langToggle: 'View in English',
            resetBtn: 'नया स्कैन',
            pdfBtn: 'PDF डाउनलोड करें',
            zodiacLabel: 'राशि संरेखण',
            lifePathLabel: 'जीवन पथ संख्या'
        }
    }
};

/* ==========================================================================
   INITIALIZE WEBCAM & CAMERA MODAL
   ========================================================================== */
let localStream = null;
let currentPalmSide = 'left';

function openCameraModal(palmSide) {
    currentPalmSide = palmSide;
    const modal = document.getElementById('camera-modal');
    const modalTitle = document.getElementById('modal-palm-title');
    
    // Set title
    if (state.currentLanguage === 'en') {
        modalTitle.textContent = `Capture ${palmSide.charAt(0).toUpperCase() + palmSide.slice(1)} Palm`;
    } else {
        modalTitle.textContent = `${palmSide === 'left' ? 'बायाँ' : 'दायाँ'} हाथ कैप्चर करें`;
    }
    
    modal.classList.add('active');
    
    // Start Webcam
    const video = document.getElementById('webcam-video');
    const cameraSelect = document.getElementById('camera-select');
    
    cameraSelect.innerHTML = '';
    
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
    }).then(stream => {
        localStream = stream;
        video.srcObject = stream;
        
        // Enumerate devices
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            videoDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                cameraSelect.appendChild(option);
            });
        });
    }).catch(err => {
        console.error("Camera access error:", err);
        alert(state.currentLanguage === 'en' ? 
            "Unable to access camera. Please upload file instead." : 
            "कैमरा एक्सेस करने में असमर्थ। कृपया फाइल अपलोड का उपयोग करें।");
        closeCameraModal();
    });
}

function closeCameraModal() {
    const modal = document.getElementById('camera-modal');
    modal.classList.remove('active');
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
}

function changeCamera() {
    const cameraSelect = document.getElementById('camera-select');
    const video = document.getElementById('webcam-video');
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: cameraSelect.value } },
        audio: false
    }).then(stream => {
        localStream = stream;
        video.srcObject = stream;
    }).catch(err => console.error("Error switching camera:", err));
}

function captureSnapshot() {
    const video = document.getElementById('webcam-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    // Mirror image if capturing front camera
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    // Save image to state
    if (currentPalmSide === 'left') {
        state.userData.leftPalmImg = dataUrl;
        displayPreview('left', dataUrl);
    } else {
        state.userData.rightPalmImg = dataUrl;
        displayPreview('right', dataUrl);
    }
    
    closeCameraModal();
}

function displayPreview(side, imageSrc) {
    const previewArea = document.getElementById(`${side}-preview-area`);
    previewArea.innerHTML = `<img src="${imageSrc}" alt="${side} Palm Preview">`;
}

function handleFileSelect(event, side) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            if (side === 'left') {
                state.userData.leftPalmImg = dataUrl;
            } else {
                state.userData.rightPalmImg = dataUrl;
            }
            displayPreview(side, dataUrl);
        };
        reader.readAsDataURL(file);
    }
}

/* ==========================================================================
   ASTROMANCY & NUMEROLOGY ENGINE
   ========================================================================== */
function calculateAstromancy(name, dobStr) {
    // DOB format: YYYY-MM-DD
    const dob = new Date(dobStr);
    const year = dob.getFullYear();
    const month = dob.getMonth() + 1; // 1-indexed
    const day = dob.getDate();
    
    // 1. Calculate Zodiac Sign
    let zodiac = 'Aries';
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) zodiac = 'Aries';
    else if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) zodiac = 'Taurus';
    else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) zodiac = 'Gemini';
    else if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) zodiac = 'Cancer';
    else if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) zodiac = 'Leo';
    else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) zodiac = 'Virgo';
    else if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) zodiac = 'Libra';
    else if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) zodiac = 'Scorpio';
    else if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) zodiac = 'Sagittarius';
    else if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) zodiac = 'Capricorn';
    else if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) zodiac = 'Aquarius';
    else if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) zodiac = 'Pisces';
    
    state.userData.zodiac = i18n.en.zodiacs[zodiac];
    
    // 2. Calculate Life Path Number
    // Sum digits: YYYY + MM + DD
    const allDigits = (year.toString() + month.toString() + day.toString()).replace(/[^0-9]/g, '');
    let sum = 0;
    for (let char of allDigits) {
        sum += parseInt(char);
    }
    
    // Reduce to single digit, keeping master numbers 11 and 22
    let lifePath = sum;
    while (lifePath > 9 && lifePath !== 11 && lifePath !== 22) {
        let tempSum = 0;
        for (let char of lifePath.toString()) {
            tempSum += parseInt(char);
        }
        lifePath = tempSum;
    }
    
    state.userData.lifePath = lifePath;
    state.userData.lifePathDesc = i18n.en.lifePaths[lifePath];
}

/* ==========================================================================
   SCANNING SCREEN ANIMATIONS & PROGRESS
   ========================================================================== */
const form = document.getElementById('cosmic-form');
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Save Form Inputs
    state.userData.name = document.getElementById('input-name').value;
    state.userData.dob = document.getElementById('input-dob').value;
    state.userData.time = document.getElementById('input-time').value;
    state.userData.place = document.getElementById('input-place').value;
    
    // Calculate Astromancy
    calculateAstromancy(state.userData.name, state.userData.dob);
    
    // Setup preview images for scanner screen
    const scannerLeftImg = document.getElementById('scanner-left-img');
    const scannerRightImg = document.getElementById('scanner-right-img');
    
    scannerLeftImg.src = state.userData.leftPalmImg || MOCK_LEFT_PALM;
    scannerRightImg.src = state.userData.rightPalmImg || MOCK_RIGHT_PALM;
    
    // Transition to scanning screen
    document.getElementById('portal-screen').classList.remove('active');
    document.getElementById('scanner-screen').classList.add('active');
    
    // Trigger Scanning Nodes
    generateScanningNodes('left-nodes');
    generateScanningNodes('right-nodes');
    
    // Play sound if allowed
    if (isAudioPlaying && ambientAudio) {
        ambientAudio.play().catch(e => console.log('Audio autoplay blocked'));
    }
    
    // Start console logging sequence
    runConsoleSequence();
});

function generateScanningNodes(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Node locations as percentages
    const landmarks = [
        { x: 30, y: 35 }, // heart line start
        { x: 55, y: 40 }, // heart line curve
        { x: 75, y: 32 }, // heart line end
        { x: 32, y: 55 }, // head line start
        { x: 60, y: 62 }, // head line mid
        { x: 78, y: 58 }, // head line end
        { x: 35, y: 80 }, // life line arc
        { x: 62, y: 85 }, // life line mid
        { x: 82, y: 72 }, // life line base
        { x: 50, y: 50 }, // mount of mercury
        { x: 50, y: 75 }  // mount of venus
    ];
    
    landmarks.forEach((pt, i) => {
        const dot = document.createElement('div');
        dot.className = 'node';
        dot.style.left = `${pt.x}%`;
        dot.style.top = `${pt.y}%`;
        dot.style.animationDelay = `${i * 0.15}s`;
        container.appendChild(dot);
    });
}

function runConsoleSequence() {
    const terminal = document.getElementById('terminal-feed');
    terminal.innerHTML = '';
    
    const logs = [
        { text: `[SYSTEM] Booting AI Cosmic Engine v4.2...`, delay: 0, class: 'system' },
        { text: `[SYSTEM] Integrating dermal matrices with astrological alignments...`, delay: 400, class: 'system' },
        { text: `[ASTRONOMY] Parsing birth coordinates: ${state.userData.place} | ${state.userData.dob} | ${state.userData.time}...`, delay: 900, class: '' },
        { text: `[ASTRONOMY] Ascending Node calculated: Moon in Pisces. Planetary ruler calibrated.`, delay: 1400, class: 'warning' },
        { text: `[ASTRONOMY] Zodiac mapped: ${state.userData.zodiac.name} (${state.userData.zodiac.element} Element).`, delay: 1900, class: 'warning' },
        { text: `[NUMEROLOGY] Life Path frequency set to: ${state.userData.lifePath} (${state.userData.lifePathDesc.title}).`, delay: 2400, class: 'warning' },
        { text: `[PALMISTRY] Adjusting camera depth. Contrast scaling applied to hand patterns.`, delay: 2800, class: '' },
        { text: `[PALMISTRY] LEFT PALM: Emotional Blueprint mapped. Heart Line depth calibrated at 94%.`, delay: 3200, class: 'success' },
        { text: `[PALMISTRY] RIGHT PALM: Path of Action mapped. Head Line curvature shows high adaptive cognition.`, delay: 3600, class: 'success' },
        { text: `[AI_PSYCHE] Constructing Barnum Resonance indexes. Self-reflective filters engaged...`, delay: 4000, class: 'system' },
        { text: `[SYSTEM] Generation Complete. Formatting Life Blueprint dashboard...`, delay: 4400, class: 'success' }
    ];
    
    logs.forEach(log => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = `terminal-line ${log.class}`;
            line.textContent = log.text;
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
        }, log.delay);
    });
    
    // Finish scan and show report
    setTimeout(() => {
        showReportScreen();
    }, 4900);
}

/* ==========================================================================
   DYNAMIC REPORT GENERATOR & RENDERING
   ========================================================================== */
function showReportScreen() {
    document.getElementById('scanner-screen').classList.remove('active');
    document.getElementById('report-screen').classList.add('active');
    
    // Set Header Info
    document.getElementById('report-user-name').textContent = state.userData.name;
    
    // Format Date of Birth nicely
    const dob = new Date(state.userData.dob);
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = dob.toLocaleDateString(state.currentLanguage === 'en' ? 'en-US' : 'hi-IN', dateOptions);
    
    document.getElementById('report-user-meta').textContent = `${formattedDate} | ${state.userData.time} | ${state.userData.place}`;
    
    // Generate the Blueprint content
    generateBlueprintContent();
    
    // Load suggested questions in Oracle
    loadSuggestedQuestions();
    
    // Default to Dashboard tab
    switchTab('tab-dashboard');
}

function generateBlueprintContent() {
    const isHindi = state.currentLanguage === 'hi';
    const zodiac = state.userData.zodiac;
    const lp = state.userData.lifePath;
    const dob = new Date(state.userData.dob);
    
    // Update Zodiac badge
    const zodiacBadge = document.getElementById('badge-zodiac');
    const lpBadge = document.getElementById('badge-lifepath');
    const zodiacIcon = document.querySelector('.astro-sign-icon');
    
    // Assign sign icon class
    zodiacIcon.className = 'fa-solid astro-sign-icon';
    const signName = zodiac.name.toLowerCase();
    if (signName === 'gemini') zodiacIcon.classList.add('fa-gemini');
    else if (signName === 'aries') zodiacIcon.classList.add('fa-aries');
    else if (signName === 'taurus') zodiacIcon.classList.add('fa-taurus');
    else if (signName === 'cancer') zodiacIcon.classList.add('fa-cancer');
    else if (signName === 'leo') zodiacIcon.classList.add('fa-leo');
    else if (signName === 'virgo') zodiacIcon.classList.add('fa-virgo');
    else if (signName === 'libra') zodiacIcon.classList.add('fa-libra');
    else if (signName === 'scorpio') zodiacIcon.classList.add('fa-scorpio');
    else if (signName === 'sagittarius') zodiacIcon.classList.add('fa-sagittarius');
    else if (signName === 'capricorn') zodiacIcon.classList.add('fa-capricorn');
    else if (signName === 'aquarius') zodiacIcon.classList.add('fa-aquarius');
    else if (signName === 'pisces') zodiacIcon.classList.add('fa-pisces');
    else zodiacIcon.classList.add('fa-sun');

    document.getElementById('label-zodiac-name').textContent = isHindi ? zodiac.hindi : zodiac.name;
    document.getElementById('label-zodiac-element').textContent = isHindi ? `तत्व: ${zodiac.elementHi}` : `Element: ${zodiac.element}`;
    
    document.getElementById('label-lifepath-num').textContent = lp;
    const lpData = i18n.en.lifePaths[lp];
    document.getElementById('label-lifepath-desc').textContent = isHindi ? lpData.hindiTitle : lpData.title;

    // Load Radial values
    // Dynamic offsets based on zodiac or name length
    const intuitionVal = 85 + (state.userData.name.length % 3) * 5;
    const loyaltyVal = 90 + (state.userData.name.length % 2) * 5;
    const resilienceVal = 80 + (lp % 3) * 5;
    const overthinkingVal = 85 + (state.userData.dob.charCodeAt(8) % 3) * 5;

    updateRadialMeter('progress-intuition', 'val-intuition', intuitionVal);
    updateRadialMeter('progress-loyalty', 'val-loyalty', loyaltyVal);
    updateRadialMeter('progress-resilience', 'val-resilience', resilienceVal);
    updateRadialMeter('progress-overthinking', 'val-overthinking', overthinkingVal);

    // Dynamic Strengths & Weaknesses
    const strengths = isHindi ? [
        "गहरी अंतर्दृष्टि और गजब का अंतर्ज्ञान (Strong Intuition)",
        "अपने प्रियजनों के प्रति अटूट वफादारी और जिम्मेदारी की भावना",
        "किसी भी नई परिस्थिति या ज्ञान को बहुत तेजी से सीखने की क्षमता",
        "मानसिक सहनशक्ति और कठिन समय में भी खड़े रहने का साहस",
        "संवेदनशील सोच, जो दूसरों के बिना कहे भी उनके मन की बात समझ लेती है"
    ] : [
        "Uncanny emotional intelligence and sharp intuitive radar.",
        "Deep-rooted loyalty and unwavering dedication to loved ones.",
        "Versatile intellectual capability; absorbs complex ideas rapidly.",
        "Internal psychic resilience that emerges during crises.",
        "High empathy and observational depth—notices what others miss."
    ];

    const weaknesses = isHindi ? [
        "अत्यधिक सोच-विचार करने की आदत (Overthinking), जो मानसिक तनाव देती है",
        "दूसरों की बातों और छोटी घटनाओं को बहुत जल्दी दिल पर ले लेना",
        "अपनी भावनाओं को खुलकर व्यक्त न करना और उसे मन में दबाकर रखना",
        "खुद की तुलना दूसरों से करना, जिससे आत्मविश्वास में उतार-चढ़ाव आना",
        "विश्वास करने में बहुत समय लेना और पुरानी बातों या यादों को आसानी से न छोड़ पाना"
    ] : [
        "Chronically active mind, leading to spirals of overthinking.",
        "Hyper-sensitivity; takes minor remarks deeply to heart.",
        "Emotional containment; hides vulnerabilities behind a strong mask.",
        "Occasional bouts of self-doubt despite high competence.",
        "Holds onto past memories, emotional baggage, or slights longer than necessary."
    ];

    populateList('list-strengths', strengths);
    populateList('list-weaknesses', weaknesses);

    // TAB 2: PERSONALITY NARRATIVE (THE MIRROR)
    const personalityText = isHindi ? 
        `${state.userData.name} एक अत्यंत संवेदनशील, गहरी सोच रखने वाली और भावनात्मक रूप से परिपक्व व्यक्तित्व की स्वामिनी हैं। वह हर किसी को अपने मन की बात नहीं बतातीं और अक्सर अपनी भावनाओं को अपने भीतर ही रखती हैं।\n\nउनमें लोगों को समझने की अद्भुत क्षमता है। कई बार बिना कुछ कहे ही सामने वाले के व्यवहार और इरादों को महसूस कर लेती हैं। बाहर से जितनी शांत और सरल दिखाई देती हैं, उनका मन अंदर से उतना ही सक्रिय रहता है। वे आत्मसम्मान को बहुत महत्व देती हैं और गलत बातों को सहन करना उनके स्वभाव में नहीं है।` :
        `${state.userData.name} is naturally sensitive, observant, and emotionally deep. She often understands people's intentions faster than they realize. Although she appears calm and composed externally, her mind is constantly analyzing situations and people.\n\nShe values loyalty and honesty and deeply dislikes fake behavior. Trust is not given easily to anyone. However, once someone earns her trust, she becomes extremely supportive and protective. She has a tendency to keep personal struggles private and deal with problems alone rather than asking for help.`;
        
    document.getElementById('personality-narrative-text').textContent = personalityText;

    // Interactive Barnum Statements
    const barnumStatements = isHindi ? [
        {
            stmt: "कई बार आपने महसूस किया है कि लोग आपके दयालु स्वभाव का गलत फायदा उठा लेते हैं, फिर भी आप दूसरों की मदद करने से पीछे नहीं हटतीं।",
            rev: "यह आपकी गहरी संवेदनशीलता को दर्शाता है। आपके भीतर दूसरों के दर्द को महसूस करने की क्षमता है, लेकिन आपको अपने व्यक्तिगत दायरे (boundaries) तय करने सीखने होंगे ताकि आपका भावनात्मक शोषण न हो।"
        },
        {
            stmt: "आप अक्सर बाहर से बहुत मजबूत और लापरवाह दिखती हैं, जबकि अंदर ही अंदर कुछ बातें आपको बहुत परेशान कर रही होती हैं।",
            rev: "हस्तरेखा और ग्रहीय संरेखण दोनों दर्शाते हैं कि आप अपनी कमजोरियों को दुनिया के सामने प्रदर्शित करना पसंद नहीं करतीं। यह आत्म-निर्भरता अच्छी है, लेकिन भावनाओं को दबाना मानसिक थकान का कारण बनता है।"
        },
        {
            stmt: "आपके मन में हमेशा यह भावना रहती है कि आप कुछ बहुत बड़ा करने के लिए बनी हैं, लेकिन कभी-कभी आत्म-संदेह आपको रोक लेता है।",
            rev: "यह एक अत्यंत शक्तिशाली 'द मिरर' संकेत है। आपकी कुंडली और हस्तरेखा में भारी प्रगति के योग हैं, परंतु आपका सबसे बड़ा शत्रु आपकी अपनी हिचकिचाहट और ओवरथिंकिंग है। खुद पर भरोसा रखें।"
        },
        {
            stmt: "कुछ ऐसी बातें हैं जो आज भी आपके मन में हैं लेकिन आपने जीवन में कभी किसी को नहीं बताईं।",
            rev: "यह आपकी गहरी भावनात्मक सुरक्षा की आवश्यकता को दर्शाता है। अतीत की कुछ कड़वी यादें या गलतफहमियां आपके अवचेतन मन में दबी हुई हैं। इन्हें धीरे-धीरे विदा करना आपके सुनहरे भविष्य के लिए आवश्यक है।"
        }
    ] : [
        {
            stmt: "At times you feel misunderstood by people, as if they only see a small fraction of who you truly are.",
            rev: "This is a classic reflection of your complex personality. Your outer persona acts as a shield to protect your rich, highly sensitive inner world. Only a trusted few get to see the real you."
        },
        {
            stmt: "You have a habit of smiling and acting strong even when carrying worries that no one around you fully understands.",
            rev: "The planetary coordinates show Saturnian resilience. You prefer to deal with your own problems quietly rather than becoming a burden to others. While noble, sharing your load can bring immense relief."
        },
        {
            stmt: "You remember conversations and small incidents long after others have forgotten them.",
            rev: "Your lunar alignments give you a highly active retentive memory. This allows you to learn quickly but also makes it difficult to let go of emotional injuries or words that hurt you in the past."
        },
        {
            stmt: "You have questioned your own capabilities even when those around you had absolute faith in you.",
            rev: "This self-doubt stems from your high standards. You are a perfectionist at heart and fear letting down yourself or those who look up to you. Believe in your cosmic path; you are stronger than you think."
        }
    ];

    const barnumContainer = document.getElementById('barnum-cards-container');
    barnumContainer.innerHTML = '';
    barnumStatements.forEach(b => {
        const card = document.createElement('div');
        card.className = 'barnum-card glass-panel';
        card.onclick = function() { card.classList.toggle('revealed'); };
        
        card.innerHTML = `
            <p class="barnum-statement">"${b.stmt}"</p>
            <p class="barnum-reveal"><i class="fa-solid fa-wand-magic-sparkles"></i> ${b.rev}</p>
            <span class="barnum-hint">${isHindi ? 'रहस्य देखने के लिए क्लिक करें' : 'Click to Reveal Deep Reading'}</span>
        `;
        barnumContainer.appendChild(card);
    });

    // TAB 3: ASTROMANCY & PALMISTRY NARRATIVES
    document.getElementById('astro-chart-name').textContent = isHindi ? `${state.userData.name} का ब्रह्मांडीय नक्शा` : `${state.userData.name}'s Birth Alignment`;
    const astroInterpretation = isHindi ? 
        `<h4>राशि चक्र और ग्रह योग विश्लेषण:</h4>\n\nआपकी जन्म तिथि के अनुसार आपकी राशि <strong>${zodiac.hindi}</strong> है, जिसका तत्व <strong>${zodiac.elementHi}</strong> है। यह तत्व आपको तीव्र बुद्धि, बहुमुखी सोच और संवाद की अद्भुत क्षमता देता है।\n\n<strong>ग्रहीय स्थिति:</strong> चंद्र की स्थिति आपके स्वभाव में संवेदनशीलता और रचनात्मकता भरती है। गुरु (Jupiter) का शुभ प्रभाव आपकी सीखने की क्षमता और जिम्मेदारी को मजबूत करता है।\n\n<strong>नंबर ज्योतिष (Numerology):</strong> आपका भाग्यांक/जीवन पथ नंबर <strong>${lp}</strong> है। यह संख्या दर्शाती है कि आपका जीवन बदलावों, यात्राओं और अनुभवों से भरा रहेगा। आप बंधनों में बंधकर काम करना पसंद नहीं करतीं और स्वतंत्र निर्णय लेने में विश्वास रखती हैं।` :
        `<h4>Zodiac & Planetary Conjunction Analysis:</h4>\n\nYour birth date aligns with the sign of <strong>${zodiac.name}</strong>, ruled by the <strong>${zodiac.element}</strong> element. This element grants you intellectual agility, rapid conceptual understanding, and natural creativity.\n\n<strong>Planetary Ruler Influence:</strong> The placement of the Moon indicates a highly reactive and sensitive inner emotional core. Jupiter's influence ensures that you are driven by a sense of responsibility and have an innate capacity for mentorship.\n\n<strong>Numerological Blueprint:</strong> Your calculated Life Path Number is <strong>${lp}</strong> (${lpData.title}). This vibration is highly dynamic, suggesting a life path of self-discovery, adaptation, and breaking free from conventional limitations.`;
    
    document.getElementById('astrology-interpretation').innerHTML = astroInterpretation;

    const palmInterpretation = isHindi ?
        `<h4>हस्तरेखा एवं रेखा संरेखण विश्लेषण:</h4>\n\n<strong>हृदय रेखा (Heart Line):</strong> आपके बाएं हाथ की हृदय रेखा की बनावट गहरी और अंत में बृहस्पति पर्वत की ओर झुकी हुई है। यह दर्शाता है कि आप प्रेम संबंधों में अत्यधिक वफादार, गंभीर और भावनात्मक जुड़ाव चाहने वाली हैं। आप जल्दी किसी के प्यार में नहीं पड़तीं, लेकिन एक बार किसी को स्वीकार कर लें तो पूरी निष्ठा निभाती हैं।\n\n<strong>मस्तिष्क रेखा (Head Line):</strong> आपकी मस्तिष्क रेखा लंबी और स्पष्ट है, जो आपके मजबूत मानसिक सहनशक्ति और विश्लेषणात्मक सोच को दर्शाती है। यह आपके ओवरथिंकिंग की प्रवृत्ति को भी प्रमाणित करती है।\n\n<strong>जीवन रेखा (Life Line):</strong> जीवन रेखा की गोलाई आपके परिवार के प्रति समर्पण और जीवन शक्ति को दर्शाती है। करियर में प्रगति आपकी मेहनत के बल पर होगी न कि केवल भाग्य के भरोसे।` :
        `<h4>Dermatoglyphic & Palm Line Interpretations:</h4>\n\n<strong>The Heart Line (Emotional Matrix):</strong> Your Heart Line is deep, terminating near the Mount of Jupiter. This indicates an emotionally intense nature that values sincerity and depth over casual interactions. You seek a soul-level connection and require reassurance and consistency from relationships.\n\n<strong>The Head Line (Cognitive Path):</strong> A long, clear, and slightly curved Head Line confirms a high capacity for logical reasoning combined with creative visualization. However, the downward dip near the Mount of Moon reinforces your tendency to overthink and internalize stress.\n\n<strong>The Life Line (Vitality & Action):</strong> The strong curvature of your Life Line shows robust physical resilience and a deep bond with ancestral roots. It suggests a self-made path where success is earned through persistence and patience.`;
        
    document.getElementById('palmistry-interpretation').innerHTML = palmInterpretation;

    // TAB 4: PATHWAYS (CAREER & EDUCATION)
    const careers = isHindi ? 
        ["शिक्षा और अध्यापन (Education)", "डिजिटल मीडिया और मार्केटिंग", "रचनात्मक कला और डिजाइनिंग", "मनोविज्ञान एवं काउंसलिंग", "प्रशासनिक एवं प्रबंधकीय सेवाएँ", "मीडिया और जनसंचार"] :
        ["Teaching & Education", "Digital Media & Marketing", "Design & Creative Arts", "Psychology & Counseling", "Administration & Public Service", "Media & Public Relations"];
    
    const careersContainer = document.getElementById('career-tags-container');
    careersContainer.innerHTML = '';
    careers.forEach(c => {
        const tag = document.createElement('span');
        tag.className = 'career-tag';
        tag.textContent = c;
        careersContainer.appendChild(tag);
    });

    const academicText = isHindi ?
        `पढ़ाई और बौद्धिक कार्यों में आपकी रुचि व्यावहारिक और रचनात्मक सोच पर आधारित है। आप रटने की अपेक्षा अवधारणाओं (concepts) को समझने में अधिक सक्षम हैं।\n\n<strong>मुख्य विशेषताएँ:</strong>\n• रुचि वाले विषयों में आप उत्कृष्ट और असाधारण प्रदर्शन करती हैं।\n• किसी अच्छे गुरु या मार्गदर्शक (mentor) का सहयोग मिलने पर आप अपनी क्षमता से कई गुना बेहतर परिणाम दे सकती हैं।\n• उच्च शिक्षा के दौरान आपके विषय या करियर की दिशा में एक महत्वपूर्ण और सकारात्मक बदलाव आने की प्रबल संभावना है।` :
        `Your intellectual style thrives on practical understanding and creative application rather than rote memorization. You perform exceptionally well when a subject aligns with your inner interests.\n\n<strong>Core Indicators:</strong>\n• High performance spikes in areas involving creative problem-solving or human interaction.\n• You benefit greatly from supportive mentors; an inspiring teacher can completely change your academic orbit.\n• The cosmic grid suggests a significant pivot or redirection in your major field of study during higher education, leading to a much better fit.`;
        
    document.getElementById('academic-blueprint-text').innerHTML = academicText;

    // TAB 5: TIMELINE
    // Calculate dynamic calendar years based on Birth Year
    const birthYear = dob.getFullYear();
    document.getElementById('age-node-1').innerHTML = `17–19 <br><span class="node-year">(${birthYear + 17}-${birthYear + 19})</span>`;
    document.getElementById('age-node-2').innerHTML = `18–22 <br><span class="node-year">(${birthYear + 18}-${birthYear + 22})</span>`;
    document.getElementById('age-node-3').innerHTML = `23–27 <br><span class="node-year">(${birthYear + 23}-${birthYear + 27})</span>`;

    const phase1Items = isHindi ? [
        "करियर में तीव्र प्रगति और महत्वपूर्ण कार्यक्षेत्र की शुरुआत",
        "वित्तीय स्वतंत्रता और आर्थिक स्थिरता प्राप्त करने के मजबूत योग",
        "आत्मविश्वास में भारी वृद्धि और समाज में पहचान",
        "गंभीर और स्थायी संबंधों के योग, जो जीवन में स्थिरता लाएंगे"
    ] : [
        "Rapid professional acceleration and rise to independent projects.",
        "Attainment of financial autonomy and material stability.",
        "Significant surge in self-confidence and personal authority.",
        "Establishment of deep, lasting relationship anchors."
    ];

    const phase2Items = isHindi ? [
        "व्यक्तिगत और व्यावसायिक जीवन में सुंदर संतुलन (Balance)",
        "सम्मान, मान-प्रतिष्ठा और सामाजिक प्रभाव में बड़ी वृद्धि",
        "पारिवारिक जीवन में मजबूती और आत्म-संतोष (Peace of Mind)",
        "मानसिक रूप से अधिक शांत और आध्यात्मिक रूप से परिपक्व होने का समय"
    ] : [
        "A highly balanced phase blending professional success with personal harmony.",
        "Significant increase in social recognition, respect, and influence.",
        "Deep domestic stability and emotional peace of mind.",
        "Spiritual maturity and release of old emotional anxieties."
    ];

    populateList('phase-list-1', phase1Items);
    populateList('phase-list-2', phase2Items);
    
    document.getElementById('phase-title-1').textContent = isHindi ? "आयु 24 से 32 वर्ष" : "Age 24 – 32";
    document.getElementById('phase-title-2').textContent = isHindi ? "32 वर्ष के बाद का समय" : "Age 32 and Beyond";
}

function updateRadialMeter(elementId, valueId, targetVal) {
    const meter = document.getElementById(elementId);
    const valueText = document.getElementById(valueId);
    
    meter.style.setProperty('--percent', targetVal);
    valueText.textContent = `${targetVal}%`;
}

function populateList(elementId, items) {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
    });
}

/* ==========================================================================
   INTERACTIVE TAB NAVIGATION
   ========================================================================== */
function switchTab(tabId) {
    // Remove active class from buttons
    const navButtons = document.querySelectorAll('.tab-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        // Find which tab this matches
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });

    // Hide all panes
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => pane.classList.remove('active'));

    // Show target pane
    document.getElementById(tabId).classList.add('active');
    state.activeTab = tabId;
}

/* ==========================================================================
   LANGUAGE TOGGLING SYSTEM (ENGLISH / HINDI)
   ========================================================================== */
function toggleLanguage() {
    state.currentLanguage = state.currentLanguage === 'en' ? 'hi' : 'en';
    
    // Update Toggle Button Text
    const langBtn = document.getElementById('btn-lang-toggle');
    const langTextSpan = document.getElementById('lang-text');
    
    langTextSpan.textContent = state.currentLanguage === 'en' ? 'हिन्दी में देखें' : 'View in English';
    
    // Translate static elements that have data attributes
    const translatableElements = document.querySelectorAll('[data-en]');
    translatableElements.forEach(el => {
        const enVal = el.getAttribute('data-en');
        const hiVal = el.getAttribute('data-hi');
        el.textContent = state.currentLanguage === 'en' ? enVal : hiVal;
    });
    
    // Re-generate the report content with the new language
    generateBlueprintContent();
    
    // Refresh Oracle suggested questions
    loadSuggestedQuestions();
    
    // Refresh oracle greeting
    const messagesBox = document.getElementById('chat-messages-box');
    const firstBubble = messagesBox.querySelector('.oracle-bubble p');
    if (firstBubble) {
        if (state.currentLanguage === 'hi') {
            firstBubble.textContent = "नमस्ते जिज्ञासु। मैंने आपके हस्तरेखा और ग्रहीय संरेखण का विश्लेषण कर लिया है। आज आप ब्रह्मांड से क्या उत्तर जानना चाहते हैं?";
        } else {
            firstBubble.textContent = "Greetings seeker. I have integrated your palm lines and planetary alignments. What answers do you seek from the cosmos today?";
        }
    }
}

/* ==========================================================================
   AI ORACLE SIMULATED CHATBOT
   ========================================================================== */
function loadSuggestedQuestions() {
    const isHindi = state.currentLanguage === 'hi';
    const name = state.userData.name;
    const zodiac = state.userData.zodiac;
    const lp = state.userData.lifePath;
    
    const questions = isHindi ? [
        `मैं अपनी संवेदनशीलता और ओवरथिंकिंग (Overthinking) को कैसे प्रबंधित करूँ?`,
        `करियर के लिए सबसे बेहतर क्षेत्र कौन सा रहेगा?`,
        `क्या मेरी वफादारी ही कभी-कभी मेरी कमजोरी बन जाती है?`,
        `मेरे भाग्यांक (Life Path) ${lp} का मेरे भविष्य पर क्या प्रभाव पड़ेगा?`
    ] : [
        `How can I manage my sensitivity and overthinking?`,
        `Which specific career path will bring me the most fulfillment?`,
        `How do I balance logical decisions with my deep emotions?`,
        `What does my Life Path ${lp} indicate about my spiritual journey?`
    ];

    const container = document.getElementById('suggested-questions-container');
    container.innerHTML = '';
    
    questions.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'suggested-btn';
        btn.textContent = q;
        btn.type = 'button';
        btn.onclick = function() {
            submitOracleQuestion(q);
        };
        container.appendChild(btn);
    });
}

async function submitOracleQuestion(questionText) {
    if (!questionText.trim()) return;
    
    const messagesBox = document.getElementById('chat-messages-box');
    
    // Add User Message bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user-bubble';
    userBubble.innerHTML = `<p>${questionText}</p>`;
    messagesBox.appendChild(userBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    
    // Clear Input
    document.getElementById('chat-input-field').value = '';
    
    // Show Typing indicator for Oracle
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble oracle-bubble typing';
    typingBubble.innerHTML = `<p><i class="fa-solid fa-spinner fa-spin"></i> Consulting cosmic nodes...</p>`;
    messagesBox.appendChild(typingBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    
    let responseText = "";
    
    // Simulate natural cosmic search latency (min 1 second)
    const startTimestamp = Date.now();
    
    try {
        const response = await fetch('/api/oracle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: state.userData.name,
                zodiac: state.userData.zodiac.name,
                lifePath: state.userData.lifePath,
                language: state.currentLanguage,
                question: questionText,
                model: state.selectedModel
            })
        });
        
        if (!response.ok) {
            throw new Error(`Serverless endpoint returned status ${response.status}`);
        }
        
        const data = await response.json();
        if (data.answer) {
            responseText = data.answer;
        } else {
            throw new Error("Missing 'answer' property in serverless response JSON");
        }
    } catch (err) {
        console.warn("Vercel Serverless API failed or inactive. Engaging offline cosmic engine fallback.", err);
        responseText = generateOracleResponse(questionText);
    }
    
    // Ensure the typing animation displays for at least 1.2 seconds for realistic UI pacing
    const elapsed = Date.now() - startTimestamp;
    const remainingDelay = Math.max(0, 1200 - elapsed);
    
    setTimeout(() => {
        messagesBox.removeChild(typingBubble);
        const oracleBubble = document.createElement('div');
        oracleBubble.className = 'chat-bubble oracle-bubble';
        oracleBubble.innerHTML = `<p>${responseText}</p>`;
        messagesBox.appendChild(oracleBubble);
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }, remainingDelay);
}

function generateOracleResponse(userQ) {
    const isHindi = state.currentLanguage === 'hi';
    const name = state.userData.name;
    const zodiacName = isHindi ? state.userData.zodiac.hindi : state.userData.zodiac.name;
    const lp = state.userData.lifePath;
    
    const qLower = userQ.toLowerCase();
    
    if (isHindi) {
        if (qLower.includes('overthinking') || qLower.includes('सोच') || qLower.includes('संवेदनशीलता')) {
            return `प्रिय ${name}, आपकी मस्तिष्क रेखा चंद्रमा के पर्वत की ओर झुकती है, जो दर्शाती है कि आपकी कल्पनाशक्ति अद्भुत है, लेकिन यही कल्पनाशक्ति ओवरथिंकिंग (अति-विचार) को जन्म देती है।\n\n<strong>ओरेकल सलाह:</strong> जब भी आपका मन विचारों में उलझने लगे, तो अपनी ऊर्जा को रचनात्मक कार्यों या डायरी लिखने में लगाएं। याद रखें, आपका मन एक गहरे समुद्र की तरह है—लहरें उठेंगी, लेकिन तल पर आप हमेशा शांत हैं।`;
        }
        if (qLower.includes('career') || qLower.includes('करियर') || qLower.includes('नौकरी')) {
            return `आपकी कुंडली में <strong>${zodiacName}</strong> का प्रभाव है, जो बौद्धिक और संचार कौशल को दर्शाता है। आपके लिए शिक्षा (Teaching), डिजिटल मीडिया, काउंसलिंग, और कलात्मक क्षेत्र अत्यंत शुभ हैं।\n\nभाग्यांक <strong>${lp}</strong> के प्रभाव से, आप नौकरी में स्वतंत्रता पसंद करेंगी। 24 वर्ष की आयु के बाद आपके करियर में भाग्य उदय का मजबूत समय शुरू होगा।`;
        }
        if (qLower.includes('वफादारी') || qLower.includes('कमजोरी') || qLower.includes('loyalty')) {
            return `${name}, आपके बाएं हाथ की हृदय रेखा गुरु पर्वत तक जाती है। यह आपके भीतर गहरी वफादारी और प्रेम की शुद्धि को दर्शाती है।\n\nआप किसी पर बहुत जल्दी भरोसा नहीं करतीं, लेकिन जब करती हैं तो सब कुछ समर्पित कर देती हैं। कभी-कभी लोग इसका गलत फायदा उठाते हैं। ब्रह्मांड आपको सलाह देता है कि दूसरों को समझने के लिए समय लें और हर किसी को अपने भावनात्मक दायरे में प्रवेश न करने दें।`;
        }
        // General default response
        return `ब्रह्मांड की तरंगें आपके ग्रहीय संरेखण और हस्तरेखा के माध्यम से बताती हैं कि ${name}, आप अभी एक बड़े परिवर्तन के दौर से गुजर रही हैं।\n\nभाग्यांक <strong>${lp}</strong> आपको हर परिस्थिति में ढलने और विजयी होने की शक्ति देता है। अपने अंतर्ज्ञान (Intuition) पर विश्वास रखें; यह आपको कभी गलत दिशा में नहीं ले जाएगा। क्या आपके मन में भविष्य को लेकर कोई और शंका है?`;
    } else {
        // English responses
        if (qLower.includes('overthink') || qLower.includes('sensitivity') || qLower.includes('mind')) {
            return `Dear ${name}, your curved Head Line indicates a highly developed emotional and imaginative depth. This is a gift, but without grounding, it translates into spirals of overthinking.\n\n<strong>Oracle Guidance:</strong> Practice grounding your thoughts. When the mind races, channel that energy into creative projects, writing, or art. You are meant to feel deeply, but you must not let those feelings consume your inner peace.`;
        }
        if (qLower.includes('career') || qLower.includes('job') || qLower.includes('study')) {
            return `Based on your birth coordinates and zodiac alignment with <strong>${zodiacName}</strong>, your intellect thrives on diversity. Traditional, repetitive jobs will drain your spirit. Fields like education, psychology, digital strategy, or creative consulting are highly favorable.\n\nYour Life Path <strong>${lp}</strong> emphasizes a self-made journey. The peak period starting at Age 24 will open major doors of leadership for you.`;
        }
        if (qLower.includes('loyalty') || qLower.includes('weakness') || qLower.includes('love')) {
            return `The deep integration of your left Heart Line shows that loyalty is your core soul signature, ${name}. However, it can become a vulnerability when directed at people who cannot match your emotional frequency.\n\nRemember that boundaries are not barriers; they are guards of your energy. It is safe to love deeply, but protect your peace first.`;
        }
        // General default response
        return `The cosmic nodes indicate that you are standing at the threshold of a major personal evolution, ${name}. The alignment of your zodiac element with your Life Path <strong>${lp}</strong> creates a powerful blueprint of adaptation.\n\nYour greatest guidance system is your intuition, which is currently running at a high frequency. Trust the quiet voice inside you. What else does your soul seek to clarify?`;
    }
}

// Attach event listener to Chat Form
document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input-field');
    const q = input.value;
    submitOracleQuestion(q);
});

/* ==========================================================================
   RESET & SOUND SYSTEM
   ========================================================================== */
function resetScanner() {
    // Reset Form
    form.reset();
    
    // Clear state files
    state.userData.leftPalmImg = null;
    state.userData.rightPalmImg = null;
    
    // Clear preview containers
    document.getElementById('left-preview-area').innerHTML = `
        <i class="fa-solid fa-hand-lizard upload-icon"></i>
        <p>Select source to capture left palm</p>
    `;
    document.getElementById('right-preview-area').innerHTML = `
        <i class="fa-solid fa-hand-lizard upload-icon right-hand-icon"></i>
        <p>Select source to capture right palm</p>
    `;
    
    // Show portal screen
    document.getElementById('report-screen').classList.remove('active');
    document.getElementById('portal-screen').classList.add('active');
    
    // Clear chat box
    const messagesBox = document.getElementById('chat-messages-box');
    messagesBox.innerHTML = `
        <div class="chat-bubble oracle-bubble">
            <p data-en="Greetings seeker. I have integrated your palm lines and planetary alignments. What answers do you seek from the cosmos today?" data-hi="नमस्ते जिज्ञासु। मैंने आपके हस्तरेखा और ग्रहीय संरेखण का विश्लेषण कर लिया है। आज आप ब्रह्मांड से क्या उत्तर जानना चाहते हैं?">Greetings seeker. I have integrated your palm lines and planetary alignments. What answers do you seek from the cosmos today?</p>
        </div>
    `;
}

function toggleCosmicAura() {
    isAudioPlaying = !isAudioPlaying;
    
    const icon = soundToggle.querySelector('.sound-icon');
    
    if (isAudioPlaying) {
        icon.className = 'fa-solid fa-volume-high sound-icon';
        ambientAudio.volume = 0.2; // Keep it low and ambient
        ambientAudio.play().catch(e => console.log('Audio autoplay blocked'));
    } else {
        icon.className = 'fa-solid fa-volume-xmark sound-icon';
        ambientAudio.pause();
    }
}

function selectModel(modelName) {
    state.selectedModel = modelName;
    
    // Update UI buttons
    const optGemini = document.getElementById('opt-gemini');
    const optChatgpt = document.getElementById('opt-chatgpt');
    
    if (modelName === 'gemini') {
        optGemini.classList.add('active');
        optChatgpt.classList.remove('active');
    } else {
        optGemini.classList.remove('active');
        optChatgpt.classList.add('active');
    }
}

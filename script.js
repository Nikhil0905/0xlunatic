(() => {
    'use strict';

    // ─── BEEP SOUND GENERATOR ───────────────────────────
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function beep(freq = 800, duration = 60, vol = 0.05) {
        try {
            if (!audioCtx) audioCtx = new AudioCtx();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.value = vol;
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
            osc.start();
            osc.stop(audioCtx.currentTime + duration / 1000);
        } catch (_) {}
    }

    function keyBeep() { beep(600 + Math.random() * 400, 30, 0.02); }
    function enterBeep() { beep(1200, 50, 0.04); }
    function toggleExecBeep() { beep(800, 60, 0.04); setTimeout(() => beep(1200, 80, 0.04), 100); }
    function toggleRootBeep() { beep(300, 100, 0.06); setTimeout(() => beep(200, 150, 0.08), 120); }

    // ─── LOADER ─────────────────────────────────────────
    const loader = document.getElementById('loader');
    document.body.classList.add('loading');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('done');
            document.body.classList.remove('loading');
            startTypewriters();
        }, 1300);
    });

    // ─── CURSOR GLOW ───────────────────────────────────
    const glow = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            glow.classList.add('active');
        });
        const animateGlow = () => {
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            glow.style.left = glowX + 'px';
            glow.style.top = glowY + 'px';
            requestAnimationFrame(animateGlow);
        };
        animateGlow();
    }

    // ─── CARD SPOTLIGHT (Magnetic Hover Effect) ────────
    document.addEventListener('mousemove', e => {
        document.querySelectorAll('.card').forEach(card => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        });
    });

    // ─── MAGNETIC BUTTONS ───────────────────────────────
    if (window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
                setTimeout(() => btn.style.transition = '', 500);
            });
        });
    }

    // ─── NAVBAR SCROLL ──────────────────────────────────
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // ─── MODE TOGGLE (Jekyll & Hyde) ────────────────────
    const modeCheckbox = document.getElementById('mode-toggle');
    const body = document.body;
    
    // Check local storage for preference
    const savedMode = localStorage.getItem('portfolioMode');
    if (savedMode === 'root') {
        body.classList.add('root-access');
        modeCheckbox.checked = true;
    }

    modeCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            body.classList.add('root-access');
            localStorage.setItem('portfolioMode', 'root');
            toggleRootBeep();
        } else {
            body.classList.remove('root-access');
            localStorage.setItem('portfolioMode', 'executive');
            toggleExecBeep();
        }
        // Restart typewriters when mode changes to ensure they render if previously hidden
        startTypewriters();
    });

    // ─── SCROLL REVEAL ──────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 100); // Stagger
            revealObserver.unobserve(el);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));

    // ─── TYPEWRITER EFFECT ──────────────────────────────
    const typedElements = new Set();
    function startTypewriters() {
        document.querySelectorAll('[data-typewriter]').forEach(el => {
            // Only type if element is visible and hasn't been typed
            if (el.offsetParent === null || typedElements.has(el)) return;
            
            typedElements.add(el);
            const fullText = el.textContent.trimLeft(); // Keep newlines but trim start
            el.textContent = '';
            const cursor = el.nextElementSibling;
            if(cursor && cursor.classList.contains('typewriter-cursor')) {
                cursor.classList.remove('done');
            }
            
            let i = 0;
            const charDelay = 15; // Fast typing for terminal feel

            function typeNext() {
                if (i < fullText.length) {
                    el.textContent += fullText[i];
                    if (document.body.classList.contains('root-access') && Math.random() > 0.5) keyBeep(); // Beep only in root mode
                    i++;
                    setTimeout(typeNext, charDelay + Math.random() * 20);
                } else {
                    if (cursor) setTimeout(() => cursor.classList.add('done'), 2000);
                }
            }
            setTimeout(typeNext, 400); // Small initial delay
        });
    }

    // ─── INTERACTIVE ROOT TERMINAL OVERLAY ──────────────
    const terminalOverlay = document.getElementById('terminalOverlay');
    const terminalBtn = document.getElementById('terminalBtn');
    const terminalClose = document.getElementById('terminalClose');
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.getElementById('terminalOutput');
    const terminalBody = document.getElementById('terminalBody');

    let terminalOpen = false;

    function openTerminal() {
        terminalOverlay.classList.add('active');
        terminalOpen = true;
        setTimeout(() => terminalInput.focus(), 300);
        toggleRootBeep();
        if (!terminalOutput.innerHTML) printWelcome();
    }

    function closeTerminal() {
        terminalOverlay.classList.remove('active');
        terminalOpen = false;
        toggleExecBeep();
    }

    if(terminalBtn) terminalBtn.addEventListener('click', openTerminal);
    if(terminalClose) terminalClose.addEventListener('click', closeTerminal);

    terminalOverlay.addEventListener('click', e => {
        if (e.target === terminalOverlay) closeTerminal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === '`' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            terminalOpen ? closeTerminal() : openTerminal();
        }
        if (e.key === 'Escape' && terminalOpen) closeTerminal();
    });

    terminalInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim();
            terminalInput.value = '';
            enterBeep();
            if (cmd) processCommand(cmd);
        } else {
            keyBeep();
        }
    });

    terminalBody.addEventListener('click', () => terminalInput.focus());

    function appendOutput(html) {
        terminalOutput.innerHTML += html;
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function cmdPrompt(text) {
        return `<div><span class="prompt-user">guest@ns</span>:<span class="prompt-path">~</span>$ <span>${sanitizeHTML(text)}</span></div>`;
    }

    function printWelcome() {
        appendOutput(`
<span style="color:#0f0;">
███╗   ██╗██╗██╗  ██╗██╗  ██╗██╗██╗     
████╗  ██║██║██║ ██╔╝██║  ██║██║██║     
██╔██╗ ██║██║█████╔╝ ███████║██║██║     
██║╚██╗██║██║██╔═██╗ ██╔══██║██║██║     
██║ ╚████║██║██║  ██╗██║  ██║██║███████╗
╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝ 
</span>
<br>
Welcome to the NS SecOS v2.0
Type <span style="color:#3b82f6;">help</span> for a list of valid commands.<br><br>`);
    }

    const COMMANDS = {
        help: () => `
Available Commands:
  <span style="color:#3b82f6;">whoami</span>      - Display current identity profile
  <span style="color:#3b82f6;">skills</span>      - Enumerate technical capabilities
  <span style="color:#3b82f6;">projects</span>    - List deployed mission logs
  <span style="color:#3b82f6;">experience</span>  - View service history
  <span style="color:#3b82f6;">contact</span>     - Establish secure comms
  <span style="color:#3b82f6;">clear</span>       - Clear terminal output
  <span style="color:#3b82f6;">sudo mode</span>   - Override environmental theme constraints
  <span style="color:#3b82f6;">exit</span>        - Terminate shell session
<br>`,
        whoami: () => `
[+] NIKHIL SHAKYA
Role: Security Engineer & Architect
Education: B.Tech (Hons.) CSE - Cybersecurity & Blockchain (LPU)
Status: Seeking vulnerabilities, building defenses.
<br>`,
        skills: () => `
[+] Initiating skill enumeration...
-> Languages: Python, C/C++, Bash, SQL, Solidity, JavaScript
-> Defense: AWS, Linux, Windows Internals, Splunk, Active Directory
-> Offense: Web App Pentesting, Wireshark, Burp Suite, Metasploit
-> DevOps: Docker, Terraform, Git, PowerShell
<br>`,
        experience: () => `
[+] Parsing career.log...
1. Cyber Security Intern @ Techvanto (Jun 2025 - Jul 2025)
   - Developed ML-based NIDS, performed pentesting, completed 60+ THM labs.
2. Cyber Security Intern @ Redynox (Jun 2025 - Jun 2025)
   - Exploited OWASP Top 10 vulnerabilities, performed manual pentesting.
<br>`,
        projects: () => `
[+] Discovered deployments:
1. Cloud Control-Plane Purple Team Lab
2. InsightOps (AI-Assisted SOC Intelligence Engine)
3. SmartNetIDS (ML-based Network Intrusion Detection)
4. Secure File Management System (AES-256 E2E Encryption)
<br>`,
        contact: () => `
[+] Email: <a href="mailto:nikhilshakya0905@gmail.com" style="color:var(--text-secondary)">nikhilshakya0905@gmail.com</a>
[+] Phone: +91-9872408318
[+] LinkedIn: <a href="https://linkedin.com/in/nikhilshakya0905/" style="color:var(--text-secondary)">linkedin.com/in/nikhilshakya0905</a>
[+] GitHub: <a href="https://github.com/Nikhil0905/" style="color:var(--text-secondary)">github.com/Nikhil0905</a>
<br>`,
        clear: () => {
            terminalOutput.innerHTML = '';
            return '';
        },
        exit: () => {
            setTimeout(closeTerminal, 200);
            return 'Terminating...<br>';
        },
        "sudo mode": () => {
            modeCheckbox.checked = !modeCheckbox.checked;
            modeCheckbox.dispatchEvent(new Event('change'));
            return `[!] Overriding constraints... Mode switched.<br>`;
        }
    };

    function processCommand(input) {
        appendOutput(cmdPrompt(input));
        const cmd = input.toLowerCase().trim();

        if (COMMANDS[cmd]) {
            const result = COMMANDS[cmd]();
            if (result) appendOutput(`<div>${result}</div>`);
        } else if (cmd.startsWith("sudo")) {
            appendOutput(`<div><span style="color:#ef4444;">[!]</span> Access denied. This incident will be reported.</div><br>`);
        } else {
            appendOutput(`<div>bash: ${sanitizeHTML(input)}: command not found</div><br>`);
        }
    }

})();

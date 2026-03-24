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

    // ─── PROJECT DEEP DIVE TOGGLES ──────────────────────
    document.querySelectorAll('.btn-deep-dive').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetDiv = document.getElementById(targetId);
            
            if (targetDiv) {
                const isActive = targetDiv.classList.contains('active');
                
                // Close all others and reset their buttons
                document.querySelectorAll('.deep-dive-content').forEach(d => d.classList.remove('active'));
                document.querySelectorAll('.btn-deep-dive').forEach(b => {
                    b.innerHTML = '<i class="fas fa-microscope"></i> Target Analysis';
                });
                
                if (!isActive) {
                    targetDiv.classList.add('active');
                    btn.innerHTML = '<i class="fas fa-times"></i> Close Analysis';
                }
                
                enterBeep();
            }
        });
    });

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

    // ─── PORTRAIT PARALLAX ──────────────────────────────
    const portrait = document.querySelector('.cyber-portrait');
    if (portrait && window.matchMedia('(pointer: fine)').matches) {
        portrait.addEventListener('mousemove', e => {
            const rect = portrait.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const dx = x - xc;
            const dy = y - yc;
            portrait.style.setProperty('--rx', `${dy / -15}deg`);
            portrait.style.setProperty('--ry', `${dx / 15}deg`);
        });
        portrait.addEventListener('mouseleave', () => {
            portrait.style.setProperty('--rx', '0deg');
            portrait.style.setProperty('--ry', '0deg');
        });
    }

    // ─── SCROLL REVEAL (Staggered + Cascading) ────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            // Find index among siblings for stagger
            const parent = el.parentElement;
            const siblings = parent ? Array.from(parent.querySelectorAll('.scroll-reveal, .reveal')) : [];
            const idx = siblings.indexOf(el);
            const delay = Math.max(0, idx) * 120;
            setTimeout(() => {
                el.classList.add('visible');
            }, delay);
            revealObserver.unobserve(el);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.scroll-reveal, .reveal').forEach(el => revealObserver.observe(el));

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
  <span style="color:#3b82f6;">whoami</span>      - Display operative profile
  <span style="color:#3b82f6;">skills</span>      - Enumerate technical arsenal
  <span style="color:#3b82f6;">projects</span>    - List deployed mission logs
  <span style="color:#3b82f6;">experience</span>  - View service history
  <span style="color:#3b82f6;">pgp</span>         - Fetch cryptographic public key
  <span style="color:#3b82f6;">contact</span>     - Establish secure comms
  <span style="color:#3b82f6;">coffee</span>      - Establish caffeine levels
  <span style="color:#3b82f6;">socials</span>     - Establish external links
  <span style="color:#3b82f6;">decrypt</span>     - Execute decryption routine
  <span style="color:#3b82f6;">clear</span>       - Clear terminal output
  <span style="color:#3b82f6;">sudo mode</span>   - Override environmental constraints
  <span style="color:#3b82f6;">exit</span>        - Terminate shell session
<br>`,
        whoami: () => `
[+] NIKHIL SHAKYA
Role: Aspiring Security Engineer & Cloud Researcher
Education: B.Tech (Hons.) CSE - Cybersecurity & Blockchain (LPU)
Status: Pre-final year student (6th Sem), actively seeking job/internship opportunities.
<br>`,
        coffee: () => `
  ( (
   ) )
........
|      |]  > Brewing fresh dark roast...
\\      /   > Caffeine levels stabilizing.
 \`----'    > Ready for deployment.
<br>`,
        socials: () => `
[+] ESTABLISHING EXTERNAL LINKS
LinkedIn: linkedin.com/in/nikhilshakya0905
GitHub:   github.com/Nikhil0905
Medium:   medium.com/@nikhilshakya0905
<br>`,
        decrypt: (args) => {
            if (!args || args.length === 0 || args[0] === 'help') {
                return `Usage: decrypt [target]<br>Targets: projects, skills, ui, system, [custom_string]`;
            }
            const target = args[0].toLowerCase();
            
            if (target === 'projects') {
                document.querySelectorAll('.project-card').forEach(card => {
                    card.classList.add('decrypted');
                    setTimeout(() => card.classList.remove('decrypted'), 8000);
                });
                enterBeep();
                return `[+] BYPASSING Project Filters...<br>[+] DATA RESTORED: Mission logs are now at peak visual fidelity (8s).`;
            }
            
            if (target === 'skills') {
                document.querySelectorAll('.skill-card, .skill-node').forEach(card => {
                    card.classList.add('pulse-glow');
                    setTimeout(() => card.classList.remove('pulse-glow'), 8000);
                });
                return `[+] CALIBRATING Neural-Skill Map...<br>[+] SUCCESS: Competencies illuminated (8s).`;
            }

            if (target === 'ui') {
                document.body.classList.add('ui-decrypt-ripple');
                setTimeout(() => document.body.classList.remove('ui-decrypt-ripple'), 3000);
                return `[+] RESETTING Interface Scanlines...<br>[+] Global aesthetic stabilization in progress.`;
            }

            if (target === 'system') {
                const flash = document.createElement('div');
                flash.className = 'system-flash';
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 1000);
                return `[!] ACCESSING CORE OPERATING SYSTEM...<br>[+] STATUS: STABLE<br>[+] UPTIME: 99.9%<br>[+] KERNEL: Custom_NS-Sec_v2.0`;
            }

            return `
[!] INITIATING BRUTEFORCE ON: ${sanitizeHTML(args[0])}
[+] 0x234... FAILED
[+] 0x9A2... SUCCESS
[+] DECRYPTED DATA: "Knowledge is the only weapon that cannot be taken."
<br>`;
        },
        skills: () => `
[+] Initiating skill enumeration...
-> Languages: Python, C/C++, Bash, SQL, Solidity, JavaScript
-> Defense: AWS, Linux, Windows Internals, Splunk, Active Directory
-> Offense: Web App Pentesting, Wireshark, Burp Suite, Metasploit
-> DevOps: Docker, Terraform, Git, PowerShell
<br>`,
        experience: () => `
[+] Parsing career.log (Internships & Research):
1. Cyber Security Intern @ Techvanto (Jun 2025 - Jul 2025)
   - Developed ML-based NIDS, performed pentesting, completed 60+ THM labs.
2. Cyber Security Intern @ Redynox (Jun 2025 - Jun 2025)
   - Exploited OWASP Top 10 vulnerabilities, performed manual pentesting.
[*] Status: Actively seeking entry-level placement opportunities.
<br>`,
        projects: () => `
[+] Discovered deployments (Research & Academic Labs):
1. Cloud Control-Plane Purple Team Lab (Research Deployment)
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
        pgp: () => `
[+] PGP KEY LOCATION:
> <span style="color:#0f0;">wget https://0xlunatic.github.io/assets/pgp.txt</span>
> <a href="assets/pgp.txt" target="_blank" class="term-link">[ Direct Download Link ]</a>
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
        const parts = input.trim().split(/\s+/);
        const cmdName = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (COMMANDS[cmdName]) {
            const result = COMMANDS[cmdName](args);
            if (result) appendOutput(`<div>${result}</div>`);
        } else if (cmdName.startsWith("sudo")) {
            appendOutput(`<div><span style="color:#ef4444;">[!]</span> Access denied. This incident will be reported.</div><br>`);
        } else {
            appendOutput(`<div>bash: ${sanitizeHTML(cmdName)}: command not found</div><br>`);
        }
    }

})();

/* =========================================================================
   SCROLL PROGRESS HUD & EASTER EGG
   ========================================================================= */

// 1. Scroll Progress Bar
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.body.offsetHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    scrollProgress.style.width = Math.min(Math.round(scrollPercent * 100), 100) + '%';
}, { passive: true });

// 1b. Parallax Floating Hexagons on Scroll
const hexScanners = document.querySelectorAll('.hex-scanner');
if (hexScanners.length) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        hexScanners.forEach((hex, i) => {
            const speed = 0.02 + (i * 0.015);
            const rotate = scrollY * (0.01 + i * 0.005);
            hex.style.transform = `translateY(${scrollY * speed}px) rotate(${rotate}deg)`;
        });
    }, { passive: true });
}

// 1c. Hero Title Text Scramble Effect
function textScramble(el) {
    if (!el || el.dataset.scrambled) return;
    el.dataset.scrambled = 'true';
    const originalText = el.textContent;
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const revealedLen = Math.floor(progress * originalText.length);
        let result = '';
        for (let i = 0; i < originalText.length; i++) {
            if (originalText[i] === ' ') {
                result += ' ';
            } else if (i < revealedLen) {
                result += originalText[i];
            } else {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        el.textContent = result;
        if (progress < 1) requestAnimationFrame(animate);
        else el.textContent = originalText;
    }
    // Delay to start after loader
    setTimeout(() => requestAnimationFrame(animate), 1500);
}

// Run scramble on the hero title
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) textScramble(heroTitle);

// 2. Keyboard Easter Egg (Typing "sudo" or "root")
let keyBuffer = '';
const easterEggTargets = ['sudo', 'root'];
let easterEggTriggered = false;

window.addEventListener('keydown', (e) => {
    if (easterEggTriggered) return;
    
    // Only capture letter keystrokes
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        keyBuffer += e.key.toLowerCase();
        
        // Keep buffer size tight to prevent memory bloat
        if (keyBuffer.length > 10) {
            keyBuffer = keyBuffer.substring(keyBuffer.length - 10);
        }

        easterEggTargets.forEach(target => {
            if (keyBuffer.includes(target)) {
                triggerEasterEgg();
                keyBuffer = ''; 
            }
        });
    }
});

function triggerEasterEgg() {
    easterEggTriggered = true;
    
    // Play dramatic glitch sound (using our existing synth)
    playSound(400, 'square', 0.1);
    setTimeout(() => playSound(200, 'sawtooth', 0.3), 100);
    
    // Intense screen glitch
    document.body.style.filter = 'contrast(200%) hue-rotate(90deg) invert(10%)';
    document.body.style.transform = 'translate(-10px, 10px) scale(1.02)';
    
    setTimeout(() => {
        // Reset screen glitch
        document.body.style.filter = 'none';
        document.body.style.transform = 'none';
        
        // Force them into Root Access mode if they aren't already
        const toggle = document.getElementById('mode-toggle');
        if (toggle && !toggle.checked) {
            toggle.click();
        }
        
        // Auto-open the terminal and mock them
        const termBtn = document.getElementById('terminalBtn');
        if (termBtn) {
            setTimeout(() => {
                const overlay = document.getElementById('terminalOverlay');
                if (!overlay.classList.contains('active')) termBtn.click();
                
                setTimeout(() => {
                    const termOutput = document.getElementById('terminalOutput');
                    if (termOutput) {
                        termOutput.innerHTML = '<span class="prompt-user">root@ns</span>:<span class="prompt-path">/var/log/auth</span>$ <br><br>' + 
                            '<span class="output-red" style="font-weight: 800; font-size: 1.2rem;">[!] CRITICAL: UNAUTHORIZED PRIVILEGE ESCALATION ATTEMPT DETECTED</span><br>' +
                            '<span style="color: #888;">[*] Locking active session...</span><br>' +
                            '<span style="color: #888;">[*] Tracing source IP...</span><br>' +
                            '<span class="output-green">[+] Just kidding. Glad you found the easter egg! - Nikhil</span><br><br>';
                    }
                }, 600);
            }, 200);
        }
        
        // Allow the trick to be done again after a delay
        setTimeout(() => { easterEggTriggered = false; }, 10000);
    }, 300);
}

// 3. Register Service Worker (PWA Offline Support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('ServiceWorker registered successfully with scope: ', registration.scope);
        }).catch(error => {
            console.log('ServiceWorker registration failed: ', error);
        });
    });
}


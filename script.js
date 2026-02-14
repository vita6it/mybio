/* ═══════════════════════════════════════════════════════════
   SCRIPT.JS — Personal BIO Page (Discord-style)
   ═══════════════════════════════════════════════════════════ */

// ─── DOM Ready ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // ─── Background Music (local MP3) ─────────────────────
    const bgMusic = document.getElementById('bgMusic');
    let audioReady = false;
    let musicPlaying = false;

    if (bgMusic) {
        bgMusic.volume = 0.5;

        // Wait until browser has enough data to play through without stopping
        bgMusic.addEventListener('canplaythrough', () => {
            audioReady = true;
        });

        // If already buffered (cached)
        if (bgMusic.readyState >= 4) {
            audioReady = true;
        }
    }

    // ─── Enter Screen (click to enter + autoplay music) ───
    const enterScreen = document.getElementById('enterScreen');
    const soundBtn = document.getElementById('soundToggle');
    const iconOn = soundBtn ? soundBtn.querySelector('.sound-on') : null;
    const iconOff = soundBtn ? soundBtn.querySelector('.sound-off') : null;

    if (enterScreen) {
        enterScreen.addEventListener('click', () => {
            // Fade out the enter screen
            enterScreen.classList.add('hidden');

            // Start music
            if (bgMusic) {
                bgMusic.play().catch(err => {
                    console.log('Audio play failed:', err);
                });
                musicPlaying = true;

                // Update sound toggle icon to show "playing" state
                if (iconOn) iconOn.style.display = 'block';
                if (iconOff) iconOff.style.display = 'none';
            }

            // Remove from DOM after transition
            setTimeout(() => {
                enterScreen.remove();
            }, 700);
        });
    }

    // ─── Sound Toggle (controls local MP3 music) ──────────
    if (soundBtn && bgMusic) {

        soundBtn.addEventListener('click', () => {
            if (musicPlaying) {
                bgMusic.pause();
                musicPlaying = false;
                if (iconOn) iconOn.style.display = 'none';
                if (iconOff) iconOff.style.display = 'block';
            } else {
                if (!audioReady) {
                    bgMusic.load();
                    bgMusic.addEventListener('canplaythrough', () => {
                        bgMusic.play();
                    }, { once: true });
                } else {
                    bgMusic.play().catch(err => {
                        console.log('Audio play failed:', err);
                    });
                }
                musicPlaying = true;
                if (iconOn) iconOn.style.display = 'block';
                if (iconOff) iconOff.style.display = 'none';
            }
        });
    }

    // ─── Generate Snow Particles ──────────────────────────
    const container = document.getElementById('particlesContainer');
    if (container) {
        const count = 45;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'particle';
            const size = Math.random() * 2.5 + 1;
            const left = Math.random() * 100;
            const dur = Math.random() * 12 + 8;
            const delay = Math.random() * -20;
            const drift = (Math.random() - 0.5) * 80;
            const opacity = Math.random() * 0.4 + 0.15;

            p.style.cssText = `
                left: ${left}%;
                width: ${size}px;
                height: ${size}px;
                --d: ${dur}s;
                --drift: ${drift}px;
                --o: ${opacity};
                animation-delay: ${delay}s;
            `;
            container.appendChild(p);
        }
    }

    // ─── Subtle card tilt on hover ────────────────────────
    const card = document.getElementById('bioCard');
    if (card) {
        const hero = document.querySelector('.hero');

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            const tiltX = y * -4;
            const tiltY = x * 4;

            card.style.transform =
                `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1)`;
        });

        hero.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            setTimeout(() => { card.style.transition = ''; }, 600);
        });
    }

    // ─── Staggered entrance animations ────────────────────
    if (card) {
        const leftEls = card.querySelectorAll('.bio-card__left > *');
        const rightEls = card.querySelectorAll('.bio-card__right > *');
        const allEls = [...leftEls, ...rightEls];

        allEls.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(14px)';
            el.style.transition = `opacity 0.5s ease ${0.25 + i * 0.08}s, transform 0.5s ease ${0.25 + i * 0.08}s`;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });
            });
        });
    }

    // ─── Video load fallback ──────────────────────────────
    const video = document.getElementById('bgVideo');
    if (video) {
        video.addEventListener('error', () => {
            const bg = document.querySelector('.video-bg');
            if (bg) bg.style.background = '#050507';
        });
    }

    // ─── Animate view counter on load ─────────────────────
    const counterEl = document.querySelector('.view-counter__number');
    if (counterEl) {
        const target = parseInt(counterEl.textContent.replace(/,/g, ''), 10);
        const duration = 2000;
        const start = performance.now();
        counterEl.textContent = '0';

        function animateCount(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);
            counterEl.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(animateCount);
        }

        setTimeout(() => requestAnimationFrame(animateCount), 800);
    }


    // ─── Toast Notification System ────────────────────────
    function showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        // Trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        // Clear existing timeout if any
        if (toast.timeout) clearTimeout(toast.timeout);

        toast.timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ─── Copy to Clipboard Logic ──────────────────────────
    const copyButtons = document.querySelectorAll('[data-copy]');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const textToCopy = btn.getAttribute('data-copy');
            const label = btn.getAttribute('aria-label') || 'Text';

            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast(`${label} copied: ${textToCopy}`);
            }).catch(err => {
                console.error('Failed to copy:', err);
                showToast('Failed to copy');
            });
        });
    });

});

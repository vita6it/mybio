/* ═══════════════════════════════════════════════════════════
   SCRIPT.JS — Personal BIO Page (Discord-style)
   ═══════════════════════════════════════════════════════════ */

// ─── DOM Ready ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    const bgVideo = document.getElementById('bgVideo');
    let musicPlaying = false;

    // ─── Enter Screen (click to enter + unmute video audio) ───
    const enterScreen = document.getElementById('enterScreen');
    const soundBtn = document.getElementById('soundToggle');
    const iconOn = soundBtn ? soundBtn.querySelector('.sound-on') : null;
    const iconOff = soundBtn ? soundBtn.querySelector('.sound-off') : null;

    if (enterScreen) {
        enterScreen.addEventListener('click', () => {
            // Fade out the enter screen
            enterScreen.classList.add('hidden');
            musicPlaying = true;

            // Unmute the background video to enable audio
            if (bgVideo) {
                bgVideo.muted = false;
                bgVideo.volume = 0.5;
                bgVideo.play().catch(err => {
                    console.log('Video play failed:', err);
                });
            }

            // Update sound toggle icon to show "playing" state
            if (iconOn) iconOn.style.display = 'block';
            if (iconOff) iconOff.style.display = 'none';

            // Remove from DOM after transition
            setTimeout(() => {
                enterScreen.remove();
            }, 700);
        });
    }

    // ─── Sound Toggle (controls video audio) ──────────────
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            if (musicPlaying) {
                if (bgVideo) bgVideo.muted = true;
                musicPlaying = false;
                if (iconOn) iconOn.style.display = 'none';
                if (iconOff) iconOff.style.display = 'block';
            } else {
                if (bgVideo) {
                    bgVideo.muted = false;
                    bgVideo.volume = 0.5;
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

    // ─── Video Loader / Buffering Spinner ──────────────────
    const videoLoader = document.getElementById('videoLoader');
    if (bgVideo && videoLoader) {
        // Video is ready to play smoothly
        function showVideo() {
            bgVideo.classList.add('ready');
            videoLoader.classList.add('hidden');
        }

        // Video is buffering / stalling
        function showLoader() {
            bgVideo.classList.remove('ready');
            videoLoader.classList.remove('hidden');
        }

        // When enough data is buffered
        bgVideo.addEventListener('canplaythrough', showVideo);

        // If already buffered (cached)
        if (bgVideo.readyState >= 4) {
            showVideo();
        }

        // Show spinner again if video stalls during playback
        bgVideo.addEventListener('waiting', showLoader);
        bgVideo.addEventListener('playing', showVideo);

        // Error fallback
        bgVideo.addEventListener('error', () => {
            videoLoader.classList.add('hidden');
            document.querySelector('.video-bg').style.background = '#050507';
        });
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

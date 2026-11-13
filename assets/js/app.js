class MedicalPortfolioApp {
    constructor() {
        this.root = document.documentElement;
        this.themeToggleBtn = document.querySelector('[data-theme-toggle]');
        this.themeIcon = document.querySelector('[data-theme-icon]');
        this.navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
        this.sections = Array.from(document.querySelectorAll('main section[id]'));
        this.progressBar = document.getElementById('scrollProgressBar');
        this.timelineFilters = Array.from(document.querySelectorAll('[data-timeline-filter]'));
        this.timelineNodes = Array.from(document.querySelectorAll('[data-stage-category]'));
        this.timelineEmpty = document.getElementById('timelineEmptyState');
        this.rotationFilters = Array.from(document.querySelectorAll('[data-rotation-filter]'));
        this.rotationCards = Array.from(document.querySelectorAll('[data-rotation-country]'));
        this.copyButtons = Array.from(document.querySelectorAll('[data-copy-text], [data-copy-target]'));
        this.toast = document.getElementById('toastNotice');
        this.toastMessage = document.getElementById('toastMessage');
        this.toastTimer = null;
    }

    init() {
        this.initTheme();
        this.initScrollProgress();
        this.initSectionObserver();
        this.initTimelineFilters();
        this.initRotationFilters();
        this.initClipboardButtons();
    }

    initTheme() {
        const savedTheme = localStorage.getItem('medical-portfolio-theme');
        const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
        this.applyTheme(initialTheme);

        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                const current = this.root.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                this.applyTheme(next);
                localStorage.setItem('medical-portfolio-theme', next);
            });
        }
    }

    applyTheme(theme) {
        this.root.setAttribute('data-theme', theme);
        if (this.themeIcon) {
            this.themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    }

    initScrollProgress() {
        if (!this.progressBar) {
            return;
        }

        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percentage = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
            this.progressBar.style.width = `${percentage}%`;
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    initSectionObserver() {
        if (!('IntersectionObserver' in window) || this.sections.length === 0) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.getAttribute('id');
                    this.setActiveNav(activeId);
                }
            });
        }, {
            rootMargin: '-30% 0px -55% 0px',
            threshold: 0.05
        });

        this.sections.forEach((section) => observer.observe(section));
    }

    setActiveNav(sectionId) {
        this.navLinks.forEach((link) => {
            const target = link.getAttribute('data-nav-link');
            const matches = target === sectionId;
            link.classList.toggle('is-active', matches);
        });
    }

    initTimelineFilters() {
        if (this.timelineFilters.length === 0) {
            return;
        }

        this.timelineFilters.forEach((btn) => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-timeline-filter') || 'all';
                this.updateFilterPills(this.timelineFilters, btn);
                this.filterTimelineNodes(filter);
            });
        });
    }

    filterTimelineNodes(filter) {
        let visibleCount = 0;

        this.timelineNodes.forEach((node) => {
            const category = node.getAttribute('data-stage-category');
            const shouldShow = filter === 'all' || category === filter;
            node.classList.toggle('is-hidden', !shouldShow);
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (this.timelineEmpty) {
            this.timelineEmpty.classList.toggle('is-hidden', visibleCount > 0);
        }
    }

    initRotationFilters() {
        if (this.rotationFilters.length === 0) {
            return;
        }

        this.rotationFilters.forEach((btn) => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-rotation-filter') || 'all';
                this.updateFilterPills(this.rotationFilters, btn);

                this.rotationCards.forEach((card) => {
                    const country = card.getAttribute('data-rotation-country');
                    const shouldShow = filter === 'all' || country === filter;
                    card.classList.toggle('is-hidden', !shouldShow);
                });
            });
        });
    }

    updateFilterPills(pills, activePill) {
        pills.forEach((pill) => {
            const isSelected = pill === activePill;
            pill.classList.toggle('is-active', isSelected);
            pill.setAttribute('aria-selected', String(isSelected));
        });
    }

    initClipboardButtons() {
        this.copyButtons.forEach((btn) => {
            btn.addEventListener('click', async () => {
                let textToCopy = btn.getAttribute('data-copy-text') || '';
                const targetId = btn.getAttribute('data-copy-target');
                const label = btn.getAttribute('data-copy-label') || 'Copiado al portapapeles';

                if (!textToCopy && targetId) {
                    const targetEl = document.getElementById(targetId);
                    textToCopy = targetEl ? targetEl.textContent.trim() : '';
                }

                if (!textToCopy) {
                    return;
                }

                const copied = await this.copyText(textToCopy);
                if (copied) {
                    this.showToast(label);
                } else {
                    this.showToast('No fue posible copiar automáticamente');
                }
            });
        });
    }

    async copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                return this.fallbackCopy(text);
            }
        }
        return this.fallbackCopy(text);
    }

    fallbackCopy(text) {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        document.body.appendChild(helper);
        helper.select();
        const success = document.execCommand('copy');
        document.body.removeChild(helper);
        return success;
    }

    showToast(message) {
        if (!this.toast || !this.toastMessage) {
            return;
        }

        this.toastMessage.textContent = message;
        this.toast.classList.add('is-visible');
        this.toast.setAttribute('aria-hidden', 'false');

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        this.toastTimer = setTimeout(() => {
            this.toast.classList.remove('is-visible');
            this.toast.setAttribute('aria-hidden', 'true');
        }, 2800);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new MedicalPortfolioApp();
    app.init();
});

/* ===========================================
   UNIVERSAL MOBILE MENU SYSTEM
   Version: 2.0 | Works on ALL pages
   =========================================== */

// Global mobile menu state
let mobileMenu = {
    isOpen: false,
    hamburger: null,
    navMenu: null,
    overlay: null
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Universal Mobile Menu Initializing...');
    
    // Try to find menu elements
    findMenuElements();
    
    // If elements found, initialize menu
    if (mobileMenu.hamburger && mobileMenu.navMenu) {
        console.log('✅ Mobile menu elements found');
        initializeMobileMenu();
        setupEventListeners();
        setupResizeHandler();
    } else {
        console.log('❌ Mobile menu elements not found, attempting auto-fix...');
        autoFixMenuStructure();
    }
});

/* ========== FIND MENU ELEMENTS ========== */
function findMenuElements() {
    console.log('🔍 Searching for menu elements...');
    
    // Try multiple selectors for hamburger
    const hamburgerSelectors = [
        '.hamburger',
        '#mobileMenuToggle',
        '.menu-toggle',
        '.navbar-toggle',
        '.mobile-menu-btn',
        'button[aria-label*="menu"]',
        'button[aria-label*="Menu"]'
    ];
    
    for (const selector of hamburgerSelectors) {
        mobileMenu.hamburger = document.querySelector(selector);
        if (mobileMenu.hamburger) {
            console.log(`✅ Found hamburger with selector: ${selector}`);
            break;
        }
    }
    
    // Try multiple selectors for navigation menu
    const navMenuSelectors = [
        '.nav-menu',
        '.navbar-menu',
        '.main-nav',
        '.navigation',
        '.navbar-nav',
        '.site-nav',
        'nav ul',
        'header ul',
        '.navbar ul'
    ];
    
    for (const selector of navMenuSelectors) {
        mobileMenu.navMenu = document.querySelector(selector);
        if (mobileMenu.navMenu) {
            console.log(`✅ Found nav menu with selector: ${selector}`);
            break;
        }
    }
    
    // Log results for debugging
    console.log('Menu search results:', {
        hamburger: !!mobileMenu.hamburger,
        navMenu: !!mobileMenu.navMenu,
        hamburgerHTML: mobileMenu.hamburger ? mobileMenu.hamburger.outerHTML.substring(0, 100) + '...' : null,
        navMenuHTML: mobileMenu.navMenu ? mobileMenu.navMenu.outerHTML.substring(0, 100) + '...' : null
    });
}

/* ========== AUTO-FIX MENU STRUCTURE ========== */
function autoFixMenuStructure() {
    console.log('🛠️ Attempting to auto-fix menu structure...');
    
    // Look for any button that might be a menu toggle
    const allButtons = document.querySelectorAll('button');
    let foundHamburger = false;
    
    for (const button of allButtons) {
        const text = button.textContent.toLowerCase();
        const className = button.className.toLowerCase();
        const ariaLabel = button.getAttribute('aria-label') || '';
        const id = button.id || '';
        
        if (text.includes('menu') || 
            className.includes('menu') || 
            className.includes('hamburger') || 
            className.includes('toggle') ||
            ariaLabel.includes('menu') ||
            id.includes('menu') ||
            id.includes('toggle')) {
            
            mobileMenu.hamburger = button;
            foundHamburger = true;
            console.log('✅ Found potential hamburger button');
            break;
        }
    }
    
    // Look for navigation menu
    let foundNavMenu = false;
    
    // Try common navigation containers
    const navContainers = [
        'nav',
        '.navbar',
        '.navigation',
        '.header-nav',
        'header'
    ];
    
    for (const container of navContainers) {
        const containerEl = document.querySelector(container);
        if (containerEl) {
            // Look for ul inside container
            const ul = containerEl.querySelector('ul');
            if (ul && ul.querySelectorAll('a').length > 2) {
                mobileMenu.navMenu = ul;
                foundNavMenu = true;
                console.log(`✅ Found navigation menu in ${container}`);
                break;
            }
        }
    }
    
    // If still not found, look for any ul with links
    if (!foundNavMenu) {
        const allULs = document.querySelectorAll('ul');
        for (const ul of allULs) {
            if (ul.querySelectorAll('a[href]').length > 2) {
                mobileMenu.navMenu = ul;
                foundNavMenu = true;
                console.log('✅ Found navigation menu (any UL with links)');
                break;
            }
        }
    }
    
    // If we found both elements, enhance them
    if (foundHamburger && foundNavMenu) {
        console.log('✅ Auto-fix successful, enhancing elements...');
        enhanceMenuElements();
        initializeMobileMenu();
        setupEventListeners();
        setupResizeHandler();
    } else {
        console.log('❌ Auto-fix failed. Creating emergency menu...');
        createEmergencyMenu();
        showMenuDebugInfo();
    }
}

/* ========== ENHANCE MENU ELEMENTS ========== */
function enhanceMenuElements() {
    // Add hamburger spans if missing
    if (mobileMenu.hamburger && !mobileMenu.hamburger.querySelector('span')) {
        console.log('➕ Adding hamburger spans');
        mobileMenu.hamburger.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            mobileMenu.hamburger.appendChild(span);
        }
    }
    
    // Add hamburger class if missing
    if (mobileMenu.hamburger && !mobileMenu.hamburger.classList.contains('hamburger')) {
        mobileMenu.hamburger.classList.add('hamburger');
    }
    
    // Add nav-menu class if missing
    if (mobileMenu.navMenu && !mobileMenu.navMenu.classList.contains('nav-menu')) {
        mobileMenu.navMenu.classList.add('nav-menu');
    }
    
    // Ensure hamburger is visible on mobile
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .hamburger {
                display: flex !important;
            }
            .nav-menu:not(.active) {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

/* ========== CREATE EMERGENCY MENU ========== */
function createEmergencyMenu() {
    console.log('🚨 Creating emergency mobile menu');
    
    // Check if emergency menu already exists
    if (document.getElementById('emergencyMobileMenu')) {
        console.log('⚠️ Emergency menu already exists');
        return;
    }
    
    // Create emergency menu container
    const emergencyMenu = document.createElement('div');
    emergencyMenu.id = 'emergencyMobileMenu';
    emergencyMenu.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        z-index: 10000;
    `;
    
    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = 'emergency-hamburger';
    hamburger.setAttribute('aria-label', 'Menu');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        background: #001F3F;
        border: none;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        z-index: 10001;
        padding: 8px;
    `;
    
    hamburger.querySelectorAll('span').forEach(span => {
        span.style.cssText = `
            display: block;
            width: 100%;
            height: 3px;
            background: white;
            border-radius: 2px;
            transition: 0.3s;
        `;
    });
    
    // Create menu overlay
    const overlay = document.createElement('div');
    overlay.className = 'emergency-menu-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: none;
    `;
    
    // Create menu panel
    const menuPanel = document.createElement('div');
    menuPanel.className = 'emergency-menu-panel';
    menuPanel.style.cssText = `
        position: fixed;
        top: 0;
        right: -300px;
        width: 280px;
        height: 100vh;
        background: #001F3F;
        z-index: 10000;
        padding: 70px 20px 20px;
        transition: right 0.3s ease;
        overflow-y: auto;
    `;
    
    // Get all navigation links from page
    const links = [];
    
    // Try to find links in common locations
    const linkContainers = [
        'nav a',
        '.navbar a',
        '.navigation a',
        'header a',
        '.main-nav a'
    ];
    
    linkContainers.forEach(selector => {
        document.querySelectorAll(selector).forEach(link => {
            if (link.href && !link.href.includes('javascript') && link.textContent.trim()) {
                links.push({
                    text: link.textContent.trim(),
                    href: link.href,
                    className: link.className
                });
            }
        });
    });
    
    // Remove duplicates
    const uniqueLinks = links.filter((link, index, self) =>
        index === self.findIndex(l => l.href === link.href)
    );
    
    // Add links to menu panel
    if (uniqueLinks.length > 0) {
        const menuList = document.createElement('ul');
        menuList.style.cssText = `
            list-style: none;
            padding: 0;
            margin: 0;
        `;
        
        uniqueLinks.forEach(link => {
            const li = document.createElement('li');
            li.style.marginBottom = '5px';
            
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            a.style.cssText = `
                display: block;
                padding: 12px 15px;
                color: white;
                text-decoration: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                transition: background 0.3s;
            `;
            
            a.addEventListener('mouseenter', () => {
                a.style.background = 'rgba(255,255,255,0.1)';
            });
            
            a.addEventListener('mouseleave', () => {
                a.style.background = 'transparent';
            });
            
            li.appendChild(a);
            menuList.appendChild(li);
        });
        
        menuPanel.appendChild(menuList);
    } else {
        // Add default links if none found
        menuPanel.innerHTML = `
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 5px;">
                    <a href="/" style="display: block; padding: 12px 15px; color: white; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.1);">Home</a>
                </li>
                <li style="margin-bottom: 5px;">
                    <a href="/about" style="display: block; padding: 12px 15px; color: white; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.1);">About</a>
                </li>
                <li style="margin-bottom: 5px;">
                    <a href="/contact" style="display: block; padding: 12px 15px; color: white; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.1);">Contact</a>
                </li>
            </ul>
        `;
    }
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    menuPanel.appendChild(closeBtn);
    
    // Assemble emergency menu
    emergencyMenu.appendChild(hamburger);
    emergencyMenu.appendChild(overlay);
    emergencyMenu.appendChild(menuPanel);
    document.body.appendChild(emergencyMenu);
    
    // Setup emergency menu functionality
    setupEmergencyMenu();
}

/* ========== SETUP EMERGENCY MENU ========== */
function setupEmergencyMenu() {
    const hamburger = document.querySelector('.emergency-hamburger');
    const overlay = document.querySelector('.emergency-menu-overlay');
    const menuPanel = document.querySelector('.emergency-menu-panel');
    const closeBtn = menuPanel?.querySelector('button');
    
    if (!hamburger || !overlay || !menuPanel) return;
    
    let isOpen = false;
    
    const toggleMenu = () => {
        isOpen = !isOpen;
        
        if (isOpen) {
            menuPanel.style.right = '0';
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Animate hamburger
            hamburger.querySelectorAll('span')[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            hamburger.querySelectorAll('span')[1].style.opacity = '0';
            hamburger.querySelectorAll('span')[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            menuPanel.style.right = '-300px';
            overlay.style.display = 'none';
            document.body.style.overflow = '';
            
            // Reset hamburger
            hamburger.querySelectorAll('span')[0].style.transform = 'none';
            hamburger.querySelectorAll('span')[1].style.opacity = '1';
            hamburger.querySelectorAll('span')[2].style.transform = 'none';
        }
    };
    
    // Hamburger click
    hamburger.addEventListener('click', toggleMenu);
    
    // Close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', toggleMenu);
    }
    
    // Overlay click
    overlay.addEventListener('click', toggleMenu);
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            toggleMenu();
        }
    });
    
    // Close when clicking links
    menuPanel.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (isOpen) {
                toggleMenu();
            }
        });
    });
    
    // Only show on mobile
    const checkViewport = () => {
        if (window.innerWidth > 768) {
            hamburger.style.display = 'none';
            if (isOpen) toggleMenu();
        } else {
            hamburger.style.display = 'flex';
        }
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    
    console.log('✅ Emergency mobile menu created and functional');
}

/* ========== INITIALIZE MOBILE MENU ========== */
function initializeMobileMenu() {
    console.log('⚙️ Initializing mobile menu...');
    
    // Create overlay if it doesn't exist
    mobileMenu.overlay = document.querySelector('.mobile-menu-overlay');
    if (!mobileMenu.overlay) {
        mobileMenu.overlay = document.createElement('div');
        mobileMenu.overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(mobileMenu.overlay);
    }
    
    // Ensure mobile menu styles are applied
    ensureMobileStyles();
    
    // Close menu by default
    closeMenu();
    
    console.log('✅ Mobile menu initialized');
}

/* ========== SETUP EVENT LISTENERS ========== */
function setupEventListeners() {
    if (!mobileMenu.hamburger || !mobileMenu.navMenu) return;
    
    console.log('🎯 Setting up menu event listeners...');
    
    // Hamburger click
    mobileMenu.hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Overlay click
    mobileMenu.overlay.addEventListener('click', function(e) {
        if (mobileMenu.isOpen) {
            e.stopPropagation();
            closeMenu();
        }
    });
    
    // Close when clicking menu links (for single page apps)
    mobileMenu.navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768 && mobileMenu.isOpen) {
                closeMenu();
            }
        });
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(event) {
        if (mobileMenu.isOpen && 
            !mobileMenu.navMenu.contains(event.target) && 
            !mobileMenu.hamburger.contains(event.target)) {
            closeMenu();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileMenu.isOpen) {
            closeMenu();
        }
    });
    
    console.log('✅ Event listeners setup complete');
}

/* ========== SETUP RESIZE HANDLER ========== */
function setupResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            handleResize();
        }, 250);
    });
}

function handleResize() {
    // Close menu when resizing to desktop
    if (window.innerWidth > 768 && mobileMenu.isOpen) {
        closeMenu();
    }
    
    // Update mobile menu visibility
    if (window.innerWidth <= 768) {
        ensureMobileVisibility();
    }
}

/* ========== MENU CONTROL FUNCTIONS ========== */
function toggleMenu() {
    if (mobileMenu.isOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    if (!mobileMenu.hamburger || !mobileMenu.navMenu || !mobileMenu.overlay) return;
    
    mobileMenu.isOpen = true;
    
    // Add active classes
    mobileMenu.hamburger.classList.add('active');
    mobileMenu.navMenu.classList.add('active');
    mobileMenu.overlay.classList.add('active');
    
    // Prevent body scroll
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    
    // Animate menu items
    animateMenuItems();
    
    console.log('📱 Mobile menu opened');
}

function closeMenu() {
    if (!mobileMenu.hamburger || !mobileMenu.navMenu || !mobileMenu.overlay) return;
    
    mobileMenu.isOpen = false;
    
    // Remove active classes
    mobileMenu.hamburger.classList.remove('active');
    mobileMenu.navMenu.classList.remove('active');
    mobileMenu.overlay.classList.remove('active');
    
    // Restore body scroll
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    
    console.log('📱 Mobile menu closed');
}

/* ========== ANIMATE MENU ITEMS ========== */
function animateMenuItems() {
    const menuItems = mobileMenu.navMenu.querySelectorAll('li');
    
    menuItems.forEach((item, index) => {
        // Reset animation
        item.style.animation = 'none';
        item.offsetHeight; // Trigger reflow
        
        // Apply staggered animation
        item.style.animation = `slideInRight 0.3s ease forwards ${index * 0.1}s`;
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
    });
}

/* ========== ENSURE MOBILE STYLES ========== */
function ensureMobileStyles() {
    // Check if mobile styles are already added
    if (document.getElementById('mobile-menu-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'mobile-menu-styles';
    styles.textContent = `
        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 990;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .mobile-menu-overlay.active {
            display: block;
            opacity: 1;
        }
        
        /* Mobile Menu Styles */
        @media (max-width: 768px) {
            .hamburger {
                display: flex !important;
                flex-direction: column;
                justify-content: space-between;
                width: 30px;
                height: 24px;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
                z-index: 1001;
            }
            
            .hamburger span {
                width: 100%;
                height: 3px;
                background: white;
                border-radius: 3px;
                transition: all 0.3s ease;
                display: block;
            }
            
            .hamburger.active span:nth-child(1) {
                transform: rotate(45deg) translate(6px, 6px);
            }
            
            .hamburger.active span:nth-child(2) {
                opacity: 0;
            }
            
            .hamburger.active span:nth-child(3) {
                transform: rotate(-45deg) translate(6px, -6px);
            }
            
            .nav-menu:not(.active) {
                display: none !important;
            }
            
            .nav-menu.active {
                position: fixed;
                left: 0;
                top: 0;
                flex-direction: column;
                background-color: #001F3F;
                width: 100%;
                height: 100vh;
                padding: 80px 20px 20px;
                z-index: 999;
                transition: 0.3s ease-in-out;
                overflow-y: auto;
                margin: 0;
                display: flex !important;
            }
            
            .nav-menu.active li {
                width: 100%;
                margin: 0;
                animation: slideInRight 0.3s ease forwards;
                opacity: 0;
            }
            
            .nav-menu.active li:nth-child(1) { animation-delay: 0.1s; }
            .nav-menu.active li:nth-child(2) { animation-delay: 0.15s; }
            .nav-menu.active li:nth-child(3) { animation-delay: 0.2s; }
            .nav-menu.active li:nth-child(4) { animation-delay: 0.25s; }
            .nav-menu.active li:nth-child(5) { animation-delay: 0.3s; }
            .nav-menu.active li:nth-child(6) { animation-delay: 0.35s; }
            .nav-menu.active li:nth-child(7) { animation-delay: 0.4s; }
            .nav-menu.active li:nth-child(8) { animation-delay: 0.45s; }
            .nav-menu.active li:nth-child(9) { animation-delay: 0.5s; }
            
            @keyframes slideInRight {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .nav-menu.active li a {
                padding: 15px 20px;
                display: block;
                width: 100%;
                text-align: left;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0;
                font-size: 16px;
                color: white;
                text-decoration: none;
            }
            
            .nav-menu.active .nav-cta {
                margin-top: 20px;
                background: #D4AF37;
                color: #001F3F !important;
                font-weight: 600;
                padding: 15px !important;
                text-align: center;
                border-radius: 8px;
            }
            
            body.menu-open {
                overflow: hidden;
                height: 100vh;
            }
        }
        
        /* Animation for menu items */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(styles);
    console.log('✅ Mobile menu styles added');
}

/* ========== ENSURE MOBILE VISIBILITY ========== */
function ensureMobileVisibility() {
    if (window.innerWidth <= 768) {
        // Ensure hamburger is visible
        if (mobileMenu.hamburger) {
            mobileMenu.hamburger.style.display = 'flex';
        }
        
        // Hide desktop menu on mobile
        if (mobileMenu.navMenu && !mobileMenu.navMenu.classList.contains('active')) {
            mobileMenu.navMenu.style.display = 'none';
        }
    } else {
        // Ensure hamburger is hidden on desktop
        if (mobileMenu.hamburger) {
            mobileMenu.hamburger.style.display = 'none';
        }
        
        // Ensure menu is visible on desktop
        if (mobileMenu.navMenu) {
            mobileMenu.navMenu.style.display = '';
        }
    }
}

/* ========== DEBUG INFORMATION ========== */
function showMenuDebugInfo() {
    console.group('🔍 Mobile Menu Debug Information');
    console.log('Page URL:', window.location.href);
    console.log('Viewport Width:', window.innerWidth);
    console.log('Hamburger Found:', !!mobileMenu.hamburger);
    console.log('Nav Menu Found:', !!mobileMenu.navMenu);
    console.log('Menu State:', mobileMenu.isOpen ? 'Open' : 'Closed');
    
    // Log all buttons on page
    const allButtons = document.querySelectorAll('button');
    console.log('Total buttons on page:', allButtons.length);
    
    allButtons.forEach((btn, index) => {
        console.log(`Button ${index + 1}:`, {
            text: btn.textContent,
            classes: btn.className,
            id: btn.id,
            ariaLabel: btn.getAttribute('aria-label')
        });
    });
    
    // Log all navigation elements
    const navElements = document.querySelectorAll('nav, .navbar, header');
    console.log('Navigation elements found:', navElements.length);
    
    navElements.forEach((nav, index) => {
        console.log(`Nav element ${index + 1}:`, nav.outerHTML.substring(0, 200) + '...');
    });
    
    console.groupEnd();
}

/* ========== PUBLIC API ========== */
// Export functions for global access
window.mobileMenuAPI = {
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    isOpen: () => mobileMenu.isOpen,
    debug: showMenuDebugInfo
};

/* ========== INITIALIZATION CHECK ========== */
// Check if menu initialized successfully
setTimeout(() => {
    if (!mobileMenu.hamburger || !mobileMenu.navMenu) {
        console.warn('⚠️ Mobile menu not fully initialized');
        console.warn('Attempting fallback initialization...');
        
        // Try one more time
        findMenuElements();
        if (mobileMenu.hamburger && mobileMenu.navMenu) {
            initializeMobileMenu();
            setupEventListeners();
            console.log('✅ Fallback initialization successful');
        } else {
            console.error('❌ Mobile menu initialization failed');
            console.log('Creating emergency menu as last resort...');
            createEmergencyMenu();
        }
    } else {
        console.log('🎉 Mobile menu system ready');
    }
}, 1000);

/* ========== ERROR HANDLING ========== */
// Catch any errors in mobile menu system
window.addEventListener('error', function(event) {
    if (event.message.includes('mobileMenu') || 
        event.message.includes('hamburger') || 
        event.message.includes('navMenu')) {
        console.error('Mobile menu error:', event.error);
        event.preventDefault();
        
        // Try to recover
        setTimeout(() => {
            console.log('Attempting to recover mobile menu...');
            createEmergencyMenu();
        }, 100);
    }
});

/* ========== READY STATE CHECK ========== */
// Check document ready state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📱 Mobile menu system loaded via DOMContentLoaded');
    });
} else {
    console.log('📱 Document already loaded, initializing mobile menu');
}

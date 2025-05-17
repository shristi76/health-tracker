document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginToggle = document.getElementById('login-toggle');
    const signupToggle = document.getElementById('signup-toggle');
    const formWrapper = document.querySelector('.form-wrapper');
    const slider = document.querySelector('.slider');
    const wellnessQuotes = document.querySelector('.wellness-quotes');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    let isSubmitting = false;

    initAnimations();

    loginToggle.addEventListener('click', () => {
        if (!loginToggle.classList.contains('active')) switchForm('login');
    });

    signupToggle.addEventListener('click', () => {
        if (!signupToggle.classList.contains('active')) switchForm('signup');
    });

    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const isPassword = input.type === 'password';

            input.type = isPassword ? 'text' : 'password';
            this.classList.toggle('fa-eye', isPassword);
            this.classList.toggle('fa-eye-slash', !isPassword);

            gsap.fromTo(this, { scale: 0.8, rotation: 0 }, { scale: 1, rotation: 360, duration: 0.3 });
        });
    });

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return;

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!email || !password) return showNotification('Please fill in all fields');

        isSubmitting = true;
        localStorage.setItem('wellnessHubUser', JSON.stringify({
            email,
            isLoggedIn: true,
            loginTime: new Date().toISOString()
        }));

        showSuccessAnimation().then(() => {
            window.location.href = 'index.html';
        });
    });

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return;

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        const termsChecked = document.getElementById('terms').checked;

        if (!name || !email || !password || !confirm) return showNotification('Please fill in all fields');
        if (password !== confirm) return showNotification('Passwords do not match');
        if (!termsChecked) return showNotification('Please agree to the Terms & Conditions');

        isSubmitting = true;
        localStorage.setItem('wellnessHubUser', JSON.stringify({
            name,
            email,
            isLoggedIn: true,
            registrationTime: new Date().toISOString()
        }));

        showSuccessAnimation().then(() => {
            window.location.href = 'index.html';
        });
    });

    function initAnimations() {
        gsap.to(formWrapper, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
        gsap.to(wellnessQuotes, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.5 });
    }

    function switchForm(formType) {
        const currentForm = formType === 'login' ? signupForm : loginForm;
        const targetForm = formType === 'login' ? loginForm : signupForm;

        loginToggle.classList.toggle('active', formType === 'login');
        signupToggle.classList.toggle('active', formType !== 'login');
        gsap.to(slider, { left: formType === 'login' ? '0%' : '50%', duration: 0.3 });

        gsap.to(currentForm, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            onComplete: () => {
                currentForm.classList.remove('active');
                targetForm.classList.add('active');

                gsap.fromTo(targetForm, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 });

                gsap.fromTo(`#${targetForm.id} .input-group`,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0, duration: 0.5,
                        stagger: 0.1,
                        ease: 'power3.out'
                    }
                );

                gsap.fromTo(`#${targetForm.id} .btn`,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.3 }
                );
            }
        });
    }


    function switchForm(formType) {
    const currentForm = formType === 'login' ? signupForm : loginForm;
    const targetForm = formType === 'login' ? loginForm : signupForm;

    // Update toggle buttons and slider
    loginToggle.classList.toggle('active', formType === 'login');
    signupToggle.classList.toggle('active', formType === 'signup');
    gsap.to(slider, { left: formType === 'login' ? '0%' : '50%', duration: 0.3 });

    // Slide out current form to the left/right
    gsap.to(currentForm, {
        x: formType === 'login' ? '-100%' : '100%',
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
            currentForm.classList.remove('active');
            currentForm.style.transform = 'translateX(0)';
            currentForm.style.opacity = 1;

            // Set target form position offscreen and prepare it
            targetForm.classList.add('active');
            gsap.set(targetForm, {
                x: formType === 'login' ? '100%' : '-100%',
                opacity: 0
            });

            // Slide in target form
            gsap.to(targetForm, {
                x: '0%',
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out'
            });

            // Animate form fields
            gsap.fromTo(`#${targetForm.id} .input-group`,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'power3.out',
                    delay: 0.2
                }
            );

            // Animate button
            gsap.fromTo(`#${targetForm.id} .btn`,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0,
                    duration: 0.5,
                    ease: 'power3.out',
                    delay: 0.5
                }
            );
        }
    });
}

    function showNotification(message) {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        container.appendChild(notification);

        gsap.fromTo(notification, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3 });

        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                onComplete: () => notification.remove()
            });
        }, 3000);
    }

    function showSuccessAnimation() {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'success-overlay';
            Object.assign(overlay.style, {
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1000, opacity: 0
            });

            const icon = document.createElement('div');
            icon.innerHTML = '<i class="fas fa-check-circle" style="font-size: 5rem; color: var(--primary-color);"></i>';
            overlay.appendChild(icon);
            document.body.appendChild(overlay);

            gsap.to(overlay, {
                opacity: 1, duration: 0.5,
                onComplete: () => {
                    gsap.fromTo(icon,
                        { scale: 0.5, opacity: 0 },
                        {
                            scale: 1,
                            opacity: 1,
                            duration: 0.5,
                            ease: 'back.out(1.7)',
                            onComplete: () => {
                                setTimeout(() => {
                                    document.body.removeChild(overlay);
                                    resolve();
                                }, 800);
                            }
                        }
                    );
                }
            });
        });
    }

    // function checkLoginStatus() {
    //     try {
    //         const userData = JSON.parse(localStorage.getItem('wellnessHubUser'));
    //         if (userData?.isLoggedIn) {
    //             window.location.href = 'index.html';
    //         }
    //     } catch (err) {
    //         console.error('Login check failed:', err);
    //     }
    // }

    // checkLoginStatus();
});

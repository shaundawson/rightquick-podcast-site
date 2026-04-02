/* ============================================
   RIGHT QUICK PODCAST - MAIN JAVASCRIPT
   ============================================
   Handles: Episodes API, form submission, footer year
   ============================================ */

// These will be injected by Amplify env vars in production
// For local dev, use .env file or APP_CONFIG
const WEB3FORMS_ACCESS_KEY = window.APP_CONFIG?.WEB3FORMS_ACCESS_KEY || '';


/* ============================================
   FOOTER - Update copyright year
   ============================================ */

function updateCopyrightYear() {
    const copyrightElement = document.getElementById('footer-copyright');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `© Right Quick ${currentYear}. All Rights Reserved.`;
    }
}

/* ============================================
   CONTACT FORM - Handle submission
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formMessage = document.getElementById('formMessage');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                // 1. Build FormData from the whole form (this includes h-captcha-response)
                const formData = new FormData(contactForm);

                // 2. Ensure access_key is set (from APP_CONFIG or hidden input)
                if (!formData.get('access_key')) {
                    formData.set('access_key', WEB3FORMS_ACCESS_KEY);
                }

                // 3. Optional extra fields
                if (!formData.get('subject')) {
                    formData.set('subject', 'New message from Right Quick website');
                }

                // 4. Convert FormData -> plain object -> JSON
                const dataObject = Object.fromEntries(formData.entries());
                const jsonBody = JSON.stringify(dataObject);

                // 5. Send to Web3Forms
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: jsonBody
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    formMessage.className = 'form-message success show';
                    formMessage.textContent = '✅ Message sent! We\'ll get back to you soon.';
                    contactForm.reset();
                } else {
                    formMessage.className = 'form-message error show';
                    formMessage.textContent =
                        result.message || '❌ Error sending message. Please try again.';
                }
            } catch (error) {
                console.error('Web3Forms error', error);
                const formMessage = document.getElementById('formMessage');
                formMessage.className = 'form-message error show';
                formMessage.textContent = '❌ Error sending message. Please try again.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    }
});


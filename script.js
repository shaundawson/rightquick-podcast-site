/* Right Quick main JavaScript
   This file handles two simple jobs:
   1. Add the current year to the footer
   2. Send the contact form to Web3Forms
*/

// Pull the Web3Forms key from the config set in index.html.
// If that config is missing for some reason, fall back to an empty string.
const WEB3FORMS_ACCESS_KEY = window.APP_CONFIG?.WEB3FORMS_ACCESS_KEY || '';

/* Add the current year to the footer.
   This keeps the year up to date without editing the HTML every year.
*/
function updateCopyrightYear() {
    const copyrightElement = document.getElementById('footer-copyright');

    // Only update the footer if the element exists on the page.
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `© Right Quick ${currentYear}. All Rights Reserved.`;
    }
}

/* Wait until the page is fully loaded before trying to find elements.
   This makes sure the footer and form already exist in the DOM.
*/
document.addEventListener('DOMContentLoaded', () => {
    // First, update the footer year.
    updateCopyrightYear();

    // Grab the contact form so we can attach the submit handler.
    const contactForm = document.getElementById('contactForm');

    // If the form is not on the page, stop here.
    if (!contactForm) return;

    // Run this function when someone submits the form.
    contactForm.addEventListener('submit', async (e) => {
        // Stop the browser from doing a normal form submit and page refresh.
        e.preventDefault();

        // Grab the message area and submit button so we can update the UI.
        const formMessage = document.getElementById('formMessage');
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        // Lock the button while the form is sending so people cannot click it multiple times.
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            /* Build a FormData object from the form.
               This collects all field values, including the captcha response.
            */
            const formData = new FormData(contactForm);

            /* Add the Web3Forms access key if it is not already in the form.
               This is required for Web3Forms to know which account should receive the message.
            */
            if (!formData.get('access_key')) {
                formData.set('access_key', WEB3FORMS_ACCESS_KEY);
            }

            /* Add a subject line if one was not already provided.
               This helps the email/message come through with useful context.
            */
            if (!formData.get('subject')) {
                formData.set('subject', 'New message from Right Quick website');
            }

            /* Convert the form data into plain JSON.
               Web3Forms accepts JSON, so we turn the form entries into an object
               and then stringify that object before sending it.
            */
            const dataObject = Object.fromEntries(formData.entries());
            const jsonBody = JSON.stringify(dataObject);

            // Send the form data to Web3Forms.
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: jsonBody
            });

            // Read the API response so we can show success or error feedback.
            const result = await response.json();

            // If the request worked, show success text and clear the form.
            if (response.ok && result.success) {
                formMessage.className = 'form-message success show';
                formMessage.textContent = '✅ Message sent! We\'ll get back to you soon.';
                contactForm.reset();
            } else {
                // If the API responds but says something went wrong, show that message.
                formMessage.className = 'form-message error show';
                formMessage.textContent =
                    result.message || '❌ Error sending message. Please try again.';
            }
        } catch (error) {
            // If something breaks completely, log it for debugging and show a fallback error.
            console.error('Web3Forms error', error);
            formMessage.className = 'form-message error show';
            formMessage.textContent = '❌ Error sending message. Please try again.';
        } finally {
            // No matter what happens, turn the button back on at the end.
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
});

// Initialize Supabase
const SUPABASE_URL = 'https://yrqfglueiungguldisym.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Q7r3Pd9GMh3_-kF8XyILZg_A8ZtJTul';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardContent = document.getElementById('dashboard-content');
const loginForm = document.getElementById('login-form');
const messagesContainer = document.getElementById('messages-container');
const ratingsContainer = document.getElementById('ratings-container');

// Check if user is already logged in
checkAuth();

async function checkAuth() {
    // Check if Supabase keys are set
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        alert('Setup Required: Please configure Supabase API keys in admin-script.js');
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showDashboard();
    }
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert('Login failed: ' + error.message);
    } else {
        showDashboard();
    }
});

async function showDashboard() {
    authSection.style.display = 'none';
    dashboardContent.style.display = 'block';
    
    // Load data
    await loadMessages();
    await loadRatings();
}

async function loadMessages() {
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = `<div class="empty-state">Error: ${error.message}</div>`;
        return;
    }

    if (data.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-state">No messages yet</div>';
        return;
    }

    messagesContainer.innerHTML = data.map(msg => `
        <div class="message-card">
            <div class="card-header">
                <div>
                    <div class="card-name">${escapeHtml(msg.name)}</div>
                    <div class="card-email">${escapeHtml(msg.email)}</div>
                </div>
                <div class="card-date">${new Date(msg.created_at).toLocaleString()}</div>
            </div>
            <div class="card-message">${escapeHtml(msg.message)}</div>
        </div>
    `).join('');
}

async function loadRatings() {
    const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading ratings:', error);
        ratingsContainer.innerHTML = `<div class="empty-state">Error: ${error.message}</div>`;
        return;
    }

    if (data.length === 0) {
        ratingsContainer.innerHTML = '<div class="empty-state">No ratings yet</div>';
        return;
    }

    ratingsContainer.innerHTML = data.map(rating => `
        <div class="rating-card">
            <div class="card-header">
                <div>
                    <div class="card-name">${escapeHtml(rating.name)}</div>
                    <div class="card-email">${escapeHtml(rating.email)}</div>
                </div>
                <div class="card-date">${new Date(rating.created_at).toLocaleString()}</div>
            </div>
            <div class="stars">${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}</div>
            ${rating.review ? `<div class="card-review">${escapeHtml(rating.review)}</div>` : ''}
        </div>
    `).join('');
}

// XSS Prevention helper
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

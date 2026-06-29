const fintrackAuth = (() => {
    const USERS_STORAGE_KEY = 'fintrackUsers';
    const SESSION_STORAGE_KEY = 'fintrackSession';

    const authScreen = document.getElementById('auth-screen');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    let state = null;
    let callbacks = {};

    function init(options) {
        state = options.appState;
        callbacks = {
            onLogin: options.onLogin,
            onBeforeLogout: options.onBeforeLogout,
            onLogout: options.onLogout
        };

        setupEventListeners();
        loadSession();
    }

    function setupEventListeners() {
        loginForm.addEventListener('submit', handleLoginSubmit);
        registerForm.addEventListener('submit', handleRegisterSubmit);
        showRegisterBtn.addEventListener('click', showRegister);
        showLoginBtn.addEventListener('click', showLogin);
        logoutBtn.addEventListener('click', handleLogout);
    }

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || {};
        } catch (error) {
            return {};
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    function normalizeUserId(userId) {
        return userId.trim().toLowerCase();
    }

    function validateUserId(userId) {
        if (!userId) {
            return 'User ID is required.';
        }

        if (userId.length < 3) {
            return 'User ID must be at least 3 characters.';
        }

        if (!/^[a-zA-Z0-9_]+$/.test(userId)) {
            return 'Use only letters, numbers, and underscore.';
        }

        return '';
    }

    function validatePassword(password) {
        if (!password) {
            return 'Password is required.';
        }

        if (password.length < 6) {
            return 'Password must be at least 6 characters.';
        }

        return '';
    }

    function setFieldError(id, message) {
        const errorElement = document.getElementById(`${id}-error`);
        const field = document.getElementById(id);

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (field) {
            field.setAttribute('aria-invalid', message ? 'true' : 'false');
        }
    }

    function setAuthMessage(id, message, isSuccess = false) {
        const messageElement = document.getElementById(id);

        if (!messageElement) {
            return;
        }

        messageElement.textContent = message;
        messageElement.classList.toggle('success', isSuccess);
    }

    function clearLoginErrors() {
        setFieldError('login-id', '');
        setFieldError('login-password', '');
        setAuthMessage('login-message', '');
    }

    function clearRegisterErrors() {
        setFieldError('register-name', '');
        setFieldError('register-id', '');
        setFieldError('register-password', '');
        setFieldError('register-confirm-password', '');
        setAuthMessage('register-message', '');
    }

    function showLogin() {
        loginView.hidden = false;
        registerView.hidden = true;
        registerForm.reset();
        clearRegisterErrors();
        clearLoginErrors();
        document.getElementById('login-id').focus();
    }

    function showRegister() {
        loginView.hidden = true;
        registerView.hidden = false;
        loginForm.reset();
        clearLoginErrors();
        clearRegisterErrors();
        document.getElementById('register-name').focus();
    }

    function handleLoginSubmit(event) {
        event.preventDefault();
        clearLoginErrors();

        const userId = document.getElementById('login-id').value.trim();
        const password = document.getElementById('login-password').value;
        let isValid = true;

        const userIdError = validateUserId(userId);
        const passwordError = validatePassword(password);

        if (userIdError) {
            setFieldError('login-id', userIdError);
            isValid = false;
        }

        if (passwordError) {
            setFieldError('login-password', passwordError);
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const users = getUsers();
        const userKey = normalizeUserId(userId);
        const user = users[userKey];

        if (!user || user.password !== password) {
            setAuthMessage('login-message', 'Invalid user ID or password.');
            return;
        }

        startSession(userKey, user);
    }

    function handleRegisterSubmit(event) {
        event.preventDefault();
        clearRegisterErrors();

        const fullName = document.getElementById('register-name').value.trim();
        const userId = document.getElementById('register-id').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const users = getUsers();
        const userKey = normalizeUserId(userId);
        let isValid = true;

        if (!fullName) {
            setFieldError('register-name', 'Full name is required.');
            isValid = false;
        } else if (fullName.length < 2) {
            setFieldError('register-name', 'Enter at least 2 characters.');
            isValid = false;
        }

        const userIdError = validateUserId(userId);
        if (userIdError) {
            setFieldError('register-id', userIdError);
            isValid = false;
        } else if (users[userKey]) {
            setFieldError('register-id', 'This user ID is already registered.');
            isValid = false;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setFieldError('register-password', passwordError);
            isValid = false;
        }

        if (!confirmPassword) {
            setFieldError('register-confirm-password', 'Please confirm your password.');
            isValid = false;
        } else if (password !== confirmPassword) {
            setFieldError('register-confirm-password', 'Passwords do not match.');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const user = {
            userId,
            name: fullName,
            password,
            createdAt: new Date().toISOString()
        };

        users[userKey] = user;
        saveUsers(users);
        setAuthMessage('register-message', 'Account created. Logging you in...', true);
        startSession(userKey, user);
    }

    function startSession(userKey, user) {
        state.currentUser = {
            userKey,
            userId: user.userId,
            name: user.name
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state.currentUser));
        loginForm.reset();
        registerForm.reset();

        if (typeof callbacks.onLogin === 'function') {
            callbacks.onLogin();
        }
    }

    function loadSession() {
        try {
            const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
            const users = getUsers();

            if (session?.userKey && users[session.userKey]) {
                state.currentUser = {
                    userKey: session.userKey,
                    userId: users[session.userKey].userId,
                    name: users[session.userKey].name
                };
            }
        } catch (error) {
            state.currentUser = null;
        }
    }

    function handleLogout() {
        if (typeof callbacks.onBeforeLogout === 'function') {
            callbacks.onBeforeLogout();
        }

        localStorage.removeItem(SESSION_STORAGE_KEY);
        state.currentUser = null;

        if (typeof callbacks.onLogout === 'function') {
            callbacks.onLogout();
        }

        showAuth();
    }

    function showAuth() {
        authScreen.hidden = false;
        showLogin();
    }

    function hideAuth() {
        authScreen.hidden = true;
    }

    return {
        init,
        showAuth,
        hideAuth
    };
})();

window.fintrackAuth = fintrackAuth;

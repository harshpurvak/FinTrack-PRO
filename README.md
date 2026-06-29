# FinTrack Pro

FinTrack Pro is a beginner-friendly personal finance tracker project built using HTML, CSS, and JavaScript. The main idea of this project is to help users manage their daily income and expenses in a simple and clean dashboard.

In this app, a user can register, login, and use the finance tracker after authentication. The app allows users to add income and expense transactions, edit or delete them, search through records, filter transactions, and view total income, total expense, current balance, and total transactions. It also includes a cash flow chart using Chart.js, currency selection, dark mode, and logout functionality.

The project uses localStorage to save user accounts, login sessions, settings, and transaction data. This means the data stays saved in the same browser even after refreshing the page. The login session is also stored locally, so the user can remain logged in until they click logout.

The project is divided into simple files. The index.html file contains the main structure of the app, style.css handles the design and responsive layout, auth.js manages login, register, logout, and session storage, and app.js manages the finance tracker features like transactions, totals, filters, charts, currency, and dark mode.

To run the project, no installation is needed. You can simply open the project folder and double click index.html. The app will open directly in the browser.

This is a learning project, so the authentication is made using localStorage only. It is useful for understanding frontend logic, validation, localStorage, and project structure, but it should not be used as real secure login for a production finance application.

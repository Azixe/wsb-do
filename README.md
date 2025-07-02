# WSB Delivery Order Management System

Sistem manajemen pengiriman dengan login interface yang telah di-clone dari wsb-report project.

## Features

- ✅ Interface login modern dengan branding WSB untuk delivery order
- ✅ Validasi form dan penanganan error
- ✅ Animasi dan transisi interaktif
- ✅ Desain responsif untuk mobile dan desktop
- ✅ Toggle visibility password
- ✅ Fungsi remember me
- ✅ Demo credentials tersedia
- ✅ Tema hijau-orange yang cocok untuk logistik dan pengiriman

## Demo Credentials

- **Username:** admin
- **Password:** admin123

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone or navigate to this directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

4. Open your browser and go to `http://localhost:3000` (or the port specified in your server.js)

### File Structure

```
wsb-do/
├── index.html          # Login page
├── style.css           # Styles for login page
├── script.js           # JavaScript functionality
├── package.json        # Project dependencies
├── README.md           # This file
└── imgs/
    └── LOGO_WSB_blue.png   # WSB logo
```

## Usage

1. Open the `index.html` file in your browser
2. Enter the demo credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Masuk" to login
4. The system will validate credentials and redirect to delivery order dashboard

## About WSB Delivery Order

This system is designed for managing delivery orders and logistics operations. The green and orange color theme represents:
- **Green**: Successful deliveries, eco-friendly operations
- **Orange**: Urgent orders, active shipments

## Customization

### Changing Login Credentials

Edit the validation logic in `script.js`:

```javascript
// Simple validation (in real app, this would be server-side)
if (username === 'your-username' && password === 'your-password') {
    // Login successful
}
```

### Modifying Styles

The login page styles are in `style.css`. Key classes:
- `.login-page` - Main page container
- `.login-container` - Login form container
- `.login-card` - Login form card
- `.login-btn` - Login button

### Adding Features

You can extend the functionality by:
- Adding forgot password functionality
- Implementing user registration
- Adding social login options
- Connecting to a backend authentication system

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript
- Font Awesome icons
- Express.js (for server, if needed)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this code for your projects.

## Original Source

This login page was cloned from the wsb-report project and adapted for wsb-do.

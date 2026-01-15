# YegorCreative.com

> Personal portfolio and web development showcase featuring innovative web solutions and creative design.

## 🌟 Overview

YegorCreative is a professional web development portfolio showcasing cutting-edge web design, responsive layouts, and interactive features. The site demonstrates expertise in front-end development with a focus on user experience and modern design principles.

## ✨ Features

- **Responsive Design**: Mobile-first approach with seamless tablet and desktop experiences
- **Portfolio Showcase**: Featured client projects and web solutions
- **Modern UI/UX**: Clean, accessible interface with smooth animations
- **Google Certified**: Showcasing achievements and certifications
- **FastMode**: A lightweight fasting schedule/tracking experience (stored locally)

## 🛠️ Technologies

- **HTML5**: Semantic markup and accessibility
- **CSS3**: Custom styling with mobile-first responsive design
- **Vanilla JavaScript**: Interactive features without external dependencies
- **LocalStorage API**: Client-side data persistence
- **Google Fonts**: Typography (Righteous, Roboto)

## 📁 Project Structure

```
YegorCreative/
├── index.html              # Main landing page
├── contact.html            # Contact page
├── fastmode.html            # FastMode schedule + dashboard
├── fastmode.js              # FastMode logic (LocalStorage-backed)
├── CSS/
│   ├── styles.css          # Base styles and mobile-first design
│   └── responsive.css      # Breakpoint-specific enhancements
│   └── fastmode.css         # FastMode-only styles (scoped)
├── Assets/
│   ├── Elements/           # Design elements and graphics
│   └── *.png, *.svg        # Images, icons, and graphics
├── CNAME                   # Custom domain configuration
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/YegorCreative/YegorCreative.git
   ```

2. Navigate to the project directory:
   ```bash
   cd YegorCreative
   ```

3. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

4. Visit `http://localhost:8000` in your browser

FastMode is available at `http://localhost:8000/fastmode.html`.

## 📱 Responsive Breakpoints

- **Mobile**: < 498px (base styles)
- **Tablet**: 498px - 768px
- **Desktop**: 769px - 920px
- **Large Desktop**: > 920px

## 🎨 Design Philosophy

- **Mobile-First**: Optimized for small screens, progressively enhanced for larger displays
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard navigation
- **Performance**: Minimal dependencies, optimized assets, smooth animations
- **User Experience**: Clear navigation, readable typography, intuitive interactions

## 📊 Featured Sections

### Main Portfolio
- Professional overview and certifications
- Video introduction and showcase
- Client project gallery with external links
- Contact and social media integration

## 🌐 Live Demo

Visit the live site: [yegorcreative.com](https://yegorcreative.com)

## 🚢 Deployment Log

- 2026-01-15
   - FastMode: Added a premium header banner, fixed “Edit plan” modal visibility/scroll-lock/focus trap, improved “Go to Today” (select + scroll + focus), and aligned Day Detail with Body phases.

- 2025-12-28
   - Navigation: `#primaryNav` now uses `site-nav primary-nav`; full-screen overlay enabled on mobile and desktop; burger remains visible.
   - Layout: Full-bleed hero by removing boxed `body` layout; added reusable `.container` to center inner content.
   - Content: Pricing updated — Starter $499, Growth $1,200, Pro $2,500; removed testimonials note block.
   - HTML: Ensured proper closing tags at the end of `index.html`.

- 2025-12-28 (later)
   - Navigation: Neutral `.site-nav` base; overlay restricted to mobile (<=768px); desktop shows inline nav (>=769px); burger hidden on desktop; stacking order fixed.
   - CSS: Cleaned `CSS/responsive.css` nesting; added desktop nav overrides; removed desktop overlay remnants from `CSS/styles.css`.
   - Deploy: Committed and pushed to `main`; GitHub Pages will reflect changes shortly.

## 📫 Contact

- **Email**: aleqsandregor@gmail.com
- **LinkedIn**: [yegorhambaryan](https://www.linkedin.com/in/yegorhambaryan/)
- **GitHub**: [YegorCreative](https://github.com/YegorCreative)
- **Instagram**: [@yegorcreative](https://www.instagram.com/yegorcreative/)
- **YouTube**: [YegorCreative](https://www.youtube.com/yegorcreative)

## 🏆 Certifications & Achievements

- Google & Udacity Certified Front-End Web Developer
- Android Studio User by Google
- Google I/O Attendee 2020-2021
- 2021 Solution Challenge Registrant
- Google Developer Profile Beta User

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- Google Fonts for typography
- Design inspiration from modern web trends
- Client projects that showcase real-world applications

---

**Built with ❤️ by Yegor Hambaryan**

*"Business is complicated, your web solutions can be simple."* - @YegorCreative2021

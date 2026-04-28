# KPI Scorecard Generator 📊

A lightweight, high-performance web application designed to help Team Leads and Assignment Managers streamline the creation of visual performance scorecards. By processing agent data through an intuitive UI, the tool generates clean, exportable scorecard images for monthly reviews, feedback sessions, and quality assurance tracking.

Built with a fully decoupled, client-side architecture, this tool requires no backend and can be easily embedded into standard web environments, including WordPress Custom HTML blocks.

## ✨ Key Features

*   **Smart Excel Integration:** Import raw agent data via `.xlsx` files. The system automatically maps standard metrics and creates a downloadable template based on your active configuration.
*   **Dynamic Visualizations:** Integrated with Chart.js to toggle between plain text metrics and comparative Bar Charts for clear performance tracking.
*   **Role-Based Presets:** One-click Quick Setup for standard roles (e.g., CS Agent, Moderator, QA Analyst) to instantly deploy standard metrics and thresholds.
*   **Theme Toggle:** Built-in Light and Dark modes designed for maximum readability and clean exports.
*   **State Management:** Save and load your complex KPI configurations directly to the browser's LocalStorage or export them as a `.json` file for team sharing.
*   **Image Export:** Renders the final DOM elements into high-quality `.png` images using `html2canvas`, perfect for attaching to emails or internal HR systems.

## 🛠️ Tech Stack

*   **HTML5 / CSS3:** Utilizing CSS Custom Properties (variables) for seamless theming and responsive design.
*   **Vanilla JavaScript (ES6+):** Zero framework overhead for maximum speed and easy encapsulation.
*   **[Chart.js](https://www.chartjs.org/):** For rendering canvas-based comparative bar charts.
*   **[SheetJS (xlsx)](https://sheetjs.com/):** For client-side Excel file parsing and generation.
*   **[html2canvas](https://html2canvas.hertzen.com/):** For capturing the UI and exporting it as an image.
*   **FontAwesome 6:** For scalable vector iconography.

## 🚀 Getting Started

Since this is a fully client-side application, no complex installation or build steps are required.

1.  Clone the repository:
    `git clone https://github.com/yourusername/kpi-scorecard-generator.git`
2.  Open `index.html` in your preferred modern web browser.
3.  *(Optional)* If integrating into WordPress or another CMS, simply copy the contents of the HTML, CSS, and JS into a Custom HTML block.

## 💡 Usage Workflow

1.  **Headers:** Define the report timeframe (e.g., Previous vs. Current Month).
2.  **Team:** Log global team achievements using the native autocomplete suggestions.
3.  **KPIs:** Define your metrics, target goals (≥), and danger thresholds (<), or use standard Role Presets.
4.  **Agents Data:** Import your `.xlsx` file or enter data manually.
5.  **Generate:** Review the dynamically generated scorecards and click the download icon to save them as `.png` files.

## 👨‍💻 Author

**Cristian Villafañe**
*   Website: [cristianvillafane.com](https://cristianvillafane.com)

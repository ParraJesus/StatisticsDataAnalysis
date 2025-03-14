# 📊 Statistic Data Analysis

## 📝 Description

**Statistic Data Analysis** is a web-based tool designed to facilitate statistical data analysis for both one-dimensional and two-dimensional datasets.

### 🔍 One-Dimensional Data Analysis
The tool offers a variety of filtering methods and data processing features:

1. **Z-Score Filter (Full Outlier Removal):** Removes all data points with a |z-score| ≥ 3. Includes a histogram of the resulting data.
2. **Z-Score Filter (Single Extreme Outlier Removal):** Removes only the data point with the highest |z-score|. A histogram is also generated.
3. **Boxplot Filter (Full Outlier Removal):** Removes all data points identified as outliers based on the boxplot method.
4. **Boxplot Filter (Single Extreme Outlier Removal):** Removes only the most distant outlier according to the boxplot method.

Additionally, the tool provides a **Data Tabulation** feature, which accepts a dataset and the desired number of groups, generating a frequency table accordingly.

The tool also supports **Synthetic Data Generation** based on tabulated data. Users can input a dataset and the number of groups for tabulation, and the tool will create synthetic data. A comparison of mean, median, standard deviation, and percentiles between raw, tabulated, and synthetic data is provided.

### 🔧 Two-Dimensional Data Analysis
This feature is currently under development.

---

## 🚀 Usage
The application can be accessed through **GitHub Pages Deployment**.

---

## 🔨 Installation

To run the project locally:

```bash
git clone https://github.com/ParraJesus/StatisticsDataAnalysis.git
cd proyecto
npm install
npm start
```

---

## 🛠️ Technologies Used
- **Node.js v22.11.0**
- **React 19**

---

## ✨ Author
- **GitHub:** [ParraJesus](https://github.com/ParraJesus)

---

Ready to dive into statistical analysis? Let’s clean and analyze some data! 🚀


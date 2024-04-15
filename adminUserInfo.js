document.addEventListener("DOMContentLoaded", () => {
  const dataTable = document.getElementById("data-table");
  const refreshBtn = document.getElementById("refresh-btn");

  const updateData = (data) => {
    dataTable.innerHTML = "";
    data.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.email}</td>
        <td>${entry.totalData}</td>
        <td>${entry.dataToday}</td>
      `;
      dataTable.appendChild(row);
    });
  };

  const refreshData = async () => {
    try {
      const response = await fetch("http://localhost:3000/data");
      const data = await response.json();
      updateData(data);
    } catch (error) {
      console.error(error);
    }
  };

  refreshBtn.addEventListener("click", refreshData);

  // Load data initially
  refreshData();
});
const button = document.getElementById("back-btn");
button.addEventListener("click", () => {
  window.location.href = "/dashboard";
});
const button1 = document.getElementById("download-btn");
button1.addEventListener("click", () => {
  fetch("http://localhost:3000/getData")
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "DataEntryTracker.xlsx";
      a.click();
    })
    .catch((error) => {
      console.error("Error downloading data:", error);
    });
});

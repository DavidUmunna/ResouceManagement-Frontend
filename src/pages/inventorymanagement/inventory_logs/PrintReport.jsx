import { format } from "date-fns";

const PrintReport = ({filteredLogs}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Popup blocked!");
    return;
  }

  setTimeout(() => {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Logs Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status-pending { color: #FF9800; font-weight: bold; }
            .status-completed { color: #4CAF50; font-weight: bold; }
            .status-returned { color: #2196F3; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Inventory Logs Report</h1>
          <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
          <table>
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Person</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>category</th>
              </tr>
            </thead>
            <tbody>
            ${
                filteredLogs.map(log => `
                  
                <tr>
                  <td>${format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                  <td>${log.Staff_Name}</td>
                  <td>${log.inventory_item}</td>
                  <td>${log.quantity}</td>
                  <td>${log.purpose || 'N/A'}</td>
                  <td class="status-${log.status}">
                    ${log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </td>
                  <td>${log.category || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, 100); // 100ms delay is usually enough
};

export default PrintReport;

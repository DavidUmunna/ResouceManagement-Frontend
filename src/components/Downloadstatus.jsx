import React from "react";

const DownloadStatus = ({ downloadedBytes, totalBytes, label }) => {
  const percent = totalBytes > 0 ? (downloadedBytes / totalBytes) * 100 : 0;

  return (
    <div style={styles.container}>
      <span>{label}</span>
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progress,
            width: `${percent}%`,
          }}
        ></div>
      </div>
      <span>{Math.round(percent)}%</span>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#fff",
    padding: "10px 16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    borderRadius: "8px",
    zIndex: 1000,
    width: "300px",
  },
  progressBar: {
    height: "8px",
    width: "100%",
    backgroundColor: "#ccc",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "5px",
    marginBottom: "5px",
  },
  progress: {
    height: "100%",
    backgroundColor: "#4f46e5", // Tailwind's indigo-600
    transition: "width 0.2s ease",
  },
};

export default DownloadStatus;

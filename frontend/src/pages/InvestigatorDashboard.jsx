import { useEffect, useState } from "react";
import axios from "axios";
import "./InvestigatorDashboard.css";

function InvestigatorDashboard() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minerFilter, setMinerFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      axios.get("http://localhost:5000/sensor/data")
        .then((res) => {
          setData(res.data || []);
          setFilteredData(res.data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          setLoading(false);
        });
    };
    fetchData();
  }, []);

  const getStatus = (val) => {
    const v = Number(val) || 0;
    if (v < 1500) return { label: "SAFE", class: "badge-safe" };
    if (v <= 2500) return { label: "WARNING", class: "badge-warn" };
    return { label: "DANGER", class: "badge-danger" };
  };

  useEffect(() => {
    let result = data;
    if (searchTerm) {
      result = result.filter(i => String(i.miner_id).toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== "ALL") {
      result = result.filter(i => getStatus(i.mq135).label === statusFilter);
    }
    if (minerFilter !== "ALL") {
      result = result.filter(i => String(i.miner_id) === minerFilter);
    }
    setFilteredData(result);
  }, [searchTerm, statusFilter, minerFilter, data]);

  const exportToCSV = () => {
    if (filteredData.length === 0) return alert("No data to export");
    const headers = "Miner ID,Gas (PPM),Heart Rate (BPM),Temp (C),Humidity (%),Status,Time\n";
    const csvContent = filteredData.map(item =>
      `${item.miner_id},${item.mq135},${item.bpm},${item.temp},${item.humidity},${getStatus(item.mq135).label},${item.time || "N/A"}`
    ).join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Safety_Report_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const avgGas = data.length ? (data.reduce((acc, curr) => acc + (Number(curr.mq135) || 0), 0) / data.length).toFixed(1) : 0;
  const maxGas = data.length ? Math.max(...data.map(d => Number(d.mq135) || 0)) : 0;
  const uniqueMiners = [...new Set(data.map(d => String(d.miner_id)))];

  if (loading) return <div className="investigator-bg text-center py-5"><h3>SYNCHRONIZING SECURE DATABASE...</h3></div>;

  return (
    <div className="investigator-bg">
      <div className="container-fluid">

        {/* Top Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="header-title mb-0">Analysis Engine</h1>
            <p className="text-secondary fw-bold small">S&T R&D PROJECT: COAL MINE SAFETY MONITORING</p>
          </div>
          <button className="export-btn" onClick={exportToCSV}>
            📥 DOWNLOAD LOGS (CSV)
          </button>
        </div>

        {/* Stats */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="analytics-card stat-box shadow-lg">
              <span className="stat-label">Total Data Points</span>
              <span className="stat-value text-white">{data.length}</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="analytics-card stat-box shadow-lg" style={{ borderColor: '#f59e0b' }}>
              <span className="stat-label">Avg Gas Concentration</span>
              <span className="stat-value text-warning">{avgGas} <small className="fs-6">PPM</small></span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="analytics-card stat-box shadow-lg" style={{ borderColor: '#ef4444' }}>
              <span className="stat-label">Peak Danger Recorded</span>
              <span className="stat-value text-danger">{maxGas} <small className="fs-6">PPM</small></span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-section shadow-lg">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="stat-label mb-2 d-block">Search Miner ID</label>
              <input
                type="text"
                className="form-control dark-input"
                placeholder="Ex: 1, 2..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="stat-label mb-2 d-block">Severity Level</label>
              <select className="form-select dark-input" onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Recorded States</option>
                <option value="SAFE">Safe Zone</option>
                <option value="WARNING">Warning Zone</option>
                <option value="DANGER">Danger Zone</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="stat-label mb-2 d-block">Active Hardware Unit</label>
              <select className="form-select dark-input" onChange={(e) => setMinerFilter(e.target.value)}>
                <option value="ALL">All ESP32 Units</option>
                {uniqueMiners.map(m => <option key={m} value={m}>Unit #{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th className="ps-4">Hardware ID</th>
                <th>Gas (PPM)</th>
                <th>Vitals (BPM / Temp)</th>
                <th>Status</th>
                <th>Sync Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  const status = getStatus(item.mq135);
                  return (
                    <tr key={idx}>
                      <td className="ps-4 fw-bold"># {item.miner_id}</td>
                      <td className="fw-bold">{item.mq135}</td>
                      <td>
                        <span className="vital-value">{item.bpm ?? "--"}</span>
                        <span className="vital-label"> BPM</span>
                        <span className="vital-sep"> | </span>
                        <span className="vital-value">{item.temp ?? "--"}</span>
                        <span className="vital-label"> °C</span>
                      </td>
                      <td>
                        <span className={`badge ${status.class} px-3 py-2`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="text-secondary small">
                        {item.time || "N/A"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 text-center opacity-50">
          <p className="small tracking-widest text-uppercase">
            Safety First • IoT Investigation Dashboard v2.0
          </p>
        </div>

      </div>
    </div>
  );
}

export default InvestigatorDashboard;

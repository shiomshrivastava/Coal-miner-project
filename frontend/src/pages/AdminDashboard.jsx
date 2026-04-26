import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css"; 

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [refreshTime, setRefreshTime] = useState(new Date().toLocaleTimeString());
  const previousAlertsRef = useRef([]);
  const dangerAudioRef = useRef(null);
  const dangerSoundUrlRef = useRef("");
  const API_BASE_URL =
    window.location.protocol === "https:"
      ? "/api"
      : import.meta.env.VITE_API_URL;

  // --- Utility Functions (Sound, Status, etc.) ---
  const createDangerBeep = () => {
    const sampleRate = 22050;
    const durationSeconds = 0.18;
    const frequency = 880;
    const sampleCount = Math.floor(sampleRate * durationSeconds);
    const buffer = new ArrayBuffer(44 + sampleCount);
    const view = new DataView(buffer);
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, "RIFF"); view.setUint32(4, 36 + sampleCount, true);
    writeString(8, "WAVE"); writeString(12, "fmt ");
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate, true);
    view.setUint16(32, 1, true); view.setUint16(34, 8, true);
    writeString(36, "data"); view.setUint32(40, sampleCount, true);
    for (let i = 0; i < sampleCount; i++) {
      const time = i / sampleRate;
      const envelope = 1 - i / sampleCount;
      const wave = Math.sin(2 * Math.PI * frequency * time) * envelope;
      view.setUint8(44 + i, Math.max(0, Math.min(255, Math.round(128 + wave * 50))));
    }
    return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  };

  const playDangerSound = () => {
    if (!dangerAudioRef.current) {
      dangerSoundUrlRef.current = createDangerBeep();
      dangerAudioRef.current = new Audio(dangerSoundUrlRef.current);
    }
    dangerAudioRef.current.play().catch(() => {});
  };

  // Gas status updated for MQ135 values and NaN fixed (val || 0)
  const getGasStatus = (val) => {
    const v = Number(val) || 0; 
    if (v < 1500) return { label: "SAFE", color: "#10b981", class: "bg-success" };
    if (v <= 2500) return { label: "WARNING", color: "#f59e0b", class: "bg-warning text-dark" };
    return { label: "DANGER", color: "#ef4444", class: "bg-danger" };
  };

  const getBpmStatus = (bpm) => {
    const v = Number(bpm) || 0;
    if (v === 0) return "text-secondary";
    if (v < 50 || v > 110) return "text-danger fw-bold";
    return "text-success";
  };

  // --- API Handlers ---
  const fetchData = () => {
    // API Route updated to match the Blueprint in backend (/sensor/data)
    axios.get(`${API_BASE_URL}/sensor/data`).then((res) => {
      // Backend history bhejta he, hume har miner ka sirf LATEST data chahiye Admin screen par
      const historyData = res.data || [];
      const latestPerMiner = [];
      const seenIds = new Set();

      for (let item of historyData) {
        if (!seenIds.has(item.miner_id)) {
          seenIds.add(item.miner_id);
          latestPerMiner.push(item);
        }
      }
      
      setData(latestPerMiner);
      setRefreshTime(new Date().toLocaleTimeString());
    }).catch(e => console.log("Waiting for DB connection..."));
  };

  const fetchAlerts = () => {
    // Alert fetching logic (Make sure your backend has this route, or it will just return empty for now)
    axios.get(`${API_BASE_URL}/alerts`).then((res) => {
      // Property mapping updated to match new DB schema (alert_type instead of type)
      const active = (res.data || []).filter(a => 
        String(a.alert_type).toLowerCase().includes("danger") || 
        String(a.alert_type).toLowerCase().includes("critical") ||
        String(a.alert_type).toLowerCase().includes("manual")
      );
      
      if (active.length > previousAlertsRef.current.length) playDangerSound();
      previousAlertsRef.current = active;
      setAlerts(active);
    }).catch(e => console.log("Waiting for alerts API..."));
  };

  const handleResolve = async (id) => {
    try {
      // await axios.post(`${API_BASE_URL}/resolve-alert`, { id });
      setAlerts(prev => prev.filter(alert => (alert.id ?? alert.miner_id) !== id));
      alert(`Alert for Miner #${id} Resolved!`);
    } catch (e) { console.log(e); }
  };

  useEffect(() => {
    fetchData(); 
    fetchAlerts();
    const i = setInterval(() => { fetchData(); fetchAlerts(); }, 3000);
    return () => clearInterval(i);
  }, []);

  // --- Computed Stats ---
  const totalMiners = data.length;
  const dangerCount = alerts.length;
  const safeCount = Math.max(0, totalMiners - dangerCount);

  return (
    <div className="admin-bg">
      <div className="container-fluid mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">🛡️ Mining Safety Command Center</h2>
          <span className="badge bg-primary px-3 py-2">LIVE MONITORING</span>
        </div>

        {/* Top Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="stats-card">
              <span className="stats-label">Total Miners</span>
              <span className="stats-value text-blue">{totalMiners}</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-card border-warning">
              <span className="stats-label">Active Alerts</span>
              <span className="stats-value text-warning">{alerts.length}</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-card border-danger">
              <span className="stats-label">Danger Zone</span>
              <span className="stats-value text-danger">{dangerCount}</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-card border-success">
              <span className="stats-label">Miners Safe</span>
              <span className="stats-value text-success">{safeCount}</span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column: Live Sensor Data */}
          <div className="col-lg-8">
            <h4 className="mb-3 text-slate-400">Live Sensor Grid</h4>
            <div className="row g-3">
              {data.map((item, idx) => {
                // MQ135 is now used instead of gas_value
                const status = getGasStatus(item.mq135); 
                return (
                  <div key={idx} className="col-md-6 col-xl-6">
                    <div className="sensor-card" style={{ borderLeftColor: status.color, position: 'relative' }}>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold text-slate-300">ID: {item.miner_id}</span>
                        <span className={`status-badge ${status.class}`}>{status.label}</span>
                      </div>
                      
                      {/* Vitals Layout */}
                      <div className="row mt-3">
                        <div className="col-6">
                           <div className="text-secondary small">CO2/CH4</div>
                           <div className="h4 mb-0">{item.mq135 || 0} <small className="text-muted fs-6">ppm</small></div>
                        </div>
                        <div className="col-6">
                           <div className="text-secondary small">Heart Rate</div>
                           <div className={`h4 mb-0 ${getBpmStatus(item.bpm)}`}>{item.bpm || "--"} <small className="fs-6">BPM</small></div>
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-6">
                           <div className="text-secondary small">Temperature</div>
                           <div className="h5 mb-0 text-white">{item.temp || "--"} <small className="fs-6">°C</small></div>
                        </div>
                         <div className="col-6">
                           <div className="text-secondary small">Humidity</div>
                           <div className="h5 mb-0 text-white">{item.humidity || "--"} <small className="fs-6">%</small></div>
                        </div>
                      </div>

                      <div className="mt-3 text-end">
                         <small className="text-muted">Last sync: {refreshTime}</small>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {data.length === 0 && (
                  <div className="text-center p-5 text-muted border rounded" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
                      <h5 className="mb-0">Waiting for Data...</h5>
                      <small>Start the ESP32 hardware to see live grid.</small>
                  </div>
              )}
            </div>

            {/* Alert History Table */}
            <div className="stats-card mt-5 overflow-hidden">
              <h4 className="mb-4">📋 System Alert History (Recent)</h4>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Miner ID</th>
                    <th>Trigger Value</th>
                    <th>Alert Type</th>
                    <th>Source</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.slice(0, 10).map((a, i) => (
                    <tr key={i}>
                      <td>{a.miner_id}</td>
                      <td>{a.trigger_value || a.gas_value || 0}</td>
                      <td className="text-danger fw-bold">
                        {String(a.alert_type).toUpperCase()}
                      </td>
                      <td><span className="badge bg-secondary">{a.source || 'AUTO'}</span></td>
                      <td>{a.timestamp || 'N/A'}</td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                      <tr><td colSpan="5" className="text-center text-muted">No historical alerts found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Alerts Panel */}
          <div className="col-lg-4">
            <div className="alert-panel">
              <h4 className="text-danger mb-4">🚨 Critical Priority</h4>
              {alerts.length === 0 ? (
                <div className="text-center py-5 text-muted">No active threats detected</div>
              ) : (
                alerts.map((alert, index) => {
                  const isManual = String(alert.source).toLowerCase() === "manual" || String(alert.alert_type).includes("MANUAL");
                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-3 mb-3 border danger-alert-blink border-danger`}
                      style={isManual ? { border: '2px solid white', boxShadow: '0 0 15px red' } : {}}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <small className="d-block fw-bold">{isManual ? "🚨 MANUAL SOS TRIGGERED" : "🤖 SENSOR CRITICAL"}</small>
                          <h5 className="mb-1 mt-1">Miner #{alert.miner_id}</h5>
                          <p className="mb-1 small">Alert: {alert.alert_type}</p>
                          <p className="mb-2 small">Value: {alert.trigger_value}</p>
                        </div>
                        <button 
                          className="resolve-btn" 
                          onClick={() => handleResolve(alert.id || alert.miner_id)}
                        >Resolve</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="status-bar text-muted">
        <div>System: <span className="text-success">● Connected</span></div>
        <div className="d-none d-md-block">ESP32 Network: Scanning...</div>
        <div>Last Refresh: {refreshTime}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
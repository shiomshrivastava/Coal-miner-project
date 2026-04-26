import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./MinerDashboard.css";

function MinerDashboard() {
  const [currentData, setCurrentData] = useState(null);
  const [isSendingEmergency, setIsSendingEmergency] = useState(false);
  const [isHoldingEmergency, setIsHoldingEmergency] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const emergencyTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  // URL ko naye backend routing ke hisab se set kiya he
  const API_BASE_URL =
    window.location.protocol === "https:"
      ? "/api"
      : import.meta.env.VITE_API_URL;
  const minerId = 1;

  // Gas status logic (Updated for MQ135 values and NaN fixes)
  const getGasStatus = (val) => {
    const v = Number(val) || 0;
    if (v < 1500) return { label: "ENV_SAFE", color: "#10b981", class: "text-glow-success", width: "33%" };
    if (v <= 2500) return { label: "ENV_WARN", color: "#f59e0b", class: "text-glow-warning", width: "66%" };
    return { label: "ENV_CRIT", color: "#ef4444", class: "text-glow-danger", width: "100%" };
  };

  useEffect(() => {
    const fetchData = () => {
      axios.get(`${API_BASE_URL}/sensor/live-status`).then((res) => {
        if (res.status !== 204 && res.data && Object.keys(res.data).length > 0) {
          setCurrentData(res.data);
        }
      }).catch(err => console.log("Waiting for ESP32 data..."));
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Har 2 sec me refresh
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyMouseDown = () => {
    if (isSendingEmergency) return;
    setIsHoldingEmergency(true);
    let start = Date.now();
    progressIntervalRef.current = setInterval(() => {
      setHoldTime(Math.min(3, (Date.now() - start) / 1000));
    }, 50);
    emergencyTimerRef.current = setTimeout(() => sendEmergencySignal(), 3000);
  };

  const clearEmergencyHold = () => {
    if (emergencyTimerRef.current) clearTimeout(emergencyTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setIsHoldingEmergency(false);
    setHoldTime(0);
  };

  const sendEmergencySignal = () => {
    setIsSendingEmergency(true);
    // Backend ke emergency route par alert bhejo
    axios.post(`${API_BASE_URL}/emergency`, { miner_id: minerId })
      .then(() => alert("SOS ALERT SENT TO ADMINISTRATION"))
      .finally(() => { setIsSendingEmergency(false); clearEmergencyHold(); });
  };

  if (!currentData) return <div className="miner-bg"><h3 className="loading-text">CONNECTING TO SUIT...</h3></div>;

  const status = getGasStatus(currentData.mq135);

  return (
    <div className="miner-bg">
      <header className="top-nav">
        <div className="d-flex flex-column">
          <span className="text-secondary small fw-bold uppercase">Miner Unit</span>
          <span className="fw-bold text-white">ID-00{minerId}</span>
        </div>
        <div className="text-center">
          <span className={`badge border`} style={{borderColor: status.color, color: status.color}}>
              ● {status.label}
          </span>
        </div>
        <div className="text-end d-flex flex-column">
          <span className="text-secondary small fw-bold uppercase">System Status</span>
          <span className={currentData.alert === "YES" ? "text-danger fw-bold" : "text-success fw-bold"}>
            {currentData.alert === "YES" ? "⚠️ DANGER" : "● ONLINE"}
          </span>
        </div>
      </header>

      <main className="monitor-area">
        <div className="main-display-box">
            <label className="label-text">CH4 / CO2 CONCENTRATION</label>
            <h1 className={`gas-display ${status.class}`}>
              {currentData.mq135 || 0}
              <span className="ppm-tag">PPM</span>
            </h1>
            <div className="status-indicator-wrap">
              <div className="indicator-line">
                <div 
                  className="indicator-progress" 
                  style={{ width: status.width, backgroundColor: status.color }}
                ></div>
              </div>
            </div>
        </div>

        <div className="vitals-grid">
            <div className="vital-card">
                <span className="vital-label">💓 HEART RATE</span>
                <span className="vital-value text-white">{currentData.bpm || "--"} <small>BPM</small></span>
            </div>
            <div className="vital-card">
                <span className="vital-label">🌡️ TEMPERATURE</span>
                <span className="vital-value text-white">{currentData.temp || "--"}°C</span>
            </div>
            <div className="vital-card">
                <span className="vital-label">💧 HUMIDITY</span>
                <span className="vital-value text-white">{currentData.humidity || "--"}%</span>
            </div>
        </div>
      </main>

      <footer className="action-area">
        <div className="mb-3">
            <small className="text-secondary uppercase fw-bold tracking-widest">
                Last Sync: {new Date().toLocaleTimeString()}
            </small>
        </div>
        
        <button
          className={`emergency-btn-new ${isHoldingEmergency ? 'holding' : ''} ${currentData.alert === "YES" ? 'active-alarm' : ''}`}
          onMouseDown={handleEmergencyMouseDown}
          onMouseUp={clearEmergencyHold}
          onMouseLeave={clearEmergencyHold}
        >
          <div className="hold-fill" style={{ width: `${(holdTime / 3) * 100}%` }}></div>
          <span className="btn-content">
            {isSendingEmergency ? "SENDING SOS..." : isHoldingEmergency ? "KEEP HOLDING" : "HOLD 3s FOR SOS"}
          </span>
        </button>
      </footer>
    </div>
  );
}

export default MinerDashboard;
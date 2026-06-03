from pathlib import Path
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

OUT_DIR = Path(__file__).resolve().parent


def _setup(title: str, size=(16, 9)):
    fig, ax = plt.subplots(figsize=size)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    ax.text(50, 97, title, ha="center", va="center", fontsize=16, fontweight="bold")
    return fig, ax


def _box(ax, x, y, w, h, text, fc="#F7FAFC", ec="#2D3748", fontsize=9, align="left"):
    patch = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=2", linewidth=1.4, edgecolor=ec, facecolor=fc)
    ax.add_patch(patch)
    ax.text(x + (w / 2 if align == "center" else 1.2), y + h - 2.0, text, ha=align, va="top", fontsize=fontsize, family="DejaVu Sans")


def _arrow(ax, x1, y1, x2, y2, text="", color="#2D3748"):
    arr = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="->", mutation_scale=12, linewidth=1.2, color=color)
    ax.add_patch(arr)
    if text:
        ax.text((x1 + x2) / 2, (y1 + y2) / 2 + 1.0, text, fontsize=8, ha="center", va="bottom", color=color)


def generate_er_diagram():
    fig, ax = _setup("Coal Miner IoT Monitoring System - ER Diagram")

    users = """USERS\n\nPK id : SERIAL\nname : TEXT\nrole : TEXT\npassword : TEXT"""
    miners = """MINERS\n\nPK id : SERIAL\nFK user_id -> users.id\ndevice_id : TEXT UNIQUE"""
    sensor = """SENSOR_DATA\n\nPK id : SERIAL\nFK miner_id -> miners.id\nmq5 : INT\nmq9 : INT\nmq135 : INT\ntemp : FLOAT\nhumidity : FLOAT\nbpm : FLOAT\ntimestamp : TIMESTAMP"""
    alerts = """ALERTS\n\nPK id : SERIAL\nFK miner_id -> miners.id\ntrigger_value : FLOAT\nalert_type : TEXT\nsensor_type : TEXT\nsource : TEXT\nis_resolved : BOOLEAN\ntimestamp : TIMESTAMP"""

    _box(ax, 6, 56, 22, 34, users, fc="#EBF8FF")
    _box(ax, 36, 61, 24, 29, miners, fc="#E6FFFA")
    _box(ax, 67, 50, 27, 40, sensor, fc="#F0FFF4")
    _box(ax, 67, 6, 27, 40, alerts, fc="#FFF5F5")

    _arrow(ax, 28, 74, 36, 75, "1 : N")
    _arrow(ax, 60, 73, 67, 72, "1 : N")
    _arrow(ax, 60, 66, 67, 26, "1 : N")

    ax.text(50, 4, "Schema source: /database/schema.sql", ha="center", va="center", fontsize=8, color="#4A5568")
    return fig


def generate_dfd_level0():
    fig, ax = _setup("Coal Miner IoT Monitoring System - DFD Level 0 (Context)")

    _box(ax, 35, 38, 30, 24, "Coal Miner IoT Monitoring System", fc="#EDF2F7", align="center", fontsize=11)

    _box(ax, 6, 70, 20, 14, "ESP32 Device\n(Sensors + SOS)", fc="#FEFCBF", align="center")
    _box(ax, 74, 70, 20, 14, "Admin / Investigator", fc="#BEE3F8", align="center")
    _box(ax, 74, 20, 20, 14, "Miner Dashboard User", fc="#BEE3F8", align="center")
    _box(ax, 6, 20, 20, 14, "PostgreSQL Database", fc="#C6F6D5", align="center")

    _arrow(ax, 26, 77, 35, 53, "Sensor Data / Emergency")
    _arrow(ax, 35, 49, 26, 27, "Store Data + Alerts")
    _arrow(ax, 65, 54, 74, 77, "Alerts / Reports")
    _arrow(ax, 65, 48, 74, 27, "Live Status / History")

    return fig


def generate_dfd_level1():
    fig, ax = _setup("Coal Miner IoT Monitoring System - DFD Level 1")

    _box(ax, 4, 74, 20, 12, "E1 ESP32 Device", fc="#FEFCBF", align="center")
    _box(ax, 4, 46, 20, 12, "E2 Web Client\n(Admin/Miner)", fc="#BEE3F8", align="center")
    _box(ax, 4, 18, 20, 12, "E3 Investigator", fc="#BEE3F8", align="center")
    _box(ax, 78, 40, 18, 20, "D1 PostgreSQL\n(USERS, MINERS,\nSENSOR_DATA, ALERTS)", fc="#C6F6D5", align="center")

    _box(ax, 30, 74, 22, 12, "1.0 Authenticate User", fc="#EDF2F7", align="center")
    _box(ax, 30, 56, 22, 12, "2.0 Process Sensor Data", fc="#EDF2F7", align="center")
    _box(ax, 30, 38, 22, 12, "3.0 Handle Emergency", fc="#EDF2F7", align="center")
    _box(ax, 30, 20, 22, 12, "4.0 Serve Dashboard Data", fc="#EDF2F7", align="center")

    _arrow(ax, 24, 52, 30, 80, "Login request")
    _arrow(ax, 24, 80, 30, 62, "Sensor payload")
    _arrow(ax, 24, 52, 30, 44, "Emergency trigger")
    _arrow(ax, 24, 24, 30, 26, "Read analytics")

    _arrow(ax, 52, 80, 78, 53, "User lookup")
    _arrow(ax, 52, 62, 78, 53, "Insert sensor rows")
    _arrow(ax, 52, 44, 78, 53, "Insert alert rows")
    _arrow(ax, 78, 47, 52, 26, "History + live status")

    _arrow(ax, 52, 80, 24, 52, "Role + session")
    _arrow(ax, 52, 26, 24, 24, "Metrics + alerts")

    return fig


def generate_dfd_level2():
    fig, ax = _setup("Coal Miner IoT Monitoring System - DFD Level 2")

    _box(ax, 3, 76, 18, 10, "ESP32", fc="#FEFCBF", align="center")
    _box(ax, 3, 56, 18, 10, "Web Client", fc="#BEE3F8", align="center")
    _box(ax, 79, 46, 18, 18, "D1 PostgreSQL", fc="#C6F6D5", align="center")

    _box(ax, 25, 78, 23, 10, "2.1 Validate device_id", fc="#EDF2F7", align="center")
    _box(ax, 25, 66, 23, 10, "2.2 Parse readings\n(temp/hum/mq/bpm)", fc="#EDF2F7", align="center")
    _box(ax, 25, 54, 23, 10, "2.3 Check alert rules", fc="#EDF2F7", align="center")
    _box(ax, 25, 42, 23, 10, "2.4 Insert sensor_data", fc="#EDF2F7", align="center")
    _box(ax, 25, 30, 23, 10, "2.5 Insert auto-alert\n(if danger)", fc="#EDF2F7", align="center")

    _box(ax, 52, 70, 23, 10, "1.1 Verify credentials", fc="#E9D8FD", align="center")
    _box(ax, 52, 56, 23, 10, "1.2 Create session", fc="#E9D8FD", align="center")

    _box(ax, 52, 40, 23, 10, "3.1 Validate miner_id", fc="#FBD38D", align="center")
    _box(ax, 52, 26, 23, 10, "3.2 Insert manual SOS", fc="#FBD38D", align="center")

    _arrow(ax, 21, 81, 25, 83, "POST /sensor/sensor-data")
    _arrow(ax, 48, 83, 25, 71)
    _arrow(ax, 48, 71, 25, 59)
    _arrow(ax, 48, 59, 25, 47)
    _arrow(ax, 48, 47, 25, 35)

    _arrow(ax, 21, 61, 52, 75, "POST /login")
    _arrow(ax, 75, 75, 52, 61)

    _arrow(ax, 21, 61, 52, 45, "POST /emergency")
    _arrow(ax, 75, 45, 52, 31)

    _arrow(ax, 48, 47, 79, 55, "Write vitals")
    _arrow(ax, 48, 35, 79, 52, "Write auto alert")
    _arrow(ax, 75, 31, 79, 49, "Write manual alert")
    _arrow(ax, 75, 75, 79, 58, "Read users")

    return fig


def generate_architecture():
    fig, ax = _setup("Coal Miner IoT Monitoring System - System Architecture")

    _box(ax, 8, 58, 24, 24, "ESP32 Device\n• MQ5/MQ9/MQ135\n• DHT Temp/Humidity\n• BPM + SOS button", fc="#FEFCBF", align="center")
    _box(ax, 38, 58, 24, 24, "Backend\nFlask API\n• auth_routes\n• sensor_routes\n• emergency_routes\n• alert_service", fc="#E6FFFA", align="center")
    _box(ax, 68, 58, 24, 24, "Database\nPostgreSQL\nUSERS / MINERS\nSENSOR_DATA / ALERTS", fc="#C6F6D5", align="center")

    _box(ax, 23, 18, 24, 24, "Frontend\nReact + Vite\n• Login\n• Admin Dashboard\n• Miner Dashboard\n• Investigator", fc="#BEE3F8", align="center")
    _box(ax, 53, 18, 24, 24, "Users\nAdmin / Miner /\nInvestigator", fc="#FBD38D", align="center")

    _arrow(ax, 32, 70, 38, 70, "HTTP POST /sensor/*")
    _arrow(ax, 62, 70, 68, 70, "SQL read/write")
    _arrow(ax, 47, 42, 47, 58, "REST API calls")
    _arrow(ax, 47, 58, 47, 42, "JSON responses")
    _arrow(ax, 47, 30, 53, 30, "Dashboard UI + Alerts")

    return fig


def _save(fig, basename: str):
    for ext in ("png", "svg"):
        fig.savefig(OUT_DIR / f"{basename}.{ext}", dpi=300, bbox_inches="tight")
    plt.close(fig)


def main():
    _save(generate_er_diagram(), "er_diagram")
    _save(generate_dfd_level0(), "dfd_level0")
    _save(generate_dfd_level1(), "dfd_level1")
    _save(generate_dfd_level2(), "dfd_level2")
    _save(generate_architecture(), "system_architecture")
    print(f"Generated diagrams in {OUT_DIR}")


if __name__ == "__main__":
    main()

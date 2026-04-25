# alert_service.py

def check_alert(temp, bpm, mq135):
    """
    Ye function decide karta he ki data 'Safe' he ya 'Danger'.
    Return format: (alert_type, is_danger)
    """
    
    # 1. Temperature Check (Coal mines me 45°C se upar khatra he)
    if temp > 45.0:
        return "HIGH_TEMPERATURE", True
    
    # 2. Heart Rate Check (Normal 60-100 BPM hota he)
    # Agar 110 se upar jaye (Panic/Exhaustion) ya 50 se niche (Fainting)
    if bpm > 110.0 or (bpm < 50.0 and bpm > 0):
        return "ABNORMAL_BPM", True
        
    # 3. Gas Concentration Check (MQ135 for CO2/Toxic gases)
    # 2500 PPM se upar matlab saans lene me dikkat
    if mq135 > 2500:
        return "GAS_LEAKAGE", True
        
    # Agar sab kuch control me he
    return "safe", False
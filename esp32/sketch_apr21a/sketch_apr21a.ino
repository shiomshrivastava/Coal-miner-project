#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ==========================================
// 1. PIN CONFIGURATION
// ==========================================
#define MQ5       35
#define MQ9       33
#define MQ135     32
#define DHTPIN    26
#define BUZZER    25
#define DHTTYPE   DHT11

DHT dht(DHTPIN, DHTTYPE);

// ==========================================
// 2. NETWORK & SERVER SETTINGS
// ==========================================
const char* ssid     = "Airtel_S_home5G";   
const char* password = "shiom.4946";         

// ✅ UPDATED: EC2 Public IP
const char* serverUrl = "http://54.172.155.94:5000/sensor/sensor-data"; 

// --- GLOBAL VARIABLES ---
unsigned long lastSensorRead = 0;
unsigned long lastHttpSend = 0;
unsigned long buzzerTurnOffTime = 0;

float demoBPM = 75.0;
float currentTemp = 0;
float currentHum = 0;
int v5 = 0;
int v9 = 0;
int v135 = 0;
bool isDanger = false;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  digitalWrite(BUZZER, LOW); 
  
  dht.begin();
  randomSeed(analogRead(0));

  Serial.println("\n=======================================");
  Serial.println("👷 SYSTEM BOOTING: SMART SAFETY SUIT");
  Serial.println("=======================================");

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  unsigned long currentMillis = millis();

  // --- TASK 1: READ SENSORS (Every 1.2 Sec) ---
  if (currentMillis - lastSensorRead >= 1200) {
    lastSensorRead = currentMillis;

    currentHum = dht.readHumidity();
    currentTemp = dht.readTemperature();
    v5 = analogRead(MQ5);
    v9 = analogRead(MQ9);
    v135 = analogRead(MQ135);
    demoBPM = random(720, 890) / 10.0; 

    if (isnan(currentHum) || isnan(currentTemp)) {
      currentHum = 0; currentTemp = 0;
    }

    // UPDATED THRESHOLDS
    isDanger = (v5 > 2100 || v9 > 900 || v135 > 1300 || currentTemp > 42.0);
    
    if (isDanger) {
      digitalWrite(BUZZER, HIGH);
      buzzerTurnOffTime = currentMillis + 4000; 
    } else if (currentMillis > buzzerTurnOffTime) {
      digitalWrite(BUZZER, LOW);
    }

    Serial.println("\n--- [REAL-TIME MONITOR] ---");
    Serial.printf("🌡️ Temp: %.1fC | 💨 MQ5: %d | MQ9: %d | MQ135: %d\n", currentTemp, v5, v9, v135);
    if(isDanger) Serial.println("🚨 STATUS: EMERGENCY ALERT!");
    else Serial.println("✅ STATUS: SYSTEM SAFE");
  }

  // --- TASK 2: SEND DATA (Every 5 Seconds) ---
  if (currentMillis - lastHttpSend >= 5000) {
    lastHttpSend = currentMillis;
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<512> doc;
      doc["device_id"] = "1";
      doc["temp"] = currentTemp;
      doc["humidity"] = currentHum;
      doc["bpm"] = demoBPM;
      doc["mq5"] = v5;
      doc["mq9"] = v9;
      doc["mq135"] = v135;
      doc["alert"] = (isDanger) ? "YES" : "NO";

      String jsonString;
      serializeJson(doc, jsonString);
      int httpResponseCode = http.POST(jsonString);
      Serial.printf("🌐 Cloud Sync Status: %d\n", httpResponseCode);
      http.end();
    }
  }
}

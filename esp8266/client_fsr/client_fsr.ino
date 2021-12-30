#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

const char *client_name = "client_3";
const char *ssid = "posture-control";          // The SSID (name) of the Wi-Fi network you want to connect to
const char *password = "mpu6050!";             // The password of the Wi-Fi network
const char *websockets_adress = "192.168.4.1"; // ws adress
const int websockets_port = 5000;              // ws port
WebSocketsClient ws_client;

#define FSR_1 0;
#define FSR_2 1;

bool sensorsSetup;

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{

  switch (type)
  {
  case WStype_DISCONNECTED:
    Serial.printf("Disconnected!\n");
    break;
  case WStype_CONNECTED:
  {
    Serial.printf("Connected!\n");
  }
  break;
  case WStype_TEXT:
    Serial.printf("Get text: %s\n", payload);
    break;
  case WStype_BIN:
    Serial.printf("Get binary length: %u\n", length);
    hexdump(payload, length);
    break;
  }
}

void setup()
{
  Serial.begin(115200);
  Serial.println("Started! Setting up wifi...");

  setupWifi();
}

void setupWifi()
{
  WiFi.hostname("posture-control");
  WiFi.begin(ssid, password); // Connect to the network
  Serial.print("Connecting to ");
  Serial.print(ssid);
  Serial.println(" ...");
  int i = 0;
  while (WiFi.status() != WL_CONNECTED)
  { // Wait for the Wi-Fi to connect
    delay(1000);
    Serial.print(++i);
    Serial.print(' ');
  }
  Serial.println('\n');
  Serial.println("Connection established!");
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());

  Serial.println("Starting Websocket Server...");
  ws_client.begin(websockets_adress, websockets_port);
  ws_client.onEvent(webSocketEvent);
  ws_client.enableHeartbeat(15000, 3000, 2);
  ws_client.setReconnectInterval(5000);

  Serial.println("Setting up sensors...");
  setupSensors();
}

void setupSensors()
{
  Serial.begin(115200);
  while (!Serial)
    delay(10);

  sensorsSetup = true;
  Serial.println("FSR setup!");
}

void loop()
{
  ws_client.loop();
  
  DynamicJsonDocument doc(1024);

  doc["ws_client"] = client_name;
  doc["fsr_1"] = 10;
  doc["fsr_2"] = 10;
 

  String output;
  serializeJson(doc, output);
  ws_client.sendTXT(output);
  Serial.println(output);
  delay(100);
}
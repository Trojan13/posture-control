#include "Simple_MPU6050.h"
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

const char *client_name = "mpu_1";
const char *ssid = "posture-control";          // The SSID (name) of the Wi-Fi network you want to connect to
const char *password = "mpu6050!";             // The password of the Wi-Fi network
const char *websockets_adress = "192.168.4.1"; // ws adress
const int websockets_port = 5000;              // ws port
WebSocketsClient ws_client;

#define MPU6050_ADDRESS_AD0_LOW 0x68  // address pin low (GND), default for InvenSense evaluation board
#define MPU6050_ADDRESS_AD0_HIGH 0x69 // address pin high (VCC)
#define MPU6050_DEFAULT_ADDRESS MPU6050_ADDRESS_AD0_LOW
#define OFFSETS 0, 0, 0, 0, 0, 0

Simple_MPU6050 mpu;
bool sensorsSetup;

//***************************************************************************************
//******************                Print Funcitons                **********************
//***************************************************************************************

#define spamtimer(t) for (static uint32_t SpamTimer; (uint32_t)(millis() - SpamTimer) >= (t); SpamTimer = millis()) // (BLACK BOX) Ya, don't complain that I used "for(;;){}" instead of "if(){}" for my Blink Without Delay Timer macro. It works nicely!!!

/* printfloatx() is a helper Macro used with the Serial class to simplify my code and provide enhanced viewing of Float and interger values:
   usage: printfloatx(Name,Variable,Spaces,Precision,EndTxt);
   Name and EndTxt are just char arrays
   Variable is any numerical value byte, int, long and float
   Spaces is the number of spaces the floating point number could possibly take up including +- and decimal point.
   Percision is the number of digits after the decimal point set to zero for intergers
*/
#define printfloatx(Name, Variable, Spaces, Precision, EndTxt)    \
  print(Name);                                                    \
  {                                                               \
    char S[(Spaces + Precision + 3)];                             \
    Serial.print(F(" "));                                         \
    Serial.print(dtostrf((float)Variable, Spaces, Precision, S)); \
  }                                                               \
  Serial.print(EndTxt); //Name,Variable,Spaces,Precision,EndTxt

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
    playNotification();
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
  ws_client.begin(websockets_adress, websockets_port, strcat("/ws?client=", client_name));
  ws_client.onEvent(webSocketEvent);
  ws_client.enableHeartbeat(15000, 3000, 2);
  ws_client.setReconnectInterval(5000);

  Serial.println("Setting up sensors...");
  setupSensors();
}

void sendJSON(int16_t accelX, int16_t accelY, int16_t accelZ, char mpu)
{
  DynamicJsonDocument doc(1024);

  doc["type"] = "sensor-data";
  doc["client"] = client_name;
  doc["data"][mpu]["accel"]["x"] = accelX;
  doc["data"][mpu]["accel"]["y"] = accelY;
  doc["data"][mpu]["accel"]["z"] = accelZ;

  String output;
  serializeJson(doc, output);
  ws_client.sendTXT(output);
  Serial.println(output);
}

void send_values_mpu_1(int16_t *gyro, int16_t *accel, int32_t *quat, uint32_t *timestamp)
{
  uint16_t SpamDelay = 100;
  Quaternion q;
  VectorFloat gravity;
  VectorInt16 aa, aaReal, aaWorld;
  mpu_1.GetQuaternion(&q, quat);
  mpu_1.GetGravity(&gravity, &q);
  mpu_1.SetAccel(&aa, accel);
  mpu_1.GetLinearAccel(&aaReal, &aa, &gravity);
  mpu_1.GetLinearAccelInWorld(&aaWorld, &aaReal, &q);
  sendJSON(aaWorld.x, aaWorld.y, aaWorld.z, 'MPU_2');
}

void setupSensors()
{
  uint8_t val;
  // initialize serial communication
  while (!Serial)
    ;   // wait for Leonardo enumeration, others continue immediately
        //  Wire.begin();
  // Lets test for connection on any address
  mpu.SetAddress(MPU6050_ADDRESS_AD0_LOW).TestConnection(1);
  mpu.load_DMP_Image(OFFSETS); // Does it all for you
  Serial.print(F("Setup Complete in "));
  Serial.print(millis());
  Serial.println(F(" Miliseconds"));
  Serial.println(F("If this is your first time running this program with this specific MPU6050,\n"
                   " Start by having the MPU6050 placed  stationary on a flat surface to get a proper accellerometer calibration\n"
                   " Lets get started here are the Starting and Ending Offsets\n"
                   " Place the new offsets on the #define OFFSETS... line above for quick startup"));

  mpu.PrintActiveOffsets();
  mpu.CalibrateGyro(8);
  mpu.CalibrateAccel(8);
  mpu.PrintActiveOffsets();
  mpu.on_FIFO(send_values_mpu_1);

  Serial.print(F("full calibration Complete in "));
  Serial.print(millis());
  Serial.println(F(" Miliseconds"));

  sensorsSetup = true;
  Serial.println("Sensors setup!");
}

void loop()
{
  ws_client.loop();
  mpu_1.dmp_read_fifo();
}

void playNotification()
{
  tone(14, 300, 50);
  delay(100);
  tone(14, 400, 50);
  delay(100);
  tone(14, 800, 150);
  delay(100);
  tone(14, 1000, 350);
  delay(100);
}

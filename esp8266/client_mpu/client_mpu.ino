#include <Adafruit_MPU6050.h>
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

const char *client_name = "mpu_2";
const char *ssid = "posture-control";          // The SSID (name) of the Wi-Fi network you want to connect to
const char *password = "mpu6050!";             // The password of the Wi-Fi network
const char *websockets_adress = "192.168.4.1"; // ws adress
const int websockets_port = 5000;              // ws port
WebSocketsClient ws_client;

#define MPU6050_1 0x68
#define MPU6050_2 0x69

float mpu_1_acc_err_x = -1.17;
float mpu_1_acc_err_y = -3.32;
float mpu_1_gyro_err_x = -0.45;
float mpu_1_gyro_err_y = -0.20;
float mpu_1_gyro_err_z = 0.00;

float mpu_2_acc_err_x = -0.89;
float mpu_2_acc_err_y = -1.67;
float mpu_2_gyro_err_x = 1.74;
float mpu_2_gyro_err_y = 1.70;
float mpu_2_gyro_err_z = 0.00;

float elapsedTime = 0, currentTime = 0, previousTime = 0;
float acc_1_angle_x = 0, acc_1_angle_y = 0, gyro_1_angle_x = 0, gyro_1_angle_y = 0, gyro_1_angle_z = 0;
float acc_2_angle_x = 0, acc_2_angle_y = 0, gyro_2_angle_x = 0, gyro_2_angle_y = 0, gyro_2_angle_z = 0;
float roll_1 = 0, pitch_1 = 0, yaw_1 = 0;
float roll_2 = 0, pitch_2 = 0, yaw_2 = 0;

Adafruit_MPU6050 mpu_1, mpu_2;
Adafruit_Sensor *mpu_gyro_1, *mpu_gyro_2, *mpu_accel_1, *mpu_accel_2;
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
  ws_client.begin(websockets_adress, websockets_port, strcat("/ws?client=", client_name));
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

  Serial.println("Adafruit MPU6050 test!");

  if (!mpu_1.begin(MPU6050_1))
  {
    Serial.println("Failed to find MPU 1 chip");
    while (1)
    {
      delay(10);
    }
  }
  Serial.println("Found MPU 1 chip");

  if (!mpu_2.begin(MPU6050_2))
  {
    Serial.println("Failed to find MPU 2 chip");
    while (1)
    {
      delay(10);
    }
  }
  Serial.println("Found MPU 2 chip");

  mpu_1.setAccelerometerRange(MPU6050_RANGE_2_G);
  mpu_2.setAccelerometerRange(MPU6050_RANGE_2_G);

  mpu_1.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu_2.setGyroRange(MPU6050_RANGE_250_DEG);

  mpu_1.setFilterBandwidth(MPU6050_BAND_44_HZ);
  mpu_2.setFilterBandwidth(MPU6050_BAND_44_HZ);

  mpu_gyro_1 = mpu_1.getGyroSensor();
  mpu_gyro_1->printSensorDetails();

  mpu_accel_1 = mpu_1.getAccelerometerSensor();
  mpu_accel_1->printSensorDetails();

  mpu_gyro_2 = mpu_2.getGyroSensor();
  mpu_gyro_2->printSensorDetails();

  mpu_accel_2 = mpu_2.getAccelerometerSensor();
  mpu_accel_2->printSensorDetails();

  sensorsSetup = true;
  Serial.println("Sensors setup!");
}

void loop()
{
  ws_client.loop();
  sensors_event_t gyro_1;
  sensors_event_t gyro_2;
  sensors_event_t accel_1;
  sensors_event_t accel_2;

  mpu_gyro_1->getEvent(&gyro_1);
  mpu_gyro_2->getEvent(&gyro_2);

  mpu_accel_1->getEvent(&accel_1);
  mpu_accel_2->getEvent(&accel_2);

  acc_1_angle_x = (atan(accel_1.acceleration.y / sqrt(pow(accel_1.acceleration.x, 2) + pow(accel_1.acceleration.z, 2))) * 180 / PI) - mpu_1_acc_err_x;
  acc_1_angle_y = (atan(-1 * accel_1.acceleration.x / sqrt(pow(accel_1.acceleration.y, 2) + pow(accel_1.acceleration.z, 2))) * 180 / PI) - mpu_1_acc_err_y;
  acc_2_angle_x = (atan(accel_2.acceleration.y / sqrt(pow(accel_2.acceleration.x, 2) + pow(accel_2.acceleration.z, 2))) * 180 / PI) - mpu_2_acc_err_x;
  acc_2_angle_y = (atan(-1 * accel_2.acceleration.x / sqrt(pow(accel_2.acceleration.y, 2) + pow(accel_2.acceleration.z, 2))) * 180 / PI) - mpu_2_acc_err_y;

  previousTime = currentTime;                        // Previous time is stored before the actual time read
  currentTime = millis();                            // Current time actual time read
  elapsedTime = (currentTime - previousTime) / 1000; // Divide by 1000 to get seconds

  gyro_1_angle_x = gyro_1_angle_x + (gyro_1.gyro.x - mpu_1_gyro_err_x) * elapsedTime; // deg/s * s = deg
  gyro_1_angle_y = gyro_1_angle_y + (gyro_1.gyro.y - mpu_1_gyro_err_y) * elapsedTime;
  yaw_1 = yaw_1 + (gyro_1.gyro.z - mpu_1_gyro_err_z) * elapsedTime;
  roll_1 = 0.96 * gyro_1_angle_x + 0.04 * acc_1_angle_x;
  pitch_1 = 0.96 * gyro_1_angle_y + 0.04 * acc_1_angle_y;

  gyro_2_angle_x = gyro_2_angle_x + (gyro_2.gyro.x - mpu_2_gyro_err_x) * elapsedTime; // deg/s * s = deg
  gyro_2_angle_y = gyro_2_angle_y + (gyro_2.gyro.y - mpu_2_gyro_err_y) * elapsedTime;
  yaw_2 = yaw_2 + (gyro_2.gyro.z - mpu_2_gyro_err_z) * elapsedTime;
  roll_2 = 0.96 * gyro_2_angle_x + 0.04 * acc_2_angle_x;
  pitch_2 = 0.96 * gyro_2_angle_y + 0.04 * acc_2_angle_y;

  DynamicJsonDocument doc(1024);

  doc["type"] = "sensor-data";
  doc["client"] = client_name;
  doc["data"]["mpu_1"]["gyro"]["x"] = gyro_1.gyro.x;
  doc["data"]["mpu_1"]["gyro"]["y"] = gyro_1.gyro.y;
  doc["data"]["mpu_1"]["gyro"]["z"] = gyro_1.gyro.z;
  doc["data"]["mpu_1"]["accel"]["x"] = accel_1.acceleration.x;
  doc["data"]["mpu_1"]["accel"]["y"] = accel_1.acceleration.y;
  doc["data"]["mpu_1"]["accel"]["z"] = accel_1.acceleration.z;
  doc["data"]["mpu_1"]["accel_2"]["x"] = (atan(accel_1.acceleration.y / sqrt(pow(accel_1.acceleration.x, 2) + pow(accel_1.acceleration.z, 2))) * 180 / PI);
  doc["data"]["mpu_1"]["accel_2"]["y"] = (atan(-1 * accel_1.acceleration.x / sqrt(pow(accel_1.acceleration.y, 2) + pow(accel_1.acceleration.z, 2))) * 180 / PI);
  doc["data"]["mpu_1"]["roll"] = roll_1;
  doc["data"]["mpu_1"]["pitch"] = pitch_1;
  doc["data"]["mpu_1"]["yaw"] = yaw_1;

  doc["data"]["mpu_2"]["gyro"]["x"] = gyro_2.gyro.x;
  doc["data"]["mpu_2"]["gyro"]["y"] = gyro_2.gyro.y;
  doc["data"]["mpu_2"]["gyro"]["z"] = gyro_2.gyro.z;
  doc["data"]["mpu_2"]["accel"]["x"] = accel_2.acceleration.x;
  doc["data"]["mpu_2"]["accel"]["y"] = accel_2.acceleration.y;
  doc["data"]["mpu_2"]["accel"]["z"] = accel_2.acceleration.z;
  doc["data"]["mpu_2"]["accel_2"]["x"] = (atan(accel_2.acceleration.y / sqrt(pow(accel_2.acceleration.x, 2) + pow(accel_2.acceleration.z, 2))) * 180 / PI);
  doc["data"]["mpu_2"]["accel_2"]["y"] = (atan(-1 * accel_2.acceleration.x / sqrt(pow(accel_2.acceleration.y, 2) + pow(accel_2.acceleration.z, 2))) * 180 / PI);
  doc["data"]["mpu_2"]["roll"] = roll_2;
  doc["data"]["mpu_2"]["pitch"] = pitch_2;
  doc["data"]["mpu_2"]["yaw"] = yaw_2;

  String output;
  serializeJson(doc, output);
  ws_client.sendTXT(output);
  Serial.println(output);
  delay(100);
}

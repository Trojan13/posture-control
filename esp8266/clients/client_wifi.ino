#include <Adafruit_MPU6050.h>
#include <ESP8266WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>

using namespace websockets;
const char *client_name = "client_1";
const char *ssid = "posture-control";             // The SSID (name) of the Wi-Fi network you want to connect to
const char *password = "mpu6050!";                 // The password of the Wi-Fi network
const char *websockets_server = "localhost:8085"; //server adress and port
WebsocketsClient client;

#define MPU6050_1 0x68
#define MPU6050_2 0x69

Adafruit_MPU6050 mpu_1, mpu_2;
Adafruit_Sensor *mpu_gyro_1, *mpu_gyro_2, *mpu_accel_1, *mpu_accel_2;
bool sensorsSetup;

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
  client.connect(websockets_server);
  client.ping();
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
  if (sensorsSetup)
  {
    sensors_event_t gyro_1;
    sensors_event_t gyro_2;
    sensors_event_t accel_1;
    sensors_event_t accel_2;

    mpu_gyro_1->getEvent(&gyro_1);
    mpu_gyro_2->getEvent(&gyro_2);

    mpu_accel_1->getEvent(&accel_1);
    mpu_accel_2->getEvent(&accel_2);

    Serial.print(gyro_1.gyro.y);
    Serial.print(",");
    Serial.print(gyro_2.gyro.y);
    Serial.println();

    client.poll();

    DynamicJsonDocument doc(1024);

    doc["client"] = client_name;
    doc["mpu_1"]["gyro"]["x"] = gyro_1.gyro.x;
    doc["mpu_1"]["gyro"]["y"] = gyro_1.gyro.y;
    doc["mpu_1"]["gyro"]["z"] = gyro_1.gyro.z;
    doc["mpu_1"]["accel"]["x"] = accel_1.acceleration.x;
    doc["mpu_1"]["accel"]["y"] = accel_1.acceleration.y;
    doc["mpu_1"]["accel"]["z"] = accel_1.acceleration.z;

    doc["mpu_2"]["gyro"]["x"] = gyro_2.gyro.x;
    doc["mpu_2"]["gyro"]["y"] = gyro_2.gyro.y;
    doc["mpu_2"]["gyro"]["z"] = gyro_2.gyro.z;
    doc["mpu_2"]["accel"]["x"] = accel_2.acceleration.x;
    doc["mpu_2"]["accel"]["y"] = accel_2.acceleration.y;
    doc["mpu_2"]["accel"]["z"] = accel_2.acceleration.z;

    client.send(serializeJson(doc, Serial));
  }
  delay(1000);
}
}
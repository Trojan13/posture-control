#include <Adafruit_MPU6050.h>

#define   MPU6050_1   0x68
#define   MPU6050_2   0x69

Adafruit_MPU6050 mpu_1,mpu_2;
Adafruit_Sensor *mpu_gyro_1,*mpu_gyro_2;

void setup(void) {
  Serial.begin(115200);
  while (!Serial)
    delay(10);

  Serial.println("Adafruit MPU6050 test!");

  if (!mpu_1.begin(MPU6050_1)) {
    Serial.println("Failed to find MPU 1 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("Found MPU 1 chip");

  
  if (!mpu_2.begin(MPU6050_2)) {
    Serial.println("Failed to find MPU 2 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("Found MPU 2 chip");
  
  
  mpu_gyro_1 = mpu_1.getAccelerometerSensor();
  mpu_gyro_1->printSensorDetails();
    
  mpu_gyro_2 = mpu_2.getAccelerometerSensor();
  mpu_gyro_2->printSensorDetails();
}

void loop() {
  sensors_event_t gyro_1;
  sensors_event_t gyro_2;
  
  mpu_gyro_1->getEvent(&gyro_1);
  mpu_gyro_2->getEvent(&gyro_2);
  
  Serial.print(gyro_1.gyro.y);
  Serial.print(",");
  Serial.print(gyro_2.gyro.y);
  Serial.println();

  delay(100);
}
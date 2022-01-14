/*
   Arduino and MPU6050 Accelerometer and Gyroscope Sensor Error Test
   by Dejan, https://howtomechatronics.com

   Edited to work with two MPU6050 connected by Trojan
*/

#include <Wire.h>

const int MPU_1 = 0x68; // 1. MPU6050 I2C address
const int MPU_2 = 0x69; // 2. (AD0 High) MPU6050 I2C address

void setup()
{
  Serial.begin(115200);

  Serial.println("Starting Errortest for MPU_1: ");
  Serial.println("");
  calculate_IMU_error(MPU_1);
  delay(2000);
  Serial.println("Starting Errortest for MPU_2: ");
  Serial.println("");
  calculate_IMU_error(MPU_2);
}

void loop()
{
}

void calculate_IMU_error(int MPU)
{
  // Initialize variables
  float AccX, AccY, AccZ;
  float GyroX, GyroY, GyroZ;
  float AccErrorX = 0, AccErrorY = 0, GyroErrorX = 0, GyroErrorY = 0, GyroErrorZ = 0;
  int c = 0;
  int testTimes = 800;
  // Setup wire for the current mpu
  Wire.begin();                // Initialize comunication
  Wire.beginTransmission(MPU); // Start communication with MPU6050 // MPU=0x68
  Wire.write(0x6B);            // Talk to the register 6B
  Wire.write(0x00);            // Make reset - place a 0 into the 6B register
  Wire.endTransmission(true);  //end the transmission
  delay(20);
  // Call this function if you need to get the IMU error values for your module
  // We can call this funtion in the setup section to calculate the accelerometer and gyro data error. From here we will get the error values used in the above equations printed on the Serial Monitor.
  // Note that we should place the IMU flat in order to get the proper values, so that we then can the correct values
  // Read accelerometer values 200 times
  while (c < testTimes)
  {
    Wire.beginTransmission(MPU);
    Wire.write(0x3B);
    Wire.endTransmission(false);
    Wire.requestFrom(MPU, 6, true);
    AccX = (Wire.read() << 8 | Wire.read()) / 16384.0;
    AccY = (Wire.read() << 8 | Wire.read()) / 16384.0;
    AccZ = (Wire.read() << 8 | Wire.read()) / 16384.0;
    // Sum all readings
    AccErrorX = AccErrorX + ((atan((AccY) / sqrt(pow((AccX), 2) + pow((AccZ), 2))) * 180 / PI));
    AccErrorY = AccErrorY + ((atan(-1 * (AccX) / sqrt(pow((AccY), 2) + pow((AccZ), 2))) * 180 / PI));
    c++;
  }
  //Divide the sum by testTimes to get the error value
  AccErrorX = AccErrorX / testTimes;
  AccErrorY = AccErrorY / testTimes;
  c = 0;
  // Read gyro values testTimes times
  while (c < testTimes)
  {
    Wire.beginTransmission(MPU);
    Wire.write(0x43);
    Wire.endTransmission(false);
    Wire.requestFrom(MPU, 6, true);
    GyroX = Wire.read() << 8 | Wire.read();
    GyroY = Wire.read() << 8 | Wire.read();
    GyroZ = Wire.read() << 8 | Wire.read();
    // Sum all readings
    GyroErrorX = GyroErrorX + (GyroX / 131.0);
    GyroErrorY = GyroErrorY + (GyroY / 131.0);
    GyroErrorZ = GyroErrorZ + (GyroZ / 131.0);
    c++;
  }
  //Divide the sum by testTimes to get the error value
  GyroErrorX = GyroErrorX / testTimes;
  GyroErrorY = GyroErrorY / testTimes;
  GyroErrorZ = GyroErrorZ / testTimes;
  // Print the error values on the Serial Monitor
  Serial.print("@@@@@@@@@@@ Error Values from: ");
  Serial.print(MPU);
  Serial.print(" @@@@@@@@@@@");
  Serial.println("");
  Serial.print("AccErrorX: ");
  Serial.println(AccErrorX);
  Serial.print("AccErrorY: ");
  Serial.println(AccErrorY);
  Serial.print("GyroErrorX: ");
  Serial.println(GyroErrorX);
  Serial.print("GyroErrorY: ");
  Serial.println(GyroErrorY);
  Serial.print("GyroErrorZ: ");
  Serial.println(GyroErrorZ);
}

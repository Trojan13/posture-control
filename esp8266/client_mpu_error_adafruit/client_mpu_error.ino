

#include <Adafruit_MPU6050.h>

#define MPU6050_1 0x68
#define MPU6050_2 0x69

Adafruit_MPU6050 mpu_1, mpu_2;
Adafruit_Sensor *mpu_gyro_1, *mpu_gyro_2, *mpu_accel_1, *mpu_accel_2;

void setup()
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

  Serial.println("Sensors setup!");
  delay(20);
  Serial.println("Starting tests...");
  calculate_IMU_error();
}

void loop()
{
}

void calculate_IMU_error()
{
  float acc_1_angle_x, acc_1_angle_y, acc_2_angle_x, acc_2_angle_y;
  float acc_1_angle_x_err, acc_1_angle_y_err, acc_2_angle_x_err, acc_2_angle_y_err;

  float gyro_1_angle_x, gyro_1_angle_y, gyro_1_angle_z, gyro_2_angle_x, gyro_2_angle_y, gyro_2_angle_z;
  float gyro_1_angle_x_err, gyro_1_angle_y_err, gyro_1_angle_z_err, gyro_2_angle_x_err, gyro_2_angle_y_err, gyro_2_angle_z_err;

  float elapsedTime, currentTime, previousTime;

  int c = 0;
  int testTimes = 800;
  // Setup wire for the current mpu

  // Call this function if you need to get the IMU error values for your module
  // We can call this funtion in the setup section to calculate the accelerometer and gyro data error. From here we will get the error values used in the above equations printed on the Serial Monitor.
  // Note that we should place the IMU flat in order to get the proper values, so that we then can the correct values
  // Read accelerometer values 200 times
  while (c < testTimes)
  {

    sensors_event_t gyro_1;
    sensors_event_t gyro_2;
    sensors_event_t accel_1;
    sensors_event_t accel_2;

    mpu_gyro_1->getEvent(&gyro_1);
    mpu_gyro_2->getEvent(&gyro_2);

    mpu_accel_1->getEvent(&accel_1);
    mpu_accel_2->getEvent(&accel_2);

    acc_1_angle_x = (atan(accel_1.acceleration.y / sqrt(pow(accel_1.acceleration.x, 2) + pow(accel_1.acceleration.z, 2))) * 180 / PI);
    acc_1_angle_y = (atan(-1 * accel_1.acceleration.x / sqrt(pow(accel_1.acceleration.y, 2) + pow(accel_1.acceleration.z, 2))) * 180 / PI);

    acc_1_angle_x_err = acc_1_angle_x_err + acc_1_angle_x;
    acc_1_angle_y_err = acc_1_angle_y_err + acc_1_angle_y;

    acc_2_angle_x = (atan(accel_2.acceleration.y / sqrt(pow(accel_2.acceleration.x, 2) + pow(accel_2.acceleration.z, 2))) * 180 / PI);
    acc_2_angle_y = (atan(-1 * accel_2.acceleration.x / sqrt(pow(accel_2.acceleration.y, 2) + pow(accel_2.acceleration.z, 2))) * 180 / PI);

    acc_2_angle_x_err = acc_2_angle_x_err + acc_2_angle_x;
    acc_2_angle_y_err = acc_2_angle_y_err + acc_2_angle_y;

    previousTime = currentTime;                        // Previous time is stored before the actual time read
    currentTime = millis();                            // Current time actual time read
    elapsedTime = (currentTime - previousTime) / 1000; // Divide by 1000 to get seconds

    gyro_1_angle_x = gyro_1_angle_x + gyro_1.gyro.x * elapsedTime; // deg/s * s = deg
    gyro_1_angle_y = gyro_1_angle_y + gyro_1.gyro.y * elapsedTime;
    gyro_1_angle_z = gyro_1_angle_y + gyro_1.gyro.z * elapsedTime;

    gyro_1_angle_x_err = gyro_1_angle_x_err + gyro_1_angle_x;
    gyro_1_angle_y_err = gyro_1_angle_y_err + gyro_1_angle_y;

    gyro_2_angle_x = gyro_2_angle_x + gyro_2.gyro.x * elapsedTime; // deg/s * s = deg
    gyro_2_angle_y = gyro_2_angle_y + gyro_2.gyro.y * elapsedTime;
    gyro_2_angle_z = gyro_2_angle_y + gyro_2.gyro.z * elapsedTime;

    gyro_2_angle_x_err = gyro_2_angle_x_err + gyro_2_angle_x;
    gyro_2_angle_y_err = gyro_2_angle_y_err + gyro_2_angle_y;

    c++;
  }
  //Divide the sum by testTimes to get the error value
  acc_1_angle_x_err = acc_1_angle_x_err / testTimes;
  acc_1_angle_y_err = acc_1_angle_y_err / testTimes;

  gyro_1_angle_x_err = gyro_1_angle_x_err / testTimes;
  gyro_1_angle_y_err = gyro_1_angle_y_err / testTimes;
  gyro_1_angle_z_err = gyro_1_angle_z_err / testTimes;

  acc_2_angle_x_err = acc_2_angle_x_err / testTimes;
  acc_2_angle_y_err = acc_2_angle_y_err / testTimes;

  gyro_2_angle_x_err = gyro_2_angle_x_err / testTimes;
  gyro_2_angle_y_err = gyro_2_angle_y_err / testTimes;
  gyro_2_angle_z_err = gyro_2_angle_z_err / testTimes;

  c = 0;

  // Print the error values on the Serial Monitor
  Serial.print("@@@@@@@@@@@ Error Values from: MPU 0x68 @@@@@@@@@@@");
  Serial.println("");
  Serial.print("acc_1_angle_x_err: ");
  Serial.println(acc_1_angle_x_err);
  Serial.print("acc_1_angle_y_err: ");
  Serial.println(acc_1_angle_y_err);
  Serial.print("gyro_1_angle_x_err: ");
  Serial.println(gyro_1_angle_x_err);
  Serial.print("gyro_1_angle_y_err: ");
  Serial.println(gyro_1_angle_y_err);
  Serial.print("gyro_1_angle_z_err: ");
  Serial.println(gyro_1_angle_z_err);
  Serial.print("@@@@@@@@@@@ Error Values from: MPU 0x68 @@@@@@@@@@@");
  Serial.println("");
  Serial.print("acc_2_angle_x_err: ");
  Serial.println(acc_2_angle_x_err);
  Serial.print("acc_2_angle_y_err: ");
  Serial.println(acc_2_angle_y_err);
  Serial.print("gyro_2_angle_x_err: ");
  Serial.println(gyro_2_angle_x_err);
  Serial.print("gyro_2_angle_y_err: ");
  Serial.println(gyro_2_angle_y_err);
  Serial.print("gyro_2_angle_z_err: ");
  Serial.println(gyro_2_angle_z_err);
}

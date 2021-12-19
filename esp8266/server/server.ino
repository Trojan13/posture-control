#include <WebSocketsServer.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char *wifi_password = "mpu6050!";
const char *wifi_ssid = "posture-control";
const int wifi_channel = 1;
const boolean wifi_hidden = false;

const int port_webserver = 80;
const int port_websocket = 81;

IPAddress local_IP(192, 168, 4, 1);
IPAddress gateway(192, 168, 4, 1);
IPAddress subnet(255, 255, 255, 0);

static const char PROGMEM INDEX_HTML[] = R"rawliteral(
<html>
  <head>
    <script>
    </script>
  </head>
  <body>
    <h1>Webserver Works!</h1>
  </body>
</html>
)rawliteral";

WebSocketsServer webSocket = WebSocketsServer(port_websocket);

ESP8266WebServer server(port_webserver);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length)
{
    switch (type)
    {

    case WStype_DISCONNECTED:
        Serial.println("Client disconnnected!" + num);
        break;

    case WStype_CONNECTED:
    {
        Serial.println("Client connnected!");
    }
    break;

    case WStype_TEXT:
        Serial.println((const char *)payload);
        break;

    case WStype_BIN:
        Serial.printf("[%u] get binary length: %u\n", num, length);
        hexdump(payload, length);
        break;
    }
}

void handleNotFound()
{
    server.send(404, "text/plain", "404: Not found"); // Send HTTP status 404 (Not Found) when there's no handler for the URI in the request
}

void handleRoot()
{
    server.sendHeader("Content-Security-Policy", "script-src;");
    server.send(200, "text/html", INDEX_HTML);
}

void setup()
{

    Serial.begin(115200);
    Serial.flush();
    Serial.println();
    WiFi.mode(WIFI_AP);
    Serial.print("Setting soft-AP configuration ... ");
    Serial.println(WiFi.softAPConfig(local_IP, gateway, subnet) ? "Ready" : "Failed!");

    Serial.print("Setting soft-AP ... ");
    Serial.println(WiFi.softAP(wifi_ssid, wifi_password, wifi_channel, wifi_hidden, 4) ? "Ready" : "Failed!");

    Serial.print("Soft-AP IP address = ");
    Serial.println(WiFi.softAPIP());

    delay(100);

    webSocket.begin();
    webSocket.onEvent(webSocketEvent);

    server.on("/", handleRoot);        // Call the 'handleRoot' function when a client requests URI "/"
    server.onNotFound(handleNotFound); // When a client requests an unknown URI (i.e. something other than "/"), call function "handleNotFound"

    server.begin();
}

void loop()
{
    server.handleClient();
    webSocket.loop();
}

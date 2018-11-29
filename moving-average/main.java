// mvn archetype:generate -DgroupId=com.mycompany.app -DartifactId=moving-average
import org.eclipse.iofog.api.listener.IOFogAPIListener;
import org.eclipse.iofog.api.IOFogClient;
import org.eclipse.iofog.elements.IOMessage;
import javax.json.*;

public class IOFogAPIListenerImpl implements IOFogAPIListener {
    @Override
    public void onMessages(List<IOMessage> list) {
        list.forEach(message -> mainLogInstance.buildAndSendMessage(message));
    }

    @Override
    public void onMessagesQuery(long l, long l1, List<IOMessage> list) {
        /* do nothing */
    }

    @Override
    public void onError(Throwable throwable) {
        System.err.println("Error:" + throwable);
    }

    @Override
    public void onBadRequest(String s) {
        System.err.println("Bad Request: " + s);
    }

    @Override
    public void onMessageReceipt(String s, long l) {
        /* do nothing */
    }

    @Override
    public void onNewConfig(JsonObject jsonObject) {
        mainLogInstance.setConfig(jsonObject);
    }

    @Override
    public void onNewConfigSignal() {
        mainLogInstance.updateConfig();
    }
}

public class App {
    private static IOFogClient ioFogClient;
    private static IOFogAPIListenerImpl listener;
    private static JsonObject config = null;

    public static void main(String[] args) {
        App app = new App();
        ioFogClient = new IOFogClient("iofog", 54321, "TEST_CONTAINER_ID");
        listener = new IOFogAPIListenerImpl(app);
        //ioFogClient.openControlWebSocket(listener);
    }

    public static void updateConfig() {
        config = null;
        try {
            while (config == null) {
                ioFogClient.fetchContainerConfig(listener);
                synchronized (fetchConfigLock) {
                    fetchConfigLock.wait(1000);
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching config: " + e.getMessage());
        }
    }

    public void setConfig(JsonObject configObject) {
        config = configObject;
        synchronized (fetchConfigLock) {
            fetchConfigLock.notifyAll();
        }
    }
}


/*

const iofog = require('@iofog/nodejs-sdk');

// Used as our in-memory cache of our configuration
// that will be provided by the Controller
let config = null;

function updateConfig() {
  iofog.getConfig({
    onNewConfig: newConfig => {
      config = newConfig;
    },
    onBadRequest: err => console.error('updateConfig failed: ', err),
    onError: err => console.error('updateConfig failed: ', err)
  });
}

const sum = values => values.reduce((a, b) => a + b, 0);
const average = values => sum(values) / (values.length || 1);

function getMovingAverage(arr, newValue) {
  // Evict the oldest values once we've reached our max window size.
  // Notice this is using the value from our config!
  while (arr.length >= config.maxWindowSize) { // <------- config
    arr.shift();
  }
  arr.push(newValue);

  return average(arr);
}

// This is basically our "entry point", provided to iofog.init() below
function main() {
  updateConfig();

  iofog.wsControlConnection({
    onNewConfigSignal: () => updateConfig(),
    onError: err => console.error('Error with Control Connection: ', err)
  });

  const onMessageConnectionOpen = () => {
    console.log('Listening for incoming messages');
  };

  // Cache for our previous values received so we can compute our average
  const prevSpeeds = [];
  const prevAccelerations = [];
  const prevRpms = [];

  iofog.wsMessageConnection(onMessageConnectionOpen, {
    onMessages: messages => {
      if (messages) {
        for (const msg of messages) {
          const input = JSON.parse(msg.contentdata.toString());

          // Produce moving averages for all the sensor values
          const result = {
            isAverage: true,
            time: json.time, // same time as
            speed: getMovingAverage(prevSpeeds, input.speed),
            acceleration: getMovingAverage(prevAccelerations, input.acceleration),
            rpm: getMovingAverage(prevRpms, input.rpm),
          };

          const output = iofog.ioMessage({
            contentdata: Buffer.from(JSON.stringify(result)).toString('base64'),
            infotype: 'application/json',
            infoformat: 'text/utf-8'
          });

          iofog.wsSendMessage(output);
        }
      }
    },
    onMessageReceipt: (messageId, timestamp) => {
      console.log('message receipt: ', { messageId, timestamp });
    },
    onError: err => console.error('Message WebSocket error: ', err)
  });
}

iofog.init('iofog', 54321, null, main);

//System.out.println( "Hello World!" );
*/
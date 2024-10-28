let writeCharacteristic; 
let currentDevice;

 document.getElementById('connectButton').addEventListener('click', async () => {
    try {
      console.log('請求藍牙設備...');
      
      // 搜索具體服務，這裡包括 Battery Service 
      const device = await navigator.bluetooth.requestDevice
      ({
        filters: [{ services: ['battery_service'] }],
        optionalServices: ['battery_service', '0000fff0-0000-1000-8000-00805f9b34fb']
      });
      
      console.log('藍牙設備已找到: ', device.name);
      currentDevice = device; // 保存當前設備


      // 連接 GATT 服務
      const server = await device.gatt.connect();
      console.log('GATT 連接已建立');

      // 連接 0XFFF0 服務
      const unknownService = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
      console.log('0xFFF0 服務已找到');

      // 獲取 Battery Service
      const batteryService = await server.getPrimaryService('battery_service');
      const batteryLevelCharacteristic = await batteryService.getCharacteristic('battery_level');
      
      // 獲取特徵值 0xFFF2
      writeCharacteristic = await unknownService.getCharacteristic('0000fff2-0000-1000-8000-00805f9b34fb');
      console.log('獲取特偵值0xFFF2');


      document.querySelectorAll('.sendButton').forEach(button => {
        button.disabled = false; // 啟用所有發送按鈕
      });
      document.getElementById('disconnectButton').disabled = false; // 啟用斷開連接按鈕


      // 讀取電池電量
      const batteryLevel = await batteryLevelCharacteristic.readValue();
      console.log('電池電量: ', batteryLevel.getUint8(0), '%');

  
    } catch (error) {
      console.log('藍牙連接失敗: ', error);
    }
  });



// 將所有發送按鈕綁定到相同的事件處理器
document.querySelectorAll('.sendButton').forEach(button => {
  button.addEventListener('click', async (event) => {
    try {
      const message = event.target.getAttribute('data-message'); // 獲取按鈕上的消息
      const encoder = new TextEncoder(); // 使用 TextEncoder
      const data = encoder.encode(message); // 將消息編碼為 UTF-8 格式


      console.log(`即將發送的數據: ${JSON.stringify(data)}`); // 打印編碼的數據

      await writeCharacteristic.writeValue(data);

      console.log(`數據已寫入特徵值 0xFFF2: ${message}`);
    } catch (error) {
      console.log('發送數據失敗: ', error);
    }
  });
});


// 斷開連接按鈕事件處理器
document.getElementById('disconnectButton').addEventListener('click', async () => {
  try {
    if (currentDevice.gatt.connected) {
      await currentDevice.gatt.disconnect();
      console.log('藍牙設備已斷開連接');


      // 禁用所有發送按鈕
      document.querySelectorAll('.sendButton').forEach(button => {
        button.disabled = true; // 禁用發送按鈕
      });



      document.getElementById('disconnectButton').disabled = true; // 禁用斷開按鈕
    }
  } catch (error) {
    console.log('斷開連接失敗: ', error);
  }
});

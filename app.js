let writeCharacteristic; 
let notifyCharacteristic; // 新增一個變量以保存通知的特徵值
let currentDevice;
const statusDisplay = document.getElementById('dataValue'); // 根據你的 HTML 元素 ID 來修改

document.getElementById('toggleDataButton').addEventListener('click', () => {
  const container = document.getElementById('dataContainer');
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
});

function saveDataToLocalStorage(data) {
  const existingData = JSON.parse(localStorage.getItem('measurementData')) || [];
  existingData.push({
    id: Date.now(), // 使用時間戳作為唯一 ID
    timestamp: new Date().toLocaleString(),
    data: data,
  });
  localStorage.setItem('measurementData', JSON.stringify(existingData));
  displaySavedData(); // 重新渲染數據
}

function handleNotification(event) {
  let value = new Uint8Array(); // 清空 value

 value = new Uint8Array(event.target.value.buffer);
  console.log(value);  // 檢查從藍牙接收到的資料

  for (let i = 0; i < value.length; i++) 
  {
    console.log(`value[${i}] = ${value[i]}`);
  }
  const dataType = value[0]; // 第一個字節是數據類型
  let message = ''; // 初始化訊息變數

  switch (dataType) {
    case 0x01: // 溫度
      const tempValue = (value[3] | (value[4] << 8)) / 10;
      const humValue = (value[1] | (value[2] << 8)) / 10;
      console.log(`溫度數據: ${tempValue.toFixed(1)}°C`);
      console.log(`濕度數據: ${humValue.toFixed(1)}%`);
      statusDisplay.textContent = `目前溫度：${tempValue.toFixed(1)}°C，濕度：${humValue.toFixed(1)}%`;

      message = `溫溼度量測結果：溫度 ${tempValue.toFixed(1)}°C，濕度 ${humValue.toFixed(1)}%`;

      break;
    case 0x02: // 血氧

    const bldValue = (value[1] | (value[2] << 8));
    const hbrValue = (value[3] | (value[4] << 8));
    console.log(`血氧數據: ${bldValue}%`);
    console.log(`心率數據: ${hbrValue} BPM`);
    statusDisplay.textContent = `目前血氧：${bldValue}% ，心率：${hbrValue} BPM`;
    message = `血氧量測結果：血氧 ${bldValue}% ，心率 ${hbrValue} BPM`;
     

      break;
    case 0x03: // 壓力
      const glvValue = value[1] | (value[2] << 8); // 合併低位和高位
      const relglv = glvValue / 10;
      console.log(`壓力數據: ${relglv} hpa`);
      statusDisplay.textContent = `目前壓力值：${relglv.toFixed(1)} hpa`; 
      message = `氣壓量測結果：壓力 ${relglv.toFixed(1)} hpa`;
     
      break;
    case 0x04: // 光照值
      const dataValue = value[1] | (value[2] << 8); // 合併低位和高位
      const lightIntensity = dataValue / 10;


      console.log(`光照數據: ${lightIntensity} lux`);
      statusDisplay.textContent = `目前光照值：${lightIntensity.toFixed(1)} lux`; 
      break;
    case 0x05:
     const buttonvalue = value[1];
     console.log(`按下緊急按鈕`);
     statusDisplay.textContent = `緊急按鈕被按下`;
     message = `緊急按鈕已觸發`;
      break;
    case 0x06: // 光照值
    const tempValue1 = (value[3] | (value[4] << 8)) / 10;
    const humValue1 = (value[1] | (value[2] << 8)) / 10;
    const glvValue1 = value[5] | (value[6] << 8); 
    const relglv1 = glvValue1 / 10;


  

    statusDisplay.textContent = `目前溫度：${tempValue1.toFixed(1)}°C，濕度：${humValue1.toFixed(1)}%，目前壓力值：${relglv1.toFixed(1)} hpa                 `;



    break;


      

    default:
      statusDisplay.textContent = '未知數據類型';
  }
  if (message) 
  {
    $.post(
      'https://script.google.com/macros/s/AKfycbw0mGZOJJKehycZV9TtSbcbjLMgA6IhowAgRYb1GQrQa_TyFkwFZomDpQbU-JnmDqVi5A/exec',
      { msg: message },
      function (response) {
        console.log('訊息已成功發送：', response);
      }
    ).fail(function (error) {
      console.error('訊息發送失敗', error);
    });
    saveDataToLocalStorage(message);
  }

}

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

      const notifyCharacteristic = await unknownService.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
      notifyCharacteristic.addEventListener('characteristicvaluechanged', handleNotification);
      await notifyCharacteristic.startNotifications(); // 開始接收通知
      console.log('已啟用通知 0xFFF1');



      // 獲取特徵值 0xFFF2
      writeCharacteristic = await unknownService.getCharacteristic('0000fff2-0000-1000-8000-00805f9b34fb');
      console.log('獲取特偵值0xFFF2');




      // 獲取 Battery Service
      const batteryService = await server.getPrimaryService('battery_service');
      const batteryLevelCharacteristic = await batteryService.getCharacteristic('battery_level');
      


      document.querySelectorAll('.sendButton').forEach(button => {
        button.disabled = false; // 啟用所有發送按鈕
      });
      document.getElementById('disconnectButton').disabled = false; // 啟用斷開連接按鈕
      showToast('藍牙連接成功！');
      statusDisplay.textContent = `請開始量測`;
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

      statusDisplay.textContent = `請連接藍芽`;
      showToast('藍牙已斷開連線');
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

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.sendButton');
  const statusDisplay = document.getElementById('dataValue');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const message = button.getAttribute('data-message');
      switch (message) {
        case '2':
          statusDisplay.textContent = '正在量測溫濕度...';
          console.log('已發送溫度量測命令');
          break;
        case '3':
          statusDisplay.textContent = '正在量測氣壓...';
          console.log('已發送氣壓量測命令');
          break;
        case '4':
          statusDisplay.textContent = '正在量測血氧與心率...';
          console.log('量測血氧與心率...');
          break;
        case '5':
          statusDisplay.textContent = '正在進行自動量測';
          console.log('進行自動量測');
          break;
        case '6':
          statusDisplay.textContent = '已關閉自動量測';
           console.log('已關閉自動量測');
          break;

        default:
          statusDisplay.textContent = '未知的操作';
          console.log('未知的命令');
      }
    });
  });
});

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    toast.remove();
  }, 3000);
}

function displaySavedData() {
  const dataHistory = JSON.parse(localStorage.getItem('measurementData')) || [];
  const historyDiv = document.getElementById('dataHistory');
  historyDiv.innerHTML = ''; // 清空原本內容

  if (dataHistory.length === 0) {
    historyDiv.innerHTML = '<p>尚未保存任何數據</p>';
  } else {
    dataHistory.forEach((entry) => {
      const entryDiv = document.createElement('div');
      entryDiv.innerHTML = `${entry.timestamp} - ${entry.data} `;
      historyDiv.appendChild(entryDiv);
    });
  }

}

// 清空所有數據
document.getElementById('clearAllButton').addEventListener('click', () => {
  if (confirm('確定要清空所有保存的數據嗎？')) {
    localStorage.removeItem('measurementData');
    displaySavedData();
  }
});

displaySavedData();




// 自動量測按鈕邏輯
document.getElementById('autoMeasureButton').addEventListener('click', () => {
  // 獲取需要禁用的按鈕
  const buttonsToDisable = document.querySelectorAll('.sendButton[data-message="2"], .sendButton[data-message="3"], .sendButton[data-message="4"]');

  // 禁用這三個按鈕
  buttonsToDisable.forEach(button => {
    button.disabled = true; // 禁用按鈕
  });

  console.log('量測溫濕度、量測氣壓、量測血氧按鈕已被鎖住');
});

// 解鎖按鈕邏輯
document.getElementById('unclock').addEventListener('click', () => {
  const buttonsToEnable = document.querySelectorAll('.sendButton[data-message="2"], .sendButton[data-message="3"], .sendButton[data-message="4"]');

  buttonsToEnable.forEach(button => {
    button.disabled = false; // 啟用按鈕
  });

  console.log('量測按鈕已解鎖');
});

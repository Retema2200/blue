let bluetoothDevice;
let bluetoothServer;
let serviceUUID = '0000FFF0-0000-1000-8000-00805F9B34FB';  // 自定義服務 UUID
let characteristicUUID = '0000FFF2-0000-1000-8000-00805F9B34FB';  // 無回應寫入特徵 UUID
let characteristic;

document.getElementById('connectButton').addEventListener('click', async () => {
    try {
        // 請求藍牙設備並連接到服務
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: [serviceUUID] }]
        });
        bluetoothServer = await bluetoothDevice.gatt.connect();
        const service = await bluetoothServer.getPrimaryService(serviceUUID);
        characteristic = await service.getCharacteristic(characteristicUUID);

        console.log('藍牙設備已連接:', bluetoothDevice.name);
        document.getElementById('buttons').style.display = 'block'; // 顯示按鈕
    } catch (error) {
        console.log('藍牙連接失敗: ', error);
    }
});

document.getElementById('button1').addEventListener('click', () => sendCommand('1'));
document.getElementById('button2').addEventListener('click', () => sendCommand('2'));
document.getElementById('button3').addEventListener('click', () => sendCommand('3'));

function sendCommand(command) {
    let encoder = new TextEncoder();
    let commandData = encoder.encode(command);
    characteristic.writeValue(commandData)
        .then(() => {
            console.log(`已發送命令: ${command}`);
        })
        .catch(error => {
            console.log('傳送失敗:', error);
        });
}

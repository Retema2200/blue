document.getElementById('connectButton').addEventListener('click', async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['battery_service'] }]
      });
      console.log('藍牙設備已找到: ', device.name);
    } catch (error) {
      console.log('藍牙連接失敗: ', error);
    }
  });
  
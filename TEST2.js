async function sendLineNotify(message) {
    const token = 'ZLnjC4GWz4L6MAcKzlB6z6JLNxkfojHjJAUksYrJhND'; // 測試用 Token
    const url = 'https://notify-api.line.me/api/notify';
  
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    });
  
    const body = new URLSearchParams({ message });
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
      });
  
      if (response.ok) {
        console.log('訊息發送成功！');
      } else {
        console.error('發送失敗：', response.status, await response.text());
      }
    } catch (error) {
      console.error('發送通知時發生錯誤：', error);
    }
  }
  
  // 測試發送通知
  document.getElementById('testNotifyButton').addEventListener('click', () => {
    sendLineNotify('從 GitHub Pages 測試通知');
  });

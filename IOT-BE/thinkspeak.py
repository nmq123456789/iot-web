import requests

CHANNEL_ID = '2270463'
API_KEY = 'J1LC0MA12IXK0ZHR'

url = f'https://api.thingspeak.com/channels/{CHANNEL_ID}/feeds.json?api_key={API_KEY}&start=2023-09-17%2000:00:00&end=2023-09-18%2000:00:00'
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    print(data)
    # Xử lý dữ liệu ở đây
else:
    print('Lỗi khi lấy dữ liệu từ Thingspeak')

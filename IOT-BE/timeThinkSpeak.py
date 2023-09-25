import requests
from datetime import datetime
import pytz

# Thay thế các giá trị này bằng thông tin cụ thể của bạn
channel_id = '2270463'
read_api_key = 'J1LC0MA12IXK0ZHR'
local_timezone = 'Asia/Ho_Chi_Minh'  # Múi giờ của Việt Nam

# URL endpoint để lấy dữ liệu cuối cùng từ ThingSpeak
url = f'https://api.thingspeak.com/channels/{channel_id}/feeds/last.json?api_key={read_api_key}'

# Gửi yêu cầu GET để lấy dữ liệu cuối cùng
response = requests.get(url)

# Kiểm tra xem yêu cầu có thành công không
if response.status_code == 200:
    data = response.json()
    created_at = data.get('created_at', None)  # Lấy trường 'created_at'
    
    if created_at:
        # Chuyển đổi thời gian từ định dạng ISO 8601 thành đối tượng thời gian
        timestamp = datetime.strptime(created_at, '%Y-%m-%dT%H:%M:%SZ')
        
        # Chuyển đổi thời gian thành múi giờ của Việt Nam
        utc_time = pytz.utc.localize(timestamp)
        local_time = utc_time.astimezone(pytz.timezone(local_timezone))
        
        print(f'Thời gian từ ThingSpeak: {local_time}')
    else:
        print('Không có thông tin thời gian từ ThingSpeak.')
else:
    print(f'Lỗi: {response.status_code} - Không thể lấy dữ liệu cuối cùng từ ThingSpeak')

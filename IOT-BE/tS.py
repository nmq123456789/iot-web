import requests

# Định danh kênh của bạn và khóa API
channel_id = '2270463'
api_key = 'J1LC0MA12IXK0ZHR'  # Đảm bảo bạn sử dụng READ API KEY

# Lấy thời gian cuối cùng ghi dữ liệu
url = f'https://api.thingspeak.com/channels/{channel_id}/feeds/last.json?api_key={api_key}'
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    thoi_gian_cuoi_cung = data['created_at']
    print("Thời gian cuối cùng ghi dữ liệu:", thoi_gian_cuoi_cung)
else:
    print("Lỗi trong quá trình gửi yêu cầu:", response.status_code)

# Sử dụng thời gian cuối cùng để lấy dữ liệu gần nhất
if thoi_gian_cuoi_cung:
    url = f'https://api.thingspeak.com/channels/{channel_id}/feeds.json?api_key={api_key}&start={thoi_gian_cuoi_cung}'
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if 'feeds' in data and len(data['feeds']) > 0:
            du_lieu_vua_gui = data['feeds'][0]
            print("Dữ liệu vừa gửi:")
            print(du_lieu_vua_gui)
        else:
            print("Không có dữ liệu mới gửi")
    else:
        print("Lỗi trong quá trình gửi yêu cầu:", response.status_code)

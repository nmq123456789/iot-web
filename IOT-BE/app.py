from flask import Flask, request,jsonify
from flask_cors import CORS
import mysql.connector
import requests
from datetime import datetime
import pytz
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Kết nối đến cơ sở dữ liệu MySQL
db_config = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "123456",
    "database": "iotweb"
}

channel_id = '2270463'
read_api_key = 'J1LC0MA12IXK0ZHR'

conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

@app.route('/add-card', methods=['POST'])
def add_card():
    # Lấy dữ liệu từ request JSON
    data = request.get_json()
    print(data)
    # Kết nối đến cơ sở dữ liệu MySQL
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # Thực hiện truy vấn INSERT để thêm một hàng mới vào bảng "cards"
    insert_query = "INSERT INTO nhanvien (idCard, hoTen, ngaySinh, timeIn, trangThai, timeOut) VALUES (%s, %s, %s, %s, %s, %s)"
    values = (data['idCard'], data['hoTen'], data['ngaySinh'], data['timeIn'], data['trangThai'], data['timeOut'])  # Thay thế bằng các giá trị thực tế

    cursor.execute(insert_query, values)
    conn.commit()
    # Đóng kết nối MySQL
    cursor.close()
    conn.close()
    return 'Card added successfully', 201

@app.route('/get-all-cards', methods=['GET'])
def get_all():
    # Kết nối đến cơ sở dữ liệu MySQL
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # Thực hiện truy vấn SELECT để lấy tất cả dữ liệu từ bảng "nhanvien"
    select_query = "SELECT * FROM nhanvien"
    cursor.execute(select_query)

    # Lấy danh sách tên cột từ truy vấn
    column_names = [column[0] for column in cursor.description]
    # Lấy tất cả các dòng dữ liệu từ kết quả truy vấn
    result = cursor.fetchall()

    # Đóng kết nối MySQL
    cursor.close()
    conn.close()

    # Chuyển kết quả thành danh sách từng bản ghi (record) và định dạng thành JSON
    records = [dict(zip(column_names, row)) for row in result]
    return jsonify(records), 200


@app.route('/attendance', methods = ['GET'])    
def attendance():
    rfid_from_thingspeak = receive_card_id()
    time_thingspaeak = get_time_from_thinkspeak()
    conn = mysql.connector.connect(**db_config)
    # Truy vấn CSDL để kiểm tra mã thẻ RFID
    cursor = conn.cursor()
    query = "SELECT * FROM nhanvien WHERE idCard = %s"
    cursor.execute(query, (rfid_from_thingspeak,))
    result = cursor.fetchone()

    # Kiểm tra kết quả và cập nhật trạng thái nếu cần
    if result:
        update_query = "UPDATE nhanvien SET trangThai = '1', timeIn = %s WHERE idCard = %s"
        cursor.execute(update_query, (time_thingspaeak,rfid_from_thingspeak))
        conn.commit()

    # Thực hiện truy vấn SELECT để lấy tất cả dữ liệu từ bảng "nhanvien"
    select_query = "SELECT * FROM nhanvien"
    cursor.execute(select_query)

    # Lấy danh sách tên cột từ truy vấn
    column_names = [column[0] for column in cursor.description]
    # Lấy tất cả các dòng dữ liệu từ kết quả truy vấn
    result = cursor.fetchall()

    # Đóng kết nối đến CSDL
    conn.close()
    records = [dict(zip(column_names, row)) for row in result]
    return jsonify(records), 200

@app.route('/receive-card', methods=['POST'])
def receive_card_id():
    card_id = request.get_json()
    print(card_id)
    socketio.emit('add-card', card_id)
    return 'Card ID received successfully', 200


def get_time_from_thinkspeak():
    # Tạo URL để truy vấn thông tin về kênh
    url = f'https://api.thingspeak.com/channels/{channel_id}/feeds/last.json?api_key={read_api_key}'

    # Gửi yêu cầu GET để lấy dữ liệu cuối cùng trên kênh
    response = requests.get(url)

    # Kiểm tra xem yêu cầu có thành công không
    # Kiểm tra xem yêu cầu có thành công không
    if response.status_code == 200:
        data = response.json()
        thoi_gian_cuoi_cung = data.get('created_at')

        # Kiểm tra xem thời gian_cuối_cung có giá trị không
        if thoi_gian_cuoi_cung:
            vietnam_timezone = pytz.timezone('Asia/Ho_Chi_Minh')
            vietnam_time = datetime.strptime(thoi_gian_cuoi_cung, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=pytz.utc).astimezone(vietnam_timezone)
            formatted_time = vietnam_time.strftime('%Y-%m-%d %H:%M:%S')
            return formatted_time
        else:
            print("Không có dữ liệu thời gian từ Thingspeak.")
    else:
        print("Lỗi trong quá trình gửi yêu cầu:", response.status_code)

if __name__ == '__main__':
    app.run(debug=True)

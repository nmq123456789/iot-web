from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import mysql.connector
import datetime

db_config = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "123456",
    "database": "iotweb"
}

conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

esp32_host = 'http://192.168.199.18'

# @app.route('/receive-new-card', methods=['POST'])
# def receive_card_id():
#     card_id = request.get_json()
#     print(card_id)
#     socketio.emit('add-card', card_id)
#     return 'Card ID received successfully', 200

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
    return 'Successfully', 200

@app.route('/get-all-cards', methods=['GET'])
def get_all_cards():
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

@app.route('/receive-card', methods = ['POST'])    
def attendance():
    current_time = datetime.datetime.now()
    idCard = request.get_json()['card_id']
    
    conn = mysql.connector.connect(**db_config)
    # Truy vấn CSDL để kiểm tra mã thẻ RFID
    cursor = conn.cursor()
    query = "SELECT * FROM nhanvien WHERE idCard = %s"
    cursor.execute(query, (idCard,))
    result = cursor.fetchone()
    # Kiểm tra kết quả và cập nhật trạng thái nếu cần
    if result:
        insert_query = "INSERT INTO diemdanh (idNhanVien, timeIn) VALUES (%s, %s)"
        values = (result[0], current_time)  # result[0] là id của nhân viên từ kết quả truy vấn nhanvien
        cursor.execute(insert_query, values)
        conn.commit()
    else:
        return "NV này không có trong danh sách công ty", 404
    
    new_record = {
        'idNhanVien': idCard,
        'timeIn': current_time.isoformat()
    }

    socketio.emit('add-record', new_record)
    socketio.emit('add-card', {'card_id' : idCard})
    return 'Them thanh cong', 200

@app.route('/get-all')  
def get_all():

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
     # Thực hiện truy vấn SELECT để lấy tất cả dữ liệu từ bảng "nhanvien"
    select_query = "SELECT * FROM diemdanh"
    cursor.execute(select_query)

    # Lấy danh sách tên cột từ truy vấn
    column_names = [column[0] for column in cursor.description]
    # Lấy tất cả các dòng dữ liệu từ kết quả truy vấn
    result = cursor.fetchall()

    # Đóng kết nối đến CSDL
    conn.close()
    records = [dict(zip(column_names, row)) for row in result]
    print(records)
    return jsonify(records), 200


@app.route('/clear-card')
def clear_card_id():
    import requests
    requests.get(esp32_host + '/clear-card')
    return 'Clear cards!', 200



if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import mysql.connector
import datetime
import os, uuid, json
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

db_config = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "123456",
    "database": "iotweb"
}

conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:123456@127.0.0.1/iotweb'
db = SQLAlchemy(app)

class NhanVien(db.Model):
    __table_args__ = {'schema': 'iotweb'} 
    __tablename__ = 'nhanvien'  

    idCard = db.Column(db.Integer, primary_key=True)
    hoTen = db.Column(db.String(255), nullable=False)
    ngaySinh = db.Column(db.String(255))
    trangThai = db.Column(db.String(255))
    img = db.Column(db.String(255))


UPLOAD_FOLDER = 'C:/Users/Minh Quang/Desktop/IOT/IOT-FE/iot_web/public/images'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
        
esp32_host = 'http://192.168.199.18'

# @app.route('/receive-new-card', methods=['POST'])
# def receive_card_id():
#     card_id = request.get_json()
#     print(card_id)
#     socketio.emit('add-card', card_id)
#     return 'Card ID received successfully', 200

@app.route('/edit/<idCard>', methods=['PUT'])
def edit_nhanvien(idCard):
    try:
        edited_nhanvien_data = json.loads(request.form['nhanVien'])

        nhanvien = NhanVien.query.filter_by(idCard=idCard).first()
        if not nhanvien:
            return jsonify({'message': 'Nhân viên không tồn tại'}), 404
        
        nhanvien.hoTen = edited_nhanvien_data.get('hoTen')
        nhanvien.ngaySinh = edited_nhanvien_data.get('ngaySinh')
        nhanvien.trangThai = edited_nhanvien_data.get('trangThai')
        nhanvien.img = edited_nhanvien_data.get('img')

        print(nhanvien.img)
        db.session.commit()
        return jsonify({'message': 'Chỉnh sửa thành công'}), 200

    except Exception as e:
        return jsonify({'message': 'Đã xảy ra lỗi', 'error': str(e)}), 500

@app.route('/delete/<idCard>', methods=['DELETE'])
def delete_nhan_vien(idCard):
    try:
        nhan_vien = NhanVien.query.filter_by(idCard=idCard).first()

        if nhan_vien:
            db.session.delete(nhan_vien)
            db.session.commit()
            return jsonify({"message": f"Xóa nhân viên có idCard {idCard} thành công"})
        else:
            return jsonify({"error": "Không tìm thấy nhân viên có idCard này"})
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/add-card', methods=['POST'])
def add_card():
    if 'file' not in request.files:
        return jsonify({'message': 'Không có tệp nào được chọn.'}), 400

    file = request.files['file']
    nhanVien_data = json.loads(request.form['nhanVien'])

    if file.filename == '':
        return jsonify({'message': 'Tên tệp không hợp lệ.'}), 400

    if file:
        filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    nhanVien = NhanVien(
        idCard=nhanVien_data['idCard'],
        hoTen=nhanVien_data['hoTen'],
        ngaySinh=nhanVien_data['ngaySinh'],
        trangThai=nhanVien_data['trangThai'],
        img=filename
    )
    try:
        db.session.add(nhanVien)
        db.session.commit()

        socketio.emit('addNhanVien', {
            'idCard': nhanVien.idCard,
            'hoTen': nhanVien.hoTen,
            'ngaySinh': nhanVien.ngaySinh,
            'trangThai': nhanVien.trangThai,
            'img': nhanVien.img
        })
        
        return jsonify({'message': 'Thêm nhân viên thành công.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.session.close()

@app.route('/get-all-cards', methods=['GET'])
def get_all_cards():
    try:
        nhanvien_records = NhanVien.query.all()
        records = []
        for nhanvien in nhanvien_records:
            record_data = {
                'idCard': nhanvien.idCard,
                'hoTen': nhanvien.hoTen,
                'ngaySinh': nhanvien.ngaySinh,
                'trangThai': nhanvien.trangThai,
                'img': nhanvien.img
            }
            records.append(record_data)
        return jsonify(records), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/receive-card', methods = ['POST'])    
def attendance():
    current_time = datetime.datetime.now()
    idCard = request.get_json()['card_id']

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    query = "SELECT * FROM nhanvien WHERE idCard = %s"
    cursor.execute(query, (idCard,))
    result = cursor.fetchone()
    if result:
        insert_query = "INSERT INTO diemdanh (idNhanVien, timeIn) VALUES (%s, %s)"
        values = (result[0], current_time)  # result[0] là id của nhân viên từ kết quả truy vấn nhanvien
        cursor.execute(insert_query, values)
        conn.commit()
    else:
        socketio.emit('add-card', {'card_id' : idCard})
        return "Thẻ mới", 200
    
    new_record = {
        'idNhanVien': idCard,
        'tenNhanVien': result[1],
        'timeIn': current_time.isoformat()
    }

    socketio.emit('add-record', new_record)
    return 'Điểm danh thành công', 200

@app.route('/get-all')  
def get_all():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    select_query = "SELECT nhanvien.*, diemdanh.* FROM nhanvien INNER JOIN diemdanh on nhanvien.idCard = diemdanh.idNhanVien"
    cursor.execute(select_query)
    column_names = [column[0] for column in cursor.description]
    result = cursor.fetchall()
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


# Kết nối đến cơ sở dữ liệu MySQL
db_config = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "123456",
    "database": "iotweb"
}

conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

@app.route('/add-card', methods=['POST'])
def add_card():
    # Lấy dữ liệu từ request JSON
    data = request.get_json()
    
    # Kết nối đến cơ sở dữ liệu MySQL
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # Thực hiện truy vấn INSERT để thêm một hàng mới vào bảng "cards"
    insert_query = "INSERT INTO nhanvien (idCard, hoTen, ngaysinh, timeIn, trangThai) VALUES (%s, %s, %s, %s, %s)"
    values = (data['bookcode'], data['title'], data['author'], data['category'], data['booked'])  # Thay thế bằng các giá trị thực tế

    cursor.execute(insert_query, values)
    conn.commit()

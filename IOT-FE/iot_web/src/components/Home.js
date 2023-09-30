import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import axios from "axios";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import "../css/Home.css";


function Home() {

    const [isEditing, setIsEditing] = useState(false);
    const [editedNhanVien, setEditedNhanVien] = useState(null);


    function handleEdit(nv) {
        setIsEditing(true);
        setEditedNhanVien(nv);
        console.log(nv)
    }

    const navigate = useNavigate();
    const [nhanVien, setNhanVien] = useState([]);

    const [data, setData] = useState({
        idCard: "",
        hoTen: "",
        ngaySinh: "",
        trangThai: "",
    });

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const handleImageUpload = (event) => {
        setSelectedFile(event.target.files[0]);

        const selectedImage = document.getElementById("selectedImage");
        const file = event.target.files[0];

        if (file) {
            const imageURL = URL.createObjectURL(file);
            selectedImage.src = imageURL;
            selectedImage.style.display = "block";
        } else {
            selectedImage.src = "";
            selectedImage.style.display = "none";
        }
    };

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('nhanVien', JSON.stringify(data));

        if (selectedFile && data['idCard'] && data['hoTen']) {
            axios.post(`http://127.0.0.1:5000/add-card`, formData)
                .then(res => {
                    console.log(res.data)
                })
                .catch(error => {
                    alert(error)
                });
        }
        else {
            alert("thêm đầy đủ các trường dữ liệu")
        }
    };

    const DeleteNhanVien = (idCard) => {
        if (window.confirm('Bạn có chắc chắn muốn xoá không?')) {
            axios.delete(`http://localhost:5000/delete/${idCard}`, {
            })
                .then(() => {
                    setNhanVien(nhanVien.filter(nhanVien => nhanVien.idCard != idCard));
                })
                .catch(error => {
                    console.log(`An error occurred while deleting book with code ${idCard}:`, error);
                });
        }
    }

    const confirmEdit = (idCard) => {
        const formData = new FormData();
        formData.append('nhanVien', JSON.stringify(editedNhanVien));

        if (window.confirm('Bạn có chắc chắn muốn chỉnh sửa không?')) {
            axios.put(`http://localhost:5000/edit/${idCard}`, formData)

                .then((res) => {
                    console.log(res);
                    window.location.reload();
                })

                .catch(error => {
                    console.log(`An error occurred while deleting book with code ${idCard}:`, error);
                });
        }
    }

    const onAttendance = () => {
        navigate(`/attendance`);
    }

    const onProfile = () => {
        navigate(`/profile`);
    }

    const huyXacNhan = () => {
        setIsConfirmed(false)
    }

    const handleScan = () => {
        setIsConfirmed(true);
        const socket = io('http://localhost:5000');

        socket.on('add-card', (card_id) => {
            setData({ ...data, idCard: card_id.card_id })
        });

        return () => {
            socket.disconnect();
        };
    };

    const handleToggleClick = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    useEffect(() => {
        axios.get('http://localhost:5000/get-all-cards')
            .then(res => {
                setNhanVien(res.data)
            })

            .catch(error => {
                console.log(error)
            })

        const socket = io('http://localhost:5000');

        socket.on('addNhanVien', (record) => {
            setNhanVien(nhanVien => [...nhanVien, record]);
            console.log(record)
        });

        return () => {
            socket.disconnect();
        };

    }, [])




    return (
        <div className="wrapper">
            {/* <!-- Sidebar --> */}
            <aside id="sidebar" className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} bg-dark`}>
                <div className="h-100">
                    <div className="sidebar-logo display-6 border-bottom mb-4">
                        <a href="#">Nhóm 13 - IOT</a>
                    </div>
                    {/* <!-- Sidebar Navigation --> */}
                    <ul className="sidebar-nav">
                        <li className="sidebar-item">
                            <a href="#" className="sidebar-link">
                                <i className="bi bi-gear-wide-connected"></i>{" "}
                                DASHBOARDS
                            </a>
                        </li>
                        <li className="sidebar-item" onClick={() => onProfile()}>
                            <a href="#" className="sidebar-link ">
                                <i className="bi bi-person-circle"></i>{" "}
                                USER PROFILE
                            </a>
                        </li>
                        <li className="sidebar-item" onClick={() => onAttendance()}>
                            <a href="#" className="sidebar-link ">
                                <i className="bi bi-alarm"></i>{" "}
                                ATTENDANCE
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>
            {/* <!-- Main Component --> */}
            <div className="main">
                <nav className="navbar px-3 py-4 border-bottom">
                    {/* <!-- Button for sidebar toggle --> */}
                    <button className="btn" type="button" data-bs-theme="dark" onClick={handleToggleClick}>
                        <span className="navbar-toggler-icon"></span>

                    </button>
                    <div className="mx-auto h1">
                        <span>Automatic attendance system</span>
                    </div>
                </nav>
                <div className="content px-3 py-2">
                    <div className="container mt-5">
                        <div className='row'>
                            {isSidebarCollapsed && (
                                <div className='col-3 border-2 p-4 shadow-lg mb-5 bg-white rounded border-dark' style={{ height: '100%' }}>
                                    <div className='d-flex justify-content-center pb-3 mb-3 border-bottom border-dark'>
                                        <span style={{ fontSize: '1.8rem' }}>Thêm NV</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-person-add" viewBox="0 0 16 16">
                                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                                            <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1h5.256Z" />
                                        </svg>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label text-start required">idCard:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={data.idCard}
                                            onChange={(e) => { setData({ ...data, idCard: e.target.value }) }}
                                            required
                                        />
                                    </div>
                                    {isConfirmed && (
                                        <div className="mb-3">
                                            <label className="text-start required" htmlFor="img">Chọn ảnh:</label>
                                            <input
                                                type="file"
                                                className="form-control mb-2"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                required
                                            />
                                            <img
                                                id="selectedImage"
                                                src=""
                                                alt="Ảnh đã chọn"
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    )}
                                    {isConfirmed && (

                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label text-start required">Tên:</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={data.hoTen}
                                                onChange={(e) => { setData({ ...data, hoTen: e.target.value }) }}
                                                required
                                            />
                                        </div>
                                    )}
                                    {isConfirmed && (
                                        <div className="mb-3">
                                            <label htmlFor="birthdate" className="form-label">Ngày sinh:</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={data.ngaySinh}
                                                onChange={(e) => { setData({ ...data, ngaySinh: e.target.value }) }}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className='d-flex justify-content-between'>
                                        {isConfirmed && (
                                            <button className="btn btn-primary" onClick={() => huyXacNhan()}>
                                                Huỷ
                                            </button>
                                        )}
                                        {isConfirmed && (
                                            <button className="btn btn-success" onClick={isConfirmed ? handleSubmit : handleScan}>
                                                Xác nhận
                                            </button>
                                        )}
                                        {!isConfirmed && (
                                            <button className="btn btn-primary" onClick={isConfirmed ? handleSubmit : handleScan}>
                                                Quét mã
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className={isSidebarCollapsed ? 'col-9' : 'row'}>
                                <div className='row'>
                                    {nhanVien.map((nv) => (
                                        <div className="col-6">
                                            <div className="card profile-header">
                                                <div className="body">
                                                    <div className="row">
                                                        <div className="col-lg-4 col-md-4 col-12">
                                                            <div className="profile-image float-md-right">
                                                                <img src={`/images/${nv.img}`}></img>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-8 col-md-8 col-12">
                                                            <h4 className="mt-1 mb-1"><strong>Họ và tên:</strong> {nv.hoTen}</h4>
                                                            <span className="job_post"><strong>Chức vụ:</strong> {nv.hoTen}</span>
                                                            <p className='mb-2'><strong>Ngày sinh:</strong> {nv.ngaySinh}</p>
                                                            <div>
                                                                <button className="btn btn-primary" onClick={() => handleEdit(nv)}>Edit <i className="bi bi-brush"></i></button>{" "}
                                                                <button className="btn btn-danger ml-1" onClick={() => DeleteNhanVien(nv.idCard)}>Delete <i className="bi bi-trash"></i></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isEditing ? (
                <div className="modal-overlay">
                    <Modal show={isEditing} onHide={() => setIsEditing(false)} size='lg'>
                        <Modal.Header className="d-flex justify-content-center">
                            <Modal.Title className="text-center">Chỉnh sửa thông tin nhân viên</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {editedNhanVien && (
                                <>
                                    <div className='row'>
                                        <div className="col-6">
                                            <div className='mb-3'>
                                                <label htmlFor="name" className="form-label text-start required">Tên:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={editedNhanVien.hoTen}
                                                    onChange={(e) => { setEditedNhanVien({ ...editedNhanVien, hoTen: e.target.value }) }}
                                                    required
                                                />
                                            </div>
                                            
                                            <div className='mb-3'>
                                                <label htmlFor="idCard" className="form-label">Chức vụ:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="idCard"
                                                    value={editedNhanVien.idCard}
                                                    onChange={(e) => setEditedNhanVien({ ...editedNhanVien, idCard: e.target.value })}
                                                />
                                            </div>

                                            <div className='mb-3'>
                                                <label htmlFor="birthdate" className="form-label">Ngày sinh:</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={editedNhanVien.ngaySinh}
                                                    onChange={(e) => { setEditedNhanVien({ ...editedNhanVien, ngaySinh: e.target.value }) }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className='col-6 mb-3'>
                                            <label className="text-start required mb-2" htmlFor="img">Chọn ảnh:</label>
                                            <input
                                                type="file"
                                                className="form-control mb-2"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                required
                                            />
                                            <img
                                                id="selectedImage"
                                                src={`/images/${editedNhanVien.img}`}
                                                alt="Ảnh đã chọn"
                                                onChange={(e) => { setEditedNhanVien({ ...editedNhanVien, img: e.target.value }) }}
                                                // style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </Modal.Body>
                        <Modal.Footer className='d-flex justify-content-between'>
                            <Button style={{ color: 'red' }} onClick={() => setIsEditing(false)}>
                                Đóng
                            </Button>
                            <Button style={{ color: 'green' }} onClick={() => confirmEdit(editedNhanVien.idCard)} >
                                Lưu thay đổi
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            ) : null}
        </div>
    )
}

export default Home;

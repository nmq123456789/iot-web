import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import axios from "axios";
import "../css/Home.css";


function Home() {
    const navigate = useNavigate();
    const [nhanVien, setNhanVien] = useState([]);
    const [formData, setFormData] = useState({
        idCard: "",
        hoTen: "",
        ngaySinh: "",
        timeIn: "",
        trangThai: "",
        timeOut: ""
    });

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isDelay, setDelay] = useState(false);

    const onAttendance = () => {
        navigate(`/attendance`);
    }

    const delayedAction = () => {
        setDelay(true);
        setIsConfirmed(false);
    };

    const handleScan = () => {
        setIsConfirmed(true);
        const socket = io('http://localhost:5000');

        socket.on('add-card', (card_id) => {
            // setListCards(prevListCards => [...prevListCards, card_id.card_id]);
            setFormData({ ...formData, idCard: card_id.card_id })
        });

        return () => {
            socket.disconnect();
        };
    };

    const handleToggleClick = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleSubmit = () => {
        console.log(formData);
        axios.post(`http://127.0.0.1:5000/add-card`, formData)
            .then(
                function () {
                    setFormData({});
                })
            // .catch(error => {
            //     alert("thẻ đã được sử dụng")
            // });
        const delayMilliseconds = 4000;
        setTimeout(delayedAction, delayMilliseconds);
    };

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/get-all-cards`, {
            // headers:{"Authorization": `Bearer ${token}`}
        })
            .then(data => {
                setNhanVien(data.data);
                // console.log(data.data)
            })
            .catch(err => console.log(err))
    }, [nhanVien])
    

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
                        <li className="sidebar-item">
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
                                <div className='col-3 border-2 p-4 shadow-lg mb-5 bg-white rounded border-dark'>
                                    <div className='d-flex justify-content-center pb-3 mb-3 border-bottom border-dark'>
                                        <span style={{ fontSize: '1.8rem' }}>Thêm NV</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-person-add" viewBox="0 0 16 16">
                                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                                            <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1h5.256Z" />
                                        </svg>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">idCard:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.idCard}
                                            onChange={(e) => { setFormData({ ...formData, idCard: e.target.value }) }}
                                            required
                                            readOnly
                                        />
                                    </div>
                                    {isConfirmed && (
                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label">Tên:</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.hoTen}
                                                onChange={(e) => { setFormData({ ...formData, hoTen: e.target.value }) }}
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
                                                value={formData.ngaySinh}
                                                onChange={(e) => { setFormData({ ...formData, ngaySinh: e.target.value }) }}
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className='d-flex justify-content-between'>
                                        {isConfirmed && (
                                            <button className="btn btn-primary">
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
                                <table className="table table-striped table-bordered mx-2 border-2 border-dark shadow-lg">
                                    <thead>
                                        <tr className='bg-success'>
                                            <th className="text-center">Id</th>
                                            <th className="text-center">Hoten</th>
                                            <th className="text-center">ngaySinh</th>
                                            <th className="text-center">timeIn</th>
                                            <th className="text-center">trangThai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nhanVien.map((nv) => (
                                            <tr key={nv.idCard}>
                                                <td>{nv.idCard}</td>
                                                <td>{nv.hoTen}</td>
                                                <td>{nv.ngaySinh}</td>
                                                <td>{nv.timeIn}</td>
                                                <td>{nv.trangThai}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;

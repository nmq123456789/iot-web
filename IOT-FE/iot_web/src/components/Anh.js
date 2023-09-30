import React, { useState } from 'react';
import axios from 'axios';

function Anh() {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            console.log(formData)

            axios.post('http://localhost:5000/upload', formData)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    return (
        <div>
            <h1>Upload Ảnh Nhân Viên</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Tải lên</button>
        </div>
    );
}

export default Anh;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './Home.css';
import { AuthContext } from './AuthContext';
import Modal from './Modal';

function Home() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [school, setSchool] = useState('');
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [imageId, setImageId] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [fullImage, setFullImage] = useState(null);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (auth) {
      // Fetch all images when component mounts
      axios.get('http://localhost:5000/images')
        .then(response => {
          setImages(response.data);
        })
        .catch(error => {
          console.error('Error fetching images:', error);
        });
    }
  }, [auth]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (image && caption && school && imageId) {
      const existingImage = images.find(img => img.imageId === imageId);

      if (existingImage) {
        setModalMessage('Image ID already exists. Please try another.');
        setShowModal(true);
        return;
      }

      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);
      formData.append('schoolName', school);
      formData.append('username', auth.username);
      formData.append('imageId', imageId);

      axios.post('http://localhost:5000/upload', formData)
        .then(response => {
          const uploadedImageUrl = `http://localhost:5000/${response.data.imagePath}`;
          setUploadedImage(uploadedImageUrl);

          axios.get('http://localhost:5000/images')
            .then(response => {
              setImages(response.data);
            })
            .catch(error => {
              console.error('Error fetching images:', error);
            });

          setModalMessage('You cannot delete the image. Please take a screenshot or remember the image ID as it will help you delete the image from our database.');
          setShowModal(true);
        })
        .catch(error => {
          if (error.response && error.response.data && !error.response.data.success) {
            setModalMessage(error.response.data.message);
            setShowModal(true);
          } else {
            console.error('Error uploading image:', error);
          }
        });

      setImage(null);
      setCaption('');
      setSchool('');
      setImageId('');
      setPreviewImage(null);
    } else {
      setModalMessage('Please fill in all fields.');
      setShowModal(true);
    }
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/delete/${id}`)
      .then(response => {
        axios.get('http://localhost:5000/images')
          .then(response => {
            setImages(response.data);
          })
          .catch(error => {
            console.error('Error fetching images:', error);
          });
      })
      .catch(error => {
        console.error('Error deleting image:', error);
      });
  };

  const handleImageClick = (img) => {
    setFullImage(img.imagePath);
  };

  const filteredImages = images
    .filter((img) =>
      img.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      }
      return new Date(b.time) - new Date(a.time);
    });

  if (!auth) {
    return <div>Please log in to view the home page.</div>;
  }

  return (
    <div className="home-container">
      <div className="sidebar">
        <div className="search-bar">
          <input
            type="text"
            id="search-input"
            placeholder="Search by University"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button id="search-button">Search</button>
        </div>
        <div className="filters">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="time">Time</option>
          </select>
        </div>
        <form className="upload-box" onSubmit={handleSubmit}>
          <h2>Upload Image</h2>
          <div className="upload-input">
            <label htmlFor="file-upload">Choose Image:</label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
            />
            {previewImage && (
              <img src={previewImage} alt="Image preview" className="image-preview" />
            )}
          </div>
          <div className="upload-input">
            <label htmlFor="caption">Caption/Problem:</label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className="upload-input">
            <label htmlFor="school">University/School Name:</label>
            <input
              type="text"
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>
          <div className="upload-input">
            <label htmlFor="imageId">Image ID:</label>
            <input
              type="text"
              id="imageId"
              value={imageId}
              onChange={(e) => setImageId(e.target.value)}
            />
          </div>
          <button type="submit" className="upload-button">Upload</button>
        </form>
        <div className="note-box">
          <span className="highlight">Note</span>
          <p>Image ID and date are very important to delete the image from our database, so please remember or save it for future reference. If you need to delete the image, contact us.</p>
        </div>
      </div>
      <div className="image-gallery">
        {filteredImages.map((img) => (
          <div key={img.id} className="image-frame" onClick={() => handleImageClick(img)}>
            <div className="image-info">
              <div className="image-caption">Problem: {img.caption}</div>
              <div className="image-school">University name: {img.schoolName}</div>
            </div>
            <img src={`http://localhost:5000/${img.imagePath}`} alt={`Uploaded ${img.id}`} className="image-content" />
          </div>
        ))}
      </div>
      {showModal && (
        <Modal
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
      {fullImage && (
        <div className="full-image-modal" onClick={() => setFullImage(null)}>
          <div className="full-image-content">
            <img src={`http://localhost:5000/${fullImage}`} alt="Full view" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

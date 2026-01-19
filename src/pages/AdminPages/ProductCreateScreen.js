import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import API from '../../api';
import { toast } from 'react-toastify';

const ProductCreateScreen = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [sizes, setSizes] = useState([]);
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

 const uploadFileHandler = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('image', file);
  setUploading(true);

  try {
    // 1. Get user info (and the token) from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        // 2. ADD THIS LINE:
        Authorization: `Bearer ${userInfo.token}`, 
      },
    };

    // 3. Make sure this points to port 5000 (or uses your proxy)
    const { data } = await API.post('/api/upload', formData, config);
    
    // Handle both string and object responses from backend
    let imagePath = data;
    if (typeof data === 'object' && data.url) {
      imagePath = data.url;
    }
    if (typeof imagePath === 'string') {
      const imageUrl = imagePath.startsWith('http') ? imagePath : `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
      setImage(imageUrl);
    } else {
      setImage('');
    }
    setUploading(false);
    toast.success('Image uploaded successfully');
  } catch (error) {
    console.error(error);
    setUploading(false);
    toast.error('Upload failed: Ensure you are logged in as admin');
  }
};

// const uploadFileHandler = async (e) => {
//   const file = e.target.files[0]; // Gets the file from your computer
//   const formData = new FormData();
//   formData.append('image', file);
//   setUploading(true);

//   try {
//     const userInfo = JSON.parse(localStorage.getItem('userInfo'));
//     const config = {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         Authorization: `Bearer ${userInfo.token}`, // Your server requires this!
//       },
//     };

//     // This sends the local file to your Node server, 
//     // which then sends it to Cloudinary
//     const { data } = await axios.post('/api/upload', formData, config);
    
//     setImage(data); // This should be the Cloudinary URL returned by the server
//     setUploading(false);
//   } catch (error) {
//     console.error(error);
//     setUploading(false);
//   }
// };


  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await API.post('/api/products', {
        name, price, image, brand, category, countInStock, description, sizes
      }, config);

      toast.success('Product Created Successfully');
      setTimeout(() => {
        navigate('/admin/productlist');
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data.message || err.error);
    }
  };

  return (
    <Container>
      <Link to='/admin/productlist' className='btn btn-light my-3'>Go Back</Link>
      <Row className='justify-content-md-center'>
        <Col xs={12} md={6}>
          <h1>Create Product</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name' className='mb-3'>
              <Form.Label>Name</Form.Label>
              <Form.Control type='text' placeholder='Enter name' value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>

            <Form.Group controlId='price' className='mb-3'>
              <Form.Label>Price</Form.Label>
              <Form.Control type='number' placeholder='Enter price' value={price} onChange={(e) => setPrice(e.target.value)} required />
            </Form.Group>

            <Form.Group controlId='sizes' className='mb-3'>
              <Form.Label>Sizes</Form.Label>
              <Form.Select multiple value={sizes} onChange={e => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setSizes(selected);
              }}>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
                <option value="One Size">One Size</option>
              </Form.Select>
              <div className="form-text">Hold Ctrl (Windows) or Cmd (Mac) to select multiple sizes.</div>
            </Form.Group>

            <Form.Group controlId='image' className='mb-3'>
              <Form.Label>Image URL or Upload</Form.Label>
              <Form.Control type='text' placeholder='Enter image url' value={image} onChange={(e) => setImage(e.target.value)} />
              <Form.Control type='file' label='Choose File' onChange={uploadFileHandler} className='mt-2' />
              {uploading && <p>Uploading...</p>}
            </Form.Group>

            <Form.Group controlId='brand' className='mb-3'>
              <Form.Label>Brand</Form.Label>
              <Form.Control type='text' placeholder='Enter brand' value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </Form.Group>

            <Form.Group controlId='countInStock' className='mb-3'>
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control type='number' placeholder='Enter stock' value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
            </Form.Group>

            <Form.Group controlId='category' className='mb-3'>
              <Form.Label>Category</Form.Label>
              <Form.Control type='text' placeholder='Enter category' value={category} onChange={(e) => setCategory(e.target.value)} required />
            </Form.Group>

            <Form.Group controlId='description' className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' rows={3} placeholder='Enter description' value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>

            <Button type='submit' variant='primary'>Create Product</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductCreateScreen;
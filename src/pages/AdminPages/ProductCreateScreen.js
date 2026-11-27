import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import API, { getImageUrl } from '../../api';
import { toast } from 'react-toastify';

const ProductCreateScreen = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const uploadFileHandler = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      if (!userInfo?.token) throw new Error('Sign in as an admin before uploading.');

      const { data } = await API.post('/api/upload', formData, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const imagePath = typeof data === 'string' ? data : data?.image || data?.url || data?.path;
      if (!imagePath) throw new Error('The image service returned no image URL.');
      setImage(getImageUrl(imagePath));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Image upload failed.');
    } finally {
      setUploading(false);
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
        name, price, image, brand, category, countInStock, description, sizes, colors
      }, config);

      toast.success('Product Created Successfully');
      setTimeout(() => {
        navigate('/admin/productlist');
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Product creation failed.');
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

            <Form.Group controlId='colors' className='mb-3'>
              <Form.Label>Colors</Form.Label>
              <Form.Select multiple value={colors} onChange={(e) => {
                setColors(Array.from(e.target.selectedOptions, (option) => option.value));
              }}>
                {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Other'].map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </Form.Select>
              <div className="form-text">Hold Ctrl (Windows) or Cmd (Mac) to select multiple colors.</div>
            </Form.Group>

            <Form.Group controlId='image' className='mb-3'>
              <Form.Label>Image URL or Upload</Form.Label>
              <Form.Control type='text' placeholder='Enter image url' value={image} onChange={(e) => setImage(e.target.value)} />
              <Form.Control type='file' accept="image/jpeg,image/png,image/webp" onChange={uploadFileHandler} className='mt-2' />
              {image && <img className="admin-image-preview" src={getImageUrl(image)} alt="Product preview" />}
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

            <Button type='submit' variant='primary' disabled={uploading}>Create Product</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductCreateScreen;
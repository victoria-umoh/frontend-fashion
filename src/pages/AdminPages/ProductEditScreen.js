import API from '../../api';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Card } from 'react-bootstrap';
import swal from 'sweetalert';

const ProductEditScreen = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [sizes, setSizes] = useState([]);
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [onSale, setOnSale] = useState(false);
    const [promoPrice, setPromoPrice] = useState(0);
    const [colors, setColors] = useState([]);


    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await API.get(`/api/products/${productId}`);
            setName(data.name);
            setPrice(data.price);
            setImage(data.image);
            setBrand(data.brand);
            setSizes(Array.isArray(data.sizes) ? data.sizes : (data.sizes ? [data.sizes] : []));
            setCategory(data.category);
            setCountInStock(data.countInStock);
            setDescription(data.description);

            setColors(Array.isArray(data.colors) ? data.colors : (data.colors ? [data.colors] : []));
        };
        fetchProduct();
    }, [productId]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await API.post('/api/upload', formData, config);
            setImage(data); // Set the image path returned from server
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await API.put(`/api/products/${productId}`, {
                name, price, image, brand, category, countInStock, description, sizes, colors, onSale, promoPrice
            }, config);
            swal("Success", "Product updated", "success");
            navigate('/admin/productlist');
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Update failed";
            swal("Error", message, "error");
        }
    };
    return (
        <Container className="py-5">
            <Link to='/admin/productlist' className='btn btn-light mb-3'>Go Back</Link>
            <Card className="p-4 shadow-sm border-0 rounded-4">
                <h2 className="fw-bold mb-4">Edit Product</h2>
                <Form onSubmit={submitHandler}>
                    <Form.Group controlId='name' className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId='image' className="mb-3">
                        <Form.Label>Image URL or Upload File</Form.Label>
                        <Form.Control type='text' value={image} onChange={(e) => setImage(e.target.value)} className="mb-2" />
                        <Form.Control type="file" label='Choose File' onChange={uploadFileHandler} />
                        {uploading && <p>Uploading...</p>}
                    </Form.Group>

                    <Form.Group controlId='price' className="mb-3">
                        <Form.Label>Price</Form.Label>
                        <Form.Control type='number' value={price} onChange={(e) => setPrice(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId='sizes' className="mb-3">
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
                <           option value="One Size">One Size</option>
                        </Form.Select>
                        <div className="form-text">Hold Ctrl (Windows) or Cmd (Mac) to select multiple sizes.</div>
                    </Form.Group>

                    <Form.Group controlId='countInStock' className="mb-3">
                        <Form.Label>Count In Stock</Form.Label>
                        <Form.Control type='number' value={countInStock} onChange={(e) => setCountInStock(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId='description' className="mb-4">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as='textarea' rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Form.Group>



                    <Form.Group controlId='onSale' className='my-2'>
                        <Form.Label className='me-3'>On Sale?</Form.Label>
                        <Form.Check
                            type='switch'
                            id='onSale-switch'
                            label={<span style={{ color: onSale ? '#198754' : '#dc3545', fontWeight: 600 }}>{onSale ? 'Yes (Promo Active)' : 'No (Regular Price)'}</span>}
                            checked={onSale}
                            onChange={(e) => setOnSale(e.target.checked)}
                        />
                    </Form.Group>
                    <Form.Group controlId='colors' className='mb-3'>
                        <Form.Label>Colors</Form.Label>
                        <Form.Select multiple value={colors} onChange={e => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setColors(selected);
                        }}>
                            <option value="Black">Black</option>
                            <option value="White">White</option>
                            <option value="Red">Red</option>
                            <option value="Blue">Blue</option>
                            <option value="Green">Green</option>
                            <option value="Yellow">Yellow</option>
                            <option value="Pink">Pink</option>
                            <option value="Purple">Purple</option>
                            <option value="Orange">Orange</option>
                            <option value="Brown">Brown</option>
                            <option value="Gray">Gray</option>
                            <option value="Other">Other</option>
                        </Form.Select>
                        <div className="form-text">Hold Ctrl (Windows) or Cmd (Mac) to select multiple colors.</div>
                    </Form.Group>

                    <Form.Group controlId='promoPrice' className='my-2'>
                        <Form.Label>Promo Price</Form.Label>
                        <Form.Control
                            type='number'
                            placeholder='Enter promo price'
                            value={promoPrice}
                            onChange={(e) => setPromoPrice(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Button type='submit' variant='dark' className="rounded-pill px-5">Update Product</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default ProductEditScreen;
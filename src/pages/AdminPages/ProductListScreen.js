import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Container, Modal } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { PencilSquare, Trash, Plus } from 'react-bootstrap-icons';
import API from '../../api';
import swal from 'sweetalert';
import Swal from 'sweetalert2';


const ProductListScreen = () => {
    const [products, setProducts] = useState([]);
    const [showReviews, setShowReviews] = useState(false);
    const [reviews, setReviews] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchProducts = async () => {
        const { data } = await API.get('/api/products');
        setProducts(data);
    };

    useEffect(() => { fetchProducts(); }, []);

    const deleteHandler = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure you want to delete this product?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });
        if (result.isConfirmed) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await API.delete(`/api/products/${id}`, config);
                swal("Deleted!", "Product has been removed.", "success");
                fetchProducts();
            } catch (err) {
                swal("Error", "Failed to delete product", "error");
            }
        }
    };

    const fetchReviews = async (productId) => {
      try {
        const { data } = await API.get(`/api/products/${productId}/reviews`);
        setReviews(data);
        setShowReviews(true);
      } catch (err) {
        swal('Error', 'Failed to fetch reviews', 'error');
      }
    };

    return (
        <Container className="py-5">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2 className="fw-bold">Products</h2>
                </Col>
                <Col className="text-end">
                    <LinkContainer to="/admin/addproducts">
                        <Button variant="dark" className="rounded-pill px-4">
                            <Plus size={25} /> Create Product
                        </Button>
                    </LinkContainer>
                </Col>
            </Row>

            <Table hover responsive className="shadow-sm border rounded-3 align-middle">
                <thead className="bg-light">
                    <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>PRICE</th>
                        <th>CATEGORY</th>
                        <th>BRAND</th>
                        <th>SIZE</th>
                        <th>IMAGE</th>
                        <th className="text-center">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product._id}>
                            <td className="text-muted small">{product._id.substring(0, 10)}...</td>
                            <td className="fw-bold">{product.name}</td>
                            <td>
                              {product.onSale ? (
                                <>
                                  <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                    ₦{Number(product.price).toFixed(2)}
                                  </span>
                                  <span style={{ color: 'red', marginLeft: '10px' }}>
                                    ₦{Number(product.promoPrice).toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span>₦{Number(product.price).toFixed(2)}</span>
                              )}
                            </td>
                            <td>{product.category}</td>
                            <td>{product.brand}</td>
                            <td>{product.sizes.join(', ')}</td>
                            <td><img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} /></td>
                            <td className="text-center">
                                <LinkContainer to={`/admin/product/${product._id}/edit`}>
                                    <Button variant="light" size="sm" className="me-2 rounded-circle">
                                        <PencilSquare className="text-primary" />
                                    </Button>
                                </LinkContainer>
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    className="me-2 rounded-circle"
                                    onClick={() => deleteHandler(product._id)}
                                >
                                    <Trash className="text-danger" />
                                </Button>
                                <Button 
                                    variant="info" 
                                    size="sm" 
                                    className="rounded-circle"
                                    onClick={() => fetchReviews(product._id)}
                                >
                                    Reviews
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showReviews} onHide={() => setShowReviews(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Product Reviews</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {reviews.length === 0 ? (
                  <p>No reviews for this product.</p>
                ) : (
                  <ul className="list-unstyled">
                    {reviews.map((review) => (
                      <li key={review._id} className="mb-3">
                        <strong>{review.name}</strong> <span className="text-warning">{'★'.repeat(review.rating)}</span>
                        <br />
                        <span className="text-muted small">{new Date(review.createdAt).toLocaleDateString()}</span>
                        <p className="mt-2">{review.comment}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ProductListScreen;
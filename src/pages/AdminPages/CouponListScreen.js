import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Table, Button, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaTicketAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../api';
import Swal from 'sweetalert2';

function CouponListScreen() {
  const [coupons, setCoupons] = useState([]);
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [expiry, setExpiry] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Stable Config Hook
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));


  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${userInfo?.token}` },
  }), [userInfo?.token]);

  // 2. Fetch Coupons
  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await API.get('/api/admin/coupons', config);
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  }, [config]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // 3. Status Logic
  const getStatus = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(expiryDate) < today 
      ? { label: 'Expired', color: 'danger' } 
      : { label: 'Active', color: 'success' };
  };

  // 4. Form Handlers
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDiscount(0);
    setExpiry('');
  };

  const editHandler = (coupon) => {
    setEditingId(coupon._id);
    setName(coupon.name);
    setDiscount(coupon.discount);
    setExpiry(new Date(coupon.expiry).toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/api/admin/coupons/${editingId}`, { name, discount, expiry }, config);
        toast.success('Coupon updated successfully!');
      } else {
        await API.post('/api/admin/coupons', { name, discount, expiry }, config);
        toast.success('Coupon created successfully!');
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const deleteHandler = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Coupon?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/api/admin/coupons/${id}`, config);
        Swal.fire('Deleted!', 'Coupon has been removed.', 'success');
        fetchCoupons();
      } catch (err) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  // This logic filters the coupons list every time searchTerm or coupons change
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) =>
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, coupons]);

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col md={6}>
          <h5 className="fw-bold mb-0">Active Coupons ({filteredCoupons.length})</h5>
        </Col>
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="🔍 Search by code (e.g. SUMMER)..."
            className="rounded-pill border-0 shadow-sm px-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>
      <div className="d-flex align-items-center mb-4">
        <FaTicketAlt className="me-2 text-primary" size={30} />
        <h2 className="fw-bold mb-0">Coupon Management</h2>
      </div>

      {/* CREATE / EDIT FORM */}
      <Card className={`border-0 shadow-sm rounded-4 mb-4 ${editingId ? 'border-start border-primary border-4' : ''}`}>
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-4">
            {editingId ? 'Update Coupon' : 'Create New Coupon'}
          </h5>
          <Form onSubmit={submitHandler}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label className="small fw-bold">Code</Form.Label>
                <Form.Control 
                  placeholder="e.g. SAVE50" 
                  value={name} 
                  onChange={(e) => setName(e.target.value.toUpperCase())} 
                  required 
                />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold">Discount (%)</Form.Label>
                <Form.Control 
                  type="number" 
                  value={discount} 
                  onChange={(e) => setDiscount(e.target.value)} 
                  required 
                />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold">Expiry Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={expiry} 
                  onChange={(e) => setExpiry(e.target.value)} 
                  required 
                />
              </Col>
              <Col md={2} className="d-flex align-items-end gap-2">
                <Button type="submit" variant={editingId ? "primary" : "dark"} className="w-100 py-2">
                  {editingId ? <FaEdit /> : <FaPlus />} {editingId ? 'Update' : 'Save'}
                </Button>
                {editingId && (
                  <Button variant="outline-secondary" onClick={resetForm}>
                    <FaTimes />
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* COUPONS TABLE */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="ps-4">CODE</th>
              <th>DISCOUNT</th>
              <th>EXPIRES</th>
              <th>STATUS</th>
              <th className="pe-4 text-end">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.length > 0 ? (
              filteredCoupons.map((c) => {
                const status = getStatus(c.expiry);
                return (
                  <tr key={c._id}>
                    <td className="ps-4 fw-bold">{c.name}</td>
                    <td>
                      <Badge bg="info-soft" className="text-info rounded-pill px-3">
                        {c.discount}% OFF
                      </Badge>
                    </td>
                    <td>{new Date(c.expiry).toLocaleDateString()}</td>
                    <td>
                      <Badge bg={status.color} className="rounded-pill px-3">
                        {status.label}
                      </Badge>
                    </td>
                    <td className="pe-4 text-end">
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="me-2 rounded-circle border shadow-sm"
                        onClick={() => editHandler(c)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="text-danger rounded-circle border shadow-sm"
                        onClick={() => deleteHandler(c._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No coupons found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      <style>{`
        .bg-info-soft { background-color: rgba(13, 202, 240, 0.1); }
        .rounded-4 { border-radius: 1rem !important; }
      `}</style>
    </Container>
  );
}

export default CouponListScreen;
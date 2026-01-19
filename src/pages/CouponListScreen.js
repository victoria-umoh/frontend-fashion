import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const CouponListScreen = () => {
  const [coupons, setCoupons] = useState([]);
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [expiry, setExpiry] = useState('');


  // Get userInfo and config for admin requests
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = useMemo(() => ({
    headers: {
      'Content-Type': 'application/json',
      Authorization: userInfo?.token ? `Bearer ${userInfo.token}` : '',
    },
  }), [userInfo?.token]);

  const fetchCoupons = useCallback(async () => {
    const { data } = await axios.get('/api/coupons', config);
    setCoupons(data);
  }, [config]);

  const submitHandler = async (e) => {
    e.preventDefault();
    await axios.post('/api/coupons', { name, discount, expiry }, config);
    fetchCoupons(); // Refresh list
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure?')) {
      await axios.delete(`/api/coupons/${id}`, config);
      fetchCoupons();
    }
  };

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  return (
    <div>
      <h1>Manage Coupons</h1>
      <Form onSubmit={submitHandler} className="mb-4">
        <Row>
          <Col><Form.Control placeholder="Code (e.g. SAVE20)" onChange={(e) => setName(e.target.value)} /></Col>
          <Col><Form.Control type="number" placeholder="Discount %" onChange={(e) => setDiscount(e.target.value)} /></Col>
          <Col><Form.Control type="date" onChange={(e) => setExpiry(e.target.value)} /></Col>
          <Col><Button type="submit">Create</Button></Col>
        </Row>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>CODE</th>
            <th>DISCOUNT</th>
            <th>EXPIRES</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.discount}%</td>
              <td>{c.expiry.substring(0, 10)}</td>
              <td>
                <Button variant='danger' onClick={() => deleteHandler(c._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CouponListScreen;
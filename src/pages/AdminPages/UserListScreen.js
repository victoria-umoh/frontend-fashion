import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Spinner, Container } from 'react-bootstrap';
import Swal from 'sweetalert2';
import API from '../../api';
import { toast } from 'react-toastify';

function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const userInfo = useMemo(() => JSON.parse(localStorage.getItem('userInfo')), []);
  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${userInfo?.token}`,
    },
  }), [userInfo?.token]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await API.get('/api/admin/users', config);
        setUsers(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [config]);

  // Delete user handler
  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        await API.delete(`/api/admin/users/${id}`, config);
        toast.success('User deleted');
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  // Edit user handler (placeholder)
  const editUser = (user) => {
    toast.info('Edit user feature coming soon!');
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">User List</h2>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => editUser(user)}>
                    Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => deleteUser(user._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default UserListScreen;
